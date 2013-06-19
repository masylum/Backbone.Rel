# Backbone.Rel

Backbone.Rel extends your Backbone models with a lightweight relationships manager.

## How does it work? API

### Rel

Backbone.Rel exposes a method `rel` that is a relationship *getter*.

### hasMany

You can implement a `hasMany` method in a `Model` to define a relationship.
The method must return an object with the relation name as a key and options as a value.

Options:

  - `collection`: You must specify the collection.
  - `filter`: A function that will be used to filter the collection.
  - `id`: The foreign id pointing to your model.

### belongsTo

You can implement a `belongsTo` method in a `Model` or a `Collection` to define a relationship.
The method must return an object with the relation name as a key and the collection as a value.

If you want to define a `belongsTo` relationship on a collection you have to store the key
on the collection object in your `initialize`.

## Accessing nested relationships, the "monadic" `rel` getter.

You can pass as many arguments as you want to the `rel` getter in order to get nested relationships.
Any failure on the getter chain will be properly propagated, avoiding `TypeError: Cannot call method 'foo' of null`.

## Accessing attributes inside the relations

Most of the errors on working with relational data is when a relation is not met and we try to access a attribute
of that inexistant model. For instance, we have a task that belong to a project and we want to get that projects name.

```js
task.relGet('project', 'name', 'Unknown project'); // It will show the project name or 'Unkown project'
user.relGet('project.tasks', 'name', []); // It will return all tasks names or []
```

## Example

``` javascript
// models/project.js
Models.Project.hasMany = function () {
  return {
    users: {collection: Collections.users, id: 'project_id'}
  , tasks: {collection: Collection.tasks, filter: function (task) {
      return task.rel('project') ? task.rel('project').id === this.id : null;
    }}
  };
};

// models/user.js
Models.User.hasMany = function () {
  return {
    tasks: {collection: Collections.tasks, id: 'user_id'}
  };
};

Models.User.belongsTo = function () {
  return {
    project: Collection.projects
  };
};

// models/task.js
Models.Task.belongsTo = function () {
  return {
    user: Collections.users
  , project: function (task) {
      return task.rel('user.project');
    }
  };
};

var project = new Project({id: 1})
  , user = new User({id: 1, project_id: 1})
  , task1 = new Task({id: 1, user_id: 1})
  , task2 = new Task({id: 2, user_id: 1});

assert.equal(user.rel('tasks').length, 2);
assert.equal(user.rel('project'), project);
assert.equal(task1.rel('user'), user);
assert.equal(task1.rel('project'), project);
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
