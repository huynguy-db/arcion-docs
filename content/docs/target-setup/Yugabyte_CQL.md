---
title: YugabyteCQL
weight: 8
bookHidden: false
---
# Destination YugabyteCQL

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample YugabyteSQL connection configuration file:
    ```BASH
    vi conf/conn/memsql.yaml
    ```
2. Make the necessary changes as follows:
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

1. From `$REPLICANT_HOME`, naviagte to the sample YugabyteSQL applier configuration file:
    ```BASH
    vi conf/dst/yugabytecql.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16 #Specify the maximum number of threads Replicant should use for writing to the target

      #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
      bulk-load:
        enable: true|false #Set to true if you want to enable bulk loading
        type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
        serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

        #For versions 20.09.14.3 and beyond
        native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```

For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").
