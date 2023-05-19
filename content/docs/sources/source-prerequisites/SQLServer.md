---
pageTitle: Using SQL Server as Source with Arcion CDC Agent
title: Microsoft SQL Server
description: "Learn how to set up Replicant Arcion CDC Agent for your Source SQL Server and enable CDC replication."
weight: 3
bookHidden: false
url: docs/references/source-prerequisites/sqlserver
---

# Arcion CDC Agent
If you set [the `extractor` parameter to `LOG` for your Source SQL Server]({{< ref "docs/sources/source-setup/sqlserver/realtime-replication/arcion-cdc-agent#extractor" >}}), Replicant uses the Arcion CDC Agent as CDC Extractor. This page describes how to install and configure Replicant Arcion CDC Agent.

## Overview

In the following diagram, the source SQL Server instance represents the location of the database or databases that undergoes replication. The target database can be any destination that Replicant supports.

![Diagram showing how Arcion CDC Agent works for real-time replication into SQL Server](/images/arcion_cdc_agent_for_sql_server.svg)

The Arcion CDC Agent works by setting up push transactional replication on the source database to the local SQL Server Express instance. The local Express instance works as a _replication proxy_ in the following manner: 
1. Arcion CDC Agent intercepts all replicated data before the data hits the SQL Server subscriber.
2. Arcion CDC Agent then hands over the data to the Replicant process.
3. Replicant prepares the data for the target and applies the data.

## Requirements

- Windows 10 or later or Windows Server 2016 or later
- 16GB RAM
- 100GB of free disk space
- SQL Server 2016 Express Edition or later

## Installation

Before proceeding with the installation, pay attention to the following:

  - Ensure that TCP ports 1433 and 6061 can accept inbound traffic.
  - To force encryption, configure the SQL Express instance to allow TCP protocol.
  - SQL Server Express installs to a named instance by default. To connect to the instance, you must enable the SQL Server Browser service. This enables the service to start and operate automatically.
  - Identify a Windows login with the **sysadmin** role for the local SQL Express instance.
  - The installation elevates to the Administrator level. Therefore, either an Administrator must run it or the Administrator login must be available.
  - You must install the SQL Server Express instance as either one of the following instance types:
    - Install as the default instance on the default port 1433.
    - Install as a named instance with the SQL Browser server running.

To install Arcion CDC Agent, run the installer `remote-replicant-mssql-cdc-agent-<version>.msi`. This starts the installation wizard. Follow these steps to complete the installation:

1. After the first screen of the installation wizard appears, click **Next**.

2. In the next **Select Installation Folder** screen, choose the installation location. After making your choice, click **Next**.

3. The **Specify Replicant Service User** screen appears. Here you must specify the Windows login that runs the Arcion CDC Agent service. This login must possess the **sysadmin** role to access the local SQL Server Express instance. 

    After filling out the **Service User** and **Password** fields, click **Next**.

4. In the next screen, specify the staging directory. Arcion CDC Agent temporarily writes the replicated data to the staging directory. For a production system, we recommend at least 100GB of free disk space for this temporary storage.

    After filling out the **Staging Directory** field, click on **Next**.

5. The **Confirm Installation** screen appears. If the settings in the preceding steps suit your requirements, click **Next** to start the installation.

## Securely connect to the CDC Agent 
Arcion CDC Agent installer generates a certificate for TLS/SSL communication. This certificate encrypts the connections to the CDC Agent. By default, Replicant trusts all CDC Agent connections. To ensure that Replicant connects to a trusted Agent, you must take the following measures:

1. Import the TLS certificate for communication into the JRE TrustStore.
2. Set the `trust-sever` option of the `agent-connection` parameter to `false`. The Replicant server contains the TrustStore. For information about the `agent-connection` parameter, see [Connect Replicant and Arcion CDC Agent](#connect-replicant-and-arcion-cdc-agent).

The following sample command shows how to import the certificate.

```sh
sudo keytool -import -alias arcion -keystore $JAVA_HOME/jre/lib/security/cacerts -file replicant.cert
```

The preceding command prompts you for the KeyStore password. If you don't change the KeyStore password, use the default password `changeit`.

You can find the `replicant.cert` file in the `INSTALLATION_PATH\Arcion\Replicant for Microsoft SQL Server\certs\` directory. `INSTALLATION_PATH` indicates where you install Arcion CDC Agent. If you install Arcion CDC Agent in the default location, the certificate occupies the `c:\Program Files\Arcion\Replicant for Microsoft SQL Server\certs\` directory.

Arcion CDC Agent installer generates a new certificate for each Agent installation. So you need to import the certificate for each Arcion CDC Agent Replicant connects to.

## Connect Replicant and Arcion CDC Agent
You can find a sample SQL Server connection configuration file `sqlserver.yaml` in the `conf\conn` directory inside the Replicant installation location. 

To configure Replicant to connect to Arcion CDC Agent, set the following parameters in the connection configuration file.

### `sql-jobs-username` and `sql-jobs-password`
These parameters specify the Windows login on the target system to run the replication jobs.

### `log-path`
Specifies where Replicant stores the data it receives from Arcion CDC Agent. 

If Replicant runs on the same system as Arcion CDC Agent, `log-path` points to the staging directory. Notice that you specify this staging directory during Arcion CDC Agent installation.

### `sql-proxy-connection`
Specifies the login for the SQL Server Express instance. 

The source database must be able to use this login to connect to the Express instance. The Express instance works as a _proxy_ target for the actual SQL Server replication. Arcion inserts no data into the proxy database. 

The following parameters specify the proxy connection details:
<dl class="dl-indent">
<dt>

`host` </dt> 
<dd>

The hostname of the Express instance that the source database connects to. 

The hostname follows the format *`HOSTNAME\INSTANCE`*. You must specify the *`HOSTNAME`* in any one of the following manner:

- An IP address
- A fully qualified domain name (FQDN)

By default, SQL Server Express installs a named instance `SQLEXPRESS`. If you choose this default instance, you don't need to include the *`INSTANCE`* part in `host`.
</dd>
<dt>

`port`</dt> 
<dd>

The port number. 

If you don't use SQL Server 2019 or later, set the port to `1433`</dd>

<dt> 

`username`</dt>
<dd>

The username credential to log into the SQL Server Express instance.</dd>

<dt>

`password`</dt>

<dd>

The password associated with the `username` to log into the SQL Server Express instance.</dd>

<dt>

`auth-type`</dt>

<dd>The authentication protocol.</dd>
</dl>

### `azure-file-storage-path` and `azure-file-storage-key`
If the source database is an Azure-managed SQL Server instance, you must specify a storage account must be specified with these two parameters. This storage account acts as an intermediate storage area for the replicated data.

### `sql-snapshot-folder`
Specifies where on the source SQL Server to store the initial schema information. Do not specify this option for an Azure-managed SQL Server instance. 

`sql-snapshot-folder` contains insignificant and temporary data when the replication first starts. This folder can be either a physical or a UNC path that the source SQL Server instance can access.

### `agent-connection`
Specifies the connection details for Arcion CDC Agent. 

The following parameters specify the Agent connection details:
<dl class="dl-indent">
<dt>

`host` </dt> 
<dd>

The hostname of the machine where you install Arcion CDC Agent.
</dd>

<dt> 

`username`</dt>
<dd>

Windows login for Arcion CDC Agent—for example, `mwrightwin10\administrator`. This login must have access to the staging directory.</dd>

<dt>

`password`</dt>

<dd>

The password associated with `username`.</dd>
<dt>

`port`</dt> 
<dd>

The port number. 

_Default: `6061`._
</dd>

<dt>

`mode`</dt>

<dd>

The connection mode. 

Set this parameter to any one of the following values:

  - **`CONFIG`**. Use this mode if Replicant runs on the same system.
  - **`FILES`** (Default). Use this mode if Replicant runs on a separate system.

</dd>
</dl>

The following illustrates a sample configuration:

```YAML
sql-jobs-username: 'alex10\administrator'
sql-jobs-password: 'alex1234'

log-path: /data/transactions # used to cache DML received from Arcion CDC Agent
sql-proxy-connection:
  host: alex10
  port: 1433
  username: 'alex10\alex'
  password: 'alex1234'
  auth-type: NTLM

azure-file-storage-path: \\arcionsqldev.file.core.windows.net\replication # be sure to use backslashes in the path
azure-file-storage-key: DefaultEndpointsProtocol=https;AccountName=arcionsqldev;AccountKey=1GJlZ6fdfB/YT5SnPkLyKFo/5DhaqgRhiW7QVleE38FypEyIEohO9PCRbCbUA17Peavt0mqnnK12+AStjexQ4g==;EndpointSuffix=core.windows.net
sql-snapshot-folder: c:\transactions

# Details for connecting to Agent
agent-connection:
  host: alex10
  username: 'alex10\administrator'
  password: 'alex1234'
  port: 6061
  mode: CONFIG
```

# SQL Server user permissions
In [full]({{< ref "docs/sources/source-setup/sqlserver/full-mode-replication" >}}) and [real-time]({{< ref "docs/sources/source-setup/sqlserver/realtime-replication" >}}) replication, Arcion CDC Agent uses the [`config-username` user]({{< ref "docs/sources/source-setup/sqlserver/realtime-replication/arcion-cdc-agent#configuration-user-for-arcion-cdc-agent" >}}) to initialize replication. The `config-username` user must possess the **sysadmin** role.

Notice that you also specify the database user using [the `username` parameter in the connection configuration file]({{< ref "docs/sources/source-setup/sqlserver/realtime-replication/arcion-cdc-agent#username" >}}).
Replicant uses this `username` user for the snapshot phase. The `username` user must possess the following permissions: 

1. Read access to all the databases, schemas, and tables that the user wants to replicate.
2. Read access to the following system tables and views:
    - `sys.databases`
    - `sys.schemas`
    - `sys.tables`
    - `sys.columns`
    - `sys.key_constraints`
    - `sys.foreign_keys`
    - `sys.check_constraints`
    - `sys.default_constraints`
3. Execute permissions on the following system stored procedures:
    - `sp_tables`
    - `sp_columns`
    - `sp_pkeys`
    - `sp_statistics`

{{< hint "info" >}}
You need the preceding permissions only once at the start of a fresh replication.
{{< /hint >}}