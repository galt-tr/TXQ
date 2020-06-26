import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('getTxsDlq')
export default class GetTxsDlq extends UseCase {

  constructor(
    @Inject('txsyncService') private txsyncService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { dlq?: string}): Promise<UseCaseOutcome> {
    let txs = await this.txsyncService.getTxsDlq(params.dlq);
    return {
      success: true,
      result: txs
    };
  }
}
