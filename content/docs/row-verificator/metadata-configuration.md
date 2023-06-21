---
pageTitle: Configuring Verificator metadata 
title: Metadata Configuration
description: "The Verificator maintains metadata for distributed and fault-tolerant verification. You can configure the metadata database, the catalog, and the schema."
weight: 5
---

# Verificator metadata configuration
In order to carry out a fault-tolerant and distributed verification, Replicant Row Verificator needs to maintain a number of metadata tables of its own. The Verificator uses [the metadata configuration file](#the-metadata-configuration-file) to handle metadata-related operations.

## Metadata location
Usually, [the metadata configuration file](#the-metadata-configuration-file) specifies a separate database where the Verificator stores all metadata tables. You can also choose not to specify a metadata configuration file. In that case, the Verificator uses the sqlite database to store metadata tables.

For more information on how to specify the metadata configuration file to the Verificator, see [Run Row Verificator with metadata configuration](#run-row-verificator-with-metadata-configuration).

## The metadata configuration file
   
### `type`
The type of the metadata database—for example, `SINGLESTORE`.

### `connection`
The connection configuration of the metadata database.

### `catalog`
The catalog for storing metadata.

### `schema`
The schema for storing metadata.

## Sample metadata configuration file
You can find a sample metadata configuration file `replicate.yaml` inside the `conf/metadata/` directory of your Verificator download. The following sample demonstrates how to use SingleStore as the metadata database:

```YAML
type: SINGLESTORE

connection:
  host: localhost
  port: 57585

  username: 'alex'
  password: 'alex1234'
  max-connections: 30
  max-retries: 1
  max-conn-retries: 1

catalog: io_replicate
```

## Run the Verificator with metadata configuration
To specify the metadata configuration to Verificator, run the Verificator with the `--metadata` option and provide it the full path to the metadata configuration file. For example:

```sh
./bin/replicate-row-verificator verify \
conf/conn/sqlserver.yaml conf/conn/singlestore.yaml \
--metadata conf/metadata/singlestore.yaml  
--general conf/general/general.yaml \
--map mapper/sqlserver_to_singlestore.yaml \
--id ver1
```
```