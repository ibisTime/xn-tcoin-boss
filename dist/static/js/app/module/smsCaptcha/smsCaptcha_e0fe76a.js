'use strict';

define('js/app/module/smsCaptcha/smsCaptcha', ['js/app/controller/base', 'js/app/util/dialog', 'js/app/interface/GeneralCtr'], function (base, dialog, GeneralCtr) {
    function initSms(opt) {
        this.options = $.extend({}, this.defaultOptions, opt);
        var _self = this;
        var verification = $("#" + _self.options.id);
        verification.text(base.getText('获取验证码')).prop("disabled", false);
        clearInterval(_self.timer);
        $("#" + this.options.id).off("click").on("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            mobileValid() && _self.handleSendVerifiy();
        });

        function mobileValid() {
            return $("#" + opt.mobile).valid();
        }
    }
    initSms.prototype.defaultOptions = {
        id: "getVerification",
        mobile: "mobile",
        checkInfo: function checkInfo() {
            return $("#" + this.mobile).valid();
        }
    };
    initSms.prototype.handleSendVerifiy = function () {
        base.showLoadingSpin();
        var _this = this;
        var verification = $("#" + _this.options.id);
        verification.prop("disabled", true);
        GeneralCtr.sendCaptcha(_this.options.bizType, $("#" + _this.options.mobile).val()).then(function () {
            base.hideLoadingSpin();
            var i = 60;
            _this.timer = window.setInterval(function () {
                if (i > 0 && verification.attr("disabled")) {
                    verification.text(base.getText('重新发送') + "(" + i-- + "s)");
                } else {
                    verification.text(base.getText('获取验证码')).prop("disabled", false);
                    clearInterval(_this.timer);
                }
            }, 1000);
        }, function () {
            base.hideLoadingSpin();
            _this.options.errorFn && _this.options.errorFn();
            verification.text("获取验证码").prop("disabled", false);
        });
    };
    return {
        init: function init(options) {
            new initSms(options);
        }
    };
});