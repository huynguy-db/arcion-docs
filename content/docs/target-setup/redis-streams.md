---
pageTitle: Documentation for Redis Streams as target 
title: Redis Streams
description: "Get in-depth documentation on how to set up IBM Informix as data Target with Arcion, from setting up secure connection to enabling CDC-based replication."
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
For connecting to Redis via basic username and password authentication, you have two options:

#### Fetch credentials from AWS Secrets Manager (for Arcion self-hosted CLI only)
You can choose to store your username and password in AWS Secrets Manager, and tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager).

#### Specify credentials in plain form
You can also specify your credentials in plain form in the connection configuration file. Follow these instructions based on whether or not you have SSL encryption enabled for Redis connection.

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
```

Replace the following:

- *`HOSTNAME`*: the Redis server hostname.
- *`PORT_NUMBER`*: the port number of Redis host
- *`USERNAME`*: the username to connect to the Redis server
- *`PASSWORD`*: the password associated with *`USERNAME`*

`max-connections` is the maximum number of connections Replicant can open in Redis. Feel free to change its value as you need.
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
```
Replace the following:

- *`HOSTNAME`*: the Redis server hostname.
- *`PORT_NUMBER`*: the port number of Redis host
- *`PATH_TO_TRUSTSTORE`*: path to the TrustStore
- *`TRUSTSTORE_PASSWORD`*: the TrustStore password
- *`TRUSTSTORE_TYPE`*: the TrustStore type—for example, `PKS12`

`max-connections` is the maximum number of connections Replicant can open in Redis. Feel free to change its value as you need.

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
```

Replace the following:

- *`HOSTNAME`*: the Redis server hostname.
- *`PORT_NUMBER`*: the port number of Redis host
- *`PATH_TO_TRUSTSTORE`*: path to the TrustStore
- *`TRUSTSTORE_PASSWORD`*: the TrustStore password
- *`TRUSTSTORE_TYPE`*: the TrustStore type—for example, `PKS12`
- *`PATH_TO_KEYSTORE`*: path to the KeyStore
- *`KEYSTORE_PASSWORD`*: the KeyStore password
- *`KEYSTORE_TYPE`*: the KeyStore type—for example, `PKS12`

  
`max-connections` is the maximum number of connections Replicant can open in Redis. Feel free to change its value as you need.

## II. Set up Applier configuration
To configure replication mode according to your requirements, specify your configuration in the Applier configuration file. You can find a sample Applier configuration file `redis_stream.yaml` in the `$REPLICANT_HOME/conf/dst` directory.

For more information on running Replicant in different modes, see [Running Replicant]({{< ref "docs/running-replicant" >}}).

You can configure Redis Streams for operating in either snapshot or realtime modes: 

### Configure `snapshot` mode
For operating in snapshot mode, specify your configuration under the `snapshot` section of the conifiguration file. For example:

```YAML
snapshot:
  threads: 32
  batch-size-rows: 10_000
  txn-size-rows: 1_000_000
```

#### Additional parameters

##### `log-row-level-errors`
`true` or `false`.

During snapshot replication, if a given batch fails Replicant retries the failed rows. You can set this parameter to `true` if you want to log the failed rows in [the trace.log file]({{< ref "docs/references/troubleshooting#the-log-files" >}}).

For more information about the Applier parameters for `snapshot` mode, see [Snapshot Mode]({{< ref "/docs/references/applier-reference#snapshot-mode" >}}).

### Configure `realtime` mode
For operating in realtime mode, specify your configuration under the `realtime` section of the conifiguration file. For example:

```YAML
realtime:
  threads: 16
  replay-consistency: GLOBAL
  txn-size-rows: 10000
  batch-size-rows: 1000
```

For more information about the configuration parameters for `realtime` mode, see [Realtime Mode]({{< ref "/docs/references/applier-reference#realtime-mode" >}}).

# Design considerations

1. Arcion Replicant supports the following sources for Redis Streams as target:

- MySQL 
- PostgreSQL

MYSQL Setup: MySQLCDCPrerequisites 

Additionally, add to my.cnf if GTID value is needed in Redis messages.


gtid_mode=ON 
enforce-gtid-consiste
PostgreSQL Setup: PostgreSQLCDCPrerequisites

Redis stream is like an append log that has a StreamEntry ID for each message and allows deleting messages with a given StreamEntry ID. However, Redis does not support rollback functionality with transactions. So if some rows in a batch fail the entire transaction is not rolled back. Due to this behavior for snapshot, we identify the failed rows in a given batch and retry those while for real-time since we need to maintain the order we try to undo the committed rows in given batch and retry the entire batch. 

During the snapshot, if the user wants to log the failed rows in trace.log they can enable log-row-level errors snapshot applier config.

We publish snapshot changes to <catalog>_<schema>_<tablename> stream while cdc changes to <catalog>_<schema>_<tablename>_cdc_logs stream.

If DDL replication is enabled for the source ( using the DDL replication section in the extractor configuration file) then  DDL changes are published to a special stream called replicate_io_schema_change_log_<replication_group>_<replication_id>

For the replicant's internal usage, the schema dump is published to a special stream called replicate_io_replication_schema_<replication_group>_<replication_id>

If the user wants to get information about the schema of tables replicated they can use fetch schema mode Fetch schema mode will read this internal dump and generate schemas.yaml. We need to give the replication id of the run that generated the schema dump so that we can locate the appropriate stream.


bin/replicant fetch-schemas conf/conn/redis_stream.yaml --id redis
Snapshot behavior after max-retries 
We skip the table from the replication run rather than stopping the replicant by throwing an exception otherwise other tables will be left in an inconsistent state.

The real-time phase supports 2 consistency modes. The real-time config replay-consistency: GLOBAL| EVENTUAL  can be used to tune the consistency mode.

EVENTUAL ( replay is done per table. There is a per table stream object) 

GLOBAL ( There is a single stream holding CDC logs in transaction order )

Realtime eventual consistency behavior after max-retries 
We skip the table from replication rather than stopping the replicant by throwing an exception otherwise other tables will be left in an inconsistent state.

Realtime global consistency behavior after max-retries 
We dump the stream entry IDs for the messages we could not delete programmatically in a file with the name $REPLICANT_HOME/data/<replication_id>/bad_rows/replicate_io_indoubt_txn_log and expect users to clean up those entries manually and resume the replication run.


redis-cli XDEL <stream-name> <stream ID from file> [,<stream ID from file>]