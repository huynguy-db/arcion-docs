---
pageTitle: Maintaining replication related metadata
title: Metadata Configuration
description: "Arcion Replicant maintains its own metadata for distributed and fault-tolerant replication. You can configure where to store those metadata in."
weight: 5
---

# Metadata configuration

In order to carry out a fault-tolerant distributed replication, Arcion Replicant needs to maintain a number of metadata tables of its own. Replicant uses [the metadata configuration file](#the-metadata-configuration-file) to handle metadata-related operations.

## Metadata location
Usually, [the metadata configuration file](#the-metadata-configuration-file) specifies a separate database where Replicant will store all metadata tables. You can also choose not to specify a metadata configuration file. In that case, if the target database is a data warehouse, such as Databricks and Snowflake, then Replicant will use SQLite to store metadata tables. For more information on how to specify the metadata configuration file to Replicant, see [Run Replicant with metadata configuration](#run-replicant-with-metadata-configuration).
   
## The metadata configuration file

### `type`
The type of the metadata database. For example, `MYSQL`, `SQLITE`.

### `connection`
The connection configuration of the metadata database. Replicant uses these connection parameters to connect to the metadata database. For more information about the connection parameters, see [Sample metadata configuration](#sample-metadata-configuration).

### `ddl-connection` *[v21.05.04.4]*
Optional. 

For specifying the configurations parameters for the connections to be used specially for DDL operations. You can configure all the connection configuration parameters above for DDL connections.

### `catalog`
The catalog Replicant would use for storing metadata.

### `schema`
The schema Replicant would use for storing metadata.

## Sample metadata configuration
You can find some sample metadata configuration files inside the `conf/metadata` directory of [your Arcion self-hosted download]({{< relref "../quickstart#ii-download-replicant-and-create-a-home-repository">}}). Below is a sample for MySQL as the metadata database:

```YAML
type: MYSQL

connection:
  host: localhost
  port: 53585
  username: 'replicant'
  password: 'Replicant#123'
  max-connections: 30

catalog: io_replicate
```

## Run Replicant with metadata configuration
To specify your metadata configuration file to Replicant, run Replicant with the  `--metadata` argument and give it the full path to your configuration file. For example:

```shell
./bin/replicant full conf/conn/source_database_name.yaml \
conf/conn/target_database_name.yaml \
--extractor conf/src/source_database_name.yaml \
--applier conf/dst/target_database_name.yaml \
--metadata conf/metadata/database_name.yaml \
```