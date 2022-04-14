---
title: Mapper Configuration
weight: 4
---

# Mapper Configuration

While replicating data between storages of different type, Replicant by default attempts to transfer the data as fetched from the source while maintaining its structure. In practice, there are situations where more control over source data mapping is needed. In situations such as these a mapping file can be used.

By using the mapping file, you can precisely define how the data retrieved from the source is applied to the destination. The mapping file can be provided as follows:

`./bin/replicant snapshot conf/conn/oracle.yaml `
`conf/conn/singlestore.yaml --map oracle_to_singlestore_map.yaml`

## Database
The mapper file contains a map of rules where each rule applies to a single destination catalog or schema (namespace). For databases that support both catalog and schema, each rule applies to a single schema and the schema must be prefixed with the catalog (fully qualified). For each destination namespace, it's possible to define a list of source namespaces, the contents of which will then be mapped into the destination namespace.

When more control is needed you can define additional rules for the tables and columns. Table rules are defined in the similar fashion as namespace rules- using the tables map. In the tables map, you can specify multiple source tables for each destination tables. Note that destination tables are defined using only their name, while source table names need to be fully qualified with the table's respective catalog and schema.

For each table mapping it's also possible to map columns based on their names.

## Mapper Rules Structure

The following is a template of the mapper rules structure:

```BASH
rules:
  [<dst_namespace>]:
    source:
    - [<src_namespace>]:
      .
      .
      .  

    tables:
      <dst_table_name>:
        source:
        - [<src_namespace>, <src_table_name>]:
             <dst_col_name>: <src_col_name>
             .
             .
             .
           .
           .
           .
         .
         .
         .
    .
    .
    .
```

## Dynamic trimming options:

In case the destination database does not support the name length of tables in the source database, the following options can be used inside a mapper file to enable trimming of table and column names.

  1. **dynamic-identifier-name-trimming[20.12.04.5]**: When true, table/column names are trimmed to fit destination supported length.
  2. **identifier-mapping-table-namespace[20.12.04.5]**: Namespace where the mappings of table/column are stored in destination database.
    * **Catalog**: specify catalog name if applicable
    * **Schema**: specify schema name if applicable
