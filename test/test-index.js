var should = require('should');
var assert = require('assert');
var request = require('supertest');
var api = request('http://localhost:3000');
var server = require('../app.js');

describe('Index', function() {
  var url = 'http://localhost:3000';

  before(function(){
    server.listen(3000);
  });

  describe('GET index', function(){
    it('should return 200', function(done){
      api
      .get('/')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(200);
        done();
      });
    });
  });

  describe('GET /logout', function(){
    it('should redirect to /', function(done){
      api
      .get('/logout')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.header['location'].should.include('/');
        done();
      });
    });
  });

  after(function(){
    server.close();
  });
});