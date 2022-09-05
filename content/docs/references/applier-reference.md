---
title: Applier Configuration
weight: 3
---
# Applier Configuration

The Applier configuration file contains all the parameters that Replicant uses while loading data on to the target database. While it is not necessary to modify most of the  parameters, they can be adjusted to optimize the Applier job as necessary. The sample Applier configuration file is located in the Replicant release download folder. The path to the sample Applier configuration file in the release folder is: `conf/dst/target_database_name.yaml` The sample file is broken up into two sections- snapshot and realtime. The Applier configurations for the initial data capture must be specified under `snapshot` and the configurations for realtime replication must be specified under `realtime`

## Snapshot Mode

Replicant can run on the default Applier configurations for the data snapshot. Thus, changing the snapshot Applier configurations is not required. However, depending on the replication job, adjusting or specifying the parameters explained below may help optimize Replicant.

The following configuration parameters are available for snapshot mode:

  1. `threads`: Maximum number of threads Replicant should use for writing to target.

  2. `batch-size-rows`: This configuration determines the size of a batch. We recommend that you both refer to the value provided in the sample extractor configuration file of the Arcion Replicant release folder and also experiment a bit on your deployment to find the appropriate value here. For example, a typical size of 10000 offers good performance for MongoDB, but you should tune it depending on your use case and target system.

  3. `txn-size-rows`: This determines the unit of the Applier side job size. A transaction consists of multiple batches.

  4. `bulk-load`: Arcion can leverage the underlying support of a FILE/PIPE based bulk loading into the target system.

      * `enable`: To enable/disable bulk loading.
      * `type`: Type of bulk loading. Either FILE or PIPE based.
      * `serialize`: true/false. Enabling this will result in the files generated to be applied in a serial/parallel fashion
      * `native-load-configs`*[v20.09.14.3]*: User provided LOAD config string. These will be appended to the target specific LOAD SQL command.
      * `enable-archive`*[v21.09.17.1]*: Relevant when data files of last iterations need to be archived on disk. This config can be used when bulk load is enabled and type is FILE.
      * `archive-dir`*[v21.09.17.1]*: Provide directory path for files to be archived else default project data path will be used if enable-archive is true.
      * `compression-type` *[v21.09.17.1]*: Allowed values are GZIP. This config allows users to specify file compression(currently only GZIP is supported) to compress the CSV files to be loaded onto target.


  5. `handle-failed-opers`: `true` or `false`. When this is set to true, Replicant will handle any failed operations in which Replicant is unable to load files on the target by writing to a version table or a CSV file.

  6. `use-quoted-identifiers`: `true` or `false`. Setting this parameter to false makes Replicant avoid quoting catalog, schema, table, view, and column names while creating and accessing them.

  7. `skip-tables-on-failures`: `true` or `false`. Enabling this parameter will force Replicant to skip a table/collection that Replicant is unable to load on to the target even after multiple attempts. Instead, Replicant will continue replicating other tables.

  8. `deferred-delete`: `true` or `false`. When enabled, Replicant will create an additional column on each target table to mark the deletes instead of actually deleting records from the tables.
    {{< hint "info" >}}This parameter is relevant only for incremental replication. It's irrelevant for snapshot or CDC-based full replication. {{< /hint >}}

  9. `schema-dictionary`: This parameter controls dumping of schemas. The following values are allowed:

      - `NONE`: Default value. This option allows dumping the schema into a dedicated schema dictionary table on the target like  `replicate_io_replication_schema`.
      - `SCHEMA-DUMP`: With this, Replicant dumps the exact schema as fetched from the source database and mapped to the target for each table being replicated, in a yaml format.
      - `POJO`: With this, Replicant dumps the exact Java class definition per topic that should be used to deserialize all the topic messages into POJOs.

      {{< hint "info" >}}This is not supported for selective targets only.{{< /hint >}}

  10. `per-table-config`: This parameter allows you to specify various properties for specific tables on the target database.

      - `table-type`: Type of table (e.g. `REFERENCE` in case of SingleStore).
      - `table-store`: Table store to use: `ROW`/`COLUMN` etc.
      - `sort-key`: Sort key to be created for a table (if applicable for target).
      - `shard-key`: Shard key to be created for a target table.
      - `rowstore-key` *[v21.06.14.9]*: Rowstore-key/index to be created for a table(if applicable for target). 
      - `bulk-load`: Replicant can leverage underlying support of FILE/PIPE based bulk loading into the target system.
        - `enable`: To enable/disable bulk loading.
        - `type`: Type of bulk loading. Either `FILE` or `PIPE` based. Alternatively, `AUTO` can be specified to let Replicant choose the best mode.
        - `serialize`: `true` or `false`. Controls whether files generated should be applied in serial/parallel fashion.
        - `native-load-configs`[20.09.14.3]: User-provided LOAD config string. These will be appended to the target specific `LOAD SQL` command.
        `enable-archive` *[v21.09.17.1]*: Relevant when data files of last iterations need to be archived on disk. This parameter can be used when bulk load is enabled and type is `FILE`.
        - `archive-dir` *[v21.09.17.1]*: In order to provide directory path for files to be archived. If not specified, default project data path will be used if `enable-archive` is `true`.

  11. `user-role`:
      * `init-user-role`: `true` or `false`. Create user/role on the target database. By default, this is `true` for homogeneous pipelines, `false` otherwise.
      * `default-password`: Specify default password.
      * `ldap-auth-type`: Only applicable for MongoDB Atlas as target.
      * `x509-type`: Only applicable for MongoDB Atlas as target.

  12. `init-indexes`: `true` or `false`. Enabling this allows Replicant to create indexes on target database. Default value is `true`.

  13. `init-indexes-post-snapshot`: `true` or `false`. Enabling this allows Replicant to create indexes after the snapshot is complete. If disabled, indexes are created prior to the snapshot. Default value is `true`.

  14. `init-constraint-post-snapshot`: Enabling this allows Replicant to create constraints and indexes after the snapshot is complete.

  1. `denormalize` *[v21.04.06.1]*:
      * `enable`: `true` or `false`. Enable or disable de-normalization. This parameter is only supported for MongoDB as a source. The de-normalized JSON query must be specified via the `--src-queries` argument for the source relational database.


## Realtime Mode

While not required, changing certain parameters may improve real time replication performance depending on the use case. The following configuration parameters are available for realtime mode:

  1. `threads`: Maximum number of threads Replicant should use for writing to target.

  2. `batch-size-rows`: In realtime operations, Insert/Update/Deletes are batched together and applied to target. This parameter determines the size of the batch. For example, typical size of 10000 offers good performance for MongoDB, but you should tune it depending on your use case and target system.

  3. `txn-size-rows`: Determines the unit of Applier side job size. A transaction consists of multiple batches.

  4. `handle-failed-opers`: `true` or `false`. When this is set to true, Replicant will handle any failed operations in which Replicant is unable to load files on the target by writing to a version table or a CSV file.

  5. `use-quoted-identifiers`: `true` or `false`. Setting this configuration to false makes Replicant avoid quoting catalog, schema, table, view, and column names while creating and accessing them. This config (if set) must have the same value in both snapshot and real-time sections to work correctly.

  6. `before-image-format`: This indicates which columns should be included in the WHERE part of the UPDATE and DELETE operations. Allowed values are:

     - `KEY` (Default value)
     - `ALL`

  7. `after-image-format`: This indicates which columns should be included in the SET part of the UPDATE operation. Allowed values are:

      - `UPDATED` (Default value)
      - `ALL`

  8. `retry-transactions` *[v20.06.01.2]*: `true` or `false`. With this set to `true`, each real-time transaction is retried on failures. The number of retries and wait duration between each retry is driven by the connection configuration of the destination system. This option is available for systems which support ACID transactions.

  9. `retry-failed-txn-idempotentl` *[v20.09.14.8]*: With this set and `retry-transactions` set to `true`, each real-time transaction is retried idempotently on failure.

  10. `replay-consistency` *[v20.09.14.1]*: Indicates the type of transactional consistency. Allowed values are:

      - `GLOBAL`
      - `EVENTUAL` (Default value)
  
      If set to `GLOBAL`, realtime replication is performed with global transactional consistency. If set to `EVENTUAL`, realtime replication is performed with eventual consistency.

  11. `skip-upto-cursors` *[v20.09.14.1]*: This parameter is only applicable if `replay-consitency` is set to `GLOBAL`. Here, you can specify a list of cursor positions up to which replication must be skipped. If the operations of a failed transaction cannot be persisted in the `failed_txn` table in metadata storage (see [`--skip-failed-txn` in Various Replication Options Explanation](/docs/running-replicant/#various-replication-options-explanation) for more details), the operations are logged in a text file. The text file is located in the following path:

      ```sh
      <Replicant_home>/data/<Replicant ID>/bad_rows replicate_io_failed_txn_log_<tableID/extractorID>. 
      ```
    
      The user gets notified of this file location through notification mails and trace logs. The file contains the failed operations as well as the `skip-upto-cursor`(s) configuration. After resolving the failure, you can use this parameter to skip over the failed transactions.

  12. `replay-shard-key-update-as-delete-insert` *[v20.12.04.7]*: This parameter allows replay of update operation that changes values of shard key columns as delete + inserts. Allowed values are:

      - `ON`
      - `OFF`

      This feature is `ON` by default for SingleStore as a target.

  13. `per-table-config`: This configuration allows you to specify various properties for specific target tables.

      - `skip-upto-cursor` *[v20.09.14.1]*: Similar to `skip-upto-cursors`. Use this to specify a cursor upto which replication must be skipped for a given table.

  14. `skip-tables-on-failures`: This configuration when set makes Replicant skip a table/collection for which Replicant is running into any issues (even with repeated attempts) and continue replicating other tables by skipping the failing one.
