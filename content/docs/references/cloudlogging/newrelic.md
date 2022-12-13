---
pageTitle: Send replication statistics and logs to New Relic
title: New Relic 
description: "Replicant can send replication statistics and logs to New Relic. Learn how to configure New Relic connection and run Replicant with those configurations."
weight: 5
---

# Send replication statistics and logs to New Relic

Enterprises can gain valuable business metrics from a centralized, all-in-one log management platform such as [New Relic](https://newrelic.com/platform/log-management). With that in mind, Arcion has added support for New Relic from version 22.10.28.2.

To send your replication statistics and logs to New Relic, follow the steps below.

## Configure logging details

Replicant can take a YAML configuration file as inuput when using New Relic as cloud logger. In this file, you can configure logging details to suit your requirements. The following options are available:

### `type`
The type of cloud logger. In this case it's `NEW_RELIC`.

### `license-key`
The 40-character New Relic license key associated with your New Relic account. For more information, see [New Relic License Key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#license-key).

### `region`
Region where New Relic is hosted. Available regions are `US` and `EU`.

*Default value: `US`.*

### `metrics-logging`
Option to configure replication statistics that you want to send to New Relic. It has the following parameters:
  <dl class="dl-indent">

  <dt><code>enable</code></dt>
  <dd>
    <code>true</code> or <code>false</code>.
    <p>Enable sending replication statistics to New Relic.</p>
    <i>Default value: <code>true</code>.</i>
  </dd>

  <dt><code>interval-s</code></dt>
  <dd>The interval between each successive transfer in seconds.</dd>

  <dt><code>prefix</code></dt>
  <dd>The prefix to add to each metric. Default prefix is <code>arcion.core</code>.</dd>

  <dt><code>custom-attributes</code></dt>
  <dd>To add user-defined attribute (<code>key</code>, <code>val</code>) in each metric for grouping. For example, you may add the pipeline information by adding Source and Target attributes like below:

  ```YAML
  custom-attributes:
    source: Oracle
    target: Databricks
  ```
  </dd>
  
### `trace-logging`
Option to configure replication logs that you want to send to New Relic. It has the following parameters:
  <dl class="dl-indent">

  <dt><code>enable</code></dt>
  <dd>
    <code>true</code> or <code>false</code>.
    <p>Enable sending replication logs to New Relic.</p>
    <i>Default value: <code>false</code></i>
  </dd>

  <dt><code>interval-s</code></dt>
  <dd>The interval between each successive transfer in seconds.</dd>

  <dt><code>custom-attributes</code></dt>
  <dd>To add user-defined attribute (<code>key</code>, <code>val</code>) in each log for grouping. For example, you may add the pipeline information by adding Source and Target attributes like below:

  ```YAML
  custom-attributes:
    source: Oracle
    target: Databricks
  ```
  </dd>

  </dl>

### `monitor-activity`
`true` or `false`.

If `true`, metric and trace logger threads will dump their activity [in the `trace.log` file]({{< relref "../troubleshooting.md#locate-the-log-files" >}}).

### `max-retries`
Number of times Replicant will try again a failed operation.

*Default value: `20`.*

### `retry-wait-duration-ms`
Duration in milliseconds Replicant should wait before performing then next retry of a failed operation.

*Default value: `1000`.*

Below is a sample configuration file:

```YAML
type: NEW_RELIC

license-key: "LICENSE_KEY"

metrics-logging:
  enable: true
  interval-s: 5
  custom-attributes:
    host: localhost
    pipeline: Oracle->Databricks

trace-logging:
  enable: false
  interval-s: 5
  custom-attributes:
    replicationMode: FULL
    pipeline: Oracle->Databricks
  
monitor-activity: true
```

Replace *`LICENSE_KEY`* [with your New Relic license key](#license-key).

## Run Replicant
As the final step, run Replicant with the `--cloud-logger` argument, providing it the path to the configuration file. For example:

```sh
./bin/replicant full conf/conn/oracle_src.yaml conf/conn/databricks_aws_uc.yaml \
--filter filter/oracle_filter.yaml \
--cloud-logger conf/cloudlogger/newrelic.yaml
```