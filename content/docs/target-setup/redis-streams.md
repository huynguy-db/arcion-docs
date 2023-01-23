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
- *`TRUSTSTORE_TYPE`*: the TrustStore type—for example, `PKS12`

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
- *`TRUSTSTORE_TYPE`*: the TrustStore type—for example, `PKS12`
- *`PATH_TO_KEYSTORE`*: path to the KeyStore
- *`KEYSTORE_PASSWORD`*: the KeyStore password
- *`KEYSTORE_TYPE`*: the KeyStore type—for example, `PKS12`

  
In the preceeding sample:

- `max-connections` is the maximum number of connections Replicant can open in Redis. 
- `max-retries` is the number of times any failed operation on the system will be re-attempted.

Feel free to change these two values as you need.

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

### Log failures in `trace.log`
You can enable logging of the failed rows [in the trace.log file]({{< relref "docs/references/troubleshooting#the-log-files" >}}) for snapshot mode. To do so, set the `log-row-level-errors` parameter to `true` under the `snapshot` section of [your Applier configuration file]({{< relref "docs/references/applier-reference" >}}).

### Streams for snapshot and CDC changes
We publish snapshot changes to `<catalog>_<schema>_<tablename>` stream while CDC changes to `<catalog>_<schema>_<tablename>_cdc_logs` stream.

### Schema dump
For Replicant's internal usage, the schema dump is published to a special stream called `replicate_io_replication_schema_<replication_group>_<replication_id>`.

### Use `fetch-schemas` for schema information
If you want to get information about the schema of replicated tables, you can use [`fetch-schemas` mode]({{< relref "docs/running-replicant#fetch-schemas" >}}). `fetch-schemas` mode reads the internal schema dump and generates the `schemas.yaml` file. 

To achieve this, run Replicant with the `fetch-schemas` option. For example:

```sh
./bin/replicant fetch-schemas conf/conn/redis_stream.yaml --id redis
```
You need to give the replication ID of the run that generated the schema dump via the `--id` argument so that Replicant can locate the appropriate stream.

### Replicant's behavior after reaching `max-retries `
After reaching the maximum number of re-attempts specified in [`max-retries`](#i-set-up-connection-configuration), Replicant's behavior depends on the replication mode and [the type of transactional consistency](#transactional-consistency-in-realtime-mode). 

<dl class="dl-indent">
<dt>In snapshot mode</dt>
<dd>
Replicant skips the table from the replication run rather than stopping the replicant by throwing an exception. This prevents the rest of the tables from going into an inconsistent state.
</dd>

<dt>Under global consistency</dt>
<dd>
Replicant skips the table from the replication rather than stopping the replicant by throwing an exception. This prevents the rest of the tables from going into an inconsistent state.
</dd>

<dt>Under eventual consistency</dt>
<dd>
Replicant dumps the Stream entry IDs for the messages it couldn't delete programmatically in a file with the name <code>$REPLICANT_HOME/data/<replication_id>/bad_rows/replicate_io_indoubt_txn_log</code>. You need to clean up those entries manually and <a href="/docs/running-replicant#various-replication-options-explanation">resume the replication run</a>. You can use the following command for cleaning up the entries:

```sh
redis-cli XDEL STREAM_NAME STREAM_ID_FROM_FILE [,STREAM_ID_FROM_FILE]
```

Replace `STREAM_NAME` and `STREAM_ID_FROM_FILE` with the corresponding stream names and IDs.

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

The following is a sample key structure:

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "REDIS_STREAM_Connector.tpch_scale_0_01.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": "1"
  }
}
```

The following is the value structure for the preceeding sample:

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "REDIS_STREAM_Connector.tpch_scale_0_01.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": false,
        "field": "before",
        "name": "REDIS_STREAM_Connector.tpch_scale_0_01.region.Value",
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
        "field": "after",
        "name": "REDIS_STREAM_Connector.tpch_scale_0_01.region.Value",
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
            "optional": false,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": true,
            "field": "snapshot"
          },
          {
            "type": "string",
            "optional": false,
            "field": "db"
          },
          {
            "type": "string",
            "optional": true,
            "field": "sequence"
          },
          {
            "type": "string",
            "optional": true,
            "field": "table"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": false,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": false,
            "field": "row"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "query"
          }
        ]
      },
      {
        "type": "struct",
        "optional": true,
        "field": "transaction",
        "name": null,
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "id"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "total_order"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "data_collection_order"
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
      "r_regionkey": "1",
      "r_comment": "TestReplication",
      "r_name": "AMERICA"
    },
    "after": {
      "r_regionkey": "1",
      "r_comment": "Replication Works!",
      "r_name": "AMERICA"
    },
    "source": {
      "query": "UPDATE tpch_scale_0_01.region SET r_regionkey=1 AND r_name=AMERICA AND r_comment=Replication Works! WHERE r_regionkey=1 AND r_name=AMERICA AND r_comment=TestReplication",
      "thread": 1533,
      "server_id": "1",
      "version": "5.7.24",
      "file": "log-bin.000004",
      "connector": "MYSQL",
      "pos": 5748188,
      "name": "REDIS_STREAM_Connector",
      "gtid": null,
      "row": 1,
      "ts_ms": 1670357178000,
      "db": "tpch_scale_0_01",
      "table": "region",
      "snapshot": false
    },
    "op": "UPDATE",
    "ts_ms": 1670337378446,
    "transaction": {
      "id": "",
      "total_order": 1
    }
  }
}
```

## Schema Dump Structure
Content in this stream is used for internal purposes by Replicant. For example, to support [`fetch-schemas` mode]({{< relref "docs/running-replicant#fetch-schemas" >}}).

The key for the schema dump is a constant string `“schema“` whereas the value holds the schema information for tables. The following is a sample value structure:

```JSON
{
  "form": {
    "schemas": [
      "java.util.ArrayList",
      [
        {
          "catalog": "tpch_scale_0_01",
          "schema": null,
          "tables": [
            "java.util.ArrayList",
            [
              {
                "name": "region",
                "sharded": false,
                "columns": [
                  "java.util.ArrayList",
                  [
                    {
                      "name": "r_regionkey",
                      "type": "INT",
                      "default": null,
                      "notNull": true,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    },
                    {
                      "name": "r_name",
                      "type": "CHAR(25)",
                      "default": null,
                      "notNull": true,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    },
                    {
                      "name": "r_comment",
                      "type": "VARCHAR(152)",
                      "default": null,
                      "notNull": false,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    },
                    {
                      "name": "new_col",
                      "type": "VARCHAR(10)",
                      "default": null,
                      "notNull": false,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    },
                    {
                      "name": "new_col1",
                      "type": "VARCHAR(10)",
                      "default": null,
                      "notNull": false,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    },
                    {
                      "name": "new_col2",
                      "type": "VARCHAR(10)",
                      "default": null,
                      "notNull": false,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    },
                    {
                      "name": "new_col3",
                      "type": "VARCHAR(10)",
                      "default": null,
                      "notNull": false,
                      "identity": false,
                      "generated": false,
                      "selectSql": null,
                      "cdcTransformFunction": null
                    }
                  ]
                ],
                "shardKey": null,
                "uniqueKeys": [
                  "java.util.ArrayList",
                  []
                ],
                "foreignKeys": [
                  "java.util.ArrayList",
                  []
                ],
                "createSQL": null,
                "objectType": "TABLE",
                "primaryKey": {
                  "name": null,
                  "columns": [
                    "java.util.ArrayList",
                    [
                      "r_regionkey"
                    ]
                  ]
                },
                "indexes": null,
                "rowCount": null
              }
            ]
          ],
          "views": [
            "java.util.ArrayList",
            []
          ]
        }
      ]
    ],
    "userRoles": {
      "users": [
        "java.util.ArrayList",
        []
      ],
      "roles": [
        "java.util.ArrayList",
        []
      ]
    },
    "encrypted": false
  },
  "sourceType": "MYSQL"
}
```