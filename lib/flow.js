'use strict';

var _ = require('lodash');
var P = require('bluebird');
var hs = require('highland');

/**
 * Constructs a new flow
 * @param ctx
 * @param through
 * @constructor
 */
function Flow(ctx, through) {
    this._ctx = ctx;
    this._through = _.isArray(through) ? through : [].slice.call(arguments, 1);
}

/**
 * Returns a new flow with the same context, pushing the supplied node onto the node stack
 * @param through
 * @return {Flow}
 */
Flow.prototype.through = function(through) {
    return new Flow(this._ctx, this._through.concat(through));
};

/**
 * Reduces the flow into a single highland stream
 * @return {Object}
 */
Flow.prototype.stream = function() {
    var ctx = this._ctx;
    return this._through.reduce(function (stream, through) {
        return hs(through(stream, ctx));
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