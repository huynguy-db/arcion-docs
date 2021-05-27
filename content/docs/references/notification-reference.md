---
title: Notification Configuration
weight: 5
---

# Notification Configuration

The notification configuration file specifies the types of notifications Replicant will send to the user.

## Mail Alert

The parameters for a mail alert are as follows:

1. **mail-alert**:
   * **enable**: true/false
   * **smtp-host**: hostname
   * **smtp-port**: port
   * **authentication**:
     * **enable**: required for gmail/yahoo or other authenticated services
     * **protocol**: TLS/SSL. Note port for TLS and SSL are different
   * **sender-username[20.07.16.4]**: To be used if username is different from sender-email
   * **sender-email**: <email_id>
   * **sender-password**: <password>
   * **receiver-email**: [<email_id1>, <email_id2>]
   * **channels**: alert channels to be monitored
   * **subject-prefix[20.07.16.5]**: Prefix string in subject for mail notification.

The parameters to send a mail alert to multiple email addresses are as follows:

2. **mail-alerts [20.08.13.9]**: Allows to specify multiple mail-alert configs as a list.
   * **enable**: true/false
   * **smtp-host**: hostname
   * **smtp-port**: port
   * **authentication**:
   * **enable**: required for gmail/yahoo or other authenticated services
   * **protocol**: TLS/SSL. Note port for TLS and SSL are different
   * **sender-username[20.07.16.4]**: To be used if username is different from sender-email
   * **sender-email**: <email_id>
   * **sender-password**: <password>
   * **receiver-email**: [<email_id1>, <email_id2>]
   * **channels**: alert channels to be monitored
   * **subject-prefix[20.07.16.5]**: Prefix string in subject for mail notification.

## Script Alert

The parameters for a script alert are as follows:

3. **script-alert**:
   * **enable**: true/false.
   * **script**: full path to the script file
   * **output-file**: full path to the file where err/output of script will be written to
   * **channels**: alert channels to be monitored
   * **alert-repetitively**: true/false

## Additional Configurations

4. **lag-notification**:
   * **enable**: true/false. Send notification if lag falls below threshold-s and stabilizes
   under stable-time-out-s. The global lag ( across all replicant nodes in case of
     distributed replication) is computed every check-interval-s seconds.
   * **threshold-ms**:
   * **stable-time-out-s**:
   * **check-interval-s**:

**N.B.**:
1. For using Gmail smtp server, the gmail account needs to be configured to allow “less
secure apps”. If you don’t want to go into all that trouble, leave the default settings intact
and change only the receiver-email.
2. Since 20.07.16.5, for mail-alert, only receiver-email & channels are mandatory. Use
the rest of the fields only for using a custom mail server
3. Prior to 20.07.16.5, receiver-email supports only single receiver, without `[ ]`
4. Post 20.08.13.9 multiple mail-alert configs can be specified as list as shown below

  **mail-alerts**:
  * **enable**: true
  **receiver-email**: ['blitzz.replicant1@gmail.com'] .
  .
  **channels**: [GENERAL]
  * **enable**: true
  **receiver-email**: ['blitzz.replicant2@gmail.com'] .
  .
  **channels**: [WARNING]
