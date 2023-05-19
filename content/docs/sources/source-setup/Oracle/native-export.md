---

pageTitle: Oracle Native Export
title: "Native Export"
description: "Learn how to configure Arcion Replicant to use Oracle's native Data Pump Export (`expdp`) utility for exporting table data."
weight: 3
url: docs/source-setup/oracle/native-export
---

# Oracle Native Export

For Oracle as both Source and Target systems, Replicant uses Oracle's native Data Pump Export (`expdp`) utility to export table data. To set up Replicant and Source Oracle to use this feature, follow the instructions below:

## Set up `expdp` in Replicant host machine
- Download the [Oracle Instant Client Tools Package ZIP](https://download.oracle.com/otn_software/linux/instantclient/216000/instantclient-tools-linux.x64-21.6.0.0.0dbru.zip) and extract the files.
- Copy the `expdp` file to the `/usr/bin` directory.
- Download the [Oracle Instant Client Basic Package ZIP](https://download.oracle.com/otn_software/linux/instantclient/216000/instantclient-basic-linux.x64-21.6.0.0.0dbru.zip) and extract the files in a directory.
- Copy the path to the directory where you extracted the ZIP archive.
- Set the `ORACLE_HOME` and `LD_LIBRARY_PATH` environment variables in your `~/.bashrc` file:
  ```BASH
  export ORACLE_HOME=instantClientBasicPath
  export LD_LIBRARY_PATH="$ORACLE_HOME":$LD_LIBRARY_PATH
  export PATH="$ORACLE_HOME:$PATH"
  ```
## Create directory object in Source and Target Oracle
Replicant uses the [external directory feature of Oracle](https://docs.oracle.com/cd/B19306_01/server.102/b14215/et_concepts.htm) for efficient loading of data into Target Oracle. So you need to create a directory shared between Replicant host and Oracle host (both Source and Target) with `READ` and `WRITE` access. To do so, follow the steps below:

- Launch Oracle SQL Plus from the terminal.
- From the SQL Plus prompt, execute the following SQL commands:
  ```SQL
  create directory SHARED_STAGE as '/shared-volume';
  grant read,write on directory SHARED_STAGE to SYSTEM;
  ```

## Modify the Replicant Extractor configuration file
In [Replicant's Extractor configuration file of Source Oracle]({{< relref "setup-guide/oracle-traditional-database#vii-set-up-extractor-configuration" >}}), add a new `native-load` section under `snapshot`. This section holds the necessary parameters for Replicant to start using Oracle's native Export utility. For more information, see [Parameters related to snapshot mode]({{< relref "setup-guide#parameters-related-to-snapshot-mode" >}}).

