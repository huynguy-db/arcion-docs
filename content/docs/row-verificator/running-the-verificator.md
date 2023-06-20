---
pageTitle: Learn how to Run Replicant Row Verificator 
title: Run the Verificator
description: "Learn how to run the Row Verificator CLI and how it shows important information on the dashboard about the verification process."
weight: 6
---

# Running the Row Verificator
You can run Replicant Row Verificator with a very basic set of CLI options and arguments, as well as advanced options.

{{< hint "warning" >}}
**Important:** We highly recommend that you use the `--id` option to assign a unique ID to each verification job you run. For more information, see [Verification ID]({{< relref "verification-id" >}}).
{{< /hint >}}

## Verificator modes
You can run the Verificator in two modes. For more information about these modes, see [Row Verificator Overview]({{< relref "verificator-overview#overview" >}}):

<dl class="dl-indent">
<dt>

`verify`
</dt>
<dd>

This mode verifies snapshot data among JDBC-compliant databases. To operate in this mode, use the `verify` option. For example:

```sh
./bin/replicate-row-verificator verify \
conf/conn/sqlserver.yaml conf/conn/singlestore.yaml \
--filter filter/sqlserver_filter.yaml \
--map mapper/sqlserver_to_singlestore.yaml \
--id ver1
```
</dd>
<dt>

`delta-verify`
</dt>
<dd>

This mode allows you to find out missing primary keys on target data among JDBC-compliant databases. To use this mode, use the `delta-verify` option. For example:

```sh
./bin/replicate-row-verificator delta-verify \
configs/conf/conn/mysql.yaml configs/conf/conn/databricks.yaml \
--filter configs/filter/mysql_filter.yaml \
--general configs/general/general.yaml
--id ver1
```
</dd>
</dl>

## Run the Verificator with basic configurations
You can run the Verificator with basic configurations and ignoring most of the optional arguments, for example, 
the metadata and notification configurations. For example:

```sh
./bin/replicate-row-verificator verify \
conf/conn/sqlserver.yaml conf/conn/singlestore.yaml \
--filter filter/sqlserver_filter.yaml \
--map mapper/sqlserver_to_singlestore.yaml \
--id ver1
```

## Run the Verificator with advanced configurations
The following command runs the Verificator with advanced configurations using all the available options and arguments:

```sh
./bin/replicate-row-verificator verify \
conf/conn/sqlserver.yaml conf/conn/singlestore.yaml \
--filter filter/sqlserver_filter.yaml \
--metadata conf/metadata/singlestore.yaml  
--notify conf/notification/notification.yaml \
--general conf/general/general.yaml \
--map mapper/sqlserver_to_singlestore.yaml \
--id ver1
```

The preceding commands specify the following configurations:

- Uses the `verify` option. This tells Replicant to verify snapshot data across source and target.
- Secifies the connection configurations for the source and target with `conf/conn/sqlserver.yaml` and `conf/conn/singlestore.yaml` respectively.
- Specifies [the filter configuration]({{< relref "filter-configuration" >}}) with the `--filter` option.
- Specifies [the metadata configuration]({{< relref "metadata-configuration" >}}) with the `--metadata` option.
- Specifies [the notification configuration]({{< ref "docs/notifications-and-logging/notification-reference" >}}) with the `--notify` option.
- Specifies [Verificator system configuration]({{< relref "general-configuration" >}}) with the `--general` option.
- Specifies [mapper configuration]({{< relref "mapper-configuration" >}}) with the `--map` option.
- Specifies an ID for the verification job with the `--id` option.

## Resume the Verificator
You can stop the Verificator by pressing <kbd>Control</kbd> + <kbd>C</kbd> at any time. To start the Verificator and resume replication from that point on, add the `--resume` option in the Verificator run command:

```sh
./bin/replicate-row-verificator verify conf/conn/sqlserver.yaml conf/conn/singlestore.yaml \
--filter filter/sqlserver_filter.yaml \
--metadata conf/metadata/singlestore.yaml \
--map mapper/sqlserver_to_singlestore.yaml \
--id ver1 --resume
```

## Information dashboard
The Verificator generates a dashboard illustrating various pieces of data on the verification process. The dashboard contains the following information columns:

<dl class="dl-indent">
<dt>

`SOURCE_DATABSE_NAME`
</dt>
<dd>

Lists all the source database tables that the Verificator verifies. The column 
name depends on the source database name—for example, `SQLSERVER`.
</dd>
<dt>

`TARGET_DATABSE_NAME`
</dt>
<dd>

Lists all the target database tables that the Verificator verifies against respective source database tables. The column name depends on the target database—for example, `SINGLESTORE`.
</dd>

<dt>

`Src Total`
</dt>
<dd>
Lists all the rows in the corresponding table of the source database.
</dd>
<dt>

`Dst Total`
</dt>
<dd>
Lists all the rows in the corresponding table of the target database.
</dd>

<dt>

`Success`
</dt>
<dd>

Represents the success value for the verification of each corresponding source and target database tables.

<dl class="dl-indent">
<dt>&#10004;</dt>
<dd>The Verificator has found identical data across the source and target database tables.</dd>
<dt>&#10007;</dt>
<dd>The Verificator has found data mismatches across source and the target database tables.</dd>
<dt>-</dt>
<dd>The Verificator has only performed row-count matching for the source and target database tables.</dd>
</dl>

</dd>

<dt>

`Matches`
</dt>
<dd>Lists the row-count matches.</dd>

<dt>

`Src Excl`
</dt>
<dd>
Number of source-exclusive rows. These rows exist on the source database but not on the target database.
</dd>

<dt>

`Dst Excl`
</dt>
<dd>
Number of target-exclusive rows. These rows exist on the target database but not on the source database.
</dd>

<dt>

`Changed`
</dt>
<dd>
A particular primary key exists on both source and target database but some of the column values have changed. This column lists the number of those changes.
</dd>
</dl>

