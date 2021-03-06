var metadata = require(__dirname + '/../src/metadata.js');
var fs = require('fs');
var assert = require('assert');

require('string.fromcodepoint');

describe('Metadata service', function() {

  describe('for code generation', function() {

    it("should extract right unicodes from files", function() {
      var metadataService = metadata();
      metadataService('/var/plop/hello.svg', function(err, infos) {
        if(err) {
          return done(err);
        }
        assert.deepEqual(
          infos, {
            path: '/var/plop/hello.svg',
            name: 'hello',
            unicode: [String.fromCharCode(0xEA01)],
            renamed: false
          }
        );
      });
    });

    it("should append unicodes to files when the option is set", function(done) {
      fs.writeFileSync(__dirname + '/results/plop.svg', 'plop', 'utf-8');
      var metadataService = metadata({
        appendUnicode: true,
        log: function() {},
        error: function() {
          done(new Error('Not supposed to be here'));
        }
      });
      metadataService(__dirname + '/results/plop.svg', function(err, infos) {
        if(err) {
          return done(err);
        }
        assert.deepEqual(
          infos, {
            path: __dirname + '/results/uEA01-plop.svg',
            name: 'plop',
            unicode: [String.fromCharCode(0xEA01)],
            renamed: true
          }
        );
        assert(fs.existsSync(__dirname + '/results/uEA01-plop.svg'));
        assert(!fs.existsSync(__dirname + '/results/plop.svg'));
        fs.unlinkSync(__dirname + '/results/uEA01-plop.svg');
        done();
      });
    });

    it("should log file rename errors", function(done) {
      var metadataService = metadata({
        appendUnicode: true,
        startUnicode: 0xEA02,
        error: function(err) {},
        log: function() {
          done(new Error('Not supposed to be here'));
        }
      });
      metadataService(__dirname + '/results/plop.svg', function(err, infos) {
        assert(!infos);
        assert(err);
        assert(!fs.existsSync(__dirname + '/results/uEA02-plop.svg'));
        done();
      });
    });

  });

  describe('for code extraction', function() {

    it("should work for simple codes", function(done) {
      var metadataService = metadata();
      metadataService('/var/plop/u0001-hello.svg', function(err, infos) {
        assert(!err);
        assert.deepEqual(infos, {
            path: '/var/plop/u0001-hello.svg',
            name: 'hello',
            unicode: [String.fromCharCode(0x0001)],
            renamed: false
          }
        );
        done();
      });
    });

    it("should work for several codes", function(done) {
      var metadataService = metadata();
      metadataService('/var/plop/u0001,u0002-hello.svg', function(err, infos) {
        assert(!err);
        assert.deepEqual(infos, {
            path: '/var/plop/u0001,u0002-hello.svg',
            name: 'hello',
            unicode: [String.fromCharCode(0x0001), String.fromCharCode(0x0002)],
            renamed: false
          }
        );
        done();
      });
    });

    it("should work for higher codepoint codes", function(done) {
      var metadataService = metadata();
      metadataService('/var/plop/u1F63A-hello.svg', function(err, infos) {
        assert(!err);
        assert.deepEqual(infos, {
            path: '/var/plop/u1F63A-hello.svg',
            name: 'hello',
            unicode: [String.fromCodePoint(0x1f63a)],
            renamed: false
          }
        );
        done();
      });
    });

    it("should work for ligature codes", function(done) {
      var metadataService = metadata();
      metadataService('/var/plop/u0001u0002-hello.svg', function(err, infos) {
        assert(!err);
        assert.deepEqual(infos, {
            path: '/var/plop/u0001u0002-hello.svg',
            name: 'hello',
            unicode: [String.fromCharCode(0x0001) + String.fromCharCode(0x0002)],
            renamed: false
          }
        );
        done();
      });
    });

    it("should work for nested codes", function(done) {
      var metadataService = metadata();
      metadataService('/var/plop/u0001u0002,u0001-hello.svg', function(err, infos) {
        assert(!err);
        assert.deepEqual(infos, {
            path: '/var/plop/u0001u0002,u0001-hello.svg',
            name: 'hello',
            unicode: [
              String.fromCharCode(0x0001) + String.fromCharCode(0x0002),
              String.fromCharCode(0x0001)
            ],
            renamed: false
          }
        );
        done();
      });
    });

  });

});
