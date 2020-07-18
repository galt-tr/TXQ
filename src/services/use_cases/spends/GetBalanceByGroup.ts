import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
@Service('getBalanceByGroup')
export default class GetBalanceByGroup extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { groupname: string }): Promise<UseCaseOutcome> {
    let balance = await this.txoutService.getUtxoBalanceByGroup(params.groupname);
    return {
      success: true,
      result: balance
    };
  }
}
