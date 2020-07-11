import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('txoutModel')
class TxoutModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async getTxoutByScriptHash(scripthash: string, offset: number, limit: number, script?: boolean, unspent?: boolean): Promise<string> {
    let result: any;
    let split = scripthash.split(',');
    if (script) {
      if (unspent) {
        result = await this.db.query(sql`
        SELECT * FROM txout
        WHERE scripthash = ANY(${sql.array(split, 'varchar')}) AND
        spend_txid IS NULL
        OFFSET ${offset}
        LIMIT ${limit}`);
      } else {
        result = await this.db.query(sql`
        SELECT * FROM txout
        WHERE scripthash = ANY(${sql.array(split, 'varchar')})
        OFFSET ${offset}
        LIMIT ${limit}`);
      }
    } else {
      if (unspent) {
        result = await this.db.query(sql`
        SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout
        WHERE scripthash = ANY(${sql.array(split, 'varchar')}) AND
        spend_txid IS NULL
        OFFSET ${offset}
        LIMIT ${limit}`);
      } else {
        result = await this.db.query(sql`
        SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout
        WHERE scripthash = ANY(${sql.array(split, 'varchar')})
        OFFSET ${offset}
        LIMIT ${limit}`);
      }
    }
    return result.rows;
  }

  public async getTxoutByAddress(address: string, offset: number, limit: number, script?: boolean, unspent?: boolean): Promise<string> {
    let result: any;
    let split = address.split(',');
    if (script) {
      if (unspent) {
        result = await this.db.query(sql`
        SELECT * FROM txout
        WHERE address = ANY(${sql.array(split, 'varchar')}) AND
        spend_txid IS NULL
        OFFSET ${offset}
        LIMIT ${limit}`);
      } else {
        result = await this.db.query(sql`
        SELECT * FROM txout
        WHERE address = ANY(${sql.array(split, 'varchar')})
        OFFSET ${offset}
        LIMIT ${limit}`);
      }
    } else {
      if (unspent) {
        result = await this.db.query(sql`
        SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout
        WHERE address = ANY(${sql.array(split, 'varchar')}) AND
        spend_txid IS NULL
        OFFSET ${offset}
        LIMIT ${limit}`);
      } else {
        result = await this.db.query(sql`
        SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout
        WHERE address = ANY(${sql.array(split, 'varchar')})
        OFFSET ${offset}
        LIMIT ${limit}`);
      }
    }
    return result.rows;
  }

  public async getTxout(txid: string, index: number, script?: boolean): Promise<string> {
    if (script) {
      let result: any = await this.db.query(sql`
      SELECT * FROM txout
      WHERE txid = ${txid} AND
      index = ${index}`);
      return result.rows[0];
    } else {
      let result: any = await this.db.query(sql`
      SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout
      WHERE txid = ${txid} AND
      index = ${index}`);
      return result.rows[0];
    }
  }

  public async getTxoutsByOutpointArray(txOutpoints: Array<{ txid: string, index: string }>, script?: boolean): Promise<any[]> {
    // Hack until we figure out how to do slonik tuple = ANY
    // See: https://github.com/gajus/slonik/issues/192
    const txidToIndexMap = {};
    const txidsOnly = [];
    for (let index = 0; index < txOutpoints.length; index++) {
      txidToIndexMap[txOutpoints[index].txid] = txidToIndexMap[txOutpoints[index].txid] || {};
      txidToIndexMap[txOutpoints[index].txid][txOutpoints[index].index] = true;
      txidsOnly.push(txOutpoints[index].txid);
    }
    let result: any;
    if (script) {
      const i = sql`
      SELECT * FROM txout
      WHERE txid = ANY(${sql.array(txidsOnly, 'varchar')})`;
      result = await this.db.query(i)
    } else {
      result = await this.db.query(sql`
      SELECT txid, index, address, scripthash, satoshis, spend_txid, spend_index FROM txout
      WHERE txid = ANY(${sql.array(txidsOnly, 'varchar')})`);
    }
    const results = [];
    // Walk the results and only keep the txouts that match txid+index
    for (const row of result.rows) {
      if (txidToIndexMap[row.txid]) {
        if (txidToIndexMap[row.txid][row.index]) {
          results.push(row);
        }
      }
    }
    return results;
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
