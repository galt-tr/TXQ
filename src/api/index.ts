import TxRoute from './v1/tx/index';
import QueueRoute from './v1/queue/index';
import TxoutRoute from './v1/txout/index';
import TopicRoute from './v1/topic/index';

export default [...TxRoute, ...QueueRoute, ...TxoutRoute, ...TopicRoute];
