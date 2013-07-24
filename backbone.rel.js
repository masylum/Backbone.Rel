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
  singularize = _.memoize(_.singularize || function (word) {
    return word.replace(/s$/, '');
  });

  /**
   * Get the relationship options
   *
   * @param {Model} self
   * @param {String} rel
   * @param {String} key
   * @return {Collection|Null}
   */
  function getOptions(self, rel, key) {
    return self[rel]
      ? self[rel]()[key]
      : null;
  }

  /**
   * Constructor
   *
   * @param {Model|Collection} self
   * @param {String} key
   * @param {String} type [Collection|Model]
   * @return {RelHandler}
   */
  function RelHandler(self, key, type) {
    this.self = self;
    this.key = key;
    this.type = type;
  }

  /**
   * Searches the relations for the self object
   *
   * @return {Model|Array<Model>|Null}
   */
  RelHandler.prototype.searchRelations = function () {
    if (this.type === 'Collection') {
      return this.handleBelongsTo();
    } else {
      return this.handleHasMany() || this.handleBelongsTo();
    }
  };

  /**
   * Gets the belongsTo id attribute
   *
   * @return {Number}
   */
  RelHandler.prototype.findBelongsToIdAttribute = function () {
    var id_attr = singularize(this.key) + '_id';

    if (this.type === 'Model') {
      return this.self.get(id_attr);
    } else {
      return this.self[id_attr];
    }
  };

  /**
   * Handles the belongsTo relationship
   *
   * @return {Model|Null}
   */
  RelHandler.prototype.handleBelongsTo = function () {
    var collection = getOptions(this.self, 'belongsTo', this.key)
      , result;

    if (!collection) {
      return null;
    }

    if (_.isFunction(collection)) {
      result = collection(this.self);
    } else {
      result = collection.get(this.findBelongsToIdAttribute());
    }

    return result || null;
  };

  /**
   * Handles the hasMany relationship
   *
   * @return {Array<Model>|Null}
   */
  RelHandler.prototype.handleHasMany = function () {
    var options = getOptions(this.self, 'hasMany', this.key);

    function filter(el) {
      return el.get(options.id) === this.id;
    }

    if (!options) {
      return null;
    }

    if (!options.collection) {
      throw Error('No collection was given');
    }

    return options.collection.filter(_.bind(options.filter || filter, this.self));
  };

  /**
   * Gets an attribute over a relation
   *
   * @param {String} relation
   * @param {String} attribute
   * @param {<A>} default_value
   * @return {<A>}
   */
  function relResult(relation, attribute, default_value) {
    var rel = this.rel(relation);

    if (rel) {
      if (_.isArray(rel)) {
        return _.map(rel, function (r) {
          return _.result(r, attribute);
        });
      } else {
        return _.result(rel, attribute);
      }
    } else {
      return default_value || null;
    }
  }

  /**
   * Gets an attribute over a relation
   *
   * @param {String} relation
   * @param {String} attribute
   * @param {<A>} default_value
   * @return {<A>}
   */
  function relGet(relation, attribute, default_value) {
    var rel = this.rel(relation);

    if (rel) {
      if (_.isArray(rel)) {
        return _.map(rel, function (r) {
          return r.get(attribute);
        });
      } else {
        return rel.get(attribute);
      }
    } else {
      return default_value || null;
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
          if (_.isUndefined(memo)) {
            return self.rel(key);
          } else if (_.isArray(memo)) {
            return _.flatten(_.map(memo, function (item) {
              return item.rel(key);
            }));
          } else if (memo) {
            return memo.rel(key);
          } else {
            return null;
          }
        }, undefined);
      }

      return (new RelHandler(self, key, type)).searchRelations();
    };
  }

  _.extend(Backbone.Model.prototype, {rel: rel('Model'), relGet: relGet, relResult: relResult});
  _.extend(Backbone.Collection.prototype, {rel: rel('Collection'), relGet: relGet, relResult: relResult});

}());
