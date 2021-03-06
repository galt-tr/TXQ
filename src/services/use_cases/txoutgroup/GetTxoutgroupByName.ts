import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('getTxoutgroupByName')
export default class GetTxoutgroupByName extends UseCase {

  constructor(
    @Inject('txoutgroupService') private txoutgroupService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { groupname: string, offset: any, limit: any}): Promise<UseCaseOutcome> {
    let entities = await this.txoutgroupService.getTxoutgroupByName(params.groupname, params.offset, params.limit);
    return {
      success: true,
      result: entities
    };
  }
}
