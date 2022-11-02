---
pageTitle: Requirements for using IBM Db2 as Source with MQ
title: IBM Db2 MQ
description: "Learn about the necessary permissions and how to enable CDC replication for Db2 Source by installing and configuring MQ."
weight: 1
bookHidden: false 
---

This page describes the requirements for using IBM Db2 MQ as Source and how to set up CDC-based replication.

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

## Enabling CDC Replication

For enabling CDC-based replication from the source Db2 server, please follow the steps below:

### Install MQ

  a. Download latest MQ server package (`IBM_MQ_9.1.3_LINUX_X86-64.tar.gz`) from IBM passport advantage.

  b. Untar the the package:
    ```shell
    $tar -xvf IBM_MQ_9.0.0.0_LINUX_X86-64.tar.gz
    ```
  c. Change current directory to extracted MQServer directory:
    ```shell
    $cd MQServer
    ```
  d. Accept the MQ license:
    ```shell
    $sudo ./mqlicense.sh
    ```
  e. Install all the rpm files:
    ```shell
    $sudo alien -i MQSeriesRuntime-*.rpm MQSeriesServer-*.rpm --scripts
    ```
### Apply Q replication license
  a. Download activation kit (IS_DataRep_11_4_Activtn_ProdDoc.zip) from IBM
  passport advantage
  b. Unzip the archive and cd into the extracted directory
  ```shell
  $unzip IS_DataRep_11_4_Activtn_ProdDoc.zip && cd CC4MTML
  ```
  c. Utar the file from archive
  ```shell
  $tar xvf IS_DataRep_11.4_Activtn_ProdDoc.tar.gz && cd IS_DataRep_11.4_Activtn
  ```
  d. `cd` into appropriate directory containing the license file and based on Db2 version installed:
  ```shell
  $cd License/Db2_11.5
  ```
  e. Apply the license file:
  ```shell
  $db2licm -a iidr.lic
  ```
### Setup queue replication

  To setup queue replication for table CUSTOMER belonging to database `SOURCEDB`, use the following steps:

  a. Enable log retention on source DB2 instance by running: 
  ```
  update db cfg for sourcedb using LOGARCHMETH1 LOGRETAIN
  ```
  b. Backup source database (`SOURCEDB`):
  ```
  backup db sourcedb
  ```
  c. Let us assume that DB2 instance UNIX user name is `dbuser` and will be used to connect to Db2. The `mqm` user will be used to create/configure the **Queue Manager**. Make sure to grant dbadm access to mqm user:
  ```
  grant dbadm on database to user mqm
  ```
  Following sequence of commands will create/configure the MQ queue manager.(Run as `mqm` user):

  ```
  cd /opt/mqm/bin
  ./crtmqm CDC_QM
  ./strmqm CDC_QM
  ./runmqsc CDC_QM
  ALTER QMGR MAXMSGL(104857600) //Alter the queue manager to have the recommended starting value for maxmsgl
  ALTER QMGR MAXUMSGS(999999999)
  DEFINE QLOCAL('CDC_RESTART_Q') put(enabled) get(enabled)
  DEFINE QLOCAL('CDC_ADMIN_Q') PUT(ENABLED) GET(ENABLED)
  DEFINE QLOCAL('CDC_LOG_Q') USAGE(NORMAL) MAXDEPTH(999999999) MAXMSGL(104857600)
  DEFINE CHANNEL('CDC_Q_CHANNEL') CHLTYPE(SVRCONN) TRPTYPE(TCP)
  START CHL('CDC_Q_CHANNEL')
  DEFINE LISTENER('REPL_LSTR') TRPTYPE(TCP) PORT(1450) CONTROL(QMGR)
  START LISTENER('REPL_LSTR')
  ALTER QMGR CHLAUTH(DISABLED)
  ALTER AUTHINFO(SYSTEM.DEFAULT.AUTHINFO.IDPWOS) AUTHTYPE(IDPWOS) CHCKCLNT(OPTIONAL)
  REFRESH SECURITY TYPE(CONNAUTH)
  ```
  {{< hint "info" >}} The last three commands are optional. They allow users to disable channel authentication {{< /hint >}}

  To configure **Queue replication**, you have to run some `asnclp` commands on Db2 instance. Run the following commands on the `asnclp` prompt:

  ```
  ASNCLP SESSION SET TO Q REPLICATION
  SET SERVER CAPTURE TO DB SOURCEDB
  SET CAPTURE SCHEMA SOURCE ASN
  SET QMANAGER CDC_QM FOR CAPTURE SCHEMA
  SET RUN SCRIPT NOW STOP ON SQL ERROR ON
  CREATE CONTROL TABLES FOR CAPTURE SERVER USING RESTARTQ "CDC_RESTART_Q" ADMINQ "CDC_ADMIN_Q"
  CREATE PUBQMAP MyPubQMap USING SENDQ "CDC_LOG_Q" MESSAGE FORMAT XML MESSAGE CONTENT TYPE R HEARTBEAT INTERVAL 0 MAX MESSAGE SIZE 101376
  ```
  {{< hint "info" >}} The `MESSAGE CONTENT TYPE` can be set to either `R` (`ROW TYPE`) or `T` (T`RANSACTION TYPE`). {{< /hint >}}
    
  ```
  CREATE PUB USING PUBQMAP MyPubQMap( PUBNAME CUSTOMER-UNI DBUSER.CUSTOMER ALL CHANGED ROWS Y BEFORE VALUES Y CHANGED COLS ONLY N HAS LOAD PHASE N SUPPRESS DELETES N)
  START XML PUB PUBNAME CUSTOMER-UNI
  ```

  {{< hint "info" >}}
  - You must create publications for each and every DB2 table to be replicated .
  - Arcion replicant supports both XML and DELIMITED formats of publication map. The example above uses XML format.
  {{< /hint >}}

### Start Q Capture program 

  You need to be using `mqm` user for executing the folliwng commands. 

  a. First, set following environment variables:

  ```shell
  export LD_LIBRARY_PATH=/opt/mqm/lib64:$LD_LIBRARY_PATH
  export PATH=/home/dbuser/sqllib/bin:$PATH
  export DB2INSTANCE="dbuser"
  export DB2LIB="/home/dbuser/sqllib/lib"
  export DB2_HOME="/home/dbuser/sqllib"
  export IBM_DB_DIR="/home/dbuser/sqllib"
  export IBM_DB_HOME="/home/dbuser/sqllib"
  export IBM_DB_INCLUDE="/home/dbuser/sqllib/include"
  export IBM_DB_LIB="/home/dbuser/sqllib/lib"
  ```
  b. Run capture program:

  ```
  asnqcap capture_server=sourcedb capture_schema="ASN" logstdout=y
  ```
  {{< hint "warning" >}}You must make sure that the `asnqcap` program is running all the time while Arcion Replicant is replicating. {{< /hint >}}

  c. It is important to set certain key MQ parameters to very high or maximum values for supporting large scale replication with high activity.

  - So set the following recommended values:

    ```
    ALTER QMGR MAXMSGL(104857600)
    ALTER QMGR MAXUMSGS(999999999)
    DEFINE QLOCAL('CDC_LOG_Q') USAGE(NORMAL) MAXDEPTH(999999999) MAXMSGL(104857600)
    ```
    {{< hint "info" >}} If the local queue(`QLOCAL`) is already defined, you can redefine the local queue with new config values using the `REPLACE` keyword. For example, `DEFINE QLOCAL('CDC_LOG_Q') USAGE(NORMAL) MAXDEPTH(999999999) MAXMSGL(104857600) REPLACE`{{< /hint >}}
  - Increase the `LogPrimaryFiles`, `LogSecondaryFiles`, or `LogFilePages` MQ parameters so that the largest transaction can fit. See [this support Q&A](https://www.ibm.com/support/pages/node/1107285) for more details.
  - The `max_message_size` parameter determines the size of the memory buffer that a Q Capture program uses for each send queue. A small value for `max_message_size` can result in the following error:
    ```
    ASN7171E "Q Capture" : "ASN" : "WorkerThread" : The program stopped because the data for a LOB or XML column was too large and the error action of the replication
    ```

    You can set `MAX_MESSAGE_SIZE` while creating the publishing queue map. You can later update its value by using the following SQL:
      ```sql
      UPDATE ASN.IBMQREP_SENDQUEUES SET MAX_MESSAGE_SIZE = 101376
      ```
      {{< hint "warning" >}} The value of `max_message_size` must be less than or equal to the IBM MQ parameter `MAXMSGL` (Ideally should be 4KB smaller than `MAXMSGL`){{< /hint >}}