import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';
import { DateUtil } from '../../services/helpers/DateUtil';

export enum sync_state {
  sync_fail = -1,
  sync_none = 0,
  sync_pending = 1,
  sync_success = 2,
}

@Service('txsyncModel')
class TxsyncModel {

  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async getTxsync(txid: string): Promise<string> {
    let result: any = await this.db.query(sql`SELECT * FROM txsync WHERE txid = ${txid}`);
    return result.rows[0];
  }

  public async getTxsForSync(): Promise<string[]> {
    let result: any = await this.db.query(sql`SELECT txid FROM txsync WHERE sync = 1`);
    const txids = [];
    for (const item of result.rows) {
      txids.push(item['txid']);
    }
    return txids;
  }

  public async getTxsDlq(dlq?: string): Promise<string[]> {
    let result: any;

    if (dlq) {
      result = await this.db.query(sql`SELECT txid FROM txsync WHERE dlq = ${dlq}`);
    } else {
      result = await this.db.query(sql`SELECT txid FROM txsync WHERE dlq IS NOT NULL`);
    }

    const txids = [];
    for (const item of result.rows) {
      txids.push(item['txid']);
    }
    return txids;
  }

  public async getTxsPending(offset: number, limit = 10000): Promise<string[]> {
    let result: any;
    result = await this.db.query(sql`SELECT tx.txid FROM tx, txsync WHERE txsync.sync = 1 AND txsync.txid = tx.txid AND tx.completed = false OFFSET ${offset} LIMIT ${limit}`);
    const txids = [];
    for (const item of result.rows) {
      txids.push(item['txid']);
    }
    return txids;
  }

  public async getTxsBySyncState(offset: number, limit: number, syncState: sync_state): Promise<string[]> {
    let result: any;
    result = await this.db.query(sql`SELECT tx.txid FROM tx, txsync WHERE txsync.sync = ${syncState} AND txsync.txid = tx.txid OFFSET ${offset} LIMIT ${limit}`);
    const txids = [];
    for (const item of result.rows) {
      txids.push(item['txid']);
    }
    return txids;
  }

  public async incrementRetries(txid: string): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`UPDATE txsync set status_retries = status_retries + 1, updated_at=${now} where txid = ${txid}`);
    return result;
  }

  public async updateDlq(txid: string, dlq: string): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`UPDATE txsync set dlq = ${dlq}, updated_at=${now}, sync = -1 where txid = ${txid}`);
    return result;
  }


  public async insertTxsync(txid: string, nosync?: boolean): Promise<string> {
    const now = DateUtil.now();
    let syncInitial =  nosync ? 0 : 1; // Otherwise 'pending'
    let result: any = await this.db.query(sql`INSERT INTO txsync(txid, updated_at, created_at, sync, status_retries) VALUES (${txid}, ${now}, ${now}, ${syncInitial}, 0) ON CONFLICT(txid) DO UPDATE SET sync=${syncInitial}`);
    return result;
  }

  public async setResync(txid: string): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`UPDATE txsync SET sync = 1, dlq = null, updated_at=${now} WHERE txid = ${txid}`);
    return result;
  }

  public async updateTxsync(txid: string, sync: sync_state): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`UPDATE txsync SET sync = ${sync}, updated_at=${now} WHERE txid = ${txid}`);
    return result;
  }

  public async updateTxsyncAndClearDlq(txid: string, sync: sync_state): Promise<string> {
    const now = DateUtil.now();
    let result: any = await this.db.query(sql`UPDATE txsync SET sync = ${sync}, updated_at=${now}, dlq = null WHERE txid = ${txid}`);
    return result;
  }
}

export default TxsyncModel;
