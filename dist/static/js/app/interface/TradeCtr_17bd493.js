'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define('js/app/interface/TradeCtr', ['js/app/controller/base', 'js/app/util/ajax'], function (base, Ajax) {
    return {
        /**
         * 分页查询广告
         * @param config: {start, limit, maxPrice, minPrice, payType, tradeType(0买、1卖),coin}
         */
        getPageAdvertise: function getPageAdvertise(config, refresh) {
            return Ajax.get("625227", config, refresh); // new 625227 old 625228
        },

        /**
         * 分页查询广告 带userId,status
         * @param config: {start, limit, maxPrice, minPrice,payType,tradeType(0买、1卖),userId,status,coin}
         */
        getPageAdvertiseUser: function getPageAdvertiseUser(config, refresh) {
            config.coin = '';
            return Ajax.post("625225", config, refresh);
        },
        getUserPageAdvertiseUser: function getUserPageAdvertiseUser(config, refresh) {
            return Ajax.get("625228", config, refresh);
        },

        //用户昵称查询广告
        getListAdvertiseNickname: function getListAdvertiseNickname(nickName, refresh) {
            return Ajax.get("625228", { nickName: nickName }, refresh);
        },

        /**
         * 发布/编辑广告
         * @param adsCode
         */
        submitAdvertise: function submitAdvertise(config, refresh) {
            if (config.publishType == '3' || config.publishType == '2') {
                return Ajax.get("625221", _extends({
                    operator: base.getUserId(),
                    userId: base.getUserId()
                }, config), true);
            }
            return Ajax.get("625220", _extends({
                operator: base.getUserId(),
                userId: base.getUserId()
            }, config), true);
        },

        //下架广告
        downAdvertise: function downAdvertise(adsCode) {
            return Ajax.get("625224", {
                userId: base.getUserId(),
                adsCode: adsCode
            }, true);
        },

        // 获取广告详情
        getAdvertiseDetail: function getAdvertiseDetail(adsCode) {
            return Ajax.get("625226", {
                adsCode: adsCode
            });
        },

        // 获取广告价格
        getAdvertisePrice: function getAdvertisePrice(coin, ctype) {
            var referCurrency = ctype || 'CNY';
            return Ajax.get("650102", {
                symbol: coin,
                referCurrency: referCurrency
            });
        },

        // 数字货币折合
        getNumberMoney: function getNumberMoney(symbol, referCurrency) {
            return Ajax.get('650102', {
                symbol: symbol,
                referCurrency: referCurrency
            });
        },

        /**
         * 购买ETH
         * @param config{adsCode,count,tradeAmount,tradePrice}
         */
        buyETH: function buyETH(config) {
            return Ajax.get("625240", _extends({
                buyUser: base.getUserId()
            }, config));
        },

        /**
         * 出售ETH
         * @param config{adsCode,count,tradeAmount,tradePrice}
         */
        sellETH: function sellETH(config) {
            return Ajax.get("625241", _extends({
                sellUser: base.getUserId()
            }, config));
        },

        // 购买开始聊天，提交交易订单
        chatOrderBuy: function chatOrderBuy(adsCode) {
            return Ajax.get("625247", {
                buyUser: base.getUserId(),
                adsCode: adsCode
            });
        },

        //出售开始聊天，提交交易订单
        chatOrderSell: function chatOrderSell(adsCode) {
            return Ajax.get("625248", {
                sellUser: base.getUserId(),
                adsCode: adsCode
            });
        },

        /**
         * 分页查询我的订单
         * @param config: {start, limit, statusList,tradeCoin}
         */
        getPageOrder: function getPageOrder(config, refresh) {
            return Ajax.get("625250", _extends({
                belongUser: base.getUserId()
            }, config), refresh);
        },

        //获取订单详情
        getOrderDetail: function getOrderDetail(code) {
            return Ajax.get("625251", {
                code: code
            }, true);
        },

        //訂單-取消交易
        cancelOrder: function cancelOrder(code) {
            return Ajax.get("625242", {
                updater: base.getUserId(),
                code: code
            });
        },

        //訂單-標記打款
        payOrder: function payOrder(code) {
            return Ajax.get("625243", {
                updater: base.getUserId(),
                code: code
            });
        },

        //訂單-解冻以太币
        releaseOrder: function releaseOrder(code) {
            return Ajax.get("625244", {
                updater: base.getUserId(),
                code: code
            });
        },

        //訂單-评价
        commentOrder: function commentOrder(code, comment, content) {
            return Ajax.get("625245", {
                updater: base.getUserId(),
                code: code,
                starLevel: comment,
                content: content
            });
        },

        //个人-评价
        userEvaluate: function userEvaluate(config) {
            return Ajax.get("628279", config);
        },

        /**
         * 申請仲裁
         * @param config{code,reason}
         */
        arbitrationlOrder: function arbitrationlOrder(config) {
            return Ajax.get("625246", _extends({
                applyUser: base.getUserId()
            }, config));
        },

        // 标记付款
        bjPlayfo: function bjPlayfo(config) {
            return Ajax.get('625273', config);
        },

        // 取消订单
        qxOrder: function qxOrder(config) {
            return Ajax.get('625272', config);
        },

        // 获取交易对
        getTradePair: function getTradePair() {
            return Ajax.post("650100", {
                start: '1',
                limit: '10'
            }, true);
        },

        //阅读消息
        readNews: function readNews() {
            return Ajax.post("650100", {
                start: '1',
                limit: '10'
            }, true);
        }
    };
});