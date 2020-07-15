import { Service, Inject } from 'typedi';

@Service('txoutgroupService')
export default class TxoutgroupService {
  constructor(@Inject('txoutgroupModel') private txoutgroupModel, @Inject('logger') private logger) {}

  public async getTxoutgroupByName(groupname: string, offset: number, limit: number) {
    let entities = await this.txoutgroupModel.getTxoutgroupByName(groupname, offset, limit);
    return entities;
  }

  public async saveTxoutgroups(groupname: string, scriptids: string[]) {
    return await this.txoutgroupModel.saveTxoutgroups(groupname, scriptids);
  }

  public async deleteTxoutgroups(groupname: string, scriptids: string[]) {
    return await this.txoutgroupModel.deleteTxoutgroupByGroupAndScriptids(groupname, scriptids);
  }
}



