---
weight: 4
title: "Target Database Setup"
bookCollapseSection: true
---

# Additional Replicant Configurations

## Mapper Configuration

Sample configuration file is located in mapper/oracle_to_oracle.yaml of replicant release

While replicating data between storages of different type, replicant by default makes a best effort to transfer the data as fetched from the source while maintaining its structure. In practice, there are situations where more control over source data mapping is needed. In situations such as these a mapping file can be used.

Using the mapping file, it's possible to precisely define how the data retrieved from the source is applied to the destination. The mapping file can be provided as follows:
./bin/replicant snapshot conf/conn/oracle_src.yaml conf/conn/oracle_dst.yaml --map oracle_to_oracle.yaml


## Statistics Configuration

Sample configuration is located in conf/statistics/statistics.yaml of replicant release
Replicant provides a full statistical history of an ongoing replication. This configuration is used to set it up. A table with the name replicate_io_replication_statistics_history is created by replicant to log the full history of inserts/updates/deletes/upserts across all replicant jobs with following details. Each successful write on a target table has a log entry in this table in the following format.
	replication_id
	catalog_name
	schema_name
	Table_name
	Snapshot_start_range
	Snapshot_end_range
	Start_time
	End_time
	Insert_count
	Update_count
	Upsert_count
	Delete_count
	Elapsed_time_sec
	replicate_lag [20.10.07.10]
	total_lag [20.10.07.10]

1.	enable: enable/disable statistics logging
2.	purge-statistics: Configuration to specify purge rules for the statistics history
a.	enable: enable purging of replication statistics history.
b.	purge-stats-before-days: Number of days to keep the stats. E.g. If set to 30 then replicant will keep the history for the last 30 days.
3.	storage [20.10.07.16]: Storage configuration for statistics.
a.	stats-archive-type: Type of stats archive. Allowed values are METADATA_DB(stats will be stored in metadata DB), FILE_SYSTEM(stats will be stored in a file), DST_DB(stats will be stored in destination DB).
b.	storage-location: Directory location where statistics files will be stored. Should be used only when stats-archive-type is FILE_SYSTEM
c.	format: The format of statistics file. Allowed values are CSV and JSON.
d.	catalog [20.12.04.2]: Catalog in which statistics will be stored when stats-archive-type is DST_DB.
e.	schema [20.12.04.2]: Schema in which statistics will be stored when stats-archive-type is DST_DB.


## Notification Configuration

Sample configuration is located in conf/notification/notification.yaml of replicant release
1.	mail-alert:
a.	enable: true/false
b.	smtp-host: hostname
c.	smtp-port: port
d.	authentication:
i.	enable: required for gmail/yahoo or other authenticated services
ii.	protocol: TLS/SSL. Note port for TLS and SSL are different
e.	sender-username: To be used if username is different from sender-email
f.	sender-email: <email-id>
g.	sender-password: <password>
h.	receiver-email: [<email_id1>,<email_id2>]
i.	channels: alert channels to be monitored
j.	subject-prefix: Prefix string in subject for mail notification

2.	mail-alerts [20.08.13.9]: Allows to specify multiple mail-alert configs as a list
a.	enable: true/false
b.	smtp-host: hostname
c.	smtp-port: port
d.	authentication:
i.	enable: required for gmail/yahoo or other authenticated services
ii.	protocol: TLS/SSL. Note port for TLS and SSL are different
e.	sender-username: To be used if username is different from sender-email
f.	sender-email: <email-id>
g.	sender-password: <password>
h.	receiver-email: [<email_id1>,<email_id2>]
i.	channels: alert channels to be monitored
j.	subject-prefix: Prefix string in subject for mail notification

3.	script-alert:
a.	enable: true/false.
b.	script: full path to the script file
c.	output-file: full path to the file where err/output of script will be written to
d.	channels: alert channels to be monitored
e.	alert-repetitively: true/false


4.	lag-notification:
a.	enable: true/false. Send notification if lag falls below threshold-s and stabilizes under stable-time-out-s. The global lag (across all replicant nodes in case of distributed replication) is computed every check-interval-s second.
b.	threshold-ms:
c.	stable-time-out-s:

Multiple mail alerts can be specified as shown below
mail-alerts:  
- enable: true
  receiver-email: ['replicant1@gmail.com']
  .
  .
  channels: [GENERAL]
- enable: true
  receiver-email: ['replicant2@gmail.com']
  .
  .
  channels: [WARNING]


## Distribution Configuration

Replicant supports distributed multi-node replication which can be configured using this configuration. Each replicant node in a particular logical replication group can carry out replication of a subset of databases/schemas/tables as configured in the filter configuration of individual nodes. One of multiple such nodes in a given replication group needs to be designated as a leader node and the rest as worker nodes for that replication group. The leader nodes carries out some critical tasks such as Replicant metadata table management, sending notifications (as configured using notification config) , computing global replication lag etc. The worker nodes depend on leader node for these activities and also feed leader node about their respective lag information.

1.	group:
a.	id: Name of the logical replication group
b.	leader: Name of the replicant node acting as leader
c.	workers: Names of all the slave replicant nodes
