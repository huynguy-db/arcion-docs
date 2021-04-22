---
title: MariaDB
weight: 5
---

# Source: Maria Database

## I. Setup Connection Configuration

1. From ```HOME```, navigate to the connection configuration file
    ```BASH
    vi conf/conn/mariadb_src.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: MARIADB

    host: 127.0.0.1 #Replace 127.0.0.1 with your MariaDB server host name
    port: 3306 ##Replace 3306 with the port number to connect to your MariaDB server

    username: "replicant" #Replace replicant with your username of the user that connects to your oracle server
    password: "Replicant#123" #Replace Replicant#123 with the your user's password

    slave-server-ids: [1]
    max-connections: 30 #Dictate the maximum number of connections replicant can open in MariaDB
    ```


## II. Setup Filter Configuration

1. Navigate to the filter configuration file
    ```BASH
    vi filter/mariadb_filter.yaml
    ```

2. Specify the data which is to be replicated as follows:
    ```yaml
    allow:
    - catalog: "tpch" #Replace tpch with your schema name
      types: [TABLE] #Enter the applicable object type: TABLE or VIEW or TABLE,VIEW

      #Below, you can specify which tables within the schema will be replicated. If not specified, all tables will be replicated. Examples of tables are shown below
      allow:
        NATION: #Replace NATION with the name of the table you want to replicate   
           allow: ["column1, column2"] #Replace column1 and column2 with your column names. If not specified, all columns in your table will be replicated

        ORDERS: #Replace ORDERS with the name of the table you want to replicate   
           #The parameters below are optional
           allow: ["column1", "column2"] #Replace column1 and column2 with your column names. If not specified, all columns in your table will be replicated
           conditions: "o_orderkey < 5000" #Enter the predicate that you want to apply during replication

        PART: #Replace PART with the name of the table you want to replicate   

      #Optionally, you may choose to specify replication patterns as shown below
      allowPattern:
         orders|nation|part #Replace orders|nation|part with your desired patten
       allowPattern:
         orders[0-9]+ #Replace orders[0-9]+ with your desired patten
    ```



## III. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Maria

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<user_database>"."<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" BIGINT NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for replication

3. Navigate to the extractor configuration file
   ```BASH
   vi conf/src/mariadb.yaml
   ```

4. Under the Realtime Section, make the necessary changes as follows:
    ```YAML
    realtime:
      heartbeat:
        enable: true
        table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
        column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
    ```
