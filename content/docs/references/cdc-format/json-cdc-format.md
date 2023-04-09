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

To use JSON CDC format, set [the global Applier parameter `replication-format` to `JSON`]({{< relref "docs/target-setup/kafka#replication-format" >}}) in your Applier configuration file.

### DML message structure
1. Each message contains a key and a value. The key uniquely identifies the change.
2. Each message contains a schema and a payload. The payload follows the schema definition.
3. Replicant uses primary key, unique key, or row identifier key column to form key structure. In the absence of primary key, unique key, or row identifier key column, Replicant uses the `null` value for the key. 
4. Whenever a column that uniquely identifies a record is updated, instead of creating an update event, Replicant generates delete and insert events. The delete event deletes existing record and insert event inserts a new record. 
5. For each delete operation, Replicant generates a tombstone event. Replicant assigns the event the same key as the previous delete operation and sets the value to `null`.

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
    "r_regionkey": 3
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
        "optional": true,
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
        "optional": true,
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
            "optional": true,
            "field": "db"
          },
          {
            "type": "string",
            "optional": true,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": false,
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
            "optional": true,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": true,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": true,
            "field": "row"
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
    "before": {},
    "after": {
      "r_regionkey": 3,
      "r_name": "EUROPE",
      "r_comment": "ly final courts cajole furiously final excuse"
    },
    "source": {
      "version": "5.7.41",
      "connector": "MYSQL",
      "name": "KAFKA_snapshot_connector",
      "ts_ms": null,
      "db": "tpch",
      "schema": null,
      "table": "region",
      "snapshot": "true",
      "server_id": null,
      "gtid": null,
      "file": null,
      "pos": null,
      "row": null,
      "thread": null,
      "query": "INSERT INTO tpch.region(r_regionkey, r_name, r_comment) VALUES(3, EUROPE, ly final courts cajole furiously final excuse)"
    },
    "op": "r",
    "ts_ms": null
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
    "r_regionkey": 10
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
        "optional": true,
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
        "optional": true,
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
            "optional": true,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": true,
            "field": "db"
          },
          {
            "type": "string",
            "optional": true,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": false,
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
            "optional": true,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": true,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": true,
            "field": "row"
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
    "before": {},
    "after": {
      "r_regionkey": 10,
      "r_name": "Test_nation",
      "r_comment": "ReplicationWorks"
    },
    "source": {
      "version": "5.7.41",
      "connector": "MYSQL",
      "name": "KAFKA_Connector",
      "ts_ms": 1680798995000,
      "db": "tpch",
      "schema": null,
      "table": "region",
      "snapshot": "false",
      "server_id": "1",
      "gtid": null,
      "file": "mysql-log.000013",
      "pos": 30407,
      "row": 1,
      "thread": 309,
      "query": "INSERT INTO tpch.region(r_regionkey, r_name, r_comment) VALUES(10, Test_nation, ReplicationWorks)"
    },
    "op": "c",
    "ts_ms": 1680779196386
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
    "r_regionkey": 1
  }
}
```

##### Value structure

```JSON

KEY

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
    "r_regionkey": 1
  }
}

VALUE

{
  "schema": {
    "type": "struct",
    "optional": false,
    "name": "KAFKA_Connector.tpch.region.Envelope",
    "fields": [
      {
        "type": "struct",
        "optional": true,
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
        "optional": true,
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
            "optional": true,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": true,
            "field": "db"
          },
          {
            "type": "string",
            "optional": true,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": false,
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
            "optional": true,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": true,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": true,
            "field": "row"
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
      "r_regionkey": 1,
      "r_name": "AMERICA",
      "r_comment": "hs use ironic, even requests. s"
    },
    "after": {
      "r_regionkey": 1,
      "r_name": "AMERICA",
      "r_comment": "TestReplication"
    },
    "source": {
      "version": "5.7.41",
      "connector": "MYSQL",
      "name": "KAFKA_Connector",
      "ts_ms": 1680799780000,
      "db": "tpch",
      "schema": null,
      "table": "region",
      "snapshot": "false",
      "server_id": "1",
      "gtid": null,
      "file": "mysql-log.000013",
      "pos": 53709,
      "row": 1,
      "thread": 309,
      "query": "UPDATE tpch.region SET r_regionkey=1 AND r_name=AMERICA AND r_comment=TestReplication WHERE r_regionkey=1 AND r_name=AMERICA AND r_comment=hs use ironic, even requests. s"
    },
    "op": "u",
    "ts_ms": 1680779981001
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
    "r_regionkey": 1
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
        "optional": true,
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
        "optional": true,
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
            "optional": true,
            "field": "ts_ms"
          },
          {
            "type": "string",
            "optional": true,
            "field": "db"
          },
          {
            "type": "string",
            "optional": true,
            "field": "schema"
          },
          {
            "type": "string",
            "optional": false,
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
            "optional": true,
            "field": "server_id"
          },
          {
            "type": "string",
            "optional": true,
            "field": "gtid"
          },
          {
            "type": "string",
            "optional": true,
            "field": "file"
          },
          {
            "type": "int64",
            "optional": true,
            "field": "pos"
          },
          {
            "type": "int32",
            "optional": true,
            "field": "row"
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
      "r_regionkey": 1,
      "r_name": "AMERICA",
      "r_comment": "TestReplication"
    },
    "after": {},
    "source": {
      "version": "5.7.41",
      "connector": "MYSQL",
      "name": "KAFKA_Connector",
      "ts_ms": 1680799967000,
      "db": "tpch",
      "schema": null,
      "table": "region",
      "snapshot": "false",
      "server_id": "1",
      "gtid": null,
      "file": "mysql-log.000013",
      "pos": 59647,
      "row": 1,
      "thread": 309,
      "query": "DELETE FROM tpch.region WHERE r_regionkey=1 AND r_name=AMERICA AND r_comment=TestReplication"
    },
    "op": "d",
    "ts_ms": 1680780168069
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
    "r_regionkey": 1
  }
}
```

The value for [the preceeding Tombstone key structure is `null`](#dml-message-structure):

```JSON
null
```


{{< /details >}}