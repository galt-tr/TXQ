import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('enqInitialTxsForSync')
export default class EnqInitialTxsForSync extends UseCase {

  constructor(
    @Inject('txsyncService') private txsyncService,
    @Inject('queueService') private queueService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(): Promise<UseCaseOutcome> {
    let txs = await this.txsyncService.getTxsForSync();
    this.logger.info('sync_txs', {
      count: txs.length
    });
    for (const tx of txs) {
      this.queueService.enqTxStatus(tx);
    }
    return {
      success: true,
      result: txs
    };
  }
}
