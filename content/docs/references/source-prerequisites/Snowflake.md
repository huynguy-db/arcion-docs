---
title: Snowflake
weight: 3
bookHidden: false 
---

This page describes the requirements for using Snowflake as source.

## Streams
A stream object records data manipulation language (DML) changes made to tables, including inserts, updates, and deletes, as well as metadata about each change. This makes it possible to take specific actions using the changed data. This process is referred to as **Change Data Capture** (CDC). 

An individual table stream tracks the changes made to rows in a source table. A table stream (also referred to as simply a *stream*) makes a *change table* available of what changed, at the row level, between two transactional points of time in a table. This allows querying and consuming a sequence of change records in a transactional fashion. In order to track changes on source tables, we need to create streams for all the tables. You can do this in two ways: 

1. You need to create streams for table using SQL command. For example, to create stream for test table:
    ```sql
    create or replace stream test_stream on table test;
    ```
2. Arcion Replicant can automatically create streams for tables if Replicant user has the following permissions:
  | Object | Privilege |
  |---|---|
  | Database | `USAGE` |
  | Schema | `USAGE`, `CREATE` |
  | Table | `SELECT`, `CREATE STREAM`, `CREATE TABLE` |

## Stage Tables
In order to achieve CDC replication, Replicant also maintains a stage table for every source table on snowflake. Replicant will move delta changes from stream to stage table temporarily and delete them as soon as it is consumed by the target. So in a nutshell, the stage table is a kind of buffer which will store data of last `n` minutes. Replicant will automatically create this stage table if it has `CREATE TABLE` permission. 

If you want to create stage tables by yourself, you can create them with SQL in the following format as shown for the example table

- Create table SQL for original orders table:

  ```SQL
  CREATE TABLE IF NOT EXISTS "DEMO_DB"."io_blitzz"."orders"("ORDERKEY" DOUBLE,
  "CUSTKEY" DOUBLE, "ORDERSTATUS" VARCHAR, "TOTALPRICE" DOUBLE,
  "ORDERDATE" VARCHAR, "ORDERPRIORITY" VARCHAR, "CLERK" VARCHAR,
  "SHIPPRIORITY" DOUBLE, "COMMENTS" VARCHAR);
  ```
- Create table SQL for orders stage table

  ```SQL
  CREATE TABLE IF NOT EXISTS "DEMO_DB"."io_blitzz"."orders_stage"("ORDERKEY"
  DOUBLE, "CUSTKEY" DOUBLE, "ORDERSTATUS" VARCHAR, "TOTALPRICE" DOUBLE,
  "ORDERDATE" VARCHAR, "ORDERPRIORITY" VARCHAR, "CLERK" VARCHAR,
  "SHIPPRIORITY" DOUBLE, "COMMENTS" VARCHAR, "METADATA$ACTION" VARCHAR,
  "COUNTER" INT);
  ```

{{< hint "info" >}}
In the stage table we have added two extra columns `METADATA$ACTION` and `COUNTER`.
{{< /hint >}}