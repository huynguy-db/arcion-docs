---
pageTitle: Documentation for Apache Kafka as Target
title: Apache Kafka
description: "Seamlessly integrate Kafka as data Target with other platforms using Arcion. Connect via SASL or SSL and configure Applier for real-time data loading."

bookHidden: false
---
# Destination Apache Kafka

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample Kafka connection configuration file:
    ```BASH
    vi conf/conn/kafka.yaml
    ```
2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
    
    Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:
    ```YAML
    type: KAFKA

    username: 'replicant' #Replace replicant with the username of your user that connects to your Kafka server
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    #ssl:
    #  enable: true
    #  trust-store:
    #      path: "<path>/kafka.server.truststore.jks"
    #      password: "<password>"

    #Multiple Kafka brokers can be specified using the format below:
    brokers:
       broker1: #Replace broker1 with your broker name
           host: localhost #Replace localhost with your broker's host
           port: 19092 #Replace 19092 with your broker's port
       broker2: #Replace broker2 with your broker name
           host: localhost #Replace localhost with your broker's host
           port: 29092 #Replace 29092 with your broker's port

    _timeout-sec: 30
    max-retries: #Number of times any operation on the system will be re-attempted on failures.
    retry-wait-duration-ms : #Duration in milliseconds replicant should wait before performing then next retry of a failed operation
    ```
      - The `username` and `password` correspond to plain SASL mechanism for authentication. For more information, see [Authentication with SASL using JAAS](https://docs.confluent.io/platform/current/kafka/authentication_sasl/index.html).
      - For help with creating SSL keys and certificates to connect to Kafka over SSL, see [Creating SSL Keys and Certificates](https://docs.confluent.io/platform/current/security/security_tutorial.html#generating-keys-certs).
      - The `_timeout-sec` configuration sets the following Kafka AdminClient timeout parameters:
        - [`request.timeout.ms`](https://docs.confluent.io/platform/current/installation/configuration/admin-configs.html#adminclientconfigs_request.timeout.ms)
        - [`default.api.timeout.ms`](https://docs.confluent.io/platform/current/installation/configuration/admin-configs.html#adminclientconfigs_default.api.timeout.ms)

        *Default: `30` seconds*

## II. Set up Applier Configuration    

1. From `$REPLICANT_HOME`, naviagte to the sample Kafka Applier configuration file:
   ```BASH
   vi conf/dst/kafka.yaml
   ```
2. The configuration file can contain global Applier parameters followed by snapshot and realtime parameters:

    - Global configuration parameters
    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Global configuration parameters
    Global configuration parameters live at the global scope of the Applier configuration file. So you _must_ specify them at the topmost place of the Applier configuration file. Since these parameters are defined globally, they affect both snapshot and real-time replication.
    
    The following global Applier configuration parameters are available.

    #### `split-topic`
    `true` or `false`.

    Creates a separate topic for snapshot and CDC data if `true`. If `false`, a single topic contains the data for snapshot and CDC.

    #### `replication-format`
    The structure of the published events.

    The following values are allowed:

    - [`NATIVE`]({{< ref "docs/references/cdc-format/native-format" >}})
    - [`JSON`]({{< ref "docs/references/cdc-format/json-cdc-format" >}})

    ### Parameters related to snapshot mode
    For snapshot mode, the following Kafka-specific parameters are available:

    #### `replication-factor` *[v21.12.02.6]*
    Replication factor for data topics. For Kafka cluster setup this defines the factor in which Kafka topic partitions are replicated on different brokers. We pass this config value to Kafka and Kafka drives the partition level replication.

    #### `num-shards` *[v21.12.02.6]*
    Number of partitions per data topic. By default this is set to a number of applier threads for getting the best possible scaling by allowing each individual applier thread to write to an independent partition of a Kafka topic.

    #### `shard-key` *[v21.12.02.6]*
    Shard key to be used for partitioning data topics.

    #### `shard-function` *[v21.12.02.6]*
    Sharding function to be used to deduce the partition allotment based on `shard-key` for all data topics. Values allowed are `MOD` and `NONE`.

      *Default: By default, this parameter is set to `NONE`, meaning Kafka will use it’s partitioning algorithm.*

    #### `kafka-compression-type` *[v20.05.12.3]*
    Compression type. Allowed values are `lz4`, `snappy`, `gzip`, and `none`.

      *Default: By default, this parameter is set to `lz4`.*

    #### `kafka-batch-size-in-bytes` *[v20.05.12.3]*
    Batch size for Kafka producer.
    
      *Default: By default, this parameter is set to `100000`.*

    #### `kafka-buffer-memory-size-in-bytes*` *[v20.05.12.3]*
    Memory allocated to Kafka client to store unsent messages. (Default set to 67108864)

      *Default: By default, this parameter is set to `67108864`.*

    #### `kafka-linger-ms` *[v20.05.12.3]*
    Config used to give more time for Kafka batches to fill (in milliseconds).

      *Default: By default, this parameter is set to `10`.*

    #### `kafka-interceptor-classes` *[v21.09.17.2]*
    Config used to specify list of interceptor classes. It corresponds to Kafka’s `ProducerConfig.INTERCEPTOR_CLASSES_CONFIG.`
    #### `producer-max-block-ms` *[v22.07.19.7]*
    Corresponds to the [`max.block.ms` parameter of Kafka Producer](https://docs.confluent.io/platform/current/installation/configuration/producer-configs.html#producerconfigs_max.block.ms).

      *Default: Default value is `60_000`.*

    #### `create-topic-timeout-ms` *[v22.07.19.7]*
    Specifies the timeout for topic creation.

      *Default: Default value is `60_000`.*

    #### `per-table-config` *[v20.12.04.6]*
    This configuration allows you to specify various properties for target tables on a per table basis like the following:
      <dl class="dl-indent">
       <dt><code>replication-factor</code> <i>[v21.12.02.6]</i></dt>
       <dd>Replication factor for data topics. For Kafka cluster setup, this defines the factor in which Kafka topic partitions are replicated on different brokers. We pass this config value to Kafka and Kafka drives the partition level replication.</dd>

      <dt><code>num-shards</code> <i>[v21.12.02.6]</i></dt>
       <dd>Number of partitions per data topic. By default this is set to a number of applier threads for getting the best possible scaling by allowing each individual applier thread to write to an independent partition of a Kafka topic.</dd>

      <dt><code>shard-key</code> <i>[v21.12.02.6]</i></dt>
       <dd>Shard key to be used for partitioning data topic.</dd>

      <dt><code>shard-function</code> <i>[v21.12.02.6]</i></dt>
       <dd>Sharding function to be used to deduce the partition allotment based on `shard-key` for all data topics. Values allowed are <code>MOD</code> and <code>NONE</code>. 
       
      <i>Default: By default, this parameter is set to `NONE`, meaning Kafka will use it’s partitioning algorithm.</i></dd>
      </dl>

    Below is a sample config for `snapshot` mode:

    ```YAML
    snapshot:
      threads: 16
      txn-size-rows: 10000
      replication-factor: 1
      schema-dictionary: SCHEMA_DUMP  # Allowed values: POJO | SCHEMA_DUMP| NONE
      kafka-compression-type: lz4
      kafka-batch-size-in-bytes: 100000
      kafka-buffer-memory-size-in-bytes: 67108864
      kafka-linger-ms: 10
      skip-tables-on-failures : false
      kafka-interceptor-classes: ["KafkaInterceptors.SampleInterceptor"]
      producer-max-block-ms: 60_000
      create-topic-timeout-ms: 100_000
    ```
    ### Parameters related to realtime mode
    If you want to operate in realtime mode, you can use a `realtime` section to specify your configuration. The following Kafka-specific parameters are available:

    #### `replication-factor` *[v21.12.02.6]*
    Replication factor for CDC topics. For Kafka cluster setup this defines the factor in which Kafka topic partitions are replicated on different brokers. We pass this config value to Kafka and Kafka drives the partition level replication.

    #### `num-shards`*[v21.12.02.6]* 
    Number of partitions to be created for all CDC log topics.
    
    #### `shard-key` *[v21.12.02.6]*
    Shard key to be used for partitioning CDC logs in all target topics.
    
    #### `shard-function` *[v21.12.02.6]*
    Sharding function to be used to deduce the partition allotment based on `shard-key` for all CDC log topics. Values allowed are `MOD` and `NONE`.

      *Default: By default, this parameter is set to `NONE`, meaning Kafka will use it’s partitioning algorithm.*

    #### `kafka-compression-type` *[v20.05.12.3]*
    Compression type. Allowed values are `lz4`, `snappy`, `gzip`, and `none`.

      *Default: By default, this parameter is set to `lz4`.*

    #### `kafka-batch-size-in-bytes` *[v20.05.12.3]*
    Batch size for Kafka producer.
    
      *Default: By default, this parameter is set to `100000`.*

    #### `kafka-buffer-memory-size-in-bytes*` *[v20.05.12.3]*
    Memory allocated to Kafka client to store unsent messages. (Default set to 67108864)

      *Default: By default, this parameter is set to `67108864`.*

    #### `kafka-linger-ms` *[v20.05.12.3]*
    Config used to give more time for Kafka batches to fill (in milliseconds).

      *Default: By default, this parameter is set to `10`.*

    #### `kafka-interceptor-classes` *[v21.09.17.2]*
    Config used to specify list of interceptor classes. It corresponds to Kafka’s `ProducerConfig.INTERCEPTOR_CLASSES_CONFIG.`
    
    #### `producer-max-block-ms` *[v22.07.19.7]*
    Corresponds to the [`max.block.ms` parameter of Kafka Producer](https://docs.confluent.io/platform/current/installation/configuration/producer-configs.html#producerconfigs_max.block.ms).

      *Default: Default value is `60_000`.*

    #### `create-topic-timeout-ms` *[v22.07.19.7]*
    Specifies the timeout for topic creation.

      *Default: Default value is `60_000`.*

    #### `per-table-config` *[v20.12.04.6]*
    This configuration allows you to specify various properties for target tables on a per table basis like the following:
      <dl class="dl-indent">
       <dt><code>replication-factor</code> <i>[v21.12.02.6]</i></dt>
       <dd>Replication factor for data topics. For Kafka cluster setup, this defines the factor in which Kafka topic partitions are replicated on different brokers. We pass this config value to Kafka and Kafka drives the partition level replication.</dd>

      <dt><code>num-shards</code> <i>[v21.12.02.6]</i></dt>
       <dd>Number of partitions per data topic. By default this is set to a number of applier threads for getting the best possible scaling by allowing each individual applier thread to write to an independent partition of a Kafka topic.</dd>

      <dt><code>shard-key</code> <i>[v21.12.02.6]</i></dt>
       <dd>Shard key to be used for partitioning data topic.</dd>

      <dt><code>shard-function</code> <i>[v21.12.02.6]</i></dt>
       <dd>Sharding function to be used to deduce the partition allotment based on `shard-key` for all data topics. Values allowed are <code>MOD</code> and <code>NONE</code>.

      <i>Default: By default, this parameter is set to `NONE`, meaning Kafka will use it’s partitioning algorithm.</i></dd>
      </dl>
    
    Below is a sample config for `realtime` mode:

    ```YAML
    realtime:
      txn-size-rows: 1000
      before-image-format: ALL  # Allowed values : KEY, ALL
      after-image-format: ALL   # Allowed values : UPDATED, ALL
      kafka-compression-type: lz4
      shard-key: id
      num-shards: 1
      shard-function: MOD # Allowed values: MOD, NONE. NONE means storage will use its default sharding
      skip-tables-on-failures : false
      producer-max-block-ms: 60_000
      create-topic-timeout-ms: 100_000

      per-table-config:
      - tables:
          io_blitzz_nation:
            shard-key: id
            num-shards: 16 #default: 1
            shard-function: NONE
          io_blitzz_region:
            shard-key: id
          io_blitzz_customer:
            shard-key: custkey
            num-shards: 16
    ```

{{< hint "warning" >}}
**Attention:**
- During replication, Replicant stores metadata information related to replicated tables in a special topic with the prefix `replicate_io_replication_schema`. You can configure the replication factor and partitioning for this topic using the `replication-factor` and `num-shards` parameters respectively in [the `snapshot` section of the Applier configuration file](#parameters-related-to-snapshot-mode). _You must set these parameters for the metadata topic in [the `snapshot` section of your Applier configuration file](#parameters-related-to-snapshot-mode)_, even if you're operating in realtime mode. Metadata topic is common to `snapshot`, `realtime`, and `full` modes of Replicant. So its settings are included in the `snapshot` section.
 
  
  For more information about how different Replicant modes work, see [Running Replicant]({{< ref "docs/running-replicant" >}}).

- Replicant uses Kafka’s transactional API for writing data in batches to Kafka. Transactional API ensures exactly-once delivery semantics.

- Replicant doesn’t address realtime changes for views when replicating from the following databases to Kafka:

  - [Informix]({{< ref "docs/source-setup/informix" >}})

  - [PostgreSQL]({{< ref "docs/source-setup/postgresql" >}})
{{< /hint >}}

For a detailed explanation of configuration parameters in the applier file, see [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").