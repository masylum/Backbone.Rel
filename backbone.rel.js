/**
 * @class  Backbone.Rel
 * @name   Backbone Relationships
 * @desc   Backbone.Rel extends your Backbone models with a lightweight relationships manager
*/
(function () {

  var singularize
    , root = this
    , cache = {}
    , _ = root._;

  if (!_ && (typeof require !== 'undefined')) {
    _ = require('underscore')._;
  }

  // poor singularize fallback
  singularize = _.memoize(_.singularize || function (word) {
    return word.replace(/s$/, '');
  });

  /**
   * Computes the caching key
   *
   * @param {Model|Collection} self
   * @param {String} key
   * @return {String}
   */
  function cacheId(self, key) {
    return [self.cid, key].join('-');
  }

  /**
   * Creates a handler that cleans the cache
   *
   * @param {String} cache_id
   * @return {Function}
   */
  function expireCache(cache_id) {
    return function () {
      delete cache[cache_id];
    };
  }

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
    var options = getOptions(this.self, 'hasMany', this.key)
      , cache_id;

    function filter(el) {
      return el.get(options.id) === this.id;
    }

    if (!options) {
      return null;
    }

    if (!options.collection) {
      throw Error('No collection was given');
    }

    cache_id = cacheId(this.self, this.key);

    if (!cache[cache_id]) {
      cache[cache_id] = options.collection.filter(_.bind(options.filter || filter, this.self));
      options.collection.bind('all', expireCache(cache_id));
    }

    return cache[cache_id];
  };

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

  _.extend(Backbone.Model.prototype, {rel: rel('Model')});
  _.extend(Backbone.Collection.prototype, {rel: rel('Collection')});

}());
