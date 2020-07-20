import { IConfig } from '@interfaces/IConfig';

const config: IConfig = {
    db: {
        host: 'localhost',
        user: 'postgres',
        database: 'txq_test',
        password: 'postgres',
        port: 5432,
        max: 3,
        idleTimeoutMillis: 3000
    },
};
export default config;
