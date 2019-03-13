"use strict";

define('js/app/interface/StoreCtr', ['js/app/util/ajax'], function (Ajax) {
    return {
        //获取游戏地址
        gramUrl: function gramUrl() {
            return Ajax.get("600101", {}, true);
        },

        // 获取游戏余额
        gramMoney: function gramMoney() {
            return Ajax.get("600104", {}, true);
        },

        // 充币
        rechargeGram: function rechargeGram(config) {
            return Ajax.get("600105", config);
        }
    };
});