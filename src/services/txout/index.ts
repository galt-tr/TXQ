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

  public async getTxoutsByGroup(params: { groupname: string, script?: boolean, limit: any, offset: any, unspent?: boolean}) {
    return await this.txoutModel.getTxoutsByGroup(params);
  }

  public async getBalanceByAddresses(addresses: string[]) {
    return await this.txoutModel.getUtxoBalanceByAddresses(addresses);
  }

  public async getBalanceByScriptHashes(scripthashes: string[]) {
    return await this.txoutModel.getUtxoBalanceByScriptHashes(scripthashes);
  }

  public async getUtxoBalanceByGroup(groupname: string) {
    return await this.txoutModel.getUtxoBalanceByGroup(groupname);
  }

  public async getTxout(txid: string, index: number, script?: boolean) {
    let entity = await this.txoutModel.getTxout(txid, index, script);
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



