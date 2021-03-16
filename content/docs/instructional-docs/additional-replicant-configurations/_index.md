---
weight: 5
Title: "Additional Replicant Configurations"

---

# Additional Replicant Configurations

## Mapper Configuration

1. Locate the sample mapper configuration file
    ```BASH
      cd conf/mapper/oracle_to_oracle.yaml
    ```
2. In situations where more control over source data mapping is required, you can providing a mapping file as follows:
    ```BASH
    ./bin/replicant snapshot conf/conn/oracle_src.yaml conf/conn/oracle_dst.yaml --map oracle_to_oracle.yaml
    ```

## Statistics Configuration

1. Locate the sample statistics configuration file
    ```BASH
      cd conf/statistics/statistics.yaml
    ```

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

1. Locate the notification sample configuration file
    ```BASH
      cd conf/notification/notification.yaml
    ```
2. For mail-alerts, make the necessary changes as follows:

    ```BASH
    mail-alert:
      enable: true/false
      smtp-host: hostname
      smtp-port: port
      authentication:
      enable: required for gmail/yahoo or other authenticated services
      protocol: TLS/SSL. Note port for TLS and SSL are different
      sender-username: To be used if username is different from sender-email
      sender-email: <email-id>
      sender-password: <password>
      receiver-email: [<email_id1>,<email_id2>]
      channels: alert channels to be monitored
      subject-prefix: Prefix string in subject for mail notification

    mail-alerts [20.08.13.9]: Allows to specify multiple mail-alert configs as a list
      enable: true/false
      smtp-host: hostname
      smtp-port: port
      authentication:
      enable: required for gmail/yahoo or other authenticated services
      protocol: TLS/SSL. Note port for TLS and SSL are different
      sender-username: To be used if username is different from sender-email
      sender-email: <email-id>
      sender-password: <password>
      receiver-email: [<email_id1>,<email_id2>]
      channels: alert channels to be monitored
      subject-prefix: Prefix string in subject for mail notification

3. For script-alerts, make the necessary changes as follows:   

    ```BASH
    script-alert:
      enable: true/false.
      script: full path to the script file
      output-file: full path to the file where err/output of script will be written to
      channels: alert channels to be monitored
      alert-repetitively: true/false
    ```




4. For lag-notifications, make the necessary changes as follows:
    ```BASH
    enable: true/false. Send notification if lag falls below threshold-s and stabilizes under stable-time-out-s. The global lag (across all replicant nodes in case of distributed replication) is computed every check-interval-s second.
    threshold-ms:
    stable-time-out-s:
    ```
5. For multiple mail alerts, specify the configurations as shown below:
    ```BASH
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
    ```




## Distribution Configuration

1. To distribute the nodes for data replication in Replicant, make the necessary changes as follows:
    ```BASH
    group:
      id: Name of the logical replication group
      leader: Name of the replicant node acting as leader
      workers: Names of all the slave replicant nodes

    ```
