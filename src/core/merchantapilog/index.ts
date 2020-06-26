import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('merchantapilogModel')
class MerchantapilogModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async save(miner: string, eventType: string, response: any, txid?: string): Promise<string> {
    const restext = JSON.stringify(response);
    let requestTypeStr = eventType ? eventType : '';
    if (txid) {
      let result: any = await this.db.query(sql`INSERT INTO merchantapilog(miner, txid, event_type, response) VALUES (${miner}, ${txid}, ${requestTypeStr}, ${restext}) RETURNING id`);
      return result.rows[0].id
    } else {
      let result: any = await this.db.query(sql`INSERT INTO merchantapilog(miner, response, event_type) VALUES (${miner}, ${restext}, ${requestTypeStr}) RETURNING id`);
      return result.rows[0].id
    }
  }
}

export default MerchantapilogModel;
