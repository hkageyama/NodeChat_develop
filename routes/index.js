var express = require('express');
var router = express.Router();

// visitorチャット画面起動
router.get('/visitor', function(req, res) {
    res.render('visitor', {});
});

// visitorTestチャット画面起動
router.get('/visitorNew', function(req, res) {
    res.render('visitor_new', {});
});

//【テスト用】sdk向けpostリクエスト発行
router.post('/post_to_sdk', function(req, res) {
    console.log('send to SDK： ' + req.body.key);
});

// entry画面表示
router.get('/', function(req, res){
    let accessDb = require('../lib/accessDb');
    accessDb.startFormWithDB(res);
});

module.exports = router;