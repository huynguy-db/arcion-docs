---
pageTitle: Learn how the Verificator uses unique IDs to ensure correct verification
title: Verification ID
description: "Each Verificator job relies on a unique ID to ensure correct verification."
weight: 9
---

# Verification ID
You can start each Verificator job with an `--id` option. You must provide a unique ID to each independent verification job. 

This ID works as a very important attribute internally in maintaining and differentiating metadata for individual Verificator jobs.

We strongly recommended that you start each Verificator job by specifying a unique ID for each job. If you do not provide an ID, the Verificator uses the value `default` as the ID.

Once the Verificator starts with an ID value—for example, `ver1`, you must specify the same ID for all subsequent initiations of this job [in resume mode]({{< relref "running-the-verificator#resume-the-verificator" >}}). This ensures that the Verificator correctly resumes verification for that particular job. 