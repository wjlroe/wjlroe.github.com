---
layout: post
title: Secret Santa Types!
date: 2014-12-27 23:01
comments: true
published: false
categories: [haskell, types type-theory, idris]
---

If we notate the basic types for a simple Secret Santa, we get the
following:

{% codeblock lang:haskell %}
type Santa = String
secretSanta :: [Santa] -> [(Santa, Santa)]
{% endcodeblock %}

When I wrote this on a chalkboard mug to my brother (who isn't a
programmer), he immediately asked how that type guaranteed that the
function would return Secret Santa pairings correctly. I replied that
it doesn't guarantee the correctness of the data itself, only that
it'll be in the correct form.
