'use strict';

define('js/app/module/identity/index', ['js/lib/jquery', 'js/app/module/validate/validate', 'js/app/module/loading/index', 'js/app/interface/UserCtr'], function ($, Validate, loading, UserCtr) {
    var tmpl = "<div id=\"authentication-identity\" class=\"right-left-cont\">\n    <div class=\"right-left-cont-title\">\n        <div class=\"right-left-cont-back\" id=\"authentication-identity-back\"></div>\n        <div class=\"right-left-cont-title-name\">实名认证</div>\n    </div>\n    <form class=\"am-list bg_fff\" id=\"authentication-identity-form\">\n        <div class=\"am-list-body\">\n            <div class=\"am-list-item am-input-item\">\n                <div class=\"am-input-label am-input-label-5\">真实姓名</div>\n                <div class=\"am-input-control\">\n                    <input type=\"text\" name=\"identityRealName\" id=\"identityRealName\" placeholder=\"请输入姓名\">\n                </div>\n            </div>\n            <div class=\"am-list-item am-input-item\">\n                <div class=\"am-input-label am-input-label-5\">身份证号</div>\n                <div class=\"am-input-control\">\n                    <input type=\"text\" name=\"identityIdNo\" id=\"identityIdNo\" placeholder=\"请输入身份证号\">\n                </div>\n            </div>\n        </div>\n    </form>\n    <div class=\"primary-wrap\">\n        <a id=\"authentication-identity-btn\" class=\"am-button am-button-primary\">\n            <span>确定</span>\n        </a>\n    </div>\n</div>\n";
    var defaultOpt = {};
    var first = true;

    function _identity() {
        loading.createLoading("认证中...");
        UserCtr.identity({
            realName: $("#identityRealName").val(),
            idNo: $("#identityIdNo").val()
        }).then(function () {
            loading.hideLoading();
            identity.hideCont(defaultOpt.success);
            $("#authentication-identity-btn").parent().hide();
            $("#identityRealName, #identityIdNo").attr("disabled", "disabled");
        }, function (msg) {
            defaultOpt.error && defaultOpt.error(msg || "实名认证失败");
        });
    }
    var identity = {
        addCont: function addCont(option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if (!this.hasCont()) {
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#authentication-identity");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if (first) {
                $("#authentication-identity-back").on("click", function () {
                    identity.hideCont();
                });
                wrap.find(".right-left-cont-title").on("touchmove", function (e) {
                    e.preventDefault();
                });
                if (!defaultOpt.disabled) {
                    $("#authentication-identity-btn").on("click", function () {
                        if ($("#authentication-identity-form").valid()) {
                            _identity();
                        }
                    });
                    $("#authentication-identity-form").validate({
                        'rules': {
                            identityRealName: {
                                required: true,
                                maxlength: 32,
                                isNotFace: true
                            },
                            identityIdNo: {
                                required: true,
                                isIdCardNo: true
                            }
                        }
                    });
                } else {
                    $("#authentication-identity-btn").parent().hide();
                    $("#identityRealName").val(defaultOpt.realName || "").attr("disabled", "disabled");
                    $("#identityIdNo").val(defaultOpt.idNo || "").attr("disabled", "disabled");
                }
            }

            first = false;
            return this;
        },
        hasCont: function hasCont() {
            if (!$("#authentication-identity").length) return false;
            return true;
        },
        showCont: function showCont() {
            if (this.hasCont()) {
                var wrap = $("#authentication-identity");
                wrap.css("top", $(window).scrollTop() + "px");
                wrap.show().animate({
                    left: 0
                }, 200, function () {
                    defaultOpt.showFun && defaultOpt.showFun();
                });
            }
            return this;
        },
        hideCont: function hideCont(func) {
            if (this.hasCont()) {
                var wrap = $("#authentication-identity");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func();
                    $("#identityRealName").val("");
                    $("#identityIdNo").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    };
    return identity;
});