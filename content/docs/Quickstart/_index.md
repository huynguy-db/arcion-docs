---
pageTitle: Get started with Arcion Self-hosted 
title: Arcion Self-hosted
description: "Quickly get started with Arcion Self-hosted. Learn about hardware requirements, download Arcion Replicant, and set up Sources and Targets."
weight: 1
---

# Arcion Self-hosted Quickstart

## I. Host Machine Prerequisites

Please ensure your host machine that will run Replicant meets the following minimum hardware and software prerequisites.

### Minimum Hardware Requirements
* 16 CPU cores and 32GB of memory
* 100GB-200GB of SSD/NVMe storage space

### Minimum System Requirements
* Linux (CentOS/Ubuntu/Redhat)
* JDK 8 either from a JRE or JDK installation

{{< hint "info" >}}
**Note:** The storage requirements may increase depending on your source-target pair and method of replication.
{{< /hint >}}

### Internet access
Arcion self-hosted doesn't require internet access except in the following two scenarios:

- When you provide an online license for your Arcion server (the default), Arcion must connect to the internet to validate the license.
- The Arcion on-premises Docker container connects to the internet to access the documentation on this website. This documentation seamlessly appears when you set up connections using the on-premises Docker container.
- Arcion requires internet access to remotely update the SQL Server CDC Agent in [SQL Server replication]({{< ref "docs/source-setup/sqlserver" >}}).

## II. Download Replicant and Create a Home Repository

1. Download the latest version of Replicant from [Arcion Self-hosted](https://www.arcion.io/self-hosted).

2. Unzip the downloaded archive:

   ```BASH
   unzip replicant-cli-<version>.zip
   ```
This will create a directory named ```replicant-cli``` that will serve as ```REPLICANT_HOME```. For the proceeding steps, position yourself in ```REPLICANT_HOME```.


## III. Licensing
1. Download the license file for Replicant and rename it to `replicant.lic`
  {{<hint "warning" >}} The license file must be named replicant.lic{{< /hint >}}
2. Copy r`eplicant.lic` into ```REPLICANT_HOME```
  {{<hint "warning" >}}You must copy the `replicant.lic` file into Replicant's home directory, not in the `licenses` folder of Replicant.{{< /hint >}}


## IV. Setup Source Database Configuration

1. From ```REPLICANT_HOME``` navigate to the sample connection configuration file of the source database:

    ```BASH
    vi conf/conn/<database-name>.yaml
    ```

    Make the necessary changes as shown below:

    ```YAML
    type: <database-name>

    host: <host> #Enter the hostname or IP address to connect to the source
                 #database
    port: <port> #Enter the port on which the source database server is running

    username: <database-username> #Enter the source database username
    password: <user-password>  #Enter the source database password

    max-connections: 30

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

    Please note that certain databases might have additional configuration parameters. For example, [Oracle has the additional parameter ```service-name```](/docs/source-setup/oracle/#vi-set-up-connection-configuration).

    For further database specific examples, please refer to one of our Source database setup pages.

2. From ```REPLICANT_HOME```, navigate to the sample filter file of the source database:

   ```BASH
   vi filter/<source-database-name>_filter.yaml
   ```

   Make the necessary changes as shown below:

   ```YAML
   allow:
   - catalog: "catalog_name" #Enter your database name if applicable
     schema : "schema_name" #Enter your schema name if applicable
     types: [TABLE,VIEW] #Database object types to replicate
     allow:
       "Table_Name1": #Enter the name of your table
       "Table_Name2": #Enter the name of your table

   ```

## V. Target Database Setup

1. From ```REPLICANT_HOME``` navigate to the sample connection configuration file of the target database:

    ```BASH
    vi conf/conn/<database-name>.yaml
    ```

    Make the necessary changes as shown below:

    ```YAML
    type: <database-name>

    host: <host> #Enter the hostname or IP address to connect to the target
                 #database
    port: <port> #Enter the port on which the target database server is running

    username: <database-username> #Enter the target database username
    password: <user-password>  #Enter the target database password

    max-connections: 30

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

    For database specific examples, please refer to one of our Target database setup pages.


## VI. Run Replicant Snapshot

Replicant is now ready to run in snapshot mode. The snapshot will only transfer existing data from the source database to the target database. If you would like to transfer real-time changes in addition to the snapshot, skip step VI and proceed to steps VII and VIII to run Replicant in full mode.

1. Execute the following command from ```REPLICANT_HOME``` to run Replicant in snapshot mode:

   ``` BASH
   ./bin/replicant snapshot conf/conn/<source-database-name>.yaml \
   conf/conn/<destination-database-name>.yaml \
   --extractor conf/src/<source-database-name>.yaml \
   --applier conf/dst/<destination-database-name>.yaml \
   --filter filter/<source-database-name>_filter.yaml
   ```

The proceeding steps are only required if you intend to run Replicant in real-time mode.

## VII. Heartbeat table setup

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL:

   ```SQL
   CREATE TABLE <catalog>.<schema>.replicate_io_cdc_heartbeat( \
   timestamp <data_type_equivalent_to_long>)
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for Replicant.

3. From ```REPLICANT_HOME```, navigate to the heartbeat table's configuration.
   ```BASH
   vi conf/src/<source-database-name>.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows

   ```YAML
   heartbeat:
     enable: true
     catalog: <catalog_name> #if the source database supports catalog, change the catalogue name accordingly
     schema: <schema_name> #if the source database supports schema, change the schema name accordingly
     interval-ms: 10000
    ```

## VIII. Run Replicant in full mode

1. From ```REPLICANT_HOME```, enter the following to run Replicant in full mode:

   ```BASH
   ./bin/replicant full conf/conn/<source-database-name>.yaml \
   conf/conn/<destination-database-name>.yaml \
   --extractor conf/src/<source-database-name>.yaml \
   --applier conf/dst/<destination-database-name>.yaml \
   --filter filter/<source-database-name>_filter.yaml \
   ```

## Upgrade Arcion Replicant

We recommend that you always use the latest version of Replicant. That way, you can enjoy the latest features and various quality improvmements. 

You can grab the latest version of Replicant from our [Arcion Self-hosted page](https://www.arcion.io/self-hosted).

To get the most out of your upgrades, follow the tips below:

- Keep the configuration files isolated from the `replicant-cli` directory tree. During version upgrades, they might get overwritten.
- After upgrade, copy your `replicant.lic` license file [to the new `REPLICANT_HOME`](#ii-download-replicant-and-create-a-home-repository).
- Copy the contents of your older `$REPLICANT_HOME/lib` directory to the new version `lib` directory `$REPLICANT_HOME/lib`.

## Database Specific Setup Overview

Different source and target databases may have slightly more specific and different setup instructions than the general guidelines provided in this Quickstart Guide. Follow the six steps below for a pipeline specific setup for Replicant:

1. Source Database Setup
2. Target Database Setup  
3. Running Replicant
4. Performance Enhancing and Troubleshoot
