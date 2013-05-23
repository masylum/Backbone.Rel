module.exports = (function () {
  var _ = require('underscore')
    , Models = {}
    , Collections = {}
    , users, tasks, projects, comments;

  GLOBAL.Backbone = require('backbone');
  require('../backbone.rel');

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
      {id: 0, owner_id: 0}
    , {id: 1, owner_id: 0}
    ]);

    users = new Collections.Users([
      {id: 0, project_id: 0}
    , {id: 1, project_id: 1}
    , {id: 2 }
    ]);

    tasks = new Collections.Tasks([
      {id: 0}
    , {id: 1, user_id: 1}
    , {id: 2, user_id: 0}
    , {id: 3, user_id: 1}
    , {id: 4, user_id: 0}
    , {id: 5, user_id: 1}
    ]);

    comments = new Collections.Comments([
      {id: 1, task_id: 1}
    , {id: 2, task_id: 1}
    , {id: 3, task_id: 2}
    , {id: 4, task_id: 2}
    , {id: 5, task_id: 3}
    , {id: 6, task_id: 4}
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
  };
})();
