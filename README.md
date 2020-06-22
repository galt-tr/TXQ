# TXQ: Bitcoin Transaction Storage Queue Service
>
><a href='https://matterpool.io'>matterpool.io</a>

## Motivation

In order for Bitcoin SV apps to scale efficiently as traditional web services, apps must communicate directly with each other where possible and not rely on extra intermediaries.

Not all Bitcoin miners or transaction processors will maintain a full transaction index for public consumption. Some will instead opt to run so called "transaction prunning" nodes and instead specialize in other ways than offering data storage and indexing services.

TXQ decouples you from miners and any single service provider.

It's easy and extremely cost effective for services to simply index their own Bitcoin transactions and have the "single source of truth" be ready at hand and according to their backup needs.

TXQ makes it easy for developers to keep their entire application transaction history in their direct control or even on premise.
At the same time, transaction sending is now "fire and forget" annd synchronization with miners happens automatically via Merchant API.

## At a glance...

- Complete transaction storage engine (self-hosted)
- Automatic Merchant API (mapi) sending queue
- Search UTXO by address, scripthash, txoutput,
- Address and scripthash history
- Forward-Spend Indexes (For NFT colored coins implementations)

**Enterprise ready:**

Relational Database (Postgres)
    - Using as ACID compliant *"NoSQL"* (join-less) datastore and leveraging `jsonb`
    - Powerful custom indexes for precisely what your service requires.

REST API and Real-time Sockets
    - TXQ exposes a simple, yet powerful API for storing, sending and streaming transactions to peers
    - Server-Sent Events (SSE)

Open Source and Schema
    - MIT License
    - Domain Driven Design Architecture (Use Cases)
    - Simple and extendible open SQL database schema

## Why use TXQ?

**tl;dr 1:** Sending transactions is now "fire and forget". The concurrent work queue handles retries and backoffs automatically to miners.

**tl;dr 2:** TXQ gives Bitcoin developers complete control over their application transaction data, UTXOs.

Up until now, Bitcoin SV "apps" relied on miners and blockchain cloudhosting services to get UTXO and transaction data. TXQ means app developers do not need to rely on 3rd parties for UTXO and transaction data &mdash; as long as all transactions of interest are saved to TXQ. That's it.

In order for Bitcoin SV applications to be able to scale as efficiently as traditional web services, the applications must be able to interoperate peer-to-peer and not rely on extra intermediaries.

To scale, Bitcoin applications must act more like peers and use the `rawtx` format as the **application data medium of exchange**.  Each service provider will maintain a copy of the `rawtx` for all transactions in traditional storage and backed up to their policy.

TXQ abstracts the transaction settlement process with miners so developers focus on building and integrating your applications.

## Features

#### Single Source of Truth

Provide your application and services with a consistent picture of it's "Bitcoin State" without relying on 3rd parties for lookups and indexing.

#### Merchant API Work Queue

Reliably broadcast transactions to a set of miners to get them reliably settled. Configuration options allow customizing the concurrency limit, exponential back off, and other behaviors.

All Merchant API requests are logged to the database and also streamed in real-time to the SSE event interface.

#### UTXO and Transaction Indexing

TXQ automatically stores and indexes UTXOs and transactions without relying on miners and cloud providers.

## REST API Docs

`todo: see src/api/*`

## Server Sent Events (SSE)

`todo: see src/api/*`

## Installation

Requirements:
- Node 10.19+
- Postgres 10.6+

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
npm run build
```

```
node ./dist/bootstrap/index.js
```

## To Run the application in development mode

```
npm run start-dev
```

## To Run the tests

```
yarn jest
```


## Resources

<a href='https://developers.matterpool.io'>MATTERPOOL DEVELOPER DOCUMENTATION</a>
