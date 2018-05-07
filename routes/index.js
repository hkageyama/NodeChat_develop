const express = require('express');
const router = express.Router();
const accessDb = require('../lib/accessDb');

// ログオン画面起動
router.get('/logon', function(req, res) {
    res.render('logon', {});
});

router.post('/logon', function(req, res) {
    accessDb.logonForm(res);
});

// エージェント画面起動
router.get('/', function(req, res){
    accessDb.startAgentForm(res);
});

// ビジター画面起動
router.get('/visitor', function(req, res) {
    let cookie = req.headers.cookie;
    console.log(cookie);
    chatId = getCookieValue(cookie, 'chatId');
    console.log('test:' + chatId);
    res.render('visitor', {chatId:chatId});
});

//【テスト用】sdk向けpostリクエスト発行
router.post('/post_to_sdk', function(req, res) {
    console.log('send SDK. msg:' + req.body.key);
});

var getCookieValue = function(cookie, key) {
    var val = cookie.match(new RegExp('(^|\\s)'+key+'=([^;]+)'));
    return !!val && unescape(val[2]);
};

module.exports = router;