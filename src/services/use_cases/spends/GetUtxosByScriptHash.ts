import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
@Service('getUtxosByScriptHash')
export default class GetUtxosByScriptHash extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { scripthash: string, limit: any, offset: any }): Promise<UseCaseOutcome> {
    let entities = await this.txoutService.getTxoutByScriptHash(params.scripthash, params.offset, params.limit, false, true);
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
