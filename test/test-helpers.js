var should = require('should');
var assert = require('assert');
var helpers = require('../helpers');

describe('Helper Functions', function(){

  describe('Get User Certificate from BIA', function(){
    it('should return decoded user certificate from good bia', function(){
      var good_bia = "eyJhbGciOiJEUzEyOCJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjI1YjQ4MDNiZWJkOGIyNDlhMzk4Mjg0NTM1ZWViMzg1M2E1YzVlOGNjMDVkM2Q3NWNkNTNhMjJlM2E2YWFkMjdlYzRjZDlhMzliYjlmZDQ0OWI4NDhlMTNmYWY5MDViNzExMDM1MjMzNjE5NGExN2M0MzY1MjdiYzU1NzJkNzJmOWE5MWY5Y2EzMDgyZjdjNGU5ZDEyMGY4NDc4YmM1MWQxNDc4N2JkYWI1OTE4ZmJmNzFkM2M1NmFkZjc5NWYzNmE4Njc3MzEzYTZjYWQ0MTEyNGZiZWQwMTYyNGM3Njk1YzNkYzk1YjM3ZDZhYzM2ZWU4NzMwNTYwMDExNzc2YzIiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiYWxpY2UtcHJpdmx5QG1vY2tteWlkLmNvbSJ9LCJpYXQiOjE0MDAxOTcwNTIzMzMsImV4cCI6MTQwMDIwMDY1MjMzMywiaXNzIjoibW9ja215aWQuY29tIn0.4dtJo2ESpVKtOGNMdYsHQ3uaddsSPVWB_6EFJSPJu666enBRHWoG9Q~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0MDAxOTcyOTQ3MTksImF1ZCI6Imh0dHA6Ly9kaXJwLmdyci5pbyJ9.YyaDEg4bCNVxCb3hu3O0vh9CB-7fUEqiFRWFwFBfNRD0sY8HMTIVlg";
      assert.notEqual(false, helpers.get_cert_ia(good_bia));
    });

    it('should return false when decoding a bad bia', function(){
      var bad_bia = "dsfdsf.sdfsdf.sdfsdf~sdfdsf.sdfsdf.sdfsdf";
      assert.equal(false, helpers.get_cert_ia(bad_bia));
    });
  });

  describe('Check for correct query format', function(){

    it('should accept pgp as key and return 2 for pgp', function(){
      var query = {pgp: 'dsfdsf'};
      assert.equal(2, helpers.verify_search_query(query));
    });

    it('should accept email as key and return 1 for email', function(){
      var query = {
                    email: 'no@no.no'
                  };
      assert.equal(1, helpers.verify_search_query(query));
    });

    it('should return false for invalid email format', function(){
      var query = {
                    email: 'no@no'
                  };
      assert.equal(false, helpers.verify_search_query(query));
    });

    it('should not accept email and pgp as keys', function(){
      var query = {
                    email: 'no@no.no',
                    pgp: 'sdfdsf'
                  };
      assert.equal(false, helpers.verify_search_query(query));
    });

    it('should not accept should not accept multiple values for key email', function(){
      var query = {
                    email: ['no@no.no', 'yes@yes.yes']
                  };
      assert.equal(false, helpers.verify_search_query(query));
    });

    it('should not accept multiple values for key pgp', function(){
      var query = {
                    pgp: ['sdfdsf', 'sdfsdf']
                  };
      assert.equal(false, helpers.verify_search_query(query));
    });
  });

  describe('Check correct upload format', function(){

    it('should accept email and pgp as keys', function(){
      var query = {
                    email: 'no@no.no',
                    pgp: 'sdfsfsa'
                  };
      assert.notEqual(false, helpers.verify_store_args(query));
    });

    it('should return false if any keys other than pgp AND email are queried', function(){
      var query = {
                    email: 'no@no.no',
                    pgp: 'sdfsfsa',
                    other: 'sdfdsf'
                  };
      assert.equal(false, helpers.verify_store_args(query));

      delete query.other;
      var query2 = query;
      delete query2.email;
      delete query.pgp;

      assert.equal(false, helpers.verify_store_args(query));
      assert.equal(false, helpers.verify_store_args(query2));
    });

    it('should not accept multiple values for key pgp oand key email', function(){
      var query = {
                    pgp: ['sdfdsf', 'sdfsdf'],
                    email: ['no@no.no', 'yes@yes.yes']
                  };
      var query1 = {
                    pgp: ['sdfdsf', 'sdfsdf'],
                    email: 'no@no.no'
                  };
      var query2 = {
                    pgp: 'sdfdsf',
                    email: ['no@no.no', 'yes@yes.yes']
                  };
      assert.equal(false, helpers.verify_search_query(query));
      assert.equal(false, helpers.verify_search_query(query1));
      assert.equal(false, helpers.verify_search_query(query2));
    });
  });

  describe('Check pgp signature against user certificate pub key', function() {

    it('should verify a pgp public key signed by the persona private key', function(done){
      var pgp_sig = "eyJhbGciOiJEUzEyOCJ9.eyJrZXkiOiItLS0tLUJFR0lOIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS1cclxuVmVyc2lvbjogT3BlblBHUC5qcyB2MC4zLjJcclxuQ29tbWVudDogaHR0cDovL29wZW5wZ3Bqcy5vcmdcclxuXHJcbnhrMEVVM1ZROUFFQi8zQllOckVsUXRtaVhwMEVMSStUc3ZqT0pLa3BIdjJNSG9PdCtRcGJwR0VscXo4eFxuOWdVdGE0U1Q0YWtFd09WU3BHZXVGOUQ5MEE0S1BPaCs3WUVHc1lrQUVRRUFBYzBJZFhObGNtNWhiV1hDXG5Yd1FRQVFnQUV3VUNVM1ZROWdrUUlqQTVHUDVCWTd3Q0d3TUFBRmhKQWZvQ1FETlBsemRSdTRXNTVtS1pcbjljdm5Sa3lTR1cxS1VvY1VBRVo2R21GL1VmU1JDRTJDcW1XbDE2NUhLSmdTQkNYem1mYVBkaDFHaDVuY1xuNHRGN2V1a216azBFVTNWUTlnRUIvMW84b1pnc0d0eDlidys5eW9sbWlxWGlsdjdtUU53MVVSQ05yN2JGXG5Qcko4UHY2cnpWQXFtVVpDVndNTWFRejREQU5ldWNaS0NjNTV0QjZWdnhTR3Z6RUFFUUVBQWNKZkJCZ0JcbkNBQVRCUUpUZFZENENSQWlNRGtZL2tGanZBSWJEQUFBVHZZQit3WUJFQjhqdm5CUUZzcUhqRmtyNVoyU1xuekpzbFRRNDRvSWZ3Y25MY3BLdmNlTkRGdTQrcis1VU1ESDZHU3lrMEpPbzVyVWNrTHdEZmZKMFdyRU1lXG5Cb1U9XHJcbj1uL1pwXHJcbi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS1cclxuXHJcbiJ9.ksrtRbU8xyPvlRiv6nTOdPVJqn_H1XY1IpRCBOMs601ABCmbGNWDCA";
      var bia = "eyJhbGciOiJEUzEyOCJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjI1YjQ4MDNiZWJkOGIyNDlhMzk4Mjg0NTM1ZWViMzg1M2E1YzVlOGNjMDVkM2Q3NWNkNTNhMjJlM2E2YWFkMjdlYzRjZDlhMzliYjlmZDQ0OWI4NDhlMTNmYWY5MDViNzExMDM1MjMzNjE5NGExN2M0MzY1MjdiYzU1NzJkNzJmOWE5MWY5Y2EzMDgyZjdjNGU5ZDEyMGY4NDc4YmM1MWQxNDc4N2JkYWI1OTE4ZmJmNzFkM2M1NmFkZjc5NWYzNmE4Njc3MzEzYTZjYWQ0MTEyNGZiZWQwMTYyNGM3Njk1YzNkYzk1YjM3ZDZhYzM2ZWU4NzMwNTYwMDExNzc2YzIiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiYWxpY2UtcHJpdmx5QG1vY2tteWlkLmNvbSJ9LCJpYXQiOjE0MDAxOTcwNTIzMzMsImV4cCI6MTQwMDIwMDY1MjMzMywiaXNzIjoibW9ja215aWQuY29tIn0.4dtJo2ESpVKtOGNMdYsHQ3uaddsSPVWB_6EFJSPJu666enBRHWoG9Q~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0MDAxOTcyOTQ3MTksImF1ZCI6Imh0dHA6Ly9kaXJwLmdyci5pbyJ9.YyaDEg4bCNVxCb3hu3O0vh9CB-7fUEqiFRWFwFBfNRD0sY8HMTIVlg";
      helpers.verify_sig(pgp_sig, bia, function(result){
        assert.equal(true, result);
        done();
      });
    });

    it('should not verify a pgp public key not signed by the persona private key', function(done){
      var pgp_sig = "eyJhbGciOiJEUzEyOCJ9.eJrZXkiOiItLS0tLUJFR0lOIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS1cclxuVmVyc2lvbjogT3BlblBHUC5qcyB2MC4zLjJcclxuQ29tbWVudDogaHR0cDovL29wZW5wZ3Bqcy5vcmdcclxuXHJcbnhrMEVVM1ZROUFFQi8zQllOckVsUXRtaVhwMEVMSStUc3ZqT0pLa3BIdjJNSG9PdCtRcGJwR0VscXo4eFxuOWdVdGE0U1Q0YWtFd09WU3BHZXVGOUQ5MEE0S1BPaCs3WUVHc1lrQUVRRUFBYzBJZFhObGNtNWhiV1hDXG5Yd1FRQVFnQUV3VUNVM1ZROWdrUUlqQTVHUDVCWTd3Q0d3TUFBRmhKQWZvQ1FETlBsemRSdTRXNTVtS1pcbjljdm5Sa3lTR1cxS1VvY1VBRVo2R21GL1VmU1JDRTJDcW1XbDE2NUhLSmdTQkNYem1mYVBkaDFHaDVuY1xuNHRGN2V1a216azBFVTNWUTlnRUIvMW84b1pnc0d0eDlidys5eW9sbWlxWGlsdjdtUU53MVVSQ05yN2JGXG5Qcko4UHY2cnpWQXFtVVpDVndNTWFRejREQU5ldWNaS0NjNTV0QjZWdnhTR3Z6RUFFUUVBQWNKZkJCZ0JcbkNBQVRCUUpUZFZENENSQWlNRGtZL2tGanZBSWJEQUFBVHZZQit3WUJFQjhqdm5CUUZzcUhqRmtyNVoyU1xuekpzbFRRNDRvSWZ3Y25MY3BLdmNlTkRGdTQrcis1VU1ESDZHU3lrMEpPbzVyVWNrTHdEZmZKMFdyRU1lXG5Cb1U9XHJcbj1uL1pwXHJcbi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS1cclxuXHJcbiJ9.ksrtRbU8xyPvlRiv6nTOdPVJqn_H1XY1IpRCBOMs601ABCmbGNWDCA";
      var bia = "eyJhbGciOiJEUzEyOCJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjI1YjQ4MDNiZWJkOGIyNDlhMzk4Mjg0NTM1ZWViMzg1M2E1YzVlOGNjMDVkM2Q3NWNkNTNhMjJlM2E2YWFkMjdlYzRjZDlhMzliYjlmZDQ0OWI4NDhlMTNmYWY5MDViNzExMDM1MjMzNjE5NGExN2M0MzY1MjdiYzU1NzJkNzJmOWE5MWY5Y2EzMDgyZjdjNGU5ZDEyMGY4NDc4YmM1MWQxNDc4N2JkYWI1OTE4ZmJmNzFkM2M1NmFkZjc5NWYzNmE4Njc3MzEzYTZjYWQ0MTEyNGZiZWQwMTYyNGM3Njk1YzNkYzk1YjM3ZDZhYzM2ZWU4NzMwNTYwMDExNzc2YzIiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiYWxpY2UtcHJpdmx5QG1vY2tteWlkLmNvbSJ9LCJpYXQiOjE0MDAxOTcwNTIzMzMsImV4cCI6MTQwMDIwMDY1MjMzMywiaXNzIjoibW9ja215aWQuY29tIn0.4dtJo2ESpVKtOGNMdYsHQ3uaddsSPVWB_6EFJSPJu666enBRHWoG9Q~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0MDAxOTcyOTQ3MTksImF1ZCI6Imh0dHA6Ly9kaXJwLmdyci5pbyJ9.YyaDEg4bCNVxCb3hu3O0vh9CB-7fUEqiFRWFwFBfNRD0sY8HMTIVlg";
      helpers.verify_sig(pgp_sig, bia, function(result){
        assert.equal(false, result);
        done();
      });
    });
  });

  describe('Check which value we are storing and/or matching', function(){

    it('should create a new record if last record has pgp and bia keys', function(){
      var data = [{pgp: 'dfdsf', bia: 'no@no.no'}];
      var key = 'bia';
      var value = 'this should be a bia';
      var result;

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.equal(false, result.matched);
      assert.equal(value, result.data[0][key]);

      key = 'pgp';
      value = 'this should be a pgp key';

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.equal(false, result.matched);
      assert.equal(value, result.data[0][key]);
    });

    it('should overwrite unmatched pgp key', function(){
      var data = [{pgp: 'dfdsf'}];
      var key = 'pgp';
      var value = 'this should be a pgp key';
      var result;

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.notEqual(data[0][key], result.data[0][key]);
    });

    it('should overwrite unmatched bia', function(){
      var data = [{bia: 'dfdsf'}];
      var key = 'bia';
      var value = 'this should be a bia';
      var result;

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.notEqual(data[0][key], result.data[0][key]);
    });

    it('should return null if pgp and bia are not keys in the list of objects', function(){
      var data = [{not_pgp: 'dfdsf'}];
      var key = 'pgp';
      var value = 'this should be a pgp key';
      var result;

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.equal(null, result);

      data = [{not_bia: 'dfdsf'}];
      key = 'bia';
      value = 'this should be a bia';

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.equal(null, result);
    });

    it('should create a new records list when no records list given', function(){
      var data = null;
      var key = 'pgp';
      var value = 'this should be a pgp';
      var result;

      result = helpers.which_store(data, key, value);

      assert.notEqual(null, result);
    });

    it('should match pgp to bia', function(){
      var data = [{pgp: 'dfdsf'}];
      var key = 'bia';
      var value = 'this should be a bia';
      var result;

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.equal(true, result.matched);

      data = [{bia: 'dfdsf'}];
      key = 'pgp';
      value = 'this should be a pgp key';

      result = helpers.which_store(JSON.stringify(data), key, value);

      assert.equal(true, result.matched);
    });
  });
});