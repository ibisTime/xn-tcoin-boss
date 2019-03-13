'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define('js/app/interface/GeneralCtr', ['js/app/controller/base', 'js/app/util/ajax'], function (base, Ajax) {
    return {
        // 七牛获取上传图片凭证
        getQiniuToken: function getQiniuToken(fromCurrency, toCurrency) {
            return Ajax.get("630091");
        },

        // 发送短信
        sendCaptcha: function sendCaptcha(bizType, mobile) {
            var sendCode = '630090';
            var param = {
                bizType: bizType
            };
            if (mobile.split('@')[1]) {
                param.email = mobile;
                sendCode = "630093";
            } else {
                param.mobile = mobile;
            }
            return Ajax.post(sendCode, param);
        },

        // 获取转化汇率
        getTransRate: function getTransRate(fromCurrency, toCurrency) {
            return Ajax.get("002051", {
                fromCurrency: fromCurrency,
                toCurrency: toCurrency
            });
        },

        /**
         * 分页查询系统公告
         * @param config {start, limit}
         */
        getPageSysNotice: function getPageSysNotice(config, refresh) {
            return Ajax.get("805308", _extends({
                "pushType": 41,
                "toKind": 'C',
                "channelType": 4,
                "status": 1,
                "fromSystemCode": SYSTEM_CODE
            }, config), refresh);
        },

        // 查询数据字典列表
        getDictList: function getDictList(config, code) {
            return Ajax.get(code || "630036", config);
        },

        // 根据key查询系统参数
        getSysConfig: function getSysConfig(ckey, refresh) {
            return Ajax.get("630047", { ckey: ckey }, refresh);
        },

        // 根据type查询系统参数
        getSysConfigType: function getSysConfigType(type, refresh) {
            return Ajax.get("630048", { type: type }, refresh);
        },

        // 分页查询系统参数
        getPageSysConfig: function getPageSysConfig(config, refresh) {
            return Ajax.get("630045", _extends({
                start: 1,
                limit: 100,
                orderColumn: 'id',
                orderDir: 'asc'
            }, config), refresh);
        },

        // 查询banner列表(前端导航)
        getBanner: function getBanner(config, btype) {
            return Ajax.get("630506", _extends({}, config), true);
        },

        //获取腾讯云
        getTencunLogin: function getTencunLogin() {
            return Ajax.get("805087", {
                userId: base.getUserId()
            });
        }
    };
});