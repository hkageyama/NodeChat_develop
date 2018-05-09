const express = require('express');
const router = express.Router();
const accessDb = require('../lib/accessDb');

const USER_TYPE_AGENT = 'agent';      // ユーザータイプ：エージェント
const USER_TYPE_VISITOR = 'visitor';  // ユーザータイプ：ビジター

// ログオン画面起動
router.get('/logon', function(req, res) {
    res.render('logon', {});
});

router.post('/logon', function(req, res) {
    accessDb.logonForm(res);
});

// エージェント画面起動
router.get('/', function(req, res){
    accessDb.openAgentForm(res);
});

// ビジター画面起動
router.post('/chat', function(req, res) {
    let cookie = req.headers.cookie;
    chatId = getCookieValue(cookie, 'chatId');
    if (req.body.userType === USER_TYPE_AGENT) {
        accessDb.openAgentForm(res, chatId);
    } else {
        res.render('visitor', {chatId:chatId});
    }
});

//【テスト用】sdk向けpostリクエスト発行
router.post('/post_to_sdk', function(req, res) {
    console.log('send SDK. msg:' + req.body.key);
});

// Cookieのキーを指定して値を取得
var getCookieValue = function(cookie, key) {
    let val = cookie.match(new RegExp('(^|\\s)'+key+'=([^;]+)'));
    return !!val && unescape(val[2]);
};

module.exports = router;