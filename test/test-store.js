var should = require('should');
var assert = require('assert');
var request = require('supertest');
var api = request('http://localhost:3000');
var server = require('../app.js');

describe('Search', function(){

  before(function(){
    server.listen(3000);
  });


  after(function(){
    server.close();
  });
});