import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { path } from './../index';
import GetQueueStats from '../../../services/use_cases/queue/GetQueueStats';
import { sendResponseWrapper } from '../../../util/sendResponseWrapper';
import GetTxsDlq from '../../../services/use_cases/queue/GetTxsDlq';
import GetTxsPending from '../../../services/use_cases/queue/GetTxsPending';
import GetTxsBySyncState from '../../../services/use_cases/queue/GetTxsBySyncState';

export default [
  {
    path: `${path}/queue/stats`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getQueueStats = Container.get(GetQueueStats);
          const data = await getQueueStats.run();
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/queue/dlq`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxsDlq = Container.get(GetTxsDlq);
          const data = await getTxsDlq.run({dlq: null});
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/queue/dlq/:dlq`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxsDlq = Container.get(GetTxsDlq);
          const data = await getTxsDlq.run({dlq: Req.params.dlq});
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/queue/sync/:syncState`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxsBySyncState = Container.get(GetTxsBySyncState);
          const data = await getTxsBySyncState.run({
            limit: Req.query.limit ? Req.query.limit : 10000,
            offset: Req.query.offset ? Req.query.offset : 0,
            syncState: Req.params.syncState ? Req.params.syncState : 'pending',
          });
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },
];
