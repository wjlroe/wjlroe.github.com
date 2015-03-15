---
layout: post
title: Secret Santa in core.logic
date: 2014-12-28 19:04
comments: true
categories: [clojure, core.logic]
---

Logic programming is an odd beast. As I lounged around over the
holidays I tried to work out how to write a Secret Santa algorithm
using core.logic. It seemed like the obvious choice but I quickly
realised I'd bitten off more than I could chew.
<!--more-->

## Simple Secret Santa

Your common or garden Secret Santa consists of putting names in a hat
and picking them out again, ensuring you don't pick yourself. Suitable
for offices and other groups of awkward strangers and acquaintances.

We need `core.logic` imported, so here's the namespace declaration
(note that both `clojure.core` and `clojure.core.logic` define `==`
for totally different purposes. I have never used `clojure.core/==` so
I'm a bit hazy as to what it's for - we exclude it so they don't clash):

{% codeblock lang:clojure %}
(ns secret-santa.core
  (:refer-clojure :exclude [==])
  (:require [clojure.core.logic :refer :all]
            [clojure.core.logic.pldb :refer :all]))
{% endcodeblock %}

We'll start by defining a relation:

{% codeblock lang:clojure %}
(db-rel santa p)
{% endcodeblock %}

This is so that we can constrain values to only those names we've
defined are santas (otherwise you get weird logic variables and nobody
wants to deal with that noise).

Now for the Secret Santa function. It takes a list of friend names
(not actually a requirement that they are friends, they may not be
after exchanging presents) and returns a list of lists. Each inner
list is a pair of giver and receiver of presents.

{% codeblock lang:clojure %}
(defn simple-secret-santa
  [friends]
  (let [facts (coll->db (for [friend friends]
                           [santa friend]))
        num (count friends)
        givers (repeatedly num lvar)
        receivers (repeatedly num lvar)]
    (->> (with-db facts
           (run* [q]
             (everyg santa givers)
             (everyg santa receivers)
             (distincto givers)
             (distincto receivers)
             (pairupo givers receivers q)))
      (map sort)
      distinct
      rand-nth)))
{% endcodeblock %}

If we call it thus:

{% codeblock lang:clojure %}
(simple-secret-santa ["Tommen" "Gregor" "Daenerys" "Arya"])
{% endcodeblock %}

Then we should get the following as a result:

{% codeblock lang:clojure %}
(["Arya" "Gregor"]
 ["Daenerys" "Tommen"]
 ["Gregor" "Daenerys"]
 ["Tommen" "Arya"])
{% endcodeblock %}

Please note my chronic lack of imagination evidenced by my lazily
using characters from Game of Thrones who would likely not be involved
in this kind of tomfoolery.

We need a helper function for pairing people up now:

{% codeblock lang:clojure %}
(defne pairupo
  [givers receivers pairs]
  ([() () ()])
  ([[g . gs] [r . rs] [p . ps]]
   (!= g r)
   (== p [g r])
   (pairupo gs rs ps)))
{% endcodeblock %}

The mind-bending nature of that function can be rather confusing. In
core.logic (as with [miniKanren](http://minikanren.org) and others),
it's common for an "output
value" to be one of the parameters, in this case the 3rd parameter
(`pairs`). This function defines a relationship between the parameters
provided so you can call it with `givers` and `pairs` and it'll fill
in the blanks for the `receivers` value (effectively unzipping the
`pairs` value), which is pretty neat.

### Unify what?

It's crucial to understand the `clojure.core.logic/==` unification
function to understand how any of this works. It looks like an
equality test from one of those other programming languages we shall
not mention here, but it isn't like that. Sometimes I thought of it as
a kind of wishful-thinking-equality - a sort of "wouldn't it be just
lovely if these things were the same".

Taking an example from
[the core.logic wiki](https://github.com/clojure/core.logic/wiki/A-Core.logic-Primer):

{% codeblock lang:clojure %}
(run* [q]
  (fresh [a]
    (membero a [1 2 3])
    (membero q [3 4 5])
    (== a q)))
{% endcodeblock %}

In the above we are asking core.logic for the possible values of `q`
(the output variable). We start using a new logic variable `a` which
we unify with `q` using the `==` unification function. That is to say,
all solutions must satisfy the equation `a = q`, they must have the
same value. Core.logic tends to add 'o' to the end of common function
names so `(membero a [1 2 3])` isn't a boolean predicate function for
testing for list membership, it attempts to make that statement true.
With simply that statement - `a` can be 1 or 2 or 3. The next line
asserts that `q` is a member of the list `[3 4 5]` so its value can be
3 or 4 or 5. The last line unifies `a` and `q` so they must have the
same value. We can tell that the only cross-over between the 2 lists
already mentioned is the value 3, so `q` can only be 3. `run*` returns
a list of all possible solutions so in fact we will get a single
element list: `(3)` as the result from that code.

The input of our Secret Santa function will be a list of names
(strings), so it'd be useful to turn that list of names into a
database that we can constrain our logic functions on:

{% codeblock lang:clojure %}
(defn coll->db
  [coll]
  (apply db coll))
{% endcodeblock %}

[`clojure.core.logic.pldb/db`](http://crossclj.info/fun/clojure.core.logic.pldb/db.html) takes a variable number of parameters and
returns a database with those facts contained. We want to call it with
a collection so `apply` comes in handy here. Effectively you can use
`apply` to turn this: `(apply somefn [arg1 arg2 arg3])` into `(somefn
arg1 arg2 arg3)`

### How does it work again?

Let's concentrate on the core part of the function:

{% codeblock lang:clojure %}
(with-db facts
  (run* [q]
    (everyg santa givers)
    (everyg santa receivers)
    (distincto givers)
    (distincto receivers)
    (pairupo givers receivers q)))
{% endcodeblock %}

We are asking for all the solutions where every item in the `givers`
collection is a santa and every item in the `receivers` collection is
a santa (lines 3 and 4). This ensures that those collections contain
only valid santa names and not logic variables or numbers or anything
else. There's something subtle about this - it's not simply an
assertion. core.logic will make those statements true in every way
they can. One possible version of that (assuming there were 4 names
input to the function) is that `givers =
["Arya" "Arya" "Arya" "Arya"]`. That's nonsensical for our purposes
(remember we mean to zip up these collections so the first giver is
giving to the first receiver, the 2nd giver to the 2nd receiver and so
on). So then we ensure that the collection of givers has distinct
elements in it (line 5), saying the same about receivers on line 6. If
you imagine core.logic has assembled all the combinations of values
that are santas first - imagine now it throws away any where values
repeat. One of the remaining values for `givers` will be
["Arya" "Gregor" "Tommen" "Daenerys"]. There will be more. How many?

### Derangements, subfactorials, oh my!

The mathematical name for the number of unique permutations of
elements in a set (that are different from their original arrangement)
is the number of
[derangements](https://en.wikipedia.org/wiki/Derangement) or the subfactorial.

Roughly speaking, Secret Santa is a special case of finding a
derangement of names. When you have 4 names, there are 9 derangements.

Here is some clojure that calculates that:

{% codeblock lang:clojure %}
(defn derangements
  "Calculate the number of derangements of n elements."
  [n]
  (condp = n
    0 1
    1 0
    (* (dec n)
       (+ (derangements (dec n))
          (derangements (- n 2))))))
{% endcodeblock %}

This algorithm is primarily useful for checking your results in unit
tests for example. Another way to use it is as the parameter to
`run` - you can ask for all the possible derangements of friends. I
didn't have much luck with that because I misunderstood the values
that my logic code was producing, also there is no need to know
beforehand how many combinations are possible since you only want one.

## Further improvements

One weakness of the solutions described above is that they model the
relationship between the gift giver and receiver as a binary - allowed
or not. It would be useful to be able to first attempt to solve the
problem under ideal conditions before falling back to less and less
ideal solutions. For example, it's not ideal to have people paired up
symmetrically - it's just a bit boring that way. It's more optimal to
assign Santas in a circle, which makes it slightly more difficult to
identify who's assigned who.

Finding all possible solutions is extremely slow in core.logic (at
least, the way I've written it) so this could do with a fair amount of
optimisation.

I punted the problem of picking a solution out of possible solutions
to the combination of `(map sort)`, `distinct` and `rand-nth`. This
isn't really necessary, I could have told core.logic what constitutes
a distinct solution (it doesn't realise that order of pairings doesn't
matter) and then simply picked one. My brain hurt so much by that
point that I decided to call it a day and move on to more interesting
problems, like

## Final thoughts

I had a great deal of difficulty writing the `pairupo` function,
largely because all the various `defne`/`defnu`/`defna` confused me -
I still couldn't tell you what they do. This was partly due to me
moving from a real problem (Secret Santa) to the implementation in
core.logic on the basis of sketchy logic programming knowledge, so I
missed a lot of subtlety related to `conde` which is crucial for
understanding this stuff. The official documentaion for core.logic is
extremely sparse also, you are very much on your own if the problem
you want to solve isn't Sudoku or the Typed Lambda Calculus (it
boggles my mind that that is on the
[Examples](https://github.com/clojure/core.logic/wiki/Examples)
wiki page, I'm not sure if the intention is to educate or
obfuscate there).

I hope that a bit more blogging from mere mortals like myself might
help others grok this mind-mending area of programming.
