export class BitcoinRegex {
    static TXID_REGEX = new RegExp('^[0-9a-fA-F]{64}$');
    static BLOCKHASH_REGEX = new RegExp('^[0-9a-fA-F]{64}$');
    static SCRIPTHASH_REGEX = new RegExp('^[0-9a-fA-F]{64}$');
    static TXOUT_REGEX = new RegExp(/^[0-9a-fA-F]{64}\-\d+$/);
    static ADDRESS_REGEX = new RegExp(/^[135mn][1-9A-Za-z][^OIl]{20,40}/);
}
