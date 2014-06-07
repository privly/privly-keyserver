/**
 * @fileOverview Helper functions used by the upload and storage endpoints
 * to do parameter validation, user certificate extraction, signed pgp public
 * key verification, and determining how data will be stored.
 *
 */

var jwcrypto = require("jwcrypto"),
    helpers = require('./helpers'),
    validator = require('validator');
require("jwcrypto/lib/algs/ds");
require("jwcrypto/lib/algs/rs");

  /**
   * Extract User Certificate from Backed Identity Assertion
   *
   *  @param {bia} undecoded backed identity assertion.
   *
   *  @return {boolean or object}
   */
exports.get_cert_ia = function(bia){
  // Begin breaking down the backed identity assertion in order to extract
  // the user certificate portion which will give the email address to be
  // used as the key in the key-value store.
  var decoded_bia;
  var cert;

  // Check to make sure it is a Backed Identity Assertion format
  try {
    bia = bia.replace('~', '.');
    bia = bia.split('.');
  } catch (e) {
    // Incorrect backed identity assertion format.
    // It should not error out unless Persona has changed
    // their backed identity assertion format
    return false;
  }

  // Base64 decode the user cert
  try {
    decoded_bia = new Buffer(bia[1], 'base64').toString('utf8');
  } catch (e) {
    // Not a valid base64 encoded backed identity assertion
    return false;
  }

  // Get the decoded cert into a usable form.
  try{
    cert = JSON.parse(decoded_bia);
  } catch (e) {
    // Not a valid user cert
    return false;
  }
  return cert;
};

  /**
   * Verify search query keys/string
   *
   *  @param {query} search endpoint query string
   *
   *  @return {boolean or int}
   */
exports.verify_search_query = function(query){

  var keys = 0;

  // Count the number of keys in the query
  // Should be *ONLY* 1 key.
  for(var key in query){
    keys++;
  }

  if(keys !== 1){
    // Invalid number of keys sent
    return false;
  }

  if(query.hasOwnProperty('email')){
    var email_key = query.email;

    // Check if only one value given for email key
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    var email_eq = (typeof email_key) === 'string';

    if(!email_eq){
      // More than one value sent for email key
      return false;
    }

    if(!validator.isEmail(email_key)){
      // Invalid email format
      return false;
    }
    return 1;
  }

  if(query.hasOwnProperty('pgp')){
    var pgp_key = query.pgp;

    // Check if only one value given for email key
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    var pgp_eq = (typeof pgp_key) === 'string';

    if(!pgp_eq){
      // More than one value sent for pgp key
      return false;
    }
    return 2;
  }
  // Invalid key sent
  return null;
};

  /**
   * Figure out wether storing values under just email key
   * or storing values under pgp key also
   *
   *  @param {data} Stringified data extracted from the key-value store
   *  @param {key} What type of value to store ('bia' or 'pgp')
   *  @param {value} The bia or pgp public key to store.
   *
   *  @return {null or object}
   *
   * Possible outcomes:
   *  | BIA | PGP | Outcome                                               |
   *  |  0  |  0  | Invalid data stored, return null                      |
   *  |  0  |  1  | Create new record with pgp or overwrite unmatched pgp |
   *  |  1  |  0  | Create new record with bia or overwrite unmatched bia |
   *  |  1  |  1  | Match bia to pgp                                      |
   */
exports.which_store = function(data, key, value){
  var to_store;
  var matched = false;

  // Check if data from key-value store is empty
  if(!data){
    // Email not found in storage, creating new record
    to_store = {};
    to_store[key] = value;
    data = [to_store];
  } else {
    // Email found in storage
    data = JSON.parse(data);
    var temp = data[0];

    if(temp.hasOwnProperty('bia')){
      // bia key exists

      if(temp.hasOwnProperty('pgp')){
        // pgp key exists

        // matched record found, creating new record
        to_store = {};
        to_store[key] = value;

        // add to beginning of list
        data.unshift(to_store);
      } else {
        temp[key] = value;
        if(key === 'pgp'){
          // Matched pgp to bia
          matched = true;
        }
      }
    } else {
      // key "bia" not found
      if(temp.hasOwnProperty('pgp')){
        temp[key] = value;
        if(key === 'bia'){
          // Matched bia to pgp
          matched = true;
        }
        // explicitly update the record to have new data
        data[0] = temp;
      } else {
        // Server stored invalid data'
        return null;
      }
    }
  }
  return {'data': data, 'matched': matched};
};


  /**
   * Verify store query keys/string
   *
   *  @param {query} store endpoint query string
   *
   *  @return {boolean}
   */
exports.verify_store_args = function(args){

  var keys = 0;

  // Verify only 2 query keys were sent
  for(var key in args){
    keys++;
  }

  if(keys !== 2){
    // Invalid number of keys sent
    return false;
  }

  if(!args.hasOwnProperty('email') || !args.hasOwnProperty('pgp')){
    // Missing either email key or pgp key
    return false;
  }

  // Check if only one value given for email key and one value for pgp
  // Multiple values for email key has type of 'object' whereas
  // a single value for email key has typeof 'string'. Same for pgp key
  var email_key = args.email;
  var pgp_key = args.pgp;

  var email_eq = (typeof email_key) === 'string';
  var pgp_eq = (typeof pgp_key) === 'string';

  if(!email_eq || !pgp_eq){
    // More than one value for a key sent
    return  false;
  }

  // check email format validity
  if(!validator.isEmail(args.email)){
    // invalid email
    return false;
  }

  // the store arguments are valid
  return true;
};

  /**
   * Verify pgp public signed by the person private key
   *
   *  @param {pgp_sig} pgp pubic key signed by persona private key
   *  @param {bia} undecoded backed identity assertion
   *  @param {function} callback function to be ran after jwcrypto signature verify
   */
exports.verify_sig = function(pgp_sig, bia, callback){

  // extract user certificate from bia
  var cert = helpers.get_cert_ia(bia);

  if(!cert){
    // error getting user cert from bia
    callback(false);
  } else {

    // Load public key from user certificate (String form)
    var bia_pub_key = cert['public-key'];

    // load public key into a usable for for jwcrypto
    bia_pub_key = jwcrypto.loadPublicKey(JSON.stringify(bia_pub_key));

    jwcrypto.verify(pgp_sig, bia_pub_key, function(err, payload){
      if(err){
        callback(false);
      } else {
        callback(true);
      }
    });
  }
};
