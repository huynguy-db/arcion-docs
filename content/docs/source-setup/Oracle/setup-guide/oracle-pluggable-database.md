---
pageTitle: Setting up Oracle pluggable database as source
title: "Oracle pluggable database"
description: "Set up Oracle pluggable database as data source in Oracle multitenant architecture for your data pipelines using Arcion Oracle connector."
weight: 2
---

# Source Oracle pluggable database (PDB)
This page contains instructions for setting up Oracle PDB as data source. Oracle PDB is a crucial part of [Oracle multitenant architecture](https://docs.oracle.com/database/121/CNCPT/cdbovrvw.htm#CNCPT89234).

Arcion supports both snapshot and realtime replication for Oracle PDB.


## Grant PDB permissions

1. Ensure that you're connected as [a common user](https://docs.oracle.com/database/121/ADMQS/GUID-DA54EBE5-43EF-4B09-B8CC-FAABA335FBB8.htm) with privileges granted on both `CDB$ROOT`, the CDC container, and the PDB.

2. Provide following additional permissions:

    ```SQL
    GRANT SET CONTAINER TO <USERNAME> CONTAINER=ALL;
    GRANT SELECT ON DBA_PDBS to <USERNAME> CONTAINER=ALL;
    ``` 

3. Change the open mode of the PDB to `READ WRITE`:

    ```SQL
    ALTER PLUGGABLE DATABASE $PDB_NAME OPEN READ WRITE FORCE;
    ```

## Get the current SCN
Take note of the current system change number (SCN) with the following SQL command:

```SQL
select CURRENT_SCN from v$database;
```

The output is similar to the following:

```SQL
CURRENT_SCN
-----------
    2401901
```

## Configure snapshot replication
For [snapshot mode]({{< ref "docs/running-replicant#replicant-snapshot-mode" >}}), follow these steps.

### 1. Set up connection configuration
For connecting to the PDB database, provide its connection details to Replicant in the following format:

```YAML
type: ORACLE

host: HOST
port: PORT_NUMBER

service-name: "SERVICE_NAME"

username: "USERNAME"
password: "PASSWORD"

max-connections: 30
max-retries: 10
retry-wait-duration-ms: 1000
```

Replace the following:

- *`HOST`*: the Oracle PDB host
- *`PORT_NUMBER`*: the port number of the PDB host
- *`SERVICE_NAME`*: the service name for the PDB
- *`USERNAME`*: the username that connects to the PDB
- *`PASSWORD`*: the password associated with *`USERNAME`*

The following is a sample configuration:

```YAML
type: ORACLE

host: 10.0.0.18
port: 1521

service-name: "ORCLPDB1"

username: 'alex'
password: 'alex1234'

max-connections: 30
max-retries: 10
retry-wait-duration-ms: 1000
```

### 2. Set up Extractor configuration
For Extractor configuration, you can use the same parameters as a traditional Oracle database source. For more information, see [Parameters related to snapshot mode]({{< relref "oracle-traditional-database#parameters-related-to-snapshot-mode" >}}) and [Snapshot mode in Extractor reference]({{< ref "docs/references/extractor-reference#snapshot-mode" >}}).

### 3. Run Replicant
Run Replicant with the `snapshot` option, specifying the connection, Extractor, and Applier configuration files. For example:

```sh
./bin/replicant snapshot \
./conf/conn/oracle_multitenant_pdb.yaml ./conf/conn/yugabyte.yaml \
--extractor ./conf/src/oracle_common.yaml \
--applier ./conf/dst/yugabyte.yaml \
--filter ./filter/oracle19c_filter.yaml
```

For more information about running Replicant in snapshot mode, see [Replicant snapshot mode]({{< ref "docs/running-replicant#replicant-snapshot-mode" >}}).

## Configure realtime replication
For [realtime mode]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}), follow these steps.

### 1. Set up connection configuration
For realtime replication, you need to connect to the [multitenant container database (CDB)](https://docs.oracle.com/database/121/CNCPT/glossary.htm#GUID-135FF536-DE9B-40CF-9F42-C246762BD77F). Using the `pdb-connection` field, you also need to pass the PDB connection details.

The following is the configuration structure:

```YAML
type: ORACLE

host: CDB_HOST
port: CDB_PORT_NUMBER

service-name: "CDB_SERVICE_NAME"

username: "CDB_USERNAME"
password: "CDB_PASSWORD"

max-connections: 30
max-retries: 10
retry-wait-duration-ms: 1000

continuous-log-mining: {true|false}

pdb-connection:
  host: PDB_HOST
  port: PDB_PORT_NUMBER
  service-name: "PDB_SERVICE_NAME"
  username: "PDB_USERNAME"
  password: "PDB_PASSWORD"
  max-connections: 10
  pdb-name: PDB_NAME
  continuous-log-mining: {true|false}
```

Replace the following:

- *`CDB_HOST`*: the Oracle CDB host
- *`CDB_PORT_NUMBER`*: the port number of the CDB host
- *`CDB_SERVICE_NAME`*: the service name for the CDB
- *`CDB_USERNAME`*: the username that connects to the CDB
- *`CDB_PASSWORD`*: the password associated with *`CDB_USERNAME`*
- *`PDB_HOST`*: the Oracle PDB host
- *`PDB_PORT_NUMBER`*: the port number of the PDB host
- *`PDB_SERVICE_NAME`*: the service name for the PDB
- *`PDB_USERNAME`*: the username that connects to the PDB
- *`PDB_PASSWORD`*: the password associated with *`PDB_USERNAME`*

The following is a sample configuration:

```YAML
type: ORACLE

host: 10.0.0.18
port: 1521

service-name: "ORCLCDB"

username: 'alex'
password: 'alex1234'

max-connections: 30
max-retries: 10
retry-wait-duration-ms: 1000
continuous-log-mining: false

pdb-connection:
  host: 10.0.0.18
  port: 1521
  service-name: "ORCLPDB1"
  username: 'alex'
  password: 'alex1234'
  max-connections: 10
  pdb-name: ORCLPDB1
  continuous-log-mining: false
```

### 2. Fetch schemas
Before starting realtime replication, you need to [fetch the schemas first]({{< relref "docs/running-replicant#fetch-schemas" >}}) by connecting to the PDB:

```sh
./bin/replicant fetch-schemas \
./conf/conn/oracle_multitenant_pdb.yaml \
--filter ./filter/oracle_filter.yaml \
--output-file ./oracle_schema.yaml
```

You can pass a different location for the output file.

### 3. Set up Extractor configuration
For Extractor configuration, you need to specify your configuration under the `realtime` section of the Extractor configuration file. The following steps are specific to Oracle PDB:

#### I. Specify the heartbeat table and schema details
Create the heartbeat table in the CDB and pass its details using [the `heartbeat` parameter]({{< relref "docs/references/extractor-reference#heartbeat" >}}). For example:

```YAML
realtime:
  heartbeat:
    enable: true
    schema: "C##REPLICANT"
    interval-ms: 10000
```

#### II. Specify the starting SCN
Notice that we [get the current SCN in the first section](#get-the-current-scn). For realtime replication, you need to specify that SCN as the starting SCN in the `realtime` section of the Extractor configuration file:

```YAML
realtime:
  start-position:
    start-scn: 2393338
```

The reason for this is to apply anything that happens after the snapshot starts.

The rest of the Extractor parameters available to you are the same as a traditional Oracle database source. For more information, see [Parameters related to realtime mode]({{< relref "oracle-traditional-database#parameters-related-to-realtime-mode" >}}) and [Realtime mode Extractor reference]({{< relref "docs/references/extractor-reference#realtime-mode" >}}).

### 4. Run Replicant
As the last step, run Replicant with the necessary options and arguments. Remember to use the `--src-schemas` option to specify [the schema we fetch in the second step](#2-fetch-schemas).

```sh
./bin/replicant real-time \
./conf/conn/oracle_multitenant_pdb.yaml \ 
./conf/conn/yugabyte.yaml \ 
--extractor ./conf/src/oracle_common.yaml \ 
--applier ./conf/dst/yugabyte.yaml \ 
--filter ./filter/oracle_filter.yaml \
--src-schemas ./output/oracle_schema.yaml
```

In the preceeding example, we run Replicant with the following options and arguments:

- The connection configuration files of the source and the target
- The Extractor configuration file with the `--extractor` option
- The Applier configuration file with the `--applier` option
- A [filter file]({{< relref "docs/references/filter-reference" >}}) with the `--filter` option

For more information about running Replicant in realtime mode, see [Replicant realtime mode]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}).
