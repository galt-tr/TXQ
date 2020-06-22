# TXQ: Bitcoin Transaction Storage Queue Service
> Self-hosted Bitcoin BSV transaction storage and UTXO indexer for developers.
>
> LICENSE: MIT
>
> <a href='https://matterpool.io'>matterpool.io</a>

#### LIVE OPEN PUBLIC SERVER: <a target="_blank" href='https://txq.matterpool.io/api/v1/tx/dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293?pretty=1'>TXQ.MATTERPOOL.IO
</a>


- [TXQ: Bitcoin Transaction Storage Queue Service](#txq--bitcoin-transaction-storage-queue-service)
      - [LIVE OPEN PUBLIC SERVER: <a target="_blank" href='https://txq.matterpool.io/api/v1/tx/dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293?pretty=1'>TXQ.MATTERPOOL.IO](#live-open-public-server---a-target---blank--href--https---txqmatterpoolio-api-v1-tx-dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293-pretty-1--txqmatterpoolio)
  * [Motivation](#motivation)
  * [Installation & Getting Started](#installation---getting-started)
  * [Database](#database)
  * [Configuration](#configuration)
  * [At a glance...](#at-a-glance)
  * [Why use TXQ?](#why-use-txq-)
  * [Features](#features)
    + [Single Source of Truth](#single-source-of-truth)
    + [Automatically Sync with Miners (Merchant API)](#automatically-sync-with-miners--merchant-api-)
    + [Self-Managed UTXO and Transaction Indexing](#self-managed-utxo-and-transaction-indexing)
    + [Publish and Subscribe Server Sent Events (SSE)](#publish-and-subscribe-server-sent-events--sse-)
  * [REST API Documentation](#rest-api-documentation)
    + [Submit Transaction](#submit-transaction)
    + [Get Transaction Status](#get-transaction-status)
    + [Get Transaction Status With Topic Metadata](#get-transaction-status-with-topic-metadata)
    + [Get Transactions for Default (null) Topic](#get-transactions-for-default--null--topic)
    + [Get Transactions for Channel Topic](#get-transactions-for-channel-topic)
    + [Get Outpoint Spend Status](#get-outpoint-spend-status)
    + [Get Address Outputs](#get-address-outputs)
    + [Get Address Unspent Outputs (UTXO)](#get-address-unspent-outputs--utxo-)
    + [Get Scripthash Outputs](#get-scripthash-outputs)
    + [Get Scripthash Unspent Outputs (UTXO)](#get-scripthash-unspent-outputs--utxo-)
    + [Get Queue Stats](#get-queue-stats)
    + [Get Dead-Letter Transactions Queue](#get-dead-letter-transactions-queue)
    + [Force Resync of Transaction](#force-resync-of-transaction)
  * [Server Sent Events (SSE) - COMING SOON!](#server-sent-events--sse----coming-soon-)
  * [Additional Resources](#additional-resources)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>


![TXQ](https://github.com/MatterPool/TXQ/blob/master/preview.png "Bitcoin Transaction Storage Queue Service")

## Motivation

In order for Bitcoin SV apps to scale efficiently as traditional web services, apps must communicate directly with each other where possible and not rely on extra intermediaries.

Not all Bitcoin miners or transaction processors will maintain a full transaction index for public consumption. Some will instead opt to run so called "transaction prunning" nodes and instead specialize in other ways than offering data storage and indexing services.

**TXQ decouples your application from miners and other Bitcoin service providers.**

It's easy and extremely cost effective for services to simply index their own Bitcoin transactions and have the "single source of truth" be ready at hand and according to their backup needs.

TXQ makes it easy for developers to keep their entire application transaction history in their direct control or even on premise.
At the same time, transaction sending is now "fire and forget" annd synchronization with miners happens automatically via Merchant API.


## Installation & Getting Started

Requirements:
- Node 10.19+
- Postgres 10.6+

[NodeJS](https://nodejs.org/en/)

Install global TypeScript and TypeScript Node

```
npm install -g typescript ts-node
```

**Setup and Run**

Copy `.env.example` to `.env` for productionn environment. See database instructions below.

Install deps:

```
npm install
```

Developer testing:
```
npm run start-dev
```

Production build:

```
npm run build
```

Production run:
```
node ./dist/bootstrap/index.js
```

Testing:
```
jest
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



## At a glance...

![TXQ architecture](https://github.com/MatterPool/TXQ/blob/master/TXQ.png "Bitcoin Transaction Storage Queue Service")

- Complete transaction storage engine (self-hosted)
- Automatic Merchant API (mapi) sending queue
- Search UTXO by address, scripthash, txoutput,
- Address and scripthash history
- Forward-Spend Indexes (For NFT colored coins implementations)

*Enterprise ready*

**Relational Database (Postgres)**
- Using as **ACID compliant "NoSQL" (join-less)** datastore and leveraging `jsonb`
- Powerful custom indexes for precisely what your service requires.

**Easy to integrate API and Real-time Sockets**
- TXQ exposes a simple, yet powerful API for storing, sending and streaming transactions to peers
- Server-Sent Events (SSE) - Cominng soon!

**Open Source and Schema**
- MIT License
- Domain Driven Design Architecture (Use Cases)
- Simple and extendible open SQL database schema

**Enterprise and Paid Hosting**
- <a href='https://matterpool.io'>matterpool.io</a>
- <a href='mailto:attila@matterpool.io?subject=TXQ'>Email Us</a>

## Why use TXQ?

>**tl;dr 1:** Sending transactions is now "fire and forget". The concurrent work queue handles retries and backoffs automatically to miners.

>**tl;dr 2:** TXQ gives Bitcoin developers complete control over their application transaction data, UTXOs.

Up until now, Bitcoin SV "apps" relied on miners and blockchain cloudhosting services to get UTXO and transaction data. TXQ means app developers do not need to rely on 3rd parties for UTXO and transaction data &mdash; as long as all transactions of interest are saved to TXQ. That's it.

In order for Bitcoin SV applications to be able to scale as efficiently as traditional web services, the applications must be able to interoperate peer-to-peer and not rely on extra intermediaries.

To scale, Bitcoin applications must act more like peers and use the `rawtx` format as the **application data medium of exchange**.  Each service provider will maintain a copy of the `rawtx` for all transactions in traditional storage and backed up to their policy.

TXQ abstracts the transaction settlement process with miners so developers focus on building and integrating your applications.

## Features

### Single Source of Truth

Provide your application and services with a consistent picture of it's "Bitcoin State" without relying on 3rd parties for lookups and indexing.

### Automatically Sync with Miners (Merchant API)

Reliably broadcast transactions to a set of miners to get them reliably settled. Queue configuration options allow customizing the concurrency limit, exponential back off, and other behaviors.

All Merchant API requests are logged to the database and also streamed in real-time to the SSE event interface.

### Self-Managed UTXO and Transaction Indexing

TXQ automatically stores and indexes UTXOs and transactions without relying on miners and cloud providers.
Your businness always has transaction history and UTXOs ready-at-hand and can easily scale with no miner or vendor lock-in.

### Publish and Subscribe Server Sent Events (SSE)

Easily connect TXQ with your other services via SSE sockets for subscribing to new transactions and events in real-time.

## REST API Documentation

Try it at: `https://txq.matterpool.io`

Example:

<a href='https://txq.matterpool.io/api/v1/tx/dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293?pretty=1'>https://txq.matterpool.io/api/v1/tx/dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293?pretty=1</a>


### Submit Transaction

Save a transaction and/or txid, attaching optional metadata. The txid must match the rawtx's txid.

`POST /api/v1/tx`

```javascript

//Request:
// Note: you can set multiple transactions in a single call
{
   "channel": null, // Optional channel queue name
   "set":{
      "94aaa2f1a7e0042ba19fbb8bb87be87ecb8d025aa88844b8bea85eb7cb2d678d":{
        "rawtx": "0100000002af6d598d7ee12bec6b20e460e97b99d048ea6c73bab291827e42dd99ba34704d020000006a47304402203b9b01392167dfd15259d5f7782521852809a384b30f44b8009fa516a4e76fe0022006cbae89516bdb5a3c135aefaf29cdfa7545b5f2ea9d6394e8689735a040d575412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffffaf6d598d7ee12bec6b20e460e97b99d048ea6c73bab291827e42dd99ba34704d010000006b483045022100bb1c98453c2ea76eee6ee17a1961a9b8b418d1a0a0ee4b1c8b19d7f45d4bba9a02201a7d259ff8203c357ba5dcdb5141f9fd2b35f167429e556c6ea90cf8d534928a412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffff02000000000000000019006a026d0213706f73746420746f206d6465646464646d6f21089d0000000000001976a914161e9c31fbec37d9ecb297bf4b814c6e189dbe5288ac00000000",
         "metadata":{
            "title":"some title",
            "content":"any content",
            "url":"https://www.nintendo.com",
            "image":"",
            "description":"DOOOOOO"
         },
         "tags":[ "bitcoin", "bsv"]
      }
   }
}

// Response:
// Note: you can set multiple transactions in a single call
{
    "status": 200,
    "errors": [],
    "result": [
        "94aaa2f1a7e0042ba19fbb8bb87be87ecb8d025aa88844b8bea85eb7cb2d678d"
    ]
}
```

### Get Transaction Status

`GET /api/v1/tx/94aaa2f1a7e0042ba19fbb8bb87be87ecb8d025aa88844b8bea85eb7cb2d678d`

Retrieve the transaction status and metadata for the `null` default topic. `complete` will be set to `true` when the transaction is confirmed.


```javascript

// Response:
{
  "status": 200,
  "errors": [],
  "result": {
    "txid": "94aaa2f1a7e0042ba19fbb8bb87be87ecb8d025aa88844b8bea85eb7cb2d678d",
    "rawtx": "0100000002af6d598d7ee12bec6b20e460e97b99d048ea6c73bab291827e42dd99ba34704d020000006a47304402203b9b01392167dfd15259d5f7782521852809a384b30f44b8009fa516a4e76fe0022006cbae89516bdb5a3c135aefaf29cdfa7545b5f2ea9d6394e8689735a040d575412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffffaf6d598d7ee12bec6b20e460e97b99d048ea6c73bab291827e42dd99ba34704d010000006b483045022100bb1c98453c2ea76eee6ee17a1961a9b8b418d1a0a0ee4b1c8b19d7f45d4bba9a02201a7d259ff8203c357ba5dcdb5141f9fd2b35f167429e556c6ea90cf8d534928a412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffff02000000000000000019006a026d0213706f73746420746f206d6465646464646d6f21089d0000000000001976a914161e9c31fbec37d9ecb297bf4b814c6e189dbe5288ac00000000",
    "h": "00000000000000000324d7ada9f810f08b254dffce4786bc4cf30374ee23a4db",
    "i": 640259,
    "send": null,
    "status": {
      "valid": true,
      "payload": {
        "minerId": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
        "blockHash": "00000000000000000324d7ada9f810f08b254dffce4786bc4cf30374ee23a4db",
        "timestamp": "2020-06-21T01:02:42.952Z",
        "apiVersion": "0.1.0",
        "blockHeight": 640259,
        "returnResult": "success",
        "confirmations": 25,
        "resultDescription": "",
        "txSecondMempoolExpiry": 0
      },
      "encoding": "UTF-8",
      "mimetype": "application/json",
      "publicKey": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
      "signature": "30440220281148a447cf041fcebfeba8bba0ad022299d321a6dc7641b3ad54239f505eaf02207cffd042ebb18285e7160429fe51fb9bcac005b04469877248afdc509e41de61"
    },
    "completed": true,
    "updated_at": 1592765256,
    "created_at": 1592697895,
    "channel": "",
    "metadata":{
        "title":"some title",
        "content":"any content",
        "url":"https://www.nintendo.com",
        "image":"",
        "description":"DOOOOOO"
    },
    "tags":[ "bitcoin", "bsv"]
    "extracted": {}
  }
}
```

### Get Transaction Status With Topic Metadata

`GET /api/v1/tx/94aaa2f1a7e0042ba19fbb8bb87be87ecb8d025aa88844b8bea85eb7cb2d678d/topic/somechanneltopic`

Retrieve the transaction status and metadata for the `somechanneltopic` default topic. `complete` will be set to `true` when the transaction is confirmed.

```javascript

// Response:
{
  "status": 200,
  "errors": [],
  "result": {
    "txid": "94aaa2f1a7e0042ba19fbb8bb87be87ecb8d025aa88844b8bea85eb7cb2d678d",
    "rawtx": "0100000002af6d598d7ee12bec6b20e460e97b99d048ea6c73bab291827e42dd99ba34704d020000006a47304402203b9b01392167dfd15259d5f7782521852809a384b30f44b8009fa516a4e76fe0022006cbae89516bdb5a3c135aefaf29cdfa7545b5f2ea9d6394e8689735a040d575412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffffaf6d598d7ee12bec6b20e460e97b99d048ea6c73bab291827e42dd99ba34704d010000006b483045022100bb1c98453c2ea76eee6ee17a1961a9b8b418d1a0a0ee4b1c8b19d7f45d4bba9a02201a7d259ff8203c357ba5dcdb5141f9fd2b35f167429e556c6ea90cf8d534928a412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffff02000000000000000019006a026d0213706f73746420746f206d6465646464646d6f21089d0000000000001976a914161e9c31fbec37d9ecb297bf4b814c6e189dbe5288ac00000000",
    "h": "00000000000000000324d7ada9f810f08b254dffce4786bc4cf30374ee23a4db",
    "i": 640259,
    "send": null,
    "status": {
      "valid": true,
      "payload": {
        "minerId": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
        "blockHash": "00000000000000000324d7ada9f810f08b254dffce4786bc4cf30374ee23a4db",
        "timestamp": "2020-06-21T01:02:42.952Z",
        "apiVersion": "0.1.0",
        "blockHeight": 640259,
        "returnResult": "success",
        "confirmations": 25,
        "resultDescription": "",
        "txSecondMempoolExpiry": 0
      },
      "encoding": "UTF-8",
      "mimetype": "application/json",
      "publicKey": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
      "signature": "30440220281148a447cf041fcebfeba8bba0ad022299d321a6dc7641b3ad54239f505eaf02207cffd042ebb18285e7160429fe51fb9bcac005b04469877248afdc509e41de61"
    },
    "completed": true,
    "updated_at": 1592765256,
    "created_at": 1592697895,
    "channel": "",
    "metadata":{
        "title":"some title",
        "content":"any content",
        "url":"https://www.nintendo.com",
        "image":"",
        "description":"DOOOOOO"
    },
    "tags":[ "bitcoin", "bsv"]
    "extracted": {}
  }
}
```

### Get Transactions for Default (null) Topic

`GET /api/v1/queue?pretty=1&rawtx=1&offset=0`

Retrieve the transactions from most recently added in the default `null` channel queue

```javascript

// Response:
{
  "status": 200,
  "errors": [],
  "result": [
    {
      "txid": "4d7034ba99dd427e8291b2ba736cea48d0997be960e4206bec2be17e8d596daf",
      "i": 640259,
      "h": "00000000000000000324d7ada9f810f08b254dffce4786bc4cf30374ee23a4db",
      "rawtx": "0100000001f743dd880dde880b0e5baf3403352c25005ad94fcafc79abc35d2ee52a212bd4020000006b483045022100aff74f1335bbc691cc62c7405a77c09744626363397dc47cfe97e235e5a0143102203357855791f03b4ae3332808f9964af8f24e0b63e7bd32f6788f77e2d2da7b50412102119ebe4639964590bcf358539740f8ea4b6546b8416cbbbf6de12fafd3a13d1affffffff03000000000000000019006a026d0213706f73746420746f206d6465646464646d6f2168100000000000001976a914161e9c31fbec37d9ecb297bf4b814c6e189dbe5288acc58d0000000000001976a914161e9c31fbec37d9ecb297bf4b814c6e189dbe5288ac00000000",
      "send": null,
      "status": {
        "valid": true,
        "payload": {
          "minerId": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
          "blockHash": "00000000000000000324d7ada9f810f08b254dffce4786bc4cf30374ee23a4db",
          "timestamp": "2020-06-21T01:02:41.139Z",
          "apiVersion": "0.1.0",
          "blockHeight": 640259,
          "returnResult": "success",
          "confirmations": 25,
          "resultDescription": "",
          "txSecondMempoolExpiry": 0
        },
        "encoding": "UTF-8",
        "mimetype": "application/json",
        "publicKey": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
        "signature": "304402204e4d4d8e03182a80608f7a583db008a783d40895a67339e3576b9abf09e6992c022047b5eb1de9103ed628f4accfce632755921527f3306831d346f0936c5fcd6026"
      },
      "completed": true,
      "updated_at": 1592701751,
      "created_at": 1592701361,
      "channel": "",
      "metadata": {
        "url": "url",
        "image": "adfsfsdfsdfdf",
        "title": "abc",
        "content": "content123",
        "description": "DOOOOOO"
      },
      "tags": [
        "ckitty",
        "cat"
      ],
      "extracted": {}
    }
  ]
}
```

### Get Transactions for Channel Topic

`GET /api/v1/topic/:channel?pretty=1&rawtx=1&offset=0`

Retrieve the transactions from most recently added in the default `null` channel queue


```javascript

// Response:
{
  "status": 200,
  "errors": [],
  "result": [
    {
      "txid": "dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293",
      "i": 640464,
      "h": "000000000000000000e3564e4a8d9be13fb24cb21d546cb999d514c650c3b2dc",
      "rawtx": "0200000003c3be676ae826227bcff47e605bdffff85c4aa42e3c868e4dfad9a97e2244aef5000000006a4730440220692e3f1fb99e26e494c8e446621584564e67e1388b06e7be769f3adde6b5c3c60220148e97efbc41dda03d80de2249be68c332b12ff7148e61847a72e93eee2e06864121037e7bcc2cdc24646fd8e320c74f156367027c1b67564c0dee420262eca71fca56feffffffd8fa56930181c8431c4d7d503d8b5d5948f22e4c9311d3fb19847b2318dd227d010000006b483045022100f5b8bf9905e5ec051573fd522c522295a5944e460255869dba427f64e6a094d3022032cbb4814b62daf1647570a35903f211143e3d82a8446986761612910936b95c4121037e7bcc2cdc24646fd8e320c74f156367027c1b67564c0dee420262eca71fca56feffffff1c2067e5d0212cc015e3ece148c218008a44eff32a5f6eb4acc238477d9e034a010000006a47304402205d525e4846f964c69c8d830fd9a1823e78ba3085d95405071e822136576326a40220676a18f3e0eb77ff1e9a2b91d54a61cc9642745e2dd55dd0564122010db2266f4121037e7bcc2cdc24646fd8e320c74f156367027c1b67564c0dee420262eca71fca56feffffff022f130873070000001976a914a1f93cb1d124a82f8f86b06ef97a4fd6d77c04e288aca6386727000000001976a9140ca78f443c75e178674bd40337e9fe7f8745cbc088ac9f860100",
      "send": null,
      "status": {
        "valid": true,
        "payload": {
          "minerId": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
          "blockHash": "000000000000000000e3564e4a8d9be13fb24cb21d546cb999d514c650c3b2dc",
          "timestamp": "2020-06-22T10:05:15.165Z",
          "apiVersion": "0.1.0",
          "blockHeight": 640464,
          "returnResult": "success",
          "confirmations": 1,
          "resultDescription": "",
          "txSecondMempoolExpiry": 0
        },
        "encoding": "UTF-8",
        "mimetype": "application/json",
        "publicKey": "0211ccfc29e3058b770f3cf3eb34b0b2fd2293057a994d4d275121be4151cdf087",
        "signature": "304402201029251d228486f7c2b100fb1fd519053b71480c15332d55e694ebb60baa906d02205a61406d5b4c55864381a4053484739fb01ce36f49179463731be442048863b1"
      },
      "completed": true,
      "updated_at": 1592820315,
      "created_at": 1592820315,
      "channel": "somechanneltopic",
      "metadata": {
        "url": "https://www.nintendo.com",
        "image": "",
        "title": "some title",
        "content": "any content",
        "description": "DOOOOOO"
      },
      "tags": [
        "bitcoin",
        "bsv"
      ],
      "extracted": {}
    }
  ]
}
```

### Get Outpoint Spend Status

`GET /api/v1/txout/txid/:txid/:index?pretty=1`

Retrieve spent status of a txoutput (txid + index)

```javascript
{
  "status": 200,
  "errors": [],
  "result": {
    "txid": "dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293",
    "index": 0,
    "script": "76a914a1f93cb1d124a82f8f86b06ef97a4fd6d77c04e288ac",
    "address": "1FmSNBWW2m6d6FDUWxDjaJo9jhNAs9Pekr",
    "scripthash": "ee7beac2fcc315b37f190530d743769f255b1d413edd6e51bbc003022753f909",
    "satoshis": 31994680111,
    "is_receive": true,
    "spend_txid": null,
    "spend_index": null
  }
}
```

### Get Address Outputs

`GET /api/v1/txout/address/:address?pretty=1&offset=0`

Retrieve outputs involving address. Note: receives are tracked only for now.


```javascript
{
  "status": 200,
  "errors": [],
  "result": [
    {
      "txid": "dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293",
      "index": 0,
      "script": "76a914a1f93cb1d124a82f8f86b06ef97a4fd6d77c04e288ac",
      "address": "1FmSNBWW2m6d6FDUWxDjaJo9jhNAs9Pekr",
      "scripthash": "ee7beac2fcc315b37f190530d743769f255b1d413edd6e51bbc003022753f909",
      "satoshis": 31994680111,
      "is_receive": true,
      "spend_txid": null,
      "spend_index": null
    }
  ]
}
```

### Get Address Unspent Outputs (UTXO)

`GET /api/v1/txout/address/:address/utxo?pretty=1&offset=0`

Retrieve outputs involving address. Note: receives are tracked only for now.

```javascript
{
  "status": 200,
  "errors": [],
  "result": [
    {
      "txid": "dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293",
      "vout": 0,
      "outputIndex": 0,
      "value": 31994680111,
      "satoshis": 31994680111,
      "address": "1FmSNBWW2m6d6FDUWxDjaJo9jhNAs9Pekr",
      "scripthash": "ee7beac2fcc315b37f190530d743769f255b1d413edd6e51bbc003022753f909"
    }
  ]
}
```

### Get Scripthash Outputs

`GET /api/v1/txout/scripthash/:scripthash?pretty=1&offset=0`

Retrieve outputs involving scripthash. Note: receives are tracked only for now.


```javascript
{
  "status": 200,
  "errors": [],
  "result": [
    {
      "txid": "dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293",
      "index": 0,
      "script": "76a914a1f93cb1d124a82f8f86b06ef97a4fd6d77c04e288ac",
      "address": "1FmSNBWW2m6d6FDUWxDjaJo9jhNAs9Pekr",
      "scripthash": "ee7beac2fcc315b37f190530d743769f255b1d413edd6e51bbc003022753f909",
      "satoshis": 31994680111,
      "is_receive": true,
      "spend_txid": null,
      "spend_index": null
    }
  ]
}
```

### Get Scripthash Unspent Outputs (UTXO)

`GET /api/v1/txout/scripthash/:scripthash/utxo?pretty=1&offset=0`

Retrieve outputs involving scripthash. Note: receives are tracked only for now.


```javascript
{
  "status": 200,
  "errors": [],
  "result": [
    {
      "txid": "dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293",
      "vout": 0,
      "outputIndex": 0,
      "value": 31994680111,
      "satoshis": 31994680111,
      "address": "1FmSNBWW2m6d6FDUWxDjaJo9jhNAs9Pekr",
      "scripthash": "ee7beac2fcc315b37f190530d743769f255b1d413edd6e51bbc003022753f909"
    }
  ]
}
```

### Get Queue Stats

`GET /api/v1/queue/stats`

Retrieve queue settings and general stats.

```javascript
{
  "status": 200,
  "errors": [],
  "result": {
    "config": {
      "concurrency": 3,
      "maxDelay": 600000,
      "numOfAttempts": 20,
      "startingDelay": 60000,
      "jitter": "none",
      "timeMultiple": 2,
      "checkPendingTimeSec": 60
    },
    "stats": {
      "tasks_pending": 0,
      "tasks_enq": 0,
      "tasks_dup": 0,
      "tasks_expired": 0,
      "tasks_completed": 0
    }
  }
}
```

### Get Dead-Letter Transactions Queue

`GET /api/v1/queue/dlq`

Retrieve any transaction that were unable to be synced (ie: `completed: false`) after the max `numOfAttempts` was reached.
All transactions expired get tagged in the default dead-letter queue called `dlq`

A transaction that is expired, will not be retried unless it is forced to `resync` and start the retry again.

```javascript
{
  "status": 200,
  "errors": [],
  "result": [ 'dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293' ]
}
```

### Force Resync of Transaction

`POST /api/v1/tx/dc7bed6c302c08b7bafd94bfb1086883a134861fe9f212fc8052fcaadcde2293/resync`

Use this method to restart any transactions found in the dead-letter queue (dlq).

Sets `tx.completed = false` and resets `sync = 1` (pending) and kick starts the sync of the send and status of transaction.

```javascript
{
  "status": 200,
  "errors": [],
  "result": {} // Success is empty
}
```



## Server Sent Events (SSE) - COMING SOON!


## Additional Resources

<a href='https://developers.matterpool.io'>MATTERPOOL DEVELOPER DOCUMENTATION</a>

<a href='https://matterpool.io'>matterpool.io</a>

<a href='mailto:attila@matterpool.io?subject=Hello TXQ'>Say Hello</a>
