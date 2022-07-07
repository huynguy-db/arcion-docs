---
title: IBM Db2
weight: 8
bookHidden: false
---

# Source IBM Db2

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Check Permissions
You need to verify that the necessary permissions are in place on source Db2 in order to perform replication. To know about the permissions, see [IBM Db2 Permissions](/docs/references/source-prerequisites/db2/#permissions).

## II. Set up CDC Replication

For enabling CDC-based replication from the source Db2 server, please follow the instructions in [Enabling CDC Replication for Db2](/docs/references/source-prerequisites/db2/#enabling-cdc-replication).

## III. Create the Heartbeat Table

For CDC replication, you must create the heartbeat table on the source database with the following DDL:

```SQL
CREATE TABLE "tpch"."replicate_io_cdc_heartbeat"("timestamp" BIGINT NOT NULL, 
CONSTRAINT "cdc_heartbeat_id_default_default" PRIMARY KEY("timestamp"))
```

## IV. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/db2.yaml
   ```

2. The configuration file has two parts: 

   * Parameters related to source Db2 server connection.
   * Parameters related to CDC logs and monitoring.

### Parameters Related to Source Db2 server connection
- For connecting to your soruce IBM Db2, you can configure the following parameters:

   ```YAML
   type: DB2

  database: tpch #Name of the catalog from which the tables are to be replicated
  host: localhost
  port: 50002

  username: replicant
  password: "Replicant#123"

  max-connections: 30

  max-retries: 10
  retry-wait-duration-ms: 1000

  #proxy-source: false
  ```
  - If you set `proxy-source` to `true`, Replicant will not attempt to connect to the source database. You can enable it for real-time mode if the log is in a separate storage space than the source database.

### Parameters Related to CDC Logs and Monitoring
- If you enable CDC-based replication from your source Db2 server, the following parameters will enable you to configure CDC logs and monitoring process:

  ```YAML
  cdc-log-config:
    #cdc-log-store: MQ
    mqueue-connections:
      queue-conn1:
        host: localhost
        port: 1450
        queue-manager: CDC_QM
        queue-channel: CDC_Q_CHANNEL
        username: queue_manager
        password: queue_manager
        queues:
        - name: CDC_LOG_Q
        #message-format: XML 
        #lob-send-option: INLINE
        #- name: CDC_LOG_Q_DELIMITED
        #  message-format: DELIMITED
        #ssl:
        #  trust-store:
        #    path: "/path/to/trust/store"
        #    password: 'changeit'
        #  key-store:
        #    path: "/path/to/trust/store"
        #    password: 'changeit'
        #  ssl-cipher-suite: 'TLS_RSA_WITH_AES_128_CBC_SHA256'

    #cdc-log-storage: KAFKA_STRING
    #kafka-connection:
    #  cdc-log-topic: cdc_log_topic
    #  message-format: XML
    #  lob-send-option: INLINE
    #  connection:
    #    brokers:
    #      broker1:
    #        host: localhost
    #        port: 19092
    #
    #
    #cdc-log-storage: KAFKA_AVRO
    #kafka-connection:
    #  cdc-log-topic-prefix: ""
    #  message-format: KCOP_MULTIROW_AUDIT
    #  connection:
    #    brokers:
    #      broker1:
    #        host: localhost
    #        port: 19092
    #    schema-registry-url: "http://localhost:8081"
   ```
   Below are more details on `cdc-log-config` parameters:

   i. `cdc-log-store`: Storage where Db2 logs reside. Allowed values are:
     - `MQ`
     - `KAFKA_TRANSACTION`
     - `KAFKA_EVENTUAL`
     - `KAFKA_AVRO`
   
   The sample configuration file above shows samples for `MQ`, `KAFKA_STRING`, and `KAFKA_AVRO`.

   ii. `mqueue-connections`: If you enable realtime replication and use IBM MQ for CDC logs, then you need to specify MQ connection information in this field. It contains the following parameters:
   - `host`: The host on which MQ queue manager is running.
   - `port`: The port number to connect to MQ queue manager.
   - `queue-manager`: Name of queue manager to connect to.
   - `queue-channel`: The name of the channel to connect to on the queue manager.
   - `username`: The username to connect to the MQ queue manager.
   - `password`: The associated password.
   - `queues`: List of IBM MQ queues to connect to.
     - `name` : Name of IBM MQ queue.
     - `message-format`: Format of message that will be received from IBM MQ. Allowed values are `XML` and `DELIMITED`.
     - `message-type`[21.02.01.8]: Type of message that will be received from IBM MQ. Allowed values are `ROW` and `TRANSACTION`.
     - `lob-send-option`: If LOB columns are inlined or will be received in separate MQ messages. Allowed values are `INLINE` and `SEPARATE`.
   - `ssl`:
     - `trust-store`:
       - `path`: Path to truststore.
       - `password`: Password for the truststore.
     - `key-store`: You'll need this if you have 2-way authentication enabled on MQ.
       - `path`: Path to truststore.
       - `password`: Password for the truststore.
     - `ssl-cipher-suite`: Provide your encryption algorithm based what is configured on MQ Manager.
   - `backup-mqueue-connection`[20.04.06.1]: Connection details for the backup MQ manager. Providing this configuration allows Replicant to seamlessly failover to the backup MQ Manager when primary MQ Manager is down. You can configure all configuration parameters for backup MQ in a similar fashion to the primary MQ Manager.
     - `host`: The host on which MQ queue manager is running.
     - `port`: The port number to connect to MQ queue manager.
     - `queue-manager`: Name of queue manager to connect to.
     - `queue-channel`: The name of the channel to connect to on
     the queue manager
     - `username`: The username to connect to the MQ queue manager.
     - `password`: The associated password.
     - `queues`: List of IBM MQ queues to connect to.
       - `name`: Name of IBM MQ queue.
       - `message-format`: Format of message that will be received from IBM MQ. Allowed values are `XML` and `DELIMITED`.
       - `message-type`[21.02.01.8]: Type of message that will be received from IBM MQ. Allowed values are `ROW` and `TRANSACTION`.
       - `lob-send-option`: If LOB columns are inlined or will be received in separate MQ messages. Allowed values are `INLINE`, `SEPARATE`.
     - `ssl`:
       - `trust-store`:
         - `path`: Path to truststore.
         - `password`: Password for the truststore.
       - `key-store`: You'll need this if you have 2-way authentication enabled on MQ (for example client authentication).
         - `path`: Path to truststore.
         - `password`: Password for the truststore.
       - `ssl-cipher-suite`: Encryption algorithm configured on MQ
       
   iii. `kafka-connection`[20.10.07.15]: If you enable realtime replication and use Kafka for CDC logs, then you need to specify Kafka connection information in this field. It contains the following parameters: 
     - `cdc-log-topic`: The Kafka topic that contains Db2 CDC log. To be
     used when cdc-log-config is `KAFKA_TRANSACTIONAL`.
     - `cdc-log-topic-prefix`[20.12.04.7]: The common prefix for all Kafka topics that will be replicated. To be used when `cdc-log-config` is `KAFKA_EVENTUAL` or `KAFKA_AVRO`.
     - `cdc-log-topic-prefix-list`[21.02.01.19]:
       - `cdc-log-topic-prefix`: The common prefix for Kafka topics wit.
       - `tables`:
     - `message-format`: Format of message that will be received from Kafka. Allowed values are `XML`, `DELIMITED`, and `KCOP_MULTIROW_AUDIT`.
     - `lob-send-option`: If LOB columns are inlined or will be received in separate messages from Kafka. Allowed values are `INLINE` and `SEPARATE`.
     - `connection`: Connection config for connecting to Kafka. Please refer to this document for details.

{{< hint "info" >}}
## Note
1) You can configure the `message-type` of queues to `ROW` or `TRANSACTION` depending on the value of the `MESSAGE CONTENT TYPE` that you set using `PubQMap`. If it's set to `R`, then `message-type` can be `ROW`. If it's set to `T`, then `message-type` can be `TRANSACTION`.
2) For  `KAFKA_TRANSACTIONAL` as `cdc-log-store`, based on the value of `message-format`, the following assumptions will take place:
   - If the `message-format` is `XML`/`DELIMITED`, then the assumption is that the key of record is the MQ `MessageId` and value is the `MQMessage` in `XML`/`DELIMITED` format.
   - If the `message-format` is `KCOP_MULTIROW_AUDIT`, then the assumption is that the `cdc-log-topic` is the topic name of the `COMMIT-STREAM` topic associated with the subscription that will be replicated in a transactionally consistent manner.
3) For `KAFKA_EVENTUAL`/`KAFKA_AVRO` as `cdc-log-store`, the assumption is that the topic name is in format `cdc-log-topic-prefix.<table_name>`. Assumption is based on the naming scheme IBM IIDR follows for Kafka topics.

By default, IIDR creates a Kafka topic using the following naming convention:

```
<datastore_name>.<subscription_name>.<database>.<schema>.<table>
```
In this case `cdc-log-topic-prefix` should be set to the following:
```
<datastore_name>.<subscription_name>.<database>.<schema>
```
{{< /hint >}}


## V. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Applier configuration file:
   ```BASH
   vi conf/src/db2.yaml
   ```
2. Make the necessary changes as follows:

   ```YAML
   snapshot:
     threads: 16
     fetch-size-rows: 5_000

     _traceDBTasks: true
     #fetch-schemas-from-system-tables: true

     per-table-config:
     - catalog: tpch
       schema: db2user
       tables:
         lineitem:
           row-identifier-key: [l_orderkey, l_linenumber]

   realtime:
     #threads: 1
     #fetch-size-rows: 10000
     _traceDBTasks: true
     #fetch-interval-s: 0
     #replicate-empty-string-as-null: true #This config is relevant for Delimited message type only.

   #  start-position:
   #    commit-time: '2020-08-24 08:16:38.019002'
   # idempotent-replay: false

     heartbeat:
       enable: true
       catalog: tpch
       schema: db2user
       #table-name: replicate_io_cdc_heartbeat
       #column-name: timestamp
       interval-ms: 10000
   ```

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
