var jwcrypto = require("jwcrypto"),
    helpers = require('./helpers');
    validator = require('validator');
require("jwcrypto/lib/algs/ds");
require("jwcrypto/lib/algs/rs");


exports.get_cert_ia = function(bia){
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
    //console.log(e); // Do something with the error
    return false;
  }

  // Base64 decode the user cert
  try {
    cert = new Buffer(bia[1], 'base64').toString('utf8');
  } catch (e) {
    // Do something with this error
    //console.log('Not a valid base64 encoded backed identity assertion');
    //consoel.log(e);
    return false;
  }

  // Get the decoded cert into a useable form.
  try{
  cert = JSON.parse(cert);
  } catch (e) {
    //console.log('Not a valid user cert');
    return false;
  }

  return cert;
};

exports.verify_search_query = function(query){
  var keys = 0;
  var email_key;
  var email_eq;
  var pgp_key;
  var pgp_eq;

  //
  for(var key in query){
    keys++;
  }

  if(keys != 1){
    //console.log('Invalid number of keys sent');
    return false;
  }

  if(query.hasOwnProperty('email')){
    //console.log('Searching for email');

    email_key = query.email;

    // Check if only one value given for email key
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    email_eq = typeof query.email === 'string';

    if(!email_eq){
      //console.log('More than one value sent for email key');
      return false;
    }

    if(!validator.isEmail(email_key)){
      //console.log('Invalid email format');
      return false;
    }
    return 1;
  }

  if(query.hasOwnProperty('pgp')){
    //console.log('Searching for pgp');

    pgp_key = query.pgp;

    // Check if only one value given for email key
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    pgp_eq = typeof query.pgp === 'string';

    if(!pgp_eq){
      //console.log('More than one value sent for pgp key');
      return false;
    }
    return 2;
  }

  //console.log('Invalid key sent');
  return null;
};

exports.which_store = function(data, key, value){
  var to_store;
  var matched = false;

  if(!data){
    //console.log('Email not found in storage, creating new record');
    to_store = {};
    to_store[key] = value;
    data = [to_store];
  } else {
    //console.log('Email found in storage');
    data = JSON.parse(data);
    var temp = data[0];

    if(temp.hasOwnProperty('bia')){
      //console.log('bia key exists');

      if(temp.hasOwnProperty('pgp')){
        //console.log('pgp key exists');

        //console.log('matched record found, creating new record');
        to_store = {};
        to_store[key] = value;

        data.unshift(to_store); // add to beginning of list
      } else {
        temp[key] = value;
        if(key == 'pgp'){
          //console.log('Matched pgp to bia');
          matched = true;
        } else {
          //console.log('Overwriting unmatched bia');
        }
      }
    } else {
      //console.log('key "bia" not found');
      if(temp.hasOwnProperty('pgp')){
        temp[key] = value;
        if(key == 'bia'){
          //console.log('Matched bia to pgp');
          matched = true;
        } else {
          //console.log('Overwriting unmatched pgp');
        }
        data[0] = temp; // explicitly update the record to have new data
      } else {
        //console.log('Server stored invalid data');
        return null;
      }
    }
  }
  return {'data': data, 'matched': matched};
};

exports.verify_store_args = function(args){

  var keys = 0;
  var email_eq;
  var pgp_eq;

  // Verify only 2 query keys were sent
  for(var key in args){
    keys++;
  }

  if(keys != 2){
    //console.log('Invalid number of keys sent');
    return false;
  }

  if(!args.hasOwnProperty('email') || !args.hasOwnProperty('pgp')){
    //console.log('Missing either email key or pgp key');
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
    //console.log('More than one value for a key sent');
    return  false;
  }

  // check email format validity
  if(!validator.isEmail(args.email)){
    //console.log('invalid email');
    return false;
  }

  // the store aguments are valid
  return true;
};

exports.verify_sig = function(pgp_sig, bia, callback){

  var cert;
  var bia_pub_key;

  cert = helpers.get_cert_ia(bia);

  if(!cert){
    //console.log('error getting user cert from bia');
    callback(false);
  } else {

    bia_pub_key = cert['public-key'];

    bia_pub_key = jwcrypto.loadPublicKey(JSON.stringify(bia_pub_key));

    jwcrypto.verify(pgp_sig, bia_pub_key, function(err, payload){
      if(err){
        //console.log(err);
        callback(false);
      } else {
        //console.log(payload);
        callback(true);
      }
    });
  }
};
