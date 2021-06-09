---
title: MySQL
weight: 4
bookHidden: false
---
# Source MySQL

## I. Setup Connection Configuration

1. From ```$REPLICANT_HOME```, navigate to the connection configuration file
    ```BASH
    vi conf/conn/mysql_src.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: MYSQL

    host: 127.0.0.1 #Replace 127.0.0.1 with your MySQL server host name
    port: 3306 #Replace the 3306 with the port of your host

    username: "replicant" #Replace replicant with your username of the user that connects to your MySQL server
    password: "Replicant#123" #Replace Replicant#123 with the your user's password

    slave-server-ids: [1]
    max-connections: 30 #Maximum number of connections replicant can open in MySQL
    ```

## II. Setup Filter Configuration

1. Navigate to the filter configuration file
    ```BASH
    vi filter/mysql_filter.yaml
    ```

2. In accordance to you replication needs, specify the data which is to be replicated. Use the format of the example explained below.  

    ```yaml
    allow:
      #In this example, data of object type Table in the catalog tpch will be replicated
      catalog: "tpch"
      types: [TABLE]

      #From catalog tpch, only the NATION, ORDERS, and PART tables will be replicated.
      #Note: Unless specified, all tables in the catalog will be replicated
      allow:
        NATION:
           #Within NATION, only the US and AUS columns will be replicated
           allow: ["US, AUS"]

        ORDERS:  
           #Within ORDERS, only the product and service columns will be replicated as long as they meet the condition o_orderkey < 5000
           allow: ["product", "service"]
           conditions: "o_orderkey < 5000"

        PART: #All columns in the table PART will be replicated without any predicates
    ```

    The following is a template of the format you must follow:

    ```YAML
    allow:
      catalog: <your_catalog_name>
      types: <your_object_type>


      allow:
        <your_table_name>:
          allow: ["your_column_name"]
          condtions: "your_condition"

        <your_table_name>:  
          allow: ["your_column_name"]
          conditions: "your_condition"

        <your_table_name>:
          allow: ["your_column_name"]
          conditions: "your_condition"            
    ```


## III. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source MySQL

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<user_database>"."replicate_io_cdc_heartbeat"(
     "timestamp" BIGINT NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges for the heartbeat table to the user configured for replication

3. Navigate to the extractor configuration file
   ```BASH
   vi conf/src/mysql.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows:
    ```YAML
    realtime:
      heartbeat:
        enable: true
        catalog: tpch #Replace tpch with the name of the catalog containing your heartbeat table
        table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
        column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
    ```
