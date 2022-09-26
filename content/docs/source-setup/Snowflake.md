---
title: Snowflake
weight: 10
bookHidden: false
---

# Source Snowflake

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Create Streams
To create streams for tracking individual table changes for CDC, follow the instructions in [Streams](/docs/references/source-prerequisites/snowflake/#streams).

## II. Create Stage Table

To create stage table as an intermediate buffer of the CDC process, follow the instructions in [Stage Tables](/docs/references/source-prerequisites/snowflake/#stage-tables).


## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/snowflake.yaml
   ```

2. The configuration file has two parts:

    - Parameters related to source Snowflake server connection.
    - Parameters related to stage configuration.

    ### Parameters related to target Snowflake server connection
    For connecting to your source Snowflake server, you can configure the following parameters:

    ```YAML
    type: SNOWFLAKE

    host: SNOWFLAKE_HOSTNAME
    port: PORT_NUMBER 
    warehouse: "WAREHOUSE_NAME" #Snowflake warehouse

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
      
    {{< hint "warning" >}} **Note:** Make sure the specified user has `CREATE TABLE` and `CREATE STREAM` privileges on the catalogs/schemas from which tables need to be replicated. {{< /hint >}}

    ### Additional parameters
    - `credential-store`: Replicant supports consuming `username` and `password` configurations from a _credentials store_ rather than having users specify them in plain text config file. You can use keystores to store your credentials related to your Snowflake server connections.The following parameters are available:

        - `type`: Type of the keystore. Allowed types are `PKCS12`, `JKS`, and `JCEKS`. 
        - `path` : Location of the key-store.
        - `key-prefix`:  You should create entries in the credential store for your configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `snowflake1_username` and `snowflake1_password`. You can then specify the prefix here as `snowflake1_`.
        - `password`: This field is optional. If you don't specify the keystore password here, then you must use the UUID from your license file as the keystore password. Remember to keep your license file somewhere safe in order to keep the password secure.

    ### Parameters related to stage configuration
    - `stage`: By default, Replicant uses Snowflake’s native stage for bulk loading. But it's also possible to use an external stage like Azure. This section allows you to specify the details Replicant needs to connect to and use a specific stage.

    - `type`*[v21.06.14.1]*: The stage type. Allowed stages are `NATIVE`, `S3`, and `AZURE`.
    - `root-dir`: Specify a directory on stage which can be used to stage bulk-load files.
    -`conn-url`*[v21.06.14.1]*: URL for the stage. For example, if stage is `S3`, specify bucket name; for `AZURE`, specify container name.
    - `key-id` : This config is valid for `S3` stage type only. Access Key ID for AWS account hosting s3.
    - `account-name`*[v21.06.14.1]* : This config is valid for `AZURE` type only. Name of the ADLS storage account.
    -`secret-key`*[v21.06.14.1]*: This config is valid for both `S3` and `AZURE` types. For example, Secret Access Key for AWS account hosting s3 or ADLS account.
    - `token`*[v21.06.14.1]*:  This config is valid for `AZURE` type only. Indicates the SAS token for Azure storage.

    ### Use RSA key pair for authentication
    You can also choose to use [Snowflake's key pair authentication support](https://docs.snowflake.com/en/user-guide/key-pair-auth.html) for enhanced authentication security instead of using basic authentication via username and password. In that case, you just need to provide username and RSA private key along with a passphrase to connect to Snowflake server. 
    
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

## IV. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Applier configuration file:
   ```BASH
   vi conf/src/snowflake.yaml
   ```
2. Make the necessary changes as follows:

  ```YAML
  snapshot:
    threads: 32
      #  fetch-size-rows: 5_000

      #  min-job-size-rows: 1_000_000
      #  max-jobs-per-chunk: 32

      #native-extract-options:
      #control-chars:
      #delimiter: ','
      #quote: '"'
      #escape: "\u0000"
      #null-string: "NULL"
    #line-end: "\n"

    _traceDBTasks : true

    per-table-config:
      - catalog: DEMO_DB
        schema: tpch
        tables:
          orders:
  #        num-jobs: 2
  #        split-hints:
  #          row-count-estimate: 15000

  realtime:
    threads: 8
    fetch-size-rows: 10000
    _traceDBTasks: true
    #fetch-interval-s: 0
    #create-stream: true
    #create-stage-table: true
  ```

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
