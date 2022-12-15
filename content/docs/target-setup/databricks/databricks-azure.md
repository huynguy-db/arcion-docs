---
pageTitle: Documentation for Databricks Target on Azure
title: Databricks on Azure
description: "Learn how to set up Databricks on Azure and connect Arcion to build a robust data analytics pipeline."
weight: 2
bookHidden: false
---

# Destination Azure Databricks

On this page, you'll find step-by-step instructions on how to set up your Azure Databricks instance as data target with Arcion. The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the following steps.

## Prerequisites

- A Databricks account on Azure
- Azure container in ADLS Gen2 (Azure Data Lake Storage Gen2)

## Setup guide
After making sure of the prerequisities in the preceeding section, follow these steps to set up  your Azure Databricks with Arcion:

### I. Create a Databricks cluster
To create a Databricks cluster, follow these steps:

1. Log in to your Databricks account.

2. In the Databricks console, click **Compute**.

3. Click **Create Cluster**.

4. Enter a cluster name of your choice.

5. Select the latest **Databricks runtime version**.

6. Click **Create Cluster**.

### II. Get connection details for Databricks cluster
To establish connection between your Databricks instance and Arcion, you need to provide the connection details for your cluster. The connection details are available from Databricks JDBC and ODBC drivers configuration page. To get the connection details, follow these steps:

1. Navigate to **Advanced Options** and click the **JDBC/ODBC** tab.

2. Make a note of the following values. These are necessary to configure Arcion Replicant for replication.

  - **Server Hostname**
  - **Port**
  - **JDBC URL**

### III. Create a personal access token for the Databricks cluster
To create a personal access token, see [Generate a personal access token](https://docs.databricks.com/dev-tools/api/latest/authentication.html#token-management) in Databricks documentation. Make a note of the token as it's required to configure Arcion Replicant for replication.

### IV. Configure ADLS container as stage
1. Follow these steps in [Access Azure Data Lake Storage Gen2 and Blob Storage
](https://docs.databricks.com/external-data/azure-storage.html).

2. Open your Databricks console and go to [the cluster configuration page](https://docs.databricks.com/clusters/configure.html).

3. Click **Compute**.

3. Expand the **Advanced Options** section.

4. In the **Spark Config** box, paste the following settings:
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

 5. Copy the  *`SECRET_KEY`* from Azure portal. These keys are required for establishing a connection from Arcion Replicant to ADLS. Replicant only uses these credentials to upload files to or delete from ADLS container.

### V. Configure Replicant connection for Databricks
In this step, you need to provide the Databricks connection details to Arcion. To do so, follow these steps:

1. You can find a sample connection configuration file `databricks.yaml` in the `$REPLICANT_HOME/conf/conn/` directory. 

2. The connection configuration file has the following two parts:
     - Parameters related to target Databricks server connection.
     - Parameters related to stage configuration.

    #### Parameters related to target Databricks server connection
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
