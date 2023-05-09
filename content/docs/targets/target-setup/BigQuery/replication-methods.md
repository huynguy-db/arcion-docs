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
[The conventional load job method](https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-csv) is the default method of loading data into BigQuery partitions and tables. See the sample configurations for [snapshot]({{< relref "setup-guide#sample-configuration-with-load-job-method" >}}) and [realtime]({{< relref "setup-guide#sample-configuration-with-load-job-method-1" >}}) to understand how to use the load job method.

## Load data using the Storage Write API
This method of replication uses the [BigQuery Storage Write API](https://cloud.google.com/bigquery/docs/write-api-streaming) to stream data into BigQuery. 

### Requirements
- Make sure you have the necessary `bigquery.tables.updateData` permissions. For more information, see [Required permissions](https://cloud.google.com/bigquery/docs/write-api#required_permissions).
- Provide your credentials by setting the [`GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the JSON file that contains your service account key](https://cloud.google.com/docs/authentication/provide-credentials-adc#wlif-key). Setting this variable authenticates you so that Replicant can use the Storage Write API.

### Configuration
You can use the Storage Write API method by setting the `use-write-storage-api` parameter to `true` under the `realtime` or `snapshot` section of the Applier configuration file. See the sample configurations for [snapshot]({{< relref "setup-guide#sample-configuration-with-storage-write-api" >}}) and [realtime]({{< relref "setup-guide#sample-configuration-with-storage-write-api-1" >}}) to understand how to use the Storage Write API.

## Decide which method of replication to use
The load job method is the conventional method of loading data, while the Storage Write API is the latest streaming API by BigQuery. When choosing between the load job method and the Storage Write API, please consider [the advantatages of using the Storage Write API](https://cloud.google.com/bigquery/docs/write-api#advantages).