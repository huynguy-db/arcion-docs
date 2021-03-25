---
weight: 6
Title: Cluster Manager Setup
---

# Cluster Manager Setup

## I. Initialize Cluster Manager

1. Initialize Cluster Manager with the following command:
    ```BASH
    ./bin/replicant-cluster-manager init –metadata conf/metadata/oracle.yaml
    ```
**Note: Run this command only once to clear all existing statistics**

## II. Start Cluster Manager

1. Run the following command in every host you want to run Cluster Manager in:
    ```BASH
    ./bin/replicant-cluster-manager start-cluster --host-id host1 --metadata conf/metadata/oracle.yaml
    ```

## III. Add Jobs


1. Navigate to the sample job configuration file
    ```BASH
    vi $CM_HOME_DIR/conf/jobs/jobs.yaml
    ```

2. Edit the following job configuration as necessary:
    ```YAML
    add-jobs:
      job-command: "Enter the command you use to run Replicant"
      replicant-id: "Enter the value pf ```--id``` from the job command"
      replicant-group: "Enter the group id specified in Replicant's distribution configuration" ##Only applicable is using distributed replication
      host-affinity: "Enter the host-id of Cluster Manager"
    ```

3. Add the job:
    ```BASH
    ./bin/replicant-cluster-manager alter-cluster --metadata conf/metadata/oracle.yaml --jobs conf/jobs/jobs.yaml
    ```

## Managing Jobs
Using the job configuration file, the following operations can be performed on a previously added job in Cluster Manager

* Stop a job
  ```YAML
  stop-jobs:
    replicant-id:
    replicant-group:
  ```
* Restart a job
  ```YAML
  restart-jobs:
    replicant-id:
    replicant-group:
  ```
* Resume a job
  ```YAML
  resume-jobs:
    replicant-id:
    replicant-group:
  ```
* Remove a job
  ```YAML
  remove-jobs:
    replicant-id:
    replicant-group:
  ```
* Change host affinity for a job
  ```YAML
  alter-host-affinity-for-jobs:
    replicant-id:
    replicant-group:
    host-affinity:
  ```


# Cluster Manager as a System Service Setup
Setting up CM as a service system is optional but if you wish to do so, follow the proceeding steps.

## I. Create a Service

1. Enter the following command to start a service:
    ```BASH
    vim /etc/systemd/system/replicant-cluster-manager.service
    ```

2. Copy-paste the following example content in the file and change it accordingly:

    ```service
    [Unit]
    Description=Replicant Cluster Manager
    After=network.target

    [Service]
    ExecStart=/home/repo/cm2/replicant-cluster-manager/bin/replicant-cluster-manager start-cluster --metadata /home/repo/cm2/replicant-cluster-manager/conf/metadata/oracle.yaml --host-id "host1"

    SuccessExitStatus=0 2
    Restart=on-failure
    RestartSec=10

    [Install]
    WantedBy=multi-user.target
    ```
  **Note: In the ```ExecStart``` field, please write the start-cluster command with absolute path for every file.
  You can keep the other configurations as it is.**

## II. Start the Service

1. Enter the following commands to start the service:
    ```BASH
    systemctl daemon-reload
    systemctl enable replicant-cluster-manager.service
    systemctl start replicant-cluster-manager
    ```

## III. Managing the Service

To check the status of your service:
    ```
    systemctl status replicant-cluster-manager
    ```

To stop you service:
    ```
    systemctl stop replicant-cluster-manager
    ```

To view real-time CM output:
    ```
    journalctl -f -u replicant-cluster-manager
    ```
