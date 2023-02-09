---
pageTitle: Setting up Oracle pluggable database as source
title: "Oracle pluggable database"
description: "Set up Oracle pluggable database as data source in Oracle multitenant architecture for your data pipelines using Arcion Oracle connector."
weight: 2
---

# Source Oracle pluggable database (PDB)
This page contains instructions for setting up Oracle PDB as data source. Oracle PDB is a crucial part of [Oracle multitenant architecture](https://docs.oracle.com/database/121/CNCPT/cdbovrvw.htm#CNCPT89234).

Arcion supports both snapshot and realtime replication for Oracle PDB.

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
- *`PORT_NUMBER`*: the port number
- *`USERNAME`*: the username that connects to the database
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

### 2. Run Replicant
Run Replicant with the `snapshot` option and providing the necessary arguments with the connection, Extractor, and Applier configuration files. For example:

```sh
./bin/replicant snapshot ./conf/conn/oracle_multitenant_pdb.yaml \
./conf/conn/yugabyte.yaml \
--extractor ./conf/src/oracle_common.yaml \
--applier ./conf/dst/yugabyte.yaml \
--filter ./filter/oracle19c_filter.yaml
```

For more information on how to run Replicant in snapshot mode, see [Replicant snapshot mode]({{< ref "docs/running-replicant#replicant-snapshot-mode" >}}).
