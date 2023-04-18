---
pageTitle: Configure stage for Snowflake target in Arcion 
title: Stage configuration
description: "Learn how to configure native or external stage in Snowflake target for bulk loading with Arcion."
bookHidden: false
weight: 2
---

# Stage configuration

By default, Replicant uses Snowflake’s native stage for bulk loading. But you can also use an external stage like Azure. The external stage holds the data files and then Replicant loads them on the target Snowflake server. The `stage` section of [the connection configuration file]({{< ref "setup-guide#i-set-up-connection-configuration" >}}) allows you to specify the details Replicant requires to connect to and use a specific stage.

The following parameters can configure stages. For example configuration for each stage, see [Examples](#examples).

### `type`*[v21.06.14.1]*
The stage type. Arcion supports the following stages:

- **`NATIVE`**. Snowflake's native stage. 
- **`S3`**. Amazon S3 as the stage.
- **`AZURE`**. Microsoft Azure as the stage.
  
### `root-dir`
A directory on stage to stage bulk-load files.

### `conn-url`*[v21.06.14.1]* 
The URL for the stage. For example, if you use Amazon S3 as stage, specify the bucket name. If you use Microsoft Azure as stage, specify the container name.

### `key-id`
If you use Amazon S3 as stage, this parameter holds [the access Key ID for your AWS account that hosts S3](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-about).

### `account-name`*[v21.06.14.1]*
If you use Microsoft Azure as the stage, this specifies the name of the ADLS storage account.

### `secret-key`*[v21.06.14.1]*
This parameter applies to both `S3` and `AZURE` types. It represents Amazon S3 secret key and Azure storage secret key.

### `token`*[v21.06.14.1]*
If you use Microsoft Azure as the stage, this parameter holds [the SAS token for Azure storage](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview#sas-token).

## Examples

### Microsoft Azure as stage

The following shows a sample stage configuration for Azure as stage:

```YAML
stage:
  type: AZURE
  root-dir: "replicate-stage/snowflake-stage"
  conn-url: "replicate-stage"
  account-name: "replicant-storageaccount"
  secret-key: "YOUR_SECRET_KEY"
  token: "YOUR_SAS_TOKEN"
```

Replace the following:
- *`YOUR_SECRET_KEY`*: your Azure storage secret key
- *`YOUR_SAS_TOKEN`*: your SAS token for Azure storage

### Amazon S3 as stage

The following shows a sample stage configuration for S3 as stage:

```YAML
stage:
  type: S3
  root-dir: "replicate-stage/snowflake-stage"  
  conn-url: "replicate-stage"
  key-id: "YOUR_ACCESS_KEY_ID"   
  secret-key: "YOUR_SECRET_KEY"
```

Replace the following:
- *`YOUR_SECRET_KEY`*: your S3 secret key
- *`YOUR_ACCESS_KEY_ID`*: the access key ID for your AWS account that hosts S3