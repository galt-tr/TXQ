import { Service, Inject } from 'typedi';

export enum MerchantapilogEventTypes {
  PUSHTX = 'pushtx',
  STATUSTX = 'statustx',
  PROXYPUSHTX = 'proxypushtx',
  PROXYSTATUSTX = 'proxystatustx',
  CHECKPUSHTX = 'checkpushtx',
  PROXYFEEQUOTE = 'proxyfeequote',
  FEEQUOTE = 'feequote',
}

@Service('merchantapilogService')
export default class MerchantapilogService {
  constructor(
    @Inject('merchantapilogModel') private merchantapilogModel,
    @Inject('eventService') private eventService,
    @Inject('logger') private logger) {}

  public async save(miner: string, requestType: string, response: any, txid?: string) {
    const savedId = await this.merchantapilogModel.save(
      miner, requestType, response, txid
    );

    if (txid) {
      this.eventService.pushChannelEvent('merchantapilogs', {
        miner,
        eventType: requestType,
        entity: {
          txid,
          ...response
        },
      }, savedId);
    }
  }
}
