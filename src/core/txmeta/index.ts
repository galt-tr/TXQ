import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';
import { DateUtil } from '../../services/helpers/DateUtil';
import { ITransactionMeta } from '../../interfaces/ITransactionData';

@Service('txmetaModel')
class TxmetaModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async isTxMetaExist(txid: string, channel: string): Promise<boolean> {
    let channelStr = channel ? channel : '';
    let result: any = await this.db.query(sql`SELECT txid FROM txmeta WHERE channel = ${channelStr} AND txid = ${txid}`);
    return !!result.rows[0];
  }

  public async getTxmeta(txid: string, channel?: string): Promise<string> {
    let channelStr = channel ? channel : '';
    let result: any = await this.db.query(sql`SELECT * FROM txmeta WHERE channel = ${channelStr} AND txid = ${txid}`);
    return result.rows[0];
  }

  public async getTxsByChannel(channel: string | null | undefined, afterId: number, limit: number, rawtx?: boolean): Promise<string[]> {
    let result: any;
    let channelStr = channel ? channel : '';
    if (rawtx) {
      result = await this.db.query(sql`SELECT txmeta.id, tx.txid, i, h, rawtx, tx.send, status, completed, tx.updated_at, tx.created_at, channel, metadata, tags, extracted FROM tx, txmeta WHERE id >= ${afterId} AND channel = ${channelStr} AND tx.txid = txmeta.txid  ORDER BY txmeta.created_at DESC LIMIT ${limit}`);
    } else {
      result = await this.db.query(sql`SELECT txmeta.id, tx.txid, i, h, tx.send, status, completed, tx.updated_at, tx.created_at, channel, metadata, tags, extracted FROM tx, txmeta WHERE id >= ${afterId} AND channel = ${channelStr} AND tx.txid = txmeta.txid ORDER BY txmeta.created_at DESC LIMIT ${limit}`);
    }
    return result.rows;
  }

  public async saveTxmeta(txid: string, channel: string | undefined | null, txmeta: ITransactionMeta, tags: any, extracted: any): Promise<string> {
    const txmetainsert = JSON.stringify(txmeta);
    const tagsinsert = JSON.stringify(tags);
    const datainsert = JSON.stringify(extracted);
    const now = DateUtil.now();
    let channelStr = channel ? channel : '';

    let result: any = await this.db.query(sql`INSERT INTO txmeta(txid, channel, metadata, updated_at, created_at, tags, extracted) VALUES (${txid}, ${channelStr}, ${txmetainsert}, ${now}, ${now}, ${tagsinsert}, ${datainsert}) ON CONFLICT(txid, channel) DO UPDATE SET updated_at=EXCLUDED.updated_at, metadata=EXCLUDED.metadata, tags=EXCLUDED.tags, extracted=EXCLUDED.extracted`);
    return result;
  }
}

export default TxmetaModel;
