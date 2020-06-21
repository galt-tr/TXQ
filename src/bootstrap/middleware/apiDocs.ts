import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
//import * as swaggerDocument from '../../util/swagger.json';
import * as swaggerJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    // Like the one described here: https://swagger.io/specification/#infoObject
    info: {
      title: 'API Documentation',
      version: '0.0.1',
      description: "Documentation to check & verify the api's",
    },
    host: 'localhost:3000',
    basePath: '/api/v1/tx/{txid}',
    tags: [
      {
        name: 'transaction',
        description: 'Get transaction status',
      },
    ],
    schemes: {
      http: 'http',
    },
  },
  // List of files to be processes. You can also set globs './routes/*.js'
  apis: ['src/api/v1/*/*.ts'],
};

const specs = swaggerJsdoc(options);

const handleAPIDocs = (router: Router) => {
  router.use('/api-docs', swaggerUi.serve);
  router.get('/api-docs', swaggerUi.setup(specs));
};

export default [handleAPIDocs];
