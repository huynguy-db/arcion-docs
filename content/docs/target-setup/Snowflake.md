---
pageTitle: Documentation for Snowflake Target connector
title: Snowflake
description: "Set up Snowflake as Target for your data pipelines using Arcion Snowflake connector. Learn about Type-2 CDC and Snowflake Iceberg tables support."
weight: 10
bookHidden: false
---
# Destination Snowflake

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample Snowflake connection configuration file:
    ```BASH
    vi conf/conn/snowlflake.yaml
    ```
2. The configuration file has two parts:

    - Parameters related to target Snowflake server connection.
    - Parameters related to stage configuration.

    ### Parameters related to target Snowflake server connection
    For connecting to target Snowflake server, you can choose between two methods for an authenticated connection: 
    - [RSA key pair authentication](#use-rsa-key-pair-for-authentication)
    - Basic username and password authentication

    For connecting to Snowflake via basic username and password authentication, you have two options:

    #### Fetch credentials from AWS Secrets Manager
    You can choose to store your username and password in AWS Secrets Manager, and tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager).

    #### Specify credentials in plain form
    You can also specify your credentials in plain form in the connection configuration file like the sample below:

    ```YAML
    type: SNOWFLAKE

    host: SNOWFLAKE_HOSTNAME
    port: PORT_NUMBER 
    warehouse: "WAREHOUSE_NAME"

    username: "USERNAME"
    password: "PASSWORD"

    max-connections: 20 #Specify the maximum number of connections replicant can open in Snowflake
    max-retries: 10
    retry-wait-duration-ms: 1000
    ```
    
    Replace the following:
    
    - *`SNOWFLAKE_HOSTNAME`*: the Snowflake hostname. The hostname is in the format `ACCOUNT_NAME.REGION_ID.snowflakecomputing.com` or `ACCOUNT_NAME.snowflakecomputing.com`—for example, `replicate_partner.snowflakecomputing.com`.
    - *`PORT_NUMBER`*: the port number of Snowflake host
    - *`WAREHOUSE_NAME`*: the name of the [Snowflake warehouse](https://docs.snowflake.com/en/sql-reference/ddl-virtual-warehouse.html#warehouse-resource-monitor-ddl)
    - *`USERNAME`*: the username to connect to the Snowflake server
    - *`PASSWORD`*: the password associated with *`USERNAME`*
    
    {{< hint "info" >}} #### Note
  - Make sure the specified user has `CREATE TABLE` and `CREATE STAGE` privileges on the catalogs/schemas into which replicated tables should be created.
  - If you want Replicant to create catalogs/schemas for you on the target PostgresSQL system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
  - If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `blitzz` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.
    {{< /hint >}}

    ### Additional parameters
    - `credential-store`: Replicant supports consuming `username` and `password` configurations from a _credentials store_ rather than having users specify them in plain text config file. You can use keystores to store your credentials related to your Snowflake server connections.The following parameters are available:

        - `type`: Type of the keystore. Allowed types are `PKCS12`, `JKS`, and `JCEKS`. 
        - `path` : Location of the key-store.
        - `key-prefix`:  You should create entries in the credential store for your configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `snowflake1_username` and `snowflake1_password`. You can then specify the prefix here as `snowflake1_`.
        - `password`: This field is optional. If you don't specify the keystore password here, then you must use the UUID from your license file as the keystore password. Remember to keep your license file somewhere safe in order to keep this password secure.

    ### Parameters related to stage configuration
    - `stage`: By default, Replicant uses Snowflake’s native stage for bulk loading. But it's possible to use a native or an external stage like Azure to hold the data files and then load them on the target Snowflake server from there. This section allows you to specify the details Replicant needs to connect to and use a specific stage.

    - `type`*[v21.06.14.1]*: The stage type. Allowed stages are `NATIVE`, `S3`, and `AZURE`.
    - `root-dir`: Specify a directory on stage which can be used to stage bulk-load files.
    -`conn-url`*[v21.06.14.1]*: URL for the stage. For example, if stage is `S3`, specify bucket name; for `AZURE`, specify container name.
    - `key-id` : This config is valid for `S3` stage type only. Access Key ID for AWS account hosting s3.
    - `account-name`*[v21.06.14.1]* : This config is valid for `AZURE` type only. Name of the ADLS storage account.
    -`secret-key`*[v21.06.14.1]*: This config is valid for both `S3` and `AZURE` types. For example, Secret Access Key for AWS account hosting s3 or ADLS account.
    - `token`*[v21.06.14.1]*:  This config is valid for `AZURE` type only. Indicates the SAS token for Azure storage.

    ### Use RSA key pair for authentication
    You can also choose to use [Snowflake's key pair authentication support](https://docs.snowflake.com/en/user-guide/key-pair-auth.html) for enhanced authentication security instead of using basic authentication via username and password. 
    
    To set up key pair authentication using RSA keys, follow the steps below:

    #### Generate the private key
    From your command line, execute the following command to generate an encrypted private key:

    ```sh
    openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -v1 PBE-SHA1-RC4-128 -out rsa_key.p8
    ```
    The command generates a private key in PEM format:

    ```
    -----BEGIN ENCRYPTED PRIVATE KEY-----
    MIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQIK0h8dqI1n5sCAggA
    MAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECNDwqMf6Xx1pBIIEyNmf044S+pEQ
    ...
    -----END ENCRYPTED PRIVATE KEY-----
    ```
    {{< hint "info" >}}
  **Important:** The command above to generate an encrypted key prompts for a passphrase to grant access to the key. We recommend using a passphrase that complies with PCI DSS standards to protect the generated private key. Additionally, we recommend storing the passphrase in a secure location. When using an encrypted key to connect to Snowflake, you will need to input the passphrase during the initial connection. The use of the passphrase is only for protecting the private key; it's never to sent to Snowflake servers.

  To generate a long and complex passphrase based on PCI DSS standards, follow the steps below:

  - Go to the [PCI Security Standards Document Library](https://www.pcisecuritystandards.org/document_library).
  - For **PCI DSS**, select the most recent version and your desired language.
  - Complete the form to access the document.
  - Search for `Passwords/passphrases must meet the following:` and follow the recommendations for password/passphrase requirements, testing, and guidance.
    {{< /hint >}}

    #### Generate a public key
    From the command line, generate the public key by referencing the private key. The following command references the private key contained in a file named `rsa_key.p8` created in the [previous step](#generate-the-private-key):

    ```sh
    openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
    ```
    The command generates a public key in PEM format:

    ```
    -----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAslwTa+Lj5SMI58GiDzWq
    0rwj4FBymfKzHT16RXecnMcx7uI6KsVpqfh9HH0FMb/3C6YEMeGPkaRmKvXYjM5s
    ...
    -----END PUBLIC KEY-----
    ```

    #### Store the Private and Public Keys Securely

    After following the above steps, you should find the private and public key files saved in a local directory of your system. Note down the path to those files. The private key is stored using the PKCS#8 (Public Key Cryptography Standards) format and is encrypted using the passphrase you specified in the [first step](#generate-the-private-key).

    However, maintain caution in protecting the file from unauthorized access using the file permission mechanism provided by your operating system. It's your responsibility to secure the file when it's not being used.

    #### Assign the public key to a Snowflake user
    Execute the following command to assign the public key to a Snowflake user.

    ```sql
    alter user jsmith set rsa_public_key='MIIBIjANBgkqh...';
    ```

    {{< hint "info" >}}
  - Only security administrators (i.e. users with the SECURITYADMIN role) or higher can alter a user.
  - Exclude the public key delimiters in the SQL statement.
    {{< /hint >}}


    #### Verify the user's public key fingerprint
    Execute the following command to verify the user’s public key:

    ```sql
    DESC USER jsmith;
    ```
    The command output is similar to the following:

    ```
    +---------------------+-----------------------------------------------------+---------+----------------------------------------------+
    | property            | value                                               | default | description                                  |
    +---------------------+-----------------------------------------------------+---------+----------------------------------------------+
    | NAME                | JSMITH                                              | null    | Name                                         |
    ...
    ...
    | RSA_PUBLIC_KEY      | MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAslwT... | null    | RSA public key of the user                   |
    | RSA_PUBLIC_KEY_FP   | SHA256:nvnONUsfiuycCLMXIEWG4eTp4FjhVUZQUQbNpbSHXiA= | null    | Fingerprint of user's RSA public key.        |
    | RSA_PUBLIC_KEY_2    | null                                                | null    | Second RSA public key of the user            |
    | RSA_PUBLIC_KEY_2_FP | null                                                | null    | Fingerprint of user's second RSA public key. |
    ...
    +---------------------+-----------------------------------------------------+---------+----------------------------------------------+
    ```

    #### Edit the connection configuration file
    You need to modify [Replicant's connection configuration file for Snowflake](#parameters-related-to-target-snowflake-server-connection) and include RSA key information there. Specifically, add the following parameters to the connection configuration file:

    ```YAML
    private-key-path: "/PATH_TO_GENERATED_KEY/rsa_key.p8"
    private-key-passphrase: "PRIVATE_KEY_PASSPHRASE"
    ```

    Replace the following:

    - *`PATH_TO_GENERATED_KEY`*: the local directory path to the `rsa_key.p8` keyfile
    - *`PRIVATE_KEY_PASSPHRASE`*: the private key passphrase you specified in the [first step](#generate-the-private-key)

    {{< hint "info" >}}**Note**: If you specify the `private-key-path` and `private-key-passphrase` parameters, you don't need to specify the `password` parameter in the connection configuration file. {{< /hint >}}

## II. Set up Applier Configuration

1. From `$REPLICANT_HOME`, naviagte to the sample Snowflake applier configuration file:
    ```BASH
    vi conf/dst/snowlflake.yaml        
    ```
2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    For snapshot mode, make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16 #Specify the maximum number of threads Replicant should use for writing to the target

      batch-size-rows: 100_000
      txn-size-rows: 1_000_000

      #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
      bulk-load:
        enable: true|false #Set to true if you want to enable bulk loading
        type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
        serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

        #For versions 20.09.14.3 and beyond
        native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```
    ### Parameters related to realtime mode
    If you want to operate in realtime mode, you can use the `realtime` section to specify your configuration. For example:

    ```YAML
    realtime:
      threads: 8 #Specify the maximum number of threads Replicant should use for writing to the target
      max-retries-per-op: 30 #Specify the maximum amount of retries for a failed operation
      retry-wait-duration-ms: 5000 #Specify the time in milliseconds Replicant should wait before re-trying a failed operation
      cdc-stage-type: FILE #Enter your cdc-stage-type
    ```

    When operating in realtime mode, pay attention to the following details:

    - Make sure that the number of `threads` is equal to the number of tables.
    - Enable PK/UK logging if Source table has PK/UK. If table does not have any PK, then only enable full logging. For example, if you're loading data from Oracle, it has support for UK logging.
    - You might want to select any table in your Snowflake dashboard while operating. Due to a Snowflake limitation, problems may arise if table name contains lower case. So you need to execute the following command first:
      ```SQL
      ALTER SESSION SET QUOTED_IDENTIFIERS_IGNORE_CASE = FALSE;
      ```
      After executing the preceeding command, you can select table with lower case names by surrounding the names with double quotation marks.

    ### Use Type-2 CDC
    From version 22.07.19.3 onwards, Arcion supports Type-2 CDC for Snowflake as the Target. Type-2 CDC enables a Target to have a history of all transactions performed in the Source. For example:

    - An INSERT in the Source is an INSERT in the Target.
    - An UPDATE in the Source is an INSERT in the Target with additional metadata like Operation Performed, Time of Operation, etc.
    - A DELETE in the Source is an INSERT in the Target: INSERT with OPER_TYPE as DELETE.

    Arcion supports the following metadata related to source-specific fields:

    - `query_timestamp`: Time at which the user on Source fired a query.
    - `extraction_timestamp`: Time at which Replicant detected the DML from logs.
    - `OPER_TYPE`: Type of the operation (INSERT/UPDATE/DELETE).

    The primary requirement for Type-2 CDC is to *enable full row logging* in the Source.

    {{< hint "info" >}}
  **Note:** Support for Type-2 CDC is limited to the following cases: 
  - Sources that support CDC.
  - `realtime` and `full` modes.
    {{< /hint >}}

    To enable Type-2 CDC for your Snowflake target, follow the steps below:
    
    1. Add the following two parameters under the `realtime` section of the Snowflake Applier configuration file:

    ```YAML
    realtime:
      enable-type2-cdc: true
      replay-strategy: NONE
    ```

    2. In the Extractor configuration file of Source, add the following parameter under the `snapshot` section:

    ```YAML
    snapshot:
      csv-publish-method: READ
    ```
  For a detailed explanation of configuration parameters in the Applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}}).

## Use Snowflake Iceberg Tables
From version A.B.X.Y, Arcion supports [Snowflake Iceberg tables]((https://docs.snowflake.com/en/LIMITEDACCESS/tables-iceberg.html)) as target for both snapshot-based and realtime replication. To use Snowflake Iceberg tables as target, follow the instructions in the following sections.

### Prerequisites

1. Create an Amazon S3 bucket (if it doesn't exist).

2. Create external volume in Snowflake for your AWS S3 bucket using the `CREATE EXTERNAL VOLUME` command:

  ```SQL
  CREATE EXTERNAL VOLUME <volume_name>
    STORAGE_LOCATIONS =
      (
        (
        NAME = '<volume_name>'
        STORAGE_PROVIDER = 'S3'
        STORAGE_AWS_ROLE_ARN = '<iam_role>'
        STORAGE_BASE_URL = 's3://<bucket>[/<path>/]'
        )
      ); 
  ```

  Replace the following:

  - *`<volume_name>`*: the name of the new external volume
  - *`<iam_role>`*: the Amazon Resource Name (ARN) of the IAM role you created
  - *`<path>`*: an optional path that can provide granular control over objects in the bucket. 

For more information on granting Snowflake access to your Amazon S3 bucket, see [Accessing Amazon S3 Using External Volumes
](https://docs.snowflake.com/en/LIMITEDACCESS/table-external-volume-s3.html).

### Specify Iceberg as table type in Applier configuration file
In [your Applier configuration file](#ii-set-up-applier-configuration), you need to set the `table-type` property to `ICEBERG` under [the `per-table-config` configuration]({{< ref "docs/references/applier-reference#per-table-config" >}}). For example, look at the following sample Applier configuration:

```YAML
snapshot:
  threads: 8

  batch-size-rows: 600_000
  txn-size-rows: 600_000
  per-table-config:
  - catalog: "CATALOG"
    schema: "SCHEMA"
    tables:
      TABLE_NAME:
        table-type: ICEBERG

  bulk-load:
    enable: true
    type: FILE
    save-file-on-error: true
```

{{< hint "warning" >}} **Attention:** In realtime replication, Replicant first creates the destination tables with a one-time data snapshot to transfer all existing data from the source. In this "snapshot phase", Replicant needs to know beforehand whether or not you're using Iceberg tables. For this reason, you _must always_ use the `snapshot` section of the Applier configuration file to specify your `per-table-config` parameters, including what the `table-type` is. For more information about how different Replicant modes work, see [Running Replicant]({{< ref "docs/running-replicant" >}}).
{{< /hint >}}