---
title: MySQL
weight: 4
bookHidden: false
---
# Source MySQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory.

## I. Install mysqlbinlog Utility on Replicate Host

1. Install a compatible mysqlbinlog utility (compatible with the source MySQL server) on the machine where replicate will be running
  * **Note**: The easiest way to install the correct mysqlbin log utility is to install the the the same MySQL server version as your source MySQL System. After installation, you can stop this MySQL server running on replicate’s host using the command
    ```BASH
    sudo systemctl stop mysql
    ```

## II. Enable binlogging in MySQL server

1. Edit MySQL config file var/lib/my.cnf (create the file if does not exist) and add below lines
    ```SHELL
    [mysqld]
    log-bin=mysql-log.bin
    ```
2. Export `$MYSQL_HOME` path
    ```SQL
    export MYSQL_HOME=/var/lib/mysql
    ```
3. Restart MySQL
    ```BASH
    sudo systemctl restart mysql
    ```
4. Verify if binlogging is turned on
    ```BASH
    mysql -u root -p
    ```
    ```SQL
    mysql> show variables like "%log_bin%";
    +---------------------------------+--------------------------------+
    | Variable_name                   | Value                          |
    +---------------------------------+--------------------------------+
    | log_bin                         | ON                             |
    | log_bin_basename                | /var/lib/mysql/mysql-bin       |
    | log_bin_compress                | OFF                            |
    | log_bin_compress_min_len        | 256                            |
    | log_bin_index                   | /var/lib/mysql/mysql-bin.index |
    | log_bin_trust_function_creators | OFF                            |
    | sql_log_bin                     | ON                             |
    +---------------------------------+--------------------------------+
    7 rows in set (0.011 sec)
    ```
5. Set binglog format
    ```BASH
    mysql -u root -p
    ```
    ```MYSQL
    mysql> SET GLOBAL binlog_format = 'ROW'
    ```

## III. Setup MySQL User for Replicant
1.	Create MySQL user
    ```SQL
    CREATE USER 'username'@'replicate_host' IDENTIFIED BY 'password';
    ```
2.	Grant below privileges on all tables involved in replication
    ```SQL
    GRANT SELECT ON "<user_database>"."<table_name>" TO 'username'@'replicate_host';
    ```
3.	Grant the following Replication privileges
    ```SQL
    GRANT REPLICATION CLIENT ON *.* TO 'username'@'replicate_host';
    GRANT REPLICATION SLAVE ON *.* TO 'username'@'replicate_host';
    ```
4.	Verify if created user can access bin logs
    ```SQL
    mysql> show binary logs;
    +------------------+-----------+
    | Log_name         | File_size |
    +------------------+-----------+
    | mysql-bin.000001 |       351 |
    | mysql-bin.000002 |      4635 |
    | mysql-bin.000003 |       628 |
    | mysql-bin.000004 | 195038185 |
    +------------------+-----------+
    4 rows in set (0.001 sec)
    ```

## IV. Setup Connection Configuration

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

## V. Setup Filter Configuration

1. From ```$REPLICANT_HOME```, navigate to the filter configuration file
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
    ```
For a detailed explanation of configuration parameters in the filter file, read: [Filter Reference]({{< ref "/docs/references/filter-reference" >}} "Filter Reference")

## VI. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source MySQL

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<user_database>"."replicate_io_cdc_heartbeat"(
     "timestamp" BIGINT NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges for the heartbeat table to the user configured for replication

3. From ```$REPLICANT_HOME```, navigate to the extractor configuration file
   ```BASH
   vi conf/src/mysql.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows:
    ```YAML
    realtime:
      heartbeat:
        enable: true
        catalog: tpch #Replace tpch with the name of the database containing your heartbeat table
        table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
        column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
    ```
5. Below is a sample extractor file with commonly used configuration parameters:
    ```YAML
    snapshot:
      threads: 16
      fetch-size-rows: 15_000

    #  per-table-config:
    #  - catalog: tpch
    #    tables:
    #      ORDERS:
    #        num-jobs: 1
    #      LINEITEM:
    #        row-identifier-key: [L_ORDERKEY]
    #        split-key: l_orderkey

    realtime:
      threads: 4
      fetch-size-rows: 10_000

      heartbeat:
        enable: true
        catalog: tpch
        interval-ms: 10000
    ```
For a detailed explanation of configuration parameters in the extractor file, read: [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference")
