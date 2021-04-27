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

    host: localhost #Replace localhost with your Cockroach host
    port: 26257 #Replace the 26257 with the port of your host

    username: 'replicant' #Replace replicant with the username of your user that connects to your Cockroach server
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections Replicant can open in Cockroach

    #It is possible to load data from a local stage, native stage, or external stage like s3 into Cockroach. To do so, specify the details Replicant needs to connect to the stage as follows:

    stage:
      type: NATIVE|LOCAL_FS|S3
      conn-url: postgresql://root@localhost:57595 #Replace postgresql://root@localhost:57595 with your stage URL
      root-dir: /replicate #Replace replicate with your stage directory's path
      user: root #Replace root with your stage user
    certificate-directory: /home/cockroach/certs #Enter your certificate directory path
    ```
    * **Note**: For a native stage, you must install cockroach on the host running Replicant with the following four steps:

    1. wget -qO- https://binaries.cockroachdb.com/cockroach-v20.1.0-beta.1.linux-amd64.tgz | tar xvz

    2. Copy the binary into your PATH so it's easy to execute cockroach commands from any shell:
        ```BASH
        cp -i cockroach-v20.1.0-beta.1.linux-amd64/cockroach /usr/local/bin/
        ```
    3. If you get a permissions error, prefix the command with sudo.

    4. Verify that cockroach nodelocal upload is a valid command.

    * **NOTE** : The target CockroachDB version must support cockroach nodelocal upload command for this stage type to work



## II. Setup Applier Configuration

1. Navigate to the applier configuration file
    ```BASH
    vi conf/dst/cockroach.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
     threads: 16 #Specify the maximum number of threads Replicant should use for writing to the target

     #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
     bulk-load:
       enable: true|false #Set to true if you want to enable bulk loading
       type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
       method: IMPORT # COPY, IMPORT
       max-files-per-bulk-load: 10 #Specify the maximum number of files that can be replicated per bulk-load
       node-id: 1
       serialize: false|true #Serialize must be true for method IMPORT
       serialize-stage-upload: false

    # bulk-load:
    #   enable: true
    #   type: FILE   # PIPE, FILE
    #   method: COPY # COPY, IMPORT
    #   max-files-per-bulk-load: 1
    #   serialize: false


    ```
