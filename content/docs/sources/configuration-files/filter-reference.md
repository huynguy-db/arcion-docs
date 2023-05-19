---
pageTitle: Using Filter file to specify filters
title: Filter Configuration
description: "Learn about the Filter configuration file containing filter rules. These rules tell Replicant which databases, collections, or documents to replicate."
weight: 3
url: docs/references/filter-reference
---

# Filter Configuration

You can instruct Replicant which data collections, tables, or files to replicate to best suit your replication strategy.

## The filter configuration file
The filter configuration file contains a set of filter rules. Replicant follows these rules while carrying out replication. You can filter tables, views, and queries. 

There are sample filter configuration files for different source databases inside the `filter` directory of [your Arcion self-hosted download]({{< relref "../../quickstart/arcion-self-hosted#ii-download-replicant-and-create-a-home-repository" >}}).

The following configuration parameters are available that you can use to lay out your filters:

### `allow`
What database, collections, or documents to replicate. `allow` marks the entry point of the filter configuration file. You can specify the following parameters under `allow`: 

<dl class="dl-indent">

<dt><code>catalog</code></dt>
<dd>
The source catalog which needs to be replicated. Note that if a source system supports the concept of catalogs or databases, then you need to specify this configuration and its value should be the same as the database configuration value specified in the source system’s connection configuration file.
</dd>

<dt><code>schema</code></dt>
<dd>
The source database schema that needs to be replicated. Each schema must have a separate entry.
</dd>

<dt><code>types</code></dt>
<dd>
The data type(s) to be replicated from the source catalog <code>catalog</code> enclosed in square brackets. Arcion Replicant supports the following types:

- `TABLE`
- `VIEW`
- `QUERY`

You can specify multiple data types.
</dd>

<dt><code>allow</code></dt>
<dd>
The entrypoint to define what collections or tables from <code>catalog</code> gets replicated. It has the following parameters available:
</dd>

<dl class="dl-indent" >
<dt><code>TABLE_NAME</code></dt>
<dd>
Specify the collection or table names that should be replicated from <code>catalog</code>. Note that each collection within the database must be a separate entry.
</dd>

<dt><code>allow</code></dt>
<dd>
A list of columns in the table <code>TABLE_NAME</code>. These columns undergo replication. If you don't specify anything, Replicant replicates all columns.
</dd>

<dt><code>conditions</code></dt>
<dd>
A predicate for filtering the data while extracting from the source. If the source system supports SQL, you can specify the exact SQL predicate that Replicant uses while extracting data. Please note that Replicant executes the same predicate on both the source and target systems to achieve end-to-end filtering of data during replication.
</dd>

<dt><code>src-conditions</code></dt>
<dd>
Sometimes source and target systems support a different query language and a different mechanism to specify predicates. For example, source Oracle supporting SQL predicates while MongoDB supporting JSON predicates. In that case, you must specify the same filtering condition in both languages in <code>src-conditions</code> and <code>dst-conditions</code> for the source and target systems respectively.
</dd>

<dt><code>dst-conditions</code></dt>
<dd>
Same as <code>src-conditions</code>.
</dd>

<dt><code>allow-update-any</code> <i>[v20.05.12.3]</i></dt>
<dd>
This option applies to realtime (CDC-based) replication. It contains a list of columns. Replicant publishes update operations on this table only if <em>any</em> of the columns you specify here have been modified. Replicant looks for modifications in the UPDATE logs it receives from the source system.
</dd>

<dt><code>allow-update-all</code> <i>[v20.05.12.3]</i></dt>
<dd>
This option applies to realtime (CDC-based) replication. It contains a list of columns. Replicant publishes update operations on this table only if <em>all</em> of the columns you specify here have been modified. Replicant looks for modifications in the UPDATE logs it receives from the source system.
</dd>

</dl>

</dl>

{{< hint "warning" >}}
**Important:** We recommend that you create an index on the target table columns when those columns are part of `dst-conditions`.
{{< /hint >}}

## Run Replicant
After you have a filter file ready, run Replicant with the `--filter` option, providing it the path to the filter file. For example:

```sh
./bin/replicant full \
conf/conn/oracle_src.yaml conf/conn/databricks.yaml \
--extractor conf/src/oracle.yaml \
--applier conf/dst/databricks.yaml \
--filter filter/oracle_filter.yaml \
```

## Filter queries
If you [replicate source queries]({{< relref "src-queries" >}}), you must whitelist them in the filter file. To do so, include the special tag `QUERY` inside your filter `types` list. The `QUERY` tag instructs Replicant to allow all the queries under that specific catalog or schema. For example:

```YAML
allow:
- schema: "tpch"
  types: [QUERY]
```

If the filter `types` list contains any other type besides `QUERY`, you must explicitly specify the logical names under the `allow` field. You define these logical names in [the `src-queries` configuration file]({{< relref "src-queries#configure-src-queries-parameters" >}}) as [`MACRO_NAME`]({{< relref "src-queries#macros" >}}) and [`QUERY_NAME`]({{< relref "src-queries#queries" >}}) . For example, the following sample specifies the `ng_test_tbd_sql` query and the tables under the `allow` field.

```YAML
allow:
- schema : "tpch"
  types: [TABLE, QUERY]
    nation:
    region:
    ng_test_tbd_sql:
    supplier:  
```

