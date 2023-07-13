# Contributing guidelines

Thank you for your interest in contributing to Arcion documentation!

Read through this page before submitting any pull request.

- [Contributing guidelines](#contributing-guidelines)
  - [Prerequisites](#prerequisites)
  - [Suggested workflow for edits](#suggested-workflow-for-edits)
  - [Folder structure of the repository](#folder-structure-of-the-repository)
    - [Create files or directories](#create-files-or-directories)
  - [Open an issue](#open-an-issue)
  - [Edit the documentation](#edit-the-documentation)
    - [Use Markdown](#use-markdown)
    - [Add images (optional)](#add-images-optional)
    - [Write with the Arcion developer documentation style guide in mind](#write-with-the-arcion-developer-documentation-style-guide-in-mind)
- [Set up Hugo](#set-up-hugo)
  - [Linux](#linux)


## Prerequisites
1.  A GitHub account.
2.  If you want to use SSH to synchronize your local computer with your GitHub account, you need to follow these general steps:

    a. Create an SSH key on your local computer.

    b. Add the key to your OpenSSH authentication agent.
    
    c. Add the public key file to your GitHub account.
		
See [The GitHub docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) for instructions on how to perform these steps.

## Suggested workflow for edits
The GitHub editing interface works well for quick edits. However, we recommend that you use a code editor and a local copy of your fork of this repository for more complex edits or edits involving multiple files.

Follow these steps to perform complex edits on multiple files:

1.  Log in to your GitHub account and navigate to this repository.
2.  Select **Fork** to create a fork of the repo's `dev` branch.
3.  Open your fork. The fork now exists under your username (`<your_username>/arcion-docs`).
4.  Clone the repository to your machine using HTTPS or SSH.
5.  Create a branch and checkout into that branch.
6.  Edit the documentation using your favorite code editor.
7.  Push the changes to your remote fork of the this docs repository (your copy of this repo).
8.  Open your fork in GitHub and select the **Pull requests** tab, then select **New pull request**.
9.  Select **Create pull request** to open a pull request from your fork to the `dev` branch of this repository.
10.  Edit the summary and description, then select **Create pull request** to confirm.

Your pull request is now ready for review. The Arcion docs team will review it as soon as possible.

## Folder structure of the repository
Familiarizing yourself with the structure of this repository will make it easier for you to suggest edits or addition to the existing documentation.

The following files and folders are relevant to documentation edits:

```
...
├── config-prod.toml    << The Hugo TOML configuration to run the docs locally
...
├── content             << The main folder containing all the documents
...
├── public              << Local build of the docs
```
### Create files or directories
If you need to create a new file or directory, follow these rules for the file names and directories:

- Use lower case.
- Use dashes for spaces.
- Keep the name as short as possible.

The front matter of a new document looks like the following:

```yaml
---
pageTitle: Text corresponding to the title HTML tag of the document
title: The title that appears on the left TOC of the docs website
description: "Text corresponding to the HTML meta description of the document."
---
```

Follow sentence case for all three fields in the preceding snippet.

The front matter also supports the following parameters that you might find useful:

```
# Set page weight to re-arrange items in the left table of contents (TOC) menu.
weight = 10

# (Optional) Set to hide nested sections or pages at that level.
bookCollapseSection = true
```

## Open an issue
You can [open an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue) if you find something incorrect or out-of-date in the content, or if the documentation does not match the actual functionality. Try to cover the following details in your issue description:

- The relevant Arcion product or service
  - Specify the relevant Arcion product or service the issue impacts or relates to.
- Expected behavior  
  - Provide a link to the documentation or explain what the outcome should be if you follow the documentation.
- Actual behavior
  - Explain what happens when you follow the documentation.
- The part of the documentation that requires updating
  - Provide a link to the page that needs updating. Specify which section requires updating.
- Additional information
  - Any other details or screenshots that you think might be relevant.
- Issue labels

## Edit the documentation
Follow these instructions to make edits:

### Use Markdown
This repository uses Markdown (`.md`) files for the documentation pages. For a refresher on Markdown syntax, see [Markdown basic syntax](https://www.markdownguide.org/basic-syntax/).

### Add images (optional)
Use images only in the following conditions:

- An image provides useful visual explanation of the information that is otherwise difficult to express with words.
- Screenshots of UIs that are important to the discussion.

In general, keep [these guidelines on figures and images](https://developers.google.com/style/images) in mind.

To add an image, follow these steps:

1. Put the image in the `content/images` directory. 
2. Use the following Markdown syntax to include the image in the document:
	```
	![ALT_TEXT](/images/NAME_OF_THE_IMAGE_FILE_WITH_EXTENSION)
	```

### Write with the Arcion developer documentation style guide in mind
Follow the [Arcion developer documentation style guide](docs-style-guide.md) while you work on your documentation edits.

# Set up Hugo

This section helps you set up Hugo on your machine so that you can run the website and verify your changes locally.


## Linux

These instructions apply to Ubuntu 22.04 and higher.
For other Linux distributions, see the [Hugo Linux installation docs](https://gohugo.io/installation/linux/).


1. Install Hugo using `apt-get`:
  
  Arcion docs theme requires Hugo extended, with version 0.79 or higher.
  Not all releases of Ubuntu repositories provide such newer versions. 
  For these cases, the recommended approach to install Hugo is to grab the appropriate prebuilt binary from the [Hugo releases page](https://github.com/gohugoio/hugo/releases). 
  

  ```bash
  sudo apt-get install hugo

  hugo version
  hugo v0.92.2+extended linux/amd64 BuildDate=2023-01-31T11:11:57Z VendorInfo=ubuntu:0.92.2-1ubuntu0.1
  ```

2. Go inside your `arcion-docs` repository:

  ```bash
  cd arcion-docs/
  ``````

3. Start Hugo server:

  ```bash
  hugo server --config config-dev.toml
  ```

4. View Locally

  `hugo server` builds the website and serves it using an HTTP server.
  After you run hugo server, it displays the URL of the local build:

  ```
  Web Server is available at //localhost:1313/ (bind address 127.0.0.1)
  ``````

  You can make changes while the server is running. The server automatically detects any change you make in website content and and rebuilds the site.
