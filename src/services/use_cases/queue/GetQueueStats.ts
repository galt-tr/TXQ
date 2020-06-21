import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('getQueueStats')
export default class GetQueueStats extends UseCase {

  constructor(
    @Inject('queueService') private queueService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params?: {}): Promise<UseCaseOutcome> {
    const stats = this.queueService.stats();
    return {
      success: true,
      result: stats
    };
  }
}
