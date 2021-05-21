---
title: Kafka
weight: 11
bookHidden: true
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
       broker3: #Replace broker3 with your broker name
           host: localhost #Replace localhost with your broker's host
           port: 39092 #Replace 39092 with your broker's port
        .
        .
        .
        .

    max-connections: 30 #Specify the maximum number of connections Replicant can open in Kafka
    ```

## II. Setup Applier Configuration    

1. Navigate to the Applier Configuration File:
   ```BASH
   vi conf/dst/kafka.yaml
   ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
     threads: 16 #Specify the maximum number of threads Replicant should use for writing to the target

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

    #per-table-config:
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
