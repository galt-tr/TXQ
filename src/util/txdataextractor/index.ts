import * as bsv from 'bsv';
import { resolveB } from './bprotocol';
export const txDataExtractor = (tx: bsv.Transaction) => {
    try {
      const resultData = resolveB(tx);
      if (resultData) {
        return {
          ...resultData,
          protocols: {
            '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut': {}
          },
        };
        // file_url: `https://media.bitcoinfiles.org/${tx.txid}`,
        // rawtx_url: `https://media.bitcoinfiles.org/rawtx/${tx.txid}`,
        // tx_url: `https://media.bitcoinfiles.org/tx/59e147f17e1457796635102e2e1af07b9f4f4cdb7d325392084535f8a56a8f47?includeBlock=0`
      }
    } catch(err) {
    }
    return {};
};
