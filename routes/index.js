var express = require('express');
var router = express.Router();

router.get('/test', function(request, response){
    response.render('test',{});
});

router.get('/testAgent/', function(request, response){
    response.render('testAgent',{});
});

router.get('/testDb/', function(request, response){
    var testDb = require('../lib/testDb');
    testDb.startFormWithDB(response);
});

module.exports = router;