import TxRoute from './v1/tx/index';
import QueueRoute from './v1/queue/index';
import OutputRoute from './v1/output/index';
import PostsRoute from './v1/posts/index';

export default [...TxRoute, ...QueueRoute, ...OutputRoute, ...PostsRoute];
