---
title: SAP ASE
weight: 15
bookHidden: false
---

# Source SAP ASE

{{< hint "info" >}} **Note:** Currently, Arcion Replicant supports SAP ASE for snapshot mode only.{{< /hint >}}

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/sybasease_src.yaml
   ```

2. Make the necessary changes as follows:

    ```YAML
    type: SYBASE_ASE

    host: HOSTNAME
    port: PORT_NUMBER

    database: 'DATABASE_NAME'
    username: 'USERNAME'
    password: 'PASSWORD'

    max-connections: 20
    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

    Replace the following:

    - *`HOSTNAME`*: hostname of the SAP ASE server.
    - *`PORT_NUMBER`*: port number of the SAP ASE server.
    - *`DATABASE`*: the name of the SAP ASE database to connect to.
    - *`USERNAME`*: the username of the *`DATABASE`* user.
    - *`PASSWORD`*: the password associated with *`USERNAME`*.

## II. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Extractor configuration file:

    ```BASH
    vi conf/src/sybasease.yaml
    ```

2. Currently, Arcion only supports snapshot mode for SAP ASE as Source. So make the necessary changes as follows in the `snapshot` section of the configuration file:

    ```YAML
    snapshot:
      threads: 32
      fetch-size-rows: 10_000

      min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32

      per-table-config:
        - schema: tpch
          tables:
            partsupp:
              split-key: ps_partkey
            supplier:
              split-key: s_suppkey
            orders:
              split-key: o_orderkey
            nation:
              split-key: n_regionkey
    ```

For a detailed explanation of configuration parameters in the Extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").