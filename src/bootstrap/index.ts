import 'reflect-metadata';
//import 'module-alias/register';
import { createServer } from 'http';
import * as SetTimeZone from 'set-tz';
import { handleServerExit, handleExceptions } from './middleware/errorMiddleware';
import { Container } from 'typedi';
import Config from './../cfg';

import "../services/tx/index";
import "../services/txsync/index";
import "../services/txout/index";
import "../services/txmeta/index";
import "../services/txin/index";
import "../services/queue/index";
import "../services/merchantapilog/index";
import "../services/spend/index";
import "../services/event/index";
import "../services/txoutgroup/index";
import "../services/updatelog/index";

import "../services/helpers/MerchantRequestor";

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
import "../services/use_cases/spends/GetTxoutsByGroup";
import "../services/use_cases/spends/GetUtxosByGroup";
import "../services/use_cases/spends/GetTxoutsByOutpointArray";
import "../services/use_cases/spends/GetBalanceByAddresses";
import "../services/use_cases/spends/GetBalanceByScriptHashes";
import "../services/use_cases/spends/GetBalanceByGroup";
import "../services/use_cases/events/ConnectChannelClientSSE";
import "../services/use_cases/txoutgroup/GetTxoutgroupByName";
import "../services/use_cases/txoutgroup/AddGroupScriptIds";
import "../services/use_cases/txoutgroup/DeleteGroupScriptIds";

SetTimeZone('UTC');

import EnqInitialTxsForSync from '../services/use_cases/tx/EnqInitialTxsForSync';
import { createExpress } from './express-factory';

async function startServer() {
  let app = await createExpress();
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
  return app;
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



