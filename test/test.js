/*global it, describe, before, beforeEach*/
var _ = require('underscore')
  , assert = require('assert')
  , Models = {}
  , Collections = {}

  // instances
  , tasks, projects, users;

GLOBAL.Backbone = require('backbone');
require('../backbone.rel');

Models.Task = Backbone.Model.extend({
  belongsTo: function () {
    return {
      user: users
    , project: function (task) {
        return projects.get(task.rel('user.project'));
      }
    };
  }
});

Models.User = Backbone.Model.extend({
  hasMany: function () {
    return {
      tasks: {collection: tasks, id: 'user_id'}
    , owned_projects: {collection: projects, id: 'owner_id'}
    };
  }
, belongsTo: function () {
    return {
      project: projects
    };
  }
});

Models.Project = Backbone.Model.extend({
  hasMany: function () {
    return {
      tasks: {collection: tasks, filter: function (task) {
        return task.rel('project')
          ? task.rel('project').id === this.id
          : null;
      }}
    , users: {collection: users, id: 'project_id'}
    };
  }
, belongsTo: function () {
    return {
      owner: users
    };
  }
});

Collections.Users = Backbone.Collection.extend({
  model: Models.User
});

Collections.Projects = Backbone.Collection.extend({
  model: Models.Project
});

Collections.Tasks = Backbone.Collection.extend({
  model: Models.Task
});

// lengths
describe('Rel', function () {
  beforeEach(function () {
    tasks = new Collections.Tasks();
    projects = new Collections.Projects();
    users = new Collections.Users();

    // Initial state
    for (var i = 0; i < 3; i++) {
      users.add({id: i, project_id: i % 3});
    }

    for (var i = 0; i < 6; i++) {
      if (i === 0) {
        tasks.add({id: i});
      } else {
        tasks.add({id: i, user_id: i % 2});
      }
    }

    for (var i = 0; i < 2; i++) {
      projects.add({id: i, owner_id: 0});
    }
  });

  it('returns the project for a given user', function () {
    assert.equal(users.get(0).rel('project'), projects.get(0));
    assert.equal(users.get(1).rel('project'), projects.get(1));
    assert.deepEqual(users.get(2).rel('project'), null);
  });

  it('returns the tasks for a given user', function () {
    assert.deepEqual(_.pluck(users.get(0).rel('tasks'), 'id'), [2, 4]);
    assert.deepEqual(_.pluck(users.get(1).rel('tasks'), 'id'), [1, 3, 5]);
    assert.deepEqual(_.pluck(users.get(2).rel('tasks'), 'id'), []);
  });

  it('returns the owned projects for a given user', function () {
    assert.deepEqual(_.pluck(users.get(0).rel('owned_projects'), 'id'), [0, 1]);
    assert.deepEqual(users.get(1).rel('owned_projects'), []);
    assert.deepEqual(users.get(2).rel('owned_projects'), []);
  });

  it('returns the user for a given task', function () {
    assert.deepEqual(tasks.get(0).rel('user'), null);
    assert.deepEqual(tasks.get(1).rel('user'), users.get(1));
    assert.deepEqual(tasks.get(2).rel('user'), users.get(0));
    assert.deepEqual(tasks.get(3).rel('user'), users.get(1));
    assert.deepEqual(tasks.get(4).rel('user'), users.get(0));
    // ...
  });

  it('returns the project for a given task', function () {
    assert.throws(function () {
      assert.deepEqual(tasks.get(0).rel('project'), projects.get(0));
    });
    assert.deepEqual(tasks.get(1).rel('project'), projects.get(1));
    assert.deepEqual(tasks.get(2).rel('project'), projects.get(0));
    assert.deepEqual(tasks.get(3).rel('project'), projects.get(1));
    // ...
  });

  it('returns the owner for a given project', function () {
    assert.deepEqual(projects.get(0).rel('owner'), users.get(0));
    assert.deepEqual(projects.get(1).rel('owner'), users.get(0));
  });

  it('returns the tasks for a given project', function () {
    assert.deepEqual(_.pluck(projects.get(0).rel('tasks'), 'id'), [2, 4]);
    assert.deepEqual(_.pluck(projects.get(1).rel('tasks'), 'id'), [1, 3, 5]);
  });

  it('returns the users for a given project', function () {
    assert.deepEqual(_.pluck(projects.get(0).rel('users'), 'id'), [0]);
    assert.deepEqual(_.pluck(projects.get(1).rel('users'), 'id'), [1]);
  });
});
