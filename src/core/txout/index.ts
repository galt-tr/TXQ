import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('txoutModel')
class TxoutModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async getTxoutByScriptHash(scripthash: string, offset: number, script?: boolean, unspent?: boolean): Promise<string> {
    let result: any;
    if (script) {
      if (unspent) {
        result = await this.db.query(sql`SELECT * FROM txout WHERE scripthash = ${scripthash} AND spend_txid IS NULL OFFSET ${offset} LIMIT 1000`);
      } else {
        result = await this.db.query(sql`SELECT * FROM txout WHERE scripthash = ${scripthash} OFFSET ${offset} LIMIT 1000`);
      }
    } else {
      if (unspent) {
        result = await this.db.query(sql`SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout WHERE scripthash = ${scripthash} AND spend_txid IS NULL OFFSET ${offset} LIMIT 1000`);
      } else {
        result = await this.db.query(sql`SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout WHERE scripthash = ${scripthash} OFFSET ${offset} LIMIT 1000`);
      }
    }
    return result.rows
  }

  public async getTxoutByAddress(address: string, offset: number, script?: boolean, unspent?: boolean): Promise<string> {
    let result: any;
    if (script) {
      if (unspent) {
        result = await this.db.query(sql`SELECT * FROM txout WHERE address = ${address} AND spend_txid IS NULL OFFSET ${offset} LIMIT 1000`);
      } else {
        result = await this.db.query(sql`SELECT * FROM txout WHERE address = ${address} OFFSET ${offset} LIMIT 1000`);

      }
    } else {
      if (unspent) {
        result = await this.db.query(sql`SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout WHERE address = ${address} AND spend_txid IS NULL OFFSET ${offset} LIMIT 1000`);
      } else {
        result = await this.db.query(sql`SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout WHERE address = ${address} OFFSET ${offset} LIMIT 1000`);
      }
    }
    return result.rows;
  }

  public async getTxout(txid: string, index: number, script?: boolean): Promise<string> {
    if (script) {
      let result: any = await this.db.query(sql`SELECT * FROM txout WHERE txid = ${txid} AND index = ${index}`);
      return result.rows[0];
    } else {
      let result: any = await this.db.query(sql`SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout WHERE txid = ${txid} AND index = ${index}`);
      return result.rows[0];
    }
  }

  public async saveTxout(txid: string, index: number, address: string | null | undefined, scripthash: string, script: string, satoshis: number): Promise<string> {
    let result: any = await this.db.query(sql`INSERT INTO txout(txid, index, address, scripthash, script, satoshis) VALUES (${txid}, ${index}, ${address}, ${scripthash}, ${script}, ${satoshis}) ON CONFLICT DO NOTHING`);
    return result;
  }

  public async updateSpendIndex(
    txid: string, index: string, spendTxId: string, spendIndex: number
  ) {
    let result: any = await this.db.query(sql`UPDATE txout SET spend_txid=${spendTxId}, spend_index=${spendIndex} WHERE txid=${txid} AND index=${index}`);
    return result;
  }
}

export default TxoutModel;
