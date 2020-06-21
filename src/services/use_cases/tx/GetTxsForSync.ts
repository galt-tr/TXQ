import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('getTxsForSync')
export default class GetTxsForSync extends UseCase {

  constructor(
    @Inject('txsyncService') private txsyncService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(): Promise<UseCaseOutcome> {
    let txs = await this.txsyncService.getTxsForSync();
    return {
      success: true,
      result: txs
    };
  }
}
