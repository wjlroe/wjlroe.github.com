---
title: Fast Rust builds on GitLab CI
date: 2016-08-16 22:10
categories: [rust, ci]
layout: post
---

[GitLab](https://gitlab.com/) has a very useful integrated CI environment that you can use with pretty much any project. 

<!--more-->

For a simple Rust project, we could use a configuration that looks like this:

```yaml
image: "scorpil/rust:stable"

test:cargo:
  script:
  - rustc --version && cargo --version      # Print version info for debugging
  - time cargo test --verbose --jobs 1 --release # Don't paralize to make errors more readable
```

If you build a project with this, it will work (and it'll use a Docker image for buzzword compliance), but it'll be quite slow, several minutes at least. Most of that time is spent downloading your dependencies and compiling them - on every single build, even if they are unchanged. If you run `cargo test` locally, even if it needs to compile your code, it should take roughly 10 seconds (probably less).

In order to get fast test runs with Rust, some configuration is necessary. Let's walk through changes to the `.gitlab-ci.yml` file that'll speed things up.

```yaml
test:cargo:
  ...
  cache:
    paths:
      - target/
      - cargo/
```

This is necessary to ensure that artifacts such as dependencies are retained between builds. Without this, upon every build, you will see lines like this in the build log:

```
Downloading cookie v0.2.5
...
Compiling cookie v0.2.5
```

To ensure that dependencies are cached correctly, we need to set the `$CARGO_HOME` to be inside the build directory (I'm not sure why, but if you try to cache it as is, it doesn't work):

```yaml
variables:
  CARGO_HOME: $CI_PROJECT_DIR/cargo
```

`$CI_PROJECT_DIR` is defined by GitLab to be the directory that it unpacks your project in and runs your build.

With this all in place, when you next build your project (after one build to fill the cache with your dependencies), you should see this instead:

```
Fresh cookie v0.2.5
```

See that? Everybody likes fresh cookies. Cargo doesn't need to compile this library because the built library was in the cache. This reduced my small project's build time from ~4 minutes to ~1.2 minutes.

The final `.gitlab-ci.yml` file looks like this now:

```yaml
image: "scorpil/rust:stable"

variables:
  CARGO_HOME: $CI_PROJECT_DIR/cargo

test:cargo:
  script:
  - du -hs target
  - du -hs cargo
  - rustc --version && cargo --version      # Print version info for debugging
  - time cargo test --verbose --jobs 1 --release # Don't paralize to make errors more readable
  cache:
    paths:
      - target/
      - cargo/
```
