---
title: Teradata
weight: 7
bookHidden: false
---

# Source Teradata

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/teradata.yaml
   ```

2. Make the necessary changes as follows:

   ```YAML
   type: TERADATA

   #url: jdbc:teradata://192.168.0.106/DBS_PORT=1025,ENCRYPTDATA=ON,TYPE=FASTEXPORT,USER=replicant,PASSWORD=Replicant#123
   host: 192.168.44.128
   port: 1025

   username: 'replicant'
   password: 'Replicant#123'

   #credential-store:
   #  type: PKCS12
   #  path: #Location of key-store
   #  key-prefix: "teradata_"
   #  password: #If password to key-store is not provided then default password will be used

   tpt-connection: #Connection configuration for TPT jobs
     host: 192.168.0.108 #Teradata host name
     username: 'replicant' #Teradata server username
     password: 'Replicant#123'
       #credential-store:
       #  type: PKCS12
       #  path: #path to your keystore file
       #  key-prefix: # prefix of the keystore entry
       #  password: # optional, keystore password
     #use-ldap: true  #Whether TPT should use LDAP mechanism to connect to TD
     #max-sessions: 16  #Max sessions per TPT job
     #min-sessions: 1 #Min sessions per TPT job
     #tenacity-hrs: 1 #Number of hours TPT continues trying logon
     #tenacity-sleep-mins: 1 #Sleep duration before each retry


   max-connections: 30 # Maximum number of connections replicant would use to fetch data from source Teradata.

   max-retries: 10 
   retry-wait-duration-ms: 1000

   max-conn-retries: #Number of times any operation on the source system will be re-attempted on failures.
   conn-retry-wait-duration-ms: 5000 #Duration in milliseconds Replicant should wait before performing then next retry of a failed operation
   ```
   - **url**: You can directly specify the exact URL that the JDBC driver will use to connect to the source. In that case you don't need to specify the `host`, `port`, `usrename`, and `password` parameters separately. Instead, embed them within the URL as the example above shows:

     ```YAML
     url: jdbc:teradata://192.168.0.106/DBS_PORT=1025,ENCRYPTDATA=ON,TYPE=FASTEXPORT,USER=replicant,PASSWORD=Replicant#123
      ```
   - **credential-store**: Replicant supports consuming `username`, `password`, and `url` configurations from a _credentials store_ rather than having users specify them in plain text config file. You can use keystores to store your credentials related to your Teradata server connections and TPT jobs. You should create entries in the credential store for your configs using a prefix and specify the prefix in your config file. For example, you can create keystore entries with aliases `tdserver1_username` and `tdserver1_password`. You can then specify the prefix here as `tdserver1_`.

   {{< hint "info" >}}
   The keystore `password` parameters are optional. If you don't specify the keystore password here, then:
   - For connecting to Teradata server, you must use the UUID from your license file as the keystore password. Remember to keep your license file somewhere safe in order to keep this password secure.
   - For TPT connection, the default password will be used.
   {{< /hint >}}

## II. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
   ```BASH
   vi conf/src/teradata.yaml
   ```
  
    a. For snapshot mode, make the necessary changes as follows in the `snapshot` section of the configuration file:

    ```YAML
    snapshot:
      threads: 32
      fetch-size-rows: 10_000

      min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32
      verifyRowCount: false
      _traceDBTasks: true

    #  split-method: RANGE  # Allowed values are RANGE, MODULO
    #  extraction-method: QUERY # Allowed values are QUERY, TPT
    #  tpt-num-files-per-job: 16
    #  native-extract-options:
    #    charset: "ASCII"  #Allowed values are ASCII, UTF8
    #    compression-type: "GZIP" #Allowed values are GZIP and NONE

      per-table-config:
      - schema: tpch
        tables:
    #     testTable
    #       split-key: split-key-column
          part:
            split-key: partkey
          partsupp:
            split-key: partkey
          supplier:
          orders:
            split-key: orderkey
    #        split-method: RANGE      #Table level overridable config, allowed values : RANGE, MODULO
    #        extraction-method: TPT   # Allowed values are QUERY, TPT
    #        tpt-num-files-per-job: 16
    #        extraction-priority: 2  #Higher value is higher priority. Both positive and negative values are allowed. Default priority is 0 if unspecified.
    #        split-hints:
    #          row-count-estimate: 15000
    #          split-key-min-value: 1
    #          split-key-max-value: 60_000
    #        native-extract-options:
    #          charset: "ASCII"  #Allowed values are ASCII, UTF8
    #          column-size-map:  #User specified column size/length to be used while exporting with TPT
    #            "COL1": 2
    #            "COL2": 4
    #            "COL3": 3
    #          compression-type: "GZIP"

          parts_view:
            row-identifier-key: [partkey]
            split-key: last_update_time
          partsupp_macro:
            update-key: [partkey]
            split-key: last_update_time
    ```

    b. For delta snapshot mode, make the necessary changes as follows in the `delta-snapshot` section of the configuration file:

    ```YAML
    delta-snapshot:

      threads: 32
      fetch-size-rows: 10_000

      min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32
      _max-delete-jobs-per-chunk: 32

      split-method: RANGE  # Allowed values are RANGE, MODULO
    #  extraction-method: QUERY # Allowed values are QUERY, TPT
    #  tpt-num-files-per-job: 16
    #  native-extract-options:
    #    charset: "ASCII"  #Allowed values are ASCII, UTF8
    #    compression-type: "GZIP"

      split-key: last_update_time
      delta-snapshot-key: last_update_time
      delta-snapshot-interval: 10
      delta-snapshot-delete-interval: 10
      _traceDBTasks: true
      replicate-deletes: false

      per-table-config:
      - schema: tpch
        tables:
    #     testTable
    #        split-key: split-key-column  # Any numeric/timestamp column with sufficiently large number of distincts
    #        extraction-method: TPT   # Allowed values are QUERY, TPT
    #        tpt-num-files-per-job: 16
    #        extraction-priority: 1  #Higher value is higher priority. Both positive and negative values are allowed. Default priority is 0 if unspecified.
    #        split-hints:
    #          row-count-estimate: 100000  # Estimated row count, if supplied replicant will leverage
    #          split-key-min-value: 1      #Lower bound of split key value
    #          split-key-max-value: 60_000 #Upper bound of split key value, if supplied replicant will leverage and avoid querying source database for the same
    #        native-extract-options:
    #          charset: "UTF8"  #Allowed values are ASCII, UTF8
    #          column-size-map:  #User specified column size/length to be used while exporting with TPT
    #            "COL1": 2
    #            "COL2": 4
    #            "COL3": 3
    #          compression-type: "GZIP"

    #       delta-snapshot-key: delta-snapshot-key-column  # A monotonic increasing numeric/timestamp column which gets new value on each INSERT/UPDATE
    #       row-identifier-key: [col1, col2]   # A set of columns which uniquely identify a row
    #       update-key: [col1, col2]  # A set of columns which replicant should use to perform deletes/updates during incremental replication
          part:
            split-key: partkey
            row-identifier-key: [partkey]
          partsupp:
            split-key: partkey
            row-identifier-key: [partkey, suppkey]
          supplier:
          orders:
            split-key: orderkey
            split-method: MODULO
            split-hints:
              row-count-estimate: 15000
              split-key-min-value: 1
              split-key-max-value: 60_000

          parts_view:
            update-key: [partkey]
            delta-snapshot-key: last_update_time
            split-key: last_update_time
          partsupp_macro:
            update-key: [partkey]
            delta-snapshot-key: last_update_time
            split-key: last_update_time
    ```

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
