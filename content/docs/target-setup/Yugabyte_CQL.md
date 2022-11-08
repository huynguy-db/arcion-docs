---
pageTitle: Documentation for YugabyteCQL Target connector
title: YugabyteCQL
description: "Learn everything you need to know for setting up YugabyteCQL as data Target for your data pipelines using Arcion Yugabyte connector."
weight: 4
bookHidden: false
---
# Destination YugabyteCQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample YugabyteSQL connection configuration file:
    ```BASH
    vi conf/conn/yugabytecql.yaml
    ```
2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
    
    Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:
    ```YAML
    type: YUGABYTE_CQL

    #You can specify multiple Cassandra nodes using the format below:
    cassandra-nodes:
      node1: #Replace node1 with your node name
        host: 172.17.0.2 #Replace 172.17.0.2 with your node's host
        port: 9042 #Replace 9042 with your node's port
      node2: #Replace node2 with your node name
        host: 172.17.0.3 #Replace 172.17.0.3 with your node's host
        port: 9043 #Replace 9042 with your node's port    

    username: 'replicant' #Replace replicant with your username that connects to your Cassandra server
    password: 'Replicant#123' #Replace Replicant123#  with your user's password

    #read-consistency-level: LOCAL_QUORUM  
    #write-consistency-level: LOCAL_QUORUM

    max-connections: 30 #Specify the maximum number of connections replicant can open in YugabyteCQL
    ```
      - Allowed values for `read-consistency-level` and `write-consistency-level` are: 
        - `ANY`
        - `ONE`
        - `TWO`
        - `THREE`
        - `QUORUM`
        - `ALL`
        - `LOCAL_QUORUM `(default value)
        - `EACH_QUORUM`
        - `SERIAL`
        - `LOCAL_SERIAL`
        - `LOCAL_ONE`

## II. Set up Applier Configuration

1. From `$REPLICANT_HOME`, naviagte to the sample YugabyteSQL Applier configuration file:
    ```BASH
    vi conf/dst/yugabytecql.yaml
    ```
2. The file contains the following sample snapshot configuration:

    ```YAML
    snapshot:
      threads: 16

      bulk-load:
        enable: true
        type: FILE #FILE or PIPE
        serialize: true

        #For versions 20.09.14.3 and beyond
        native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```

For a detailed explanation of configuration parameters in the Applier file, see [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").
