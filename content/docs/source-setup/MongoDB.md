---
title: MongoDB
weight: 3
bookHidden: false
---

# Source MongoDB

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the connection configuration file:

    ```BASH
    vi conf/conn/mongodb.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: MONGODB

    url: "mongodb://localhost:27019/?w=majority" #enter Mongo's connection URL

    max-connections: 30 #Specify the maximum number of connections replicant can open in MongoDB

    replica-sets:
      mongors1: #Replace "mongors1" with your replica set name
        url: "mongodb://localhost:27017/?w=majority&replicaSet=mongors1" #Enter the URL for given replica set including sockets for all nodes
      mongors2: #Replace mongors2 with your second replica set name
        url: "mongodb://localhost:27027/?w=majority&replicaSet=mongors2" #Enter the URL for given replica set including sockets for all nodes

      #If you have multiple replica-sets for replication, specify all of them here using the format explained above. A sample second replica-set is also shown below:
    ```

    - The `replica-sets` are monitored for oplog entries for carrying out real-time replication. Each `url` of a MongoDB replica set should represent the `host:port` belonging to the replica set. `url` should contain the option `replicaSet=<replicaSet_name>` to denote it as a [replica set](https://docs.mongodb.com/manual/reference/glossary/#std-term-replica-set). 
      
      You can specify additional connection configurations in the `url` string in accordance with the [MongoDB syntax](https://docs.mongodb.com/manual/reference/connection-string/). For example, you can specify number of connections, [Read Concern Options](https://www.mongodb.com/docs/manual/reference/connection-string/#readconcern-options), [Write Concern Options](https://www.mongodb.com/docs/manual/reference/connection-string/#write-concern-options), etc. For more information, see [Connection String Options](https://www.mongodb.com/docs/manual/reference/connection-string/#connection-string-options).
    - If you want to connect to MongoDB using SSL, you can specify the SSL connection parameters in the `ssl` section of the connection configuration file:

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

## II. Set up Filter Configuration

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

      The preceeding sample follows the followig format. You must adhere to this format for specifying your filters.

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

3. Using the same format, specify the database, collections, or documents that will be part of real-time replication under the `global-filter` section. For example:

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

For a detailed explanation of configuration parameters in the Filter file, see [Filter Reference]({{< ref "/docs/references/filter-reference" >}} "Filter Reference")

## III. Set up Extractor Configuration

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
 For a detailed explanation of configuration parameters in the Extractor file, see [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").