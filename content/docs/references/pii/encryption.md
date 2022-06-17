---
title: "Encryption"
weight: 1
bookHidden: true
---

# Encryption

Starting from major release 22.06.06.0, Arcion will support encryption of data from JDBC-based sources. This is the first part of Arcion's PII protection support, with more security features soon to follow.

## Usage

This feature allows encryption of columns using an encryption key. Users can specify encryption keys in the following two ways:

- **Secure Store**: This is a database which stores column level encryption keys in a table. This can be a read-only store which holds encryption keys. A predefined schema is used for encryption keys sepcification.

- **Configuration file**: A YAML config file that holds encryption keys. This is a secondary way used to specify keys in absence of Secure Store. Keys are not persisted anywhere. 

If a column has keys specified in both Secure Store and configuration file, Replicant will exit throwing an error due to the ambiguity. 

 
## Secure Store database
If you choose the Secure Store method, you need to specify its connection configuration in a file. This file holds details of the Secure Store database and how to connect to it. The following is a sample:

```YAML
type: MYSQL
connection:
  host: localhost
  port: 57535

  username: 'replicate'
  password: 'Replicate#123'
  max-connections: 30
catalog: io_replicate
```
 
### Defining schema for key specification
In order to define the schema that provides the specifications for encryption keys, you can use the following SQL:

```SQL
create table replicate_io_encryption_keys(catalog varchar(256), `schema` varchar(256), table_name varchar(256), column_name varchar(256), encryption_key varchar(256));
```

## Configuration file format
Users can also specify encryption keys inside a YAML configuration file. This file specifies what columns need to be encrypted. Only columns specified in this file are encrypted. If encrytion keys are not present in this file, they will be taken from Secure Store. Encryption key can not be specified in both places. 

```YAML 
secure-db:
- catalog: "tpch_scale_0_01"
  secure-table:
    nation:
      encrypt:
        comments : key1
        nation_name:
      mask: []
    region:
      encrypt:
        comments: gawedjegedxo00342
      mask: []
```

## Running Replicant
After you have completed the necessary steps, you can run Replicant with the following arguments:

```sh
./bin/replicant full conf/conn/mysql_src.yaml conf/conn/mysql_dst.yaml \
--extractor conf/src/mysql.yaml \ 
--applier conf/dst/mysql.yaml \
--filter filter/mysql_filter.yaml \
--overwrite --replace  --general conf/general/general.yaml \
--verbose --encrypt conf/encryption/encryption.yaml \
--securestore conf/conn/securestore/mysql_securestore.yaml
```

Notice how we're using the `--encrypt` and `--securestore` arguments to provide path to the encryption file and Secure Store connection configuration file respectively.