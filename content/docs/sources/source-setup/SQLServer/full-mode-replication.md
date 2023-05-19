---
pageTitle: Documentation for full mode replication from SQL Server
title: "Full mode replication"
description: ""
bookHidden: false
weight: 3
url: docs/source-setup/sqlserver/full-mode-replication
---

# Full mode replication from SQL Server
Replicant offers a third mode of replication callled `full` mode for replicating data from SQL Server. It's a combination of [snapshot]({{< relref "snapshot-replication" >}}) and [realtime]({{< relref "realtime-replication" >}}) replcation.

## Overview
In full mode replication, Replicant transfers all existing data from the source to the target database with a one-time data snapshot. The process in general is as follows: 

- Replicant first creates the schemas in the target database. 
- After creating the target schemas, Replicant transfers the data from the source to the target. This step is the _one-time snapshot_ phase. 
- As soon as Replicant completes the _one-time snapshot_ phase, Replicant starts listening for incoming changes in the source database using log-based CDC. This allows Replicant to seamlessly transition to continuous and real-time replication.

You can enable full mode replication by running Replicant with the `full` option. For more information, see [Replicant full mode]({{< ref "docs/running-replicant#replicant-full-mode" >}}).

To set up full mode replication, follow the instructions in [Real-time replication]({{< relref "realtime-replication" >}}).