---
weight: 5
Title: "Additional Replicant Configurations"
bookHidden: true
---

# Additional Replicant Configurations

## Mapper Configuration

1. Locate the appropriate sample mapper configuration file based on your source and target database
    ```BASH
      vi conf/mapper/<source_database>_to_<target_database>.yaml
    ```
2. In situations where more control over source data mapping is required, you can providing a mapping file as follows:
    ```BASH
    ./bin/replicant snapshot conf/conn/<source_database>.yaml conf/conn/<target_database>.yaml --map <source>_to_<target>.yaml
    ```

## Statistics Configuration

Replicant automatically creates a table with the name replicate_io_replication_statistics_history to log the full history of inserts/updates/deletes/upserts across all replicant jobs. The statistics  configuration can be altered if necessary using the proceeding steps.

1. Locate the sample statistics configuration file
    ```BASH
      vi conf/statistics/statistics.yaml
    ```

2. Use the following sample configuration file as a guide to determine and make the necessary changes based on your requirements:
    ```YAML
    enable: true #Change this to true/false to enable/disable statistics logging
    purge-statistics:
      enable: true #Change this to true/false to enable/disable purging of replication statistics history
      purge-stats-before-days: 30 #You can increase or decrease the number of days the stats history is stored
      purge-stats-interval-iterations: 100
    storage:
      stats-archive-type:  METADATA_DB #stats-archive-type can be  METADATA_DB, FILE_SYSTEM, DST_DB
      storage-location: /path/to/storage-location #Should be used only when stats-archive-type is FILE_SYSTEM
      format: CSV #format can be CSV, JSON. Default is CSV. Should be used only when stats-archive-type is FILE_SYSTEM
      catalog: "io" #Should be used only when stats-archive-type is DST_DB
      schema: "replicate" #Should be used only when stats-archive-type is DST_DB
    ```


## Notification Configuration

1. Locate the notification sample configuration file
    ```BASH
      vi conf/notification/notification.yaml
    ```
2. For mail-alerts, you make the necessary changes as follows:
    ```YAML
    mail-alert:
      enable: true/false #Set to true if you want to enable email notifications
      receiver-email: [<email_id1>,<email_id2>] #Replace <email_id1>,<email_id2> with a list of comma separated email IDs that will receive the notification
      channels: [ALL] # List of alert channels to be monitored. Values can be from [ALL, GENERAL, LAG, WARNING, RETRY_FAILURE, SNAPSHOT_COMPLETE, SNAPSHOT_SUMMARY]
      subject-prefix: “PROD” #Prefix string in subject for mail notification
    ```

3. Replicant can be configured to run a shell script for specified events. For script-alerts, make the necessary changes as follows:   

    ```YAML
    script-alert:
      enable: true #Set to true/false to enable/disable script-alert
      script: /full/path/to/script_file.sh #Replace /full/path/to/script_file with the path to the script file
      output-file: /full/path/to/output/script/file.out #Replace /full/path/to/output/script/file with the path of the file where the output of the script will be written to
      channels: [ALL] #Enter the channels to monitor Values can be from [ALL, GENERAL, LAG, WARNING, RETRY_FAILURE, SNAPSHOT_COMPLETE, SNAPSHOT_SUMMARY]
      alert-repetitively: true/false #Set to true to send multiple alerts of the same job
    ```

4. LAG channel is triggered when replication lag is below configured threshold for configured number of milliseconds, make the necessary changes as follows:
    ```YAML
    lag-notification:
      enable: true. #Set this to true/false to enable/disable LAG notification channel
      threshold-ms: 10000 #Set the threshold-s here
      stable-time-out-s: 10000 #Set the stable-time-out-s here
    ```

## Distribution Configuration
1. To run a distributed replication to divide the load between multiple nodes, make the necessary changes as follows:
    ```YAML
    group:
      id: group_id #Replace group_id with the name of the logical replication group
      leader: node1 # Replace node1 with the name of the replicant node acting as leader
      workers: [node1,node2, node3] #Replace node1,node2, node3 with a list of the replicant ids involved in the distributed replication.
    ```
