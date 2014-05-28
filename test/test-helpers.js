var should = require('should');
var assert = require('assert');
var helpers = require('../helpers');

describe('Helper Functions', function(){

  describe('Get User Certificate from BIA', function(){
    describe('Get decoded User Certificate from Good BIA', function(){
      it('should return decoded user certificate from good bia', function(){
        var good_bia = "eyJhbGciOiJEUzEyOCJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjI1YjQ4MDNiZWJkOGIyNDlhMzk4Mjg0NTM1ZWViMzg1M2E1YzVlOGNjMDVkM2Q3NWNkNTNhMjJlM2E2YWFkMjdlYzRjZDlhMzliYjlmZDQ0OWI4NDhlMTNmYWY5MDViNzExMDM1MjMzNjE5NGExN2M0MzY1MjdiYzU1NzJkNzJmOWE5MWY5Y2EzMDgyZjdjNGU5ZDEyMGY4NDc4YmM1MWQxNDc4N2JkYWI1OTE4ZmJmNzFkM2M1NmFkZjc5NWYzNmE4Njc3MzEzYTZjYWQ0MTEyNGZiZWQwMTYyNGM3Njk1YzNkYzk1YjM3ZDZhYzM2ZWU4NzMwNTYwMDExNzc2YzIiLCJwIjoiZmY2MDA0ODNkYjZhYmZjNWI0NWVhYjc4NTk0YjM1MzNkNTUwZDlmMWJmMmE5OTJhN2E4ZGFhNmRjMzRmODA0NWFkNGU2ZTBjNDI5ZDMzNGVlZWFhZWZkN2UyM2Q0ODEwYmUwMGU0Y2MxNDkyY2JhMzI1YmE4MWZmMmQ1YTViMzA1YThkMTdlYjNiZjRhMDZhMzQ5ZDM5MmUwMGQzMjk3NDRhNTE3OTM4MDM0NGU4MmExOGM0NzkzMzQzOGY4OTFlMjJhZWVmODEyZDY5YzhmNzVlMzI2Y2I3MGVhMDAwYzNmNzc2ZGZkYmQ2MDQ2MzhjMmVmNzE3ZmMyNmQwMmUxNyIsInEiOiJlMjFlMDRmOTExZDFlZDc5OTEwMDhlY2FhYjNiZjc3NTk4NDMwOWMzIiwiZyI6ImM1MmE0YTBmZjNiN2U2MWZkZjE4NjdjZTg0MTM4MzY5YTYxNTRmNGFmYTkyOTY2ZTNjODI3ZTI1Y2ZhNmNmNTA4YjkwZTVkZTQxOWUxMzM3ZTA3YTJlOWUyYTNjZDVkZWE3MDRkMTc1ZjhlYmY2YWYzOTdkNjllMTEwYjk2YWZiMTdjN2EwMzI1OTMyOWU0ODI5YjBkMDNiYmM3ODk2YjE1YjRhZGU1M2UxMzA4NThjYzM0ZDk2MjY5YWE4OTA0MWY0MDkxMzZjNzI0MmEzODg5NWM5ZDViY2NhZDRmMzg5YWYxZDdhNGJkMTM5OGJkMDcyZGZmYTg5NjIzMzM5N2EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiYWxpY2UtcHJpdmx5QG1vY2tteWlkLmNvbSJ9LCJpYXQiOjE0MDAxOTcwNTIzMzMsImV4cCI6MTQwMDIwMDY1MjMzMywiaXNzIjoibW9ja215aWQuY29tIn0.4dtJo2ESpVKtOGNMdYsHQ3uaddsSPVWB_6EFJSPJu666enBRHWoG9Q~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjE0MDAxOTcyOTQ3MTksImF1ZCI6Imh0dHA6Ly9kaXJwLmdyci5pbyJ9.YyaDEg4bCNVxCb3hu3O0vh9CB-7fUEqiFRWFwFBfNRD0sY8HMTIVlg";
        assert.notEqual(false, helpers.get_cert_ia(good_bia));
      });

      it('should return false when decoding a bad bia', function(){
        var bad_bia = "dsfdsf.sdfsdf.sdfsdf~sdfdsf.sdfsdf.sdfsdf";
        assert.equal(false, helpers.get_cert_ia(bad_bia));
      });
    });

    describe('Bad BIA decoding Error Handling', function(){

    });
  });

  //describe


  describe('Check for correct query format', function(){
    it('should only accept /search?pgp=<pgp> OR /search?email=<email>', function(){
      var query = {pgp: 'dsfdsf'};
      assert.equal(2, helpers.verify_search_query(query));
    });
  });
});