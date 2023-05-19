---
pageTitle: Documentation for MongoDB Source connector
title: MongoDB
description: "Arcion supports MongoDB as Source. Learn how to set up MongoDB in your data pipelines and get fast, reliable replications."
url: docs/source-setup/mongodb
bookHidden: false
---

# Source MongoDB

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory.

## I. Set up connection configuration

1. From `$REPLICANT_HOME`, navigate to the connection configuration file:

    ```BASH
    vi conf/conn/mongodb.yaml
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

## II. Set up filter Configuration

1. From `$REPLICANT_HOME`, navigate to the filter configuration file:

    ```BASH
    vi filter/mongodb_filter.yaml
    ```
2. According to your replication needs, specify the data to be replicated. Use the format of the following example:  

    ```yaml
    allow:
    - schema: "tpch"
      types: [TABLE]

      allow:
        lineitem:
        allow: ["item_one, item_two"]

        ng_test:  
          #Within ORDERS, only the test_one and test_two columns will be replicated as long as they meet the condition $and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}
          allow: ["test_one", "test_two"]
          conditions: "{$and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}"

        usertable: #All columns in the table usertable will be replicated without any predicates
      ```

      The preceding sample consists of the following elements:

      - Data of object type `Table` in the schema `tpch` will be replicated.
      - From schema `tpch`, only the `lineitem`, `ng_test`, and `usertable` tables will be replicated.
        {{< hint "info" >}}**Note:** Unless specified, all tables in the catalog will be replicated.{{< /hint >}}
      - Within `lineitem`, only the `item_one` and `item_two` columns will be replicated.
      - From the `ng_test` table, only the `test_one` and `test_two` columns will be replicated as long as they meet the condition specified in `conditions`.

      The preceding sample follows the followig format. You must adhere to this format for specifying your filters.

      ```YAML
      allow:
      - schema: SCHEMA_NAME
        types: OBJECT_TYPE

        allow:
          <your_table_name>:
             allow: ["COLUMN_NAME"]
             conditions: "CONDITION"

          <your_table_name>:  
             allow: ["COLUMN_NAME"]
             conditions: "CONDITION"

          <your_table_name>:
            allow: "COLUMN_NAME"]
            conditions: "CONDITION"         
      ```

      Replace the following:

      - *`SCHEMA_NAME`*: name of your MongoDB schema.
      - *`OBJECT_TYPE`*: object type of data.
      - *`COLUMN_NAME`*: column name.
      - *`CONDITION`*: the condition that must be satisfied in order for the specified columns to undergo replication.

3. Using the same format, specify the database, collections, or documents under the `global-filter` section for carrying out distributed replication across multiple nodes. Global filter is the sum total of all tables, including the Local filters of `snapshot` . For example:

    ```YAML
    global-filter:
      allow:
      - schema: "tpch"
        types: [TABLE]
        allow:
          nation :
          region :
          part :
          supplier :
          partsupp :
          orders :
          customer:
          lineitem:
          ng_test:
            conditions: "{$and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}"
          usertable:
    ```

For a detailed explanation of configuration parameters in the Filter file, see [Filter Reference]({{< ref "../configuration-files/filter-reference" >}} "Filter Reference").

## III. Set up Extractor configuration

1. From `$REPLICANT_HOME`, navigate to the Extractor configuration file:
   ```BASH
   vi conf/src/mongodb.yaml
   ```

2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    For snapshot mode, make the necessary changes as follows in the `snapshot` section of the configuration file:

    ```YAML
    snapshot:
      threads: 16
      fetch-size-rows: 5000

      min-job-size-rows: 1_000
      max-jobs-per-chunk: 32

      split-key: _id
      _traceDBTasks: true
    #  fetch-user-roles: true
    #  fetch-system-tables: true
      normalize:
        enable: true
        de-duplicate: false
    #     extract-upto-depth: 2
      per-table-config:
      - schema: tpch
        tables:
          t1:
            num-jobs: 1
          usertable1:
            split-key: field1
          lineitem:
            normalize:
              de-duplicate: false
              extract-upto-depth: 3
    #       extraction-priority: 2  #Higher value is higher priority. Both positive and negative values are allowed. Default priority is 0 if unspecified.
    ```
    
    ### Parameters related to realtime mode
    If you want to operate in realtime mode, you can use the `realtime` section to specify your configuration. For example:

    ```YAML
    realtime:
      threads: 4
      fetch-size-rows: 10000
      fetch-duration-per-extractor-slot-s: 3
      _traceDBTasks: true
    #   heartbeat:
    #     enable: false
    #     schema: io_replicate
    #     interval-ms: 10_000

      replicate-ddl: true      #use for replicaSet only, not for sharded cluster

    #   start-position:
    #     increment: 1
    #     timestamp-ms: 1598619575000

      normalize:
        enable: true
    #     extract-upto-depth: 2
    ```
 For a detailed explanation of configuration parameters in the Extractor file, see [Extractor Reference]({{< ref "../configuration-files/extractor-reference" >}} "Extractor Reference").