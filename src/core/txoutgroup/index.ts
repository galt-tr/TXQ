import { Service, Inject } from 'typedi';
import { sql, DatabaseConnectionType } from 'slonik';

@Service('txoutgroupModel')
class TxoutgroupModel {
  constructor(@Inject('db') private db: DatabaseConnectionType) {}

  public async getTxoutgroupByName(groupname: string, offset: number = 0, limit: number = 100000): Promise<any> {
    const s = sql`
    SELECT * FROM txoutgroup
    WHERE groupname = ${groupname} ORDER BY created_at DESC OFFSET ${offset} LIMIT ${limit}`;
    const result = await this.db.query(s);
    return result.rows;
  }

  public saveTxoutgroups(groupname: string, scriptids: string[]): Promise<any> {
    let expandedInserts = scriptids.map((item) => {
      return [ groupname, item, Math.round((new Date()).getTime() / 1000) ];
    });
    const s = sql`
    INSERT INTO txoutgroup(groupname, scriptid, created_at)
    SELECT *
    FROM ${sql.unnest(
      expandedInserts,
      [
        'varchar[]',
        'varchar[]',
        'int4'
      ]
    )} ON CONFLICT DO NOTHING`;
    return this.db.query(s);
  }

  public async deleteTxoutgroupByName(groupname: string): Promise<any> {
    const result = await this.db.query(sql`
    DELETE FROM txoutgroup
    WHERE groupname = ${groupname}`);
    return result.rows;
  }

  public async deleteTxoutgroupByGroupAndScriptids(groupname: string, scriptids: string[]): Promise<any> {
    const result = await this.db.query(sql`
    DELETE FROM txoutgroup
    WHERE groupname = ${groupname} AND
    scriptid = ANY(${sql.array(scriptids, 'varchar')})`);
    return result.rows;
  }

}

export default TxoutgroupModel;
