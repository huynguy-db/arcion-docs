---
title: Applier Configuration
weight: 3
---
# Applier Configuration

The applier configuration file contains all the parameters that Replicant uses while loading data on to the target database. While it is not necessary to modify most of the  parameters, they can be adjusted to optimize the applier job as necessary. The sample applier configuration file is located in the Replicant release download folder. The path to the sample applier configuration file in the release folder is: `conf/dst/source_database_name.yaml` The sample file is broken up into two sections- snapshot and realtime. The applier configurations for the initial data capture must be specified under `snapshot` and the configurations for realtime replication must be specified under `realtime`

## Snapshot Mode

Replicant can run on the default applier configurations for the data snapshot. Thus, changing the snapshot applier configurations is not required. However, depending on the replication job, adjusting or specifying the parameters explained below may help optimize Replicant.

**snapshot**:
  1. **threads**: Maximum number of threads replicant should use for writing to target

  2. **batch-size-rows**: This configuration determines the size of a batch. We recommend that you both refer to the value provided in the sample extractor configuration file of the Blitzz Replicant release folder and also experiment a bit on your deployment to find the appropriate value here (e.g. Typical size of 10000 offers good performance for MongoDB, but it should be tuned for the use case and target system).

  3. **txn-size-rows**: This determines the unit of the applier side job size. A transaction consists of multiple batches.

  4. **bulk-load**: Blitzz can leverage the underlying support of a FILE/PIPE based bulk loading into the target system.
      * **enable**: To enable/disable bulk loading.
      * **type**: Type of bulk loading. Either FILE or PIPE based.
      * **serialize**: true/false. Enabling this will result in the files generated to be applied in a serial/parallel fashion
      * **native-load-configs[20.09.14.3]**: User provided LOAD config string. These will be appended to the target specific LOAD SQL command.

  5. **handle-failed-opers**: true/false. When this is set to true, Replicant will handle any failed operations in which Replicant is unable to load files on the target by writing to a version table (Refer verification. section for more details about version tables) or a CSV file.

  6. **use-quoted-identifiers**: true/false. Setting this configuration to false makes replicant avoid quoting catalog, schema, table, view, and column names while creating and accessing them.

  7. **skip-tables-on-failures**: true/false. Enabling this configuration forces replicant to skip a table/collection that Replicant is unable to load on to the target even after multiple attempts and continue replicating other tables.

  8. **deferred-delete**: true/false. This configuration is relevant only for incremental replication (and not to snapshot or cdc based full replication). When enabled, Replicant will create an additional column on each target target table to mark the deletes instead of actually deleting records from the tables.

  9. **Schema-dictionary**: Allowed values: POJO | SCHEMA-DUMP | NONE (default is NONE)
    **NONE**: This option allows dumping the schema into a dedicated schema dictionary table on the target: blitzz_io_replication_schema.
    **SCHEMA-DUMP**: With this, replicant dumps the exact schema as fetched from the source database and mapped to the target for each table being replicated, in a yaml format.
    **POJO**: With this, replicant dumps the exact Java class definition per topic that should be used to deserialize all the topic messages into POJOs

   **Note**: This is not supported for selective targets only.

  10. **Per-table-config**: This configuration allows you to specify various properties for specific tables on the target database.
      **table-type**: Type of table (e.g. REFERENCE in case of MemSQL)
      **table-store**: Table store to use: ROW/COLUMN etc.
      **sort-key**: Sort key to be created for a table (if applicable for target)
      **Shard-key**: Shard key to be created for a target table

  11. **user-role**:
      * **init-user-role**: true/false. Create user/role on the target database (by default this is true for homogeneous pipelines, false otherwise)
      * **default-password**: Specify default password
      * **Ldap-auth-type**: Only applicable for MongoDB Atlas as target
      * **x509-type**: Only applicable for MongoDB Atlas as target

  12. **init-indexes**: true/false. Enabling this allows Replicant to create indexes on targetDB (By default this is true).

  13. **init-indexes-post-snapshot**: true/false. Enabling this allows Replicant to create indexes after the snapshot is complete. If disabled, indexes are created prior to the snapshot (by default this is true).

  14. **init-constraint-post-snapshot**: Enabling this allows Replicant to  create constraints and indexes after the snapshot is complete.

  1. **Denormalize[21.04.06.1]**:
      * **Enable**: true/false Enable or disable denormalization. This parameter is only supported for Mongo Database as a source. The denormalized json query must be specified in the --src-queries for the source relational database.




## Realtime Mode:

While not required, changing certain parameters may improve real time replication performance depending on the use case. Each configuration that can be altered is explained below:

**realtime**
  1. **threads**: Maximum number of threads replicant should use for writing to target

  2. **batch-size-rows**: In realtime operations: Insert/Update/Deletes are batched
  together and applied to target. This determines the size of the batch. (e.g. Typical size of 10000 offers good performance for MongoDB, but it should be tuned for the use case and target type)

  3. **txn-size-rows**: This determines the unit of applier side job size. A transaction consists of multiple batches.

  4. **handle-failed-opers**: true/false. When this is set to true, Replicant will handle any failed operations in which Replicant is unable to load files on the target by writing to a version table or a CSV file.

  5. **use-quoted-identifiers**: true/false. Setting this configuration to false makes replicant avoid quoting catalog, schema, table, view, and column names while creating and accessing them. This config (if set) must have the same value in both snapshot and real-time sections to work correctly

  6. **before-image-format**: KEY/ALL (default is KEY). This indicates which columns should be included in the WHERE part of the UPDATE and DELETE operations

  7. **after-image-format**: UPDATED/ALL (default is UPDATED). This indicates which columns should be included in the SET part of the UPDATE operation.

  8. **retry-transactions[20.06.01.2]**: true/false. With this set to true, each real-time transaction is retried on failures. The number of retries and wait duration between each retry is driven by the connection configuration of the destination system. This option is available for systems which support ACID transactions.

  9. **retry-failed-txn-idempotently[20.09.14.8]**: With this set and retry-transactions set to ‘true’, each real-time transaction is retried idempotently on failure.

  10. **replay-consistency[20.09.14.1]**: GLOBAL/EVENTUAL (default is EVENTUAL:). If set to GLOBAL, realtime replication is performed with global transactional consistency. If set to EVENTUAL, realtime replication is performed with eventual consistency.

  11. **skip-upto-cursors[20.09.14.1]**: This configuration is only applicable is replay-consitency is set to GLOBAL. Here, you can specify a list of cursor positions up to which replication must be skipped. If the operations of a failed transaction cannot be persisted in the failed_txn table in metadata storage (Refer SkipFailedTransaction for more details), the operations are logged in a text file <replicant_home>/data/<replicant ID>/bad_rows blitzz_io_failed_txn_log_<tableID/extractorID>. The location of the file is notified to the user through notification mails and trace logs. The file contains the failed operations as well as the skip-upto-cursor(s) configuration. After resolving the failure you can use this configuration to skip over the failed transactions.

  12. **replay-shard-key-update-as-delete-insert[20.12.04.7]**: ON/OFF. This configuration allows replay of update operation that changes values of shard key columns as delete + inserts. This feature is ON by default for MEMSQL as a target

  13. **per-table-config**: This configuration allows you to specify various properties for specific target tables
    * **skip-upto-cursor[20.09.14.1]**: Similar to skip-upto-cursors, use this to specify a cursor upto which replication must be skipped for a given table.
