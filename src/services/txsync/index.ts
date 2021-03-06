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

  public async insertTxsync(txid: string, nosync?: boolean) {
    await this.txsyncModel.insertTxsync(txid, nosync);
  }

  public async getTxsForSync() {
    return await this.txsyncModel.getTxsForSync();
  }

  public async getTxsDlq(dlq?: string) {
    return await this.txsyncModel.getTxsDlq(dlq);
  }

  public async getTxsPending(offset: number, limit: number) {
    return await this.txsyncModel.getTxsPending(offset, limit);
  }

  public async getTxsBySyncState(offset: number, limit: number, syncState: sync_state) {
    return await this.txsyncModel.getTxsBySyncState(offset, limit, syncState);
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
    await this.txModel.updateCompleted(
      txid,
      false
    );
    await this.txsyncModel.setResync(
      txid
    );
  }

  public async updateTxsync(txid: string, sync: sync_state) {
    await this.txsyncModel.updateTxsync(
      txid,
      sync
    );
  }

  public async updateTxsyncAndClearDlq(txid: string, sync: sync_state) {
    await this.txsyncModel.updateTxsyncAndClearDlq(
      txid,
      sync
    );
  }
}
