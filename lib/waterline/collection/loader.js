/**
 * Module Dependencies
 */

var hasOwnProperty = require('../utils/helpers').object.hasOwnProperty;

/**
 * Collection Loader
 *
 * @param {Object} connections
 * @param {Object} collection
 * @api public
 */

var CollectionLoader = module.exports = function(collection, connections) {

  // Normalize and validate the collection
  this.collection = this._validate(collection, connections);

  // Find the named connections used in the collection
  this.namedConnections = this._getConnections(collection, connections);

  return this;
};

/**
 * Initalize the collection
 *
 * @param {Object} context
 * @param {Function} callback
 * @api public
 */

CollectionLoader.prototype.initialize = function initialize(context, cb) {

  new this.collection(context, this.namedConnections, function(err, coll) {
    if(err) return cb(err);
    cb(null, coll);
  });

};

/**
 * Validate Collection structure.
 *
 * @param {Object} collection
 * @param {Object} connections
 * @api private
 */

CollectionLoader.prototype._validate = function _validate(collection, connections) {

  // Throw Error if no Tablename/Identity is set
  if(!hasOwnProperty(collection.prototype, 'tableName') && !hasOwnProperty(collection.prototype, 'identity')) {
    throw new Error('A tableName or identity property must be set.');
  }

  // Normalize tableName to identity
  if(hasOwnProperty(collection.prototype, 'tableName')) {
    collection.prototype.identity = collection.prototype.tableName;
  }

  // Ensure identity is lowercased
  collection.prototype.identity = collection.prototype.identity.toLowerCase();

  // Find the connections used by this collection
  // If none is specified check if a default connection exist
  if(!hasOwnProperty(collection.prototype, 'connection')) {

    // Check if a default connection was specified
    if(!hasOwnProperty(connections, 'default')) {
      return next(new Error('No adapter was specified for collection: ' + collection.prototype.identity));
    }

    // Set the connection as the default
    collection.prototype.connection = 'default';
  }

  return collection;
};

/**
 * Get the named connections
 *
 * @param {Object} collection
 * @param {Object} connections
 * @api private
 */

CollectionLoader.prototype._getConnections = function _getConnections(collection, connections) {

  // Hold the used connections
  var usedConnections = {};

  // Normalize connection to array
  if(!Array.isArray(collection.prototype.connection)) {
    collection.prototype.connection = [collection.prototype.connection];
  }

  // Set the connections used for the adapter
  collection.prototype.connection.forEach(function(conn) {

    // Ensure the named connection exist
    if(!hasOwnProperty(connections, conn)) {
      var msg = 'The connection ' + conn + ' specified in ' + collection.prototype.identity + ' does not exists.';
      throw new Error(msg);
    }

    usedConnections[conn] = connections[conn];
  });

  return usedConnections;
};