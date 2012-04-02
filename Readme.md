# Backbone.Rel

Backbone.Rel extends your Backbone models with a lightweight relationships manager.

## How does it work?

Backbone.Rel exposes a method `rel` that is a relationship *getter*.
You can implement your `hasMany` and `belongsTo` like in this example:

``` javascript
Models.User.hasMany = function () {
  return {
    tasks: {collection: Collections.tasks, id: 'user_id'}
  };
};

Models.Task.belongsTo = function () {
  return {
    user: Collections.users
  };
};

var user = new User({id: 1})
  , task1 = new Task({id: 1, user_id: 1})
  , task2 = new Task({id: 2, user_id: 1});

assert.equal(user.rel('tasks').length, 2);
assert.equal(task1.rel('user'), user);
```

## Dependencies

Backbone.Rel depends on [underscore.inflection](https://github.com/jeremyruppel/underscore.inflection).

## Tests

You must have node installed in order to run the tests.

```
npm install
make
```

## License

(The MIT License)

Copyright (c) 2012 Pau Ramon <masylum@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
