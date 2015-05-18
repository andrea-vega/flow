'use strict';

var _ = require('lodash');
var P = require('bluebird');
var hs = require('highland');
var vm = require('vm');

/**
 * Constructs a new flow
 * @param ctx
 * @param nodes
 * @constructor
 */
function Flow(ctx, nodes) {
    this._ctx = ctx;
    this._nodes = _.isArray(nodes) ? nodes : [].slice.call(arguments, 1);
}

/**
 * Returns a new flow with the same context, pushing the supplied node onto the node stack
 * @param node
 * @return {Flow}
 */
Flow.prototype.node = function(node) {
    return new Flow(this._ctx, this._nodes.concat(node));
};

/**
 * Reduces the flow into a single highland stream
 * @return {Object}
 */
Flow.prototype.stream = function() {
    var ctx = this._ctx;
    return this._nodes.reduce(function (stream, node) {
        return hs(node(stream, ctx));
    }, hs([]));
};

/**
 * Convenience method for returning a promise that resolves to an array of values
 * @return {bluebird|exports|module.exports}
 */
Flow.prototype.toArray = function() {
    var stream = this.stream();

    return new P(function (resolve, reject) {
        stream.stopOnError(reject).toArray(resolve);
    });
};

exports.Flow = Flow;