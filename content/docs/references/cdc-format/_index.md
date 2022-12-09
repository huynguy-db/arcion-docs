---
bookCollapseSection: true
pageTitle: Change data capture Format
title: "Change Data Capture Format"
description: "Arcion uses its own CDC format to represent CDC change events. This format is supported for Amazon S3, along with the Debezium format for Kafka as target."
weight: 10
---

# Change data capture format

Arcion uses two formats to represent CDC change events: 

- Arcion internal CDC format
- Debezium format

A change event can be any row change due to an insert, update, or a delete operation. We use our internal CDC format to replicate data to Amazon S3 in realtime. For [Apache Kafka as target]({{< relref "../../target-setup/s3" >}}), we use [the Debezium format](https://debezium.io/) instead.

In this section, we discuss how our internal CDC format works with examples for different replication modes such as snapshot and real-time. We also discuss how we support Kafka as target using the Debezium format with example.

## In this section

- [Arcion internal CDC format for Amazon S3]({{< relref "arcion-internal-cdc-format" >}})
- [Debezium CDC format for Apache Kafka]({{< relref "debezium-format" >}})