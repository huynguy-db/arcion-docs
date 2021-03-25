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

Replicant automatically creates a table with the name replicate_io_replication_statistics_history to log the full history of inserts/updates/deletes/upserts across all replicant jobs. The configuration for the statistcs log can be altered if necessary using the proceeding steps.

1. Locate the sample statistics configuration file
    ```BASH
      cd conf/statistics/statistics.yaml
    ```

2. Use the following sample configuration file as a guide to determine and make the necessary changes for your replication process:

    ```YAML
    enable: true #Change this to false only if you want to disable statistics logging
    purge-statistics:
      enable: true #Change this to false only if you want to disable purging of replication statistics history
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
      cd conf/notification/notification.yaml
    ```
2. For mail-alerts, you make the necessary changes as follows:

    ```YAML
    mail-alert:
      enable: true/false #Set to true if you want to enable email notifications
      smtp-host: hostname #replace hostname with your smtp host name
      smtp-port: port #replace port with your smtp port
      authentication:
      enable: #required for gmail/yahoo or other authenticated services
      protocol: TLS/SSL. #Note port for TLS and SSL are different
      sender-username: #To be used if username is different from sender-email
      sender-email: <email-id> #Replace <email-id> with your email ID
      sender-password: <password> #Replace <password? with the sender password
      receiver-email: [<email_id1>,<email_id2>] #Replace [<email_id1>,<email_id2>] with a list of all the email IDs that will receive the notification
      channels: #alert channels to be monitored
      subject-prefix: #Prefix string in subject for mail notification

    mail-alerts [20.08.13.9]: Allows to specify multiple mail-alert configs as a list
      enable: true/false #Set to true if you want to enable email notifications
      smtp-host: hostname #replace hostname with your smtp host name
      smtp-port: port #replace port with your smtp port
      authentication:
      enable: #required for gmail/yahoo or other authenticated services
      protocol: TLS/SSL. #Note port for TLS and SSL are different
      sender-username: #To be used if username is different from sender-email
      sender-email: <email-id> #Replace <email-id> with your email ID
      sender-password: <password> #Replace <password? with the sender password
      receiver-email: [<email_id1>,<email_id2>] #Replace [<email_id1>,<email_id2>] with a list of all the email IDs that will receive the notification
      channels: #alert channels to be monitored
      subject-prefix: #Prefix string in subject for mail notification
      ```

3. For script-alerts, make the necessary changes as follows:   

    ```YAML
    script-alert:
      enable: true/false #Set to true to enable script-alerts
      script: /full/path/to/script_file #Replace /full/path/to/script_file with the path to the script file
      output-file: /full/path/to/output/script/file #Replace /full/path/to/output/script/file with the path of the file where the output of the script will be written to
      channels: alert channels to be monitored #Enter the channels to monitor
      alert-repetitively: true/false #Set to true to send multiple alerts of the same job
    ```




4. For lag-notifications, make the necessary changes as follows:
    ```YAML
    enable: true/false. #Set this to true to send a notification if the lag falls below threshold-s and stabilizes under stable-time-out-s
    threshold-ms: 10000 #Set the threshold-s here
    stable-time-out-s: 10000 #Set the stable-time-out-s here
    ```

5. For multiple mail alerts, specify the configurations as shown below:
    ```YAML
    mail-alerts:  
    - enable: true #Set this to true to enable multiple mail alerts
      receiver-email: ['replicant1@gmail.com'] #Replace ['replicant1@gmail.com'] with the receiver email ID
      .
      .
      channels: [GENERAL] #Replace [GENERAL] with the channel

      ##Continue listing receiver emails using the same format as shown both above and below, changing hte parameters as necessary

    - enable: true
      receiver-email: ['replicant2@gmail.com']
      .
      .
      channels: [WARNING]
    ```




## Distribution Configuration

1. To distribute the nodes for data replication in Replicant, make the necessary changes as follows:
    ```YAML
    group:
      id: exID #Replace exID with the name of the logical replication group
      leader: node1 # Replace node1 with the name of the replicant node acting as leader
      workers: node2, node3... #Replace node2, node3... with a list of the names of all the slave replicant nodes

    ```
