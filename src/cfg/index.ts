import * as dotenv from 'dotenv-safe';
import { IConfig } from '@interfaces/IConfig';

const envFound = dotenv.config();

if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

const config: IConfig = {
  appname: 'txq',
  baseurl: process.env.BASEURL || 'http://localhost',
  env: process.env.NODE_ENV || 'development',
  api: {
    prefix: '/api',
    port: process.env.PORT || 3000,
    jwt: {
      secret: 'secret', // update before deployment
      expiresInHours: 24, // 24 hrs, update before deployment
    },
    bcrypt: {
      rounds: 8,
    },
  },
  queue: {
    merchantapiRequestConcurrency: 3,         // Max number of concurrent requests to sync tx status from merchantapi
    abandonedSyncTaskRescanSeconds: 60,       // How many seconds to rescan for missed tasks
    syncBackoff: {
      jitter: 'none',                         // 'full' or 'none'
      timeMultiple: 2,                        // Exponential back off multiple
      startingDelay: 1000 * 60,               // Initial start delay before first re-check
      maxDelay: 1000 * 60 * 20,               // Max back off time. 20 Minutes is max
      numOfAttempts: 20,                      // Max attempts before being put into 'dlq'
    }
  },
  enableUpdateLogging: true,                  // Whether to log every update entity to the database
  merchantapi: {
    enableResponseLogging: true,              // Whether to log every request and response from merchantapi's to the database
    endpoints: [
      {
        name: 'matterpool',
        url: 'https://merchantapi.matterpool.io'
      },
      {
        name: 'mempool',
        url: 'https://merchantapi.mempool.com'
      },
      {
        name: 'taal',
        url: 'https://merchantapi.taal.com'
      },
    ]
  },
  db: {
    host: 'localhost',
    user: 'postgres',
    database: 'txq_dev',
    password: 'postgres',
    port: 5432,
    max: 3,
    idleTimeoutMillis: 3000
  },
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
    logRequestsEnabled: true,
    file: 'debug.log',
  },
  interceptors: [],
};

export default {
  ...config,
  ...require(`./${config.env}`).default,
};
