---
title: YugabyteSQL
weight: 7
---
# Destination YugabyteSQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample memSQL connection configuration file
    ```BASH
    vi conf/conn/memsql.yaml
    ```
2. Make the necessary changes as follows:

    ```YAML
    type: YUGABYTESQL

    host: localhost
    port: 5433

    database: 'io'
    username: 'replicant'
    password: 'Replicant#123'

    max-connections: 30
    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

1. Naviagte to the sample YugabyteSQL applier configuration file
    ```BASH
    vi conf/dst/yugabytesql.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
     threads: 16


     bulk-load:
       enable: true
       type: FILE   # PIPE, FILE
    ```
