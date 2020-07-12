
import * as Minercraft from 'minercraft';
import { IMerchantConfig, IMerchantApiEndpointConfig } from '@interfaces/IConfig';
import * as bsv from 'bsv';
import { MerchantapilogEventTypes } from '../merchantapilog';

/**
 * A policy interface for how to execute broadcasts against merchantapi endpoints
 */
export class MerchantRequestorPolicy {
  constructor(protected logger: any, protected responseSaver?: Function) {
  }

  execute(params: any): Promise<any> {
    throw new Error('Missing implementation');
  }

  logError(name, data) {
    if (this.logger) {
      this.logger.error(name, data);
    }
  }

  logInfo(name, data) {
    if (this.logger) {
      this.logger.info(name, data);
    }
  }
}

/**
 * Does a sequential loop over all merchantapi's until 1 is successful
 */
export class MerchantRequestorSendPolicySerialBackup extends MerchantRequestorPolicy {

  constructor(private endpoints: IMerchantApiEndpointConfig[], logger: any, responseSaver?: Function) {
    super(logger, responseSaver);
  }
  /**
   * Execute this policy for broadcasting
   * @param rawtx Tx to broadcast
   */
  execute(params: { txid: string, rawtx: string }): Promise<any> {
    const errors = [];
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.endpoints.length; i++) {
        try {
          const miner = new Minercraft({
            url: this.endpoints[i].url,
            headers: this.endpoints[i].headers,
          });
          const response = await miner.tx.push(params.rawtx, {
            verbose: true,
            maxContentLength: 52428890,
            maxBodyLength: 52428890
          });

          if (this.responseSaver) {
            await this.responseSaver(this.endpoints[i].name, MerchantapilogEventTypes.PUSHTX, response, params.txid);
          }

          if (response && response.payload && response.payload.returnResult === 'success') {
            return resolve(response);
          } else if (response && response.payload) {
            return resolve(response);
          } else {
            this.logInfo('MerchantRequestorSendPolicySerialBackup.NO_RESPONSE', { url: this.endpoints[i].url});
          }
        } catch (err) {
          if (this.responseSaver) {
            await this.responseSaver(this.endpoints[i].name, MerchantapilogEventTypes.PUSHTX, { error: err.toString(), stack: err.stack }, params.txid);
          }
          this.logError('MerchantRequestorSendPolicySerialBackup', { error: err.toString(), stack: err.stack });
          errors.push(err.toString());
        }
      }
      reject(errors);
    });
  }
}
/**
 * Does a sequential loop over all merchantapi's until 1 is successful
 */
export class MerchantRequestorStatusPolicySerialBackup extends MerchantRequestorPolicy {
  constructor(private endpoints: IMerchantApiEndpointConfig[], logger: any, responseSaver?: Function) {
    super(logger, responseSaver);
  }
  /**
   * Execute this policy for broadcasting
   * @param rawtx Tx to broadcast
   */
  execute(params: {txid: string}): Promise<any> {
    const errors = [];
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.endpoints.length; i++) {
        try {
          const miner = new Minercraft({
            url: this.endpoints[i].url,
            headers: this.endpoints[i].headers,
          });
          const response = await miner.tx.status(params.txid, {verbose: true});

          if (this.responseSaver) {
            await this.responseSaver(this.endpoints[i].name, MerchantapilogEventTypes.STATUSTX, response, params.txid);
          }

          if (response && response.payload && response.payload.returnResult === 'success') {
            return resolve(response);
          } else if (response && response.payload) {
            return resolve(response);
          } else {
            this.logInfo('MerchantRequestorStatusPolicySerialBackup.NO_RESPONSE', { url: this.endpoints[i].url});
          }
        } catch (err) {

          if (this.responseSaver) {
            await this.responseSaver(this.endpoints[i].name, MerchantapilogEventTypes.STATUSTX, { error: err.toString(), stack: err.stack }, params.txid);
          }

          this.logError('MerchantRequestorStatusPolicySerialBackup',{ error: err.toString(), stack: err.stack } );
          errors.push(err.toString());
        }
      }
      reject(errors);
    });
  }
}

/**
 * Sends API requests in parallel, logs them (if enabled) and then returns the authorative result by priority ordering
 *
 * From the client it will appear as this behaves like a single merchant-api (albet might return different miner id info)
 */
export class MerchantRequestorSendPolicySendAllTakeFirstPrioritySuccess extends MerchantRequestorPolicy {
  constructor(private endpoints: IMerchantApiEndpointConfig[], logger: any, responseSaver?: Function) {
    super(logger, responseSaver);
  }
  /**
   * Execute this policy for broadcasting
   * @param rawtx Tx to broadcast
   */
  execute(params: { txid: string, rawtx: string }): Promise<any> {

    return new Promise(async (resolve, reject) => {
      const promises = [];
      for (let i = 0; i < this.endpoints.length; i++) {
        promises.push(new Promise(async (innerResolve, innerReject) => {
          const errors = [];
          try {
            const miner = new Minercraft({
              url: this.endpoints[i].url,
              headers: this.endpoints[i].headers,
            });
            const response = await miner.tx.push(params.rawtx, {
              verbose: true,
              maxContentLength: 52428890,
              maxBodyLength: 52428890
            });
            if (response && response.payload && response.payload.returnResult === 'success') {
              return innerResolve(response);
            } else if (response && response.payload) {
              return innerResolve(response);
            } else {
              this.logInfo('MerchantRequestorSendPolicySendAllTakeFirstPrioritySuccess.NO_RESPONSE', { url: this.endpoints[i].url});
            }
          } catch (err) {
            if (this.responseSaver) {
              await this.responseSaver(this.endpoints[i].name, MerchantapilogEventTypes.STATUSTX, { error: err.toString(), stack: err.stack }, params.txid);
            }
            this.logError('MerchantRequestorSendPolicySerialBackup', { error: err.toString(), stack: err.stack });
            errors.push(err.toString());
          }
          innerReject(errors);
        }));
      }
      // Settle all promises then process them
      const minerBroadcastResult = await Promise.all(promises.map(p => p.catch(e => e)));
      let authoratativeSuccessResult;
      let authoratativeFailureResult;
      let errorList = [];
      for (let i = 0; i < minerBroadcastResult.length; i++) {
        this.logInfo('minerResult', {url: this.endpoints[i].url, result: minerBroadcastResult[i]});
        // Save to database if logging enabled
        if (this.responseSaver) {
          await this.responseSaver(this.endpoints[i].name, MerchantapilogEventTypes.PUSHTX, minerBroadcastResult[i], params.txid);
        }
        // Get the authoratative success result
        // Keep the first success always
        if (!authoratativeSuccessResult &&
            minerBroadcastResult[i] &&
            minerBroadcastResult[i].payload &&
            minerBroadcastResult[i].payload.returnResult === 'success') {
            authoratativeSuccessResult = minerBroadcastResult[i];
        }

        if (!authoratativeFailureResult &&
          minerBroadcastResult[i] &&
          minerBroadcastResult[i].payload &&
          minerBroadcastResult[i].payload.returnResult === 'failure') {
            authoratativeFailureResult = minerBroadcastResult[i];
        }
      }

      if (authoratativeSuccessResult) {
        return resolve(authoratativeSuccessResult);
      } else {
        return reject(authoratativeFailureResult || { critical: 'ALL_FAILED', errors: errorList});
      }

    });
  }
}

export class MerchantRequestorPolicyFactory {
  /**
   *  Get the policy for broadcasting
   */
  static getSendPolicy(config: IMerchantConfig, logger: any, responseSaver?: Function): MerchantRequestorPolicy {
    // Only 1 policy supported now
    if (config.sendPolicy === undefined || config.sendPolicy === 'SERIAL_BACKUP') {
      ; // do nothing as it is the default
    }

    if (config.sendPolicy === undefined || config.sendPolicy === 'ALL_FIRST_PRIORITY_SUCCESS') {
      return new MerchantRequestorSendPolicySendAllTakeFirstPrioritySuccess(config.endpoints, logger, responseSaver);
    }

    // Default
    return new MerchantRequestorSendPolicySerialBackup(config.endpoints, logger, responseSaver);
  }

  /**
   *  Get the policy for status
   */
  static getStatusPolicy(config: IMerchantConfig, logger: any, responseSaver?: Function): MerchantRequestorPolicy {
    // Only 1 policy supported now
    if (config.statusPolicy === undefined || config.statusPolicy === 'SERIAL_BACKUP') {
      ; // do nothing as it is the default
    }

    // Default
    return new MerchantRequestorStatusPolicySerialBackup(config.endpoints, logger, responseSaver);
  }
}

/**
 * Multiplexor with policy for how to interact with Merchant API
 */
export class MerchantRequestor {
  private sendPolicy;
  private statusPolicy;
  /**
   *
   * @param config Config options
   */
  constructor(private config: IMerchantConfig, private logger: any, private responseSaver: Function) {
    this.config.sendPolicy = this.config.sendPolicy || 'ALL_FIRST_PRIORITY_SUCCESS';
    this.config.statusPolicy = this.config.statusPolicy || 'SERIAL_BACKUP';
    this.sendPolicy = this.sendPolicy || MerchantRequestorPolicyFactory.getSendPolicy(this.config, this.logger, this.responseSaver);
    this.statusPolicy = this.statusPolicy || MerchantRequestorPolicyFactory.getStatusPolicy(this.config, this.logger, this.responseSaver);
  }

  /**
   *
   * @param rawtx Raw tx to push to merchant api's according to policy
   */
  public async pushTx(rawtx: string): Promise<any> {
    const tx = new bsv.Transaction(rawtx);
    return new Promise(async (resolve, reject) => {
      this.sendPolicy.execute({txid: tx.hash, rawtx})
      .then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   *
   * @param txid Txid to query from merchcant api's
   */
  public async statusTx(txid: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.statusPolicy.execute({txid})
      .then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
