# TXQ: Bitcoin Transaction Storage Queue Service
> Created by  <a href='https://matterpool.io'>matterpool.io</a>

## Installation

Requirements:
- Node 12+
- Postgres 9.6+

[NodeJS](https://nodejs.org/en/)

Install global TypeScript and TypeScript Node

```
npm install -g typescript ts-node
```

## Database

Initial Schema:

`src/database/202006130000-init-schema.sql`

Migrations:

- None

## Configuration

See `cfg/index.ts` for available options.

```javascript
{
    // ...
    queue: {
        jitter: 'none',                         // 'full' or 'none'
        timeMultiple: 2,                        // Exponential back off multiple
        concurrency: 3,                         // Max number of concurrent requests to sync tx status from merchantapi
        startingDelay: 1000 * 60,               // Initial start delay before first re-check
        maxDelay: 1000 * 60 * 10,               // Max back off time. 10 Minutes is max
        numOfAttempts: 15,                      // Max attempts before being put into 'dlq'
        checkPendingTimeSec: 60                 // How many seconds to rescan for missed tasks
    },
    merchantapi: {
        response_logging: true,                             // Whether to log every request and response from merchantapi's
        endpoints: [
            {
                name: 'matterpool',
                url: 'https://merchantapi.mattterpool.io'
            },
            {
                name: 'mempool',
                url: 'https://merchantapi.mempool.com'
            },
            {
                name: 'taal',
                url: 'https://merchantapi.taal.com'
            }
        ]
    },

    //...
```

## Clone this repository

```
npm install
```

## To Run the application in production mode

Install with systemd.txq.service and build:

```
yarn start build
```

```
yarn start-prod
```

## To Run the application in development mode

```
yarn start-dev
```

## To Run the tests

```
yarn jest
```
