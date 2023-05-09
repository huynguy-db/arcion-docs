---
pageTitle: Get started with Arcion Self-hosted 
title: Arcion Self-hosted
description: "Quickly get started with Arcion Self-hosted. Learn about hardware requirements, download Arcion Replicant, and set up Sources and Targets."
weight: 2
---

# Arcion Self-hosted Quickstart

## Host Machine/Server Requirements

In order to run Replicant, we recommend that the machine that it will be running on meet a set of minimum requirements. Failing to meet these requirements could impact performance or may stop Replicant from being able to run at all.

Please ensure your host machine/server where Replicant will be running meets the minimum hardware and software requirements listed below.

### Minimum Hardware Requirements
* 16 CPU cores and 32GB of memory
* 100GB-200GB of SSD/NVMe storage space

### Minimum System Requirements
* Linux (CentOS/Ubuntu/Redhat)
* JDK 8 (JRE or JDK installation)

{{< hint "info" >}}
**Note:** The storage requirements may increase depending on your source-target pair and method of replication. For more info, check out the documentation for each specific source/target you will be using or reach out to our support team.
{{< /hint >}}

## Downloading Replicant and Creating REPLICANT_HOME

Replicant is available through a .zip file which must be downloaded to the machine/server where it will be hosted. If you do not already have the .zip file and/or an Arcion license, [contact our team](http://www.arcion.io/contact) to get access.

2. Unzip the downloaded archive

Once you have downloaded Replicant to the directory of your choice on the host machine/server, you'll need to unzip it. An example can be seen below in a Bash script.

   ```BASH
   unzip replicant-cli-<version>.zip
   ```

Once it is unzipped, this will create a directory named ```replicant-cli```. This directory will be referred to as ```REPLICANT_HOME``` throughout the docs and Arcion website. 

## Adding a License

Before running Replicant, you will need to add a license file to the ```REPLICANT_HOME``` directory. {{<hint "warning" >}} The license file must be named replicant.lic in order to be picked up by Replicant when it is started{{< /hint >}}.  

{{< hint "info" >}}
**Note:** If you require a license file, [contact our team](http://www.arcion.io/contact) to get one. We will happily provide users with a 30-day free trial license to try out the product or run a POC
{{< /hint >}}

To add the license file, do the following:

1. Attain an Arcion license file
2. Rename the license file to `replicant.lic`
3. Move or copy the `replicant.lic` file into the ```REPLICANT_HOME``` directory. {{<hint "warning" >}}You must copy the `replicant.lic` file into the root directory, not in the `licenses` folder of Replicant.{{< /hint >}}

## Setting Up The Source Connector

After getting Replicant downloaded and adding the license, you can create your source connector. The source connector will be the database where data will be migrated or replicated from.

For configuring a source connector, a few configuration files are required. These files include:
* connection configuration file
* filter configuration file
*

To set up a source connector, you'll need to do the following:

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

    Please note that certain databases might have additional configuration parameters. For example, [Oracle has the additional parameter ```service-name```](../../sources/source-setup/oracle/#vi-set-up-connection-configuration).

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
