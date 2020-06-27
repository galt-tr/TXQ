import TxRoute from './v1/tx/index';
import QueueRoute from './v1/queue/index';
import TxoutRoute from './v1/txout/index';
import ChannelRoute from './v1/channel/index';
import SSERoute from './v1/sse/index';
export default [...TxRoute, ...QueueRoute, ...TxoutRoute, ...ChannelRoute, ...SSERoute];
