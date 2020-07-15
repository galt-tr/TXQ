import { Request } from "express";
import { IMerchantApiEndpointConfig, IMerchantApiEndpointGroupConfig } from "@interfaces/IConfig";

export class MerchantEndpointNetworkSelector {
    static selectEndpoints(endpointConfig: IMerchantApiEndpointGroupConfig, network?: string): IMerchantApiEndpointConfig[] {
      if (/testnet/i.test(network)) {
        return endpointConfig.testnet;
      }
      if (/livenet/i.test(network)) {
        return endpointConfig.livenet;
      }
      return endpointConfig.livenet;
    }
}