---
title: Mongo Database
weight: 3
---

# Source Mongo Database

## I. Setup Connection Configuration

1. Navigate to the connection configuration file
    ```BASH
    vi conf/conn/mongodb.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: MONGODB

    url: "mongodb://localhost:27019/?w=majority" #enter mongo's connection URL

    max-connections: 30 #Specify the maximum number of connections replicant can open in MongoDB

    replica-sets:
      mongors1: #Replace "mongors1" with your replica set name
        url: "mongodb://localhost:27017/?w=majority&replicaSet=mongors1" #Enter the URL for given replica set including sockets for all nodes
      mongors2: #Replace mongors2 with your second replica set name
        url: "mongodb://localhost:27027/?w=majority&replicaSet=mongors2" #Enter the URL for given replica set including sockets for all nodes

      #If you have multiple replica-sets for replication, specify all of them here using the format explained above. A sample second replica-set is also shown below:
    ```

## II. Setup Filter Configuration

1. 1. Navigate to the filter configuration file
    ```BASH
    vi filter/mongodb_filter.yaml
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




3. Using the format shown in the step above (step 2) specify the database, collections, or documents  which will be part of real-time replication under the ```global-filter``` section

## III. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Mongo

1. Create a heartbeat table in the schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<user_database>"."<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" BIGINT NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for replication

3. Navigate to the extractor configuration file
   ```BASH
   vi conf/src/mongodb.yaml
   ```

4. Under the Realtime Section, make the necessary changes as follows:
    ```YAML
    realtime:
      heartbeat:
        enable: true
        schema-name: "Replicant" #Replace Replicant with the name of the schema your heartbeat table is in
        table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
        column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
    ```
