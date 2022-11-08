---
pageTitle: IBM Db2 as Target
title: IBM Db2
description: "Learn how to set up IBM Db2 as Target for your data pipelines using Arcion IBM Db2 connector."
weight: 17
bookHidden: false
---
# Destination IBM Db2

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Setup Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/db2.yaml
    ```

2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
    
    Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:

    ```YAML
    type: DB2

    database: tpch
    host: localhost
    port: 50002

    username: replicant
    password: "Replicant#123"

    #ssl:
    #  trust-store:
    #    path: '/path/to/truststore'
    #    password: 'Replicant#123'

    max-connections: 30

    max-retries: 10
    retry-wait-duration-ms: 1000

    #proxy-source: false
    ```

## II. Setup Applier Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
    ```BASH
    vi conf/dst/db2.yaml
    ```
2. Make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 16

    #  batch-size-rows: 10_000
    #  txn-size-rows: 1_000_000

    #  bulk-load:
    #    enable: true
    #    type: FILE
    #    save-file-on-error: true
    #    serialize: true

      #deferred-delete: true
      #optimized-upsert: true
      #use-quoted-identifiers: false
    ```

For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").