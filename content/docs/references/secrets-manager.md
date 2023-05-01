---
pageTitle: Use AWS Secrets Manager
title: Use AWS Secrets Manager
description: "Learn how to use AWS Secrets Manager with Arcion Replicant. Replicant can retrieve credentials from Secrets Manager instead of reading from YAML files."
weight: 16
---

# Retrieve credentials from AWS Secrets Manager
{{< hint "info" >}}
This feature is available from version 22.10.28.2.
{{< /hint >}}
You may want to store credentials like usernames and associated passwords in AWS Secrets Manager. In that case, you can tell Replicant to retrieve credentials from Secrets Manager instead of reading them from plain YAML files. 

{{< hint "warning" >}}
**Important:** Make sure to set AWS credentials and the region either in the credentials file or as environment variables. For more information, see [Set up AWS Credentials and Region for Development](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html).
{{< /hint >}}

To fetch your credentials from AWS Secrets Manager, follow the steps below:


## Modify the connection configuration file
In your connection configuration file, represent the value of each credential stored in AWS Secrets Manager using a URL. Notice the following about the structure of the URL:
  - Each URL should begin with `arcion-sm://`. This tells Replicant that a Secrets Manager holds the value.
  - The rest of the URL depends on where the key is stored in AWS Secrets Manager, the *key* being the *name* of the credential. For example, the `username` credential could have the following URL representation in the connection configuration file:

    ```YAML
    username: arcion-sm://connectionConfig/username
    ```

    In the URL above, there are two parts:
    - **`connectionConfig`** represents the secret name where various secret keys are stored.
    - **`username`** is the secret key for which Replicant should retrieve the value from AWS Secrets Manager.

Below is a sample connection configuration file for MySQL where the `host`, `port`, `username`, and `password` credentials are stored in the AWS Secrets Manager:

```YAML
type: MYSQL

host: arcion-sm://connectionConfig/host
port: arcion-sm://connectionConfig/port
username: arcion-sm://connectionConfig/username
password: arcion-sm://connectionConfig/password

slaveServerIds: [1]
maxConnections: 20

maxRetries: 10
retryWaitDurationMs: 1000
```

## Run Replicant
Run Replicant with the argument `--use-sm-provider`. The argument can take the following two values: 
  - **`AWS`**: Replicant will try to read secrets from AWS Secrets Manager.
  - **`NONE`**: Replicant will expect the values of the configuration parameters to be in plain text in the YAML file itself, and will not look in Secrets Manager. 

    *Default value is `NONE`.*

  Below is a sample Replicant command specifying AWS Secrets Manager:

  ```sh
  ./bin/replicant test-connection conf/conn/mysql_dst.yaml --validate conf/validate/validationchecks.json --use-sm-provider AWS
  ```