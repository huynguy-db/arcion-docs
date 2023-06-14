---
pageTitle: Row Verificator setup guide
title: Setup Guide
description: "Follow these step-by-step instructions to set up Arcion's Row Verificator."
weight: 2
---

# Row Verificator setup guide
This page describes the general steps you need to follow to set up the Verificator for a SQL Server-to-SingleStore pipeline.

## 1. Configure connection
To configure connection for source Microsoft SQL Server and SingleStore target, follow the instructions in these pages: 
- [Set up connection configuration for SQL Server snapshot replication]({{< ref "docs/sources/source-setup/sqlserver/snapshot-replication#ii-set-up-connection-configuration" >}}) 
- [Set up connection configuration]({{< ref "docs/targets/target-setup/singlestore#i-setup-connection-configuration" >}})

## 2. Configure filter file (optional)
To configure filter rules for your replication, see [Filter Configuration]({{< ref "filter-configuration" >}}).

## 3. Configure mapper file (optional)
To define data mapping from source to target, specify the mapping rules in the mapper file. For more information on how to define the mapping rules and run Replicant CLI with the mapper file, [Mapper Configuration]({{< ref "docs/targets/configuration-files/mapper-reference" >}}).

## 4. Configure Verificator metadata
The Row Verificator uses various metadata to ensure a fault-tolerant and distributed verification process. For more information, see [Metadata configuration]({{< relref "docs/references/metadata-reference" >}}).

## 5. Configure notification (optional)
To receive important notifications about your ongoing verification process through emails, follow the instructions in [Configure mail notifications]({{< ref "docs/notifications-and-logging/notification-reference#configure-mail-notifications" >}}).

## 5. Set up the general configuration for the Verificator
See [General configuration]({{< relref "general-configuration" >}}) for more information about the different parameters available to configure Verificator.

## 6. Get the Verificator release
<ol type="a">
<li>Download the latest version of the Row Verificator.</li>
<li>Extract it on the host machine where you want to carry out the verification process.</li>
<li>

The extraction creates a folder `replicate-row-verificator-VERSION_NUMBER` with the following contents inside:

```sh
.
├── bin
├── conf
├── filter
├── lib
├── mapper
└── target
```

- The `bin/` folder contains the Verificator binary.
- The `conf/` folder contains sample configuration files.
- The `filter/` folder contains sample [filter configurations]({{< relref "filter-configuration" >}}) for different database platforms.
- The `mapper/` folder contains sample [Mapper configurations]({{< relref "mapper-configuration" >}}) for different database platforms.
    </li>
</ol>