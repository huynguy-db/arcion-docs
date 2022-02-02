---
title: Microsoft SQL Server
weight: 3
bookHidden: false 
---

This page describes the requirements for using Microsoft SQL Server as source.

## Windows Agent Installation

The agent has the following security requirements:

1. The agent has the following security requirements:

   a. The installation must be done by a user that is an administrator for the local system.

   b. The service must be installed under a user that can log into SQL Server and has the following access:
      - Must have the [**Log on as a service**](https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/log-on-as-a-service) on the local system. This privilege is added automatically by the installer.
      - The user must be a `db_owner` of both the replicated database and the scratch database described in step 9c. 
      - The user must be a `db_owner` of the system databases `msdb` and `replicantdistribution`.
      - In addition to the replicated tables, the service must have select access to the following SQL Server objects in the replicated database:
         - `syscolumns`
         - `sys.indexes`
         - `sys.index_columns`
      - Also, the user must be enabled for user mapping for the scratch database (described in step 6c) and added as an owner. No data is inserted into the database and only the following objects are accessed:
         - `MSreplication_objects`
         - `sysusers`
         - `sysobjects`
      - To start and stop the distribution agent, the user must be a member of the  **sysadmin** role. This role is optional, it just means that the service won’t be able to automatically start and stop the distribution agent.
2.  Run the MSI package **ReplicantForMSS.msi**. This installer will create the files required for the local Windows agent at the default location of `%HOMEDRIVE%\Program Files\Blitzz.io\Replicant for Microsoft SQL Server`.
3. The installer prompts for the service user and password. This user must have system and database privileges as described in 1b. This user will automatically be granted the *logon as a service* privilege.
4. The installer prompts for a staging directory that is used to transfer transactions to the system where the replicate process is running. 
   1. If not using the socket file server to publish the files, this directory must be a shared mount point with full access available from the system running the database being replicated as well the system running the replicate process(es). Note, it is possible to simply share the default location as long as there’s enough space.
   2. The user assigned to run the service must have full access to the staging directory. The installer assigns those privileges automatically, but if the staging directory is later moved, but sure to give that user full access to that directory.
5. To enable the socket-based file server, simply edit the `sqlserver.yaml` file located in `<install dir>\conf\conn` and change the file-server section to enable the server, set the desired port and specify the thumbprint of the certificate to be used for the secured connection. This configuration will be applied when enabling replication as described below. To enable this feature with a self signed certificate, perform the following:

   a. From a Windows command prompt, run the following command:
   
   ```bat
   powershell New-ItemProperty -Path HKLM:\Software\SingleStore\Replicate -Name TlsCertificateHash -Value (New-SelfSignedCertificate -DnsName SingleStore -CertStoreLocation "cert:\CurrentUser\My"  -NotAfter (Get-Date).AddYears(20)).Thumbprint -PropertyType STRING -Force
   ```
   
   b. Using the **regedit** tool, navigate to `HKEY_LOCAL_MACHINE\SOFTWARE\SingleStore\Replicate` and set the value `FileServerEnabled` to `1`.
   
   c. Restart the `replicatesvc` service using the **services.msc** tool.
   
   d. The certificate named Blitzz will need to be exported from the Personal\My folder in the **certmgr.msc** tool and added to the keystore of the JRE that runs the replicate tool on Linux. Export only the certificate and not the key.
6. To change the staging directory location after installation, run the command `ReplicateDB -t <staging directory>`.
7. The installation includes the tool **ReplicateDB.exe**, that sets up a local publication and subscription for the specified database. 
   1. To run the ReplicateDB tool, launch a command prompt as administrator.
   2. The simplest form of the command to specify a database for replication is: `ReplicateDb -d <database> -e -au <agent user> -ap <agent password>`, where `-d` specifies the database to replicate, `-e` specifies a trusted database connection and -`au`/`-ap` specifies the user the snapshot and log reader agents will run under. Running **replicatedb.exe** without parameters provides full usage.
8. If LOB data is being replicated, the specified agent user (specified with `-au`)  must have write permissions on the directory `C:\Program Files\Microsoft SQL Server\XX\COMfolder` where `XX` represents the `instanceID`.
9. The ReplicateDb tool performs the following steps, which can be performed manually:
   a. The system must be enabled for distribution which requires **sysadmin**.
   b. The database must be enabled for replication which requires **sysadmin**.
   c. A scratch subscription database named `replicant_<replicated_db_name>` must be created on the local system that remains empty except for metadata information.
   d. A publication must be created with the `db_owner `database role on the publication database at the Publisher or **sysadmin** server role on the Publisher.
   e. Create a subscription which `db_owner` database role on the publication database at the Publisher or **sysadmin** server role on the Publisher.
   f. Configure agent profiles requiring **sysadmin** server role on the Distributor
10. The **ReplicateDB** tool will automatically start the SQL Agent and initialize the subscription. However, if the ReplicantDb steps are performed manually, the Replicant Service must be started (using either the command `ReplicantSvc -s` or the Windows services console) followed by the SQL Server Agent. Finally, initialize the subscription by starting the snapshot agent for the publication named `[<db>]: Replicant Publication for <db>`.
11. Once the snapshot job completes, the replicate process can be started.

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