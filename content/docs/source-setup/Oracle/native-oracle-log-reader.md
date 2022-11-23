---
weight: 2
pageTitle: Use Native Oracle Log Reader (Beta)
title: "Native Log Reader"
description: "Learn how to configure Arcion Replicant to read from and make use of Oracle redo log files. Learn how to use ASM or the file system directly for logs."
---

# Use Native Oracle Log Reader (Beta)
{{< hint "info" >}}**Note:** This feature is currently in beta. {{< /hint >}}

It's possible to configure Replicant so that it can read and make use of Oracle redo log files.

## Modify Oracle Connection Configuration File

Add the following two parameters in [the Oracle connection configuration file]({{< relref "setup-guide#vi-set-up-connection-configuration" >}}):

```YAML
log-reader: REDOLOG
transaction-store-location: PATH_TO_TRANSACTION_STORAGE
```

Replace *`PATH_TO_TRANSACTION_STORAGE`* with the location of Oracle transaction storage.

## Grant Necessary Permissions

Replicant user should have the following permissions granted for them in order to use the native Oracle log reader.

  ```SQL
  GRANT SELECT ON gv_$instance TO USERNAME;
  GRANT SELECT ON v_$log TO USERNAME;
  GRANT SELECT ON v_$logfile TO USERNAME;
  GRANT SELECT ON v_$archived_log to USERNAME;
  ```

  Replace *`USERNAME`* with your Oracle username.

## Oracle ASM for Logs

Replicant also supports using Oracle Automatic Storage Management (ASM) for logs. To use ASM, follow the steps below:

1. Make sure that the following permission is granted:

    ```SQL
    GRANT SELECT ON gv_$asm_client TO USERNAME
    ```
  
    Replace *`USERNAME`* with your ASM username.

2. In [your Oracle connection configuration file]({{< relref "setup-guide#vi-set-up-connection-configuration" >}}), create a new section `asm-connection`.  This section will have the necessary ASM connection configuration. Below is a sample connection configuration file with ASM connection details specified as well:

    ```YAML
    type: ORACLE
    host: localhost
    port: 53545
    service-name: IO
    username: 'REPLICANT_USERNAME'
    password: 'REPLICANT_PASSWORD'

    asm-connection:
      host: oracle-asm
      port: 1521
      service-name: +ASM
      username: 'ASM_USERNAME'
      password: 'ASM_PASSWORD'
      max-connections: 10
    ```

    Replace the following:

    - *`REPLICANT_USERNAME`*: your Replicant username.
    - *`REPLICANT_PASSWORD`*: the password associated with your Replicant username.
    - *`ASM_USERNAME`*: the username to connect to the ASM instance.
    - *`ASM_PASSWORD`*: the password associated with *`ASM_USERNAME`*.

3. To use the file system directly, Replicant must have access to the redo log files for reading. If Replicant's path(s) to redo log files is different from the database's path, you must include the path to the redo log files explicitly [in the Source connection configuration file]({{< relref "setup-guide#vi-set-up-connection-configuration" >}}). For example:

    ```YAML
    log-path: /home/replicant-user/shared/redo/online
    archive-log-path: /home/replicant-user/shared/redo/archive
    ```