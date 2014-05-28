var should = require('should');
var assert = require('assert');
var request = require('supertest');
var api = request('http://localhost:3000');

describe('Index', function() {
  var url = 'http://localhost:3000';

  describe('GET index', function(){
    it('should return 200', function(done){
      api
      .get('/')
      .end(function(err, res){
        if(err){
          throw err;
        }
        res.should.have.status(200);
        done();
      });
    });
  });
});