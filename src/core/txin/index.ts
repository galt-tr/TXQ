import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('txinModel')
class TxinModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async save(txid: string, index: number, prevTxId: string, prevIndex: number, unlockScript: string): Promise<string> {
    let result: any = await this.db.query(sql`INSERT INTO txin(txid, index, prevtxid, previndex, unlockscript) VALUES (${txid}, ${index}, ${prevTxId}, ${prevIndex}, ${unlockScript}) ON CONFLICT(txid, index) DO NOTHING`);
    return result;
  }
  public async getTxinByPrev(prevtxid: string, previndex: number): Promise<string> {
    let result: any = await this.db.query(sql`SELECT * FROM txin WHERE prevtxid = ${prevtxid} AND previndex = ${previndex}`);
    return result.rows[0];
  }
}

export default TxinModel;
