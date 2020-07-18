import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
@Service('getBalanceByAddresses')
export default class GetBalanceByAddresses extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { address: string }): Promise<UseCaseOutcome> {
    let balance = await this.txoutService.getBalanceByAddresses(params.address.split(','));
    return {
      success: true,
      result: balance
    };
  }
}
