---
title: Cockroach
weight: 4
---
# Destination Cockroach

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample memSQL connection configuration file
    ```BASH
    vi conf/conn/cockroach.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: COCKROACH

    host: localhost
    port: 26257

    username: 'replicant'
    password: 'Replicant#123'

    max-connections: 30

    stage:
      type: NATIVE
      conn-url: postgresql://root@localhost:57595
      root-dir: /replicate
      user: root
    certificate-directory: /home/cockroach/certs

    #stage:
    #  type: SHARED_FS
    #  conn-url: /cockroach-data/extern
    #  root-dir:

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

1. Navigate to the applier configuration file
    ```BASH
    vi conf/dst/cockroach.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
     threads: 16

     bulk-load:
       enable: true
       type: FILE   # PIPE, FILE
       method: IMPORT # COPY, IMPORT
       max-files-per-bulk-load: 10
       node-id: 1
       serialize: true
       serialize-stage-upload: false

    # bulk-load:
    #   enable: true
    #   type: FILE   # PIPE, FILE
    #   method: COPY # COPY, IMPORT
    #   max-files-per-bulk-load: 1
    #   serialize: false


    ```
