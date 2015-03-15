---
layout: post
title: Fast string interpolation in Clojure
date: 2015-01-15 21:55
comments: true
categories: [clojure]
---

<!--more-->
There are two main ways to build strings in Clojure: [`str`][str] and
[`format`][format]. `str` essentially does string concatenation like
this:

```clojure
(str "This is a sentence with " some " variables ")
```

I find `str` forms somewhat unreadable, especially on one line. They
require the reader to mentally keep track of quote marks and spaces
around variables.

On the other hand, `format` offers a fully-featured string interpolation
function using Java's [Formatter][] class:

```clojure
(format "This string has another string: %s in it and a number: %.2f"
         "hello!"
         30.1)
```

In ruby we might use string interpolation thus:

```ruby
def str_interpolate name, profession, born
  puts "The person named #{name} works as a #{profession} and was born in #{born}"
end

str_interpolate "Ethel Smyth", "Composer", 1858
```

The advantage of string interpolation like this is how readable the
code can be.

The problem with prefering `format` over `str` is the difference in
performance. `format` is a lot more complex and if all you're doing is
string concatenation, then it'll not do the job as quickly as `str`
does (which uses a [StringBuilder][] under the hood).

## Benchmarks!

The following code uses the [Criterium][] library aliased to `bench`.

First let's define a function using `str` and benchmark it:

```clojure
(defn str-concat-fun
  [name profession born]
  (str "The person named "
       name
       " works as a "
       profession
       " and was born in "
       born))

(bench/bench (str-concat-fun name profession born))
```

Which results in (256ns):

```
Evaluation count : 241104540 in 60 samples of 4018409 calls.
             Execution time mean : 256.236563 ns
    Execution time std-deviation : 4.617404 ns
   Execution time lower quantile : 250.226629 ns ( 2.5%)
   Execution time upper quantile : 266.339191 ns (97.5%)
                   Overhead used : 1.166050 ns

Found 5 outliers in 60 samples (8.3333 %)
        low-severe       5 (8.3333 %)
 Variance from outliers : 7.7764 % Variance is slightly inflated by outliers
```

Now let's check the `format` version:

```clojure
(defn format-fun
  [name profession born]
  (format "The person named %s works as a %s and was born in %d"
          name
          profession
          born))

(bench/bench (format-fun name profession born))
```

Which results in (1.7µs):

```
Evaluation count : 34997760 in 60 samples of 583296 calls.
             Execution time mean : 1.703759 µs
    Execution time std-deviation : 36.732362 ns
   Execution time lower quantile : 1.663752 µs ( 2.5%)
   Execution time upper quantile : 1.779579 µs (97.5%)
                   Overhead used : 1.166050 ns

Found 2 outliers in 60 samples (3.3333 %)
        low-severe       2 (3.3333 %)
 Variance from outliers : 9.4397 % Variance is slightly inflated by outliers
```

That's not good, but not entirely unexpected. An order of magnitude
slower to use `format` for string contatenation tasks like this.

One of the advantages of Clojure is the promise of powerful,
expressive abstractions and not having to compromise on those
abstractions to achieve performance. In a [blog post][chas] about
string interpolation in Clojure, Chas Emerick proposes a macro for
simple string interpolation that would behave much like Ruby's does.
This has made its way into the [core.incubator][] project and can be
used in projects today.

To require it, add `core.incubator` to your project's dependencies and
add the following to any namespace that needs it:

```clojure
(ns example...)
  (:require [clojure.core.strint :refer [<<]]))
```

So now we can define a function like the others using this new macro:

```clojure
(defn interpolation-fun
  [name profession born]
  (<< "The person named ~{name} works as a ~{profession} and was born in ~{born}"))

(bench/bench (interpolation-fun name profession born))
```

And this results in (272ns):

```
Evaluation count : 222317940 in 60 samples of 3705299 calls.
             Execution time mean : 271.580867 ns
    Execution time std-deviation : 2.117763 ns
   Execution time lower quantile : 267.593081 ns ( 2.5%)
   Execution time upper quantile : 274.826087 ns (97.5%)
                   Overhead used : 1.166050 ns
```

Not bad! Ever so slightly slower than the `str` version but a
performance penalty well worth paying for to get more expressive
string interpolation I feel.

[str]: https://clojuredocs.org/clojure.core/str
[format]: https://clojuredocs.org/clojure.core/format
[chas]: http://cemerick.com/2009/12/04/string-interpolation-in-clojure/
[core.incubator]: https://github.com/clojure/core.incubator/
[Formatter]: https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html
[StringBuilder]: http://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html
[Criterium]: https://github.com/hugoduncan/criterium
