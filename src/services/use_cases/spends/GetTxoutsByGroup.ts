import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import InvalidParamError from '../../error/InvalidParamError';
@Service('getTxoutsByGroup')
export default class GetTxoutsByGroup extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { groupname: string, script?: boolean, offset: any, limit: any, unspent?: boolean}): Promise<UseCaseOutcome> {
    let entities = await this.txoutService.getTxoutsByGroup(params.groupname, params.script, params.offset, params.limit, params.unspent);
    return {
      success: true,
      result: entities
    };
  }
}
