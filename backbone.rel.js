/**
 * @class  Backbone.Rel
 * @name   Backbone Relationships
 * @desc   Backbone.Rel extends your Backbone models with a lightweight relationships manager
*/
(function () {

  var singularize
    , root = this
    , _ = root._;

  if (!_ && (typeof require !== 'undefined')) {
    _ = require('underscore')._;
  }

  // poor singularize fallback
  singularize = _.singularize || function (word) {
    return word.replace(/s$/, '');
  };

  /**
   * Handles the hasMany relationship
   *
   * @param {Model} self
   * @param {String} key
   * @return {Model|Array|Null}
   */
  function handleHasMany(self, key) {
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

  /**
   * Handles the belongsTo relationship
   *
   * @param {Model} self
   * @param {String} key
   * @param {String} type [Collection|Model]
   * @return {Model|Array|Null}
   */
  function handleBelongsTo(self, key, type) {
    if (!self.belongsTo) {
      return null;
    }

    var target = self.belongsTo()[key];

    function getAttribute(key) {
      if (type === 'Model') {
        return self.get(key);
      } else {
        return self[key];
      }
    }

    if (target) {
      if (_.isFunction(target)) {
        return target(self) || null;
      } else {
        return target.get(getAttribute(singularize(key) + '_id')) || null;
      }
    } else {
      return null;
    }
  }

  /**
   * Computes and gets the relationship
   *
   * @param {String} type [Collection|Model]
   * @return {Model|Array|Null}
   */
  function rel(type) {
    return function (key) {
      var self = this
        , keys = key.split('.');

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

      if (type === 'Collection') {
        return handleBelongsTo(self, key, type);
      } else {
        return handleHasMany(self, key) || handleBelongsTo(self, key, type);
      }
    };
  };

  _.extend(Backbone.Model.prototype, {rel: rel('Model')});
  _.extend(Backbone.Collection.prototype, {rel: rel('Collection')});

}());
