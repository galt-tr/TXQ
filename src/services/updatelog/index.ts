import { Service, Inject } from 'typedi';

@Service('updatelogService')
export default class UpdatelogService {
  constructor(
    @Inject('updatelogModel') private updatelogModel,
    @Inject('eventService') private eventService,
    @Inject('logger') private logger) {}

  public async save(requestType: string, channel: string, response: any, txid: string) {
    const savedId = await this.updatelogModel.save(
      requestType, response, channel, txid
    );
    if (channel !== response.channel) {
      throw new Error('Logic Error');
    }
    this.eventService.pushChannelEvent('updatelogs-' + channel, {
      eventType: requestType,
      entity: {
        txid,
        ...response
      }
    }, savedId);
  }
}
