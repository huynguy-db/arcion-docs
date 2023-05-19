---
pageTitle: How to troubleshoot a Replicant issue 
title: Troubleshooting
description: "Learn to troubleshoot Replicant issues by following a step-by-step process. Learn about Replicant log files and go through two practical examples."
weight: 100
url: docs/references/troubleshooting
---

# Troubleshoot Arcion Replicant

This page describes a general guideline for troubleshooting Replicant when it fails with an error. These steps will help pinpoint the cause of failure and in turn ensure proper debugging and support from our team. 

To submit a support request to the Arcion team, please visit the [Arcion Help Center](https://support.arcion.io).

{{< hint "info" >}}
In the steps below, `$REPLICANT_HOME` represents the location of the `replicant-cli` folder after you've [downloaded and extracted Arcion Self-hosted](/docs/quickstart#ii-download-replicant-and-create-a-home-repository).
{{< /hint >}}

## The log files

There are two log files that can help you troubleshoot an issue:

- `trace.log`
- `error-trace.log`

The `error-trace.log` file only stores `ERROR` messages which may help you identify errors faster. But in most cases, the information in `error-trace.log` won't be enough to determine the root cause of your problem. So we recommend that you rely on the `trace.log` file instead for most of your troubleshooting. In our examples, we'll only be using the `trace.log` file to define and troubleshoot the issue in steps.

### Location
{{< tabs "trace-log-location" >}}
{{< tab "Default location" >}}

The default location of the `trace.log` and `error-trace.log` files is `$REPLICANT_HOME/data/default`. However: 
  - If you run Replicant with the `--id` argument, Replicant creates a directory with the `--id` value you specify and puts the log files inside that directory. In that case, the location would become `$REPLICANT_HOME/data/$ID_VALUE`. For example, if you run Replicant with the following command:
  
    ```sh
    ./bin/replicant full conf/conn/source_database_name.yaml \
    conf/conn/target_database_name.yaml \
    --extractor conf/src/source_database_name.yaml \
    --applier conf/dst/target_database_name.yaml \
    --id repl1 --replace --overwrite
    ```
    The `trace.log` and `error-trace.log` files will be in the directory `$REPLICANT_HOME/data/repl1`.

{{< /tab >}}
{{< tab "Custom location" >}}
The log files could be in a custom location different than the default one. To figure out the location, look for the following parameters in the `general.yaml` file in `$REPLICANT_HOME`:

- `trace-dir`
- `error-trace-dir`

If these parameters are enabled and set, the `trace.log` and `error-trace.log` files would respectively have the following locations:

- `$trace-dir/default`
- `$error-trace-dir/default`

If you run Replicant with the `--id` argument, Replicant creates a directory with the `--id` value you specify and puts the log files inside that directory. In that case, the locations would become `$trace-dir/$ID_VALUE` and `$error-trace-dir/$ID_VALUE` for `trace.log` and `error-trace.log` respectively. For example, if you run Replicant with the following command:

```sh
./bin/replicant full conf/conn/source_database_name.yaml \
conf/conn/target_database_name.yaml \
--extractor conf/src/source_database_name.yaml \
--applier conf/dst/target_database_name.yaml \
--id repl1 --replace --overwrite
```

The `trace.log` and `error-trace.log` files will be in the directories `$trace-dir/repl1` and `$error-trace-dir/repl1` respectively.

{{< /tab >}}
{{< /tabs >}}

### Verbose mode
In some cases, we might run into a problem that's hard to reproduce. For cases like this, verbose logging can help diagnose the problem. However, running in this mode will eventually make the `trace.log` file larger.

You can run Replicant in verbose mode with the `--verbose` argument. In this mode, Replicant will record every processing detail in the `trace.log` file.

You can see the [first example below](#first-example) where we run Replicant in verbose mode.

## Define the issue
After you've [located the `trace.log` file](#the-log-files), search for the following keywords in the file:

- `ERROR`
- `Caused by`
- `Retriable Operation failed`
- `Failed`
- `Exception`
- `WARN`

You can use the following command from your terminal to find all occurrances of the above keywords in `trace.log`:

```sh
grep -iE 'error|caused by|failed|exception|warn' trace.log
```

### Examples

In this section, you'll go through two examples of troubleshooting. You'll use the `trace.log` file to define the issue and then decide on a solution.

### First example

- Let's say you run Replicant using the following command:

  ```sh
  ./bin/replicant full \
  conf/conn/cassandra.yaml \
  conf/conn/yugabytecql.yaml \
  --extractor conf/src/cassandra.yaml \
  --applier conf/dst/yugabytecql.yaml \
  --filter filter/cassandra_filter.yaml \
  --metadata conf/metadata/replicate.yaml \
  --replace --overwrite --verbose
  ```

- Replicant encounters a problem and exits with the following error showing on the Replicant Dashboard:

  ```
  replicant exited with error code: 2
  ```

- Since the command to run Replicant didn't include the `--id` argument, the `trace.log` file will be in the default location `$REPLICANT_HOME/data/default`. 

- Look for the first `ERROR` and `Caused by` in the `trace.log` file.

  
  <pre tabindex="0"><code>2022-09-15 06:13:46.940 DEBUG [main] t.r.ReplicationManager: Initializing...
  2022-09-15 06:13:50.116 DEBUG [pool-5-thread-1] t.r.d.c.CassandraDatabase: SRC CASSANDRA: active  connections: 0
  <mark  style="background-color: #f7d9db; display:">2022-09-15 06:13:51.059 ERROR [main] t.r.Main: Replication error
  tech.replicant.ReplicationException: java.lang.NullPointerException</mark>
          at tech.replicant.db.DBReplicationManager.a(SourceFile:3228)
          at tech.replicant.Main.main(SourceFile:50550)
  Caused by: java.lang.NullPointerException: null
          at java.util.concurrent.ConcurrentHashMap.get(ConcurrentHashMap.java:936)
          at com.datastax.driver.core.Metadata.getKeyspace(Metadata.java:595)
          at tech.replicant.db.cassandradb.CassandraDatabase.a(SourceFile:1244)
          at tech.replicant.db.cassandradb.CassandraDatabase.a(SourceFile:1856)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:1653)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:1319)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:1546)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:2094)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:3175)
          ... 1 common frames omitted</code></pre>

- Decide whether you can fix the issue by yourself, or you need to contact the [Arcion Support Team](https://support.arcion.io). 
  - In this case, the first `ERROR` shows the following exception: 
  
    ```java
    java.lang.NullPointerException: null
    ``` 
    Before the error occurs, the Replicant just starts initializing. So we can assume that the configuration for Source database is not correct somewhere.

### Second example

- Let's say you run Replicant using the following command:

  ```sh
  ./bin/replicant full \
  conf/conn/oracle_src.yaml \
  conf/conn/memsql_dst.yaml \
  --extractor conf/src/oracle.yaml \
  --applier conf/dst/memsql.yaml \
  --filter filter/oracle_filter.yaml \
  --replace --overwrite
  ```

- Replicant encounters a problem and exits with the following error showing on the Replicant Dashboard:

  ```
  replicant exited with error code: 2
  ```

- Since the command to run Replicant didn't include the `--id` argument, the `trace.log` file will be in the default location `$REPLICANT_HOME/data/default`. 

- Look for the first `ERROR` and `Caused by` in the `trace.log` file.
  
  <pre tabindex="0"><code>2022-09-17 01:28:53.827 DEBUG [main] t.r.ReplicationManager: Initializing...
  <mark  style="background-color: #f7d9db; display:">2022-09-17 01:28:53.987 ERROR [main] t.r.Main: Replication error</mark>
  tech.replicant.Main$NonResumableException: REPLICANT.replicate_io_cdc_heartbeat: Table does not exist on source. Please create table using command: CREATE TABLE "REPLICANT"."replicate_io_cdc_heartbeat"("timestamp" NUMBER NOT NULL, PRIMARY KEY("timestamp"))
          at tech.replicant.db.DBReplicationManager.a(SourceFile:1636)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:1301)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:1529)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:2054)
          at tech.replicant.db.DBReplicationManager.a(SourceFile:3114)
          at tech.replicant.Main.main(SourceFile:50550)
  2022-09-17 01:28:53.988 DEBUG [Thread-3] t.r.n.NotificationManager: Shutting down Notification Manager.</code></pre>

- Decide whether you can fix the issue by yourself, or you need to contact the [Arcion Support Team](https://support.arcion.io). 
  - In this case, it's apparent from the first `ERROR` messsage that the issue is related to the heartbeat table:

    ```
    REPLICANT.replicate_io_cdc_heartbeat: Table does not exist on source. Please create table using command...
    ```

    So check if the heartbeat table exists on your Source. If it doesn't, the `ERROR` message also instructs on how you can create it using the following command:

    ```SQL
    CREATE TABLE "REPLICANT"."replicate_io_cdc_heartbeat"("timestamp" NUMBER NOT NULL, PRIMARY KEY("timestamp")) 
    ```