'use strict';

define('js/app/controller/Top', ['js/app/controller/base', 'js/app/interface/GeneralCtr', 'js/app/interface/AccountCtr', 'js/app/interface/UserCtr', 'js/app/module/tencentCloudLogin/index'], function (base, GeneralCtr, AccountCtr, UserCtr, TencentCloudLogin) {
    var langType = localStorage.getItem('langType') || 'ZH';
    var firstLoad = true;
    // langPackage 配置文件

    var langPackage = LANGUAGE;

    $(document).ready(function () {
        init();
    });

    // 初始化页面
    function init() {
        //中英文切换  先头部切换
        $('.en_page').text(base.getText('购买比特币'));
        $('.en_store').text(base.getText('出售比特币'));
        $('.en_deal').text(base.getText('发布广告'));
        $('.nav-cwjy').text(base.getText('场外交易'));
        $('.nav-bbjy').text(base.getText('币币交易'));
        $('.en_bzzx').text(base.getText('帮助中心'));
        $('#head-button-wrap .button-login').text(base.getText('登录'));
        $('#head-button-wrap .button-register').text(base.getText('注册'));
        $('#head-user-wrap .fy_top_zc').text(base.getText('钱包'));
        $('#head-user-wrap .fy_top_zzc').text(base.getText('总资产'));
        $('#head-user-wrap .fy_top_kyzc').text(base.getText('可用资产'));
        $('#head-user-wrap .fy_top_djzc').text(base.getText('冻结资产'));
        $('#head-user-wrap .fy_top_bz').text(base.getText('币种'));
        $('#head-user-wrap .fy_top_buy').text(base.getText('去购买'));
        $('#head-user-wrap .fy_top_sell').text(base.getText('去出售'));
        $('#head-user-wrap .fy_top_dd').text(base.getText('控制面板'));
        $('#head-user-wrap .fy_top_cwjydd').text(base.getText('场外交易订单'));
        $('#head-user-wrap .fy_top_bbjydd').text(base.getText('币币交易订单'));
        $('#head-user-wrap .fy_top_yyzx').text(base.getText('用户中心'));
        $('#head-user-wrap .fy_top_yqhy').text(base.getText('邀请好友'));
        $('#head-user-wrap .fy_top_tcdl').text(base.getText('退出登录'));
        $('.en_yqhy').text(base.getText('邀请好友'));
        $('.store_en').text(base.getText('商城'));
        $('.store_gm').text(base.getText('区块链游戏'));
        $('.store_car').text(base.getText('二手车兑换'));
        $('.store_ye').text(base.getText('游戏余额'));

        if (langType === 'EN') {
            $('.lang_select option.l-en').attr('selected', true);
            $('.head-user .dd-ul').css({
                'width': '150px',
                'left': '-80px'
            });
            $('.str-h_l').css('margin-right', '15px');

            setTimeout(function () {
                if (firstLoad) {
                    firstLoad = false;
                    changeLanguageFn($(document));
                }
            }, 1);
        } else {
            base.hideLoadingSpin();
        }

        $('.lang_select').change(function () {
            switch ($(this).val()) {
                case 'zh':
                    localStorage.clear('langType');break;
                case 'en':
                    localStorage.setItem('langType', 'EN');break;
            }
            location.reload(true);
        });

        $("#footTeTui").html(FOOT_TETUI);
        $("#footEmail").html(FOOT_EMAIL);
        if (base.isLogin()) {
            if (sessionStorage.getItem("nickname")) {
                $("#head-user-wrap .nickname").text(sessionStorage.getItem("nickname"));
                $("#head-user-wrap").removeClass("hidden");
            }
        } else {
            $("#head-button-wrap").removeClass("hidden");
        }

        addListener();
        initSocket();
    }

    /**
     * 初始化Socket链接
     */
    function initSocket() {
        var ws = new WebSocket('ws://120.26.6.213:5802/ogc-standard/webSocketServer?userId=123133');
        ws.onopen = function (event) {
            console.log('链接成功');
            // ws.send('你好啊')
        };

        ws.onmessage = function (event) {
            console.log(event);
            var data = JSON.parse(event.data);
            var audio_type = data.type;
            console.log(audio_type);
            if (audio_type == 1) {
                document.getElementById('audio-message2').play();
            } else {
                document.getElementById('audio-message1').play();
            }
            var taget = $('#head-user-wrap .head-user .msg_num');
            var msg_num = +taget.text();
            taget.text(msg_num + 1);
            var messageHtml = '';
            var activeNewsHtml = '';
            messageHtml = '<li class="goHref" data-href="../user/user.html">\n                            <img src="/static/images/system-msg.png">\n                            <div class="message-text">\n                                <p class="message-title">' + data.title + '</p>\n                                <span class="message-content">' + data.content + '</span>\n                            </div>\n                        </li>';
            activeNewsHtml = '<li>\n                                <span> <button>\u804A\u5929</button></span>\n                                <span>dcdfdffsd</span>\n                                <span>50.00USD</span>\n                                <span>0.00003BTC</span>\n                                <span>\u51FA\u552E</span>\n                            </li>';

            $('.down-wrap-message ul').append(messageHtml);
            $('.active-news ul').append(activeNewsHtml);
        };

        ws.onclose = function () {
            console.log('链接断开，尝试重连');
            // initSocket()
        };

        console.log(ws);
    }

    /**
     * 消息查看
     */
    $(".head-user.message").mouseleave(function () {
        var length = $('.down-wrap-message li').length;
        var taget = $('#head-user-wrap .head-user .msg_num');
        taget.text(taget.text() - length);
        $(".down-wrap-message ul").html('');
    });
    $(".head-user.message").mouseenter(function () {
        var length = $('.down-wrap-message li').length;
        if (length == 0) {
            $(".head-user.message .head-triangle").hide();
        }
    });
    function changeLanguageFn(nodeObj) {
        if (nodeObj.children().length > 0) {
            nodeObj.children().each(function () {
                changeLanguageFn($(this));
                FindChsAndReplaceIt($(this));
            });
        } else {
            FindChsAndReplaceIt(nodeObj);
        }

        function FindChsAndReplaceIt(nodeObj) {
            var pat = new RegExp('[\u4E00-\u9FA5]+', "g");
            if ((nodeObj.text() || nodeObj.val() || nodeObj.attr("title") || nodeObj.attr("placeholder")) && (pat.exec(nodeObj.text()) || pat.exec(nodeObj.val()) || pat.exec(nodeObj.attr("title")) || pat.exec(nodeObj.attr("placeholder")))) {
                var str = "";
                if (nodeObj.text()) {
                    str = nodeObj.text();
                    ReplaceValue(str, nodeObj, "text");
                }
                if (nodeObj.val()) {
                    str = nodeObj.val();
                    ReplaceValue(str, nodeObj, "val");
                }
                if (nodeObj.attr("title")) {
                    str = nodeObj.attr("title");
                    ReplaceValue(str, nodeObj, "title");
                }
                if (nodeObj.attr("placeholder")) {
                    str = nodeObj.attr("placeholder");
                    ReplaceValue(str, nodeObj, "placeholder");
                }
            }
        }

        function ReplaceValue(str, nodeObj, attrType) {
            var arr;
            var pat = new RegExp('[\u4E00-\u9FA5]+', "g");
            while ((arr = pat.exec(str)) != null) {
                if (langPackage[arr.input]) {
                    str = str.replace(arr.input, langPackage[arr.input]['EN']);
                    if (attrType == "text") {
                        nodeObj.text(str);
                    } else if (attrType == "val") {
                        nodeObj.val(str);
                    } else if (attrType == "title") {
                        nodeObj.attr("title", str);
                    } else if (attrType == "placeholder") {
                        nodeObj.prop("placeholder", str);
                    }
                }
            }
        }
    }

    function addListener() {

        $("#headLogout").click(function () {
            base.logout();
        });
        $(".am-modal-mask").on('click', function () {
            $(this).parent(".dialog").addClass("hidden");
        });

        $("#head .advertise .goHref").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref);
            }
        });

        $("#head .head-nav-wrap .advertise .goHref").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref);
            }
        });

        $("#head .head-nav-wrap .invitation").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref);
            }
        });

        $("#head .head-nav-wrap .store").off("click").click(function () {
            var thishref = $(this).attr("data-href");
            base.gohref(thishref);
        });

        // $("#head .trade .goHref").off("click").click(function () {
        // var thishref = $(this).attr("data-href");
        // if ($(this).text() == '币币交易') {
        //     base.gohref(thishref);
        //     return false;
        // }
        // if (!base.isLogin()) {
        //     base.goLogin();
        //     return false;
        // } else {
        //     base.gohref(thishref)
        // }
        // })

        $("body").on('click', '.isTradePwdFlag', function () {
            var _this = $(this);

            UserCtr.getUser().then(function (data) {
                if (data.tradepwdFlag) {
                    base.gohref(_this.attr("data-href"));
                } else if (!data.tradepwdFlag) {
                    base.showMsg(base.getText('请先设置交易密码'));
                    setTimeout(function () {
                        base.gohref("../user/setTradePwd.html?type=1");
                    }, 1800);
                }
            }, base.hideLoadingSpin);
        });
    }
});