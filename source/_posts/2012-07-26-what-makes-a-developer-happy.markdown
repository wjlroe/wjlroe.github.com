---
layout: post
title: What makes a developer happy?
date: 2012-07-26
comments: true
categories: clojure happiness javascript svg raphael datomic databases
---

Today was a pretty good day for me - programming-wise. Even though I wasn't too well (having trouble hearing in my left ear which is disorientating and makes conversation difficult), I feel the contentment of a day well spent.

So what made it a good day? Building stuff is the bottom line for me but that is a very broad term. Today, building stuff meant working with the Raphael library to make a graphic for a web app (a dynamic graphic, it's not just a logo); refactoring the backend of said web app and reading various tech news.

News first. I was mainly reading about the architecture of Datomic, which is a really interesting take on databases. I would say it looks like the most developer friendly database implementation (in terms of the aims of the project) combined with some pretty powerful and flexible storage. I'm not sure how deploying it would work out, given it uses SQL or some other key-value-capable backend so it really adds another layer to your app's architecture. The rationale page was music to my ears though so I will be trying out the free edition for sure.

The refactoring I worked on today was a bit of "technical dept" that had been hanging around for a while. It was as a consequence of not understanding how to split up and compose together templates (and partial templates, snippets) with enlive. I had another go at reading the tutorials and this time it just felt easy. They could definitely do with simplifying though.
