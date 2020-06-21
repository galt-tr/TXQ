import { Service, Inject } from 'typedi';
import ResourceNotFoundError from '../error/ResourceNotFoundError';
import * as bsv from 'bsv';
import InvalidParamError from '../error/InvalidParamError';
import { ITransactionMeta } from '../../interfaces/ITransactionData';

@Service('txmetaService')
export default class TxmetaService {
  constructor(@Inject('txmetaModel') private txmetaModel, @Inject('logger') private logger) {}

  public async getTxmeta(txid: string, channel?: string) {
    let tx = await this.txmetaModel.getTxmeta(txid, channel);
    return tx;
  }

  public async getTxsByChannel(channel?: string, offset?: number, rawtx?: boolean) {
    return await this.txmetaModel.getTxsByChannel(channel, offset, rawtx);

  }

  public async saveTxmeta(txid: string, channel: string | undefined | null, txmeta: ITransactionMeta, tags: any, extracted: any) {
    await this.txmetaModel.saveTxmeta(
      txid, channel, txmeta, tags, extracted
    );
  }
}
