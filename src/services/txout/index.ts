import { Service, Inject } from 'typedi';
import ResourceNotFoundError from '../error/ResourceNotFoundError';

@Service('txoutService')
export default class TxoutService {
  constructor(@Inject('txoutModel') private txoutModel, @Inject('logger') private logger) {}

  public async getTxoutByScriptHash(scripthash: string, offset: number, limit: number, script?: boolean, unspent?: boolean) {
    let entity = await this.txoutModel.getTxoutByScriptHash(scripthash, offset, limit, script, unspent);
    if (!entity) {
      throw new ResourceNotFoundError();
    }
    return entity;
  }

  public async getTxoutByAddress(address: string, offset: number, limit: number, script?: boolean, unspent?: boolean) {
    let entity = await this.txoutModel.getTxoutByAddress(address, offset, limit, script, unspent);
    if (!entity) {
      throw new ResourceNotFoundError();
    }
    return entity;
  }

  public async getTxoutsByOutpointArray(txOutpoints: {txid:  string, index: string}, script?: boolean) {
    return await this.txoutModel.getTxoutsByOutpointArray(txOutpoints, script);
  }

  public async saveTxout(txid: string, index: number, address: string | null | undefined, scripthash: string, script: string, satoshis: number) {
    await this.txoutModel.saveTxout(
      txid, index, address, scripthash, script, satoshis
    );
  }
}
