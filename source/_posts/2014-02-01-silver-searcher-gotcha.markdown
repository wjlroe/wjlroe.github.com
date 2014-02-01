---
layout: post
title: "A Silver Searcher Gotcha"
date: 2014-02-01 15:34
categories: [shell, git]
---

There is a gotcha with [the silver searcher](https://github.com/ggreer/the_silver_searcher) and how it treats
`.gitignore` files. The following pattern will work as expected with `git`:

    /log

I.e. `git` will ignore everything in that directory, however The Silver Searcher
doesn't understand that and it'll still show matching lines from files in
`log/`. For `git` and `ag` (The Silver Searcher) to both ignore that directory
and its contents, change `/log` to `log`.
