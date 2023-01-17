---
pageTitle: Documentation for MongoDB Target connector
title: MongoDB
description: "Migrate terabytes of data to MongoDB with automatic schema conversion, powered by CDC."

bookHidden: false
---

# Destination MongoDB

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the connection configuration file:

    ```BASH
    vi conf/conn/mongodb_dst.yaml
    ```

2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
    
    Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:
    ```YAML
    type: MONGODB

    url: "mongodb://localhost:27018/?w=majority" #MongoDB connection URL

    max-connections: 30 #max number of connections Replicant can open in MongoDB

    #ssl:
    #  key-store:
    #    path: '/path/to/key/store'
    #    password: 'ChangePassword'
    #  trust-store:
    #    path: '/path/to/trust/store'
    #    password: 'ChangePassword'
    ```

## II. Set up Applier Configuration

1. From `$REPLICANT_HOME`, navigate to the Applier configuration file:
   ```BASH
   vi conf/dst/mongodb.yaml
   ```

2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    For snapshot mode, make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 16

      batch-size-rows: 5000
      txn-size-rows: 5000
    #  map-key-to-id: false
    #  skip-tables-on-failures : false
      bulk-load:
        enable: false
        type: FILE   # PIPE, FILE
      handle-failed-opers: true
      initIndexesPostSnapshot: true
    #   denormalize:
    #     enable: true
    #  user-role:
    #    init-user-roles: true
    #  init-system-tables: true
    ```
    ### Parameters related to realtime mode
    For operating in realtime mode, use the `realtime` section to specify your configuration. Below is a sample config:

    ```YAML
    realtime:
      threads: 8
      batch-size-rows: 1000
      txn-size-rows: 2_0000
      handle-failed-opers: true
    #  map-key-to-id: false
    #  skip-tables-on-failures : false
    #   perTableConfig:
    #   - schema: tpch
    #     tables:
    #       CUSTOMER:
    #         skip-upto-cursor: '{"extractorId":0,"replicaSetName":"mongors1","resumeToken":6868517489379115009,"seqNum":3,"v":1,"timestamp":1599201348000}'

    # Transactional mode config
    # realtime:
    #   threads: 1
    #   batch-size-rows: 1000
    #   replay-consistency: GLOBAL #allowed values are GLOBAL/EVENTUAL
    #   txn-group-count: 100
    #   skip-upto-cursors: ['{"extractorId":0,"replicaSetName":"mongors1","resumeToken":6868517489379115009,"seqNum":3,"v":1,"timestamp":1599201348000}']

For a detailed explanation of configuration parameters in the Applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").