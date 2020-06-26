import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import ResourceNotFoundError from '../../error/ResourceNotFoundError';
import Config from './../../../cfg';
import * as Minercraft from 'minercraft';
import TransactionStillProcessingError from '../../error/TransactionStillProcessingError';
import TransactionDataMissingError from '../../error/TransactionDataMissingError';
import { sync_state } from '../../../core/txsync';

@Service('syncTxStatus')
export default class SyncTxStatus extends UseCase {
  constructor(
    @Inject('merchantapilogService') private merchantapilogService,
    @Inject('txService') private txService,
    @Inject('txsyncService') private txsyncService,
    @Inject('logger') private logger
  ) {
    super();
  }

  /**
  * Whether this is a valid synced statuts
  * @param status merchant api tx status
  */
  public isStatusSuccess(status: any): boolean {
    if (status && status.payload && (status.payload.blockHash && status.payload.blockHash.trim() !== '') &&
      (status.payload.blockHeight) && status.payload.returnResult === 'success') {
      return true;
    }
    return false;
  }

  /**
   * Save the latest tx status and update blockhash if needed
   *
   * @param txid txid to save status
   * @param status Merchant api status returned
   */
  public async saveTxStatus(txid: string, status: any): Promise<any> {
    let blockhash = null;
    let blockheight = null;

    if (status && status.payload.blockHash && status.payload.blockHeight && status.payload.returnResult === 'success') {
      blockhash = status.payload.blockHash;
      blockheight = status.payload.blockHeight;
      await this.txService.saveTxStatus(txid, status, blockhash, blockheight);
      await this.txService.setTxCompleted(txid);
    } else {
      await this.txService.saveTxStatus(txid, status, blockhash, blockheight);
    }
  }

  public async run(params: {
    txid: string,
    forceRefresh?: boolean
  }): Promise<UseCaseOutcome> {
    this.logger.debug('sync', {
      txid: params.txid,
      trace: 1
    });

    let txsync = await this.txsyncService.getTxsync(params.txid);
    let tx = await this.txService.getTx(params.txid, false);

    this.logger.debug('sync', {
      txid: params.txid,
      trace: 2
    });
    if (!tx || !txsync) {
      this.logger.error('sync', {
        txid: params.txid,
        info: 'ResourceNotFoundError',
      });
      throw new ResourceNotFoundError();
    }
    // If the status is acceptable, then just return it
    if (!params.forceRefresh && tx.status && tx.status.valid &&
        tx.status.payload.blockHash && tx.status.payload.blockHeight && tx.status.payload.returnResult === 'success') {

      this.logger.debug('sync', {
        txid: params.txid,
        info: 'already_completed',
      });
      // It should be a 2 for sync_success
      if (txsync.sync !== 2) {
        await this.txService.setTxCompleted(tx.txid);
      }
      return {
        success: true,
        result: tx.status
      };
    }
    const miner = new Minercraft({
      url: Config.merchantapi.endpoints[0].url,
      headers: Config.merchantapi.endpoints[0].headers,
      maxContentLength: 52428890,
      maxBodyLength: 52428890
    });
    let status = await miner.tx.status(params.txid, { verbose: true });

    await this.saveTxStatus(params.txid, status);
    if (Config.merchantapi.enableResponseLogging) {
      await this.merchantapilogService.save('statustx', status, params.txid);
    }

    if (this.isStatusSuccess(status)) {
      this.logger.debug('sync', {
        txid: params.txid,
        info: 'status_success',
      });
      if (txsync.sync !== 2) {
        await this.txService.setTxCompleted(tx.txid);
      }
      return {
        success: true,
        result: status
      };
    }
    this.logger.debug('sync', {
      txid: params.txid,
      trace: 3
    });
    // Check various error conditions and check whether we need to resend or halt
    if (status && status.payload && status.payload.returnResult === 'failure' &&
      status.payload.resultDescription === 'ERROR: No such mempool or blockchain transaction. Use gettransaction for wallet transactions.') {
        this.logger.info('sync', {
          txid: params.txid,
          trace: 4
        });
      // Now load rawtx
      tx = await this.txService.getTx(params.txid, true);
      if (tx.rawtx) {
        this.logger.info('send', {
          txid: tx.txid
        });
        let response;
        this.logger.info('sync', {
          txid: params.txid,
          trace: 5
        });
        try {
          response = await miner.tx.push(tx.rawtx, {
            verbose: true,
            maxContentLength: 52428890,
            maxBodyLength: 52428890
          });
          this.logger.info('sync', {
            txid: params.txid,
            trace: 6
          });
        } catch (err) {
          this.logger.error('send_error', {
            err
          });
          throw err;
        }
        this.logger.info('send_result', {
          response
        });
        await this.txService.saveTxSend(params.txid, response);

        if (Config.merchantapi.enableResponseLogging) {
          await this.merchantapilogService.save('pushtx', response, params.txid);
        }

        if (response.payload.returnResult === 'failure') {
          this.logger.error('send_error', {
            txid: tx.txid,
            sendPayload: response.payload
          });
          // Something bad, cannot recover
          await this.txService.updateTxsync(params.txid, sync_state.sync_fail);
          return {
            success: true,
            result: status
          };
        }
        // Try to update status again since we just broadcasted
        // Update in the background
        setTimeout(async () => {
          status = await miner.tx.status(params.txid, { verbose: true });
          await this.saveTxStatus(params.txid, status);
          if (Config.merchantapi.enableResponseLogging) {
            await this.merchantapilogService.save('statustx', status, params.txid);
          }
        }, 2000);
      } else {
        // Note: Let this error out
        // We might want to throw an exception so we can allow user to keep retrying tx's
        this.logger.debug('sync', {
          txid: params.txid,
          info: 'TransactionDataMissingError',
        });
        throw new TransactionDataMissingError();
      }
    }
    this.logger.debug('sync', {
      txid: params.txid,
      status: status,
      info: 'TransactionStillProcessingError',
    });

    // Transaction has not setled
    throw new TransactionStillProcessingError();
  }
}
