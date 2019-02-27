define([
    'app/controller/base',
    'swiper',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Swiper, Validate, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    if (base.isLogin()) {
        base.gohref("../user/user.html")
    } else {
        init();
    }

    function init() {
        $(".head-button-wrap .button-register").removeClass("hidden");
        $('.title').text(base.getText('登录', langType));
        $('#subBtn').text(base.getText('登录', langType));
        $('.finPwd').text(base.getText('忘记密码', langType) + '?');
        $('#loginName').attr('placeholder', base.getText('请输入账号', langType));
        $('#loginPwd').attr('placeholder', base.getText('请输入6-16位的登录密码', langType));
        if(langType == 'EN'){
            $('title').text('Login-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('登录-FUNMVP区块链技术应用实验平台');
        initSwiperBanner();
        addListener();
        setTimeout(function() {
            base.hideLoadingSpin();
        }, 100)
    }
    // 初始化swiper
    function initSwiperBanner() {
        var _swiper = $("#swiper");
        if (_swiper.find('.swiper-slide').length <= 1) {
            _swiper.find('.swiper-pagination').hide();
        }
        var mySwiper = new Swiper('#swiper', {
            'autoplay': 5000,
            'pagination': '#swiper',
            'pagination': '#swiper .swiper-pagination',
            'paginationClickable': true,
            'preventClicksPropagation': true,
            'loop': true,
            'speed': 600
        });
    }

    function login(params) {
        return UserCtr.login(params).then((data) => {
            base.setSessionUser(data);
            base.showMsg(base.getText('登录成功', langType));
            UserCtr.getUser(true).then((item) => {
                sessionStorage.setItem("nickname", item.nickname);
                sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
                sessionStorage.setItem("mobile",item.mobile ? item.mobile : '');
                sessionStorage.setItem("email",item.email ? item.email : '');
                sessionStorage.setItem("inviteCode", item.userId);
                base.hideLoadingSpin();
                // if (!item.mobile){
                //     setTimeout(() => {
                //         base.showMsg('请绑定手机号');
                //         setTimeout(() => {
                //             base.gohrefReplace("../user/setPhone.html");
                //         }, 2500)
                //     }, 1500);
                // }else{
                    
                // }
                setTimeout(function() {
                    base.goReturn()
                }, 800)
            })
        }, base.hideLoadingSpin)
    }

    function addListener() {
        var _loginForm = $("#login-form");
        _loginForm.validate({
            'rules': {
                "loginName": {
                    required: true,
                    mm: true
                },
                "loginPwd": {
                    required: true
                },
            },
            onkeyup: false
        });

        $("#subBtn").click(function() {
            if (_loginForm.valid()) {
                base.showLoadingSpin()
                var params = _loginForm.serializeObject()
                login(params);
            }
        })
        $(document).keyup(function(event) {
            if (event.keyCode == 13) {
                $("#subBtn").click()
            }
        });


    }
});