var https = require('https'),
    verify = require('browserid-verify')(),
    validator = require('validator'),
    redis = require('redis'),
    client = redis.createClient();
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

    verify(assertion, audience, function(err, email, data){
      if (err) {
        // return JSON with a 500 saying something went wrong
        console.warn('request to verifier failed : ' + err);
        return resp.send(500, { status: 'failure', reason : '' + err });
      }


      // got a result, check if it was okay or not
      if (email){
        console.info('browserid auth successful, setting req.session.email');
        req.session.email = email;
        email_key = get_email_ia(req.body.assertion);
        if(!email_key){
          return resp.send(500, {status: 'Incorrect backed identity assertion'});
        }
        client.on("error", function (err) { // Check connection to key-value store
          resp.send(500, {status: 'Redis server cannot be reachead'});
        });
        client.set(email_key, JSON.stringify({'bia': req.body.assertion}));
        return resp.redirect('/');
      }

      // request worked, but verfication didn't, return JSON
      console.error(data.reason);
      resp.send(403, data)
    });
  };

};

exports.logout = function (req, resp){
  req.session.destroy();
  resp.redirect('/');
};

exports.store = function (req, resp){

  console.log(req.query);
  var keys = 0;

  // Make sure *ONLY* 'email' and 'pgp' are keys sent
  for(var key in req.query){
    keys++;
  }

  if(keys > 2){
    console.log('Invalid number of keys sent')
    return resp.send(400, {status: 'Invalid store query'});
  }

  // Check if email key given as query
  if(req.query.hasOwnProperty('email') && req.query.hasOwnProperty('pgp')){
    // Check if only one value given for email key and one value for pgp
    // Multiple values for email key has type of 'object' whereas
    // a single value for email key has typeof 'string'
    if(typeof req.query.email === 'string' && typeof req.query.pgp === 'string'){
      return resp.send(200, {status: 'email and pgp sent!'});
    }
  }
  return resp.send(400, {status: 'Invalid store query'});
}


function get_email_ia(bia){
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

  // Get the email from the user certificate and do a format verification
  if(!validator.isEmail(cert.principal.email)){
    // Do something as this is an error
    console.log('Email invalid');
    return false;
  }

  return cert.principal.email;
}

function which_store(data, key, value){
  var matched = false;

  if(!data){
    console.log('Email not found in storage, creating new record');
    var to_store = {};
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
        var to_store = {};
        to_store[key] = value;

        data.unshift(to_store); // add to beginning of list
      } else {
        temp[key] = value;
        if(key == 'pgp'){
          console.log('matching bia to pgp');
          matched = true;
        } else {
          console.log('Overwriting unmatched pgp');
        }
      }
    } else {
      console.log('key "bia" not found');
      if(temp.hasOwnProperty('pgp')){
        temp[key] = value;
        if(temp.hasOwnProperty('bia')){
          console.log('matching bia to pgp');
          matched = true;
        } else {
          console.log('Overwriting unmatched pgp');
        }
      } else {
        console.log('Server stored invalid data');
        return null;
      }
    }
  }
  return {'data': data, 'matched': matched};
}