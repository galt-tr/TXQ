import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
@Service('getUtxosByGroup')
export default class GetUtxosByGroup extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { groupname: string, script?: boolean, limit: any, offset: any }): Promise<UseCaseOutcome> {
    let entities = await this.txoutService.getTxoutsByGroup({ ...params, unspent: true});
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
