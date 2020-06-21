import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('merchantapilogModel')
class MerchantapilogModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async save(response: any, txid?: string): Promise<string> {
    const restext = JSON.stringify(response);
    if (txid) {
      let result: any = await this.db.query(sql`INSERT INTO merchantapilog(txid, response) VALUES (${txid}, ${restext})`);
      return result;
    } else {
      let result: any = await this.db.query(sql`INSERT INTO merchantapilog(response) VALUES (${restext})`);
      return result;
    }
  }
}

export default MerchantapilogModel;
