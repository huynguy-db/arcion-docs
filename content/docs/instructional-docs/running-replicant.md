---
title: Running Replicant
weight: 6
---
# Running Replicant

Replicant must be run in one of three replication modes: full, snapshot, and realtime. When starting Replicant, you must specify your desired mode of replication using the COMMAND argument. In addition to the multiple different modes, Replicant can also be run with additional settings/options. All of the modes, options, and commands to run Replicant are explained below.


## Replicant Full Mode

**With Basic Configurations**

Enter the following command to run Replicant in full mode with only minimal configurations:
```BASH
./bin/replicant full conf/conn/source_database_name_src.yaml \
conf/conn/target_database_name.yaml \
--extractor conf/src/source_database_name.yaml \
--applier conf/dst/target_database_name.yaml  \
--filter filter/source_database_name_filter.yaml \
--id repl1 --replace --overwrite
```
**With Advanced Configurations**

Enter the following command to run Replicant in full mode with advanced configurations:
```BASH
./bin/replicant full conf/conn/source_database_name.yaml \
conf/conn/target_database_name.yaml \
--extractor conf/src/source_database_name.yaml \
--applier conf/dst/target_database_name.yaml \
--notify conf/notification/notification.yaml \
–statistics conf/statistics/statistics.yaml \
--metadata conf/metadata/database_name.yaml \
--filter filter/source_database_name_filter.yaml \
--id repl1 --replace --overwrite
```  

In full mode, Replicant transfers all existing data from the source to the target database setup with a one-time data snapshot. Replicant first creates the destination schemas after that is complete, Replicant transfers the existing data from the source to the destination  Additionally, Replicant will continue synchronizing the destination with the source, even after the snapshot is completed.

As soon as the snapshot data movement is done, Replicant will seamlessly transition from snapshot migration to continuous replication. Once the smooth transition is ensured, Replicant will start listening for incoming changes in the source database using log-based CDC.

Finally, Replicant in full mode can either be run with only the bare minimum required configurations which are outlined in the `source and target database setup instructions`, or it can be run with the advanced configurations, outlined in `additional replicant configurations` setup instructions.

**Note**: Replicant shows various useful replication statistics in the dashboard while the replication is in progress.


## Replicant Snapshot Mode

Use the following command to run Replicant in snapshot mode:
```Bash
./bin/replicant snapshot \
 conf/conn/source_database_name_src.yaml \
 conf/conn/target_database_name_dst.yaml \
 --extractor conf/src/source_database_name.yaml \
 --applier conf/dst/target_database_name.yaml  \
 --filter filter/source_database_name_filter.yaml \
 --id repl2 --replace –overwrite
```

In snapshot mode, Replicant first creates the destination schemas, just as in full mode. Once the schemas are created, Replicant captures all the existing data from the source and transfers it to the destination, also known as Replicant's data snapshot. Once all data has been moved to the destination, a summary file will be generated and sent in an email notification if you have configured Replicant to do so. After finishing the snapshot, Replicant will immediately shutdown.


## Replicant Realtime Mode

Use the following command to run Replicant in realtime mode:
```Bash
./bin/replicant realtime conf/conn/source_database_name_src.yaml \
conf/conn/target_database_name_dst.yaml \
--extractor conf/src/source_database_name.yaml \
--applier conf/dst/target_database_name.yaml  \
--filter filter/  source_database_name_filter.yaml \
--id repl2 --replace –overwrite
```

In real-time mode, replicant first creates the destination schemas if they are not already present. If the destination schemas are present, Replicant  appends to the existing tables. In real-time mode Replicant starts replicating real-time operations obtained from log-based CDC. By default, real-time mode starts replicating from latest log position, but a custom start position can be specified by the user in real-time section of extractor configuration file.

## Replicant Init Mode

Use the following command to run Replicant in init mode:
```BASH
./bin/replicant init conf/conn/source_database_name_src.yaml \
conf/conn/target_database_name_dst.yaml
```

In init mode, Replicant will retrieve the existing source schemas and create equivalent schemas on the destination.


## Fetch-Schemas

Replicant can fetch schemas to analyze the current contents of a source or destination.

To view the current contents, start Replicant with:
```BASH
./bin/replicant fetch-schemas <conn_config_file>
```
Doing so will generate a file named schemas.yaml in the current directory, containing descriptions of all tables.

By, providing an option --output-file <output_path> you can change the default destination for the schemas file. You can also fetch the Filter configuration using  `--filter <filter_file>`  
  * **Note** : When a filter file is fetched only whitelisted content is considered

Once the schema is fetched, it is possible to modify the file to specify custom selectSql expressions. The modified file can then be specified to replicant through `--src-schemas switch` to Replicant.

## Infer-Schemas

Inferring schemas is the process of fetching a schema from the source database and conforming it to the destination database.

To infer schemas, user should start replicant with:
```BASH
./bin/replicant infer-schemas conf/conn/database_name> <dst_type>
```
For example, for the command  `./bin/replicant infer-schemas conf/conn/oracle_src.yaml ORACLE `, Replicant will fetch schemas from the source Oracle database and modify them so that they conform to the target Oracle database.

Before transferring the database content, it is recommended to examine the schemas on the destination and tailor them to the your specific needs by inferring schemas. Such modified inferred schemas file can be supplied to replicant through `--dst-schemas switch`.

## Write Modes Explained

In case of a collision at the destination system, Replicant will by default warn the user and exit with an error in order to preserve the existing data at the destination. If a collision is expected to happen for some data, the error can be resolved by providing the appropriate destination schema's file.

As an alternative to providing a destination schemas file, you can specify a golbal rule while starting Replicant by providing one of the following write modes ``[--append-existing|--replace-existing|--truncate-existing]``.

When using `--append-existing`, the data from the source will be appended to the existing data at the destination. Alternatively, you can replace  the destination data by the source data by using `--replace-existing`.

  * **Note**: If the destination system is a database `--truncate-existing` can be used instead of `--replace-existing` to preserve destination table schemas.

Additionally, while using `--truncate-existing` or `--replace-existing`, a you can give a `--lazy-init` flag. When you do so, the existing data will be replaced at the last moment. By default, the existing data will be deleted during Replicant initialization.

Replicant has another write mode, `--synchronize-deletes`,  which is relevant only for delta-snapshot mode (incremental replication) of operation. When replicant is started in delta-snapshot mode and you specify the `--synchronize-deletes` write mode, Replicant deletes all rows from a target table which are not present in the respective source table. Once the row synchronization is done, Replicant shuts down. Replicant can be started again in `resume mode` by taking off this write mode, after which Replicant will resume the incremental replication that it was performing.

## Additional Replicant Commands

**Command**
* You can stop replication with the CTRL C signal.
* If you stop replication for any reason, you can restart the job exactly where Replicant had stopped by replacing the `--overwrite` argument `by --resume` in the replicant command:
```BASH
./bin/replicant full conf/conn/source_database_name_src.yaml \
conf/conn/target_database_name_dst.yaml \
--extractor conf/src/source_database_name.yaml \
--applier conf/dst/target_database_name.yaml \
--filter filter/source_database_name_filter.yaml \
--id rep11 --replace --resume
```

## Various Replication Options Explanation

Replicant has four replication options: overwrite, resume, terminate-post-snapshot, and continue-inconsistent-post-failure.
  * **overwrite**: When --overwrite is specified in the command to run Replicant, the existing replication with the specified --id is overwritten completely. The option makes replicant:
    -	Override the existing replicated tables on target (if any) honoring the specified WriteMode (REPLACE/TRUNCATE/APPEND)
    -	Overwrite the directory with name %id% created under data directory
    -	Overwrites all internal metadata tables created by replicant on the metadata storage  
  * **resume**: When --resume is specified in the command to run Replicant, the existing replication with the specified --id is resumed. Note that you can either specify the overwrite option or the resume option, not both.
  * **terminate-post-snapshot**: When --terminate-post-snapshot is specified for a replicant job in full mode, Replicant will start in full mode (existing + realtime data replication) and once the snapshot (transfer of existing data) is complete, Replicant will terminate the job. You can resume the replication later on with the --resume option. Upon resumption of the job, Replicant will immediately start realtime replication as previously existing data in the source database will have already been replicated in the data snapshot.
  * **continue-inconsistent-post-failure**: When this option is specified, replicant logs a failed transaction in a failed_txn table and continues replication without stopping. Note that using this option may introduce inconsistencies in the destination database.

## Encrypting Replicant 

If necessary, you may encrypt your configuration files that Replicant will be using to run.  

Once you have finished editing a particular configuration file with all the necessary values specified, run the following command to encrypt that configuration file:
```BASH
./bin/replicant encrypt-config path/of/configuration/file
```

To encrypt all the configuration files in a given directory, run:
```BASH
./bin/replicant encrypt-config path/of/directory
```
**Note**: There is no command to decrypt an encrypted configuration file. This is to avoid any unwanted attempts of decryption of sensitive information which is present in the configuration files. If you needs to modify a configuration file that you have already encrypted, you must bring the original plain text configuration file from your own backup storage, modify it, and encrypt it again using encrypt-config command.
