import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('getTxsByChannel')
export default class GetTxsDlq extends UseCase {

  constructor(
    @Inject('txmetaService') private txmetaService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { channel: string | undefined | null, offset: any, rawtx: boolean}): Promise<UseCaseOutcome> {
    let txs = await this.txmetaService.getTxsByChannel(params.channel, params.offset, params.rawtx);
    return {
      success: true,
      result: txs
    };
  }
}
