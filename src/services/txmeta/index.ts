import { Service, Inject } from 'typedi';
import { ITransactionMeta } from '../../interfaces/ITransactionData';

@Service('txmetaService')
export default class TxmetaService {
  constructor(@Inject('txmetaModel') private txmetaModel, @Inject('logger') private logger) {}

  public isTxMetaExist(txid: string, channel: string): Promise<boolean> {
    return this.txmetaModel.isTxMetaExist(txid, channel);
  }

  public async getTxmeta(txid: string, channel?: string) {
    let tx = await this.txmetaModel.getTxmeta(txid, channel);
    return tx;
  }

  public async getTxsByChannel(channel: string, afterId: number, limit: number, rawtx?: boolean) {
    return await this.txmetaModel.getTxsByChannel(channel, afterId, limit, rawtx);
  }

  public async saveTxmeta(txid: string, channel: string | undefined | null, txmeta: ITransactionMeta, tags: any, extracted: any) {
    await this.txmetaModel.saveTxmeta(
      txid, channel, txmeta, tags, extracted
    );
  }
}
