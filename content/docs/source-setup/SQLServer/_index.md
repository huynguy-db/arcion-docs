---
pageTitle: Documentation for Microsoft SQL Server source
title: "Microsoft SQL Server"
description: "Replicate enterprise-scale data from SQL Server. Use our in-house CDC extractor, or Change Tracking for fast, real-time replication."
bookCollapseSection: true
---

# Source Microsoft SQL Server
Arcion's SQL Server connector can replicate data from your SQL Server database in realtime, using the latest CDC technologies.

## Overview
Arcion supports the following modes of data replication from source SQL Server:

- [`snapshot`]({{< relref "snapshot-replication" >}})
- [`delta-snapshot`]({{< relref "delta-snapshot-replication" >}})
- [`realtime`]({{< relref "realtime-replication" >}})
- [`full`]({{< relref "full-mode-replication" >}})

For more information about running Replicant in different modes, see [Running Replicant]({{< ref "docs/running-replicant" >}}).
