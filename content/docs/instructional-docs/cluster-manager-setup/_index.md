---
weight: 6
Title: Cluster Manager Setup
---

# Cluster Manager Setup

## I. Initialize CM

1. Initialize Cluster Manager with the following command:
    ```BASH
    ./bin/replicant-cluster-manager init –metadata conf/metadata/oracle.yaml
    ```
**Note: Run this command only once to clear all existing statistics**

## II. Start CM

1. Run the following command in every host you want to run Cluster Manager in:
    ```BASH
    ./bin/replicant-cluster-manager start-cluster --host-id host1 --metadata conf/metadata/oracle.yaml
    ```

## III. Add Jobs

1. Add a job to CM:
    ```BASH
    ./bin/replicant-cluster-manager alter-cluster --metadata conf/metadata/oracle.yaml --jobs conf/jobs/jobs.yaml
    ```
## IV. Configure Jobs

1. Navigate to the sample job configuration file
    ```BASH
    vi <CM_home_dir>/conf/jobs/jobs.yaml
    ```
2. Edit the following job configurations as necessary:
    ```BASH
    add-jobs:
      job-command:
      job-command-list:
      replicant-id: ##Specify the replicant id for the replicant job using the --id argument. If --id has not been used, “default” should be specified.
      replicant-group: ##Enter the replicant group specified for the replicant job in the distribution config. If it is not a distributed job, this field can be left empty
      host-affinity: ##Enter the host-id specified in the start-cluster command

    restart-jobs:
      replicant-id:
      replicant-group:

    resume-jobs:
      replicant-id:
      replicant-group:

    stop-jobs:
      replicant-id:
      replicant-group:

    remove-jobs:
      replicant-id:
      replicant-group:

    alter-host-affinity-for-jobs:
      replicant-id:
      replicant-group:
      host-affinity:

    ```


## V. Stopping Job(s)

To stop a job, navigate to the jobs configuration file (check step 4.1) and under the ```stop-jobs``` section, enter the ```replicant-id``` and ```replicant-group``` of the job you want to stop.

## VI. Resuming Job(s)

To resume a job, navigate to the jobs configuration file (check step 4.1) and under the ```resume-jobs``` section, enter the ```replicant-id``` and ```replicant-group``` of the job you want to resume.

## VII. Restarting Job(s)

To restart a job, navigate to the jobs configuration file (check step 4.1) and under the ```restart-jobs``` section, enter the ```replicant-id``` and ```replicant-group``` of the job you want to restart.

## VIII. Removing Job(s)

To remove a job, navigate to the jobs configuration file (check step 4.1) and under the ```remove-jobs``` section, enter the ```replicant-id``` and ```replicant-group``` of the job you want to remove.

## IX. Altering Host Affinity

To change the host of a job, navigate to the jobs configuration file (check step 4.1) and under the ```alter-host-affinity-for-jobs``` section, enter the ```replicant-id``` and ```replicant-group``` of the job for which you want to change the source. Enter the new host-id next to ```host-affinity```

# Cluster Manager as a System Service Setup
Setting up CM as a service system is optional but if you wish to do so, follow the proceeding steps.

## I. Create a Service

1. Enter the following command to start a service:
    ```BASH
    vim /etc/systemd/system/replicant-cluster-manager.service
    ```

2. Copy-paste the following example content in the file and change it acoordingly:

    ```
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
