define([
    'jquery',
    'app/util/dialog',
    'app/module/loading'
], function($, dialog, loading) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var cache = {};

    function showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, time || 2000);
    };
    var Ajax = {
        get: function(code, json, reload) {
            reload = reload || false;
            return Ajax.post(code, json, reload);
        },
        post: function(code, json, reload) {
            reload = reload == undefined ? true : reload;
            json = json || {};
            json["systemCode"] = SYSTEM_CODE;
            json["companyCode"] = SYSTEM_CODE;
            var token = sessionStorage.getItem("token");
            token && (json["token"] = token);
            var param = {
                code: code,
                json: json
            };
            var cache_url = "/api" + JSON.stringify(param);
            if (reload) {
                delete cache[code];
            }
            cache[code] = cache[code] || {};
            if (!cache[code][cache_url]) {
                param.json = JSON.stringify(json);
                cache[code][cache_url] = $.ajax({
                    type: 'post',
                    url: '/api',
                    headers: {
                        "Accept-Language": langType == 'EN' ? "en_US" : 'zh_CN'
                    },
                    data: param
                });
            }
            return cache[code][cache_url].pipe(function(res) {
                if (res.errorCode == "4") {
                    sessionStorage.removeItem("userId"); //userId
                    sessionStorage.removeItem("token"); //token
                    sessionStorage.setItem("l-return", location.pathname + location.search);
                    // 登录
                    let msg = '';
                    if(langType == 'EN'){
                        msg = $.Deferred().reject('Login timeout, please login again', res.errorCode);
                    }else{
                        msg = $.Deferred().reject('登录超时，请重新登录', res.errorCode);
                    }
                    return msg;
                }
                if (res.errorCode != "0") {
                    return $.Deferred().reject(res.errorInfo);
                }
                return res.data;
            }).fail(function(error, eCode, eTxt) {
                if (eCode == "error" || eCode == "timeout") {
                    if(error.status === '502') {
                        showMsg(eCode + "(" + error.status + "):" + eTxt, 10000);
                    }
                    console.log(eCode + "(" + error.status + "):" + eTxt);
                } else {
                    showMsg(error)
                }
                console.log('*** time:'+ new Date() +' ******************************');
                console.log('code:' + code);
                console.log('cache_url:' + cache_url);
                console.log('*********************************************');

                if (eCode && eCode == "4") {
                    setTimeout(function() {
                        var timestamp = new Date().getTime();
                        location.href = "../user/login.html?v=" + timestamp;
                    }, 2000)
                }
            });
        }

    };
    return Ajax;
});