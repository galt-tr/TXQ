import 'reflect-metadata';

//import 'module-alias/register';
import * as express from 'express';
import { createServer } from 'http';
import * as SetTimeZone from 'set-tz';
import { middlewareLoader } from './middleware';
import { handleServerExit, handleExceptions } from './middleware/errorMiddleware';
import { Container } from 'typedi';
import Config from './../cfg';
import { logger } from './middleware/logger';
import * as proxy from 'express-http-proxy';
import * as urlJoin from 'url-join';
import * as url from 'url';
import * as parser from 'body-parser';

SetTimeZone('UTC');

import "../services/tx/index";
import "../services/txsync/index";
import "../services/txout/index";
import "../services/txmeta/index";
import "../services/txin/index";
import "../services/queue/index";
import "../services/merchantapilog/index";
import "../services/spend/index";
import "../services/event/index";
import "../services/updatelog/index";
import "../services/use_cases/tx/GetTx";
import "../services/use_cases/tx/SaveTxs";
import "../services/use_cases/tx/SyncTxStatus";
import "../services/use_cases/tx/GetTxsForSync";
import "../services/use_cases/tx/GetTxsByChannel";
import "../services/use_cases/tx/EnqInitialTxsForSync";
import "../services/use_cases/tx/IncrementTxRetries";
import "../services/use_cases/tx/UpdateTxDlq";
import "../services/use_cases/queue/GetTxsDlq";
import "../services/use_cases/queue/ResyncTx";
import "../services/use_cases/queue/GetQueueStats";
import "../services/use_cases/queue/GetTxsPending";
import "../services/use_cases/queue/GetTxsBySyncState";
import "../services/use_cases/spends/GetTxout";
import "../services/use_cases/spends/GetTxoutsByAddress";
import "../services/use_cases/spends/GetTxoutsByScriptHash";
import "../services/use_cases/spends/GetUtxosByAddress";
import "../services/use_cases/spends/GetUtxosByScriptHash";
import "../services/use_cases/events/ConnectChannelClientSSE";
import EnqInitialTxsForSync from '../services/use_cases/tx/EnqInitialTxsForSync';
import SaveProxyRequestResponse from '../services/use_cases/proxy/SaveProxyRequestResponse';

async function startServer() {
  let app = express();
  /**
   * Provide direct mapi access via a proxy
   *
   * @param router express router
   */
  const handleMapiProxy = (router: express.Router) => {
    router.use(parser.urlencoded({ extended: true }));
    router.use(parser.json({limit: '50mb'}));
    const proxyOptions = function(endpoint, mapiPrefix = undefined) {
      return {
        https: true,
        proxyReqPathResolver: function(req) {
          return new Promise(function (resolve, reject) {
            const urlParts = url.parse(endpoint.url);
            let resolvedPathValue = urlJoin(urlParts.path, req.path);
            // Add an extra prefix
            if (mapiPrefix) {
              resolvedPathValue = urlJoin(urlParts.path, mapiPrefix, req.path);
            }
            logger.info('mapi_proxy', { endpoint: endpoint, requestPath: resolvedPathValue});
            resolve(resolvedPathValue);
          });
        },
        proxyErrorHandler: function(err, res, next) {
          logger.error('mapi_proxy', { handler: 'proxyErrorHandler', error: err.toString(), stack: err.stack});
          next(err);
        },
        userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
          let saveProxyRequestResponse = Container.get(SaveProxyRequestResponse);
          await saveProxyRequestResponse.run({
            userReq: userReq,
            proxyRes: proxyRes,
            proxyResData: proxyResData,
            miner: endpoint.name,
          });
          return proxyResData;
        }
      };
    };
    // Create a default /mapi route for the first merchantapi (for now)
    router.use('/mapi', proxy(Config.merchantapi.endpoints[0].url, proxyOptions(Config.merchantapi.endpoints[0], '/mapi')));
    // Create /merchantapi/mapi routes by miner index and miner name
    let i = 0;
    for (const endpoint of Config.merchantapi.endpoints) {
      router.use('/merchantapi/' + endpoint.name, proxy(endpoint.url, proxyOptions(endpoint)));
      router.use('/merchantapi/' + i, proxy(endpoint.url, proxyOptions(endpoint)));
      i++;
    }
  };

  if (Config.merchantapi.enableProxy) {
    handleMapiProxy(app);
  }

  await middlewareLoader(app);

  let server = createServer(app);

  app.get('/', function(req, res) {
    res.json({
      txq: 'hello'
    })
  });

  server.listen(Config.api.port);

  process.on('unhandledRejection', handleExceptions);
  process.on('uncaughtException', handleExceptions);
  process.on('SIGINT', handleServerExit('SIGINT', server));
  process.on('SIGTERM', handleServerExit('SIGTERM', server));
}
startServer();

/**
 * Check ever N minutes for jobs that are in DB in 'pending' that may need to be enqueued
 */
async function startPendingTaskPoller() {
  let enqInitialTxsForSync = Container.get(EnqInitialTxsForSync);
  enqInitialTxsForSync.run();
}

setInterval(() => {
  startPendingTaskPoller();
}, Config.queue.abandonedSyncTaskRescanSeconds * 1000);

startPendingTaskPoller();

