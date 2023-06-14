---
pageTitle: Filter configuration for Replicate Row Verificator
title: Filter Configuration
description: "Set up the filter configuration for the Row Verificator. The filter file specifies the database, collections, and documents to verify."
weight: 4
---

# Filter configuration for the Verificator
The filter configuration file uses key-value pairs in YAML format to specify and configure what database objects the Verificator must verify. 

## `allow`
What database, collections, or documents the Verificator needs to verify. `allow` marks the entry point of the filter configuration file. 

<dl class="dl-indent" >
<dt>

`catalog`
</dt>
<dd>

Specify the source catalog that the Verificator must verify. Keep in mind this key only applies to sources that support the concept of catalogs or databases. The `catalog` value you specify here must be the same as the database configuration value you specify in the source system’s connection configuration file.
</dd>
<dt>

`schema`
</dt>
<dd>

Specify the source database schema that the Verificator must verify. Each schema must possess a separate entry.
</dd>
<dt>

`types`
</dt> 
<dd>

The relevant data type(s) from the source catalog or schema catalog enclosed in square brackets—for example, `[TABLE, VIEW]`.
</dd>
<dt>

`allow`
</dt>
<dd>

The entrypoint to define what collections or tables from the catalog or schema to verify.

<dl class="dl-indent">
<dt>

`TABLE_NAME`
</dt>
<dd>
Specify the collection or table names from the catalog or schema to verify. Note that each collection within the database must be a separate entry.

<dl class="dl-indent">
<dt>

`allow`
</dt>
<dd>

A list of columns in the table `TABLE_NAME` that the Verificator must verify. If you don't specify any columns with `allow`, the Verificator verifies all columns.
</dd>
<dt>

`conditions`
</dt>
<dd>
A predicate to use for filtering the data while extracting from the source. For an SQL source system, you can specify the exact SQL predicate that the Verificator must use while extracting data. Please note that the Verificator executes the same predicate on both source and target systems to achieve the required end-to-end filtering of data during verification.
</dd>
<dt>

`src-conditions`
</dt>
<dd>

Sometimes source and target systems support a different query language and a different mechanism to specify predicates. For example, source Oracle supports SQL predicates while MongoDB supports JSON predicates. In that case, you must specify the same filtering condition in both languages in `src-conditions` and `dst-conditions` for the source and target systems respectively.
</dd>
<dt>

`dst-conditions`
</dt>
<dd>

Same as `src-conditions`.
</dd>

</dl>
</dd>

</dl>
</dd>
</dl>

## Sample filter configuration
You can find sample filter configurations for different database platforms inside the `filter/` folder of your Verificator download.

The following shows a sample filter configuration for [source IBM Db2]({{< ref "docs/sources/source-setup/db2" >}}):

```YAML
allow:
- catalog: tpch
  schema: db2user
  types: [TABLE, VIEW, QUERY]
  allow:
    nation:
    region:
    part:
    supplier:
    partsupp:
    orders:
    customer:
    lineitem:
```