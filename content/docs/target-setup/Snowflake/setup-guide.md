---
pageTitle: Documentation for Snowflake Target connector
title: Setup guide
description: "Set up Snowflake target for snapshot and realtime replication. We discuss RSA authentication, clustering tables support, and more."
bookHidden: false
weight: 1
---

# Destination Snowflake setup guide

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up connection configuration

1. From `$REPLICANT_HOME`, navigate to the sample Snowflake connection configuration file:
    ```BASH
    vi conf/conn/snowlflake.yaml
    ```
2. The configuration file has two parts:

    - Parameters related to target Snowflake server connection.
    - Parameters related to stage configuration.

    ### Parameters related to target Snowflake server connection
    {{< hint "info" >}}
  **Note:** All communications with Snowflake happens through port 443, the standard port for HTTPS. So all data is encrypted and secure with SSL by default.
    {{< /hint >}}
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
    Stage configuration allows you to tune native or external staging area for bulk loading. For more information, see [Stage configuration]({{< relref "stage-configuration" >}}).

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

    #### Store the private and public keys securely

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

## II. Set up Applier configuration

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
    #### Enable clustering
    To improve performance, primary keys and unique keys need to be clustering keys on Snowflake side.
    We can achieve that by making primary and unique keys as clustering keys when Replicant creates the tables.

    To enable clustered table creation, set the `force-use-clustered-key` parameter to `true` in your Applier configuration file. By default, it's set to `false` and Snowflake tables don't have clustering keys designated to them.

    {{< hint "warning" >}}
  **Important:** You must run Replicant with the `--replace` option for clustering to work.
    {{< /hint >}}

    For more information on Snowflake clustering, see [Clustering Keys & Clustered Tables](https://docs.snowflake.com/en/user-guide/tables-clustering-keys.html).
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
      After executing the preceding command, you can select table with lower case names by surrounding the names with double quotation marks.

    

