import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';

@Service('getUtxosByAddress')
export default class GetUtxosByAddress extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { address: string, limit: any, script?: boolean, offset: any}): Promise<UseCaseOutcome> {
    let entities = await this.txoutService.getTxoutByAddress(params.address, params.offset, params.limit, params.script, true);
    let utxoFormatted = [];
    utxoFormatted = entities.map((e) => {
      return {
        txid: e.txid,
        vout: e.index,
        outputIndex: e.index,
        value: e.satoshis,
        satoshis: e.satoshis,
        script: e.script,
        address: e.address,
        scripthash: e.scripthash
      }
    })
    return {
      success: true,
      result: utxoFormatted
    };
  }
}
