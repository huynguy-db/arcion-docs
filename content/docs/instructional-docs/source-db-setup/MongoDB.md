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

    url: "mongodb://localhost:27019/?w=majority" #Inside the quotes, enter the URL path for your MongoDB server

    max-connections: 30 #Dictate the maximum number of connections replicant can open in postgresql

    replica-sets:
      mongors1: #Replace "mongors1" with your replica set name
        url: "mongodb://localhost:27017/?w=majority" #Inside the quotes, enter the URL of your mongo replica set that contains all of the host:port belonging to the set

      #If you have multiple replica-sets for replication, specify all of them here using the format explained above. A sample second replica-set is also shown below:

      mongors2: #Replace "mongors2" with your replica set name
        url: "mongodb://localhost:27027/?w=majority" #Inside the quotes, enter the URL of your mongo replica set that contains all of the host:port belonging to the set
    ```

## II. Setup Filter Configuration

1. 1. Navigate to the filter configuration file
    ```BASH
    vi filter/mongodb_filter.yaml
    ```
2. Specify the database, collections, documents you want to replicate in snapshot mode as follows:

    ```YAML
    allow:
    - schema: "tpch" #Replace tpch with your schema name
      types: [TABLE] #Enter the applicable object type: TABLE or VIEW or TABLE,VIEW

      #Below, you can specify which tables within the schema will be replicated. If not specified, all tables will be replicated.
      allow:
        lineitem: #Replace lineitem with the name of the table you want to replicate

        #The parameters below are optional
          allow: [column1, column2] #You may replace column1, column2 with a list of specific columns within this table you want to replicate.
          #To replicate all columns in this table, remove this configuration
          conditions: "{$and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}" #Enter the predicate that you want to apply during replication

        ng_test: #Replace ng_test with the name of the table you want to replicate

          #The parameters below are optional
          block: [column1, column2] #You may replace column1, column2 with a list of columns to blacklist within this table;
          #all other columns will be allowed
          conditions: "{$and: [{c1: {$gt : 1}}, {c1: {$lt : 9}}]}" #Enter the predicate that you want to apply during replication

        usertable: #Replace usertable with the name of the table you want to replicant
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
   vi conf/src/mongodb.yaml
   ```

4. Under the Realtime Section, make the necessary changes as follows:
    ```YAML
    realtime:
      heartbeat:
        enable: true
        table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
        column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
    ```
