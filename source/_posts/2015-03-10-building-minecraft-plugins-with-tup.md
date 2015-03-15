---
layout: post
title: Building Minecraft plugins with tup
date: 2015-03-10 23:10
categories: [minecraft, java]
js_gamedev_signup: true
comments: true
---

I'm having fun reading [Learn to Program with Minecraft Plugins][] at
the moment and I decided to try out a new Make-like tool called
[tup][] for building the plugins.

<!--more-->

Each example plugin from the source code of this book has a build
script that looks like this:

```bash
#!/bin/sh
# Set the variable MCSERVER to ~/Desktop/server
# unless it's already set
: ${MCSERVER:="$HOME/Desktop/server"}
MODS="$MCSERVER"/CanaryMod.jar

# Make the build directories if they aren't there.
# Throw away any error if they are.
mkdir bin 2>/dev/null
mkdir dist 2>/dev/null

# Remove any previous build products
rm -f bin/*/*.class
rm -f dist/*.jar

# Get the name of this plugin
# from the directory it's in
HERE=`pwd`
NAME=`basename "$HERE"`

# 1. Compile
echo "Compiling with javac..."
javac -Xlint:deprecation src/*/*.java -d bin -classpath "$MODS" -sourcepath src -g:lines,vars,source || exit 2

# 2. Build the jar
echo "Creating jar file..."
jar -cf dist/"$NAME.jar" *.inf -C bin . || exit 3

# 3. Copy to server
echo "Deploying jar to $MCSERVER/plugins..."
test ! -d "$MCSERVER/plugins" && mkdir "$MCSERVER/plugins"
cp dist/$NAME.jar "$MCSERVER"/plugins || exit 4

echo "Completed Successfully."
```

The above is a perfectly good build script especially as the intended
audience of the book doesn't need to learn about build tools like Make
or Maven or Ant.

[tup][] is an interesting build tool for a number of reasons.
Particularly the fairly straightforward configuration and file monitoring
rebuilds (only on Linux). The other intriguing feature of tup is you
can run `tup upd` anywhere in your source code and it'll build
everything that needs building, which is pretty convenient for large
source trees with multiple build targets/libraries - just like the
example plugins for this book!

So here's my first attempt at a `Tupfile`:

```
MCSERVER   = /Users/will/Downloads/canary-server
MODS       = $(MCSERVER)/CanaryMod.jar
JAVAC_OPTS = -Xlint:deprecation
DEBUGGING  = -g:lines,vars,source

: foreach src/helloworld/*.java |> javac $(JAVAC_OPTS) %f -d bin -classpath "$(MODS)" -sourcepath src $(DEBUGGING) |> bin/helloworld/%g.class
: *.inf bin/helloworld/*.class |> jar -cf %o *.inf -C bin . && cp %o $(MCSERVER)/plugins/ |> dist/%d.jar
```

I have a few reflections about this:

* I don't know how environment variables work with tup. Just like
  Make, it has its own variables but it doesn't appear to let any
  shell variables in (that's why my full home directory is hard-coded
  at the top of the file).
* Each line in the Tupfile consists of `inputs |> commands |> outputs`
  which is very functional-like and intuitive to me. There doesn't
  appear to be an easy way to have outputs that are outside your
  source tree because I had errors when I tried to copy the JAR into
  my server/plugins directory as a separate step, so I collapsed it
  into the previous JAR-building step.
* `%g` refers to a glob in the input files, but alas only the first
  glob, so I couldn't write a general rule for building any package
  regardless (like: `foreach src/*/*.java |> javac %f -d bin |>
  bin/%g.class`). The other options for output flags include `%b`
  which is the input base filename (e.g. `HelloWorld.java`) and `%B`
  which is the same without the extension (e.g. `HelloWorld`). I
  couldn't work out how to translate the `src/a/b.java` into
  `bin/a/b.class` for any `a` and `b`. In Make you can do something
  like `$(source_files:%.java=bin/%.class)` or similar and I can't
  find an analogue in tup so far.

[Learn to Program with Minecraft Plugins]: https://pragprog.com/book/ahmine2/learn-to-program-with-minecraft-plugins
[tup]: http://gittup.org/tup
