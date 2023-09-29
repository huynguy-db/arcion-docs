---
pageTitle: Documentation for Azure Event Hubs as target
title: Azure Event Hubs
description: "Learn how to use Arcion for big data streaming and event ingestion in real time into Azure Event Hubs."
bookHidden: false
url: docs/target-setup/azure-event-hubs
---

# Destination Azure Event Hubs
{{< hint "info" >}}
**Note:** Azure Event Hubs is currently in alpha stage of development.
{{< /hint >}}
[Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about) is a data streaming platform and an event ingestion service. It provides an Apache Kafka endpoint on an event hub, allowing users to connect to the event hub using the Kafka protocol.

## Overview
This page explains how to use Arcion to stream big data and ingest events in real time into Azure Event Hubs. 

In the following steps, we refer [the extracted `replicant-cli` download]({{< ref "docs/quickstart#ii-get-arcion-self-hosted" >}}) as the `$REPLICANT_HOME` directory.

## Before you begin
1. If you create Azure Event hubs namespace using standard pricing tier, then you must [enable Auto-inflate](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-auto-inflate#enable-auto-inflate-on-a-namespace).
2. Azure Event Hubs does not support Kafka transaction APIs but it supports idempotent write operations. Therefore, Arcion uses Kafka’s idempotent producer APIs for pushing data to event hubs.

## I. Set up connection configuration 
Specify your Azure Event Hubs connection details to Replicant with a connection configuration file. You can find a sample connection configuration file `azure_event_hub.yaml` in the `$REPLICANT_HOME/conf/conn` directory.

Since Azure Event Hubs provides an Apache Kafka endpoint on an event hub, Arcion Replicant uses Kafka protocol to interact with Azure Event Hubs.

To connect to Azure Event Hubs, specify the connection details in the following manner:

```YAML
type: AZURE_EVENT_HUBS

username: "$ConnectionString"
password: "NAMESPACE_CONNECTION_STRING"

brokers:
  broker1:
    host: "BOOTSTRAP_SERVER_HOSTNAME"
    port: 9093
```

Replace the following:
- *`NAMESPACE_CONNECTION_STRING`*: the [connection string](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-get-connection-string) for your Event Hubs namespace—for example, `Endpoint=sb://mynamespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=ABCDHIJKPQRSTXYZ";`.
- *`BOOTSTRAP_SERVER_NAME`*: the Bootstrap server's hostname. It follows the format `NAMESPACENAME.servicebus.windows.net`, where *`NAMESPACENAME`* means your Event Hubs namespace name.

You must specify the `username` and `password` fields for authentication. 

SSL is by default enabled for data encryption.

## II. Configure mapper file (optional) 
If you want to define data mapping from your source to Azure Event Hubs, specify the mapping rules in the mapper file. For more information on how to define the mapping rules and run Replicant CLI with the mapper file, see [Mapper configuration]({{< ref "docs/targets/configuration-files/mapper-reference" >}}).

When mapping source object names to Event Hubs, you can choose between two delimiters for event hub names. For more information, see [Delimiter in Kafka topic, Redis stream, and event hub names]({{< ref "docs/targets/configuration-files/mapper-reference#delimiter-in-kafka-topic-redis-stream-and-event-hub-names" >}}).

## III. Set up Applier configuration
To configure replication mode according to your requirements, specify your configuration in the Applier configuration file. You can find a sample Applier configuration file `azure_event_hubs.yaml` in the `$REPLICANT_HOME/conf/dst` directory.

The configuration file can contain global Applier parameters followed by parameters for snapshot and real-time replication.

### Global Applier parameters
Global configuration parameters live at the topmost level of the Applier configuration file. Therefore, you must specify them at the topmost place of the Applier configuration file. Since these parameters have a global definition, they affect both snapshot and real-time replication.

Arcion Replicant supports the following global Applier configuration parameters:

<dl class="dl-indent">
<dt>

`replication-format`
</dt>
<dd>

Sets the structure of the published events. The following structures are supported:
- `NATIVE`
- `JSON`
</dd>
</dl>

### Configure `snapshot` mode
For operating in [`snapshot` mode]({{< ref "docs/running-replicant#replicant-snapshot-mode" >}}), specify your configuration under the `snapshot` section of the configuration file.

The following Applier parameters applies specifically to Azure Event Hubs for snapshot replication:

<dl class="dl-indent">
<dt>

`num-shards `
</dt>
<dd>
Number of partitions for each data event hub.

_Default: Equals the number of Applier threads._
</dd>
<dt>

`shard-key`
</dt>
<dd>

Shard key to use for partitioning events.
</dd>
<dt>

`shard-function`
</dt>
<dd>

Sharding function to use to deduce the partition allocation for events based on `shard-key`. The following functions are supported: 
- `MOD`
- `NONE`

_Default: `NONE`. This means Azure Event Hubs uses it’s partitioning algorithm._
</dd>
<dt>

`kafka-batch-size-in-bytes`
</dt>
<dd>

Batch size for Kafka producer.

_Default: `100000`._
</dd>
<dt>

`kafka-buffer-memory-size-in-bytes`
</dt>
<dd>

Memory allocation for Kafka client to store unsent messages.

_Default: `67108864`._
</dd>
<dt>

`kafka-linger-ms`
</dt>
<dd>

Sets the extra time in milliseconds for Kafka batches to fill.

_Default: `10`._
</dd>
<dt>

`producer-max-block-ms`
</dt>
<dd>

Corresponds to the [`max.block.ms` parameter of Kafka producer](https://docs.confluent.io/platform/current/installation/configuration/producer-configs.html#max-block-ms).

_Default: Default value is `60_000`._
</dd>
<dt>

`create-topic-timeout-ms`
</dt>
<dd>

Specifies the timeout for event hub creation.

_Default: `60_000`._
</dd>
<dt>

`per-table-config`
</dt>
<dd>

Allows you to set the following parameters for target tables on a per-table basis:
- `num-shards`
- `shard-key`
- `shard-function`

See the [sample configuration](#sample-snapshot-configuration) to understand how to define parameters for specific tables.
</dd>

</dl>

For more information about the Applier parameters for `snapshot` mode, see [Snapshot mode]({{< relref "../configuration-files/applier-reference#snapshot-mode" >}}).

#### Sample snapshot configuration
```YAML
replication-format: JSON

snapshot:
  threads: 16
  batch-size-rows: 100000 
  txn-size-rows: 10000
  replication-factor: 1
  schema-dictionary: SCHEMA_DUMP  # {POJO|SCHEMA_DUMP|NONE}
  kafka-batch-size-in-bytes: 100000
  kafka-buffer-memory-size-in-bytes: 67108864
  kafka-linger-ms: 10
  skip-tables-on-failures : false
  publish-snapshot-end-event: false  # Applies only to JSON format.
                                     # Publishes snapshot end event when `true`.

  per-table-config:
  - tables:
      tpch_orders:
        shard-key: o_orderkey
        num-shards: 16 #default: 1
        shard-function: NONE
      tpch_region:
        shard-key: r_regionkey
      topic_prefix_s_lineitem:
        shard-key: l_orderkey
        num-shards: 16
        shard-function: MOD
```

### Configure real-time replication
For operating in [`realtime` mode]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}), specify your configuration under the `realtime` section of the conifiguration file. 

The following Applier parameters applies specifically to Azure Event Hubs for real-time replication:

<dl class="dl-indent">
<dt>

`split-topic`
</dt>
<dd>

`{true|false}`.

| Value|Behavior|
| ----------- | ----------- |
| `true` | Creates a separate event hub for snapshot and CDC data. |
| `false` | Uses a single event hub for snapshot and CDC data. |


`split-topic` acts as a global parameter for `realtime` mode. Therefore, you can’t change it for specific tables.

_Default: `true`._

{{< hint "info" >}}
**Note:** `split-topic` only works for `JSON` as the `replication-format`.
{{< /hint >}}
</dd>
<dt>

`shard-key`
</dt>
<dd>

Shard key to use for partitioning events.
</dd>
<dt>

`shard-function`
</dt>
<dd>

Sharding function to use to deduce the partition allocation for events based on `shard-key`. The following functions are supported: 
- `MOD`
- `NONE`

_Default: `NONE`. This means Azure Event Hubs uses it’s partitioning algorithm._
</dd>
<dt>

`kafka-batch-size-in-bytes`
</dt>
<dd>

Batch size for Kafka producer.

_Default: `100000`._
</dd>
<dt>

`kafka-buffer-memory-size-in-bytes`
</dt>
<dd>

Memory allocation for Kafka client to store unsent messages.

_Default: `67108864`._
</dd>
<dt>

`kafka-linger-ms`
</dt>
<dd>

Sets the extra time in milliseconds for Kafka batches to fill.

_Default: `10`._
</dd>
<dt>

`producer-max-block-ms`
</dt>
<dd>

Corresponds to the [`max.block.ms` parameter of Kafka producer](https://docs.confluent.io/platform/current/installation/configuration/producer-configs.html#max-block-ms).

_Default: Default value is `60_000`._
</dd>
<dt>

`create-topic-timeout-ms`
</dt>
<dd>

Specifies the timeout for event hub creation.

_Default: `60_000`._
</dd>
<dt>

`per-table-config`
</dt>
<dd>

Allows you to set the following parameters for target tables on a per-table basis:
- `num-shards`
- `shard-key`
- `shard-function`

See the [sample real-time configuration](#sample-real-time-configuration) to understand how to define parameters for specific tables.
</dd>

</dl>

For more information about the configuration parameters for `realtime` mode, see [Realtime mode]({{< ref "../configuration-files/applier-reference#realtime-mode" >}}).

#### Sample real-time configuration
```YAML
realtime:
  txn-size-rows: 10000
  before-image-format: ALL  # Allowed values : KEY, ALL
  after-image-format: ALL   # Allowed values : UPDATED, ALL
  replay-consistency: EVENTUAL # Enable this Config for Single Topic Kafka
  shard-key: id
  num-shards: 1
  shard-function: MOD
  skip-tables-on-failures : false

  per-table-config:
  - tables:
      tpch_orders:
        shard-key: o_orderkey
        num-shards: 16 #default: 1
        shard-function: NONE
      tpch_region:
        shard-key: r_regionkey
      topic_prefix_s_lineitem:
        shard-key: l_orderkey
        num-shards: 16
        shard-function: MOD
```