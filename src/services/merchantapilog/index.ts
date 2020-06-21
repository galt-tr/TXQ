import { Service, Inject } from 'typedi';

@Service('merchantapilogService')
export default class MerchantapilogService {
  constructor(@Inject('merchantapilogModel') private merchantapilogModel, @Inject('logger') private logger) {}

  public async save(response: any, txid?: string) {
    await this.merchantapilogModel.save(
      response, txid
    );
  }
}
