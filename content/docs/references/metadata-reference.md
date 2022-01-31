---
title: Metadata Configuration
weight: 11
---

In order to carry out a fault-tolerant distributed replication, Blitzz Replicant needs to maintain a number of metadata tables of its own. It is possible to provision a separate metadata database using this configuration to make Replicant store all metadata tables in that database. If you don't specify this configuration, then Replicant will use the destination database itself to store metadata tables.
   
1. `type`: The type of the metadata database.
2. `connection`: The connection config of the metadata database.
3. `ddl-connection`*[v21.05.04.4]*: This optional section can be used to specify the configurations parameters for the connections to be used specially for DDL operations. All the connection configuration parameters above can be configured for DDL connections.
5. `catalog`: The catalog to be used for storing metadata.
6. `schema`: The schema to be used for storing metadata.
