---
title: YugabyteCQL
weight: 8
---
# Destination YugabyteCQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample YugabyteCQL connection configuration file
    ```BASH
    vi conf/conn/memsql.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: YUGABYTE_CQL

    cassandra-nodes:
      node1:
        host: 172.17.0.2
        port: 9042

    username: 'replicant'
    password: 'Replicant#123'

    #read-consistency-level: LOCAL_QUORUM  #Allowed values: ANY, ONE, TWO, THREE, QUORUM, ALL, LOCAL_QUORUM, EACH_QUORUM, SERIAL, LOCAL_SERIAL, LOCAL_ONE
    #write-consistency-level: LOCAL_QUORUM #Allowed values: ANY, ONE, TWO, THREE, QUORUM, ALL, LOCAL_QUORUM, EACH_QUORUM, SERIAL, LOCAL_SERIAL, LOCAL_ONE

    max-connections: 30
    ```

## II. Setup Applier Configuration

1. Navigate to the sample YugabyteCQL applier configuration file
    ```BASH
    vi conf/dst/yugabytecql.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16

      bulk-load:
        enable: false
        type: FILE   # PIPE, FILE
    ```
