---
pageTitle: File format for Amazon S3 as Target 
title: Amazon S3 File Format
description: "When loading data into Amazon S3, Replicant converts Source data into either CSV or JSON. Learn about the data formats of those files on this page."
weight: 10
---

# Amazon S3 File Format

When loading data into S3 Replicant first converts the data extracted from the source database into either a CSV or JSON file. Both types of files are structured in accordance to the data being replicated. Sample file formats for both CSV and JSON files are explained below.


## CSV Snapshot Mode File Format Example

In snapshot mode, after being converted into a CSV file, if the original table contains x columns, a row in the CSV file will contain data for x columns. For example, if the original table has three columns containing the values 0, Africa, Africa, respectively, the data in the CSV file loaded into S3 would be structured as follows:

**CSV Snapshot Mode Example:**
`0, AFRICA ,AFRICA`

## CSV Realtime Mode File Format Examples

In realtime mode, after being converted into a CSV file, if the original table contains x columns a row in the CSV file will contain data for 3x+3 columns. Every row will correspond to a single DML operation.


In realtime mode, after being converted into either type of file, if the original table contained x columns a row in the CSV/JSON file will contain data for 3x+3 columns. Every row will correspond to a single DML operation. The first 3x columns of a row can be treated as x triplets where every triplet denotes:
* **New_Val**: New value for that column coming via DML operation
* **Old_Val**: Old value of that column which is to be changed via DML operation
* **Exists_Val**: An Integer. It can have values:
  - 0: The column value is not present in neither New_Val nor Old_Val section of the DML
  - 1: The column value is present in New_Val section of the DML
  - 2: The column value is present in Old_Val section of the DML  
  - 3: The column value is present in both New_Val and Old_Val section of the DML

**Note**:
* Exists_Val is needed to differentiate when a column value is NULL. If the corresponding Exists_Val is non-zero, that means the user has provided NULL value in the DML. If it’s zero, that means that user hasn’t mentioned the column in the DML.
* The last 3 columns of a row contain metadata required for consistent replication recovery. The names of the columns are printed at the top of every file if “include-header” configuration is true in the applier configuration.

Example S3 CSV file outputs for three different sample operations/changes in the source system are shown below:

**Sample Insert Operation**:
  `INSERT INTO tpch.region (r_regionkey,r_comment,r_name) VALUES(10,'India','India');`

**File Format for the above Sample Insert Operation**:
  ```CSV
    India,NULL,1,India,NULL,1,10,NULL,1,I,"{""extractorId"":0,""nodeID"":""node1"",""/
    timestamp"":1620787841959,""extractionTimestamp"":1620787841959,""dscId"":/
    1620787053904,""mutId"":1048408,""partNum"":1,""v"":2}","{""insertCount"":6,""updateCount"":0,"/
    "deleteCount"":0,""replaceCount"":0}"
  ```
  **Note**: INSERT statement doesn’t have any Old_Val section, every triplet has Exists_Val as 1.

**Sample Update Operation**:
  `UPDATE tpch.region SET r_comment = 'USA' WHERE r_regionkey = 10;`

**File Format for the above Sample Update Operation**:
  ```CSV
  USA,NULL,1,NULL,NULL,0,NULL,10,2,U,"{""extractorId"":0,""nodeID"":""node1"",/
  ""timestamp"":1620787852116,""extractionTimestamp"":1620787852116,""dscId""/
  :1620787053904,""mutId"":1048480,""partNum"":1,""v"":2}","{""insertCount"":6,"/
  "updateCount"":1,""deleteCount"":0,""replaceCount"":0}"/
  ```
  **Note**: In the update statement the SET sections corresponds to New_Val and the WHERE section corresponds to Old_Val. R_NAME has no presence in any section. This is why it has Exists Val as 0.

**Sample Delete Operation**:
  `DELETE FROM tpch.region WHERE r_regionkey = 10;`

**File Format for the above Sample Delete Operation**:
  ```CSV
  NULL,NULL,0,NULL,NULL,0,NULL,10,2,D,"{""extractorId"":0,""nodeID"":""node1"/
  ",""timestamp"":1620787872370,""extractionTimestamp"":1620787872370,""dscI"":1620787053905,"/
  "mutId"":1721,""partNum"":1,""v"":2}","{""insertCount"":6,"/
  "updateCount"":1,""deleteCount"":1,""replaceCount"":0}"
  ```


## JSON Snapshot Mode File Format Examples

In snapshot mode, after being converted into a JSON file, if the original table contained x columns, a row in the CSV file will contain data for x columns. For example, if the original table has three columns named r_regionkey, r_comment, and r_name, and the columns respectively contain the values 0, No comment, and Africa, the data in the JSON file loaded into S3 will be structured as follows:
  ```JSON
  {
  "r_regionkey": "0",
  "r_comment": "lar deposits. blithely final packages cajole. regular waters are
  final requests. regular accounts are according to ",
  "r_name": "AFRICA"
  }
  ```


## JSON Realtime Mode File Format Examples

Example S3 JSON file outputs for three different sample commands/changes in the source system are shown below:

**Sample Insert Operation**:
  `INSERT INTO tpch.region (r_regionkey,r_comment,r_name) VALUES(10,'India','India');`

**File Format for the above Sample Insert Operation**:
  ```JSON
  {
    "tableName": {
      "namespace": {
        "catalog": null,
        "schema": "io_blitzz",
        "hash": 696406511
      },
      "name": "region",
      "hash": -821029210
    },
    "opType": "I",
    "cursor":
    "{\"extractorId\":0,\"nodeID\":\"node1\",\"timestamp\":1620788088431,\"extraction Timestamp\":1620788088431,\"dscId\":1620787053905,\"mutId\":326118,\"partNu m\":1,\"v\":2}",
      "before": {
        "r_regionkey": "null",
        "r_comment": "null",
        "r_name": "null"
        },
      "after": {
        "r_regionkey": "10",
        "r_comment": "India",
        "r_name": "India"
        },
      "exists": {
        "r_regionkey": "1",
        "r_comment": "1",
        "r_name": "1"
      },
      "operationcount": "{\"insertCount\":6,\"updateCount\":0,\"deleteCount\":0,\"replaceCount\":0}"
  }
  ```

**Sample Update Operation**:
  `UPDATE tpch.region SET r_comment = 'USA' WHERE r_regionkey = 10;`

**File Format for the above Sample Update Operation**:
  ```JSON
    {
      "tableName": {
        "namespace": {
          "catalog": null,
          "schema": "io_blitzz",
          "hash": 696406511
        },
        "name": "region",
        "hash": -821029210
        },
        "opType": "U",
         "cursor":
         "{\"extractorId\":0,\"nodeID\":\"node1\",\"timestamp\":1620788090478,\"extraction Timestamp\":1620788090478,\"dscId\":1620787053905,\"mutId\":326190,\"partN um\":1,\"v\":2}",
         "before": {
           "r_regionkey": "10",
           "r_comment": "null",
           "r_name": "null"
         },
         "after": {
           "r_regionkey":
           "null", "r_comment": "USA",
           "r_name": "null"
         },
         "exists": {
           "r_regionkey": "2",
           "r_comment": "1",
           "r_name": "0"
         },
         "operationcount":
         "{\"insertCount\":6,\"updateCount\":1,\"deleteCount\":0,\"replaceCount\":0}"
    }
  ```

**Sample Delete Operation**:
  `DELETE FROM tpch.region WHERE r_regionkey = 10;`

**File Format for the above Sample Delete Operation**:
  ```JSON
  {
    "tableName": {
      "namespace": {
        "catalog": null,
        "schema": "io_blitzz",
        "hash": 696406511
      },
      "name": "region",
      "hash": -821029210
    },
    "opType": "D",
    "cursor":
    "{\"extractorId\":0,\"nodeID\":\"node1\",\"timestamp\":1620788092539,\"extraction Timestamp\":1620788092539,\"dscId\":1620787053905,\"mutId\":326250,\"partN um\":1,\"v\":2}",
      "before": {
        "r_regionkey": "10",
        "r_comment": "null",
        "r_name": "null"
      },
      "after": {
        "r_regionkey": "null",
        "r_comment": "null",
        "r_name": "null"
      },
      "exists": {
        "r_regionkey": "2",
        "r_comment": "0",
        "r_name": "0"
      },
      "operationcount":
      "{\"insertCount\":6,\"updateCount\":1,\"deleteCount\":1,\"replaceCount\":0}"
  }
  ```
