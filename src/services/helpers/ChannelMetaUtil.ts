import { Request } from "express";

export class ChannelMetaUtil {
    static getChannnelMeta(userReq: Request): { channel: string, metadata: any, tags: any } {
        let channel = undefined;
        let metadata = undefined;
        let tags = undefined;
        if (userReq.headers && userReq.headers.channel) {
          channel = userReq.headers.channel
        }
        if (userReq.headers && userReq.headers.metadata) {
          try {
            let tmpMetadata: any = userReq.headers.metadata;
            metadata = JSON.parse(tmpMetadata);
          } catch (ex) {
          }
        }
        if (userReq.headers && userReq.headers.tags) {
          try {
            let tmpTags: any = userReq.headers.tags;
            tags = JSON.parse(tmpTags);
          } catch (ex) {
          }
        }
        return {
          channel,
          metadata,
          tags
        };
    }
}