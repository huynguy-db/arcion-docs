---
title: Cluster Manager
---
# Cluster Manager Explanations

# Job Configuration File
The job configuration file contains multiple parameters that are used to add and manage Cluster Manager jobs. A sample job configuration file can be found in ```$CM_HOME_DIR/conf/jobs/jobs.yaml``` Each parameter is explained below.
  ```YAML
  add-jobs: Specify list of jobs to add to the cluster
    job-command: specify the replicant command to run. It is to be noted that the binary and the config path specified in the command must contain the binary/config files in all the VMs in the cluster. If binary/config is in different paths in different machines, use environment variable(s) in the command to redirect to the correct path in each machine. The job command and all CM commands should not contain the same --metadata switch.
    job-command-list [20.12.03.1]: specify the replicant commands to run. It is similar to job-command but different in the fact that you can provide multiple job-commands where every job-command can point to a replicant command connecting to source db node. If you have source HA in your system, you can add separate replicant jobs connecting each one of the database nodes. In case of source primary failover, CM will use the next job command to connect to secondary/tertiary and so on.  You need to specify either job-command or job-command-list.
    replicant-id: The replicant id specified for the replicant job using the --id argument. If --id has not been used, “default” should be specified.
    replicant-group: The replicant group specified for the replicant job in the distribution config. If it is not a distributed job, this field can be left empty.
    host-affinity: The host on which the replicant will run provided it is alive. The host name specified here should match one of the host-ids specified in the start-cluster command.

  restart-jobs: For restarting an existing job. The replicant job will start a fresh replication.
    replicant-id:
    replicant-group:

  resume-jobs: For resuming an existing job. The replicant job will start from where it left off.
    replicant-id:
    replicant-group:

  stop-jobs: For stopping a running replicant job.
    replicant-id:
    replicant-group:

  remove-jobs: For stopping and removing an existing job from the job pool.
    replicant-id:
    replicant-group:

  alter-host-affinity-for-jobs: For altering the host affinity of an existing job. The job will move to the new host.
    replicant-id:
    replicant-group:
    host-affinity:
  ```


## Cluster Manager Modes
There are multiple different Cluster Manager modes, each of which is explained below.
  ```YAML
    start-cluster: Starts a Cluster Manager instance on a given host/VM. For this mode we need to specify:
      -host-id: A unique string as host-id to identify the host
      -metadata: Metadata config
      -cluster: Cluster config (Optional)

    alter-cluster: Add/remove/alter jobs from/to a cluster. Note that in order to add/alter jobs to cluster, the    alter-cluster mode needs to be executed only once from any of the VMs, all CMs will automatically pick up the newly added/altered jobs. For this mode we need to specify:
      -host-id: A unique string as host-id to identify the host
      -metadata: Metadata config
      -cluster: Cluster config (Optional)

    init: Before starting a new cluster use this mode to initialize. It initializes the state of the cluster. For this mode we need to specify:
      -metadata: Metadata config
      -cluster: Cluster config (Optional)

    version: Prints the version of the cluster manager
    display: Displays a consolidated dashboard of all hosts.  For this mode we need to specify:
      -metadata: Metadata config
      -cluster: Cluster config (Optional)
  ```

## Failure Scenarios
There are a few scenarios explained below which may cause a failure to set up/run Cluster Manager.

1.	You are trying to add the same job(s) multiple times.
    Error:
    ```BASH
    2020-11-09 09:51:42 [main] ERROR Main:118 - Cluster manager failed
    tech.clustermanager.config.ConfigException: [repl1, repl1]: Job already exists
        at tech.clustermanager.AddOrAlterJobs.alter(AddOrAlterJobs.java:88)
        at tech.clustermanager.AddOrAlterJobs.run(AddOrAlterJobs.java:194)
        at tech.clustermanager.Main.main(Main.java:106)
    Failed to execute ALTER_CLUSTER
    ```

2.	You cannot resume/restart a running job.
    Error:
    ```BASH
    2020-11-09 04:31:58 [main] ERROR Main:118 - Cluster manager failed
    tech.clustermanager.config.ConfigException: Cannot resume a running job. Please stop job first
        at tech.clustermanager.AddOrAlterJobs.alter(AddOrAlterJobs.java:116)
        at tech.clustermanager.AddOrAlterJobs.run(AddOrAlterJobs.java:194)
        at tech.clustermanager.Main.main(Main.java:106)
    Failed to execute ALTER_CLUSTER
    ```
    Cause: You are trying to resume or restart a job(S) which is currently running. If you would like to temporarily stop the

  3.	You should wait for a few seconds before resuming/restarting a stopped job.

  Error: Same as Scenario 2

  Cause: When we push stop-job requests to CM, CM does a series of tasks in order to properly stop a job. This is why the request may not be acknowledged at once.
  Solution: This is why it’s advisable to resume/restart a job after it’s stopped for 30 seconds.

## Using System Service

You need to run START-CLUSTER command as system service in every host to start CM running on every host. After that according to your need, you will fire ALTER CLUSTER commands to add/stop/resume/restart/remove jobs. If the CM process is killed, the service will restart the process. On system reboot, the service will restart itself. If it finds existing job entries in metadata ready to be executed, it will start executing them. This is why it’s always better to stop/remove all jobs before stopping the service. In this case, even after system reboot, CM will not execute new jobs.

## Not Using System Service

If you don’t want to run START-CLUSTER as a system service, please issue the following command before running START-CLUSTER through command-line on every host.
export CM_RETRIES_ENABLED=1
