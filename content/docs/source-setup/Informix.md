---
title: IBM Informix
weight: 9
bookHidden: false
---

# Source IBM Informix

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up CDC Replication

For enabling CDC-based replication from the source Informix server, please follow the instructions in [Enabling CDC Replication for Informix](/docs/references/source-prerequisites/informix/#enabling-cdc-replication).

## II. Set up Logical Log Configuration

For setting up logical log configuration, follow the instructions in [Logical Log Configuration Guidelines](/docs/references/source-prerequisites/informix/#logical-log-configuration-guidelines).

## II. Create the Heartbeat Table

For CDC replication, you must create the heartbeat table on the source database with the following DDL:

Remember to grant `INSERT`, `UPDATE`, and `DELETE` privileges for this table to the user that you provided to Replicant.

```SQL
CREATE TABLE tpch:tpch.replicate_io_cdc_heartbeat(timestamp INT8 NOT NULL, PRIMARY KEY(timestamp) CONSTRAINT cdc_heartbeat_id_repl1_repl1) 
LOCK MODE ROW
```

## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/informix.yaml
   ```

2. Make the necessary changes as follows:
    
    ```YAML
    type: INFORMIX

    host: localhost #Replace localhost with your Informix server's hostname
    port: 9088  # In case of SSL connection use SSL port

    server: 'informix'
    database: 'tpch' # Name of the catalog from which the tables are to be replicated

    username: 'informix' #Replace informix with the user that connects to your Informix server
    password: 'in4mix' #Replace in4mix with your user's password 
    informix-user-password: 'in4mix' #Password for the "informix" user, required for performing CDC. Not required in snapshot replication.

    max-connections: 15
    max-retries: #Number of times any operation on the source system will be re-attempted on failures.

    #ssl:
    #  trust-store: 
    #    enable: true
    #    path: "/home/informix/ssl/truststore.jks" #Path to the JKS truststore containing the trust certificate of the Informix server
    #    password: "in4mix" #The truststore password
    ```
    - You have to connect to the **syscdcv1** catalogue on the server as the user `informix` to be able to use Change Data Capture (CDC). The `informix-user-password` parameter of the config file above should have the password of user `informix`. For more information, see [Preparing to use the Change Data Capture API](https://www.ibm.com/docs/en/informix-servers/14.10?topic=api-preparing-use-change-data-capture) on IBM Informix Documentation.

    - You can use SSL to connect to the Informix server using the configuration parameters shown above. To konw about Informix server side SSL setup, see [Configuring Informix server instance for SSL connections](https://www.ibm.com/docs/en/informix-servers/14.10?topic=protocol-configuring-server-instance-secure-sockets-layer-connections) on IBM Informix Documentation.

## IV. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Applier configuration file:
   ```BASH
   vi conf/src/db2.yaml
   ```
2. Make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 16
      fetch-size-rows: 5_000

    #  lock:
    #    enable: true
    #    scope: TABLE   # DATABASE, TABLE
    #    force: false
    #    timeout-sec: 5

    #  min-job-size-rows: 1_000_000
    #  max-jobs-per-chunk: 32

      split-method: MODULO  # Allowed values are RANGE, MODULO
      per-table-config:
      - catalog: "tpch"
        schema: "tpch"
        tables:
          lineitem:
            split-key: "l_orderkey"
    #       row-identifier-key: ["l_linenumber", "l_orderkey"]
    #       split-method : MODULO  # Table specific overridable config : allowed values are RANGE, MODULO
    #       num-jobs: 1
          orders:
            split-key: "o_orderkey"
    #       num-jobs: 1

    realtime:
      threads: 4 
      fetch-size-rows: 256
      _buffer-size: 1000
      _read-timeout: 3

      heartbeat:
        enable: true
        catalog: tpch
        schema: tpch
        interval-ms: 10000 
    ```

For a detailed explanation of configuration parameters in the Extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
