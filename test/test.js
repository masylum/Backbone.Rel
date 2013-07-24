/*global it, describe, before, beforeEach*/
var _ = require('underscore')
  , data = require('./data')
  , assert = require('assert')
  , Collections = data.Collections
  , Models = data.Models;

// lengths
describe('Rel', function () {
  var users, projects, tasks;

  beforeEach(function () {
    var instance = data.instance(1);

    users = instance.users;
    projects = instance.projects;
    tasks = instance.tasks;
  });

  describe('Models', function () {
    describe('hasMany', function () {
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

      it('returns the tasks for a given project', function () {
        assert.deepEqual(_.pluck(projects.get(0).rel('tasks'), 'id'), [2, 4]);
        assert.deepEqual(_.pluck(projects.get(1).rel('tasks'), 'id'), [1, 3, 5]);
      });

      it('returns the users for a given project', function () {
        assert.deepEqual(_.pluck(projects.get(0).rel('users'), 'id'), [0]);
        assert.deepEqual(_.pluck(projects.get(1).rel('users'), 'id'), [1]);
      });

      it('returns the tasks names for a given user', function () {
        assert.deepEqual(users.get(0).relGet('tasks', 'name'), ['task3', 'task5']);
        assert.deepEqual(users.get(1).relGet('tasks', 'name'), ['task2', 'task4', 'task6']);
        assert.deepEqual(users.get(2).relGet('tasks', 'name'), []);
      });
    });

    describe('belongsTo', function () {
      it('returns the project for a given user', function () {
        assert.equal(users.get(0).rel('project'), projects.get(0));
        assert.equal(users.get(1).rel('project'), projects.get(1));
        assert.deepEqual(users.get(2).rel('project'), null);
      });

      it('returns the user for a given task', function () {
        assert.deepEqual(tasks.get(0).rel('user'), null);
        assert.deepEqual(tasks.get(1).rel('user'), users.get(1));
        assert.deepEqual(tasks.get(2).rel('user'), users.get(0));
        assert.deepEqual(tasks.get(3).rel('user'), users.get(1));
        assert.deepEqual(tasks.get(4).rel('user'), users.get(0));
      });

      it('returns the project for a given task', function () {
        assert.throws(function () {
          assert.deepEqual(tasks.get(0).rel('project'), projects.get(0));
        });
        assert.deepEqual(tasks.get(1).rel('project'), projects.get(1));
        assert.deepEqual(tasks.get(2).rel('project'), projects.get(0));
        assert.deepEqual(tasks.get(3).rel('project'), projects.get(1));
      });

      it('returns the owner for a given project', function () {
        assert.deepEqual(projects.get(0).rel('owner'), users.get(0));
        assert.deepEqual(projects.get(1).rel('owner'), users.get(0));
      });

      it('returns the project name for a given user', function () {
        assert.equal(users.get(0).relGet('project', 'name'), 'project1');
        assert.equal(users.get(1).relGet('project', 'name'), 'project2');
        assert.deepEqual(users.get(2).relGet('project', 'name', 'hihi'), 'hihi');
        assert.deepEqual(users.get(2).relGet('project', 'name'), null);
      });

      it('returns the project `full name` for a given user', function () {
        assert.equal(users.get(0).relResult('project', 'fullName'), 'Project project1');
        assert.equal(users.get(1).relResult('project', 'fullName'), 'Project project2');
        assert.deepEqual(users.get(2).relResult('project', 'fullName', 'hihi'), 'hihi');
        assert.deepEqual(users.get(2).relResult('project', 'fullName'), null);
      });
    });

    it('returns the user tasks owners for a given user', function () {
      assert.deepEqual(_.pluck(users.get(0).rel('tasks.user'), 'id'), [0, 0]);
    });

    it('returns the comments of all user tasks', function () {
      assert.deepEqual(_.pluck(users.get(0).rel('tasks.comments'), 'id'), [3, 4, 6]);
    });

    it('returns the comment names of all user tasks', function () {
      assert.deepEqual(users.get(0).relGet('tasks.comments', 'name'), ['comment3', 'comment4', 'comment6']);
    });
  });

  describe('Collections', function () {
    it('returns the `belongsTo` relationship if the key is defined', function () {
      Collections.ProjectTasks = Backbone.Collection.extend({
        model: Models.Task
      , initialize: function (models, options) {
          this.project_id = options.project_id;
        }
      , belongsTo: function () {
          return {
            project: projects
          };
        }
      });

      tasks = new Collections.ProjectTasks([{id: 100}], {project_id: 1});

      assert.deepEqual(tasks.length, 1);
      assert.deepEqual(tasks.rel('project'), projects.get(1));
    });

    it('returns null if the `belongsTo` key is not defined', function () {
      Collections.ProjectTasks = Backbone.Collection.extend({
        model: Models.Task
      , belongsTo: function () {
          return {
            project: projects
          };
        }
      });

      tasks = new Collections.ProjectTasks([{id: 100}], {project_id: 1});

      assert.deepEqual(tasks.length, 1);
      assert.deepEqual(tasks.rel('project'), null);
    });

    it('returns null if trying to access a `hasMany` relationship', function () {
      Collections.OwnerUsers = Backbone.Collection.extend({
        model: Models.Task
      , hasMany: function () {
          return {
            owned_projects: {collection: projects, id: 'owner_id'}
          };
        }
      });

      tasks = new Collections.OwnerUsers();
      assert.deepEqual(tasks.rel('owned_projects'), null);
    });
  });

});
