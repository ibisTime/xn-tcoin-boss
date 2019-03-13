'use strict';

define('js/app/module/showContent/index', ['js/lib/jquery', 'js/app/module/loading/index', 'js/app/util/ajax'], function ($, loading, Ajax) {
    var tmpl = "<div id=\"showContentWrap\" class=\"right-left-cont\">\n    <div class=\"right-left-cont-title\">\n        <div class=\"right-left-cont-back\"></div>\n        <div class=\"right-left-cont-title-name\"></div>\n    </div>\n    <div class=\"showContent-cont\" id=\"showContent-cont\"></div>\n</div>";
    var defaultOpt = {};
    var first = true;

    function getContent() {
        loading.createLoading();
        return Ajax.post(defaultOpt.bizType, defaultOpt.param).then(function (res) {
            loading.hideLoading();
            $("#showContent-cont").html(res.data[defaultOpt.key] || res.data || "");
            return res;
        }, function (msg) {
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error(msg || "内容获取失败");
        });
    }
    function _showCont() {
        var wrap = $("#showContentWrap");
        wrap.css("top", $(window).scrollTop() + "px");
        wrap.show().animate({
            left: 0
        }, 200);
    }
    var ShowContent = {
        addCont: function addCont(option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if (!this.hasCont()) {
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var that = this;
            var wrap = $("#showContentWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            wrap.find(".right-left-cont-title").on("touchmove", function (e) {
                e.preventDefault();
            });
            wrap.find(".right-left-cont-back").on("click", function () {
                that.hideCont();
            });
            return this;
        },
        hasCont: function hasCont() {
            if (!$("#showContentWrap").length) return false;
            return true;
        },
        showCont: function showCont() {
            if (this.hasCont()) {
                if (first) {
                    getContent().then(function (res) {
                        if (res.success) _showCont();
                    });
                } else {
                    _showCont();
                }
                first = false;
            }
            return this;
        },
        hideCont: function hideCont(func) {
            if (this.hasCont()) {
                var wrap = $("#showContentWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                });
            }
            return this;
        }
    };
    return ShowContent;
});