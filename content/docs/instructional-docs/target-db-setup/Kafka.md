---
title: Kafka
weight: 11
---
# Destination Kafka

## I. Setup Connection Configuration

1. From ```HOME```, navigate to the sample connection configuration file
    ```BASH
    vi conf/conn/cassandra.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: KAFKA

    username: 'replicant'
    password: 'Replicant#123'

    #ssl:
    #  enable: true
    #  trust-store:
    #      path: "<path>/kafka.server.truststore.jks"
    #      password: "<password>"

    brokers:
       broker1:
           host: localhost
           port: 19092  
       broker2:
           host: localhost
           port: 29092
       broker3:
           host: localhost
           port: 39092

    max-connections: 30
    ```

## II. Setup Applier Configuration    

1. Navigate to the Applier Configuration File:
   ```BASH
   vi conf/dst/kafka.yaml
   ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
     threads: 16

     replication-factor: 1
     schema-dictionary: SCHEMA_DUMP  # Allowed values: POJO | SCHEMA_DUMP| NONE
     kafka-compression-type: lz4
     kafka-batch-size-in-bytes: 100000
     kafka-buffer-memory-size-in-bytes: 67108864
     kafka-linger-ms: 10

    realtime:
     before-image-format: ALL  # Allowed values : KEY, ALL
     after-image-format: ALL   # Allowed values : UPDATED, ALL
    # shard-key: id
    # num-shards: 1
    # shard-function: MOD # Allowed values: MOD, NONE. NONE means storage will use its default sharding

    # per-table-config:
    # - tables:
    #     io_blitzz_nation:
    #       shard-key: id
    #       num-shards: 16 #default: 1
    #       shard-function: NONE
    #     io_blitzz_region:
    #       shard-key: id
    #     io_blitzz_customer:
    #       shard-key: custkey
    #       num-shards: 16
    ```
