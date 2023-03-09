---
pageTitle: Use SQL Server Agent for real-time replication
title: "SQL Server Agent"
description: "Learn how to set up real-time replication from SQL Server using Arcion's SQL Server Agent that uses efficient and secure CDC technology."
weight: 2
---

# Real-time replication from SQL Server with SQL Server Agent
For real-time replicaiton from SQL Server, you can choose [SQL Server Agent]({{< ref "docs/references/source-prerequisites/sqlserver#replicant-sql-server-agent-installation" >}}) as a CDC Extractor. Follow these steps to set up real-time replication using the SQL Server Agent.

## I. Prerequisites
### Required permissions
To allow replication, you need to first verify that the necessary permissions are in place on source SQL Server. For more information, see [SQL Server User Permissions](/docs/references/source-prerequisites/sqlserver/#sql-server-user-permissions).

### Primary keys on tables
For [full mode replication]({{< relref "../full-mode-replication" >}}) with SQL Server Agent, we recommend that all the tables that you need to replicate have primary keys. If it's not possible to define primary key on a table, follow the instructions in [Replicate tables without primary keys](#replicate-tables-without-primary-keys).

## II. Set up connection configuration
Specify the connection details of your SQL Server instance to Replicant in one of the following two ways:

- [A connection configuration file](#using-a-connection-configuration-file)
- [AWS Secrets Manager](#aws-secrets-manager)
- [KeyStore](#using-keystore-for-credentials)

### Using a connection configuration file.
The connection configuration fild holds the connection details and login credentials.
You can find a sample connection configuration file `sqlserver.yaml` in the `$REPLICANT_HOME/conf/conn` directory. The following configuration parameters are available:

#### `type`
The connection type representing the database. In this case, it's `SQLSERVER`.

#### `host`
The hostname of your SQL Server system.

#### `port`
The port number to connect to the `host`.

#### `username`
The username credential to access the SQL Server system.

#### `password`
The password associated with `username`.

#### `auth-type`
The authentication protocol for the connection. The following protocols are supported:

- `NATIVE` (Default)
- `NLTM`
    
Default authentication protocol is always `NATIVE` if you don't explicitly set the `auth-type` parameter.

In case of `NLTM` protocol, provide the [`username`](#username) in `DOMAIN\USER` format—for example, `domain\alex`.

#### `extractor`
The CDC Extractor to use for real-time replication. 

To use SQL Server Agent, follow these steps:

- Set `extractor` to `LOG`.
- Follow the instructions in [Replicant SQL Server Agent Installation]({{< ref "docs/references/source-prerequisites/sqlserver#replicant-sql-server-agent-installation" >}}).

#### `is_azure`
Optional parameter. If you're hosting SQL Server on Azure, you must set this parameter to `true`.

#### `max-connections` 
The maximum number of connections Replicant uses to load data into the SQL Server system.

The following is a sample connection configuration:


```YAML
type: SQLSERVER

host: localhost
port: 1433

username: 'USERNAME'
password: 'PASSWORD'
database: 'tpcc'

extractor: LOG

max-connections: MAX_NUMBER_OF_CONNECTIONS
```

### AWS Secrets Manager
If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 

### Use KeyStore for credentials
Replicant supports consuming login credentials from a _credentials store_. Instead of specifying username and password [in plain form](#using-a-connection-configuration-file), you can keep them in a KeyStore and provide the KeyStore details in the connection configuration file like below:

```YAML
credentials-store:
    type: {PKCS12|JKS|JCEKS}
    path: PATH_TO_KEYSTORE_FILE
    key-prefix: PREFIX_OF_THE_KEYSTORE_ENTRY
    password: KEYSTORE_PASSWORD
```

Replace the following:

- *`PATH_TO_KEYSTORE_FILE`*: The path to your KeyStore file.
- *`PREFIX_OF_THE_KEYSTORE_ENTRY`*: The prefix of your KeyStore entries. You can create entries in the credential store using a prefix that preceeds each credential alias. For example, you can create KeyStore entries with aliases `sqlserver_username` and `sqlserver_password`. You can then set `key-prefix` to `sqlserver_`.
- *`KEYSTORE_PASSWORD`*: The KeyStore password. This parameter is optional. If you don’t want to specify the KeyStore password here, then you must use the UUID from your license file as the KeyStore password. Remember to keep your license file somewhere safe in order to keep the KeyStore password secure.

## III. Create the heartbeat table 
For [`full` mode replication]({{< ref "docs/running-replicant#replicant-full-mode" >}}), you need to create a heartbeat table. For example:

```SQL
CREATE TABLE "tpcc"."dbo"."replicate_io_cdc_heartbeat"("timestamp" BIGINT NOT NULL, PRIMARY KEY("timestamp"))
```

## IV. Set up Extractor configuration
To configure real-time replication according to your requirements, specify your configuration in the Extractor configuration file. You can find a sample `sqlserver.yaml` in the `$REPLICANT_HOME/conf/src` directory. 

All configuration parameters for `realtime` mode live under the `realtime` section. The following is a sample configuration:

```YAML
realtime:
  threads: 4
  fetch-size-rows: 10000
  fetch-duration-per-extractor-slot-s: 3
  heartbeat:
    enable: true
    catalog: "tpcc"
    schema: "dbo"
    interval-ms: 10000
```

For more information about the configuration parameters in `realtime` mode, see [Realtime Mode]({{< ref "/docs/references/extractor-reference#realtime-mode" >}}).

## Replicate tables without primary keys
To use SQL Server Agent as CDC Extractor, we recommend that all replicated tables have primary keys. However, it's possible to replicate tables without primary keys if the tables meet the following criteria:

> _The tables must have a set of non-nullable columns that uniquely identify each row._

Replicant replicates table without a primary key by creating a view of that table and then replicating that view instead. By default, each view Replicant creates has the following two properties: 

- Each view belongs to the `dbo` schema. 
- The name of each view starts the prefix `replicant_`. 

However, you can change these default properties by specifying the following respective parameters in [the SQL Server source connection configuration file](#using-a-connection-configuration-file): 

### `auxiliary-object-schema`
The name of the schema to which the view belongs to.

### `auxiliary-object-prefix`
The prefix to use for the name of each view.

For example, the following connection configuration for SQL Server uses the preceeding parameters to set the view properties:

```YAML
type: SQLSERVER

host: localhost
port: 1433

username: 'alex'
password: 'alex1995'
database: 'tpcc'

extractor: LOG

max-connections: 30

auxiliary-object-schema: 'admin'
auxiliary-object-prefix: 'price_'
```
