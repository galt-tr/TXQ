import { Service, Inject } from 'typedi';
import * as bsv from 'bsv';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import InvalidParamError from '../../error/InvalidParamError';
import TxhashMismatchError from '../../error/TxhashMismatchError';
import { BitcoinRegex } from '../../helpers/BitcoinRegex';
import { ITransactionData } from '../../../interfaces/ITransactionData';
import { txDataExtractor } from '../../../util/txdataextractor';

@Service('saveTxs')
export default class SaveTxs extends UseCase {
  constructor(
    @Inject('queueService') private queueService,
    @Inject('txsyncService') private txsyncService,
    @Inject('txService') private txService,
    @Inject('txinService') private txinService,
    @Inject('txmetaService') private txmetaService,
    @Inject('txoutService') private txoutService,
    @Inject('spendService') private spendService,
    @Inject('logger') private logger
  ) {
    super();
  }

  public async run(params: {
    channel?: string,
    set: {
      [key: string]: ITransactionData
    }
  }): Promise<UseCaseOutcome> {
    const savedTxs = [];
    for (const txid in params.set) {
      if (!params.set.hasOwnProperty(txid)) {
        continue;
      }
      let expectedTxid = txid;
      const rawtx = params.set[txid].rawtx;
      const metadata = params.set[txid].metadata;
      const tags = params.set[txid].tags;

      if (!txid && !rawtx) {
        throw new InvalidParamError();
      }
      let parsedTx;
      if (rawtx) {
        parsedTx = new bsv.Transaction(rawtx)
        if (expectedTxid) {
          if (parsedTx.hash != expectedTxid) {
            throw new TxhashMismatchError();
          }
        } else {
          expectedTxid = parsedTx.txhash
        }
      }

      if (!BitcoinRegex.TXID_REGEX.test(expectedTxid)) {
        throw new InvalidParamError();
      }

      if (rawtx) {
        await this.txService.saveTx(
          rawtx
        );
      } else {
        await this.txService.saveTxid(
          expectedTxid
        );
      }

      if (parsedTx) {
        await this.txinService.saveTxins(
          parsedTx
        );
      }
      await this.txmetaService.saveTxmeta(
        expectedTxid,
        params.channel,
        metadata,
        tags,
        parsedTx ? txDataExtractor(parsedTx) : {}
      );

      if (parsedTx) {
        let i = 0;
        for (const input of parsedTx.inputs) {
          const prevTxId = input.prevTxId.toString('hex');
          const outputIndex = input.outputIndex;
          await this.spendService.updateSpendIndex(
            prevTxId, outputIndex, parsedTx.hash, i
          );
          i++;
        }

        for (let i = 0; i < parsedTx.outputs.length; i++) {
          const buffer = Buffer.from(parsedTx.outputs[i].script.toHex(), 'hex');
          const scripthash = bsv.crypto.Hash.sha256(buffer).reverse().toString('hex');
          let address = '';
          try {
            address = bsv.Address.fromScript(parsedTx.outputs[i].script).toString();
          } catch (err) {
            // Do nothing
          }
          await this.txoutService.saveTxout(
            expectedTxid,
            i,
            address,
            scripthash,
            parsedTx.outputs[i].script.toHex(),
            parsedTx.outputs[i].satoshis,
          );

          await this.spendService.backfillSpendIndexIfNeeded(
            parsedTx.hash, i
          );
        }
      }

      await this.txsyncService.insertTxsync(
        parsedTx.hash
      );

      this.queueService.enqTxStatus(txid);
      savedTxs.push(expectedTxid);
    }
    return {
      success: true,
      result: savedTxs
    };
  }
}
