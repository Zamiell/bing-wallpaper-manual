# `bing-wallpaper-manual`

## Introduction

`bing-wallpaper-manual` is a [TypeScript](https://www.typescriptlang.org/) program that emulates the functionality of the [Bing Wallpaper](https://www.bing.com/apps/wallpaper) application for Windows. All this script does is use the Bing API to find the latest photo for the day and then set it to be the current wallpaper. (The photos rotate every night at 12 AM PST.)

This program is intended to only be run once a day. We recommend that you use a Windows Scheduled Task for this purpose, which is included in the installation instructions below.

## Supported Operating Systems

Currently, this script only supports Windows. In the future, it may also support Linux.

## Installation

First, install [Bun](https://bun.com/), if you do not already have it installed.

- `git clone git@github.com:Zamiell/bing-wallpaper-manual.git`
- `cd bing-wallpaper-manual`
- `bun ci`
- `bun run build`
- `powershell ./scripts/install-scheduled-task.ps1`
