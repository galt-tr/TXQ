import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { path } from '../index';
import GetTxout from '../../../services/use_cases/spends/GetTxout';
import GetTxoutsByScriptHash from '../../../services/use_cases/spends/GetTxoutsByScriptHash';
import GetTxoutsByAddress from '../../../services/use_cases/spends/GetTxoutsByAddress';
import GetUtxosByAddress from '../../../services/use_cases/spends/GetUtxosByAddress';
import GetUtxosByScriptHash from '../../../services/use_cases/spends/GetUtxosByScriptHash';
import ResourceNotFoundError from '../../../services/error/ResourceNotFoundError';
import { sendResponseWrapper } from '../../../util/sendResponseWrapper';
import { sendErrorWrapper } from '../../../util/sendErrorWrapper';
import GetTxoutsByOutpointArray from '../../../services/use_cases/spends/GetTxoutsByOutpointArray';
import GetTxoutgroupByName from '../../../services/use_cases/txoutgroup/GetTxoutgroupByName';
import AddGroupScriptIds from '../../../services/use_cases/txoutgroup/AddGroupScriptIds';
import DeleteGroupScriptIds from '../../../services/use_cases/txoutgroup/DeleteGroupScriptIds';

export default [
  {
    path: `${path}/txoutgroup/:groupname`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let uc = Container.get(GetTxoutgroupByName);
          let data = await uc.run({
            groupname: Req.params.groupname,
            offset: Req.params.offset ? Req.params.offset : 0,
            limit: Req.params.limit ? Req.params.limit : 10000,
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
    path: `${path}/txoutgroup/:groupname`,
    method: 'post',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let uc = Container.get(AddGroupScriptIds);
          let data = await uc.run({
            groupname: Req.params.groupname,
            scriptids: Req.body.scriptids
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
    path: `${path}/txoutgroup/:groupname`,
    method: 'delete',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let uc = Container.get(DeleteGroupScriptIds);
          let data = await uc.run({
            groupname: Req.params.groupname,
            scriptids: Req.body.scriptids
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
