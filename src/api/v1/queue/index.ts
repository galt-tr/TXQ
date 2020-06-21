import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { path } from './../index';
import GetTxsDlq from '../../../services/use_cases/tx/GetTxsDlq';
import GetQueueStats from '../../../services/use_cases/queue/GetQueueStats';
import ResyncTx from '../../../services/use_cases/queue/ResyncTx';
import { sendResponseWrapper } from '../../../util/sendResponseWrapper';

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
    path: `${path}/queue/:txid/resync`,
    method: 'post',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let resyncTx = Container.get(ResyncTx);
          const data = await resyncTx.run({txid: Req.params.txid});
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  }
];
