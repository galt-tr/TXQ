import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import * as bsv from 'bsv';

@Service('getTxoutsByAddress')
export default class GetTxoutsByAddress extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { address: string, offset: any, script?: boolean, unspent?: boolean}): Promise<UseCaseOutcome> {
    let entities = await this.txoutService.getTxoutByAddress(params.address, params.offset, params.script, params.unspent);
    return {
      success: true,
      result: entities
    };
  }
}
