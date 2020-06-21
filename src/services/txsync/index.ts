import { Service, Inject } from 'typedi';
import InvalidParamError from '../error/InvalidParamError';
import { sync_state } from '../../core/txsync';
import ResourceNotFoundError from '../../services/error/ResourceNotFoundError';

@Service('txsyncService')
export default class TxsyncService {
  constructor(@Inject('txsyncModel') private txsyncModel, @Inject('txModel') private txModel, @Inject('logger') private logger) {}

  public async getTxsync(txid: string) {
    let entity = await this.txsyncModel.getTxsync(txid);

    if (!entity) {
      throw new ResourceNotFoundError();
    }
    return entity;
  }

  public async insertTxsync(txid: string) {
    await this.txsyncModel.insertTxsync(txid);
  }

  public async getTxsForSync() {
    return await this.txsyncModel.getTxsForSync();
  }

  public async getTxsDlq(dlq?: string) {
    return await this.txsyncModel.getTxsDlq(dlq);
  }

  public async incrementRetries(txid: string) {
    if (!txid) {
      throw new InvalidParamError();
    }

    await this.txsyncModel.incrementRetries(
      txid
    );
  }

  public async updateDlq(txid: string, dlq: string) {
    if (!txid) {
      throw new InvalidParamError();
    }

    await this.txsyncModel.updateDlq(
      txid,
      dlq
    );
  }

  public async setResync(txid: string) {

    console.log('heree 0--- 1');
    await this.txModel.updateCompleted(
      txid,
      false
    );
    console.log('heree 0--- 133');
    await this.txsyncModel.setResync(
      txid
    );
    console.log('heree 0--- 14444');
  }

  public async updateTxsync(txid: string, sync: sync_state) {
    await this.txsyncModel.updateTxsync(
      txid,
      sync
    );
  }
}
