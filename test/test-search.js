var should = require('should');
var assert = require('assert');
var request = require('supertest');
var api = request('http://localhost:5000');
var server = require('../app.js');
var redis = require('redis'),
    client = redis.createClient();

describe('Search', function(){

  before(function(){
    server.listen(5000);
  });

  describe('GET /search', function() {
    it('should return 400 for bad query', function(done){
      api
      .get('/search')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(400);
        done();
      });
    });
  });

  describe('GET /search by email', function(){

    var email_key = 'no@no.no';
    var email_key2 = 'yes@yes.yes';
    var pgp_key = 'dsfdsf';
    var pgp2_key = 'lkjlkj';

    before(function(done){
      client.del(email_key);
      client.set(email_key2, JSON.stringify([{bia: 'dsfdsfsd', pgp: pgp_key}]));
      done();
    });

    it('should return 404 if email not found', function(done){
      api
      .get('/search?email=' + email_key)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(404);
        done();
      });
    });

    it('should return 200 if email found', function(done){
      api
      .get('/search?email=' + email_key2)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(200);
        done();
      });
    });

    after(function(done){
      client.del(email_key2);
      done();
    });
  });

  describe('GET /search by pgp', function(){

    var pgp_key = 'dsfdsf';
    var pgp_key2 = 'lkjlkj';

    before(function(done){
      client.del(pgp_key);
      client.set(pgp_key2, JSON.stringify([{bia: 'dsfdsfsd', pgp: pgp_key2}]));
      done();
    });

    it('should return 404 if pgp key not found', function(done){
      api
      .get('/search?pgp=' + pgp_key)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(404);
        done();
      });
    });

    it('should return 200 if pgp key found', function(done){
      api
      .get('/search?pgp=' + pgp_key2)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(200);
        done();
      });
    });

    after(function(done){
      client.del(pgp_key2);
      done();
    });
  });

  describe('Check for correct query format', function(){

    var email_key = 'no@no.no';
    var pgp_key = 'hijkl';

    before(function(done){
      client.del(email_key);
      client.del(pgp_key);
      done();
    });

    it('should accept only "pgp" as query key and return 200 or 404', function(done){
      api
      .get('/search?pgp=' + pgp_key)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(404);
        done();
      });
    });

    it('should accept "email" as query key 200 or 404', function(done){
      api
      .get('/search?email=' + email_key)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(404);
        done();
      });
    });

    it('should return 400 for invalid email format', function(done){
      api
      .get('/search?email=no@no')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(400);
        done();
      });
    });

    it('should not accept email *and* pgp as query keys', function(done){
      api
      .get('/search?email=' + email_key + '&pgp=' + pgp_key)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(400);
        done();
      });
    });

    it('should not accept multiple values for key email query', function(done){
      api
      .get('/search?email=' + email_key + '&email=yes@yes.yes')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(400);
        done();
      });
    });

    it('should not accept multiple values for key pgp query', function(done){
      api
      .get('/search?pgp=' + pgp_key + '&pgp=aaaa')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(400);
        done();
      });
    });

    it('should only accept "pgp" *or* "email" as query keys', function(done){
      api
      .get('/search?aaa=sdfdsf')
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(400);
        done();
      });
    });
  });

  after(function(){
    server.close();
    client.end();
  });
});

