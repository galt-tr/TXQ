
import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import Config from '../../../cfg';
import { MerchantRequestor } from '../../../services/helpers/MerchantRequestor';
import * as bsv from 'bsv';
import * as express from 'express';
import { MerchantapilogEventTypes } from '../../../services/merchantapilog';
import { StatusTxUtil } from '../../../services/helpers/StatusTxUtil';
import { ChannelMetaUtil } from '../../../services/helpers/ChannelMetaUtil';

@Service('proxyAndSaveRequestIfCheckStatus')
export default class ProxyAndSaveRequestIfCheckStatus extends UseCase {
  constructor(
    @Inject('merchantapilogService') private merchantapilogService,
    @Inject('saveProxyRequestResponse') private saveProxyRequestResponse,
    @Inject('saveTxs') private saveTxs,
    @Inject('logger') private logger) {
    super();
  }
   /**
   * Hold up the broadcast request and first check if we have the transaction already
   * If the transaction appears in the blockchain, then it means we should store the transaction immediately
   *
   * @param req Request to determine if we should check status first and save the tx if needed
   * @param cb
   */
  async run(params: {
    req: express.Request,
    cb: Function
  }): Promise<UseCaseOutcome> {
    try {
      // Check if it's a broadcast attempt
      if (/^post$/i.test(params.req.method) &&
          /^\/tx$/i.test(params.req.path) && this.hasCheckStatusSet(params.req)) {
        // Decode the transaction to get the txid we can use to query
        let tx;
        try {
           tx = new bsv.Transaction(params.req.body.rawtx || params.req.body.rawTx);
        } catch (decodeError) {
          this.logger.debug('proxyAndSaveRequestIfCheckStatus', {
            decodeError
          });
        }
        if (tx) {
          try {
            await this.processTransactionStatus(tx, ChannelMetaUtil.getChannnelMeta(params.req));
          } catch (processTransactionStatusError) {
           this.logger.debug('proxyAndSaveRequestIfCheckStatus', {
            processTransactionStatusError
           });
         }
        }
      }
      if (params && params.cb) {
        params.cb();
      }
      return {
        success: true,
        result: {
        }
      };
    } catch (ex) {
      if (params && params.cb) {
        params.cb();
      }
      throw ex;
    }
  }
  /**
   * Determine if the transaction was already settled long ago, if so then save it to our database.
   * This is needed because an error "inputs missing" is returned when attempting to broadcast and already confirmed very old transaction.
   *
   * The approach below is to first call GET /mapi/tx/:txid to see if it was settled long ago before.
   * If it was then store the tx in the database.
   *
   * If we didnt do this, then any broadcast transactions to mapi would not get saved to TXQ.
   *
   *
   * @param tx Transaction to check status for and save to the db
   */
  async processTransactionStatus(tx: bsv.Transaction, channelMeta: any) {
    /**
     * Save the response callback
     *
     * Since we use this only for 'push check status', then rewrite the eventType to 'pushcheckstatustx'
     *
     * @param miner Miner to save under
     * @param eventType Event type
     * @param response Response to save
     * @param txid Given txid or null
     */
    const saveResponseTask = async  (miner: string, eventType: string, response: any, txid: string) => {
      if (Config.merchantapi.enableResponseLogging) {
        this.logger.info('saveResponseTask', {
          miner,  txid
        });
        await this.merchantapilogService.save(miner, MerchantapilogEventTypes.CHECKPUSHTX, response, txid);
      }
      return true;
    };
    const merchantRequestor = new MerchantRequestor(
      { ... Config.merchantapi },
      null,
      saveResponseTask
    )
    let status = await merchantRequestor.statusTx(tx.hash);
    // Check whether the transaction was settled (confirmed) at some point
    // We want to save the tx if and only if it was confirmed because
    // that way we know it is valid and committed.
    // If we accepted non-confirmed, then we could pollute database with unconfirmed/invalid tx.
    if (StatusTxUtil.isAcceptedStatus(status)) {
        const txid = tx.hash || undefined;
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
    }
    return status;
  }

  /**
   * Whether we should check status first before broadcasting
   * @param req Request to check for 'checkstatus' in header or query param
   */
  hasCheckStatusSet(req: express.Request) {
    if (req.query.checkstatus && req.query.checkstatus === 'true') {
      return true;
    }
    if (req.headers && req.headers.checkstatus === 'true') {
      return true;
    }
    return false;
  }
}

