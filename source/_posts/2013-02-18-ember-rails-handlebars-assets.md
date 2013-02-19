---
layout: post
title: "Ember-rails and handlebars_assets FIGHT!"
date: 2013-02-18 23:10
categories: [rails, ember, javascript]
---

Just a quick note for Google and future-me. If you want to mix both [ember-rails](https://github.com/emberjs/ember-rails) and [handlebars_assets](https://github.com/leshill/handlebars_assets) in the same Rails project, you will encounter maddening issues with your Ember/Handlebars templates. Specifically, they will compile fine (probably) but Ember will not be able to see them.

## How to check whether Ember can ‘see’ your templates

In your browsers console, type:

    Ember.TEMPLATES
    
You should see something like:

    Object {application: function, domains: function}
    
In the above example I have two templates defined: 'application' and 'domains'. If something is stopping ember-rails from putting your templates in that object, it will simply be a blank object.

## Why is this happening?

This happened to me because both handlebars_assets and ember-rails were registering with the asset pipeline to process `.handlebars` files (and `.hbs` files). They fight and, at least in my case, handlebars_assets won.

## The fix

The only way to get this to work reliably right now is to use a file extension for your Ember handlebars templates that isn’t recognised by handlebars_assets. I used `.hjs`. It’s not exactly a fix, but things are all working right now so that’s groovy.

## Why are you using both?

There’s probably a way round this, but I’m using handlebars_assets to compile handlebars templates for some javascript (that ends up not being at all related to EmberJS - it’s embedded in other pages). I need those templates to be available in the `HandlebarsTemplates` object so I can run them in the javascript. I include `handlebars.runtime` in the javascript to run them. ember-rails includes that (I just looked) so I can probably ditch handlebars_assets. That’ll be the next thing to try.

This might not make a lot of sense, but if you’ve hit this problem (i.e. nothing renders in your EmberJS app but your templates are all compiled and you get no errors in the browser console) then this is one possible gotcha.
