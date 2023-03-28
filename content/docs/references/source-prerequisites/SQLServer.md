---
pageTitle: Using SQL Server as Source with Arcion CDC Agent
title: Microsoft SQL Server
description: "Learn how to set up Replicant Arcion CDC Agent for your Source SQL Server and enable CDC replication."
weight: 3
bookHidden: false 
---

# Arcion CDC Agent
If you set [the `extractor` parameter to `LOG` for your Source SQL Server](/docs/source-setup/sqlserver/#specify-cdc-extractor), Replicant uses the Arcion CDC Agent as CDC Extractor. This page describes how to install and configure Replicant Arcion CDC Agent.

## Overview

In the following diagram, the Source SQL Server instance represents the location of the database or databases that would undergo replication. The Target database can be any destination that Replicant supports.

![Diagram showing how Arcion CDC Agent works for real-time replication into SQL Server](/images/arcion_cdc_agent_for_sql_server.svg)

The Arcion CDC Agent works by setting up push transactional replication on the source database to the local SQL Server Express instance. The local Express instance works as a _replication proxy_. All replicated data gets intercepted before hitting the SQL Server subscriber and handed to the Replicant process; Replicant then prepares the data for the target and applies it.

## Requirements

- Windows 10 or later or Windows Server 2016 or later
- 16GB RAM
- 100GB of free disk space
- SQL Server 2016 Express Edition or later

## Installation

Before proceeding with the installation, please make sure that the following conditions are met:

  - Ensure that TCP ports 1433 and 6061 are open for Inbound traffic.
  - The SQL Express instance is configured to allow the TCP protocol forces encryption.
  - By default, SQL Server Express installs to a named instance. To connect to the instance, the SQL Server Browser service must be enabled so that it starts automatically and continues to run.
  - Identify a Windows login with the **sysadmin** role for the local SQL Express instance.
  - The installation will elevate to the Administrator level, so either an Administrator must run it or the Administrator login must be available.
  - If you're installing into a Virtual Machine, make sure that nested VMs are supported to co-install Replicant. Otherwise, use a separate system for Replicant.
  - You must install the SQL Server Express instance as either one of the following instance types:
    - Install as the default instance on the default port 1433.
    - Install as a named instance with the SQL Browser server running.

To install Arcion CDC Agent, run the installer called `remote-replicant-mssql-cdc-agent-<version>.msi`. This will start the installation wizard. Follow the steps below to complete the installation:

1. After the first screen of the installation wizard appears, click **Next**.

2. In the next **Select Installation Folder** screen, you need to choose the installation location. After making your choice, click **Next**.

3. The **Specify Replicant Service User** screen will appear. This is where you specify the Windows login that will run the Arcion CDC Agent service. This login must have the **sysadmin** role to access the local SQL Server Express instance. 

    After filling out the **Service User** and **Password** fields, click **Next**.

4. The next screen is for specifying the staging directory. A staging directory is where Arcion CDC Agent temporarily writes the replicated data. For a production system, it is recommended that there is at least 100GB of free disk space for this temporary storage.

    After filling out the **Staging Directory** field, click on **Next**.

5. The next screen is **Confirm Installation**. If you're satisfied with the settings you chose in the previous steps, click **Next** to start the installation.

<!-- ## Configuration

{{< hint "info" >}}
If WSL is installed in a Virtual Machine, Intel VT-x/EPT or AMD-V/RVI must be enabled for the guest and Hyper-V must be disabled on the host system.
{{< /hint >}}

{{< hint "info" >}}
If you need to install Replicant, follow the instructions in [Arcion Replicant Quickstart](/docs/quickstart/).
{{< /hint >}} -->

## Securely connect to the CDC Agent 
Arcion CDC Agent installer generates a certificate for TLS/SSL communication. This certificate encrypts the connections to the CDC Agent. By default, Replicant trusts all CDC Agent connections. To ensure that Replicant connects to a trusted Agent, you must take the following measures:

1. Import the TLS certificate for communication into the JRE TrustStore.
2. Set the `trust-sever` option of the `agent-connection` parameter to `false`. The Replicant server contains the TrustStore. For information about the `agent-connection` parameter, see [Connect Replicant and Arcion CDC Agent](#connect-replicant-and-arcion-cdc-agent).

The following sample command shows how to import the certificate.

```sh
sudo keytool -import -alias arcion -keystore $JAVA_HOME/jre/lib/security/cacerts -file replicant.cert
```

The preceeding command prompts you for the KeyStore password. The default password is `changeit`.

{{< hint "info" >}} The location of the `replicant.cert` file is `INSTALLATION_PATH\Arcion\Replicant for Microsoft SQL Server\certs\replicant.cert`, where `INSTALLATION_PATH` is where you installed Arcion CDC Agent. If you installed Arcion CDC Agent in the default location, the certificate will be in `c:\Program Files\Arcion\Replicant for Microsoft SQL Server\certs\replicant.cert`.
{{< /hint >}}

{{< hint "info" >}}
If the Replicant process is located on a different server than the Arcion CDC Agent, then you need to copy the `replicant.cert` file to the Replicant server.
{{< /hint >}}

{{< hint "info" >}}A new certificate is generated for each Agent installation. So you need to import the certificate for each Arcion CDC Agent Replicant will be connecting to.{{< /hint >}}

## Connect Replicant and Arcion CDC Agent
There's a sample SQL Server connection configuration file `sqlserver.yaml` in the `conf\conn` directory inside the Replicant installation location. 

To configure Replicant to connect to Arcion CDC Agent, set the following parameters in that configuration file:

```YAML
sql-jobs-username: 'WINDOWS_LOGIN_USERNAME'
sql-jobs-password: 'WINDOWS_LOGIN_PASSWORD'
log-path: /mnt/c/arcion/data/replicate/ # used to cache DML received from Arcion CDC Agent
sql-proxy-connection:
  host: HOSTNAME
  port: PORT_NUMBER
  username: 'USERNAME'
  password: 'PASSWORD'
  auth-type: NTLM

# Required for Azure Managed SQL
azure-file-storage-path: \\arcionsqldev.file.core.windows.net\replication # be sure to use backslashes in the path
azure-file-storage-key: DefaultEndpointsProtocol=https;AccountName=arcionsqldev;AccountKey=1GJlZ6fdfB/YT5SnPkLyKFo/5DhaqgRhiW7QVleE38FypEyIEohO9PCRbCbUA17Peavt0mqnnK12+AStjexQ4g==;EndpointSuffix=core.windows.net
sql-snapshot-folder: c:\transactions

# Details for connecting to Agent
agent-connection:
  host: HOSTNAME
  username: 'USERNAME'
  password: 'PASSWORD'
  port: PORT_NUMBER
  mode: {CONFIG|FILES}
```

- `sql-jobs-username`, `sql-jobs-password`: These parameters specify the Windows login used on the Target system to run the replication jobs.

- `log-path`: Specifies where Replicant will store the data it received from Arcion CDC Agent. If Replicant is running on the same system as Arcion CDC Agent, this path can point to the staging directory you specified during Arcion CDC Agent installation. In the sample config above, we've shown a path from within WSL using the default staging location.

- `sql-proxy-connection`: Specifies the login used to connect to the SQL Server Express instance that works as the "ghost" target for the actual SQL Server replication. No data is inserted into this database.
  - `host`: The hostname in the format *`HOST\INSTANCE`*—for example, `mwrightwin10\SQLEXPRESS`. For Azure Managed SQL, this must be an IP address or DNS name that is accessible from Azure. By default, SQL Server Express installs a named instance called `SQLEXPRESS`. However, if a default instance is used, do not specify an instance.
  - `port`: The port number.
  - `username`: The username credential to log into the SQL Server Express instance.
  - `password`: The password associated with the `username` to log into the SQL Server Express instance.
  - `auth-type`: The authentication protocol used.

  {{< hint "info" >}} If the source database is an Azure Managed SQL instance, the host specified for the proxy must be accessible from the Azure Managed instance. {{< /hint >}}

- `azure-file-storage-path`, `azure-file-storage-key`: If the source database is an Azure Managed SQL instance, a storage account must be specified with these two parameters. This storage account is an intermediate storage area for the replicated data. 

- `sql-snapshot-folder`: Specifies where on the Source SQL Server to store the initial schema information. Do not specify this option for an SQL Azure managed instance. The data stored at this location is insignificant and temporary when the replication is first started. This folder can be either a physical or UNC path accessible from the Source SQL Server instance.

- `agent-connection`: Specifies the connection details for Arcion CDC Agent. 
  - `host`: The hostname of the machine where Arcion CDC Agent is installed.
  - `username`: Windows login for Arcion CDC Agent. This login must have access to the staging directory. Replace *`USERNAME`* with the appropriate username—for example, `mwrightwin10\administrator`.
  - `password`: The password associated with `username`.
  - `port`: The port number. Default port number is `6061`.
  - `mode`: The connection mode. There are two connection modes available. Set this parameter to only one of the two following modes: 
    - **`CONFIG`**: Use this mode if Replicant is running on the same system.
    - **`FILES`**: Use this mode if Replicant is running on a separate system. This is the default mode.

# SQL Server user permissions
In [full]({{< ref "docs/source-setup/sqlserver/full-mode-replication" >}}) and [real-time]({{< ref "docs/source-setup/sqlserver/realtime-replication" >}}) replication, Arcion CDC Agent uses the [`config-username` user]({{< ref "docs/source-setup/sqlserver/realtime-replication/arcion-cdc-agent#configuration-user-for-arcion-cdc-agent" >}}) to initialize replication. The `config-username` user must possess the **sysadmin** role.

Notice that you also specify the database user using [the `username` parameter in the connection configuration file]({{< ref "docs/source-setup/sqlserver/realtime-replication/arcion-cdc-agent#username" >}}).
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
You need the preceeding permissions only once at the start of a fresh replication.
{{< /hint >}}