/**
 * @class  Backbone.Rel
 * @name   Backbone Relationships
 * @desc   Backbone.Rel extends your Backbone models with a lightweight relationships manager
*/
(function () {

  var root = this
    , _ = root._;

  if (!_ && (typeof require !== 'undefined')) {
    _ = require('underscore')._;
  }

  /**
   * Computes and gets the relationship
   *
   * @param {String} key
   * @param {Object} options
   * @return {Model|Array|Null}
   */
  function rel(key, options) {
    var self = this
      , singularize, pluralize;

    options = options || {};

    // poor singularize fallback
    singularize = _.singularize || function (word) {
      return word.replace(/s$/, '');
    };

    // poor pluralize fallback
    pluralize = _.pluralize || function (word) {
      return word.replace(/$/, 's');
    };

    function handleHasMany() {
      if (!self.hasMany) {
        return null;
      }

      var options = self.hasMany()[key];

      if (options) {
        return options.collection.filter(function (el) {
          return el.get(options.id) === self.id;
        });
      } else {
        return null;
      }
    }

    function handleBelongsTo() {
      if (!self.belongsTo) {
        return null;
      }

      var collection = self.belongsTo()[key];

      if (collection) {
        return collection.get(self.get(singularize(key) + '_id'));
      } else {
        return null;
      }
    }

    return handleHasMany() || handleBelongsTo();
  };

  _.extend(Backbone.Model.prototype, {rel: rel});

}());
