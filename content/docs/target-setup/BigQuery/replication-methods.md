---
pageTitle: Replication methods for replication into BigQuery
title: Replication methods
description: "Learn how Arcion performs data ingestion into BigQuery using BigQuery Storage Write API and conventional load job method."
bookHidden: false
weight: 2
---

# Replication methods for BigQuery

For [`realtime`]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}) and [`snapshot`]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}) replication into BigQuery, Replicant supports the following two methods:

- [Loading data with conventional load job method](#load-data-with-load-job-method).
- [Streaming data using BigQuery Storage Write API](#load-data-using-the-storage-write-api).

## Load data with load job method
[The conventional load job method](https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-csv) is the default method of loading data into BigQuery partitions and tables. See [Configure `snapshot` replication]({{< relref "setup-guide#configure-snapshot-replication" >}}) and [Configure `realtime` replication]({{< relref "setup-guide#configure-realtime-replication" >}}) for sample configurations.

## Load data using the Storage Write API
This method of replication uses the [BigQuery Storage Write API](https://cloud.google.com/bigquery/docs/write-api-streaming) to stream data into BigQuery. 

### Required permissions
To use this method, first, make sure you have the necessary `bigquery.tables.updateData` permissions. For more information, see [Required permissions](https://cloud.google.com/bigquery/docs/write-api#required_permissions).

### Configuration
You can use the Storage Write API method by setting the `use-write-storage-api` parameter to `true` under the `realtime` or `snapshot` sectin of the Applier configuration file. See [Configure `realtime` replication]({{< relref "setup-guide#configure-realtime-replication" >}}) and [Configure `snapshot` replication]({{< relref "setup-guide#configure-snapshot-replication" >}}) for sample configurations.

## Decide which method of replication to use
The load job method is the conventional method of loading data, while the Storage Write API is the latest streaming API by BigQuery. When choosing between the load job method and the Storage Write API, please consider [the advantatages of using the Storage Write API](https://cloud.google.com/bigquery/docs/write-api#advantages).