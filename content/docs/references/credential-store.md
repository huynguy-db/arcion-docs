---
pageTitle: Using credential stores for storing user credentials
title: Setting up Credential Store
description: "Replicant can consume credential information from a credential store. This page describes the necessary steps for creating a credential store."
bookHidden: false
weight: 15
---

# Setting up Credential Store
Replicant is capable of consuming credential information from a credential store. This page describes the necessary steps for creating a credential store.

Let's take an example of **Teradata->SingleStore** pipeline. Let's assume that you need to specify a URL to connect to Teradata and specify username/password to connect to SingleStore. For these requirements, you can create the keystore and encrypted keys by executing the following commands:

```shell
echo "<TD_URL>" | keytool -importpass -keystore <keystore_file_name>.jks
-storetype pkcs12 -storepass <License_UUID> -alias <key-prefix>url -keypass
<License_UUID> -noprompt
```

```shell
echo "<SingleStore_Username>" | keytool -importpass -keystore
<keystore_file_name>.jks -storetype pkcs12 -storepass <License_UUID> -alias
<key-prefix>username -keypass <License_UUID> -noprompt
```

```shell
echo "<SingleStore_Password>" | keytool -importpass -keystore
<keystore_file_name>.jks -storetype pkcs12 -storepass <License_UUID> -alias
<key-prefix>password -keypass <License_UUID> -noprompt
```

You can verify whether they have been saved in the keystore successfully:

```shell
keytool -keystore <keystore_file_name>jks -list
Enter keystore password:
Keystore type: PKCS12
Keystore provider: SUN
```

The output should confirm that the keystore contains 3 entries:

```
<key-prefix>password, 10-Apr-2020, SecretKeyEntry,
<key-prefix>username, 10-Apr-2020, SecretKeyEntry,
<key-prefix>url, 10-Apr-2020, SecretKeyEntry,
```

Once the keystore has been set up, you must specify the details of the keystore in [Replicant's connection cofiguration file](/docs/source-setup/snowflake/#additional-parameters), including `type`, `path` and `key-prefix`.