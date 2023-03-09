---
pageTitle: Using Mapper file to map Source data
title: Mapper Configuration
description: "You can control the structure of Source data as it gets replicated to Target. Learn to map Source data using Mapper file rules."
weight: 4
---

# Mapper Configuration

While replicating data between storages of different type, Replicant by default attempts to transfer the data as fetched from the source while maintaining its structure. But there maybe situations where you need more control over Source data mapping. That's where a Mapper file comes in.

By using the Mapper file, you can precisely define how the data retrieved from the Source is applied to the Target/Destination. 

You can specify the Mapper file when running Replicant in the folliwng way :

```sh
./bin/replicant snapshot conf/conn/oracle.yaml \
conf/conn/singlestore.yaml \
--map sqlserver_to_singlestore_map.yaml
```

## Overview
The Mapper file contains a map of rules where each rule applies to a single Target catalog or schema (namespace). 

- For databases that support both catalog and schema, each rule applies to a single schema. The schema must be prefixed with the catalog (fully qualified). 
- For each Target namespace, it's possible to define a list of Source namespaces, the contents of which will then be mapped into the Target namespace.

When you need more control, you can define additional rules for the tables and columns. Table rules are defined in the similar fashion as namespace rules—using the tables map. In the tables map, you can specify multiple source tables for each destination tables. 

{{< hint "info" >}} **Note:** Target tables are defined using only their name, while Source table names need to be fully qualified with each table's respective catalog and schema. {{< /hint >}}

For each table mapping, it's also possible to map columns based on their names.

## Structure of Mapper Rules

Following is a template of the structure of Mapper rules:

```YAML
rules:
  [<target_namespace>]:
    source:
    - [<source_namespace>]:
      .
      .
      .  

    tables:
      <target_table_name>:
        source:
        - [<src_namespace>, <src_table_name>]:
             <target_col_name>: <src_col_name>
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

### Example

Below is a sample Mapper file for a **SQL Server-to-SingleStore** pipeline:

```YAML
rules:
  [testdb_s]:
    source:
    - [testdb, dbo]:
    tables:
      testTB1_s:
        source:
          [testdb, dbo, TestTB1]:
            col1_s: col1
```

In the above example:

- `testdb_s` is the Target database name that you want to change to.
- Under `source` parameter, the flow sequence containing `testdb` and `dbo` represents Source database name and schema name (SQL Server default schema name is `dbo`) respectively.
- `testTB1_s` is the name of the table at Target that you want to change to.
- The flow sequence `[testdb, dbo, TestTB1]` under `source` represents the Source database name, Source schema name, and Source table name respectively. Pay attention to case sensitivity.
- The key-value pair `col1_s: col1` maps Target column name to Source column name

You can also find sample Mapper files for different pipelines in the `mapper` directory of your [Arcion Self-hosted download](/docs/quickstart/#ii-download-replicant-and-create-a-home-repository).

## Dynamic trimming options

There maybe cases where the Target database does not support the name length of tables in the Source database. In those cases, you can make use of the following options inside a mapper file to enable trimming of table and column names:

### `dynamic-identifier-name-trimming` *[v20.12.04.5]*
`true` of `false`. 

When set to `true`, table or column names are trimmed so that it fits the length the target supports.
  
### `identifier-mapping-table-namespace` *[v20.12.04.5]*

Represents the namespace where the mappings of table or column are stored in the target database.
  
  - `catalog`: Specify catalog name if applicable.
  - `schema`: Specify schema name if applicable.

## Convert letter case for database objects
In cases where the target database requires database object names (tables or columns) to be in particular letter case, you can use the `convert-case` option inside the mapper file:

### `convert-case` _[v21.06.14.3]_
The letter case to use for table or column names while mapping. The following values are allowed:

- `DEFAULT`
- `LOWERCASE`
- `UPPERCASE`
  
When set to `LOWERCASE` or `UPPERCASE`, Replicant converts table or column names to the appropriate letter case while mapping. When set to `DEFAULT`, Replicant maintains the letter case of source object names.

{{< hint "info" >}}
**Note:** If the table is explicitly mapped, then that mapping will override the convert-case behaviour. If a source table named `REGION` is mapped to destination table `region_lowercase`, then this mapping will override the `convert-case` rule for this table. So, on target the table name becomes `region_lowercase` instead of uppercase `REGION`.
{{< /hint >}}

## Delimiter in Kafka topic and Redis stream names
Replicant supports either dot (`.`), or underscore (`_`) as the delimiter in Kafka topic and Redis stream names. This allows you to map your source database object names to the appropriate format in [Kafka]({{< ref "docs/target-setup/kafka" >}}) and [Redis Streams]({{< ref "docs/target-setup/redis-streams" >}}).

To set the delimiter, set the `object-name-concat-delimiter` parameter to one of the following values in the Mapper file:

<dl class="dl-indent" >
<dt>

**`DOT`**
</dt>
<dd>

Use dot (`.`) as the delimiter. 

For example, source table name `<catalog>.<schema>.<table>` is mapped to `<catalog>.<schema>.<table>`.

</dd>

<dt> 

**`UNDERSCORE`**
</dt> 

<dd>

Use underscore (`_`) as the delimiter. Underscore is the default delimiter for Kafka topic and Redis stream names.

For example, source table name `<catalog>.<schema>.<table>` is mapped to `<catalog>_<schema>_<table>`.
</dd>

For example, notice the following Mapper sample for MySQL-to-Kafka pipeline:

```YAML
rules:
  [topic_prefix_r]:
    source:
    - [io,replicate]
  [topic_prefix_s]:
    source:
    - [tpch_scale_0_01]

object-name-concat-delimiter: DOT
```