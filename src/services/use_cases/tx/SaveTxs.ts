import { Service, Inject } from 'typedi';
import * as bsv from 'bsv';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import InvalidParamError from '../../error/InvalidParamError';
import TxhashMismatchError from '../../error/TxhashMismatchError';
import { BitcoinRegex } from '../../helpers/BitcoinRegex';
import { ITransactionData } from '../../../interfaces/ITransactionData';
import { txDataExtractor } from '../../../util/txdataextractor';
import Config from './../../../cfg';

@Service('saveTxs')
export default class SaveTxs extends UseCase {
  constructor(
    @Inject('eventService') private eventService,
    @Inject('updatelogService') private updatelogService,
    @Inject('queueService') private queueService,
    @Inject('txsyncService') private txsyncService,
    @Inject('txService') private txService,
    @Inject('getTx') private getTx,
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
    try {
      let cleanedChannel = params.channel ? params.channel : '';
      const savedTxs = [];
      for (const txid in params.set) {
        if (!params.set.hasOwnProperty(txid)) {
          continue;
        }
        this.logger.info('SaveTxs', {
          txid: txid
        });
        let expectedTxid = txid;
        let didExistBefore = await this.txmetaService.isTxMetaExist(txid, cleanedChannel);
        // Do not sync if set globally
        const nosync = Config.queue.nosync ? Config.queue.nosync : !!params.set[txid].nosync;
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
          cleanedChannel,
          metadata,
          tags,
          parsedTx ? txDataExtractor(parsedTx) : {}
        );

        if (parsedTx) {
          let i = 0;
          for (const input of parsedTx.inputs) {
            if (input.isNull()) {
              //Skip coinbase
              continue;
            }
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
              address = bsv.Address.fromScript(parsedTx.outputs[i].script, Config.network).toString();
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

            const wrappedEntity = { entity: {
              txid: expectedTxid,
              index: i,
              address,
              scripthash,
              script: parsedTx.outputs[i].script.toHex(),
              satoshis: parsedTx.outputs[i].satoshis
            }, eventType: 'txout'};

            this.eventService.pushChannelEvent('address-' + address, wrappedEntity, -1);
            this.eventService.pushChannelEvent('scripthash-' + scripthash, wrappedEntity, -1);

            await this.spendService.backfillSpendIndexIfNeeded(
              parsedTx.hash, i
            );
          }
        }

        await this.txsyncService.insertTxsync(
          expectedTxid,
          nosync
        );

        if (!nosync) {
          this.queueService.enqTxStatus(txid);
        }

        savedTxs.push(expectedTxid);

        let useCaseOutcome = await this.getTx.run({ txid: expectedTxid, channel: cleanedChannel, rawtx: true});
        // Save to updatelogging if enabled

        if (!didExistBefore) {

          const wrappedEntity = { entity: useCaseOutcome.result, eventType: 'newtx'};
          this.eventService.pushChannelEvent(cleanedChannel, wrappedEntity, useCaseOutcome.result.id);

          if (Config.enableUpdateLogging) {
            await this.updatelogService.save('newtx', cleanedChannel, useCaseOutcome.result, expectedTxid);
          }
        } else {
          if (Config.enableUpdateLogging) {
            await this.updatelogService.save('updatetx', cleanedChannel, useCaseOutcome.result, expectedTxid);
          }
        }

        this.logger.info('SaveTxs', {
          txid: txid,
          status: 'Complete',
          didExistBefore: didExistBefore
        });
      }
      return {
        success: true,
        result: savedTxs
      };
    } catch (exception) {
      this.logger.info('SaveTxs', {
        exception: exception,
        stack: exception.stack,
        channel: params.channel
      });
      throw exception;
    }
  }
}
