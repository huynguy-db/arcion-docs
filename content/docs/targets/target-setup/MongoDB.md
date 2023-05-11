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

2. For connecting to the MongoDB server, you can choose between the following methods for an authenticated connection:

    - [Using MongoDB connection string URI](#connect-using-mongodb-connection-string-uri).
    - [Using SSL](#connect-using-ssl).
    - [Using Kerberos authentication](#kerberos-authentication)

    ### Connect using MongoDB connection string URI
    To connect to MongoDB using [connection strings URI](https://www.mongodb.com/docs/manual/reference/connection-string/), specify your credentials in plain text in the connection configuration file like the following sample:

    ```YAML
    type: MONGODB

    url: "mongodb://localhost:27019/?w=majority"

    max-connections: 30

    replica-sets:
      mongors1:
        url: "mongodb://localhost:27017/?w=majority&replicaSet=mongors1"
      mongors2:
        url: "mongodb://localhost:27027/?w=majority&replicaSet=mongors2"
    ```
    For multiple `replica-sets`, specify all of them under `replica-sets` according to the preceding format.
    
    Replicant monitors the `replica-sets` for oplog entries to carry out real-time replication. Each `url` of a MongoDB replica set must represent the `host:port` belonging to the replica set. `url` must contain the option `replicaSet=<replicaSet_name>` to represent the URL as a [replica set](https://docs.mongodb.com/manual/reference/glossary/#std-term-replica-set). 
      
    You can specify additional connection configurations in the `url` string according to the [MongoDB syntax](https://docs.mongodb.com/manual/reference/connection-string/). For example, you can specify number of connections, [Read Concern Options](https://www.mongodb.com/docs/manual/reference/connection-string/#readconcern-options), [Write Concern Options](https://www.mongodb.com/docs/manual/reference/connection-string/#write-concern-options), etc. For more information, see [Connection String Options](https://www.mongodb.com/docs/manual/reference/connection-string/#connection-string-options).
    
    ### Connect using SSL
    To connect to MongoDB using SSL, specify the SSL connection parameters in the `ssl` section of the connection configuration file:

      ```YAML
      ssl:
        key-store:
          path: 'PATH_TO_KEYSTORE'
          password: 'KEYSTORE_PASSWORD'
        trust-store:
          path: 'PATH_TO_TRUST_STORE'
          password: 'TRUSTSTORE_PASSWORD'
      ```

      Replcate the following:

      - *`PATH_TO_KEYSTORE`*: Path to your KeyStore file.
      - *`KEYSTORE_PASSWORD`*: Your KeyStore password.
      - *`PATH_TO_TRUST_STORE`*: Path to your TrustStore file.
      - *`TRUSTSTORE_PASSWORD`*: Your TrustStore password.

    ### Kerberos authentication
    Arcion Replicant supports replication from Kerberized MongoDB clusters. For Kerberos authentication, you have the following options available:

    {{< tabs "kerberos-auth" >}}
    {{< tab "Using host, port, and user principal" >}}
  In this method, you can lay out the connection configuration file in the following manner:

  1. Specify the hostname and port number of your Kerberized MongoDB cluster using the `host` and `port` parameters respectively. If you have replica sets, specify them in the format we discuss in the [Connect using connection strings URI](#connect-using-mongodb-connection-string-uri) section. The hostname must be a fully qualified domain name (FQDN) instead of an IP address.
  2. Under `kerberos` section of the connection configuration file, specify the following:
       - The path to the [`krb5.conf` Kerberos configuration file](https://web.mit.edu/kerberos/krb5-1.12/doc/admin/conf_files/krb5_conf.html) 
       - [User principal](https://www.mongodb.com/docs/manual/core/kerberos/#user-principal)

       User principal name follows this format:

       ```
       <USERNAME>%40<KERBEROS_REALM>
       ```

  
  The following shows a sample connection configuration:

  ```YAML
  type: MONGODB
  host: "routerdst.replicant.io" 
  port: 27017
  max-connections: 3

  replica-sets:
    mongors1:
      host: "shard1dst.replicant.io"
      port: 27017
    mongors2:
      host: "shard0dst.replicant.io"
      port: 27017

  kerberos:
    kerberosConfigFilePath: /etc/krb5.conf
    user-principal: "replicant%40REPLICANT.IO" 
  ```
    {{< /tab>}}

    {{< tab "Using connection string URI" >}}
  In this method, you specify the necessary connection parameters inside the [MongoDB connection string URI](https://www.mongodb.com/docs/manual/reference/connection-string/) and set it as the `url` value in the connection configuration file. This applies to both the Kerberized MongoDB cluster URI and the individual URIs of the replica sets.

  For more information on different components of MongoDB connection string URI, see [Connection string URI components](https://www.mongodb.com/docs/manual/reference/connection-string/#components).

  The connection string follows this format:

  ```
  mongodb://<USER_PRINCIPAL@>HOST[:PORT]/?authSource=$external&authMechanism=GSSAPI
  ```

  The following shows a sample configuration using this method:

  ```YAML
  type: MONGODB
  url: "mongodb://replicant%40REPLICANT.IO@routersrc.replicant.io:27017/?authSource=$external&authMechanism=GSSAPI"
  max-connections: 3

  replica-sets:
    mongors1:
      url: "mongodb://replicant%40REPLICANT.IO@shard1src.replicant.io:27017/?authSource=$external&authMechanism=GSSAPI"
    mongors2:
      url: "mongodb://replicant%40REPLICANT.IO@shard0src.replicant.io:27017/?authSource=$external&authMechanism=GSSAPI"

  max-retries: 1
  retry-wait-duration-ms: 1000
  ```
  
    {{< /tab >}}
    {{< /tabs >}}

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

For a detailed explanation of configuration parameters in the Applier file, read [Applier Reference]({{< ref "../configuration-files/applier-reference" >}} "Applier Reference").