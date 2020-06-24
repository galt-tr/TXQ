import { Service, Inject } from 'typedi';

@Service('merchantapilogService')
export default class MerchantapilogService {
  constructor(
    @Inject('merchantapilogModel') private merchantapilogModel,
    @Inject('eventService') private eventService,
    @Inject('logger') private logger) {}

  public async save(requestType: string, response: any, txid?: string) {
    const savedId = await this.merchantapilogModel.save(
      requestType, response, txid
    );

    if (txid) {
      this.eventService.pushChannelEvent('merchantapilogs', {
        eventType: requestType,
        entity: {
          txid,
          ...response
        },
      }, savedId);
    }
  }
}
