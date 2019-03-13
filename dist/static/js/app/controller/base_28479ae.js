'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

define('js/app/controller/base', ['js/app/util/cookie', 'js/app/util/dialog', 'js/app/module/loading/index', 'js/lib/bigDecimal/BigDecimal-all-last.min', 'js/app/interface/BaseCtr'], function (CookieUtil, dialog, loading, BigDecimal, BaseCtr) {

    setTimeout(function () {
        $("body").on("click", ".goHref", function () {
            var thishref = $(this).attr("data-href");
            var tzType = $(this).attr('href-type') || null;
            if (thishref != "" && thishref) {
                if (Base.isLogin()) {
                    Base.updateLoginTime();
                }
                Base.gohref(thishref, tzType);
            }
        });
    }, 1);

    //给form表单赋值
    $.fn.setForm = function (jsonValue) {
        var obj = this;
        $.each(jsonValue, function (name, ival) {
            if (obj.find("#" + name).length) {
                var $oinput = obj.find("#" + name);
                if ($oinput.attr("type") == "radio" || $oinput.attr("type") == "checkbox") {
                    $oinput.each(function () {
                        if (Object.prototype.toString.apply(ival) == '[object Array]') {
                            //是复选框，并且是数组
                            for (var i = 0; i < ival.length; i++) {
                                if ($(this).val() == ival[i]) $(this).attr("checked", "checked");
                            }
                        } else {
                            if ($(this).val() == ival) {
                                $(this).attr("checked", "checked");
                            };
                        }
                    });
                } else if ($oinput.attr("type") == "textarea") {
                    //多行文本框
                    obj.find("[name=" + name + "]").html(ival);
                } else {
                    if ($oinput.attr("data-format")) {
                        //需要格式化的日期 如:data-format="yyyy-MM-dd"
                        obj.find("[name=" + name + "]").val(Base.formatDate(ival, $oinput.attr("data-format")));
                    } else if ($oinput.attr("data-amount")) {
                        //需要格式化的日期 如:data-format="yyyy-MM-dd"
                        obj.find("[name=" + name + "]").val(Base.formatMoney(ival));
                    } else {
                        obj.find("[name=" + name + "]").val(ival);
                    }
                }
            }
        });
    };

    String.prototype.temp = function (obj) {
        return this.replace(/\$\w+\$/gi, function (matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return returns + "" == "undefined" ? "" : returns;
        });
    };

    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function () {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };

    var Base = {
        //日期格式化 format|| 'yyyy-MM-dd';
        formatDate: function formatDate(date, format) {
            var format = format || 'yyyy-MM-dd';
            return date ? new Date(date).format(format) : "--";
        },
        //日期格式化 yyyy-MM-dd hh:mm:ss
        formateDatetime: function formateDatetime(date) {
            return date ? new Date(date).format("yyyy-MM-dd hh:mm:ss") : "--";
        },
        //日期格式化 MM-dd hh:mm:ss
        datetime: function datetime(date) {
            return date ? new Date(date).format("MM-dd hh:mm") : "--";
        },
        //日期格式化 hh:mm:ss
        todayDatetime: function todayDatetime(date) {
            return date ? new Date(date).format("hh:mm:ss") : "--";
        },
        //获取链接入参
        getUrlParam: function getUrlParam(name, locat) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var locat = locat ? "?" + locat.split("?")[1] : '';
            var r = (locat ? locat : window.location.search).substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function findObj(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        // 金额格式化 默认保留t || 8位  小数 coin 默认eth
        formatMoney: function formatMoney(s, t, coin) {
            var noZero = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            var unit = coin ? Base.getCoinUnit(coin) : "1000";

            if (!$.isNumeric(s)) {
                return "-";
            } else {
                s = Number(s).toString();
            }
            if (t == '' || t == null || t == undefined || (typeof t === 'undefined' ? 'undefined' : _typeof(t)) == 'object') {
                if (coin === 'CNY') {
                    t = 2;
                } else {
                    t = 8;
                }
            }
            //保留8位小数
            s = new BigDecimal.BigDecimal(s);
            s = s.divide(new BigDecimal.BigDecimal(unit), t, BigDecimal.MathContext.ROUND_DOWN).toString();
            if (noZero) {
                s = s.replace(/(-?\d+)\.0+$/, '$1');
                if (!/^-?\d+$/.test(s)) {
                    s = s.replace(/(.+[^0]+)0+$/, '$1');
                }
            }
            return s;
        },
        //金额减法 s1-s2
        formatMoneySubtract: function formatMoneySubtract(s1, s2, coin) {
            if (!$.isNumeric(s1) || !$.isNumeric(s2)) return "-";
            var s1 = new BigDecimal.BigDecimal(s1);
            var s2 = new BigDecimal.BigDecimal(s2);
            return Base.formatMoney(s1.subtract(s2).toString(), '', coin);
        },
        //金额乘法 s1-s2
        formatMoneyMultiply: function formatMoneyMultiply(s1, s2, coin) {
            if (!$.isNumeric(s1) || !$.isNumeric(s2)) return "-";
            var s1 = new BigDecimal.BigDecimal(s1);
            var s2 = new BigDecimal.BigDecimal(s2);
            return Base.formatMoney(s1.multiply(s2).toString(), '', coin);
        },
        //金额金额放大 默认 放大 r || 8位
        formatMoneyParse: function formatMoneyParse(m, r, coin) {
            var unit = coin ? Base.getCoinUnit(coin) : "1e18";
            var r = r || new BigDecimal.BigDecimal(unit);
            if (m == '') {
                return '-';
            } else {
                m = Number(m).toString();
            }
            m = new BigDecimal.BigDecimal(m);
            m = m.multiply(r).toString();
            return m;
        },
        //密码强度等级判断
        calculateSecurityLevel: function calculateSecurityLevel(password) {
            var strength_L = 0;
            var strength_M = 0;
            var strength_H = 0;

            for (var i = 0; i < password.length; i++) {
                var code = password.charCodeAt(i);
                // 数字
                if (code >= 48 && code <= 57) {
                    strength_L++;
                    // 小写字母 大写字母
                } else if (code >= 65 && code <= 90 || code >= 97 && code <= 122) {
                    strength_M++;
                    // 特殊符号
                } else if (code >= 32 && code <= 47 || code >= 58 && code <= 64 || code >= 94 && code <= 96 || code >= 123 && code <= 126) {
                    strength_H++;
                }
            }
            // 弱
            if (strength_L == 0 && strength_M == 0 || strength_L == 0 && strength_H == 0 || strength_M == 0 && strength_H == 0) {
                return "1";
            }
            // 强
            if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
                return "3";
            }
            // 中
            return "2";
        },
        //计算日期相隔时间
        calculateDays: function calculateDays(start, end) {
            if (!start || !end) return 0;
            start = new Date(start);
            end = new Date(end);
            return (end - start) / (60 * 1000);
        },
        //图片格式化
        getPic: function getPic(pic, suffix) {
            if (!pic) {
                return "";
            }
            pic = pic.split(/\|\|/)[0];
            if (!/^http|^data:image/i.test(pic)) {
                suffix = suffix || "?imageMogr2/auto-orient/interlace/1";
                pic = PIC_PREFIX + pic + suffix;
            }
            return pic;
        },
        //图片格式化-pic为数组
        getPicArr: function getPicArr(pic, suffix) {
            if (!pic) {
                return [];
            }
            return pic.split(/\|\|/).map(function (p) {
                return Base.getPic(p, suffix);
            });
        },
        //图片格式化-头像
        getAvatar: function getAvatar(pic, suffix) {
            var defaultAvatar = "data:image/png;base64,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";
            var suffix = suffix || PHOTO_SUFFIX;
            if (!pic) {
                pic = defaultAvatar;
            }
            return Base.getPic(pic, suffix);
        },
        //获取网站地址 不包含?后面的入参
        getDomain: function getDomain() {
            return location.origin;
        },
        isNotFace: function isNotFace(value) {
            var pattern = /^[\s0-9a-zA-Z\u4e00-\u9fa5\u00d7\u300a\u2014\u2018\u2019\u201c\u201d\u2026\u3001\u3002\u300b\u300e\u300f\u3010\u3011\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff0d\uff03\uffe5\x21-\x7e]*$/;
            return pattern.test(value);
        },
        // 提醒
        showMsg: function showMsg(msg, time) {
            var d = dialog({
                content: msg,
                quickClose: true
            });
            d.show();
            setTimeout(function () {
                d.close().remove();
            }, time || 1500);
        },
        makeReturnUrl: function makeReturnUrl(param) {
            var url = location.pathname + location.search;
            if (param) {
                var str = "";
                for (var n in param) {
                    str += "&" + n + "=" + param[n];
                }
                if (/\?/i.test(url)) {
                    url = url + str;
                } else {
                    url = url + "?" + str.substr(1, str.length);
                }
            }
            return encodeURIComponent(url);
        },
        goBack: function goBack() {
            window.history.back();
        },
        goReturn: function goReturn() {
            var returnUrl = sessionStorage.getItem("l-return");
            sessionStorage.removeItem("l-return");
            Base.gohref(returnUrl || "../index.html");
        },
        isLogin: function isLogin() {
            return !!sessionStorage.getItem("userId");
        },
        goLogin: function goLogin(flag) {
            Base.clearSessionUser();
            if (flag) {
                sessionStorage.removeItem("l-return");
            } else {
                sessionStorage.setItem("l-return", location.pathname + location.search);
            }
            Base.gohref("../user/login.html");
        },
        getUserId: function getUserId() {
            return sessionStorage.getItem("userId");
        },
        getUserMobile: function getUserMobile() {
            return sessionStorage.getItem("mobile");
        },
        getUserEmail: function getUserEmail() {
            return sessionStorage.getItem("email");
        },
        getToken: function getToken() {
            return sessionStorage.getItem("token");
        },
        //谷歌验证
        getGoogleAuthFlag: function getGoogleAuthFlag() {
            return sessionStorage.getItem("googleAuthFlag");
        },
        setSessionUser: function setSessionUser(data) {
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("token", data.token);
        },
        clearSessionUser: function clearSessionUser() {
            sessionStorage.removeItem("userId"); //userId
            sessionStorage.removeItem("token"); //token
            sessionStorage.removeItem("googleAuthFlag"); //token
            sessionStorage.removeItem("mobile"); //token
            sessionStorage.removeItem("email"); //token
            sessionStorage.removeItem("nickname"); //token
        },
        //登出
        logout: function logout() {
            Base.clearSessionUser();
            Base.gohref("../user/login.html");
        },
        /**
         * 弹窗
         * Base.confirm.then()
         * */
        confirm: function confirm(msg, cancelValue, okValue) {
            return new Promise(function (resolve, reject) {
                var d = dialog({
                    content: msg,
                    ok: function ok() {
                        var that = this;
                        setTimeout(function () {
                            that.close().remove();
                        }, 1000);
                        resolve();
                        return true;
                    },
                    cancel: function cancel() {
                        reject();
                        return true;
                    },
                    cancelValue: cancelValue,
                    okValue: okValue
                });
                d.showModal();
            });
        },
        showLoading: function showLoading(msg) {
            loading.createLoading(msg);
        },
        hideLoading: function hideLoading() {
            loading.hideLoading();
        },
        showLoadingSpin: function showLoadingSpin() {
            $("#loadingSpin").removeClass("hidden");
            $('html').css('overflow', 'hidden');
        },
        hideLoadingSpin: function hideLoadingSpin() {
            $("#loadingSpin").addClass("hidden");
            $('html').css('overflow', 'auto');
        },
        // 获取数据字典
        getDictListValue: function getDictListValue(dkey, arrayData) {
            //类型
            for (var i = 0; i < arrayData.length; i++) {
                if (dkey == arrayData[i].dkey) {
                    return arrayData[i].dvalue;
                }
            }
        },
        //超过num个字符多余"..."显示
        format2line: function format2line(num, cont) {
            return cont ? cont.length > num ? cont.substring(0, num) + "..." : cont : "";
        },
        emptyFun: function emptyFun() {},
        //获取地址json
        getAddress: function getAddress() {
            var addr = localStorage.getItem("addr");
            if (addr) {
                var defer = jQuery.Deferred();
                addr = $.parseJSON(addr);
                if (!addr.citylist) {
                    addr = $.parseJSON(addr);
                }
                defer.resolve(addr);
                return defer.promise();
            } else {
                return $.get("/static/js/lib/city.min.json").then(function (res) {
                    if (res.citylist) {
                        localStorage.setItem("addr", JSON.stringify(res));
                        return res;
                    }
                    localStorage.setItem("addr", JSON.stringify(res));
                    return $.parseJSON(res);
                });
            }
        },
        /*
         * url 目标url
         * arg 需要替换的参数名称
         * arg_val 替换后的参数的值
         * return url 参数替换后的url
         */
        changeURLArg: function changeURLArg(url, arg, arg_val) {
            var pattern = arg + '=([^&]*)';
            var replaceText = arg + '=' + arg_val;
            if (url.match(pattern)) {
                var tmp = '/(' + arg + '=)([^&]*)/gi';
                tmp = url.replace(eval(tmp), replaceText);
                return tmp;
            } else {
                if (url.match('[\?]')) {
                    return url + '&' + replaceText;
                } else {
                    return url + '?' + replaceText;
                }
            }
            return url + '\n' + arg + '\n' + arg_val;
        },
        //跳转 location.href
        gohref: function gohref(href, toType) {
            var timestamp = new Date().getTime();
            //判断链接后是否有带参数
            if (href.split("?")[1]) {
                //判断是否有带v的参数，有则替换v的参数
                if (Base.getUrlParam("v", href) != "" && Base.getUrlParam("v", href)) {
                    if (toType) {
                        window.open(Base.changeURLArg(href, "v", timestamp), '_blank');
                    } else {
                        location.href = Base.changeURLArg(href, "v", timestamp);
                    }
                } else {
                    if (toType) {
                        window.open(href + "&v=" + timestamp, '_blank');
                    } else {
                        location.href = href + "&v=" + timestamp;
                    }
                }
            } else {
                if (toType) {
                    window.open(href + "&v=" + timestamp, '_blank');
                } else {
                    location.href = href + "?v=" + timestamp;
                }
            }
        },
        //跳转 location.replace
        gohrefReplace: function gohrefReplace(href) {
            var timestamp = new Date().getTime();
            //判断链接后是否有带参数
            if (href.split("?")[1]) {
                //判断是否有带v的参数，有则替换v的参数
                if (Base.getUrlParam("v", href) != "" && Base.getUrlParam("v", href)) {
                    location.replace(Base.changeURLArg(href, "v", timestamp));
                } else {
                    location.replace(href + "&v=" + timestamp);
                }
            } else {
                location.replace(href + "?v=" + timestamp);
            }
        },
        //隐藏手机号中间4位
        hideMobile: function hideMobile(mobile) {
            var mobile = mobile ? mobile.substring(0, 3) + "****" + mobile.substring(7, 11) : '';
            return mobile;
        },
        //计算百分比
        getPercentum: function getPercentum(n1, n2) {
            if (n1 == '0' && n2 == '0') {
                return '0';
            }
            var n = n1 / n2 * 100;
            return parseInt(n) + "%";
        },
        //更新登录时间
        updateLoginTime: function updateLoginTime() {
            BaseCtr.updateLoginTime();
        },
        //获取币种列表
        getCoinList: function getCoinList() {
            if (sessionStorage.getItem('coinList')) {
                return JSON.parse(sessionStorage.getItem('coinList'));
            } else {
                return COIN_DEFAULTDATA;
            }
        },
        getCoinArray: function getCoinArray() {
            return COIN_DEFAULTDATALIST;
        },
        //获取币种名字
        getCoinName: function getCoinName(coin) {
            var n = Base.getCoinList()[coin].name;
            return n;
        },
        //获取币种unit
        getCoinUnit: function getCoinUnit(coin) {
            var n = Base.getCoinList()[coin].unit;
            return n;
        },
        //获取币种type  1是token币
        getCoinType: function getCoinType(coin) {
            if (Base.getCoinList()[coin]) {
                var n = Base.getCoinList()[coin].type;
                return n;
            }
            return '';
        },
        //获取币种coin
        getCoinCoin: function getCoinCoin(coin) {
            var n = Base.getCoinList()[coin].coin;
            return n;
        },
        //获取币种withdrawFee
        getCoinWithdrawFee: function getCoinWithdrawFee(coin) {
            var n = Base.getCoinList()[coin].withdrawFeeString;
            return n;
        },
        // 根据语言获取文本
        getText: function getText(text, lang) {
            if (lang == '' || !lang) {
                lang = NOWLANG;
            }
            var t = LANGUAGE[text] && LANGUAGE[text][lang] ? LANGUAGE[text][lang] : '';
            if (!LANGUAGE[text] || t == '') {
                if (!LANGUAGE[text]) {
                    t = text;
                    console.log('[' + text + ']没有翻译配置');
                } else {
                    if (!LANGUAGE[text]['EN']) {
                        t = LANGUAGE[text]['ZH_CN'];
                    } else {
                        t = LANGUAGE[text]['EN'];
                    }
                    console.log(lang + ': [' + text + ']没有翻译配置');
                }
            }
            return t;
        },
        // 场外交易等文本
        getDealLeftText: function getDealLeftText() {
            $('.en_cwai').text(Base.getText('支付方式'));
            $('.en_gm').text(Base.getText('我要买入'));
            $('.en_cs').text(Base.getText('我要出售'));
            $('.en_dd').text(Base.getText('订单管理'));
            $('.en_gg').text(Base.getText('广告管理'));
            $('.en_xr').text(Base.getText('信任管理'));
            $('.en_fb').text(Base.getText('发布广告'));

            // index-left
            $('.en_zf02').text(Base.getText('微信'));
            $('.en_zf01').text(Base.getText('支付宝'));
            $('.en_zf03').text(Base.getText('银联转账'));
            $('.en_zf04').text(Base.getText('苹果礼品卡'));
            $('.en_zf05').text(Base.getText('steam礼品卡'));
            $('.en_zf06').text(Base.getText('银行转账'));
            $('.en_zf07').text(Base.getText('尼日利亚银行转账'));
            $('.en_zf08').text(Base.getText('Paypal 贝宝'));
            $('.en_zf09').text(Base.getText('西联'));
            $('.in_fkfs').text(Base.getText('支付方式'));
        }
    };

    return Base;
});