import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('incrementTxRetries')
export default class IncrementTxRetries extends UseCase {
  constructor(
    @Inject('txsyncService') private txsyncService,
    @Inject('logger') private logger
  ) {
    super();
  }

  public async run(params: {
    txid: string;
  }): Promise<UseCaseOutcome> {
    await this.txsyncService.incrementRetries(
      params.txid
    );
    return {
      success: true
    }
  }
}
