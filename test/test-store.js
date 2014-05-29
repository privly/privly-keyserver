var should = require('should');
var assert = require('assert');
var request = require('supertest');
var api = request('http://localhost:3000');
var server = require('../app.js');
var redis = require('redis'),
    client = redis.createClient();

describe('Store', function(){

  var email_key = 'alice-privly@mockmyid.com';
  var pgp_key = 'eyJhbGciOiJEUzEyOCJ9.eyJrZXkiOiItLS0tLUJFR0lOIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS1cclxuVmVyc2lvbjogT3BlblBHUC5qcyB2MC4zLjJcclxuQ29tbWVudDogaHR0cDovL29wZW5wZ3Bqcy5vcmdcclxuXHJcbnhrMEVVM1ZROUFFQi8zQllOckVsUXRtaVhwMEVMSStUc3ZqT0pLa3BIdjJNSG9PdCtRcGJwR0VscXo4eFxuOWdVdGE0U1Q0YWtFd09WU3BHZXVGOUQ5MEE0S1BPaCs3WUVHc1lrQUVRRUFBYzBJZFhObGNtNWhiV1hDXG5Yd1FRQVFnQUV3VUNVM1ZROWdrUUlqQTVHUDVCWTd3Q0d3TUFBRmhKQWZvQ1FETlBsemRSdTRXNTVtS1pcbjljdm5Sa3lTR1cxS1VvY1VBRVo2R21GL1VmU1JDRTJDcW1XbDE2NUhLSmdTQkNYem1mYVBkaDFHaDVuY1xuNHRGN2V1a216azBFVTNWUTlnRUIvMW84b1pnc0d0eDlidys5eW9sbWlxWGlsdjdtUU53MVVSQ05yN2JGXG5Qcko4UHY2cnpWQXFtVVpDVndNTWFRejREQU5ldWNaS0NjNTV0QjZWdnhTR3Z6RUFFUUVBQWNKZkJCZ0JcbkNBQVRCUUpUZFZENENSQWlNRGtZL2tGanZBSWJEQUFBVHZZQit3WUJFQjhqdm5CUUZzcUhqRmtyNVoyU1xuekpzbFRRNDRvSWZ3Y25MY3BLdmNlTkRGdTQrcis1VU1ESDZHU3lrMEpPbzVyVWNrTHdEZmZKMFdyRU1lXG5Cb1U9XHJcbj1uL1pwXHJcbi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS1cclxuXHJcbiJ9.ksrtRbU8xyPvlRiv6nTOdPVJqn_H1XY1IpRCBOMs601ABCmbGNWDCA';


  before(function(){
    server.listen(3000);
    var data = [{
      bia: 'eyJhbGciOiJEUzEyOCJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjI1YjQ4MDNiZWJkOGIyNDlhMzk4Mjg0NTM1ZWViMzg1M2E1YzVlOGNjMDVkM2Q3NWNkNTNhMjJlM2E2YWFkMjdlYzRjZDlhMzliYjlmZDQ0OWI4NDhlMTNmYWY5MDViNzExMDM1MjMzNjE5NGExN2M0MzY1MjdiYzU1NzJkNzJmOWE5MWY5Y2EzMDgyZjdjNGU5ZDEyMGY4NDc4YmM1MWQxNDc4N2JkYWI1OTE4ZmJmNzFkM2M1NmFkZjc5NWYzNmE4Njc3MzEzYTZjYWQ0MTEyNGZiZWQwMTYyNGM3Njk1YzNkYzk1YjM3ZDZhYzM2ZWU4NzMwNTYwMDExNzc2YzIiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiYWxpY2UtcHJpdmx5QG1vY2tteWlkLmNvbSJ9LCJpYXQiOjE0MDAxOTcwNTIzMzMsImV4cCI6MTQwMDIwMDY1MjMzMywiaXNzIjoibW9ja215aWQuY29tIn0.4dtJo2ESpVKtOGNMdYsHQ3uaddsSPVWB_6EFJSPJu666enBRHWoG9Q~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0MDAxOTcyOTQ3MTksImF1ZCI6Imh0dHA6Ly9kaXJwLmdyci5pbyJ9.YyaDEg4bCNVxCb3hu3O0vh9CB-7fUEqiFRWFwFBfNRD0sY8HMTIVlg'
    }];

    client.set(email_key, JSON.stringify(data));
  });

  describe('Upload signed PGP Public Key', function(){
    it('should return 200 when uploading a public pgp key signed by the persona private key', function(done){
      api
      .get('/store?email=' + email_key + '&pgp=' + pgp_key)
      .end(function(err, res){
        if(err){
          done(err);
        }
        res.should.have.status(200);
      });
      done();
    });
  });


  after(function(){
    var email_key = "alice-privly@mockmyid.com";
    server.close();
    client.del(email_key);
    client.del(pgp_key);
    client.end();
  });
});