# Contributing guidelines

Thank you for your interest in contributing to Arcion documentation!

Read through this page before submitting any pull request.

- [Contributing guidelines](#contributing-guidelines)
  - [Prerequisites](#prerequisites)
  - [Suggested workflow for edits](#suggested-workflow-for-edits)
  - [Folder structure of the repository](#folder-structure-of-the-repository)
    - [Create files or directories](#create-files-or-directories)
  - [Edit the documentation](#edit-the-documentation)
    - [Use Markdown](#use-markdown)
    - [Add images (optional)](#add-images-optional)
    - [Write with the Arcion developer documentation style guide in mind](#write-with-the-arcion-developer-documentation-style-guide-in-mind)


## Prerequisites
1.  A GitHub account.
2.  If you want to use SSH to synchronize your local computer with your GitHub account, you need to follow these general steps:

    a. Create an SSH key on your local computer.

    b. Add the key to your OpenSSH authentication agent.
    
    c. Add the public key file to your GitHub accountl
		
See [The GitHub docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) for instructions on how to perform these steps.

## Suggested workflow for edits
The GitHub editing interface works well for quick edits. However, we recommend that you use a code editor and a local copy of your fork of this reporsitory for more complex edits or edits involving multiple files.

Follow these steps to perform complex edits on multiple files:

1.  Log in to your GitHub account and navigate to this repository.
2.  Select **Fork** ito create a fork of the repo.
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
