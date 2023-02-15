---
pageTitle: Documentation for Databricks Target on Azure
title: Databricks on Azure
description: "Set up Arcion with Databricks on Azure. Leverage Azure Data Lake Storage as stage, Type-2 CDC, and Databricks Unity Catalog."

bookHidden: false
---

# Destination Azure Databricks

On this page, you'll find step-by-step instructions on how to set up your Azure Databricks instance as data target with Arcion. The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the following steps.

## Prerequisites

- A Databricks account on Azure
- Azure container in ADLS Gen2 (Azure Data Lake Storage Gen2)

<!-- ## Setup guide -->
After making sure of the prerequisities in the preceeding section, follow these steps to set up  your Azure Databricks with Arcion.

## I. Create a Databricks cluster
To create a Databricks cluster, follow these steps:

1. Log in to your Databricks account.

2. In the Databricks console, click **Compute**.

3. Click **Create Cluster**.

4. Enter a cluster name of your choice.

5. Select the latest **Databricks runtime version**.

6. Click **Create Cluster**.

## II. Get connection details for Databricks cluster
To establish connection between your Databricks instance and Arcion, you need to provide the connection details for your cluster. The connection details are available from Databricks JDBC and ODBC drivers configuration page. To get the connection details, follow these steps:

1. Navigate to **Advanced Options** and click the **JDBC/ODBC** tab.

2. Make a note of the following values. These are necessary to configure Arcion Replicant for replication.

   - **Server Hostname**
   - **Port**
   - **JDBC URL**

## III. Create a personal access token for the Databricks cluster
To create a personal access token, see [Generate a personal access token](https://docs.databricks.com/dev-tools/api/latest/authentication.html#token-management) in Databricks documentation. Make a note of the token as it's required to configure Arcion Replicant for replication.

## IV. Configure ADLS container as stage
1. Frist you need to set up access to ADLS. You can set up access in the following two ways:
   - [Access Azure Data Lake Storage Gen2 or Blob Storage using OAuth 2.0 with an Azure service principal](https://docs.databricks.com/external-data/azure-storage.html#access-azure-data-lake-storage-gen2-or-blob-storage-using-oauth-20-with-an-azure-service-principal).
   - [Access Azure Data Lake Storage Gen2 or Blob Storage using a SAS token](https://docs.databricks.com/external-data/azure-storage.html#access-azure-data-lake-storage-gen2-or-blob-storage-using-a-sas-token).

2. Open your Databricks console and go to [the cluster configuration page](https://docs.databricks.com/clusters/configure.html).

3. Click **Compute**.

4. Expand the **Advanced Options** section.

5. In the **Spark Config** box, paste the following settings:
    ```spark
    spark.hadoop.fs.azure.account.auth.type.STORAGE_ACCOUNT_NAME.dfs.core.windows.net OAuth
    spark.hadoop.fs.azure.account.oauth.provider.type.STORAGE_ACCOUNT_NAME.dfs.core.windows.net org.apache.hadoop.fs.azurebfs.oauth2.ClientCredsTokenProvider
    spark.hadoop.fs.azure.account.oauth2.client.id.STORAGE_ACCOUNT_NAME.dfs.core.windows.net APPLICATION-ID
    spark.hadoop.fs.azure.account.oauth2.client.secret.STORAGE_ACCOUNT_NAME.dfs.core.windows.net {{secrets/SECRET_SCOPE/KEY_STORED_IN_SECRET_SCOPE}}
    spark.hadoop.fs.azure.account.oauth2.client.endpoint.STORAGE_ACCOUNT_NAME.dfs.core.windows.net https://login.microsoftonline.com/DIRECTORY_ID/oauth2/token
    ```

    Replace the following:
    - *`STORAGE_ACCOUNT_NAME`*: the name of your ADLS Gen2 storage account
    - *`APPLICATION_ID`*: the Application (client) ID for the Azure Active Directory (Azure AD) application
    - *`SECRET_SCOPE`*: the name of your client secret scope
    - *`KEY_STORED_IN_SECRET_SCOPE`*: the name of the key containing the client secret
    - *`DIRECTORY_ID`*: the Directory (tenant) ID for the Azure Active Directory (Azure AD) application

 6. Copy the *`SECRET_KEY`* from Azure portal. These keys are required for establishing a connection from Arcion Replicant to ADLS. Replicant only uses these credentials to upload files to or delete from ADLS container.


## V. Obtain the JDBC Driver for Databricks

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

## VI. Configure Replicant connection for Databricks
In this step, you need to provide the Databricks connection details to Arcion. To do so, follow these steps:

1. You can find a sample connection configuration file `databricks.yaml` in the `$REPLICANT_HOME/conf/conn/` directory. 

2. The connection configuration file has the following two parts:
     - Parameters related to target Databricks server connection.
     - Parameters related to stage configuration.

    ### Parameters related to target Databricks server connection
    If you store your Databricks server connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager]({{< ref "docs/references/secrets-manager" >}}). Otherwise, you can put your credentials in plain form like the sample below:

    ```YAML
    type: DATABRICKS_DELTALAKE

    url: "JDBC_URL"
    username: USERNAME
    password: "PASSWORD"
    host: "HOSTNAME"
    port: "PORT_NUMBER"
    max-connections: 30
    max-metadata-connections: 10
    ```
    Replace the following:
    - *`JDBC_URL`*: the JDBC URL that you retrieved [in the second step of this section](#ii-get-connection-details-for-databricks-cluster)
    - *`HOSTNAME`*: the hostname of your Databricks host that you retrieved [in the second step of this section](#ii-get-connection-details-for-databricks-cluster)
    - *`PORT_NUMBER`*: the port number of the Databricks cluster that you retrieved [in the second step of this section](#ii-get-connection-details-for-databricks-cluster)
    - *`USERNAME`*: the username that connects to your Databricks server
    - *`PASSWORD`*: the password associated with *`USERNAME`*

    Feel free to change the values of `max-connections` and `max-metadata-connections` as you need.

    {{< hint "info" >}}For [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog), set the connection `type` to `DATABRICKS_LAKEHOUSE`. For more information, see [Databricks Unity Catalog Support](#databricks-unity-catalog-support-beta).{{< /hint >}}

    ### Parameters related to stage configuration
    It is mandatory to use an external stage to hold the data files and load them on the target database from there. The `stage` section allows specifying the details Replicant needs to connect to and use a given stage.

      - `type`*[v21.06.14.1]*: The stage type. For Azure Databricks, the `type` is `AZURE`.
      {{< hint "info" >}}For [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog), set `type` to `DATABRICKS_LAKEHOUSE`. For more information, see [Databricks Unity Catalog Support](#databricks-unity-catalog-support-beta).{{< /hint >}}
      - `root-dir`: The directory created under ADLS container. This directory is used to stage bulk-load files.
      - `conn-url`*[v21.06.14.1]*: The name of the ADLS container.        
      - `account-name`*[v21.06.14.1]*: The name of the ADLS storage account.
      - `secret-key`*[v21.06.14.1]*: The `SECRET_KEY` for the user with write/delete access on ADLS container. This is the last step when [you configure ADLS container as stage](#iv-configure-adls-container-as-stage).

      The following is a sample stage configuration for Azure Databricks:

      ```YAML
      stage:
        type: AZURE
        root-dir: "replicate-stage/databricks-stage"
        conn-url: "replicant-container"
        account-name: "replicant-storageaccount"
        secret-key: "YOUR_SECRET_KEY"
      ```
## VII. Set up Applier Configuration

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
      threads: 4
    ```

    {{< details title="Replay strategies for realtime replication" open=false >}}
  Replay strategies are how Arcion implements CDC changes and applies them in realtime to the target. For more information about replay strategies in Databricks target, see [Replay strategies for BigQuery and Databricks targets]({{< relref "replay-strategies" >}}).
    {{< /details >}}

    ### Enabling Type-2 CDC
    From version 22.07.19.3 onwards, Arcion supports Type-2 CDC for Databricks as the Target. Type-2 CDC enables a Target to have a history of all transactions performed in the Source. For example:

    - An INSERT in the Source is an INSERT in the Target.
    - An UPDATE in the Source is an INSERT in the Target with additional metadata like Operation Performed, Time of Operation, etc.
    - A DELETE in the Source is an INSERT in the Target: INSERT with OPER_TYPE as DELETE.

    Arcion supports the following metadata related to source-specific fields:

    - `query_timestamp`: Time at which the user on Source fired a query.
    - `extraction_timestamp`: Time at which Replicant detected the DML from logs.
    - `OPER_TYPE`: Type of the operation (INSERT/UPDATE/DELETE).

    The primary requirement for Type-2 CDC is to *enable full row logging* in the Source.

   {{< hint "info" >}}
  Support for Type-2 CDC is limited to the following cases: 
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

{{< hint "info" >}}**Note:** This feature is in beta. {{< /hint >}}

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
- We use `SparkJDBC42` driver for Legacy Databricks (`DATABRICKS_DELTALAKE`) and `DatabricksJDBC42` for Unity catalog (`DATABRICKS_LAKEHOUSE`). For instructions on how to obtain these drivers, see [Obtain the JDBC Driver for Databricks](#i-obtain-the-jdbc-driver-for-databricks).
- Replicant supports Unity Catalog on AWS and Azure platforms.
