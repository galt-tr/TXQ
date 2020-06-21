import { Service, Inject } from 'typedi';
import * as bsv from 'bsv';
@Service('txinService')
export default class TxinService {
  constructor(@Inject('txinModel') private txinModel, @Inject('logger') private logger) {}
  public async saveTxins(tx: bsv.Transaction) {
    let i = 0;
    for (const input of tx.inputs) {
      const prevTxId = input.prevTxId.toString('hex');
      const outputIndex = input.outputIndex;
      const unlockScript = input.script.toBuffer().toString('hex');
      await this.txinModel.save(
        tx.hash, i, prevTxId, outputIndex, unlockScript
      );
      i++;
    }
  }
}
