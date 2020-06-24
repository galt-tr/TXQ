import cfg from './../../../cfg';
import { createPool, sql } from 'slonik';

const config = {
  host: cfg.db.host,
  user: cfg.db.user, //this is the db user credential
  database: cfg.db.database,
  password: cfg.db.password,
  port: cfg.db.port,
  max: cfg.db.max, // max number of clients in the pool
  idleTimeoutMillis: cfg.db.idleTimeoutMillis,
};

const interceptors = cfg.interceptors;

let pool
const url = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
try {
  pool = createPool(
    url,
    {
      interceptors,
    },
  );

  pool.stream(sql`SELECT version()`, (stream) => {
    stream.on('data', (datum) => {
      datum;
      // {
      //   fields: [
      //     {
      //       name: 'foo',
      //       dataTypeId: 23,
      //     }
      //   ],
      //   row: {
      //     foo: 'bar'
      //   }
      // }
    });
  });
} catch (error) {
  console.log('slonik', error);
}
export default pool;
