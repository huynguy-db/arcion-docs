---
title: Quickstart
bookCollapseSection: true
weight: 1
---

In this section, we'll get familiar with the Arcion Cloud Dashboard UI by going through a sample replication process. By the end of this tutorial, you can confidently start using the cloud dashboard for your purposes.

## Log in

- Log into your [Arcion Cloud account](http://cloud.arcion.io/). If you haven't signed up yet, sign up using your Google account (don't use email and password to sign up).

- You'll land in the **Replications** page. This page shows a list of replications that you might've previously created. If not, the list will be empty. You can start a new replication by clicking **New Replication**.

  ![Arcion Cloud Dashboard after logging in for the first time](/images/arcion_cloud_dashboard_after_signing_in.png)

## New Replication Details

- Click on **New Replication**. You'll need to fill in the following details of the replication:

  - **Name**
  - **Description (optional)**
  - **Replication Mode**
  - **Write Mode**

  You can choose from the three replication modes Arcion supports: 

  - **Snapshot**
  - **Realtime** 
  - **Full**

  For the **Write Mode**, there are three options available:

  - **Appending**
  - **Replacing**
  - **Truncating**

  For this demonstration, we've chosen `Oracletest` as the name, **Full** as **Replication Mode**, and **Replacing** as **Write Mode**.

  ![Filling in Name, Description, Replication Mode, and Write Mode for a new replication from Arcion Cloud Dashboard](/images/new_replication_details.png)

  After you're done, click **Next**.

## Configuring Source

This step involves setting up your source connection. 

- In the **Configure New Connection** window, choose any of the supported sources and click **Continue**. In this case, we've chosen **Oracle**.

- In the **Connection Form** tab, you need to fill in the following details for Arcion to connect to the source database:

  - **Source Name**
  - **Host**
  - **Port**
  - **Username**
  - **Password**
  - **Max Connections**
  - **Retry Wait Duration in ms**
  - **Max retries**

  ![Connection Form in the Arcion Cloud Dashboard for filling in details of source connection](/images/configuring_source.png)
 
  {{< hint "info" >}}
  On the left side, you can see where you are currently at in the whole configuration process, including  your replication details.
  {{< /hint >}}

 
  You can also choose to tick the **Continuous Log Mining** checkbox to enable log mining for the operation.

  After filling in the form, click **Save Connection**.
- If you haven't synced the connector yet, Open the **Sync Connector** tab and click on **Sync Connector** for it to be ready. If you've filled in your information correctly, the sync operation should complete successfully, showing all the schemas in the source database.
  {{< hint "warning" >}}
  You must sync every source connector at least once, as a mandatory step in setting up a source.
  {{< /hint >}}

- Click **Continue**.

You should see a new window showing all the sources you've configured. Since we've only set up one Oracle source, it'll show only that.  You can also add another source via the **New Extractor** button. 

![Window after finishing the source config, showing all the configured sources and the selected source. This only shows one selected source](/images/after_finishing_source_config.png)

Click on **Continue to Destination** at the bottom right to go the next step.

## Configuring Destination

After completing the previous steps, you should now be in the **Destination** window.

- Click **New Connection**.

- You should see s similar page where you need to fill in the necessary details for your destination.

- After filling in the details, save the connector by clicking on **Save**.

- Just like source, sync your connector by going to the **Sync Connector** tab and clicking on **Sync Connector**.
  {{< hint "warning" >}}
  You must sync every destination connector at least once, as a mandatory step in setting up a destination.
  {{< /hint >}}

- Click **Continue to Filter**

  ![Filter window on Arcion Cloud Dashboard when setting up destination](/images/filter.png)

In this window, you need to select the schemas and tables you want to replicate. 

If you click on a particular schema, it'll expand and you'll be able to see the tables belonging to that schema. 

![Filter window on Arcion Cloud Dashboard while setting up the destination. It shows clicking on a schema and expanding it to see all the tables belonging to that schema](/images/expanding_a_schema.png)

You are free to choose according to your requirements. For example, we can select the `TPCH` schema and all its tables by ticking the checkbox attached on the left.

![Selecting all the tables of a schema by ticking the checkbox of a schema in the filter list](/images/selecting_all_tables_of_a_schema.png)

Once you've selected what to replicate, hit **Start Replication**.

## Monitoring and Metrics Dashboard

After clicking on **Start Replication**, replication will start. A loading window will appear as Arcion needs some time to load the necessary data. Give it a few seconds and soon you should see a dashboard reporting all the metrics of the ongoing replication.

![Metrics dashboard on Arcion Cloud showing details of an ongoing replication](/images/monitoring_metrics_dashboard.png)

You can see **Running** in green color, indicating that the replication was successfully initiated and is currently in progress.

Click **View Details** to see get metrics for each table. You can always go back to the initial **Summary** page by clicking on **Back to Summary**.

![Metrics per table after a replication has been started in Arcion Cloud Dashboard](/images/view_details.png)

## Change Data Capture (CDC)

In the **Summary** page, check for `Phase`. If it's `CONT MINING`, it means that Arcion is ready to perform CDC, responding to any changes that might occur in source. Let's test it out.

Let's assume that you logged in to the Oracle system and did an update on a table.

![Using SQL to make an update to a table in Oracle](/images/update_schema_oracle.png)

For example, here we've updated 127 rows on `orders2` table. After some time, Arcion will pick up these changes and apply them to the target. 

You can verify this by clicking **View Details** and going to the per-table metrics page.

![View Details page showing that the orders2 table update was picked up by Arcion and applied to the target](per_table_metrics_after_cdc.png)

## Actions

Once a replication has started, you can take several actions based on your needs. These actions are available under the **Actions** dropdown menu on the top right.

For example, if you want to stop the replication, choose **Stop** from the **Actions** dropdown menu.

![Actions dropdown menu on Arcion Cloud Dashboard](/images/actions_dropdown.png)

The replication will appear as **Stopped**.

![Stopped label after a replication has been stopped](/images/stopped_replication.png)

Once a replication is in the **Stopped** state, you have the following choices of action available from the **Actions** menu:

- **Resume**: Resume the replication and continue applying updates on the source.
- **Terminate**: Terminate the replication.

If you terminate the replication, it'll show up in the original replication list as **Terminated**.

![Terminated replication on Arcion Cloud Dashboard replication list](/images/terminated_replications_list.png)

If you want to permanently remove it, choose **Remove** from the **Actions** dropdown menu.