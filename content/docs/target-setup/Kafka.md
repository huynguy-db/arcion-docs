---
pageTitle: Documentation for Apache Kafka as Target
title: Apache Kafka
description: "Seamlessly integrate Kafka as data Target with other platforms using Arcion. Connect via SASL or SSL and configure Applier for real-time data loading."

bookHidden: false
---
# Destination Apache Kafka

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up connection configuration

Specify your Kafka connection details to Replicant with a connection configuration file. You can find a sample connection configuration file `kafka.yaml` in the `$REPLICANT_HOME/conf/conn` directory.

The following sections discuss how to connect to Kafka. In general, Arcion supports four methods of connection. Note that these methods depend on the corresponding settings in Kafka.

### Connect with username and password without any data encryption
This method allows you to connect with username and password without any data encryption. To use this method, specify the connection details in the following manner:
<!-- To connect with username and password while no data encryption, specify your configuration in the following manner: -->

```YAML
type: KAFKA

username: USERNAME
password: PASSWORD

auth-type: SASL

brokers:
  broker1:
    host: HOSTNAME
    port: PORT_NUMBER
  broker2:
    host: HOSTNAME
    port: PORT_NUMBER
  broker3:
    host: HOSTNAME
    port: PORT_NUMBER
```

Replace the following:
- *`USERNAME`*: the username to connect to the Kafka server
- *`PASSWORD`*: the password associated with *`USERNAME`*
- *`HOSTNAME`*: the hostname fo Kafka broker
- *`PORT_NUMBER`*: the port number of Kafka broker

To use this method, you must enable username and password-based authentication on Kafka broker. This method of authentication corresponds to [Kafka’s `SASL_PLAINTEXT`  authentication mechanism](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html#configuring-plain).

### Connect with username and password with SSL for data encryption
This method allows you to connect with username and password while using SSL for data encryption. To use this method, specify the connection details in the following manner:
<!-- To connect with username and password using SSL for data encryption, specify your configuration in the following manner: -->

```YAML
type: KAFKA

username: USERNAME
password: PASSWORD

auth-type: SASL
ssl:
  enable: true
  trust-store:
    path: "PATH_TO_TRUSTSTORE"
    password: "TRUSTSTORE_PASSWORD"

brokers:
  broker1:
    host: HOSTNAME
    port: PORT_NUMBER
  broker2:
    host: HOSTNAME
    port: PORT_NUMBER
  broker3:
    host: HOSTNAME
    port: PORT_NUMBER
```

Replace the following:
- *`USERNAME`*: the username to connect to the Kafka server
- *`PASSWORD`*: the password associated with *`USERNAME`*
- *`HOSTNAME`*: the hostname of Kafka broker
- *`PORT_NUMBER`*: the port number of Kafka broker
- *`PATH_TO_TRUSTSTORE`*: path to the TrustStore with JKS type
- *`TRUSTSTORE_PASSWORD`*: the TrustStore password

To use this method, you must enable username and password-based authentication and data encryption on Kafka broker. For more information, see [Security Tutorial](https://docs.confluent.io/platform/current/security/security_tutorial.html#security-tutorial).

### Connect without username and password with no data encryption
This method allows you to connect without username and password with no data encryption. To use this method, specify the connection details in the following manner:

```YAML
type: KAFKA

auth-type: NONE

brokers:
  broker1:
    host: HOSTNAME
    port: PORT_NUMBER
  broker2:
    host: HOSTNAME
    port: PORT_NUMBER
  broker3:
    host: HOSTNAME
    port: PORT_NUMBER
```

Replace the following:
- *`HOSTNAME`*: the hostname of broker server
- *`PORT_NUMBER`*: the port number of broker server

### Use SSL for both connection and data encryption
This method provides both client authentication and data encryption using SSL. To use this method, specify your connection details in the following manner:

```YAML
type: KAFKA

auth-type: SSL
ssl:
  enable: true
  trust-store:
    path: "PATH_TO_TRUSTSTORE"
    password: "TRUSTSTORE_PASSWORD"
  key-store:
    path: "PATH_TO_KEYSTORE"
    password: "KEYSTORE_PASSWORD"
      
brokers:
  broker1:
    host: HOSTNAME
    port: PORT_NUMBER
  broker2:
    host: HOSTNAME
    port: PORT_NUMBER
  broker3:
    host: HOSTNAME
    port: PORT_NUMBER
```

Replace the following:
- *`USERNAME`*: the username to connect to the Kafka server
- *`PASSWORD`*: the password associated with *`USERNAME`*
- *`HOSTNAME`*: the hostname of Kafka broker
- *`PORT_NUMBER`*: the port number of Kafka broker
- *`PATH_TO_TRUSTSTORE`*: path to the TrustStore with JKS type
- *`TRUSTSTORE_PASSWORD`*: the TrustStore password
- *`PATH_TO_KEYSTORE`*: path to the KeyStore with JKS type
- *`KEYSTORE_PASSWORD`*: the KeyStore password

To use this method, you must enable SSL-based client authentication and data encryption on Kafka broker. For more information, see [Encrypt and Authenticate with TLS
](https://docs.confluent.io/platform/current/kafka/authentication_ssl.html#encrypt-and-authenticate-with-tls).

## II. Configure mapper file (optional)
If you want to define data mapping from your source to Kafka, specify the mapping rules in the mapper file. For more information on how to define the mapping rules and run Replicant CLI with the mapper file, see [Mapper Configuration]({{< ref "/docs/references/mapper-reference" >}}).

When mapping source object names to Kafka topics, you can choose between two delimiters for topic names. For more information, see [Delimiter in Kafka topic and Redis stream names]({{< ref "/docs/references/mapper-reference#delimiter-in-kafka-topic-and-redis-stream-names" >}}).

## III. Set up Applier configuration    

1. From `$REPLICANT_HOME`, naviagte to the sample Kafka Applier configuration file:
   ```BASH
   vi conf/dst/kafka.yaml
   ```
2. The configuration file can contain global Applier parameters followed by snapshot and realtime parameters:

    - [Global configuration parameters](#global-configuration-parameters)
    - [Parameters related to snapshot mode](#parameters-related-to-snapshot-mode)
    - [Parameters related to realtime mode](#parameters-related-to-realtime-mode)

    ### Global configuration parameters
    Global configuration parameters live at the topmost level of the Applier configuration file. So you _must_ specify them at the topmost place of the Applier configuration file. Since these parameters are defined globally, they affect both snapshot and real-time replication.
    
    The following global Applier configuration parameters are available.

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

    #### `split-topic`
    `true` or `false`.

    Creates a separate topic for snapshot and CDC data if `true`. If `false`, a single topic contains the data for snapshot and CDC. `split-topic` is a global parameter for `realtime` mode. So you can't change it on a per-table basis.

    _Default: `true`._
    {{< hint "info" >}} `split-topic` is applicable _only_ when [`replication-format`](#replication-format) is set to `JSON`.
    {{< /hint >}}

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