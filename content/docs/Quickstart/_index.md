---
title: Quickstart
weight: 1
---

# Quickstart

## I. Host Machine Prerequisites

Please ensure your host machine that will run Replicant meets the following minimum hardware and software prerequisites.

**Minimum Hardware Requirements**
* 32 CPU and 64GB Memory
* 1 TB SSD (/NVMe) space

**Minimum System Requirements**
* Linux (CentOS/Ubuntu/Redhat)
* JDK 8 either from a JRE or JDK installation

## II. Download Replicant and Create a Home Repository

1. Click the following to download the latest version of Replicant: [Replicant Download](https://blitzz-releases.s3-us-west-1.amazonaws.com/general/replicant/replicant-cli-21.02.01.7.zip)
2. Unzip the downloaded Replicant archive
   ```BASH
   unzip replicant-cli-<version>.zip
   ```
This will create a directory named ```replicant-cli``` that will serve as ```REPLICANT_HOME```. For the proceeding steps, position yourself in ```REPLICANT_HOME```.


## III. Licensing
1. Download the license file for Replicant and rename it to replicant.lic
  * Note: The license file must be named replicant.lic
2. Copy replicant.lic into ```REPLICANT_HOME```
  * Note: You must copy the replicant.lic file into Replicant's home directory and not in the licenses folder of Replicant


## IV. Setup Source Database Configuration

1. From ```REPLICANT_HOME``` navigate to the sample connection configuration file of the source database
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

    Please note that certain databases might have additional configuration parameters. For example, Oracle has the additional parameter ```service-name```

    For further database specific examples, please refer to Source Database Setup.

2. From ```REPLICANT_HOME``` navigate to the sample filter file of the source database
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

1. From ```REPLICANT_HOME``` navigate to the sample connection configuration file of the target database

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

    For database specific examples, please refer to Target Database Setup.


## VI. Run Replicant Snapshot

Replicant is now ready to run in snapshot mode. The snapshot will only transfer existing data from the source database to the target database. If you would like to transfer real-time changes in addition to the snapshot, skip step 6 and proceed to steps 7 and 8 to run Replicant in full mode.

1. Execute the following command from ```REPLICANT_HOME``` to run Replicant in snapshot mode

   ``` BASH
   ./bin/replicant snapshot conf/conn/<source-database-name>.yaml \
   conf/conn/<destination-database-name>.yaml \
   --extractor conf/src/<source-database-name>.yaml \
   --applier conf/dst/<destination-database-name>.yaml \
   --filter filter/<source-database-name>_filter.yaml
   ```

The proceeding steps are only required if you intend to run Replicant in real-time mode.

## VII. Heartbeat table setup

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ``` BASH
   CREATE TABLE <catalog>.<schema>.replicate_io_cdc_heartbeat( \
   timestamp <data_type_equivalent_to_long>)
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for Replicant

3. From ```REPLICANT_HOME``` navigate to the heartbeat table's configuration
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

1. From ```REPLICANT_HOME``` enter the following to run Replicant in full mode
   ```BASH
   ./bin/replicant full conf/conn/<source-database-name>.yaml \
   conf/conn/<destination-database-name>.yaml \
   --extractor conf/src/<source-database-name>.yaml \
   --applier conf/dst/<destination-database-name>.yaml \
   --filter filter/<source-database-name>_filter.yaml \
   ```

## Database Specific Setup Overview

Different source and target databases may have slightly more specific and different setup instructions than the general guidelines provided in the Quickstart Guide above. Follow the six steps below for a pipeline specific setup for Replicant.

1. Source Database Setup
2. Target Database Setup  
3. Running Replicant
4. Performance Enhancing and Troubleshoot
