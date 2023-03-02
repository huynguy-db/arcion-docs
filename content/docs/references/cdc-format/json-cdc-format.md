---
pageTitle: JSON CDC format for CDC changes in Kafka target
title: JSON CDC format
description: "Arcion Replicant uses JSON CDC format to track CDC changes for Apache Kafka as target for realtime replication."
weight: 2
---

# JSON CDC format for Kafka
Arcion Replicant uses the JSON CDC format to represent CDC changes for [Kafka target]({{< ref "docs/target-setup/kafka" >}}).

## Overview
Replicant supports JSON CDC format for the following sources:

- [MySQL]({{< ref "docs/source-setup/mysql" >}})
- [PostgreSQL]({{< ref "docs/source-setup/postgresql" >}})
- [Oracle]({{< ref "docs/source-setup/oracle" >}})
- [SAP ASE]({{< ref "docs/source-setup/sap_ase" >}})
- [Microsoft SQL Server]({{< ref "docs/source-setup/sqlserver" >}})

<!-- Replicant specifically follows the format for Debezium MySQL connector for Apache Kafka as data target. For more information, see [Debezium connector for MySQL](https://debezium.io/documentation/reference/stable/connectors/mysql.html). -->

### DML message structure
1. Each message has a key and a value. The key uniquely identifies the change.
2. Each message has a schema and a payload. The payload follows the schema definition.
3. Primary keys, unique keys, or row identifier key columns are used to form key structure. Without such keys, Replicant uses the `“default“` string as a key. 
4. For an update on the columns used to uniquely identify records DELETE and INSERT records are generated. 
5. For each delete operation, Replicant generates a tombstone event. The event possesses the same key as the previous delete operation and the value set to `“default“`.

## Examples
In this section, we'll see how insert, update, and delete events look like in JSON CDC format for snapshot and realtime mode.

### Change events in snapshot mode

#### `INSERT` event
{{< details title="Click to see sample key and value structure" open=false >}}

##### Key structure

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_snapshot_connector.tpch.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": "0"
  }
}
```

##### Value structure
```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_snapshot_connector.tpch.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": false,
        "field": "before",
        "name": "KAFKA_snapshot_connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "after",
        "name": "KAFKA_snapshot_connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "source",
        "name": "KAFKA_snapshot_connector",
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "version"
          },
          {
            "type": "string",
            "optional": false,
            "field": "connector"
          },
          {
            "type": "string",
            "optional": false,
            "field": "name"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": false,
            "field": "db"
          },
          {
            "type": "string",
            "optional": false,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": true,
            "field": "table"
          },
          {
            "type": "string",
            "optional": true,
            "field": "query"
          },
          {
            "type": "string",
            "optional": true,
            "field": "snapshot"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": false,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": false,
            "field": "row"
          }
        ]
      },
      {
        "type": "struct",
        "optional": true,
        "field": "transaction",
        "name": null,
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "id"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "total_order"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "data_collection_order"
          }
        ]
      },
      {
        "type": "string",
        "optional": false,
        "field": "op"
      },
      {
        "type": "int64",
        "optional": true,
        "field": "ts_ms"
      }
    ]
  },
  "payload": {
    "before": null,
    "after": {
      "r_regionkey": "0",
      "r_comment": "lar deposits. blithely final packages cajole. regular waters are final requests. regular accounts are according to ",
      "r_name": "AFRICA"
    },
    "source": {
      "schema": null,
      "query": "INSERT INTO tpch.region(r_regionkey, r_name, r_comment) VALUES(0, AFRICA, lar deposits. blithely final packages cajole. regular waters are final requests. regular accounts are according to )",
      "thread": null,
      "server_id": null,
      "version": "5.7.24",
      "file": null,
      "connector": "MYSQL",
      "pos": null,
      "name": "KAFKA_snapshot_connector",
      "gtid": null,
      "row": null,
      "ts_ms": null,
      "db": "tpch",
      "table": "region",
      "snapshot": "true"
    },
    "op": "r",
    "ts_ms": null,
    "transaction": {
      "id": "",
      "total_order": null
    }
  }
}
```

{{< /details >}}

### Change events in realtime mode

#### `INSERT` event

{{< details title="Click to see sample key and value structure" open=false >}}

##### Key structure

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": "6"
  }
}
```

##### Value structure

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": false,
        "field": "before",
        "name": "KAFKA_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "after",
        "name": "KAFKA_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "source",
        "name": "KAFKA_Connector",
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "version"
          },
          {
            "type": "string",
            "optional": false,
            "field": "connector"
          },
          {
            "type": "string",
            "optional": false,
            "field": "name"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": false,
            "field": "db"
          },
          {
            "type": "string",
            "optional": false,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": true,
            "field": "table"
          },
          {
            "type": "string",
            "optional": true,
            "field": "query"
          },
          {
            "type": "string",
            "optional": true,
            "field": "snapshot"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": false,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": false,
            "field": "row"
          }
        ]
      },
      {
        "type": "struct",
        "optional": true,
        "field": "transaction",
        "name": null,
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "id"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "total_order"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "data_collection_order"
          }
        ]
      },
      {
        "type": "string",
        "optional": false,
        "field": "op"
      },
      {
        "type": "int64",
        "optional": true,
        "field": "ts_ms"
      }
    ]
  },
  "payload": {
    "before": null,
    "after": {
      "r_regionkey": "6",
      "r_comment": "Test_Comment",
      "r_name": "Test_Region"
    },
    "source": {
      "schema": null,
      "query": "INSERT INTO tpch.region(r_regionkey, r_name, r_comment) VALUES(6, Test_Region, Test_Comment)",
      "thread": 160,
      "server_id": "1",
      "version": "5.7.24",
      "file": "log-bin.000001",
      "connector": "MYSQL",
      "pos": 2690,
      "name": "KAFKA_Connector",
      "gtid": null,
      "row": 1,
      "ts_ms": 1677159568000,
      "db": "tpch",
      "table": "region",
      "snapshot": "false"
    },
    "op": "c",
    "ts_ms": 1677139769357,
    "transaction": {
      "id": "",
      "total_order": 1
    }
  }
}
```
{{< /details >}}

#### `UPDATE` event
{{< details title="Click to see sample key and value structure" open=false >}}

##### Key structure
```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": "0"
  }
}
```

##### Value structure

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": false,
        "field": "before",
        "name": "KAFKA_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "after",
        "name": "KAFKA_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "source",
        "name": "KAFKA_Connector",
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "version"
          },
          {
            "type": "string",
            "optional": false,
            "field": "connector"
          },
          {
            "type": "string",
            "optional": false,
            "field": "name"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": false,
            "field": "db"
          },
          {
            "type": "string",
            "optional": false,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": true,
            "field": "table"
          },
          {
            "type": "string",
            "optional": true,
            "field": "query"
          },
          {
            "type": "string",
            "optional": true,
            "field": "snapshot"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": false,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": false,
            "field": "row"
          }
        ]
      },
      {
        "type": "struct",
        "optional": true,
        "field": "transaction",
        "name": null,
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "id"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "total_order"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "data_collection_order"
          }
        ]
      },
      {
        "type": "string",
        "optional": false,
        "field": "op"
      },
      {
        "type": "int64",
        "optional": true,
        "field": "ts_ms"
      }
    ]
  },
  "payload": {
    "before": {
      "r_regionkey": "0",
      "r_comment": "lar deposits. blithely final packages cajole. regular waters are final requests. regular accounts are according to ",
      "r_name": "AFRICA"
    },
    "after": {
      "r_regionkey": "0",
      "r_comment": "Test_Replication",
      "r_name": "AFRICA"
    },
    "source": {
      "schema": null,
      "query": "UPDATE tpch.region SET r_regionkey=0 AND r_name=AFRICA AND r_comment=Test_Replication WHERE r_regionkey=0 AND r_name=AFRICA AND r_comment=lar deposits. blithely final packages cajole. regular waters are final requests. regular accounts are according to ",
      "thread": 160,
      "server_id": "1",
      "version": "5.7.24",
      "file": "log-bin.000001",
      "connector": "MYSQL",
      "pos": 1248,
      "name": "KAFKA_Connector",
      "gtid": null,
      "row": 1,
      "ts_ms": 1677158088000,
      "db": "tpch",
      "table": "region",
      "snapshot": "false"
    },
    "op": "u",
    "ts_ms": 1677138289062,
    "transaction": {
      "id": "",
      "total_order": 1
    }
  }
}
```
{{< /details >}}

#### `DELETE` event
{{< details title="Click to see sample key and value structure" open=false >}}

##### Key structure

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": "0"
  }
}
```

##### Value structure

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": false,
        "field": "before",
        "name": "KAFKA_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "after",
        "name": "KAFKA_Connector.tpch.region.Value",
        "fields": [
          {
            "type": "int32",
            "optional": false,
            "field": "r_regionkey"
          },
          {
            "type": "string",
            "optional": false,
            "field": "r_name"
          },
          {
            "type": "string",
            "optional": true,
            "field": "r_comment"
          }
        ]
      },
      {
        "type": "struct",
        "optional": false,
        "field": "source",
        "name": "KAFKA_Connector",
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "version"
          },
          {
            "type": "string",
            "optional": false,
            "field": "connector"
          },
          {
            "type": "string",
            "optional": false,
            "field": "name"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": false,
            "field": "db"
          },
          {
            "type": "string",
            "optional": false,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": true,
            "field": "table"
          },
          {
            "type": "string",
            "optional": true,
            "field": "query"
          },
          {
            "type": "string",
            "optional": true,
            "field": "snapshot"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": false,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": false,
            "field": "row"
          }
        ]
      },
      {
        "type": "struct",
        "optional": true,
        "field": "transaction",
        "name": null,
        "fields": [
          {
            "type": "string",
            "optional": false,
            "field": "id"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "total_order"
          },
          {
            "type": "int64",
            "optional": false,
            "field": "data_collection_order"
          }
        ]
      },
      {
        "type": "string",
        "optional": false,
        "field": "op"
      },
      {
        "type": "int64",
        "optional": true,
        "field": "ts_ms"
      }
    ]
  },
  "payload": {
    "before": {
      "r_regionkey": "0",
      "r_comment": "Test_Replication",
      "r_name": "AFRICA"
    },
    "after": null,
    "source": {
      "schema": null,
      "query": "DELETE FROM tpch.region WHERE r_regionkey=0 AND r_name=AFRICA AND r_comment=Test_Replication",
      "thread": 160,
      "server_id": "1",
      "version": "5.7.24",
      "file": "log-bin.000001",
      "connector": "MYSQL",
      "pos": 2077,
      "name": "KAFKA_Connector",
      "gtid": null,
      "row": 1,
      "ts_ms": 1677159319000,
      "db": "tpch",
      "table": "region",
      "snapshot": "false"
    },
    "op": "d",
    "ts_ms": 1677139520242,
    "transaction": {
      "id": "",
      "total_order": 1
    }
  }
}
```

##### Tombstone event

```JSON
{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Key",
    "fields": [
      {
        "type": "int32",
        "optional": false,
        "field": "r_regionkey"
      }
    ]
  },
  "payload": {
    "r_regionkey": "0"
  }
}
```

The value for [the preceeding Tombstone key structure is the `"default"` string](#dml-message-structure):

```JSON
"default"
```


{{< /details >}}