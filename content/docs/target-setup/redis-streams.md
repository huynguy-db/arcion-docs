---
pageTitle: Documentation for Redis Streams as target 
title: Redis Streams
description: "Get in-depth documentation on how to ingest data into Redis Streams with Arcion, from setting up secure connection to realtime replication."
bookHidden: false
---

# Destination Redis Streams
This page describes how to load data in realtime into [Redis Streams](https://redis.io/docs/data-types/streams/), an append-only log data structure.

The following steps refer [the extracted Arcion self-hosted CLI download]({{< ref "docs/quickstart/#ii-download-replicant-and-create-a-home-repository" >}}) as the `$REPLICANT_HOME` directory.

## I. Set up connection configuration
Specify our Redis connection details to Replicant with a connection configuration file. You can find a sample connection configuration file `redis_stream.yaml` in the `$REPLICANT_HOME/conf/conn` directory.

For connecting to Redis, you can choose between two methods for an authenticated connection:
  - Using basic username and password authentication
  - Using SSL

### Connect with username and password
For connecting to Redis via basic username and password authentication, you can specify your credentials in the connection configuration file. Follow these instructions based on whether or not you have SSL encryption enabled for Redis connection.

{{< tabs "username-pwd-authentication" >}}
{{< tab "Without SSL encryption for connection" >}}
Without SSL encryption for Redis connection, specify your configuration in the following manner:

```YAML
type: REDIS_STREAM

host: HOSTNAME
port: PORT_NUMBER
username: 'USERNAME'
password: 'PASSWORD'

max-connections: 30
max-retries: 10
```

Replace the following:

- *`HOSTNAME`*: the Redis server hostname.
- *`PORT_NUMBER`*: the port number of Redis host
- *`USERNAME`*: the username to connect to the Redis server
- *`PASSWORD`*: the password associated with *`USERNAME`*

In the preceeding sample:

- `max-connections` is the maximum number of connections Replicant can open in Redis. 
- `max-retries` is the number of times any failed operation on the system will be re-attempted.

Feel free to change these two values as you need.
{{< /tab >}}

{{< tab "With SSL encryption for connection" >}}
You can enable data encryption for Redis connection using SSL. In that case, you need to specify the TrustStore holding the CA certificate along with the username and password. For example:

```YAML
type: REDIS_STREAM

host: HOSTNAME
port: PORT_NUMBER

ssl:
  enable: true
  trust-store:
    path: "PATH_TO_TRUSTSTORE"
    password: "TRUSTSTORE_PASSWORD"
    ssl-store-type: 'TRUSTSTORE_TYPE'
max-connections: 30
max-retries: 10
```
Replace the following:

- *`HOSTNAME`*: the Redis server hostname.
- *`PORT_NUMBER`*: the port number of Redis host
- *`PATH_TO_TRUSTSTORE`*: path to the TrustStore
- *`TRUSTSTORE_PASSWORD`*: the TrustStore password
- *`TRUSTSTORE_TYPE`*: the TrustStore type—for example, `PKCS12`

In the preceeding sample:

- `max-connections` is the maximum number of connections Replicant can open in Redis. 
- `max-retries` is the number of times any failed operation on the system will be re-attempted.

Feel free to change these two values as you need.

{{< /tab >}}
{{< /tabs >}}
### Connect using SSL
If both client authentication and data encryption is done using SSL, you need to specify both TrustStore and KeyStore details in the connection configuration file. For example:

```YAML
type: REDIS_STREAM

host: HOSTNAME
port: PORT_NUMBER

ssl:
  enable: true
  trust-store:
    path: "PATH_TO_TRUSTSTORE"
    password: "TRUSTSTORE_PASSWORD"
    ssl-store-type: 'TRUSTSTORE_TYPE'
  key-store:
    path: "PATH_TO_KEYSTORE"
    password: "KEYSTORE_PASSWORD"
    ssl-store-type: 'KEYSTORE_TYPE'

max-connections: 30
max-retries: 10
```

Replace the following:

- *`HOSTNAME`*: the Redis server hostname.
- *`PORT_NUMBER`*: the port number of Redis host
- *`PATH_TO_TRUSTSTORE`*: path to the TrustStore
- *`TRUSTSTORE_PASSWORD`*: the TrustStore password
- *`TRUSTSTORE_TYPE`*: the TrustStore type—for example, `PKCS12`
- *`PATH_TO_KEYSTORE`*: path to the KeyStore
- *`KEYSTORE_PASSWORD`*: the KeyStore password
- *`KEYSTORE_TYPE`*: the KeyStore type—for example, `PKCS12`

  
In the preceeding sample:

- `max-connections` is the maximum number of connections Replicant can open in Redis. 
- `max-retries` is the number of times any failed operation on the system will be re-attempted.

Feel free to change these two values as you need.

## II. Configure mapper file (optional)
If you want to define data mapping from your source to Redis Streams, specify the mapping rules in the mapper file. For more information on how to define the mapping rules and run Replicant CLI with the mapper file, see [Mapper Configuration]({{< ref "/docs/references/mapper-reference" >}}).

When mapping source object names to Redis streams, you can choose between two delimiters for stream names. For more information, see [Delimiter in Kafka topic and Redis stream names]({{< ref "/docs/references/mapper-reference#delimiter-in-kafka-topic-and-redis-stream-names" >}}).

## III. Set up Applier configuration
To configure replication mode according to your requirements, specify your configuration in the Applier configuration file. You can find a sample Applier configuration file `redis_stream.yaml` in the `$REPLICANT_HOME/conf/dst` directory. For example:

```YAML
snapshot:
  threads: 16

realtime:
  threads: 16
  split-stream: false
```

For more information on running Replicant in different modes, see [Running Replicant]({{< ref "docs/running-replicant" >}}).

You can configure Redis Streams for operating in either [snapshot](#configure-snapshot-mode) or [realtime](#configure-realtime-mode) modes.

### Configure `snapshot` mode
For operating in snapshot mode, specify your configuration under the `snapshot` section of the conifiguration file. For example:

```YAML
snapshot:
  threads: 32
  batch-size-rows: 10_000
  txn-size-rows: 10_000
```
For more information about the Applier parameters for `snapshot` mode, see [Snapshot Mode]({{< ref "/docs/references/applier-reference#snapshot-mode" >}}).

#### Additional parameters

##### `log-row-level-errors`
`true` or `false`.

During snapshot replication, if a given batch fails, Replicant retries the failed rows. You can set this parameter to `true` if you want to log the failed rows in [the trace.log file]({{< ref "docs/references/troubleshooting#the-log-files" >}}).

### Configure `realtime` mode
For operating in realtime mode, specify your configuration under the `realtime` section of the conifiguration file. For example:

```YAML
realtime:
  threads: 16
  replay-consistency: EVENTUAL
  txn-size-rows: 10_000
  batch-size-rows: 10_000
```

For more information about the configuration parameters for `realtime` mode, see [Realtime Mode]({{< ref "/docs/references/applier-reference#realtime-mode" >}}).

#### Additional parameters

##### `split-stream`
`true` or `false`.

Creates a separate stream for snapshot and CDC data if `true`. If `false`, a single stream contains the data for snapshot and CDC. `split-stream` is a global parameter for `realtime` mode. So you can't change it on a per-table basis.

_Default: `true`._

## Design considerations

### Supported platforms
Arcion Replicant supports the following sources for Redis Streams as target:

 - [MySQL]({{< relref "docs/source-setup/mysql" >}}) 
 - [PostgreSQL]({{< relref "docs/source-setup/postgresql" >}})

  For MySQL, you can also enable [Global Transaction ID (GTID) based logging](https://dev.mysql.com/doc/refman/5.7/en/replication-options-gtids.html#sysvar_gtid_mode) and [enforce GTID consistency](https://dev.mysql.com/doc/refman/5.7/en/replication-options-gtids.html#sysvar_enforce_gtid_consistency) if Redis messages require them. To do so, add the following to your MySQL option file `my.cnf`:

  ```cnf
  gtid_mode=ON 
  enforce-gtid-consistency=ON
  ```

### Failures and rollbacks
Redis stream is like an append log that where each Stream entry has an ID for each message and allows deleting messages with a given Stream entry ID. However, Redis does not support rollback functionality with transactions. So, if some rows in a batch fail, the entire transaction is not rolled back. Due to this behavior we proceed in the following manner: 

- For snapshot, we identify the failed rows in a given batch and retry those.
- For realtime, since we need to maintain the order, we try to undo the committed rows in a given batch and retry the entire batch.

### Replicant's behavior after reaching `max-retries `
After reaching the maximum number of re-attempts specified in [`max-retries`](#i-set-up-connection-configuration), Replicant's behavior depends on the replication mode and [the type of transactional consistency](#transactional-consistency-in-realtime-mode). 

<dl class="dl-indent">
<dt>During snapshot phase</dt>
<dd>

The [`skip-tables-on-failures` Applier configuration parameter]({{< ref "docs/references/applier-reference#skip-tables-on-failures" >}}) defaults to `true`. Therefore, Replicant excludes the table from the replication rather than stopping the Replicant process by throwing an exception. This behavior prevents the rest of the tables from going into an inconsistent state. 

You can add the tables Replicant excluded from replication using the [dynamic reinitialization feature]({{< ref "docs/references/dynamic-reinitialization" >}}). You can also disable [`skip-tables-on-failures`]({{< ref "docs/references/applier-reference#skip-tables-on-failures" >}}). In that case, Replicant throws an exception and performs snapshot recovery in the auto-resumed run.
</dd>

<dt>During realtime phase with eventual replay consistency</dt>
<dd>

The [`skip-tables-on-failures` Applier configuration parameter]({{< ref "docs/references/applier-reference#skip-tables-on-failures" >}}) defaults to `true`. Therefore, Replicant excludes the table from the replication rather than stopping the Replicant process by throwing an exception. This behavior prevents the rest of the tables from going into an inconsistent state. 

You can add the tables Replicant excluded from replication using the [dynamic reinitialization feature]({{< ref "docs/references/dynamic-reinitialization" >}}). You can also disable [`skip-tables-on-failures`]({{< ref "docs/references/applier-reference#skip-tables-on-failures" >}}). In that case, Replicant throws an exception and performs real-time recovery in the auto-resumed run.
</dd>

<dt>During realtime phase with global replay consistency</dt>
<dd>
Replicant dumps the Stream entry IDs for the messages it couldn't delete programmatically in a file with the name <code>$REPLICANT_HOME/data/<replication_id>/bad_rows/replicate_io_indoubt_txn_log</code>. You need to clean up those entries manually and <a href="/docs/running-replicant#various-replication-options-explanation">resume the replication run</a>. You can use the following command for cleaning up the entries:

```sh
redis-cli XDEL STREAM_NAME STREAM_ENTRY_ID_FROM_FILE [,STREAM_ENTRY_ID_FROM_FILE]
```

Replace `STREAM_NAME` and `STREAM_ENTRY_ID_FROM_FILE` with the corresponding stream names and IDs.

</dd>
</dl>

### Transactional consistency in realtime mode
Realtime mode supports the following two consistency modes.

<dl class="dl-indent">

<dt><code>GLOBAL</code></dt>
<dd>
Realtime replication is performed with global transactional consistency. There is a single stream holding CDC logs in transaction order.
</dd>

<dt><code>EVENTUAL</code></dt>
<dd>
Realtime replication is performed with eventual consistency. Replay is done per table and there's a stream object for each table.
</dd>

</dl>

Set the realtime configuration parameter `replay-consistency` to whatever mode you want [under the `realtime` section of the Applier configuration file](#configure-realtime-mode).

## DML message structure
Each message has a key and a value. It has schema and payload following the schema definition. The key is used to uniquely identify the change. 

1. Primary key, unique keys, or row identifier key columns are used to form key structure. If there is no such key, we use the `“default“` string as a key. 

2. For an update on the columns used to uniquely identify records DELETE and INSERT records are generated. 

3. For each delete operation, there is a tombstone event generated with the key same as the previous delete operation and value set to `“default“`.

{{< details title="Click to see sample key and value structure" open=false >}}

### Key structure
```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "REDIS_STREAM_Connector.tpch.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": 10
  }
}
```

### Value structure
```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "REDIS_STREAM_Connector.tpch.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": true,
        "field": "before",
        "name": "REDIS_STREAM_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": true,
        "field": "after",
        "name": "REDIS_STREAM_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "source",
        "name": "REDIS_STREAM_Connector",
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "version"
          },
          {
            "type": "string",
            "optional": false,
            "field": "connector"
          },
          {
            "type": "string",
            "optional": false,
            "field": "name"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": true,
            "field": "db"
          },
          {
            "type": "string",
            "optional": true,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": false,
            "field": "table"
          },
          {
            "type": "string",
            "optional": true,
            "field": "query"
          },
          {
            "type": "string",
            "optional": true,
            "field": "snapshot"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": true,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": true,
            "field": "row"
          }
        ]
      },
      {
        "type": "string",
        "optional": false,
        "field": "op"
      },
      {
        "type": "int64",
        "optional": true,
        "field": "ts_ms"
      }
    ]
  },
  "payload": {
    "before": {
      "r_regionkey": 10,
      "r_name": "Test_nation",
      "r_comment": "ReplicationWorks"
    },
    "after": {
      "r_regionkey": 10,
      "r_name": "Test_nation",
      "r_comment": "TestReplication"
    },
    "source": {
      "version": "5.7.41",
      "connector": "MYSQL",
      "name": "REDIS_STREAM_Connector",
      "ts_ms": 1681129889000,
      "db": "tpch",
      "schema": null,
      "table": "region",
      "snapshot": "false",
      "server_id": "1",
      "gtid": null,
      "file": "mysql-log.000019",
      "pos": 4436,
      "row": 5,
      "thread": 69,
      "query": "UPDATE tpch.region SET r_regionkey=10 AND r_name=Test_nation AND r_comment=TestReplication WHERE r_regionkey=10 AND r_name=Test_nation AND r_comment=ReplicationWorks"
    },
    "op": "u",
    "ts_ms": 1681110090233
  }
}
```
{{< /details >}}