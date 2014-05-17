var https = require('https'),
    verify = require('browserid-verify')(),
    validator = require('validator'),
    redis = require('redis'),
    client = redis.createClient(),
    jwcrypto = require("jwcrypto");
  require("jwcrypto/lib/algs/ds");
  require("jwcrypto/lib/algs/rs");
/*
 * GET home page.
 */

exports.index = function(req, resp){
  resp.render('index', { title: 'Privly Directory Provider', user: req.session.email, csrf: req.session._csrf})
};

exports.auth = function (audience){

  return function(req, resp){
    console.info('verifying with persona');

    var assertion = req.body.assertion;
    var pgp_key;
    var email_key;
    var value;

    verify(assertion, audience, function(err, email, data){
      if (err) {
        // return JSON with a 500 saying something went wrong
        console.warn('request to verifier failed : ' + err);
        return resp.send(500, { status: 'failure', reason : '' + err });
      }


      // got a result, check if it was okay or not
      if (!email) {

        // request worked, but verfication didn't, return JSON
        console.error(data.reason);
        resp.send(403, data);
      }

      console.info('browserid auth successful, setting req.session.email');
      req.session.email = email;

      // extract email from bia
      email_key = get_cert_ia(req.body.assertion);

      // Verify the extraction returned something
      if(!email_key){
        return resp.send(500, {status: 'Incorrect backed identity assertion'});
      }

      email_key = email_key.principal.email

      if(!validator.isEmail(email_key)){
        return resp.send(500, {status: 'Incorrect email from bia'});
      }

      client.get(email_key, function(err, reply){

        // Get updated list of records
        value = which_store(reply, 'bia', req.body.assertion);

        if(!value){
          console.log('Stored incorrect record');
          return resp.send(500, {status: 'Server stored incorrect record'});
        }

        console.log('Storing under email');
        client.set(email_key, JSON.stringify(value.data));

        if(value.matched){

          // store under pgp
          console.log('Storing under pgp');
          pgp_key = value.data[0]['pgp'];
          client.set(pgp_key, JSON.stringify(value.data));
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

exports.store = function (req, resp){
  var email_key;
  var pgp_key;
  var value;

  if(!verify_store_args(req.query)){
    console.log('invalid query');
    return resp.send(400, {status: 'invalid query'});
  }

  email_key = req.query.email;
  pgp_key = req.query.pgp;

  // Get the list of records from key-value store
  client.get(email_key, function(err, reply) {

    // Update the list of records
    value = which_store(reply, 'pgp', pgp_key);


    if(!value){
      return resp.send(500, {status: 'Stored ivnalid record'});
    }

    // Store under email
    console.log('storing under email: ' + email_key);
    client.set(email_key, JSON.stringify(value.data));

    // Check if we matched a pgp public key to bia
    if(value.matched){

      // Store under pgp
      console.log('storing under pgp: ' + pgp_key);
      client.set(pgp_key, JSON.stringify(value.data));
    }
    return resp.send(200, {status: 'records updated'});
  });
}

exports.search = function (req, resp){
  var key;
  var verify;
  var value;
  var code;
  var reason;

  verify = verify_search_args(req.query);

  if(verify == 1){
    key = req.query.email;
  } else if(verify == 2){
    key = req.query.pgp;
  } else {
    return resp.send(400, {status: 'invalid query'});
  }

  console.log(key);

  client.get(key, function(err, reply){
    if(!reply){
      console.log('reply is null');
      return resp.send(404, {status: 'key not found'});
    }
    value = JSON.parse(reply);
    temp = value[0];

    if(temp.hasOwnProperty('bia') && temp.hasOwnProperty('pgp')){
      console.log('latest record is matched');
      return resp.send(200, value);
    }
    // The record list from the key-value store should *never* have
    // more than 1 record unmatched at any given time.
    // If unmatched value in record, pop it from the list
    value.shift();
    if(value.length < 1){
      return resp.send(404, {status: 'no matched recrod found'});
    }

    return resp.send(200, value);
  });
}


function get_cert_ia(bia){
  // Begin breaking down the backed identity assertion in order to extract
  // the user certificate portion which will give the email address to be
  // used as the key in the key-value store.
  bia = new String(bia);

  // Check to make sure it is a Backed Identity Assertion format
  try {
    bia = bia.replace('~', '.');
    bia = bia.split('.');
  } catch (e) {
    // Handle incorrect backed indentity assertion format.
    // It should not error out unless Persona has changed
    // their backed identity assertion format
    console.log(e); // Do something with the error
    return false;
  }

  // Base64 decode the user cert
  try {
    cert = new Buffer(bia[1], 'base64').toString('utf8');
  } catch (e) {
    // Do something with this error
    console.log('Not a valid base64 encoded backed identity assertion');
    consoel.log(e);
    return false;
  }

  // Get the decoded cert into a useable form.
  cert = JSON.parse(cert)

  return cert;
}

function which_store(data, key, value){
  var to_store;
  var matched = false;

  if(!data){
    console.log('Email not found in storage, creating new record');
    to_store = {};
    to_store[key] = value;
    data = [to_store];
  } else {
    console.log('Email found in storage');
    data = JSON.parse(data);
    var temp = data[0];

    if(temp.hasOwnProperty('bia')){
      console.log('bia key exists');

      if(temp.hasOwnProperty('pgp')){
        console.log('pgp key exists');

        console.log('matched record found, creating new record');
        to_store = {};
        to_store[key] = value;

        data.unshift(to_store); // add to beginning of list
      } else {
        temp[key] = value;
        if(key == 'pgp'){
          console.log('trying to match pgp to bia');
          matched = true;
        } else {
          console.log('Overwriting unmatched bia');
        }
      }
    } else {
      console.log('key "bia" not found');
      if(temp.hasOwnProperty('pgp')){
        temp[key] = value;
        if(key == 'bia'){
          console.log('matching bia to pgp');
          matched = true;
        } else {
          console.log('Overwriting unmatched pgp');
        }
        data[0] = temp; // explicitly update the record to have new data
      } else {
        console.log('Server stored invalid data');
        return null;
      }
    }
  }
  return {'data': data, 'matched': matched};
}

function verify_store_args(args){

  var keys = 0;
  var email_eq;
  var pgp_eq;

  // Verify only 2 query keys were sent
  for(var key in args){
    keys++;
  }

  if(keys != 2){
    console.log('Invalid number of keys sent');
    return false;
  }

  if(!args.hasOwnProperty('email') || !args.hasOwnProperty('pgp')){
    console.log('Missing either email key or pgp key');
    return false;
  }

  // Check if only one value given for email key and one value for pgp
  // Multiple values for email key has type of 'object' whereas
  // a single value for email key has typeof 'string'. Same for pgp key
  email_key = args.email;
  pgp_key = args.pgp;

  email_eq = typeof email_key === 'string';
  pgp_eq = typeof pgp_key === 'string';

  if(!email_eq || !pgp_eq){
    console.log('More than one value for a key sent');
    return  false;
  }

  // check email format validity
  if(!validator.isEmail(args.email)){
    console.log('invalid email');
    return false;
  }

  // the store aguments are valid
  return true;
}

function verify_search_args(args){
  var keys = 0;
  var email_key;
  var email_eq;
  var pgp_key;
  var pgp_eq;

  //
  for(var key in args){
    keys++;
  }

  if(keys != 1){
    console.log('Invalid number of keys sent');
    return false;
  }

  if(args.hasOwnProperty('email')){
    console.log('Searching for email');

    email_key = args.email;

    // Check if only one value given for email key
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    email_eq = typeof args.email === 'string';

    if(!email_eq){
      console.log('More than one value sent for email key');
      return false;
    }

    if(!validator.isEmail(email_key)){
      console.log('Invalid email format');
      return false;
    }
    return 1;
  }

  if(args.hasOwnProperty('pgp')){
    console.log('Searching for pgp');

    pgp_key = args.pgp;

    // Check if only one value given for email key
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    pgp_eq = typeof args.pgp === 'string';

    if(!pgp_eq){
      console.log('More than one value sent for pgp key');
      return false;
    }
    return 2;
  }

  console.log('Invalid key sent');
  return null;
}

function verify_sig(pgp_sig, bia, callback){

  var cert;
  var bia_pub_key;

  cert = get_cert_ia(bia);

  if(!cert){
    console.log('error getting user cert from bia');
    callback(false);
  } else {

    bia_pub_key = cert.public-key;

    bia_pub_key = jwcrypto.loadPublicKey(JSON.stringify(bia_pub_key));

    jwcrypto.verify(pgp_sig, bia_pub_key, function(err, payload){
      if(err){
        console.log(err);
        callback(false);
      } else {
        console.log(payload);
        callback(true);
      }
    });
  }
}