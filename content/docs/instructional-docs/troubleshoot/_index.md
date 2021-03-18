---
title: Performance Enhancing and Troubleshoot
---


Snapshot Extractor
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




Real Time Extractor:

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
