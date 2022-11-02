---
pageTitle: Documentation for Databricks Target connector
title: Databricks Delta Lake
description: "Get fast, reliable, and real-time data ingestion into Databricks Lakehouse with Arcion, boasting features like Unity Catalog, Type-2 CDC, and more."
weight: 1
bookHidden: false
---
# Destination Databricks Delta Lake

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Obtain the JDBC Driver for Databricks

Replicant requires the Databricks JDBC Driver as a dependency. To obtain the appropriate driver, follow the steps below: 

{{< tabs "databricks-jdbc-driver-download" >}}
{{< tab "For Legacy Databricks" >}}
- Download the [JDBC 4.2-compatible Databricks JDBC Driver ZIP](https://databricks-bi-artifacts.s3.us-east-2.amazonaws.com/simbaspark-drivers/jdbc/2.6.22/SimbaSparkJDBC42-2.6.22.1040.zip).
- From the downloaded ZIP, locate and extract the `SparkJDBC42.jar` file.
- Put the `SparkJDBC42.jar` file inside `$REPLICANT_HOME/lib` directory.
{{< /tab >}}
{{< tab "For Databricks Unity Catalog" >}}
- Go to the [Databricks JDBC Driver download page](https://www.databricks.com/spark/jdbc-drivers-download) and download the driver.
- From the downloaded ZIP, locate and extract the `DatabricksJDBC42.jar` file.
- Put the `DatabricksJDBC42.jar` file inside `$REPLICANT_HOME/lib` directory.
{{< /tab >}}

{{< /tabs >}}


## II. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/databricks.yaml
    ```

2. The configuration file has two parts:

    - Parameters related to target Databricks server connection.
    - Parameters related to stage configuration.

    ### Parameters related to Target Databricks server connection
    For connecting to your target Databricks server, you can configure the following parameters:

      ```YAML
      type: DATABRICKS_DELTALAKE

      host: HOSTNAME
      port: PORT_NUMBER

      url: "jdbc:spark://<host>:<port>/<database-name>;transportMode=http;ssl=1;httpPath=<http-path>;AuthMech=3" #You can copy this URL from Databricks cluster info page

      username: "USERNAME"                         
      password: "PASSWORD"                            
      max-connections: 30 #Maximum number of connections Replicant can open in Databricks
      max-retries: 100 #Number of times any operation on the source system will be re-attempted on failures.
      retry-wait-duration-ms: 1000 #Duration in milliseconds replicant should wait before performing then next retry of a failed operation
      ```

      Replace the following:
      - *`HOSTNAME`*: the hostname of your Databricks host
      - *`PORT_NUMBER`*: the port number of the Databricks cluster
      - *`USERNAME`*: the username that connects to your Databricks server
      - *`PASSWORD`*: the password associated with *`USERNAME`*
    
      {{< hint "info" >}}For [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog), set the connection `type` to `DATABRICKS_LAKEHOUSE`. For more information, see [Databricks Unity Catalog Support](#databricks-unity-catalog-support-beta).{{< /hint >}}

    ### Parameters related to stage configuration
    It is mandatory to use `DATABRICKS_DBFS` or an external stage like S3 to hold the data files and load them on the target database from there. This section allows specifying details required for Replicant to connect and use a given stage.

      - `type`*[v21.06.14.1]*: The stage type. Allowed stages are `S3`, `AZURE`, `GCP`, and `DATABRICKS_DBFS`.
      {{< hint "info" >}}For [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog), set `type` to `DATABRICKS_LAKEHOUSE`. For more information, see [Databricks Unity Catalog Support](#databricks-unity-catalog-support-beta).{{< /hint >}}
      - `root-dir`: Specify a directory on stage which can be used to stage bulk-load files.
      - `conn-url`*[v21.06.14.1]*: Specify the connection URL for stage. For example, for S3 as stage, specify bucket-name; for AZURE as stage, specify the container name.
      - `use-credentials`: Applicable only for `DATABRICKS_DBFS` as type. Indicates whether to use the provided connection credentials. When `true`, you must set  `host`, `port`, `username`, and `password` as described in the section [Parameters Related to Target Databricks server connection](#parameters-related-to-target-databricks-server-connection).

        *Default: By default, this parameter is set to `false`.*
        
      - `key-id`: This config is valid for `S3` as stage `type` only. Represents Access Key ID for AWS account hosting S3.
      - `account-name`*[v21.06.14.1]*: This config is valid for AZURE type only. Represents name of the ADLS storage account.
      - `secret-key`*[v21.06.14.1]*: This config is valid for S3 and AZURE type only. For example, Secret Access Key for AWS account hosting S3 or ADLS account.
      - `credential-file-path`: For `GCP` as stage `type` only. Represents the absolute path to the service account key file. For more information, see [GCP as stage](#gcp-as-stage).

    #### Databricks DBFS as stage
    Below is a sample for using Databricks DBFS as stage:
    
    ```YAML
    stage:
      type: DATABRICKS_DBFS
      root-dir: "replicate-stage/databricks-stage"
      use-credentials: false
    ```

    #### S3 as stage
    Below is a sample for using S3 as stage:
    
    ```YAML
    stage:
      type: S3
      root-dir: "replicate-stage/s3-stage"
      key-id: "<S3 access key>"
      conn-url: "replicate-stage"
      secret-key: "<S3 secret key>"
    ```

    #### GCP as stage
    When hosting Target Databricks on Google Cloud Platform (GCP), it's possible to use GCP Storage as the staging area. To use GCP Storage as the staging area, follow the steps below:

    - [Create a service account from the Google Cloud console](https://cloud.google.com/iam/docs/creating-managing-service-accounts?hl=en#creating).
    - Grant your service account the following roles to GCP Storage:
      - **Storage Object Admin** 
      - **Storage Object Creator**
      - **Storage Object Viewer**
    - [Create a key for your service account](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating). Creating a key successfully downloads a service account key file in JSON format. You'll need to provide the absolute path to the key file in the [`stage` section of your Target Databricks connection configuration](#parameters-related-to-stage-configuration). So make sure to store the key file securely. See the sample `stage` configuration below for better understanding how to provide path to the key file.
    - As a last step, you need to provide your Google service account email address to Databricks. For instructions to do so, see [Configure Databricks SQL to use Google service account for data access](https://docs.gcp.databricks.com/sql/user/security/cloud-storage-access.html#step-3-configure-databricks-sql-to-use-the-service-account-for-data-access).

    Below is sample for using GCP as stage:

    ```YAML
    stage:
      type: GCP
      root-dir: '<stage_directory>'
      conn-url: '<gcp_bucket_name>'
      credential-file-path: '<absolute_file_path_to_service_account_key_file>'
    ```


## III. Set up Applier Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
    ```BASH
    vi conf/dst/databricks.yaml
    ```
2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    For snapshot mode, make the necessary changes as follows:

      ```YAML
      snapshot:
        threads: 16 #Maximum number of threads Replicant should use for writing to the target

        #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
        bulk-load:
          enable: true
          type: FILE
          serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion
      ```
    There are some additional parameters available that you can use in snapshot mode:

    ```YAML
    snapshot:
      enable-optimize-write: true
      enable-auto-compact:  true
      enable-unmanaged-delta-table: false
      unmanaged-delta-table-location:
      init-sk: false
      per-table-config:
        init-sk: false
        shard-key:
        enable-optimize-write: true
        enable-auto-compact: true
        enable-unmanaged-delta-table: false
        unmanaged-delta-table-location:
    ```
    These parameters are specific to Databricks as destination. More details about these parameters are as follows:
    - `enable-optimize-write`: Databricks dynamically optimizes Apache Spark partition sizes based on the actual data, and attempts to write out 128 MB files for each table partition. This is an approximate size and can vary depending on dataset characteristics. 

      *Default: By default, this parameter is set to `true`*.
    - `enable-auto-compact`: After an individual write, Databricks checks if files can be compacted further. If so, it runs an `OPTIMIZE` job to further compact files for partitions that have the most number of small files. The job is run with 128 MB file sizes instead of the 1 GB file size used in the standard `OPTIMIZE`.

      *Default: By default, this parameter is set to `true`*.
    - `enable-unmanaged-delta-table`: An unmanaged table is a Spark SQL table for which Spark manages only the metadata. The data is stored in the path provided by the user. So when you perform `DROP TABLE <example-table>`, Spark removes only the metadata and not the data itself. The data is still present in the path you provided.

      *Default: By default, this parameter is set to `false`*.
    - `unmanaged-delta-table-location`: The path where data for the unmanaged table is to be stored. It can be a Databricks DBFS path (for example `FileStore/tables`), or an S3 path (for example, `s3://replicate-stage/unmanaged-table-data`) where the S3 bucket is accessible to Databricks.
    - `init-sk`: Partition-key on the source table is represented as a shard-key by replicant. By default the target table does not include this sharding information. If `init-sk` is true we add the shard-key/partition key to target table create SQL. Shard-key replication is disabled by default because DML replication with partitioned tables in Databricks is very slow if the partition key has a high distinct count.

      *Default: By default, this parameter is set to `false`*.
    - `per-table-config`: This configuration allows you to specify various properties for target tables on a per table basis.
      - `init-sk`: Partition-key on the source table is represented as a shard-key by replicant. By default, the target table does not include this sharding information. If `init-sk` is true we add the shard-key/partition key to target table create SQL. Shard-key replication is disabled by default because DML replication with partitioned tables in\ databricks is very slow if the partition key has a high distinct count.

        *Default: By default, this parameter is set to `false`*.
      - `shard-key`: Shard key to be used for partitioning the target table.
      - `enable-optimize-write`: Databricks dynamically optimizes Apache Spark partition sizes based on the actual data, and attempts to write out 128 MB files for each table partition. This is an approximate size and can vary depending on dataset characteristics.

        *Default: By default, this parameter is set to `true`*.
      - `enable-auto-compact`: After an individual write, Databricks checks if files can be compacted further. If so, it runs an `OPTIMIZE` job to further compact files for partitions that have the most number of small files. The job is run with 128 MB file sizes instead of the 1 GB file size used in the standard `OPTIMIZE`.

        *Default: By default, this parameter is set to `true`*.
      - `enable-unmanaged-delta-table`: An unmanaged table is a Spark SQL table for which Spark manages only the metadata. The data is stored in the path provided by the user. So when you perform `DROP TABLE <example-table>`, Spark removes only the metadata and not the data itself. The data is still present in the path you provided.

        *Default: By default, this parameter is set to `false`*.

      - `unmanaged-delta-table-location`: The path where data for the unmanaged table is to be stored. It can be a Databricks DBFS path (for example `FileStore/tables`), or an S3 path (for example, `s3://replicate-stage/unmanaged-table-data`) where the S3 bucket is accessible to Databricks.

    ### Parameters related to realtime mode
    If you want to operate in realtime mode, you can use the `realtime` section to specify your configuration. For example:

    ```YAML
    realtime:
      threads: 4 #Maximum number of threads Replicant should use for writing to the target
    ```

    ### Enabling Type-2 CDC
    From version 22.07.19.3 onwards, Arcion supports Type-2 CDC for Databricks as the Target. Type-2 CDC enables a Target to have a history of all transactions performed in the Source. For example:

    - An INSERT in the Source is an INSERT in the Target.
    - An UPDATE in the Source is an INSERT in the Target with additional metadata like Operation Performed, Time of Operation, etc.
    - A DELETE in the Source is an INSERT in the Target: INSERT with OPER_TYPE as DELETE.

    Currently, Arcion supports the following metadata related to source-specific fields:

    - `query_timestamp`: Time at which the user on Source fired a query.
    - `extraction_timestamp`: Time at which Replicant detected the DML from logs.
    - `OPER_TYPE`: Type of the operation (INSERT/UPDATE/DELETE).

    The primary requirement for Type-2 CDC is to *enable full row logging* in the Source.

   {{< hint "info" >}}
  Currently, support for Type-2 CDC is limited to the following cases: 
  - Sources that support CDC.
  - `realtime` and `full` modes.
   {{< /hint >}}

    To enable Type-2 CDC for your Databricks target, follow the steps below:
    
    1. Add the following two parameters under the `realtime` section of the Databricks Applier configuration file:

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
  For a detailed explanation of configuration parameters in the Applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").

## Databricks Unity Catalog Support (Beta)

{{< hint "info" >}}**Note:** This feature is currently in beta. {{< /hint >}}

From version 22.08.31.3 onwards, Arcion has added support for [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog). The support is still in beta phase, with complete support to land gradually in future releases.

As of now, note the following about the state of Arcion's Unity Catalog support:

- Legacy Databricks only supports two-level namespace:

    - Schemas
    - Tables

  With introduction of Unity Catalog, Databricks now exposes a [three-level namespace](https://docs.databricks.com/data-governance/unity-catalog/queries.html#three-level-namespace-notation) that organizes data. 
    - Catalogs 
    - Schemas 
    - Tables

  Arcion adds support for Unity Catalog by introducing a new child storage type (`DATABRICKS_LAKEHOUSE` child of `DATABRICKS_DELTALAKE`).
- If you're using Unity Catalog, notice the following when configuring your Target Databricks with Arcion:
  - Set the connection `type` to `DATABRICKS_LAKEHOUSE` in the [connection configuration file](#ii-set-up-connection-configuration).
  - To avoid manual steps to configure staging, Databricks has introduced personal staging. To read the staging URL, we've added a new configuration parameter `UNITY_CATALOG_PERSONAL_STAGE`. The complete `stage` configuration is as follows:
    ```YAML
    stage:
      type: UNITY_CATALOG_PERSONAL_STAGE
      staging-url: STAGING_URL
      file-format: DATA_FILE_FORMAT
    ```
    Replace the following:
      - *`STAGING_URL`*: the temporary staging URL—for example, `stage://tmp/userName/rootDir`.
      - *`DATA_FILE_FORMAT`*: the type of data file format. Supported formats are `PARQUET` and `CSV`.
        
        *Default: `PARQUET`*.
- We'll be using `SparkJDBC42` driver for Legacy Databricks (`DATABRICKS_DELTALAKE`) and `DatabricksJDBC42` for Unity catalog (`DATABRICKS_LAKEHOUSE`). For instructions on how to obtain these drivers, see [Obtain the JDBC Driver for Databricks](#i-obtain-the-jdbc-driver-for-databricks).
- Replicant currently supports Unity Catalog on AWS and AZURE.
