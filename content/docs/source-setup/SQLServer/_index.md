---
pageTitle: Documentation for Microsoft SQL Server source
title: "Microsoft SQL Server"
description: "Set up IBM Db2 as data Source using Arcion Db2 connector. Arcion supports Db2 on Kafka/MQ, Native LUW, and i Series AS/400 platforms."
bookCollapseSection: true
---

# Source Microsoft SQL Server
Arcion's connector can replicate data from your SQL Server database in realtime, using the latest CDC technologies.

## Overview
Arcion supports the following modes of data replication from source SQL Server:

- [`snapshot`]({{< relref "snapshot-replication" >}})
- [`delta-snapshot`]({{< relref "delta-snapshot-replication" >}})
- [`realtime`]({{< relref "realtime-replication" >}})
- [`full`]({{< relref "full-mode-replication" >}})

For more information about different Replicant modes, see [Running Replicant]({{< ref "docs/running-replicant" >}}).
