---
pageTitle: Bidirectional conflict resolution setup for PostgreSQL
title: Bidirectional conflict resolution setup for PostgreSQL 
description: "Learn about Arcion's design of conflict resolution strategies for PostgreSQL-to-PostgreSQL replication."
weight: 14
bookHidden: true
bookSearchExclude: true
---

# Bidirectional conflict resolution setup for PostgreSQL-to-PostgreSQL pipeline

For bi-directional replication, both postgresql instances function as source and destination. So it is necessary to have appropriate permissions on both instances. In addition, PostgreSql origin set up is needed to be done on both postgresql nodes. 

The following diagram shows bidirectional replication topology. 

{{< mermaid class="text-center" >}}
flowchart LR
    PN1[(PostgreSQL_node_one)]
    RN1(Replicant_one)
    PN2[(PostgreSQL_node_two)]
    RN2(Replicant_two)
    PN1-->RN1
    RN1-->PN2
    PN2-->RN2
    RN2-->PN1

{{< /mermaid >}}

This section describes PostgreSQL node setup as well as Replicant setup for bidirectional replication.

## PostgreSQL setup

### First node

1. Create database permission for replication user: 
    ```SQL
    ALTER USER replicate CREATEDB;
    ```

2. Create replication permission to replicate user: 
    ```SQL	
    ALTER USER replicate REPLICATION;
    ```

3. Create replication slot: 
    ```SQL
    SELECT 'init' FROM pg_create_logical_replication_slot('io_replicate', 'wal2json');
    ```

4. Create replication origin with other node name: 
    ```SQL
    SELECT pg_replication_origin_create('node2');
    ```

5. Super permission to query replication origin:
    ```SQL
    ALTER USER replicate WITH SUPERUSER;
    ```

### Second node

1. Create database permission for replication user: 
    ```SQL
    ALTER USER replicate CREATEDB;
    ```

2. Create replication permission to replicate user: 
    ```SQL	
    ALTER USER replicate REPLICATION;
    ```

3. Create replication slot: 
    ```SQL
    SELECT 'init' FROM pg_create_logical_replication_slot('io_replicate', 'wal2json');
    ```

4. Create replication origin with other node name: 
    ```SQL
    SELECT pg_replication_origin_create('node1');
    ```

5. Change to superuser for permission to query replication origin:
    ```SQL
    ALTER USER replicate WITH SUPERUSER;
    ```

## Replication configuration
We need to specify replication names and filter node names in the Extractor configuration file for both directions. We use the following two parameters to specify node names and filter node names:

- **`node-name`**. Specifies the name of the node from which data is being extracted.
- **`filter-node-name`**. Specifies the name of the node—records from this node are filtered out.

For better understanding, see the following samples for both nodes.

### First node
```YAML
realtime:
  threads: 4
  fetch-size-rows: 10000
  fetch-duration-per-extractor-slot-s: 3
  _traceDBTasks: true
  node-name: node1
  filter-node-name: node2
```

### Second node
```YAML
realtime:
  threads: 4
  fetch-size-rows: 10000
  fetch-duration-per-extractor-slot-s: 3
  _traceDBTasks: true
  node-name: node2
  filter-node-name: node1
```