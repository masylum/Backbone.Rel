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
      , keys = key.split('.')
      , singularize;

    // kind of monadic accesor
    if (keys.length > 1) {
      return _.reduce(keys, function (memo, key) {
        if (typeof memo === 'undefined') {
          return self.rel(key);
        } else if (memo) {
          return memo.rel(key);
        } else {
          return null;
        }
      }, undefined);
    }

    options = options || {};

    // poor singularize fallback
    singularize = _.singularize || function (word) {
      return word.replace(/s$/, '');
    };

    function handleHasMany() {
      if (!self.hasMany) {
        return null;
      }

      var options = self.hasMany()[key];

      function filter(el) {
        return el.get(options.id) === this.id;
      }

      if (options) {
        return options.collection.filter(_.bind(options.filter || filter, self));
      } else {
        return null;
      }
    }

    function handleBelongsTo() {
      if (!self.belongsTo) {
        return null;
      }

      var target = self.belongsTo()[key];

      if (target) {
        if (_.isFunction(target)) {
          return target(self) || null;
        } else {
          return target.get(self.get(singularize(key) + '_id')) || null;
        }
      } else {
        return null;
      }
    }

    return handleHasMany() || handleBelongsTo();
  };

  _.extend(Backbone.Model.prototype, {rel: rel});

}());
