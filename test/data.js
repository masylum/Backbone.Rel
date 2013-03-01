module.exports = (function () {
  var _ = require('underscore');
  var Backbone = require('backbone');
  require('../backbone.rel');

  var users, tasks, projects;

  var Models = {
    Task: Backbone.Model.extend({
      belongsTo: function () {
        return {
          user: users,
          project: function (task) {
            return task.rel('user.project');
          }
        };
      }
    }),

    User: Backbone.Model.extend({
      hasMany: function () {
        return {
          tasks: {collection: tasks, id: 'user_id'},
          owned_projects: {collection: projects, id: 'owner_id'}
        };
      },
      belongsTo: function () {
        return {
          project: projects
        };
      }
    }),

    Project: Backbone.Model.extend({
      belongsTo: function () {
        return {
          owner: function (project) {
            var owner_id = project.get('owner_id');
            return _.isNumber(owner_id) && users.get(owner_id);
          }
        }
      },
      hasMany: function () {
        return {
          users: {collection: users, id: 'project_id'},
          tasks: {
            collection: tasks, filter: function (task) {
              return task.rel('project') ? task.rel('project').id === this.id : null;
            }
          }
        }
      }
    })
  };


  var Collections = {
    Users: Backbone.Collection.extend({
      model: Models.User
    }),

    Projects: Backbone.Collection.extend({
      model: Models.Project
    }),

    Tasks: Backbone.Collection.extend({
      model: Models.Task
    })
  };


  function instance() {
    projects = new Collections.Projects([{
      id: 0, owner_id: 0
    }, {
      id: 1, owner_id: 0
    }]);

;

    users = new Collections.Users([{
      id: 0, project_id: 0
    }, {
      id: 1, project_id: 1
    }, {
      id: 2
    }]);

    tasks = new Collections.Tasks([{
      id: 0
    }, {
      id: 1, user_id: 1
    }, {
      id: 2, user_id: 0
    }, {
      id: 3, user_id: 1
    }, {
      id: 4, user_id: 0
    }, {
      id: 5, user_id: 1
    }]);

    return {
      projects: projects,
      users: users,
      tasks: tasks
    }
  }

  return {
    Collections: Collections,
    Models: Models,
    instance: instance
  };
})();
