---
title: Extractor Configuration
weight: 2
---

# Extractor Configuration

The extractor configuration file contains all the parameters that Replicant uses to extraction data from the source database. While it is not necessary to modify most of the  parameters, they can be adjusted to optimize the extraction job as necessary. The sample extractor configuration file is located in the Replicant release download folder. The path to the sample extraction configuration file in the release folder is: `conf/src/source_database_name.yaml` The sample file is broken up into two sections- snapshot and realtime. The extraction configurations for the initial data capture must be specified under `snapshot` and the configurations for realtime replication must be specified under `realtime`

## Snapshot Mode

Replicant can run on the default extractor configurations for the data snapshot.Thus, changing the snapshot extraction configurations is not required. However, depending on the replication job, adjusting or specifying the parameters explained below may help optimize Replicant.

snapshot
  1. **threads**: Maximum number of threads replicant will use for data extraction from source

  2. fetch-size-rows: Maximum number of records/documents fetched by replicant at once from the source system.

  3. lock: This is the option to perform object locking on the source database. By default, object locking is disabled.
    i. enable: false #"false" is the default
    ii. scope: table #"table" is the default
    iii. force: false #"false" is the default
    iv. timeout-sec: 5 #"5" is the default
  * Note: This is parameter is irrelevant for source databases which do not support object locking such as Mongo and Cassandra.

  4. min-job-size-rows: Replicant chunks tables/collections into multiple jobs for replication. This configuration specifies the minimum size for each such job. The  minimum size specified has a positive correlation with the memory footprint of Replicant.

    max-jobs-per-chunk: The maximum number of jobs in a chunk.  

    split-key: Replicant uses this configuration to split the table/collection into multiple jobs in order to perform parallel extraction. The specified split key column must be of numeric or timestamp type. Splitting the work for source data extraction using the split-key provided here significantly optimizes Replicant if:
          i. The split-key has uniform data distribution in the table (and there is minimal data skew in the values of split-key)  
          ii. An index is present on split-key on the source system

    split-method: Replicant supports two split methods.
        RANGE: Replicant splits the work in a range-based manner by uniformly distributing the split-key value ranges between the MIN and MAX values.
        MODULO: The split key must be of numeric type for this split-method. Each extraction job is assigned a JobID of 0 to JOB-CNT -1. Each job then pulls data from the source where MOD(split-key, JOB-CNT) = JobID.

    extraction-method: Replicant supports two extraction methods. QUERY and TPT ((Default method is QUERY). TPT stands for Teradata Parallel Transporter utility (TPT) and is currently only supported for Teradata as a source.

    tpt-num-files-per-job:  Only applicable when extraction-method is TPT. This parameter indicates how many CSV files should be exported by each TPT job (default value is 16).

    fetch-PK: Option to fetch (and replicate) primary key constraints for tables. (By default this is true).

    fetch-UK: Option to fetch (and replicate) primary key constraints for tables. (By default this is true).

    fetch-FK: Option to fetch (and replicate) unique key constraints for tables. (By default this is true)

    fetch-Indexes: Option to fetch (and replicate) indexes for tables. ( By default this is false).

    fetch-user-roles: Option to fetch (and replicate) user/roles. (The default is true for homogeneous pipelines, but false otherwise)

    normalize: Only supported for Mongo Database as a source. This parameter is used to configure the normalization of data.
      enable: true/false (The default is false)
      de-duplicate: true/false (Default is false) To de-duplicate data during normalization
      extract-upto-depth The depth upto which the mongoDB document should be extracted (Default is INT_MAX).

    fetch-schemas-from-system-tables: Option to use system tables to fetch schema information. By default, the value is true, and this option is enabled. If disabled, schemas need to be provided using --src-schemas.

    per-table-config: This section can be used to override certain configurations in specific tables if necessary
      catalog: <catalog_name>
      schema: <shema_name>

      tables: Multiple tables can be specified using the following format
        <table_name>:
          max-jobs-per-chunk:
          split-key:
          split-method:
          extraction-method:
          tpt-num-files-per-job:
          row-identifier-key:
          extraction-priority:

          normalize:
            de-duplicate:
            extract-upto-depth:
