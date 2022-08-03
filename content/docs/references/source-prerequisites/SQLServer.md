---
title: Microsoft SQL Server
weight: 3
bookHidden: false 
---

This page describes the requirements for using Microsoft SQL Server as source.

## Windows Agent Installation

The agent has the following security requirements:

1. The agent has the following security requirements:

   a. The installation must be done by a Windows user that is an *administrator* for the local system.

   b. The service must be installed under a Windows user that can log into SQL Server and has the following access:
      - Must have the [**Log on as a service**](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/log-on-as-a-service) on the local system. The installer automatically adds this privilege.
      - The Windows user must be a `db_owner` of both the replicated database and the scratch database. 
      - The Windows user must be a `db_owner` of the system databases `msdb` and `replicantdistribution`.
      - In addition to the replicated tables, the service must have select access to the following SQL Server objects in the replicated database:
         - `syscolumns`
         - `sys.indexes`
         - `sys.index_columns`
      - Also, the Windows user must be enabled for user mapping for the scratch database and added as an owner. No data is inserted into the database and only the following objects are accessed:
         - `msreplication_objects`
         - `sysusers`
         - `sysobjects`
      - To start and stop the distribution agent, the Windows user must be a member of the  **sysadmin** role. This role is optional, it just means that the service won’t be able to automatically start and stop the distribution agent.

2. Run the MSI package **ReplicantForMSS.msi**. This installer will create the files required for the local Windows agent at the default location of `%HOMEDRIVE%\Program Files\Blitzz.io\Replicant for Microsoft SQL Server`.

   a. The installer prompts for the service user and password. This Windows user must have system and database privileges as described in 1b. This user will automatically receive the *Log on as a service* privilege.

   b. The installer prompts for a staging directory that is used to transfer transactions to the system where the replicate process is running. 
      - If not using the socket file server to publish the files, this directory must be a shared mount point with full access available from the system running the database being replicated as well the system running the replicate process(es). 
         {{< hint "info" >}}It is possible to simply share the default location as long as there’s enough space.{{< /hint >}}
      - The Windows user assigned to run the service must have full access to the staging directory. The installer assigns those privileges automatically, but if the staging directory is later moved, but sure to give that user full access to that directory.

3. To change the staging directory location after installation, run the command `ReplicantDB -t <staging_directory>`.

4. To enable the socket-based file server, simply edit the `sqlserver.yaml` file located in `<install_dir>\conf\conn` and change the file-server section to enable the server, set the desired port and specify the thumbprint of the certificate to be used for the secured connection. This configuration will be applied when enabling replication as described below. 

   To enable this feature with a self signed certificate, perform the following:

   a. From a Windows Command Prompt, run the following command:
   
   ```bat
   powershell New-ItemProperty -Path HKLM:\Software\Blitzz.io\Replicant -Name TlsCertificateHash -Value (New-SelfSignedCertificate -DnsName Blitzz -CertStoreLocation "cert:\CurrentUser\My"  -NotAfter (Get-Date).AddYears(20)).Thumbprint -PropertyType STRING -Force
   ```
   
   b. Using the **regedit** tool, navigate to `HKEY_LOCAL_MACHINE\SOFTWARE\Blitzz\Replicant` and set the value `FileServerEnabled` to `1`.
   
   c. Restart the `replicantsvc` service using the **services.msc** tool.
   
   d. The certificate named Blitzz will need to be exported from the `Personal\My folder` in the **certmgr.msc** tool and added to the keystore of the JRE that runs the Replicant tool on Linux. Export only the certificate and not the key.

5. The installation includes the tool **ReplicantDB.exe**, that sets up a local publication and subscription for the specified database.

   a. To run the **ReplicantDB** tool, launch a command prompt as administrator.
   
   b. The simplest form of the command to specify a database for replication is: 
      ```shell
      ReplicantDb conf/conn/sqlserver.yaml -au <agent_user>
      ```
    - The `sqlserver.yaml` file contains the configuration for the connection to the database to replicate.
    - The argument `-au` specifies the Windows user under which the snapshot and log reader agents will run. 
   There is a sample connection configuration file in the `conf/conn` directory that you can modify for your own connection. Running **ReplicantDB.exe** without parameters provides full usage.

   c. Note that you can specify the scope of the tables to replicate in a filter file in the same format as the filter file used with Replicant. Simply specify the file to use when launching **ReplicantDB** with the `--filter <filter_file>` option. There is a sample provided in the install directory in the `filter` folder or if already created, copy the filter from the Linux Replicant installation. Any time this file is changed, simply run `ReplicantDB` with the `--filter` option and the tables being replicated will be updated.

6. If LOB data is being replicated, the specified agent user (specified with `-au`)  must have write permissions on the directory `C:\Program Files\Microsoft SQL Server\XX\COMfolder`, where `XX` represents the `instanceID`.
7. The **ReplicantDB** tool will automatically start the SQL Agent and initialize the subscription.
8. Once the snapshot job completes, the Replicant process can be started on the Linux system.

## SQL Server User Permissions

1. The user should have read access on all the databases, schemas and tables to be replicated.
2. The user should have read access to following system tables/views
    - `sys.databases`
    - `sys.schemas`
    - `sys.tables`
    - `sys.columns`
    - `sys.key_constraints`
    - `sys.foreign_keys`
    - `sys.check_constraints`
    - `sys.default_constraints`
3. The user should have execute permissions on following system procs
    - `sp_tables`
    - `sp_columns`
    - `sp_pkeys`
    - `sp_statistics`

{{< hint "info" >}}These permissions are needed only once at the start of fresh replication. {{< /hint >}}