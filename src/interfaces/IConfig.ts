export interface ILog {
  level: string;
  logRequestsEnabled: boolean;
  file?: string;
}

export interface IJwt {
  secret: string;
  expiresInHours?: number;
}

export interface IApi {
  prefix?: string;
  port?: number | string;
  jwt?: IJwt;
  bcrypt?: Record<string, number>;
}

export interface Idb {
  host?: string;
  user?: string;
  database?: string;
  password?: string;
  port?: number | string;
  max?: number | string;
  idleTimeoutMillis?: number | string;
}


/**
 * Configure merchantapi miner endpoints
 * Pass in any required headers if needed for auth
 */
export interface IMerchantApiEndpointConfig {
  name: string,
  url: string,
  headers?: any
}

export interface IMerchantConfig {
  sendPolicy: undefined | 'SERIAL_BACKUP' | 'ALL_FIRST_PRIORITY_SUCCESS';
  statusPolicy: undefined | 'SERIAL_BACKUP';
  enableResponseLogging: boolean,
  endpoints: Array<IMerchantApiEndpointConfig>;
}

export interface ISyncQueue {
  taskRequestConcurrency: number;
  abandonedSyncTaskRescanSeconds: number;
  syncBackoff: {
    startingDelay: number;
    maxDelay: number;
    jitter: string;
    timeMultiple: number;
    numOfAttempts: number;
  }
}

export interface IConfig {
  appname?: string;
  baseurl?: string;
  env?: string;
  enableUpdateLogging?: boolean;
  merchantapi?: IMerchantConfig;
  queue?: ISyncQueue,
  api?: IApi;
  logs?: ILog;
  db?: Idb;
  interceptors?: any;
}

