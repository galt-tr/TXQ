import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';
import { DateUtil } from '../../services/helpers/DateUtil';
import { ITransactionMeta } from '../../interfaces/ITransactionData';

@Service('txmetaModel')
class TxmetaModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async getTxmeta(txid: string, channel?: string): Promise<string> {
    if (channel && channel !== '') {
      let result: any = await this.db.query(sql`SELECT * FROM txmeta WHERE txid = ${txid} AND channel = ${channel}`);
      return result.rows[0];
    } else {
      let result: any = await this.db.query(sql`SELECT * FROM txmeta WHERE txid = ${txid} AND channel = ''`);
      return result.rows[0];
    }
  }

  public async getTxsByChannel(channel: string | null | undefined, offset: number = 0, rawtx?: boolean): Promise<string[]> {
    let result: any;
    if (channel) {
      if (rawtx) {
        result = await this.db.query(sql`SELECT tx.txid, i, h, rawtx, tx.send, status, completed, tx.updated_at, tx.created_at, channel, metadata, tags, extracted FROM tx, txmeta WHERE tx.txid = txmeta.txid AND channel = ${channel} ORDER BY txmeta.created_at DESC OFFSET ${offset} LIMIT 1000 `);
      } else {
        result = await this.db.query(sql`SELECT tx.txid, i, h, tx.send, status, completed, tx.updated_at, tx.created_at, channel, metadata, tags, extracted FROM tx, txmeta WHERE tx.txid = txmeta.txid AND channel = ${channel} ORDER BY txmeta.created_at DESC OFFSET ${offset} LIMIT 1000 `);
      }
    } else {
      if (rawtx) {
        result = await this.db.query(sql`SELECT tx.txid, i, h, rawtx, tx.send, status, completed, tx.updated_at, tx.created_at, channel, metadata, tags, extracted FROM tx, txmeta WHERE tx.txid = txmeta.txid AND channel = '' ORDER BY txmeta.created_at DESC OFFSET ${offset} LIMIT 1000 `);
    } else {
        result = await this.db.query(sql`SELECT tx.txid, i, h, tx.send, status, completed, tx.updated_at, tx.created_at, channel, metadata, tags, extracted  FROM tx, txmeta WHERE tx.txid = txmeta.txid AND channel = '' ORDER BY txmeta.created_at DESC OFFSET ${offset} LIMIT 1000 `);
      }
    }
    return result.rows;
  }

  public async saveTxmeta(txid: string, channel: string | undefined | null, txmeta: ITransactionMeta, tags: any, extracted: any): Promise<string> {
    const txmetainsert = JSON.stringify(txmeta);
    const tagsinsert = JSON.stringify(tags);
    const datainsert = JSON.stringify(extracted);
    const now = DateUtil.now();
    if (channel && channel !== '') {
      let result: any = await this.db.query(sql`INSERT INTO txmeta(txid, channel, metadata, updated_at, created_at, tags, extracted) VALUES (${txid}, ${channel}, ${txmetainsert}, ${now}, ${now}, ${tagsinsert}, ${datainsert}) ON CONFLICT(txid, channel) DO UPDATE SET updated_at=${now}, metadata=${txmetainsert}, tags=${tagsinsert}, extracted=${datainsert}`);
      return result;
    } else {
      let result: any = await this.db.query(sql`INSERT INTO txmeta(txid, channel, metadata, updated_at, created_at, tags, extracted) VALUES (${txid}, '', ${txmetainsert}, ${now}, ${now}, ${tagsinsert}, ${datainsert}) ON CONFLICT(txid, channel) DO UPDATE SET updated_at=${now}, metadata=${txmetainsert}, tags=${tagsinsert}, extracted=${datainsert}`);
      return result;
    }
  }
}

export default TxmetaModel;
