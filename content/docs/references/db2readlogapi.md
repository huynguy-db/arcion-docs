---
title: Using db2ReadLog API
weight: 13
bookHidden: false
---

You may want to use [db2ReadLog API](https://www.ibm.com/docs/en/db2/11.1?topic=apis-db2readlog-read-log-records) to read log records from the Db2 database logs, or query the Log Manager for current log state information. This page describes how to do that in Arcion when using Db2 as source.

## Permissions

1. The user should have read access on all the databases, schemas and tables to be replicated.

2. The user should have read access to following system tables/views:

    a. `SYSIBM.SYSTABLES`

    b. `SYSIBM.SQLTABLETYPES`

    c. `SYSIBM.SYSCOLUMNS`

    d. `SYSIBM.SYSTABCONST`

    e. `SYSIBM.SQLCOLUMNS`
    
    f. `SYSCAT.COLUMNS` (needed for [`fetch-schemas`](/docs/running-replicant/#fetch-schemas) mode).

3. The user should have execute permissions on the following system procs:

    a. `SYSIBM.SQLTABLES`

    b. `SYSIBM.SQLCOLUMNS`

    c. `SYSIBM.SQLPRIMARYKEYS`

    d. `SYSIBM.SQLSTATISTICS`

{{< hint "info" >}}
Users need these permissions only once at the start of a fresh replication.
{{< /hint >}}

## CDC-based Replication

If you're performing CDC-based replication from the source Db2 server, please follow the steps below:

### On system running source Db2 server:

1. For any tables being replicated, run the following command:

    ```SQL
    ALTER TABLE <TABLE> DATA CAPTURE CHANGES
    ```

2. Check if the database is recoverable by running the followingg command:

    ```shell
    db2 get db cfg for <DATABASE> show detail | grep -i "logarch"
    ```
    If either `LOGARCHMETH1` or `LOGARCHMETH2` is set, the database is already recoverable.

    {{< hint "info" >}}Skip the next step if the database is already recoverable.{{< /hint >}}

3. Update the db2 logging method by running the following command:

    ```shell
    db2 update db cfg for <DATABASE> using LOGARCHMETH1 LOGRETAIN
    ```
    Updating the logging methods leaves the database in a *Backup Pending* state. To recover from this, you need to backup the database with:
    ```shell
    db2 backup db <DATABASE> to <DESTINATION>
    ```
### On system running Arcion Replicant:

{{< hint "info" >}}Skip steps 2-6 if Replicant is running from the same system as the source Db2 database.{{< /hint >}}

1. Configure the `JAVA_OPTS` environment variable with:
    ```shell
    export JAVA_OPTS=-Djava.library.path=lib
    ```

2. Install Db2 Data Server Client Prerequisites by running the following commands:

    ```shell
    sudo dpkg --add-architecture i386
    sudo apt install libaio1 libstdc++6:i386 libpam0g:i386
    sudo apt install binutils
    ```
3. Install Db2 Data Server Client:

    a. Download latest version of [Db2 Data Server Client from IBM](https://www.ibm.com/support/pages/download-initial-version-115-clients-and-drivers).

    b. Extract and start the installer by running `db2_setup`.

    c. Select **Custom** installation.

    d. Check the **Base Application Development tools** option on page 2 of the installation wizard.
    
    e. Leave remaining options as default and complete the installation.

4. Catalog the source Db2 Server node by running the following:

    ```shell
    db2 catalog tcpip node <NODE_NAME> remote <REMOTE> server <PORT>
    ```

5. Catalog the source Db2 database:

    ```shell
    db2 catalog database <DATABASE> at node <NODE_NAME>
    ```

6. Finally, test the connection with:

    ```shell
    db2 connect to <DATABASE> user <USER>
    ```

## Replicant configuration

You also need to configure Replicant's Db2 connection configuration file:

1. Add a new property called `node`. The default node name is the Db2 user’s name, for example:

    ```yaml
    node: db2inst1
    ```

2. Set the value of `cdc-log-storage` to `READ_LOG`. This tells Replicant that you want to use the native db2ReadLog as the CDC log reader:

    ```yaml
    cdc-log-config:
        cdc-log-storage: READ_LOG
    ```


