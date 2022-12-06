
---
pageTitle: Configure notifications from Replicant
title: Notification Configuration
description: "Replicant can send important notifications to the user. Learn about different notification features, what notifications you want, and how to configure them."
weight: 5
---

# Configure notifications
Replicant can send you important notifications regarding various replication status. For example, you can easily choose the type of notifications, notification recipients, and so on. Having up to date information always at your disposal can significantly help you monitor your data pipelines more effectively.

## Overview
You can choose to receive 

## The notification configuration file
The notification configuration file `notifications.yaml` specifies the types of notifications Replicant sends. You can find a sample notification configuration file inside the `conf/notification` directory of [your Arcion self-hosted download]({{< relref "../quickstart#ii-download-replicant-and-create-a-home-repository" >}}). To know about the available configuration parameters in the notification configuration file, see the following sections.

## Configure mail notifications
If you choose to receive notifications by mail, you can configure them under the `mail-alert` section of the configuration file. For more information, see the sample at the end of this section. 

The following parameters are available to configure mail notifications:

### `enable`
`true` or `false`.

Whether to enable mail notifications.

### `smtp-host`
The SMTP hostname—for example, `smtp.gmail.com`.

### `smtp-port`
The SMTP port number—for example, `587`.

### `authentication`
To configure authentication. For authentication, the following parameters are available:
<dl>
<dt><code>enable</code><dt>
<dd>
   <code>true</code> or <code>false</code>.

Whether to enable authentication. You must enable this for Gmail, Yahoo, or other authenticated services.
</dd>
</dl>

### `protocol`
The authentication protocol—for example, `TLS` and `SSL`. Note that port for TLS and SSL are different.

### `sender-username` *[20.07.16.4]*
Optional. Set this parameter if username is different from [`sender-email`](#sender-email).

### `sender-email`
The email ID that sends the mail.

### `sender-password`
The password associated with [`sender-email`](#sender-email). You must set this parameter if you've [enabled `authentication`](#authentication).

### `receiver-email`
The email IDs of the recipients enclosed in square brackets. You can specify multiple email addresses—for example, `['sara@example.com', 'alex@example.com`]`.


### `channels`
The channels that you want to subscribe to for notifications, enclosed in square brackets. The following channels are available:
- `ALL`
- `GENERAL`
- `LAG`
- `WARNING`
- `RETRY_FAILURE`
- `SNAPSHOT_COMPLETE`
- `SNAPSHOT_SUMMARY`

Use the `ALL` channel to subscribe to all channels. Otherwise, specify one or more channels of your choosing—for example, `[WARNING, RETRY_FAILURE]`.

### `subject-prefix` *[20.07.16.5]*
The prefix string to add to the email subject—for example, `PRODUCTION`.

The following is a sample notification configuration:

```YAML
mail-alert:
  enable: true
  smtp-host: 'smtp.example.com'
  smtp-port: 587
  authentication:
    enable: true
    protocol: 'TLS'
  sender-username: 'user' 
  sender-email: 'sara@example.com'
  sender-password: '*********'
  receiver-email: ['sara@example.com']
  channels: [ALL]
  subject-prefix: "PROD"
```

### Specify multiple `mail-alert` configurations
You can specify multiple `mail-alert` configurations as a list under the `mail-alerts` field. This is useful if you don't want the same notification configuration for all the receipients. The following is a sample:

```YAML
mail-alerts:
- enable: true
  receiver-email: ['sara@example.com']
  channels: [ALL]
- enable: true
  receiver-email: ['alex@example.com']
  channels: [LAG]
```

## Configure script notifications
If you choose to use a script to receive the notifications, you can configure them under the `script-alert` section of the configuration file. For more information, see the sample at the end of this section. 

The following parameters are available to configure script alerts:

### `enable`
<code>true</code> or <code>false</code>.

Whether to enable script notifications.

### `script`
The full path to your script file.

### `output-file`
The full path to the file where error output of script is saved.

### `channels`
The channels that you want to subscribe to, enclosed in square brackets. The following channels are available:
- `ALL`
- `GENERAL`
- `LAG`
- `WARNING`
- `RETRY_FAILURE`
- `SNAPSHOT_COMPLETE`
- `SNAPSHOT_SUMMARY`

### `alert-repetitively`
<code>true</code> or <code>false</code>.

Whether you want to get the same notification repetitively.

The following is a sample script notification configuration:

```YAML
script-alert:
  enable: true
  script: "/home/ubuntu/script.sh"
  output-file: "/home/ubuntu/script.out"
  channels: [LAG]
  alert-repetitively: false
```

### Specify multiple `script-alert` configurations
You can specify multiple `script-alert` configurations as a list. This is useful if you don't want the same script alert configuration for all the receipients. The following is a sample:

```YAML
script-alert:
- enable: true
  script: "/home/ubuntu/script.sh"
  output-file: "/home/ubuntu/script.out"
  channels: [LAG]
  alert-repetitively: false
- enable: true
  script: "/home/ubuntu/script1.sh"
  output-file: "/home/ubuntu/script1.out"
  channels: [RETRY_FAILURE]
  alert-repetitively: true
- enable: true
  script: "/home/ubuntu/script1.sh"
  output-file: "/home/ubuntu/script1.out"
  channels: [SNAPSHOT_COMPLETE]
  alert-repetitively: false
```

## Configure lag notifications
The notification configuration file lets you specifically configure notifications about replication lags. For example, you can configure Replicant to send you notification when replication is lagging more than a threshold value.

You need to specify your configurations under the `lag-notification` section of the notification configuration file. For more information, see the sample at the end of this section. 

The following parameters are available to configure lag notifications:

### `enable` 
`true` or `false`.

Whether to enable lag notifications.

### `threshold-ms`
Threshold value in milliseconds. If replication lag is below this value and for [`stable-time-out-s` seconds](#stable-time-out-s) , Replicant sends a notification. If replication lag increases above this value, Replicant sends a new notification once the lag stabilizes below this threshold value for [`stable-time-out-s` seconds](#stable-time-out-s) again.

### `stable-time-out-s`
A timeout value in seconds within which we expect the replication to recover from lag and stabilize. If replication lag stabilizes within this time period and goes below [`threshold-ms` milliseconds](#threshold-ms), Replicant sends a notification.

### `check-interval-s`
The time period in seconds after which Replicant calculates the global lag every time. In case of [distributed replication]({{< relref "distribution-reference" >}}), Replicant calculates the lag across all Replicant nodes.

The following is a sample lag notification configuration:

```YAML
lag-notification:
  enable: true
  threshold-ms: 10_000
  stable-time-out-ms: 60_000
```

{{< hint "info" >}}
**Note:**

1. If you use Gmail SMTP server, you must configure the Gmail account to allow “Less secure apps”. Otherwise, leave the default settings intact and change only the `receiver-email`.

2. Since version 20.07.16.5, for `mail-alert`, only `receiver-email` & `channels` are mandatory. Use the rest of the fields only for using a custom mail server.

3. Prior to version 20.07.16.5, the `receiver-email` parameter supports only a single value, without the square brackets.
{{< /hint >}}