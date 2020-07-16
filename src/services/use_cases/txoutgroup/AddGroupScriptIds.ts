import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('addGroupScriptIds')
export default class AddGroupScriptIds extends UseCase {

  constructor(
    @Inject('txoutgroupService') private txoutgroupService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { groupname: string, scriptids: string[]}): Promise<UseCaseOutcome> {
    await this.txoutgroupService.saveTxoutgroups(params.groupname, params.scriptids);
    return {
      success: true,
      result: {}
    };
  }
}
