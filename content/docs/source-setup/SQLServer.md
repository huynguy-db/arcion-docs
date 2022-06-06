---
title: Microsoft SQL Server
weight: 11
bookHidden: false
---

# Source Microsoft SQL Server

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Replicant Windows Agent

To intsall and set up Replicant Windows Agent, please follow the instructions in [Windows Agent Installation](/docs/references/source-prerequisites/sqlserver/#windows-agent-installation).

## II. Check Permissions

You need to verify that the necessary permissions are in place on source SQL Server in order to perform replication. To know about the permissions, see [SQL Server User Permissions](/docs/references/source-prerequisites/sqlserver/#sql-server-user-permissions).

## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/sqlserver.yaml
   ```

2. Make the necessary changes as follows:

   ```YAML
   type: SQLSERVER

   host: localhost
   port: 1433

   username: 'replicant' # username to connect to the server
   #username: 'domain\replicant' # use this format for NTLM authentication
   password: 'Replicant#123'
   database: 'tpcc'
   #auth-type: [NATIVE, NTLM]

   max-connections: 30 #maximum number of connections Replicant would use to fetch data from source.

   #log-path: /home/shared/transactions/

   #ssl:
   #  enable: true
   #  hostname-verification: false
   ```

   - **auth-type**: Authentication protocol will default to `NATIVE` if you don't specify the `auth-type` parameter. In case of `NLTM` as the `auth-type`, you'll have to provide the `username` in `<domain>\<user>` format.

   - Replicant supports consuming `username` and `password` configurations from a _credentials store_ rather than having users specify them in plain text config file. Instead of specifying username and password as above, you can keep them in a keystore and provide its details in the config file like below:

     ```YAML
     credentials-store:
       type: PKCS12 | JKS | JCEKS
         path: # path to your keystore file
         key-prefix: # prefix of the keystore entry
         password: # optional, keystore password
     ```

     - You should create entries in the credential store for `username` and `password` configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `sqlserver_username` and `sqlserver_password`. You can then specify the prefix here as `sqlserver_`.

     - The keystore `password` field is optional. If you don't want to specify the keystore password here, then you must use the UUID from your license file as the keystore password. Remember to keep your license file somewhere safe in order to keep this password secure.

## IV. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
   ```BASH
   vi conf/src/sqlserver.yaml
   ```
2. Make the necessary changes as follows:

   ```YAML
   snapshot:
     threads: 16
     fetch-size-rows: 5_000

     _traceDBTasks: true
   #  min-job-size-rows: 1_000_000
   #  max-jobs-per-chunk: 32

   #  per-table-config:
   #  - catalog: tpch      
   #    schema: dbo
   #    tables:
   #      lineitem:
   #        row-identifier-key: [l_orderkey, l_linenumber]
   #        split-key: l_orderkey
   #        split-hints:
   #          row-count-estimate: 15000
   #          split-key-min-value: 1
   #          split-key-max-value: 60000

   realtime:
    # agent-connection:
    #   enable: true #Enable reading files from the remote server over a socket.
    #   host: # Host running remote SQL Server CDC agent
    #   username: # Specified in `domain\user` format.
    #   password:
    #   port:
     threads: 4
     fetch-size-rows: 10000
     fetch-duration-per-extractor-slot-s: 3
   ```

   * The `agent-connection` field is optional. It defines the parameters used to connect to the socket-based file server.
     * The user can be either local to the remote system or a domain account, but must have read/write access to the directory on the remote system where transaction files are written. This is configured as the staging directory on the remote system.

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
