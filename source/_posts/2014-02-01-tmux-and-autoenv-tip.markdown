---
layout: post
title: "tmux &amp; autoenv tip"
date: 2014-02-01 15:41
comments: true
categories: [tips, tmux]
---

On OS X, if I use [tmux](http://tmux.sourceforge.net/) (or more usually,
[wemux](https://github.com/zolrath/wemux) for pairing) then I end up with oddly
named windows like this:

![](http://d14vbe8lasdppi.cloudfront.net/01_02_2014_15_45.jpg)

This is because I've followed the awesome instructions from
[Dr Bunsen's Text Triumvirate](http://www.drbunsen.org/the-text-triumvirate/)
and in order to have the tmux and system (OS X) clipboards interacting, it
requires a hack called `reattach-to-user-namespace` which proxies the running of
zsh in tmux.

One quick way to get around this and save time renaming my tmux windows, was to
use [autoenv](https://github.com/kennethreitz/autoenv) and add a file named
`.env` to projects with content similar to:

    tmux rename-window "project-name"

This is piling hacks on top of hacks, but at least it saves a bit of time for
frequently visited directories.
