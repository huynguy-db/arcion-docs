---
title: Cassandra
weight: 6
---
# Destination Cassandra

## I. Setup Connection Configuration

1. From ```HOME```, navigate to the sample connection configuration file
    ```BASH
    vi conf/conn/cassandra.yaml
    ```

2. Make the necessary changes as follows:

    ```YAML
    type: CASSANDRA

    cassandra-nodes:
      node1:
        host: 172.17.0.2
        port: 9042
      node2:
        host:
        port:    

    username: 'cassandra'
    password: 'cassandra'

    read-consistency-level: LOCAL_QUORUM  #Allowed values: ANY, ONE, TWO, THREE, QUORUM, ALL, LOCAL_QUORUM, EACH_QUORUM, SERIAL, LOCAL_SERIAL, LOCAL_ONE

    auth-type: "PlainTextAuthProvider" #Allowed values: DsePlainTextAuthProvider, PlainTextAuthProvider

    max-connections: 30
    max-requests-per-connection: #max number of requests each connection will handle in parallel.
    max-request-queue-size: #Max queue size to enqueue requests while all connections are busy. If more than max-queue-size request get queued, then driver throws BusyPoolException.
    pool-timeout-ms: #Time in ms, after which driver throws BusyPoolException, if all connections are busy serving max requests.


    max-retries: 10
    retry-wait-duration-ms: 1000

    ```


## II. Setup Applier Configuration

If you want to change the table definitions in destination memSQL, change the applier configurations with the proceeding steps:  

1. From ```HOME```, navigate to the Applier Configuration File:
   ```BASH
    vi conf/dst/cassandra.yaml
    ```

2. Make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 32

      batch-size-rows: 100
      #transaction-size-rows: 1_000_000
      skip-tables-on-failures : true
      _traceDBTasks: true

      keyspaces:
        tpch:
          replication-property: "{'class' : 'SimpleStrategy' , 'replication_factor' : 1}"
          durable-writes: true

      bulk-load:
        enable: true #Enable bulk-load only if cqlsh is installed on the machine.
        type: FILE

    ```
