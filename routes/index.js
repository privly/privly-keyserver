/**
 * @fileOverview The login page, logout page, and persona login verification
 * process.
 *
 */

var https = require('https'),
    verify = require('browserid-verify')(),
    validator = require('validator'),
    redis = require('redis'),
    client = redis.createClient();

var helpers = require('../helpers');
/*
 * GET home page.
 */

exports.index = function(req, resp){
  resp.render('index', { title: 'Privly Key Server', user: req.session.email, csrf: req.session._csrf})
};

exports.auth = function (audience){

  return function(req, resp){
    //console.info('verifying with persona');

    var assertion = req.body.assertion;

    verify(assertion, audience, function(err, email, data){
      if (err) {
        // return JSON with a 500 saying something went wrong
        //console.warn('request to verifier failed : ' + err);
        return resp.send(500, { status: 'failure', reason : '' + err });
      }


      // got a result, check if it was okay or not
      if (!email) {

        // request worked, but verfication didn't, return JSON
        console.error(data.reason);
        resp.send(403, data);
      }

      //console.info('browserid auth successful, setting req.session.email');
      req.session.email = email;

      // extract user certificate from bia
      var cert = helpers.get_cert_ia(req.body.assertion);

      // Verify the extraction returned something
      if(!cert){
        return resp.send(500, {status: 'Incorrect backed identity assertion'});
      }

      // extract email from user cert
      var email_key = cert.principal.email

      if(!validator.isEmail(email_key)){
        return resp.send(500, {status: 'Incorrect email from bia'});
      }

      // get value associated with email from key-value store
      client.get(email_key, function(err, reply){

        // Get updated list of records
        var value = which_store(reply, 'bia', req.body.assertion);

        if(!value){
          //console.log('Stored incorrect record');
          return resp.send(500, {status: 'Server stored incorrect record'});
        }

        if(value.matched){

          // store under pgp
          console.log('Verifying pgp signature to bia pubkey');
          var pgp_key = value.data[0]['pgp'];
          var bia = value.data[0]['bia'];
          helpers.verify_sig(pgp_key, bia, function(verified){
            if(verified){
              //console.log('Signatured verified!');
              //console.log('Storing under pgp');
              client.set(pgp_key, JSON.stringify(value.data));
            } else {
              //console.log('pgp signature does not match bia pub key');
              //console.log('deleting offending pgp key');
              delete value.data[0]['pgp'];
              //console.log('Storing under email');
              client.set(email_key, JSON.stringify(value.data));
            }
          });
        } else {
          //console.log('Storing under email');
          client.set(email_key, JSON.stringify(value.data));
        }
      });

      return resp.redirect('/');
    });
  };
};

exports.logout = function (req, resp){
  req.session.destroy();
  resp.redirect('/');
};
