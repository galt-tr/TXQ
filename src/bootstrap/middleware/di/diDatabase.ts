import cfg from './../../../cfg';
import { createPool, SlonikError, sql } from 'slonik';
import { Logger } from 'winston';
import Container from 'typedi';

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

  /*console.log('pool-------------', url, pool);

  pool.stream((s) => {
    s.on('connect', () => {
      console.log('errr');
    });
    s.on('data', () => {
      console.log('data');
    });
  });
  console.log('poool', pool);*/
} catch (error) {
  console.log('slonik', error);
}

/*
pool.stream.on('connect', () => {
  console.log('connected to the Database');
});

pool.stream.on('error', function(err, client) {
  console.error('idle client error', err.message, err.stack);
  if (err) {
    const logger: Logger = Container.get('logger');
    logger.error('500', {
      method: '',
      url: '',
      query: '',
      ip: '',
      error: err.message,
      stack: err.stack,
    });
  }
});
*/
export default pool;
