'use strict';

var should = require('chai').should();
var lib = require('../');

describe('your module', function () {
    it('should exist', function () {
        should.exist(lib);
    });

    it('should compose a stream', function (done) {
        var stream = lib.create({ foo: 'bar' })
            .node(function () {
                return [{}];
            })
            .node(function (stream, ctx) {
                return stream.doto(function (record) {
                    Object.keys(ctx).forEach(function (key) {
                        record[key] = ctx[key];
                    });
                });
            })
            .stream();

        should.exist(stream);

        stream.toArray(function (arr) {
            try {
                arr.should.have.deep.members([{ foo: 'bar' }]);
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should return a promise to an array', function () {
        return lib.create()
            .node(function () {
                return [{ name: 'Brad' }, { name: 'Hank' }];
            })
            .node(function (stream) {
                return stream.doto(function (r) {
                    r.name = r.name.toUpperCase();
                });
            })
            .toArray()
            .then(function (arr) {
                arr.should.have.deep.members([{ name: 'BRAD' }, { name: 'HANK' }]);
            });
    });
});