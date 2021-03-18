---
weight: 6
Title: Cluster Manager Setup
---

# Cluster Manager Setup

## Step One:

On each machine start the cluster manager with the start-cluster mode. Once all the VMs have the CM process running, add jobs to the cluster using the alter-cluster mode from any one of the VMs. The preferred hosts for each job will pick up the jobs and start executing. Before running start-cluster command in all hosts, run init mode ONCE to clear all existing statistics.

Sample command for init:
./bin/replicate-cluster-manager init --metadata conf/metadata/replicate.yaml

Sample command for start-cluster:
./bin/replicate-cluster-manager start-cluster --host-id host1 --metadata conf/metadata/replicate.yaml

Sample config for alter-cluster:
./bin/replicate-cluster-manager alter-cluster --metadata conf/metadata/replicate.yaml --jobs conf/jobs/jobs.yaml

## Step Two:
