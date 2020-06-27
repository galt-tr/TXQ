
import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import Config from './../../../cfg';
import * as bsv from 'bsv';
import { Request } from 'express';
import * as Minercraft from 'minercraft';

@Service('saveProxyRequestResponse')
export default class SaveProxyRequestResponse extends UseCase {

  constructor(
    @Inject('merchantapilogService') private merchantapilogService,
    @Inject('saveTxs') private saveTxs,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: {
    userReq: any,
    proxyRes: any,
    proxyResData: any,
    miner: string,
  }): Promise<UseCaseOutcome> {
    if ((params.proxyRes.statusCode <= 299 && params.proxyRes.statusCode >= 200) || params.proxyRes.statusCode === 301) {
      await this.saveSuccess(params);
    } else {
      await this.saveError(params.proxyRes.statusCode, params);
    }
    return {
      success: true,
      result: {
      }
    };
  }

  private async saveSuccess(params: {
    userReq: any,
    proxyRes: any,
    proxyResData: any,
    miner: string,
  }) {
    let eventType = this.getEventType(params.userReq);
    const data = JSON.parse(params.proxyResData.toString('utf8'));
    this.logger.info('mapi_proxy', { statusCode: params.proxyRes.statusCode, data: data, eventType: eventType});
    let txid;
    let tx;
    if (eventType === 'proxypushtx'){
      tx = this.getParsedTx(params.userReq);
      txid = tx.hash || undefined;
      const channelMeta = this.getChannnelMeta(params.userReq);
      await this.saveTxs.run({
        channel: channelMeta.channel ? channelMeta.channel : null,
        set: {
          [txid]: {
            rawtx: tx.toString(),
            metadata: channelMeta.metadata,
            tags: channelMeta.tags
          }
        }
     });
    } else if (eventType === 'proxystatustx') {
      txid = this.getTxidFromPath(params.userReq);
    }

    if (Config.merchantapi.enableResponseLogging) {
      let isValid;
      try {
        isValid = Minercraft.validate(data);
      } catch (e) {
        isValid = false;
      }
      let validatedData = data;
      validatedData.payload = JSON.parse(data.payload)
      validatedData.valid = isValid;
      await this.merchantapilogService.save(params.miner, eventType, validatedData, txid);
    }
    return true;
  }

  private async saveError(statusCode, params: {
    userReq: any,
    proxyRes: any,
    proxyResData: any,
    miner: string
  }) {
    this.logger.error('mapi_proxy', { statusCode: params.proxyRes.statusCode, data: params.proxyResData.toString('utf8')});
    if (Config.merchantapi.enableResponseLogging) {
      const eventType = this.getEventType(params.userReq);
      const txid = this.findTxid(params.userReq);
      await this.merchantapilogService.save(params.miner, eventType, { code: statusCode, data: params.proxyResData.toString('utf8') }, txid);
    }
  }

  /**
   * Get the event type for the request
   * @param userReq The express request to use to determine the API endpoint request type
   */
  private getEventType(userReq: Request): string {
    if (/^(\/mapi)?\/tx$/.test(userReq.path) && /post/i.test(userReq.method)) {
      return 'proxypushtx';
    }
    if (/^(\/mapi)?\/feeQuote$/.test(userReq.path) && /get/i.test(userReq.method)) {
      return 'proxyfeequote';
    }
    const TXID_REGEX = new RegExp('^(\/mapi)?\/tx\/[0-9a-fA-F]{64}$');
    if (TXID_REGEX.test(userReq.path) && /get/i.test(userReq.method)) {
      return 'proxystatustx';
    }
    return undefined;
  }

  /**
   * Get the txid if it's available
   * @param userReq The express request to use to find the txid
   */
  private getTxidFromPath(userReq: Request): string {
    const TXID_REGEX = new RegExp('^(\/mapi)?\/tx\/([0-9a-fA-F]{64})$');
    const matches = TXID_REGEX.exec(userReq.path);
    if (matches) {
      return matches[2];
    }
    return undefined;
  }

  private getChannnelMeta(userReq: Request): { channel: string, metadata: any, tags: any } {
    let channel = undefined;
    let metadata = undefined;
    let tags = undefined;
    if (userReq.headers && userReq.headers.channel) {
      channel = userReq.headers.channel
    }
    if (userReq.headers && userReq.headers.metadata) {
      try {
        let tmpMetadata: any = userReq.headers.metadata;
        metadata = JSON.parse(tmpMetadata);
      } catch (ex) {
      }
    }
    if (userReq.headers && userReq.headers.tags) {
      try {
        let tmpTags: any = userReq.headers.tags;
        tags = JSON.parse(tmpTags);
      } catch (ex) {
      }
    }
    return {
      channel,
      metadata,
      tags
    };
  }

  private getParsedTx(userReq: Request): string {
    if (userReq.body && userReq.body.rawTx || userReq.body.rawtx) {
      let rawtx = userReq.body.rawTx || userReq.body.rawtx;
      try {
        return new bsv.Transaction(rawtx)
      } catch (err) {
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Get the txid from rawtx if available
   * @param userReq The express request to use to find the txid
   */
  private getTxidFromRawtx(userReq: Request): string {

    // Decode the body to get the txid
    if (userReq.body && userReq.body.rawTx || userReq.body.rawtx) {
      let rawtx = userReq.body.rawTx || userReq.body.rawtx;
      try {
        const tx = new bsv.Transaction(rawtx)
        return tx.hash;
      } catch (err) {
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Find the txid in the path or the rawtx body
   * @param userReq The user request to use to find the txid
   */
  private findTxid(userReq: Request): string {
    let txid = this.getTxidFromPath(userReq);
    if (txid) {
      return txid;
    }
    return this.getTxidFromRawtx(userReq);
  }
}

