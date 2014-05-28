var should = require('should');
var assert = require('assert');
var request = require('supertest');
var api = request('http://localhost:3000');

describe('Search', function(){

  describe('GET /search', function() {
    it('should return 400 for bad query', function(done){
      api
      .get('/search')
      .end(function(err, res){
        if(err){
          throw err;
        }
        res.should.have.status(400);
        done();
      });
    });
  });

  describe('GET /search email=no@no.no', function(){
    it('should return 404 if email not found, or 200 if email found', function(done){
      api
      .get('/search?email=no@no.no')
      .end(function(err, res){
        if(err){
          throw err;
        }
        res.should.have.status(404 || 200);
        done();
      });
    });
  });
});