import { Service, Inject } from 'typedi';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import * as bsv from 'bsv';
import InvalidParamError from '../error/InvalidParamError';
import { ITransactionStatus } from '../../interfaces/ITransactionData';
import { sync_state } from '../../core/txsync';

@Service('txService')
export default class TxService {
  constructor(@Inject('txModel') private txModel, @Inject('txsyncModel') private txsyncModel, @Inject('logger') private logger) {}

  public async isTxExist(txid: string): Promise<boolean> {
    return this.txModel.isTxExist(txid);
  }

  public async getTx(txid: string, rawtx?: boolean) {
    let tx = await this.txModel.getTx(txid, rawtx);

    if (!tx) {
      throw new ResourceNotFoundError();
    }
    return tx;
  }

  public async saveTxid(txid: string) {
    if (!txid) {
      throw new InvalidParamError();
    }
    return await this.txModel.saveTxid(
      txid
    );
  }

  public async saveTx(rawtx: string) {
    if (!rawtx) {
      throw new InvalidParamError();
    }
    const parsedTx = new bsv.Transaction(rawtx)
    return await this.txModel.saveTx(
      parsedTx.hash,
      rawtx
    );
  }

  public async saveTxStatus(txid: string, txStatus: ITransactionStatus, blockhash?: string, blockheight?: number) {
    await this.txModel.saveTxStatus(
      txid,
      txStatus,
      blockhash,
      blockheight
    );
  }

  public async saveTxSend(txid: string, send: any) {
    await this.txModel.saveTxSend(
      txid,
      send
    );
  }

  public async setTxCompleted(txid: string) {
    this.logger.info('setTxCompleted', {
      txid: txid
    });

    await this.txModel.updateCompleted(
      txid,
      true
    );
    await this.txsyncModel.updateTxsyncAndClearDlq(
      txid,
      sync_state.sync_success
    );
  }
}
