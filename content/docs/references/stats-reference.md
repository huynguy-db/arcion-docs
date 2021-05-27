---
title: Statistics Configuration
weight: 6
---
# Statistics Configuration


The statistics configuration is used to provide a full statistical history of an ongoing replication. Replicant creates a table named replicate_io_replication_statistics_history to log the full history of inserts/updates/deletes/upserts across all replicant jobs with following details and each successful write on a target table has a log entry in this table in the following format:

- replication_id
- catalog_name
- schema_name
- Table_name
- Snapshot_start_range
- Snapshot_end_range
- Start_time
- End_time
- Insert_count
- Update_count
- Upsert_count
- Delete_count
- Elapsed_time_sec
- replicant_lag [20.10.07.10]
- total_lag [20.10.07.10]

1. **enable**: enable/disable statistics logging

2. **purge-statistics**: Configuration to specify purge rules for the statistics history
    * **enable**: enable purging of replication statistics history.
    * **purge-stats-before-days**: Number of days to keep the stats. E.g. If set to 30 then replicant will keep the history for the last 30 days.

3. **storage[20.10.07.16]**: Storage configuration for statistics.
    * **stats-archive-type**: Type of stats archive. Allowed values are METADATA_DB(stats will be stored in metadata DB), FILE_SYSTEM(stats will be stored in a file), DST_DB(stats will be stored in destination DB).
    * **storage-location**: Directory location where statistics files will be stored. Should be used only when stats-archive-type is FILE_SYSTEM
    * **format**: The format of statistics file. Allowed values are CSV and JSON.
    * **catalog [20.12.04.2]**: Catalog in which statistics will be stored when stats-archive-type is DST_DB.
    * **schema [20.12.04.2]**: Schema in which statistics will be stored when stats-archive-type is DST_DB.
