---
title: IBM Informix
weight: 2
bookHidden: false 
---

This page describes the requirements for using IBM Informix as source.

## Enabling CDC Replication

1. First, follow the instructions described [here in IBM Informix Documentation](https://www.ibm.com/docs/en/idr/11.3.3?topic=informix-creating-syscdcv1-database).

2. The user should have read access on all the databases, schemas and tables to be replicated.

3. You must set the log mode of the source Informix to `UNBUFFERED` or `ANSI.` For more details, see [alter logmode argument: Change the database logging mode](https://www.ibm.com/docs/en/informix-servers/12.10?topic=saaf-alter-logmode-argument-change-database-logging-mode-sql-administration-api) on the IBM Informix Documentation. For example, to set log mode to `UNBUFFERED`, use the following command:

    ```
    EXECUTE FUNCTION task("alter logmode","<dbname>","u");
    ```

    You can check the current log mode using SQL:
    ```SQL
    SELECT * FROM sysmaster:sysdatabases WHERE name = '<dbname>
    ```

## Logical Log Configuration Guidelines

You must perform Logical log configuration in such manner that Informix logical logs do not get overwritten fast enough before Arcion Replicant has finished consuming them. To know about the general Informix guidelines for managing logical logs, see [Managing logical-log files](https://www.ibm.com/support/knowledgecenter/SSGU8G_14.1.0/com.ibm.admin.doc/ids_admin_0713.htm#ids_admin_0713) on IBM Informix Documentation.

Arcion replicant recommends the following:

- It is important to have a sufficiently large `DBSPACE`(s) configured to hold logical logs corresponding to the transaction activity that is done for a few days to a week duration. The higher the logical log space configured, the more is the resiliency of CDC based replication for the failures with the error code CDC_E_LSN ( Data at the requested log sequence number is unavailable for capture). E.g. A DBSPACE can be added with following using `DBACCESS`:
  ```
  EXECUTE FUNCTION task( "create dbspace", "logical_log_space",$INFORMIXDIR/tmp/dbspace3", "100000 M",0 );
  ```
- A sufficiently large number of initial logical log files of appropriate size should be added
in this dbspace. For example:

  ```
  onparams -a -d dbspace3 -s 1000000
  ```
  {{< hint "info" >}} See [Performance considerations](https://www.ibm.com/docs/en/informix-servers/12.10?topic=file-performance-considerations) on IBM Informix Documentation for an overview of all the performance considerations. It'll help you determine the number of log files and size of each logical file. For CDC-based replication, we highly recommend you use the maximum possible `LOGSIZE` to avoid frequent `LOG FULL` situations.{{< /hint >}}

- The more the threads specified in the realtime section of the extractor configuration file (refer `conf/src/informix.yaml` in the release) the more is the number of CDC sessions replicant creates to pull logs from the source Informix database. For example, if there are 128
tables to be replicated and if number of realtime extractor threads is specified as 16 then replicant will divide 128 tables amongst these 16 extractor slots ( cdc sessions) each pulling CDC logs for 8 tables). This will help replicant to consume the logs aggressively by maximizing the available bandwidth of log consumption.

- Once Arcion replicant has been started and it finishes snapshot and enters realtime mode, it is possible to monitor the consumption rate in different ways as described below 

  - Replicant has an in-built heartbeat mechanism by which replicant can precisely figure out how much is the replication lag at any point. For example, if an `INSERT`/`UPDATE`/`DELETE` operation was executed on the source Informix server at time X and it was applied to the target database by Arcion replicant at time X + 25 then replicant computes this replication lag as 25 seconds and shows it up on the dashboard.

    Replicant continuously computes and updates the replication lag value in real time and displays it on the Replicant dashboard. It is a true reliable metric to understand how much Replicant is lagging behind from the source system in terms of elapsed time.
  - On Informix server, it is possible to continuously monitor how fast Arcion Replicant is consuming the CDC logs buffers. To do so, use the following command:

    ```shell
    [informix@62881888bf5b informix]$ onstat -g cdc bufm
    ```
    This will yield an output like below:

    ```
    IBM Informix Dynamic Server Version 14.10.FC3DE -- On-Line -- Up 03:21:20 -- 181044 Kbytes
    CDC subsystem structure at 0x4410cc98
      CDC session structure at 0x4e387d28
        CDC session id: 46137383 (0x2c00027)
    
        Bufer Manager at 0x4e38aa20
          Number of allocated bufers high watermark: 22
          Number of currently allocated bufers: 14
          Minimum prepend for alloced bufers: 172

        CDC session structure at 0x4e1a1d28
          CDC session id: 45613095 (0x2b80027)
          
          Bufer Manager at 0x4e1a3a20
            Number of allocated bufers high watermark: 22
            Number of currently allocated bufers: 14
            Minimum prepend for alloced bufers: 172

        CDC session structure at 0x4e5add28
          CDC session id: 45088807 (0x2b00027)

          Bufer Manager at 0x4e5afa20
            Number of allocated bufers high watermark: 268
            Number of currently allocated bufers: 14
            Minimum prepend for alloced bufers: 172
    
        CDC session structure at 0x4de7ad28
          CDC session id: 44040231 (0x2a00027)
    
          Bufer Manager at 0x4e042a20
            Number of allocated bufers high watermark: 22
            Number of currently allocated bufers: 14
            Minimum prepend for alloced bufers: 17
    ```
    In this output, the more the number of currently allocated buffers for each CDC session, the more is the amount of unconsumed log by Arcion Replicant.

    The value of this allocated buffers < 20 as above indicates all the logs have been consumed by Arcion repicant. When the value is much higher, it is an indication of Arcion replicant not being able to catch up with the high throughput of log generation. It is not possible to have record level granularity of records not yet fetched by Replicant. But once logs are fetched and are waiting to be applied we show "Buffered Oper" count on the replicant dashboard.

  - Informix does not offer any direct way for CDC consumers (like Arcion Replicant) to correlate the CDC record sequence number with the LSN in actual logical log files. (To know more, see the section **CDC Record Sequence Number** in [IBM Informix Change Data Capture API Programmer's Guide](http://www.oninit.com/manual/informix/117/documentation/ids_cdc_bookmap.pdf)). Meaning, there is no direct way/API to know which logical log file Arcion Replicant is currently consuming.

    However, Arcion replicant still offers one way to do this as below :

    - One of the metadata tables (in the metadata database) created by Arcion Replicant is `blitzz_io_cdc_extractor_metadata_<id>_<id>`. The column `committed_cursor` in this table gives the exact CDC cursor information for each CDC session that Arcion Replicant checkpoints and updates continuously. For example, notice the following SQL:

      ```SQL
      select committed_cursor from blitzz.blitzz_io_cdc_extractor_metadata_repl1_repl1;
      ```
      An example output looks ike below:

      ```json
      {
        "extractorId": 0,
        "timestamp": 1594378633405,
        "transactionNum": 45,
        "seqNum": 738842783900,
        "startSeqNumForOldestUncommitedTxn": 738842783768,
        "v": 1
      }
      {
        "extractorId": 0,
        "timestamp": 1594378633405,
        "transactionNum": 45,
        "seqNum": 738842783900,
        "startSeqNumForOldestUncommitedTxn": 738842783768,
        "v": 1
      }
      {
        "extractorId": 2,
        "timestamp": 1594378633405,
        "transactionNum": 45,
        "seqNum": 738842783900,
        "startSeqNumForOldestUncommitedTxn": 738842783768,
        "v": 1
      }
      {
        "extractorId": 3,
        "timestamp": 1594378633405,
        "transactionNum": 45,
        "seqNum": 738842783900,
        "startSeqNumForOldestUncommitedTxn": 738842783768,
        "v": 1
      }
      (4 rows)
      ```
      Each value is a JSON string is with a timestamp field in it. This timestamp is the start time of the Informix transaction that Arcion Replicant has successfully replicated.

      The minimum of all these values will give the oldest transaction’s start timestamp (say it is X ) which has been replayed by Replicant.This timestamp is in milliseconds (time since epoch) and it can be easily converted to a UTC timestamp.

    - Informix provides an event alarm mechanism where all event alarms are continuously logged in a `ph_alert` table. For information regarding all Informix events, see [Event alarm IDs](https://www.ibm.com/support/knowledgecenter/SSGU8G_12.1.0/com.ibm.adref.doc/ids_adr_0676.htm) on IBM Informix Documentation.

      Following event is generated when a logical log file is full

        ```
        Class ID: 23
        Event ID: 23001
        Class message: Logical log 'number' complete
        Specific message: Logical Log log_number Complete, timestamp: timestamp. 
        The logical log is full, and no more transactions can be written to it. 
        Online log: Message indicating that the logical log is full.
        Server state: Online.
        User action: None.
        ```
      As soon as a logical log file gets full, an alarm is generated for this event. You can query for all such alarms in the `ph_alerts` table using the below query (on sysadmin database):

        ```SQL
        SELECT * FROM ph_alerts WHERE alert_object_type='ALARM' AND
        alert_object_info = 23001;
        ```
      This would give an output like the following:

        ```
        alert_id 171
        run_id 348
        task_id 20
        task_name post_alarm_message
        task_description System function to post alerts
        alert_type INFO
        alert_color YELLOW
        alert_time 2020-07-10 08:42:46
        alert_state NEW
        alert_object_type ALARM
        alert_object_name 23
        alert_message Logical Log 162 Complete, timestamp:
        0x5b6bba.
        alert_action_dbs sysadmin
        alert_action
        alert_object_info 23001
        ```
      The alert time here is a UTC time. Let us call it `Y`.

      It is possible to write an external monitoring script which can continuously query the following:

      - The Arcion replicant metadata table `blitzz_io_cdc_extractor_metadata_repl1_repl1` to get the start time of the oldest transaction which has been successfully replicated by replicant (calling it `X`).\
      - The `ph_alerts` table to get the most recent logical log full time and logical log file number (calling it `Y`).
      - By comparing `X` with `Y` of each logical log file which becomes full, you can deduce which exact logical logs Replicant didn't consume at any point. Based on that observation, you can take appropriate action. For example:
        - If X is TS 120
        - Log FIle 1 became full at TS 50
        - Log File 2 became full at TS 100
        - Log File 3 became full at TS 150
        - Log File 4 became full at TS 200 etc.

        Then, we can deduce that replicant will need all log files starting from Log file 2, 3, 4 and so on.

{{< hint "info" >}}
When you deduce that Replicant is not able to consume CDC logs and more and more logical logs are getting full, you should take the following actions:

- Add new `DBSPACE`(s) and new logical log files dynamically to avoid the cyclic overwriting of the unconsumed logs.
- Make sure that Replicant is running and not failing for any other external factors. These factors could be hardware issues on replication host, network connection failures, target system down, or slowness. If you can sort out any of such causes in a timely manner, you should be able to run Replicant again so that it can consume the pending CDC activity.
{{< /hint >}}