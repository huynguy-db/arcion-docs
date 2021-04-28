---
title: Cassandra
weight: 5
---
# Source Cassandra

## I. Setup Connection Configuration

1. Navigate to the connection configuration file
    ```BASH
    vi conf/conn/cassadra.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: CASSANDRA

    cassandra-nodes:
      node1:
        host: 172.17.0.2
        port: 9042
        cdc-log-config:
          access-method: SFTP  # access-method can be LOCAL, SFTP
          cdc-log-dir: '/var/lib/cassandra/commitlog' # Enter the path of the directory containing Cassandra commit log.
          cdc-raw-dir: '/var/lib/cassandra/cdc_raw' # Enter the path of the directory containing Cassandra CDC log.
          sftp-config:
            username: 'cassandra' # if access-method is SFTP, provide sftp-username to log on to host using SFTP
            password: 'cassandra' # if access-method is SFTP, provide sftp-password to log on to host using SFTP
            port: 22 # if access-method is SFTP, provide port on which SFTP service is running.

      #If you are using multiple nodes, specify them in this section using the format above

    csv-load-connection:
      storage-location: /path/to/extracted/csvs
      access-method: LOCAL # access-method can be LOCAL, SFTP
      max-connections: 30
      sftp-config:
        username: 'cassandra' # if access-method is SFTP, provide sftp-username to log on to host using SFTP
        password: 'cassandra' # if access-method is SFTP, provide sftp-password to log on to host using SFTP
        port: 22 # if access-method is SFTP, provide port on which SFTP service is runnning.

    username: 'cassandra'
    password: 'cassandra'

    read-consistency-level: LOCAL_QUORUM  #Enter one of the allowed values: ANY, ONE, TWO, THREE, QUORUM, ALL, LOCAL_QUORUM, EACH_QUORUM, SERIAL, LOCAL_SERIAL, LOCAL_ONE

    auth-type: "PlainTextAuthProvider" #Enter one of the allowed values: DsePlainTextAuthProvider, PlainTextAuthProvider

    max-connections: 30 #Enter the maximum number of connections Replicant can open in Cassandra    
    ```
## II. Setup Filter Configuration

1. Navigate to the filter configuration file
    ```BASH
    vi filter/cassandra_filter.yaml
    ```

2. In accordance to you replication needs, specify the data which is to be replicated. Use the format of the example explained below:

    ```yaml
    allow:
      #In this example, data of object type Table in the schema tpch will be replicated
      schema: "tpch"
      types: [TABLE]

      #From schema tpch, only the lineitem, ng_test, and usertable tables will be replicated.
      #Note: Unless specified, all tables in the catalog will be replicated
      allow:
        lineitem:
        #Within lineitem, only the item_one and item_two columns will be replicated
        allow: ["item_one, item_two"]

        ng_test:  
          #Within ORDERS, only the test_one and test_two columns will be replicated as long as they meet the condition $and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}
          allow: ["test_one", "test_two"]
          conditions: "{$and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}"

        usertable: #All columns in the table usertable will be replicated without any predicates
      ```

      The following is a template of the format you must follow:

      ```YAML
      allow:
        schema: <your_schema_name>
        types: <your_object_type>


        allow:
          <your_table_name>:
             allow: ["your_column_name"]
             conditions: "your_condition"

          <your_table_name>:  
             allow: ["your_column_name"]
             conditions: "your_condition"

          <your_table_name>:
            allow: "your_column_name"]
            conditions: "your_condition"         
      ```

3. Using the format shown in the step above (step 2) specify the database, collections, or documents for which will you will be replicating real-time under the ```global-filter``` section

## III. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Mongo

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<user_database>"."<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" BIGINT NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for replication

3. Navigate to the extractor configuration file
   ```BASH
   vi conf/src/cassandra.yaml
   ```

4. Under the Realtime Section, make the necessary changes as follows:
    ```YAML
    realtime:
      heartbeat:
        enable: true
        table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
        column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
    ```
