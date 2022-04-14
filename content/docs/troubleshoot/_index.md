---
weight: 7
title: Performance Enhancing and Troubleshoot
bookHidden: true
bookSearchExclude: true
---

## Extractor Configuration

In general, Replicant will work well with the default extractor configuration settings. However, for certain replication jobs, changing one or more of the following parameters may help improve Replicant's performance.

1. Navigate to Oracle's extractor configurations
   ```BASH
   vi conf/src/oracle.yaml
   ```

2. For a tune up in snapshot mode, you can edit the following configurations as per your needs:
    ```YAML
    threads: 16 #Enter the maximum number of threads you would like replicant to use
    #for data extraction

    fetch-size-rows: 10_000 #Enter the maximum number of records/documents you would like Replicant
    #to fetch at once from the Oracle Database

    min-job-size-rows: #Enter the minimum number of tables/collections you would like
    #each replication job to contain

    max-jobs-per-chunk: #Enter the maximum number of jobs created per
    #source table/collection

    split-key: #Edit this configuration to split the table/collection into
    #multiple jobs in order to do parallel extraction

    split-method: #Specify which of the two split methods, RANGE or MODULO, Replicant will use
    ```


3. For a tune up in real time replication, you can edit the following configurations as per your needs:

    ```YAML
    threads: 4 #Enter the maximum number of threads to be used by replicant
    #for real-time extraction

    fetch-size-rows: #Enter the number of records/documents
    #Replicant should fetch at one time from Oracle

    fetch-duration-per-extractor-slot-s: #Specify the number of seconds a
    #thread should continue extraction from a given replication channel/slot

    start-position [20.09.14.1]: #Edit the configurations below to specify
    #the log position from where replication should begin for real-time mode

      start-scn: #Enter the scn from which replication should start

      idempotent-replay [20.09.14.1]: #Enter one of the three possible values: ALWAYS/ NONE/ NEVER

    ```
