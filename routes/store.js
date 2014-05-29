var helpers = require('../helpers'),
    redis = require('redis'),
    client = redis.createClient();

exports.store = function (req, resp){
  var email_key;
  var pgp_key;
  var value;
  var bia;

  if(!helpers.verify_store_args(req.query)){
    //console.log('invalid query');
    return resp.send(400, {status: 'invalid query'});
  }

  email_key = req.query.email;
  pgp_key = req.query.pgp;

  // Get the list of records from key-value store
  client.get(email_key, function(err, reply) {

    // Update the list of records
    value = helpers.which_store(reply, 'pgp', pgp_key);

    if(!value){
      return resp.send(500, {status: 'Stored ivnalid record'});
    }

    // Check if we matched a pgp public key to bia
    if(value.matched){

      bia = value.data[0]['bia'];

      // Store under pgp
      console.log('Verifying pgp signature to bia pubkey');
      helpers.verify_sig(pgp_key, bia, function(verified){
        if(verified){
          //console.log('Signatured verified!');
          //console.log('Storing under pgp');
          client.set(pgp_key, JSON.stringify(value.data));
          client.set(email_key, JSON.stringify(value.data));
        } else {
          //console.log('pgp signature does not match bia pub key');
          // delete the pgp key sing which_store will add it
          delete value.data[0]['pgp'];
          //console.log('Storing under email');
          client.set(email_key, JSON.stringify(value.data));
        }
        return resp.send(200, {status: 'records updated'});
      });
    } else {
      // Store under email
      //console.log('storing under email');
      client.set(email_key, JSON.stringify(value.data));
      return resp.send(200, {status: 'records updated'});
    }
    //return resp.send(200, {status: 'records updated'});
  });
};
