module.exports = (function () {
  var _ = require('underscore')
    , Models = {}
    , Collections = {}
    , EventBus = {}
    , users, tasks, projects, comments;

  GLOBAL.Backbone = require('backbone');
  require('../backbone.rel');

  _.extend(EventBus, Backbone.Events);

  Backbone.Model.prototype.relEventBus = EventBus;
  Backbone.Collection.prototype.relEventBus = EventBus;

  Models.Task = Backbone.Model.extend({
    belongsTo: function () {
      return {
        user: users
      , project: function (task) {
          return task.rel('user.project');
        }
      };
    }
  , hasMany: function () {
      return {
        comments: {collection: comments, id: 'task_id'}
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
    belongsTo: function () {
      return {
        owner: function (project) {
          var owner_id = project.get('owner_id');
          return _.isNumber(owner_id) && users.get(owner_id);
        }
      };
    }
  , hasMany: function () {
      return {
        users: {collection: users, id: 'project_id'}
      , tasks: {collection: tasks, filter: function (task) {
            return task.rel('project')
              ? task.rel('project').id === this.id
              : null;
          }
        }
      };
    }
  , fullName: function () {
      return 'Project ' + this.get('name');
    }
  });

  Models.Comment = Backbone.Model.extend({
    belongsTo: function () {
      return {
        task: tasks
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

  Collections.Comments = Backbone.Collection.extend({
    model: Models.Comment
  });

  function instance() {
    projects = new Collections.Projects([
      {id: 0, owner_id: 0, name: 'project1'}
    , {id: 1, owner_id: 0, name: 'project2'}
    ]);

    users = new Collections.Users([
      {id: 0, project_id: 0, name: 'user1'}
    , {id: 1, project_id: 1, name: 'user2'}
    , {id: 2 }
    ]);

    tasks = new Collections.Tasks([
      {id: 0, name: 'task1'}
    , {id: 1, user_id: 1, name: 'task2'}
    , {id: 2, user_id: 0, name: 'task3'}
    , {id: 3, user_id: 1, name: 'task4'}
    , {id: 4, user_id: 0, name: 'task5'}
    , {id: 5, user_id: 1, name: 'task6'}
    ]);

    comments = new Collections.Comments([
      {id: 1, task_id: 1, name: 'comment1'}
    , {id: 2, task_id: 1, name: 'comment2'}
    , {id: 3, task_id: 2, name: 'comment3'}
    , {id: 4, task_id: 2, name: 'comment4'}
    , {id: 5, task_id: 3, name: 'comment5'}
    , {id: 6, task_id: 4, name: 'comment6'}
    ]);

    return {
      projects: projects
    , users: users
    , tasks: tasks
    , comments: comments
    };
  }

  return {
    Collections: Collections
  , Models: Models
  , instance: instance
  , EventBus: EventBus
  };
})();
