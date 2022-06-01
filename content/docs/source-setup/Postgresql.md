---
title: PostgreSQL
weight: 1
bookHidden: false
---
# Source: PostgreSQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory.

## I. Create a user in postgresql

1. Log in to postgresql client:
    ```BASH
    psql -U $POSTGRESQL_ROOT_USER
    ```

2. Create a user used for replication:
    ```sql
    CREATE USER <username> PASSWORD '<password>';
    ```

3. Grant the following permissions:

    ```SQL
    GRANT USAGE ON SCHEMA "<schema>" TO <username>;
    ```

    ```sql
    GRANT
    SELECT
    ON ALL TABLES IN SCHEMA "<schema>" TO <username>;
    ```

    ```SQL
    ALTER ROLE <username> WITH REPLICATION;
    ```


## II. Setup PostgreSQL for Replication
1. Edit postgresql.conf:
   ```BASH
   vi $PGDATA/postgresql.conf
   ```

2. Change the parameters below as follows:
    ```Xorg
    wal_level = logical
    max_replication_slots = 1 #Can be increased if more slots need to be created
    ```

3. To perform log consumption for CDC replication from the PostgreSQL server, you must either use the test_decoding plugin that is by default installed in PostgreSQL or you must install the logical decoding plugin wal2json

    **Instructions for using wal2json**
    1. Install the wal2json plugin with the steps from the following link: https://github.com/eulerto/wal2json/blob/master/README.md

    2. Create a logical replication slot for the given catalog to be replicated with the following SQL:
        ```SQL
        SELECT 'init' FROM pg_create_logical_replication_slot('<replication_slot_name>', 'wal2json');
        ```
    3. Verify the slot has been created:
        ```sql
        SELECT * from pg_replication_slots;
        ```

     **Instructions for using test_decoding**

    If you are using the test_decoding plugin, you do not need to install anything as PostgreSQL comes equipped with it.

    1. Use the following sql to create a logical replication slot for test_decoding plugin:
        ```SQL
        SELECT 'init' FROM pg_create_logical_replication_slot('<replication_slot_name>', 'test_decoding');
        ```
    2. Verify the slot has been created:
        ```sql
        SELECT * from pg_replication_slots;
        ```

4. Set the replicant identity to FULL for the tables  part of the replication process that do no have a primary key:
   ```SQL
   ALTER TABLE <table_name> REPLICA IDENTITY FULL;
   ```

<br></br>

**For the proceeding steps 3-5, position yourself in ```$REPLICANT_HOME``` directory**
## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the connection configuration file:
    ```BASH
    vi conf/conn/postgresql.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: POSTGRESQL

    host: localhost #Replace localhost with your PostgreSQL host name
    port: 5432 #Replace the default port number 5432 if needed

    database: "postgres" #Replace postgres with your database name
    username: "replicant" #Replace replicant with your postgresql username
    password: "Replicant#123" #Replace Replicant#123 with your user's password

    max-connections: 30 #Maximum number of connections replicant can open in postgresql
    socket-timeout-s: 60 #The timeout value for socket read operations. The timeout is in seconds and a value of zero means that it is disabled.
    max-retries: 10 #Number of times any operation on the source system will be re-attempted on failures.
    retry-wait-duration-ms: 1000 #Duration in milliseconds Replicant should wait before performing then next retry of a failed operation.

    #List your replication slots (slots which hold the real-time changes of the source database) as follows
      replication-slots:
        io_replicate: #Replace "io-replicate" with your replication slot name
          - wal2json #plugin used to create replication slot (wal2json | test_decoding)
        io_replicate1: #Replace "io-replicate1" with your replication slot name
          - wal2json

    log-reader-type: SQL [SQL|STREAM]
    ```
    - Default `log-reader-type` is `SQL`. If `SQL` is chosen, PostgreSQL server will periodically receive SQL statements for CDC data extraction. If `STREAM` is chosen, CDC data will be captured through `PgReplicationStream`.

3. You can also enable SSL for your connection by including the `ssl` field and specifying the necessary parameters as below:
    ```YAML
    ssl:
      ssl-cert: <full_path_to_SSL_certificate_file>
      root-cert: <full_path_to_SSL_root_certificate_file>
      ssl-key: <full_path_to_SSL_key_file>
    ```
    The key file must be in PKCS-12 or in PKCS-8 DER format. A PEM key can be converted to DER format using the following openssl command:

    ```BASH
    openssl pkcs8 -topk8 -inform PEM -in postgresql.key -outform DER -out postgresql.pk8 -v1 PBE-MD5-DES
    ```

{{< hint "info" >}} The `socket-timeout-s` parameter has been introduced in *v22.02.12.16* and isn't available in previous versions.{{< /hint >}}

{{< hint "info" >}} If the `log-reader-type` is set to `STREAM`, the replication connection must be allowed as the <username> that will be used to perform the replication. To enable replication connection, the `pg_hba.conf` file needs to be modified with some of the following entries depending on the usecase:

1. From `$REPLICANT_HOME`, navigate to the pg_hba file:
   ```BASH
   vi $PGDATA/pg_hba.conf
   ```
2. Make the necessary changes as follows:
   ```BASH
   # TYPE  DATABASE        USER                  ADDRESS                 METHOD

   # allow local replication connection to <username> (IPv4 + IPv6)
   local     replication         <username>                                         trust
   host      replication         <username>    127.0.0.1/32                     <auth-method>
   host      replication         <username>    ::1/128                          <auth-method>

   # allow remote replication connection from any client machine  to <username> (IPv4 + IPv6)
   host     replication          <username>    0.0.0.0/0                        <auth-method>
   host     replication          <username>    ::0/0                            <auth-method>
   ```
   {{< /hint >}}

## IV. Setup Filter Configuration

1. From `$REPLICANT_HOME`, navigate to the filter configuration file:
    ```BASH
    vi filter/postgresql_filter.yaml
    ```
2. In accordance to you replication needs, specify the data which is to be replicated. Use the format of the example explained below:

    ```YAML
    allow:
      #In this example, data of object type Table in the catalog postgres and schema public will be replicated
      catalog: "postgres"
      schema: "public"
      types: [TABLE]

      #From catalog postgres and schema public, only the CUSTOMERS, ORDERS, and RETURNS tables will be replicated.
      #Note: Unless specified, all tables in the catalog will be replicated
      allow:
        CUSTOMERS:
        #Within CUSTOMERS, the FB and IG columns will be replicated  
          allow: ["FB, IG"]


        ORDERS:  
          #Within ORDERS, only the product and service columns will be replicated as long as they meet the condition o_orderkey < 5000
          allow: ["product", "service"]
          conditions: "o_orderkey < 5000"



        RETURNS: #All columns in the table PART will be replicated without any predicates
    ```

    The following is a template of the format you must follow:

      ```YAML
      allow:
        catalog: <your_catalog_name>
        schema: <your_schema_name>
        types: <your_object_type>

      #If not collections are specified, all the data tables in the provided catalog and schema will be replicated
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

## V. Set up Extractor Configuration

For real-time replication, you must create a heartbeat table in the source PostgreSQL

1. Create a heartbeat table in any schema of the database you are going to replicate with the following DDL:
    ```SQL
    CREATE TABLE "<user_database>"."public"."replicate_io_cdc_heartbeat"("timestamp" INT8 NOT NULL, PRIMARY  KEY("timestamp"))
    ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for replication

3. From `$REPLICANT_HOME`, navigate to the extractor configuration file:
    ```BASH
    vi conf/src/postgresql.yaml
    ```
4. Under the Realtime Section, make the necessary changes as follows:
     ```YAML
     realtime:
       heartbeat:
         enable: true
         catalog: "postgres" #Replace postgres with your database name
         schema: "public" #Replace public with your schema name
         table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Heartbeat table name if changed
         column-name [20.10.07.9]: timestamp #Heartbeat table column name if changed
     ```



## Replication without replication-slots

If you are unable to create replication slots in postgresql using either wal2json or test_decoding then Replicant supports a mode delta-snapshot. In delta-snapshot Replicant uses postgres’s internal column to identify changes.

Note: It is strongly recommended to supply a row-identifier-key in the per-table-config section for a table which does not have a PK/UK defined

1. From `$REPLICANT_HOME`, navigate to the extractor configuration file:
    ```BASH
    vi/conf/src/postgresql_delta.yaml
    ```
2. Under the delta snapshot section, make the necessary changes as follows:
      ```YAML
      delta-snapshot:
        row-identifier-key: [orderkey,suppkey] #Replace orderkey, suppkey with your  global row-identifier-key identifier which specifies the column(s) that are unique in the data collections being replicated
        update-key: [partkey] #Replace partkey with your global update key if your table does not have unique row-identifier-keys and you still want to perform incremental replication
        replicate-deletes: true|false #Enable or disable delete replication

        #In the following section, you can specify configurations for certain tables. For any specified tables, Replicant will override the global configurations and replicate the table in accordance to the configurations set for that table below.
        per-table-config:
        - catalog: tpch #Replace tpch with the catalog of the table is in
          schema: public #Replace public with the schema the table is in
          tables:
            <table_name>: #Replace <table_name> with your table name
              row-key-identifier: #Enter a row-key-identifier for this table if applicable
              update-key: #Enter an update-key for this table if applicable
              replicate-deletes: #Enable or disable  delete replication  

            #The following is an example of a specified table named lineitem1. Replicant will use the configurations provided for table lineitem1 when replicating the table instead of the global configurations specifed above the per-table-config section.
            lineitem1:
              row-identifier-key: [l_orderkey, l_linenumber]
              split-key: l_orderkey
              replicate-deletes: false
       ```
