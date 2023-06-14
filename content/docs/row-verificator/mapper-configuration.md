---
pageTitle: Mapper configuration for Replicate Row Verificator
title: Mapper Configuration
description: "Set up the mapper configuration for the Row Verificator. The mapper file specifies custom source data mapping to the target."
weight: 5
---

# Mapper configuration for the Verificator
The Mapper file defines how source data maps to the target database.

## Overview
While verifying data between storages of different types, the Verificator makes the best attempt at verifying the target data against the source data while maintaining the source data structure.  But in some situations, you might need more control over source data mapping. That’s where a Mapper file comes in.

By using the Mapper file, you can precisely define how the source data maps to the target database. Therefore, the Mapper file plays a crucial part in proper verification of data across your data pipeline.

## How to define and use Mapper file for the Verificator
The Mapper file you specify to the Verificator works similarly to how you define and use Mapper file to Arcion Replicant. See [Mapper Reference]({{< ref "docs/targets/configuration-files/mapper-reference" >}}) for an in-depth guide on defining and using Mapper file.

To specify the Mapper file to the Verificator, use the `--map` option and provide it the full path to the Mapper configuration file. For example, the following command runs the Verificator for a SQL Server-to-SingleStore pipeline and specifies a Mapper file:

```sh
./bin/replicate-row-verificator verify \
conf/conn/sqlserver.yaml conf/conn/singlestore.yaml \
--map sqlserver_to_singlestore.yaml
```