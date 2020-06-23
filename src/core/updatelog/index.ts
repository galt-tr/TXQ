import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('updatelogModel')
class UpdatelogModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async save(eventType: string, response: any, channel: string, txid: string): Promise<string> {
    const restext = JSON.stringify(response);
    let requestTypeStr = eventType ? eventType : '';
    let channelStr = channel ? channel : '';
    let result: any = await this.db.query(sql`INSERT INTO updatelog(txid, event_type, channel, response) VALUES (${txid}, ${requestTypeStr}, ${channelStr}, ${restext}) RETURNING id`);
    return result.rows[0].id
  }
}

export default UpdatelogModel;
