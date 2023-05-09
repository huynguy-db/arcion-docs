---
bookCollapseSection: true
pageTitle: Change data capture Format
title: "Change Data Capture Format"
description: "Arcion uses its own CDC format to represent CDC change events. This format is supported for Amazon S3, along with the JSON CDC format for Kafka as target."
weight: 13
---

# Change data capture format

Arcion uses two formats to represent CDC change events: 

- Arcion internal CDC format
- JSON CDC format

A change event can be any row change due to an insert, update, or a delete operation. We use our internal CDC format to replicate data to Amazon S3 in realtime. For [Apache Kafka as target]({{< relref "../../targets/target-setup/s3" >}}), we use the JSON CDC format and NATIVE format instead.

In this section, we discuss how our internal CDC format works with examples for different replication modes such as snapshot and real-time. We also discuss how we support Kafka as target using the JSON CDC and NATIVE format with examples.

## In this section

- [Arcion internal CDC format for Amazon S3]({{< relref "arcion-internal-cdc-format" >}})
- [JSON CDC format for Apache Kafka]({{< relref "json-cdc-format" >}})
- [NATIVE format for Apache Kafka]({{< relref "native-format" >}})