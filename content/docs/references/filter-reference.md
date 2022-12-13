---
pageTitle: Using Filter file to specify filters
title: Filter Configuration
description: "Learn about the Filter configuration file containing filter rules. These rules tell Replicant which databases, collections, or documents to replicate."
weight: 2
---

# Filter Configuration

You can instruct Replicant which data collections, tables, or files to replicate to best suit your replication strategy.

## The filter configuration file
The filter configuration file contains a set of filter rules. Replicant follows these rules while carrying out replication. You can find sample filter configuration files for different source databases inside the `filter` directory of [your Arcion self-hosted download]({{< relref "../quickstart#ii-download-replicant-and-create-a-home-repository" >}}).

The following configuration parameters are available that you can use to lay out your filters:

### `allow`
What database, collections, or documents to replicate. This is the entrypoint of the filter configuration file. The following parameters are available under `allow`: 

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
The data type(s) to be replicated from the source catalog <code>catalog</code> enclosed in square brackets. For example, the <code>TABLE</code> type data. You can specify multiple data types.
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
A list of columns in the table <code>TABLE_NAME</code> which should be replicated. If you don't specify anything, all columns are replicated.
</dd>

<dt><code>conditions</code></dt>
<dd>
A predicate to be used for filtering the data while extracting from the source. If the source system is an SQL system, you can specify the exact SQL predicate which replicant should use while extracting data. Please note that the same predicate is executed on both the source and target systems to achieve the required end to end filtering of data during replication.
</dd>

<dt><code>src-conditions</code></dt>
<dd>
If source and target systems support a different query language and a different mechanism to specify predicates (e.g. source Oracle supporting SQL predicates while MongoDB supporting JSON predicates), then you must specify the same filtering condition in both languages in src-conditions and dst-conditions for the source and target systems respectively.
</dd>

<dt><code>dst-conditions</code></dt>
<dd>
Same as <code>src-conditions</code>.
</dd>

<dt><code>allow-update-any</code> <i>[20.05.12.3]</i></dt>
<dd>
This option is relevant to real time (CDC based replication). When a list of columns is specified here, replicant publishes update operations on this table only when any of the columns specified here are found modified in the received UPDATE logs from the source system.
</dd>

<dt><code>allow-update-all</code> <i>[20.05.12.3]</i></dt>
<dd>
This option is relevant to real time( CDC based replication). When a list of columns is specified here, replicant publishes update operations on this table only when all of the columns specified here are found modified in the received UPDATE logs from the source system.
</dd>

</dl>

</dl>

{{< hint "warning" >}}
**Important:** We recommend that you create an index on the columns of the target table which are part of `dst-conditions`.
{{< /hint >}}