---
title: Cluster Manager
weight: 9
bookHidden: true
---
# Cluster Manager Explanations

# Job Configuration File
The job configuration file contains multiple parameters that are used to add and manage Cluster Manager jobs. A sample job configuration file can be found in ```$CM_HOME_DIR/conf/jobs/jobs.yaml``` Each parameter is explained below.

  1. **add-jobs**: Specify list of jobs to add to the cluster
      * **job-command**: specify the replicant command to run. It is to be noted that the binary and the config path specified in the command must contain the binary/config files in all the VMs in the cluster. If binary/config is in different paths in different machines, use environment variable(s) in the command to redirect to the correct path in each machine. The job command and all CM commands should not contain the same --metadata switch.
      * **job-command-list [20.12.03.1]**: specify the replicant commands to run. It is similar to job-command but different in the fact that you can provide multiple job-commands where every job-command can point to a replicant command connecting to source db node. If you have source HA in your system, you can add separate replicant jobs connecting each one of the database nodes. In case of source primary failover, CM will use the next job command to connect to secondary/tertiary and so on.  You need to specify either job-command or job-command-list.
      * **replicant-id**: The replicant id specified for the replicant job using the --id argument. If --id has not been used, “default” should be specified.
      * **replicant-group**: The replicant group specified for the replicant job in the distribution config. If it is not a distributed job, this field can be left empty.
      * **host-affinity**: The host on which the replicant will run provided it is alive. The host name specified here should match one of the host-ids specified in the start-cluster command.

  2. **restart-jobs**: For restarting an existing job. The replicant job will re-start from scratch
      * **replicant-id**:
      * **replicant-group**:

  3. **resume-jobs**: For resuming an existing job. The replicant job will start from where it left off.
      * **replicant-id**:
      * **replicant-group**:

  4. **stop-jobs**: For stopping a running replicant job.
      * **replicant-id**:
      * **replicant-group**:

  5. **remove-jobs**: For stopping and removing an existing job from the job pool.
      * **replicant-id**:
      * **replicant-group**:

  6. **alter-host-affinity-for-jobs**: For altering the host affinity of an existing job. The job will move to the new host.
      * **replicant-id**:
      * **replicant-group**:
      * **host-affinity**:



## Cluster Manager Modes
There are multiple different Cluster Manager modes, each of which is explained below.

    1. **start-cluster**: Starts a Cluster Manager instance on a given host/VM. For this mode we need to specify:
        * **-host-id**: A unique string as host-id to identify the host
        * **-metadata**: Metadata config
        * **-cluster**: Cluster config (Optional)

    2. **alter-cluster**: Add/remove/alter jobs from/to a cluster. Note that in order to add/alter jobs to cluster, the    alter-cluster mode needs to be executed only once from any of the VMs, all CMs will automatically pick up the newly added/altered jobs. For this mode we need to specify:
        * **-host-id**: A unique string as host-id to identify the host
        * **-metadata**: Metadata config
        * **-cluster**: Cluster config (Optional)

    3. **init**: Before starting a new cluster use this mode to initialize. It initializes the state of the cluster. For this mode we need to specify:
        * **-metadata**: Metadata config
        * **-cluster**: Cluster config (Optional)

    4. **version**: Prints the version of the cluster manager
    display: Displays a consolidated dashboard of all hosts.  For this mode we need to specify:
        * **-metadata**: Metadata config
        * **-cluster**: Cluster config (Optional)



## Using System Service

You need to run START-CLUSTER command as system service in every host to start CM running on every host. After that according to your need, you will fire ALTER CLUSTER commands to add/stop/resume/restart/remove jobs. If the CM process is killed, the service will restart the process. On system reboot, the service will restart itself. If it finds existing job entries in metadata ready to be executed, it will start executing them. This is why it’s always better to stop/remove all jobs before stopping the service. In this case, even after system reboot, CM will not execute new jobs.

## Not Using System Service

If you don’t want to run START-CLUSTER as a system service, please issue the following command before running START-CLUSTER through command-line on every host.
export CM_RETRIES_ENABLED=1
