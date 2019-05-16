var SYSTEM_CODE = "CD-OGC000020"; //
var COMPANY_CODE = "CD-OGC000020";
// var PIC_PREFIX = 'http://image.hp.hichengdai.com/'; // 七牛云
var PIC_PREFIX = 'http://qn.tha.hichengdai.com/'; // 七牛云
var PHOTO_SUFFIX = '?imageMogr2/auto-orient/thumbnail/!150x150r';
var THUMBNAIL_SUFFIX = "";
// web 域名 邀请好友
var DOMAIN_NAME = 'http://www.funmvp.com';
// h5 域名 邀请好友
var INVITATION_HREF = 'http://m.funmvp.com';
//帮助中心
var HELPCONTENT = 'https://funmvp.zendesk.com/hc/zh-cn/';
var ZENDESK_LABEL = 'search';
var FOOT_TETUI = 'Bcoin Exchange';
var FOOT_EMAIL = 'contact@bcoin.im';
var COIN_DEFAULTDATA = {
    "BTC": { "id": "2", "coin": "BTC", "unit": "1e8", "name": "比特币", "type": "1" },
    "USDT": { "id": "3", "coin": "USDT", "unit": "1e8", "name": "泰达币", "type": "0"}
};
var COIN_DEFAULTDATALIST = [
    { "id": "2", "coin": "BTC", "unit": "1e8", "name": "比特币", "type": "1" },
    { "id": "3", "coin": "USDT", "unit": "1e8", "name": "泰达币", "type": "0"}
];

// 当前langType
var NOWLANG = localStorage.getItem('langType') || 'ZH';