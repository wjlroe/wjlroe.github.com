---
layout: post
title: Fast string interpolation in ClojureScript
date: 2015-01-17 03:30
comments: true
categories: [clojure, clojurescript]
---

In my
[previous post on string interpolation in Clojure](/2015/01/15/string-interpolation-clojure.html),
I benchmarked `<<` from `core.incubator` and it proved both useful and
performant. But can this useful macro be used from ClojureScript? Yes.

<!--more-->
Add `core.incubator` to your dependencies in `project.clj` of your
ClojureScript project:

```clojure
(defproject some-project "1.0.0-SNAPSHOT"
  :dependencies [...
                 [org.clojure/core.incubator "0.1.3"]
                 ...]
```

Now you can require the `strint` macros in your ClojureScript source
(e.g. in `src/cljs/app/core.cljs`):

```clojure
(ns app.core
  (:require-macros [clojure.core.strint :as strint]))
```

Now you can use the fast string interpolator thus:

```clojure
(enable-console-print!)

(let [name "Ethel Smyth"
      profession "Composer"
      born 1858]
  (println
   (strint/<< "The person named ~{name} works as a ~{profession}
and was born in ~{born}")))
```

That's it!
