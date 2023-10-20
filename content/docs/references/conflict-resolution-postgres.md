---
pageTitle: Bidirectional conflict resolution setup for PostgreSQL
title: Bidirectional conflict resolution setup for PostgreSQL 
description: "Learn about Arcion's design of conflict resolution strategies for PostgreSQL-to-PostgreSQL replication."
weight: 14
bookHidden: true
bookSearchExclude: true
---

# Bidirectional conflict resolution setup for PostgreSQL-to-PostgreSQL pipeline
For bidirectional replication, both PostgreSQL instances function as source and destination. Therefore, both instances must possess the appropriate permissions. In addition, you must set up [replication origin](https://www.postgresql.org/docs/current/replication-origins.html) in both PostgreSQL nodes. 

The following diagram shows bidirectional replication topology:

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

The following sections describe how to set up PostgreSQL nodes, PostgreSQL tables, and Replicant for bidirectional replication.

## Set up PostgreSQL

### First node

1. Provide superuser privilege to query replication origin:
    ```SQL
    ALTER USER replicate WITH SUPERUSER;
    ```

2. Create replication slot: 
    ```SQL
    SELECT 'init' FROM pg_create_logical_replication_slot('io_replicate', 'wal2json');
    ```

3. Create replication origin with the other node name: 
    ```SQL
    SELECT pg_replication_origin_create('node2');
    ```

### Second node
1. Provide superuser privilege for permission to query replication origin:
    ```SQL
    ALTER USER replicate WITH SUPERUSER;
    ```

2. Create replication slot: 
    ```SQL
    SELECT 'init' FROM pg_create_logical_replication_slot('io_replicate', 'wal2json');
    ```

3. Create replication origin with the other node name: 
    ```SQL
    SELECT pg_replication_origin_create('node1');
    ```

### PostgreSQL tables
Each table in bidirectional replication must possess a timestamp column. This column denotes insert and update timestamps of the row. Replicant uses this timestamp column to detect and resolve conflicts during replication. The applications must take responsibility to update the timpestamp column when status of the row changes. 

You must also make sure that clocks in both PostgreSQL nodes stay in sync.  

## Configure replication
For both directions, you must specify replication names and filter node names in the `realtime` section of the Extractor configuration file. Use the following two parameters to specify and filter node names:

`node-name`
: Specifies the node name from which Replicant extracts data.

`filter-node-name`
: Specifies the node name from which Replicant filters out records.

For better understanding, see the following samples for both nodes:

### First node
```YAML {hl_lines=["6-7"]}
realtime:
  threads: 4
  fetch-size-rows: 10000
  fetch-duration-per-extractor-slot-s: 3
  _traceDBTasks: true
  node-name: node1
  filter-node-name: node2
```

### Second node
```YAML {hl_lines=["6-7"]}
realtime:
  threads: 4
  fetch-size-rows: 10000
  fetch-duration-per-extractor-slot-s: 3
  _traceDBTasks: true
  node-name: node2
  filter-node-name: node1
```