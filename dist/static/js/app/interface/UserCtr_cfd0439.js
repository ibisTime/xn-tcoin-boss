'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define('js/app/interface/UserCtr', ['js/app/controller/base', 'js/app/util/ajax'], function (base, Ajax) {
    return {
        /**
         * 登录
         * @param config {loginName, loginPwd}
         */
        login: function login(config) {
            return Ajax.post("805050", _extends({}, config));
        },

        /**
         * 注册
         * @param config {loginName, loginPwd, nickname, smsCaptcha,userReferee}
         */
        register: function register(config) {
            return Ajax.post("805041", _extends({
                kind: "C",
                userRefereeKind: "C"
            }, config));
        },

        //邮箱注册
        emailRegister: function emailRegister(config) {
            return Ajax.post('805043', config);
        },

        //获取邮箱注册码
        emailYzm: function emailYzm(config) {
            return Ajax.get('630093', config);
        },

        // 获取用户详情
        getUser: function getUser(refresh, userId) {
            return Ajax.get("805121", {
                "userId": userId || base.getUserId()
            }, refresh);
        },

        // 修改密码
        changePwd: function changePwd(oldLoginPwd, newLoginPwd) {
            return Ajax.post('805064', {
                oldLoginPwd: oldLoginPwd,
                newLoginPwd: newLoginPwd,
                userId: base.getUserId()
            });
        },

        /**
         * 忘記密码/重置密码
         * @param config {mobile, newLoginPwd, smsCaptcha}
         */
        resetPwd: function resetPwd(config) {
            return Ajax.post('805063', _extends({}, config));
        },

        //修改/綁定邮箱
        setEmail: function setEmail(email, captcha) {
            return Ajax.post('805086', {
                email: email,
                captcha: captcha,
                userId: base.getUserId()
            });
        },

        //绑定手机号
        setPhone: function setPhone(mobile, smsCaptcha) {
            return Ajax.post('805060', {
                mobile: mobile,
                smsCaptcha: smsCaptcha,
                isSendSms: '0',
                userId: base.getUserId()
            });
        },

        //修改手机号
        detPhone: function detPhone(mobile, smsCaptcha) {
            return Ajax.post('805061', {
                newMobile: mobile,
                smsCaptcha: smsCaptcha,
                isSendSms: '0',
                userId: base.getUserId()
            });
        },


        // 设置交易密码
        setTradePwd: function setTradePwd(tradePwd, smsCaptcha) {
            return Ajax.post('805066', {
                tradePwd: tradePwd,
                smsCaptcha: smsCaptcha,
                userId: base.getUserId()
            });
        },

        // 重置交易密码
        changeTradePwd: function changeTradePwd(newTradePwd, smsCaptcha) {
            return Ajax.post("805067", {
                newTradePwd: newTradePwd,
                smsCaptcha: smsCaptcha,
                userId: base.getUserId()
            });
        },

        //获取谷歌密码
        getGooglePwd: function getGooglePwd() {
            return Ajax.get("630094");
        },

        /**
         * 开启谷歌验证
         * @param config {googleCaptcha, secret, smsCaptcha}
         */
        openGoogle: function openGoogle(config) {
            return Ajax.post("805088", _extends({
                userId: base.getUserId()
            }, config));
        },

        /**
         * 关闭谷歌验证
         */
        closeGoogle: function closeGoogle(googleCaptcha, smsCaptcha) {
            return Ajax.post("805089", {
                googleCaptcha: googleCaptcha,
                smsCaptcha: smsCaptcha,
                userId: base.getUserId()
            });
        },

        // 修改头像
        changePhoto: function changePhoto(photo) {
            return Ajax.post("805080", {
                photo: photo,
                userId: base.getUserId()
            });
        },

        /**
         * 分页查询关系
         * @param config {limit, start, userId, type}
         * type=1 信任，type=0，屏蔽
         */
        getPageTrust: function getPageTrust(config, to) {
            if (to != '1') {
                config.userId = base.getUserId();
            }
            return Ajax.get("805155", _extends({}, config));
        },

        /**
         * 查询信任关系
         * @param visitor  当前登录用户
         * @param master
         * isTrust,isAddBlackList
         */
        getUserRelation: function getUserRelation(currency, master) {
            return Ajax.get("625256", {
                visitor: base.getUserId(),
                currency: currency,
                master: master
            });
        },

        /**
         * 修改信任关系(建立)
         * @param config {limit, start, userId, type}
         * type=1 信任，type=0，屏蔽
         */
        addUserRelation: function addUserRelation(config, refresh) {
            return Ajax.get("805150", _extends({
                userId: base.getUserId()
            }, config), refresh);
        },

        /**
         * 修改信任关系(解除）
         * @param config {limit, start, userId, type}
         * type=1 信任，type=0，屏蔽
         */
        removeUserRelation: function removeUserRelation(config, refresh) {
            return Ajax.get("805151", _extends({
                userId: base.getUserId()
            }, config), refresh);
        },

        /**
         * 獲取我推荐的人数和收益统计
         * @param config {limit, start, userId, type}
         * type=1 信任，type=0，屏蔽
         */
        getInvitation: function getInvitation(refresh) {
            return Ajax.get("805913", {
                userId: base.getUserId()
            }, refresh);
        },

        /**
         * 查询我的推荐历史
         * @param config {limit, start}
         */
        getInvitationHistory: function getInvitationHistory(config, refresh) {
            return Ajax.get("802399", _extends({}, config), refresh);
        },

        //更新用户登录时间
        updateLoginTime: function updateLoginTime() {
            return Ajax.get("805092", {
                userId: base.getUserId()
            }, true);
        },

        //列表查询用户收益
        getUserInviteProfit: function getUserInviteProfit(userId) {
            return Ajax.get("805124", {
                userId: userId || base.getUserId()
            }, true);
        },

        // 个人总资产转换
        userAllMoneyX: function userAllMoneyX(currency) {
            return Ajax.post('650103', {
                userId: base.getUserId(),
                currency: currency
            });
        }
    };
});