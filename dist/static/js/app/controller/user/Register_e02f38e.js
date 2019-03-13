'use strict';

define('js/app/controller/user/Register', ['js/app/controller/base', 'js/lib/swiper/idangerous.swiper.min', 'js/app/module/validate/validate', 'js/app/interface/UserCtr', 'js/app/interface/GeneralCtr', 'js/app/module/smsCaptcha/smsCaptcha', 'js/app/controller/Top', 'js/app/controller/foo'], function (base, Swiper, Validate, UserCtr, GeneralCtr, smsCaptcha, Top, Foo) {
    var langType = localStorage.getItem('langType') || 'ZH';
    var inviteCode = base.getUrlParam("inviteCode") || "";

    if (inviteCode != "") {
        $("#userReferee-Wrap").addClass("hidden");
    }
    if (base.isLogin()) {
        base.gohref("../user/user.html");
    } else {
        init();
    }

    function init() {
        if (langType == 'EN') {
            $('.login-form').addClass('en-login-form');
            $('.form-item').addClass('en-form-item');
            $('title').text('Register-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('注册-FUNMVP区块链技术应用实验平台');
        $(".head-button-wrap .button-login").removeClass("hidden");
        base.showLoadingSpin();
        $('.title').text(base.getText('注册', langType));
        $('.sel-li_m').text(base.getText('手机注册', langType));
        $('.sel-eml').text(base.getText('邮箱注册', langType));
        $('.txt-getVerification').text(base.getText('获取验证码', langType));
        $('.en_yjs').text(base.getText('我已阅读并接受', langType));
        $('.en_fw').text(base.getText('产品服务条款', langType));
        $('#subBtn').text(base.getText('注册', langType));

        $('#nickname').attr('placeholder', base.getText('请输入用户名', langType));
        $('#mobile').attr('placeholder', base.getText('请输入手机号', langType));
        $('#smsCaptcha').attr('placeholder', base.getText('请输入验证码', langType));
        $('#loginPwd').attr('placeholder', base.getText('请输入6-16位的登录密码', langType));

        getSysConfig(); // 测试
        base.hideLoadingSpin(); // 测试
        addListener();
    }

    function getSysConfig() {
        return GeneralCtr.getSysConfig("reg_protocol").then(function (data) {
            $("#content").html(data.cvalue);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
    }

    // 注册
    function register(params, type) {
        if (type == 'mobile') {
            return UserCtr.register(params).then(function (data) {
                base.showMsg(base.getText('注册成功', langType));
                var loginParams = {
                    loginName: params.mobile,
                    loginPwd: params.loginPwd
                };
                setTimeout(function () {
                    UserCtr.login(loginParams).then(function (data) {
                        base.setSessionUser(data);
                        UserCtr.getUser(true).then(function (item) {
                            sessionStorage.setItem("nickname", item.nickname);
                            sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
                            sessionStorage.setItem("mobile", item.mobile);
                            sessionStorage.setItem("inviteCode", item.userId);
                            base.hideLoadingSpin();
                            setTimeout(function () {
                                base.showMsg(base.getText('登录成功', langType));
                            }, 1000);
                            setTimeout(function () {
                                base.goReturn();
                            }, 2500);
                        }, base.hideLoadingSpin);
                    }, base.hideLoadingSpin);
                }, 300);
            }, base.hideLoadingSpin);
        } else {
            return UserCtr.emailRegister(params).then(function () {
                base.showMsg(base.getText('注册成功', langType));
                var loginParams = {
                    loginName: params.email,
                    loginPwd: params.loginPwd
                };
                UserCtr.login(loginParams).then(function (data) {
                    base.setSessionUser(data);
                    UserCtr.getUser(true).then(function (item) {
                        sessionStorage.setItem("nickname", item.nickname);
                        sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
                        sessionStorage.setItem("email", item.email ? item.email : '');
                        sessionStorage.setItem("inviteCode", item.userId);
                        base.hideLoadingSpin();
                        setTimeout(function () {
                            base.showMsg(base.getText('登录成功', langType));
                        }, 1000);
                        setTimeout(function () {
                            base.goReturn();
                        }, 2500);
                    }, base.hideLoadingSpin);
                }, base.hideLoadingSpin);
            }, base.hideLoadingSpin);
        }
    }
    //获取邮箱验证码
    function emailYzm(config) {
        return UserCtr.emailYzm(config).then(function (data) {
            // console.log(data);
        }, base.hideLoadingSpin);
    }

    function addListener() {
        var _registerForm = $("#register-form");
        var _registerForm1 = $("#register-form1");
        _registerForm.validate({
            'rules': {
                "nickname": {
                    required: true
                },
                "mobile": {
                    required: true,
                    mobile: true
                },
                "smsCaptcha": {
                    required: true,
                    sms: true
                },
                "loginPwd": {
                    required: true,
                    minlength: 6,
                    pwd: true
                },
                "userReferee": {
                    mobile: true
                }
            },
            onkeyup: false
        });
        _registerForm1.validate({
            'rules': {
                "nickname1": {
                    required: true
                },
                "email": {
                    required: true,
                    mail: true
                },
                "smsCaptcha": {
                    required: true,
                    sms: true
                },
                "loginPwd1": {
                    required: true,
                    minlength: 6,
                    pwd: true
                }
            },
            onkeyup: false
        });

        $("#subBtn").click(function () {
            if (!$(this).hasClass("am-button-disabled")) {
                if (_registerForm.valid()) {
                    base.showLoadingSpin();
                    var params = _registerForm.serializeObject();
                    inviteCode != "" && inviteCode ? params.userReferee = inviteCode : '';
                    register(params, 'mobile');
                }
            }
        });

        // 邮箱验证
        $("#subBtn1").click(function () {
            if (!$(this).hasClass("am-button-disabled")) {
                if (_registerForm1.valid()) {
                    base.showLoadingSpin();
                    var params = _registerForm1.serializeObject();
                    var params1 = {
                        loginPwd: params.loginPwd1,
                        nickname: params.nickname1,
                        email: params.email,
                        captcha: params.captcha
                    };
                    inviteCode != "" && inviteCode ? params1.userReferee = inviteCode : '';
                    register(params1, 'email');
                }
            }
        });

        function gcGetYzm(i) {
            $('#getVerification1').prop("disabled", true);
            var timer = window.setInterval(function () {
                if (i > 0 && $('#getVerification1').prop("disabled")) {
                    $('#getVerification1').text(base.getText('重新发送', langType) + "(" + i-- + "s)");
                } else {
                    $('#getVerification1').text(base.getText('获取验证码', langType)).prop("disabled", false);
                    $('#getVerification1').css({
                        color: '#d53d3d'
                    });
                    clearInterval(timer);
                }
            }, 1000);
        }

        //邮箱注册
        $('#getVerification1').off('click').click(function () {
            var reg = /^[a-z0-9._%-]+@([a-z0-9-]+\.)+[a-z]{2,4}$/;
            if ($('#email').val().match(reg)) {
                var i = 60;
                $('#getVerification1').css({
                    color: '#ccc',
                    'background-color': '#fff'
                });
                base.showLoadingSpin();
                emailYzm({
                    bizType: '805043',
                    email: $('#email').val()
                }).then(function (data) {
                    base.hideLoadingSpin();
                    gcGetYzm(i);
                }, function () {
                    base.hideLoadingSpin();
                    $('#getVerification1').text(base.getText('获取验证码', langType)).prop("disabled", false);
                    $('#getVerification1').css({
                        color: '#d53d3d'
                    });
                });
            }
            return false;
        });

        $("#subFlag").click(function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $("#subBtn").addClass("am-button-disabled");
            } else {
                $(this).addClass("active");
                $("#subBtn").removeClass("am-button-disabled");
            }
        });
        $("#subFlag1").click(function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $("#subBtn1").addClass("am-button-disabled");
            } else {
                $(this).addClass("active");
                $("#subBtn1").removeClass("am-button-disabled");
            }
        });
        smsCaptcha.init({
            checkInfo: function checkInfo() {
                return $("#mobile").valid();
            },
            bizType: "805041",
            id: "getVerification",
            mobile: "mobile",
            errorFn: function errorFn() {}
        });

        $('.protocol').click(function () {
            $("#registerDialog").removeClass("hidden");
        });

        //切换登录方式
        $('.sel-mod').click(function (e) {
            var target = e.target;
            if (target.tagName == 'LI') {
                $(target).addClass('sel-li_m').siblings('li').removeClass('sel-li_m');
                if ($(target).prop('class') == 'sel-phone sel-li_m') {
                    $('.phone-reg').removeClass('none').next().addClass('none');
                } else {
                    $('.eml-reg').removeClass('none').prev().addClass('none');
                }
            }
        });

        $("#registerDialog .am-modal-header").on('click', '.close', function () {
            $("#registerDialog").addClass("hidden");
        });
    }
});