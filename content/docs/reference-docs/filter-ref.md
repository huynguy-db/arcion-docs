---
title: Filter Configuration
weight: 2
---

# Filter Configuration

The filter configuration file is used to instruct Replicant which data collection/tables/files to replicate.

## Explanation

1. **allow**: Use this to specify the database, collections, documents to replicate in snapshot mode
   * **catalog**: Specify the source catalog which needs to be replicated. Note that if a source system supports the concept of catalogs/databases then you need to specify this configuration and its value should be the same as the database configuration value specified in the source system’s connection configuration file.
   * **schema**: Specify the source database schema that needs to be replicated. Each schema must have a separate entry
   * **types**: [TABLE]
   * **allow**:
     * **<table_name>**: Specify the collection name. Note, each collection within the database must be a separate entry.
       * **allow**: A list of columns in this table which should be replicated. If not specified, all columns are replicated
       * **conditions**: A predicate to be used for filtering the data while extracting from the source. If the source system is an SQL system then you can specify the exact SQL predicate which replicant should use while extracting data. Please note that the same predicate is executed on both source and target systems to achieve the required end to end filtering of data during snapshot and real-time modes.
       * **src-conditions**: If source and target systems support a different query language and a different mechanism to specify predicates e.g. source Oracle supporting SQL predicates while MongoDB supporting JSON predicates, then user must specify the same filtering condition in both languages in src-conditions and dst-conditions for source and target systems respectively
       * **dst-conditions**: As explained in src-conditions
       * **allow-update-any[20.05.12.3]**: This option is relevant to real time (CDC based replication). When a list of columns is specified here, replicant publishes update operations on this table only when any of the columns specified here are found modified in the received UPDATE logs from the source system.
       * **allow-update-all[20.05.12.3]**: This option is relevant to real time( CDC based replication). When a list of columns is specified here, replicant publishes update operations on this table only when all of the columns specified here are found modified in the received UPDATE logs from the source system.

* **Note**: It is recommended to create an index on the columns of the target table which are part of dst-conditions.
