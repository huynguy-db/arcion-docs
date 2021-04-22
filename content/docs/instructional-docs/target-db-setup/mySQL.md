---
title: mySQL
weight: 3
---
# Destination mySQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample mySQL connection configuration file
    ```BASH
    vi conf/conn/mysql_dst.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: MYSQL

    host: localhost
    port: 57565

    username: "replicant"
    password: "Replicant#123"

    max-connections: 30

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

1. Navigate to the mySQL sample applier configuration file
    ```BASH
    vi conf/dst/mysql.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16

      bulk-load:
        enable: true
        type: FILE
    ```
