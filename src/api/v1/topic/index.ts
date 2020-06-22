import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { path } from './../index';
import { sendResponseWrapper } from '../../../util/sendResponseWrapper';
import GetTxsByChannel from '../../../services/use_cases/tx/GetTxsByChannel';
import ResourceNotFoundError from '../../../services/error/ResourceNotFoundError';
import { sendErrorWrapper } from '../../../util/sendErrorWrapper';

export default [
  {
    path: `${path}/topic`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxsByChannel = Container.get(GetTxsByChannel);
          let data = await getTxsByChannel.run({
            channel: '',
            offset: Req.query.offset ? Req.query.offset : 0,
            rawtx: Req.query.rawtx === '1' ? true : false
          });
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          if (error instanceof ResourceNotFoundError) {
            sendErrorWrapper(res, 404, error.toString());
            return;
          }
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/topic/:channel`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxsByChannel = Container.get(GetTxsByChannel);
          let data = await getTxsByChannel.run({
            channel: Req.params.channel,
            offset: Req.query.offset ? Req.query.offset : 0,
            rawtx: Req.query.rawtx === '1' ? true : false
          });
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          if (error instanceof ResourceNotFoundError) {
            sendErrorWrapper(res, 404, error.toString());
            return;
          }
          next(error);
        }
      },
    ],
  },
];
