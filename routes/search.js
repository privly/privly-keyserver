var helpers = require('../helpers'),
    redis = require('redis'),
    client = redis.createClient();

exports.search = function (req, resp){

  var key;

  var verified = helpers.verify_search_query(req.query);

  if(verified == 1){
    key = req.query.email;
  } else if(verified == 2){
    key = req.query.pgp;
  } else {
    return resp.send(400, {status: 'invalid query'});
  }

  client.get(key, function(err, reply){
    if(!reply){
      console.log('reply is null');
      return resp.send(404, {status: 'key not found'});
    }
    var value = JSON.parse(reply);

    if(value[0].hasOwnProperty('bia') && value[0].hasOwnProperty('pgp')){
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
};
