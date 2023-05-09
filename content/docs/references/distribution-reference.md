---
pageTitle: Distributed Replication
title: Distributed Replication
description: "Learn how Arcion Replicant can carry out distributed replication across multiple nodes. We have a hands-on example walking you through the whole process."
weight: 9
---

# Configure Distributed Replication
Arcion Replicant supports distributed multi-node replication. This allows you to divide the workload among multiple machines and make better use of system resources. You can easily configure its behaviour according to your distribution strategy. 

## Overview
Each replicant node in a particular logical replication group can carry out replication of a subset of databases, schemas, or tables. The subset depends on how you defined the [filter configuration]({{< relref "filter-reference" >}}) of individual nodes. In a replication group, one of multiple such nodes is designated as a _leader node_ and the rest as _worker nodes_ for that replication group. The leader node carries out some critical tasks, such as Arcion metadata table management, sending notifications (according to [the notification configuration file]({{< relref "notification-reference" >}})), and computing global replication lag. The worker nodes depend on the leader node for these activities and also provide their respective lag information to the leader node.

## The distribution configuration file
The distribution configuration file defines the logical replication group, its leader, and worker nodes. You can find a sample distribution configuration file inside the `conf/distribution` directory of [your Arcion self-hosted download]({{< relref "../quickstart#ii-download-replicant-and-create-a-home-repository" >}}). It has the following parameters available:

### group
The replication group. Each group can be uniquely identified with an ID. See the example at the end of this section for better understanding.

You can configure each group with the following parameters:

<dl class="dl-indent">
<dt><code>id</code></dt>
<dd> 
A unique ID to identify the logical replication group—for example, <code>test-group</code>.
</dd>

<dt><code>leader</code></dt> 
<dd>
ID of the leader node. This ID must be the same ID that you specify with the <code>--id</code> parameter while running Replicant. For better understanding, see [A two-node example replication](#a-two-node-example-replication).
</dd>

<dt><code>workers</code></dt> 
<dd>
An array of IDs representing all the worker nodes. These IDs must be the same IDs that you specify with the <code>--id</code> parameter while running Replicant. For better understanding, see [A two-node example replication](#a-two-node-example-replication).
</dd>

</dl>

Below is a sample distribution configuration file:

```YAML
group:
  id: test_group
  leader: repl1
  workers: [repl1, repl2]
```

## A two-node example replication
In this section, we provide a step-by-step example of performing a two-node replication. Using the respective configuration files, you can easily follow the same steps of this example for any other pipeline. 

The replication occurs from a source MariaDB system to a target MariaDB system. But instead of operating in a single machine, we distribute the replication between two separate machines N1 and N2.

The source has the following properties:

- It has two databases DB1 and DB2.
- DB1 has four tables: T1, T2, T3, and T4.
- DB2 has two tables: T5 and T6.

Now follow the steps below:

### Download Replicant
[Download and extract Replicant Self-hosted]({{< relref "../quickstart#ii-download-replicant-and-create-a-home-repository" >}}) on the two machines N1 and N2. In the subsequent steps, `REPLICANT_HOME` means the `replicant-cli` directory that you extracted from your Replicant Self-hosted download.

### Prepare the connection configuration files

1. In machine N1, create a new connection configuration file `mariadb_src_repl1.yaml` inside the `REPLICANT_HOME/conf/conn` directory.
 
2. In machine N2, create a new connection configuration file `mariadb_src_repl2.yaml` inside the `REPLICANT_HOME/conf/conn` directory.

For more information about MariaDB's connection configuration files, see [MariaDB Connection Configuration]({{< relref "../sources/source-setup/mariadb#iv-set-up-connection-configuration" >}})

### Prepare the filter files
1. In machine N1, create a new filter file `mariadb_filter_repl1.yaml` to specify databases or tables for replicating from N1. Put the filter file inside the `REPLICANT_HOME/filter` directory of N1.

2. Specify tables DB1.T1, DB1.T2, DB1.T3 in the filer file of N1. For example:

    ```YAML
    allow:
    - catalog: "DB1"
      types: [TABLE]
        allow:
          T1:
          T2:
          T3:
    ```

3. In machine N2, create a new filter file `mariadb_filter_repl2.yaml` to specify databases or tables for replicating from N2. Put the filter file inside the `REPLICANT_HOME/filter` directory of N2.

4. Specify tables DB1.T4, DB1.T5, DB1.T6 in the filer file of N2. For example:

    ```YAML
    allow:
    - catalog: "DB1"
      types: [TABLE]
        allow:
          T4:
          T5:
          T6:
    ```
For more information on how you can write filters, see [Filter Configuration]({{< relref "filter-reference" >}}).

### Run Replicant
After following the preceding steps, you've successfully set up the workload distribution across the two replication nodes N1 and N2. As the final step, you need to run Replicant from the two machines with appropriate command-line arguments and parameters. Below are two sample commands that you can use:

{{< tabs "running-replicant-on-two-nodes" >}}
{{< tab "On node N1" >}}
```BASH
./bin/replicate full \
conf/conn/mariadb_src_repl1.yaml conf/conn/mariadb_dst.yaml \
--extractor conf/src/mariadb.yaml \
--applier conf/dst/mariadb.yaml  \
--notify conf/notification/notification.yaml \
--distribute conf/distribution/distribution.yaml \
--metadata conf/metadata/mariadb.yaml \
--filter filter/mariadb_filter_repl1.yaml \
--map mapper/mariadb_to_mariadb.yaml \
--id repl1 --replace --overwrite
```
{{< /tab >}}

{{< tab "On node N2" >}}
```BASH
./bin/replicate full \
conf/conn/mariadb_src_repl2.yaml conf/conn/mariadb_dst.yaml \
--extractor conf/src/mariadb.yaml \
--applier conf/dst/mariadb.yaml \
--notify conf/notification/notification.yaml \
--distribute conf/distribution/distribution.yaml \
--metadata conf/metadata/mariadb.yaml \
--filter filter/mariadb_filter_repl2.yaml \
--map mapper/mariadb_to_mariadb.yaml \
--id repl2 --replace --overwrite
```
{{< /tab >}}
{{< /tabs >}}

{{< hint "info" >}}
**Tip:** You can stop replication at any time and then resume it using the `--resume` argument. For more information, see [Additional Replicant Commands]({{< relref "../running-replicant#additional-replicant-commands" >}}).
{{< /hint >}}

Notice the `--distribute` parameter with the full path to the distribution configuration file. Also make sure that the `--id` you specify in your Replicant command matches [the `leader` and worker IDs in the distribution configuration file](#group).




