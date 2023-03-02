---
pageTitle: NATIVE format for CDC changes in Kafka target 
title: NATIVE format for Kafka
description: "Arcion Replicant can also use NATIVE format to track CDC changes for Apache Kafka as target for realtime replication."
weight: 3
---

# NATIVE format for Kafka
Arcion Replicant uses the NATIVE format to represent CDC changes for [Kafka target]({{< ref "docs/target-setup/kafka" >}}).

To use NATIVE format, set [the global Applier parameter `replication-format` to `NATIVE`]({{< relref "docs/target-setup/kafka#replication-format" >}}) in your Applier configuration file.

## Structure and examples
In this section, we'll explore how insert, update, and delete events look like in NATIVE format for snapshot and realtime mode.

### Change events in snapshot mode
To represent change events in snapshot mode, a simple JSON structure is used. For example:

```JSON
{
  "r_regionkey": "1",
  "r_name": "AMERICA",
  "r_comment": "Test_Replication"
}
```
### Change events in realtime mode

#### `INSERT` event
{{< details title="Click to see sample" open=false >}}

```JSON
{
  "tableName": {
    "namespace": {
      "catalog": null,
      "schema": "tpch",
      "hash": -1732472540
    },
    "name": "region",
    "hash": 1193131537
  },
  "opType": "I",
  "cursor": {
    "extractorId": 0,
    "timestamp": 1677165953000,
    "extractionTimestamp": 1677146153753,
    "log": "log-bin.000001",
    "position": 3000,
    "logSeqNum": 1,
    "slaveServerId": 1,
    "v": 2
  },
  "before": null,
  "after": {
    "r_regionkey": "7",
    "r_comment": "Test_Comment",
    "r_name": "Test_Region"
  }
}
```
{{< /details >}}

#### `UPDATE` event
{{< details title="Click to see sample" open=false >}}

```JSON
{
  "tableName": {
    "namespace": {
      "catalog": null,
      "schema": "tpch",
      "hash": -1732472540
    },
    "name": "region",
    "hash": 1193131537
  },
  "opType": "U",
  "cursor": {
    "extractorId": 0,
    "timestamp": 1677166633000,
    "extractionTimestamp": 1677146833980,
    "log": "log-bin.000001",
    "position": 3620,
    "logSeqNum": 1,
    "slaveServerId": 1,
    "v": 2
  },
  "before": {
    "r_regionkey": "2",
    "r_comment": "Test_Replication",
    "r_name": "ASIA"
  },
  "after": {
    "r_regionkey": "2",
    "r_comment": "Testing_Replication",
    "r_name": "ASIA"
  }
}
```
{{< /details >}}

#### `DELETE` event
{{< details title="Click to see sample" open=false >}}

```JSON
{
  "tableName": {
    "namespace": {
      "catalog": null,
      "schema": "tpch",
      "hash": -1732472540
    },
    "name": "region",
    "hash": 1193131537
  },
  "opType": "D",
  "cursor": {
    "extractorId": 0,
    "timestamp": 1677166413000,
    "extractionTimestamp": 1677146613902,
    "log": "log-bin.000001",
    "position": 3310,
    "logSeqNum": 1,
    "slaveServerId": 1,
    "v": 2
  },
  "before": {
    "r_regionkey": "1",
    "r_comment": "Test_Replication",
    "r_name": "AMERICA"
  },
  "after": null
}
```
{{< /details >}}

In the preceeding samples, notice the following keys that correspond to various details about the event and the table:

#### `tableName`
The fully qualified name of the table.

#### `opType`
The event type. 

The following three event types are available that corresponds to three DML operations:

<dl class="dl-indent">

<dt>

`I`

</dt>
<dd>An insert operation.</dd>

<dt>

`U`

</dt>
<dd>An update operation.</dd>

<dt>

`D`

</dt>
<dd>A delete operation.</dd>

</dt>
<dd>An insert operation.</dd>

</dl>

#### `cursor` 
The metadata of extraction event. 

#### `before` 
The image of the rows before the execution of the event.

#### `after` 
The image of the rows after execution of the event.


