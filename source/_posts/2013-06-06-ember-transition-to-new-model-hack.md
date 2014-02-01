---
layout: post
title: "Ember transitionToRoute with new model hack"
date: 2013-06-06 19:53
categories: [ember, javascript]
---

<aside class="update">
**Update**: None of this is required with current versions of Ember and
Ember-data.
</aside>

A common pattern with webapps in these exciting times is the
transition-to-new-thing-you-just-created pattern. The way it works is this: you
fill in a form to create a new thing (like, a widget or something) and then when
you hit 'save', you are transitioned to the page for that widget. This is so you
can confirm that it worked and so you could make further changes on that widget.
The assumption being, when you create a widget, it is the focus of your task.

Whatever, anyway, I had to make something along those lines in an EmberJS app at
work and hit an ember-data bug. Surprise!

The bug is that when you try to do this (code speaks louder than widget
metaphors):

```javascript
var model = App.Widget.createRecord({name: "special_widget"});
model.one('didCreate', function() {
  this.transitionToRoute('widgets.show', model);
});
model.get('store').commit();
```

This doesn't work with ember-data currently - what happens is the `model` object
that gets sent to the `didCreate` callback there won't have an `id` from the
server (it hasn't been filled in for some reason). 

To work around this issue, you need to do something akin to this:

```javascript
saveTheWidget: function() {
  var model = App.Widget.createRecord({name: "very_special_widget"});
  model.addObserver('id', this, this.showWidget);
  model.get('store').commit();
},
showWidget: function(model) {
  model.removeObserver('id', this, this.showWidget);
  this.transitionToRoute('widgets.show', model);
}
```

In that example we trigger the page transition off the change of value of `id`.
This works because for a short while, the `id` will be `null` until Ember-data
fills in the new `id` from the server. Then your callback is called and the page
transition happens. The difference in timing is not noticeable to the user - it's
just a race condition within Ember-data itself. Other than that - in this
example, the observer is removed, which is good practice for observers and you
should always remove observers you've added (as I understand it). 

Other alternative workarounds include wrapping the `transitionToRoute` call in a
`setTimeout()` block - to make it pause just long enough for the model's `id` to
be filled in. 

Most of the above came from
[Stackoverflow](http://stackoverflow.com/questions/14981500/transition-after-saving-model-of-ember-data)
and the [bug report and workaround](https://github.com/emberjs/data/issues/405#issuecomment-18891172) on
ember-data.
