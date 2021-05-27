---
title: Distribution Configuration
weight: 7
---
# Distribution Configuration

Blitzz replicant supports distributed multi-node replication which can be configured using this configuration. Each replicant node in a particular logical replication group can carry out replication of a subset of databases/schemas/tables as configured in the filter configuration of individual nodes. One of multiple such nodes in a given replication group needs to be designated as a leader node and the rest as worker nodes for that replication group. The leader nodes carries out some critical tasks such as Blitzz metadata table management, sending notifications ( as configured using notification config), computing global replication lag, etc. The worker nodes depend on leader node for these activities and also feed leader node about their respective lag information.

1. **group**:
    * **id**: Name of the logical replication group
    * **leader**: Name of the replicant node acting as leader
    * **workers**: Names of all the slave replicant nodes
