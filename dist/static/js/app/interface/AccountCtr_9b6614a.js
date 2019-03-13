'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define('js/app/interface/AccountCtr', ['js/app/controller/base', 'js/app/util/ajax'], function (base, Ajax) {
    return {
        // 获取账户
        getAccount: function getAccount() {
            return Ajax.get("802301", { // 802503   802301
                userId: base.getUserId()
            }, true);
        },

        /**
         * 分页查询流水
         * @param config: {start, limit, accountNumber, bizType,kind}
         */
        getPageFlow: function getPageFlow(config, refresh) {
            return Ajax.get("802322", _extends({}, config), refresh);
        },

        /**
         * 充值
         * @param config: {amount, openId}
         */
        recharge: function recharge(config) {
            return Ajax.post("802710", _extends({
                applyUser: base.getUserId(),
                channelType: 35
            }, config));
        },

        /**
         * 取现
         * @param config: {accountNumber,amount,applyUser,applyNote,tradePwd,googleCaptcha}
         */
        withDraw: function withDraw(config) {
            return Ajax.post("802350", _extends({
                applyUser: base.getUserId()
            }, config));
        },

        /**
         * 分页查询地址
         * @param config: {address,limit,start,statusList,type,userId,currency}
         */
        getPageCoinAddress: function getPageCoinAddress(config, refresh) {
            return Ajax.post("802175", _extends({
                userId: base.getUserId(),
                type: 'Y',
                statusList: ['0', '1']
            }, config), refresh);
        },

        /**
         * 新增地址
         * @param config: {address,googleCaptcha,isCerti,label,smsCaptcha,tradePwd,currency}
         */
        addCoinAddress: function addCoinAddress(config) {
            return Ajax.post("802170", _extends({
                userId: base.getUserId()
            }, config), true);
        },

        //弃用地址
        deleteCoinAddress: function deleteCoinAddress(code) {
            return Ajax.post("802171", {
                code: code
            }, true);
        },

        // 获取银行卡
        getBankData: function getBankData() {
            return Ajax.post('802026', {
                status: '1'
            });
        },

        // 获取银行渠道
        getGmBankData: function getGmBankData() {
            return Ajax.post('802116', {
                status: '1'
            });
        },

        // 购买FMVP币
        buyX: function buyX(config) {
            return Ajax.post('625270', config);
        },

        // 出售FMVP币
        sellX: function sellX(config) {
            return Ajax.post('625271', config);
        }
    };
});