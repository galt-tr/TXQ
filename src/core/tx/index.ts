import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';
import { DateUtil } from '../../services/helpers/DateUtil';
import { ITransactionStatus } from '../../interfaces/ITransactionData';

@Service('txModel')
class TxModel {

  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async isTxExist(txid: string): Promise<boolean> {
    let result: any = await this.db.query(sql`SELECT txid FROM tx WHERE txid = ${txid}`);
    return !!result.rows[0];
  }

  public async getTx(txid: string, rawtx?: boolean): Promise<string> {
    if (rawtx) {
      let result: any = await this.db.query(sql`SELECT * FROM tx WHERE txid = ${txid}`);
      return result.rows[0];
    } else {
      let result: any = await this.db.query(sql`SELECT txid, h, i, send, status, completed, updated_at, created_at FROM tx WHERE txid = ${txid}`);
      return result.rows[0];
    }
  }

  public async saveTxid(txid: string): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`INSERT INTO tx(txid, updated_at, created_at, completed) VALUES (${txid}, ${now}, ${now}, false) ON CONFLICT DO NOTHING RETURNING txid`);
    return result;
  }

  public async saveTx(txid: string, rawtx?: string): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`INSERT INTO tx(txid, rawtx, updated_at, created_at, completed) VALUES (${txid}, ${rawtx}, ${now}, ${now}, false) ON CONFLICT(txid) DO UPDATE SET rawtx = EXCLUDED.rawtx, updated_at=EXCLUDED.updated_at RETURNING txid`);
    return result;
  }

  public async saveTxStatus(txid: string, txStatus: ITransactionStatus, blockhash: string | null, blockheight: number | null): Promise<string> {
    const now = DateUtil.now();
    if (blockhash && blockheight) {
      let result: any = await this.db.query(sql`UPDATE tx SET status = ${JSON.stringify(txStatus)}, h = ${blockhash}, i=${blockheight}, updated_at=${now}, completed = true WHERE txid = ${txid}`);
      return result;
    }
    let result: any = await this.db.query(sql`UPDATE tx SET status = ${JSON.stringify(txStatus)}, updated_at=${now} WHERE txid = ${txid}`);
    return result;
  }

  public async saveTxSend(txid: string, send: any): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`UPDATE tx SET send = ${JSON.stringify(send)}, updated_at=${now} WHERE txid = ${txid}`);
    return result;
  }

  public async updateCompleted(txid: string, completed?: boolean): Promise<string> {
    const now = DateUtil.now();
    if (completed) {
      let result: any = await this.db.query(sql`UPDATE tx SET updated_at=${now}, completed = true WHERE txid = ${txid}`);
      return result;
    } else {
      let result: any = await this.db.query(sql`UPDATE tx SET updated_at=${now}, completed = false WHERE txid = ${txid}`);
      return result;
    }
  }
}

export default TxModel;
