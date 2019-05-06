define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/interface/GeneralCtr',
    'app/interface/TradeCtr',
    'app/module/qiniu',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, UserCtr, GeneralCtr, TradeCtr, QiniuUpdata, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    if (!base.isLogin()) {
        base.goLogin();
        return;
    }

    init();

    function init() {
        base.showLoadingSpin();
        setHtml();
        $("#left-wrap .user").addClass("on")
        if ($("#head-user-wrap").hasClass("hidden")) {
            $("#head-user-wrap").removeClass("hidden")
        }

        addListener();
        $.when(
            getPayTypeMoneyList(),
            getPayCoinList()
        )
    }

    function setHtml() {
        $('title').text(base.getText('用户中心') + '-' +base.getText('区块链技术应用实验平台'));

        if(langType === 'EN'){
            $('.u-en').removeClass('none');
        }else{
            $('.u-zh').removeClass('none');
        }
        $('.left-title').text(base.getText('用户中心'));
        $('.en_yhzl').text(base.getText('用户资料'));
        $('.uleft_en').text(base.getText('基本信息'));
        $('.identity').text(base.getText('身份验证'));
        $('.security').text(base.getText('安全设置'));
        $('.fy_xgtx').text(base.getText('更新个人资料图片', langType));
        $('.user-en_sf').text(base.getText('身份验证', langType) + '：');
        $('.user-en_em').text(base.getText('电子邮件', langType) + '：');
        $('.user-en_sj').text(base.getText('手机号码', langType) + '：');
        $('.user-en_zc').text(base.getText('注册时间', langType) + '：');
        $('.user-en_lj').text(base.getText('累计交易次数', langType) + '：');

        $('#editPhotoDialog .fy_ghtx').html(base.getText('更换头像'));
        $('#editPhotoDialog .fy_xztp').html(base.getText('选择图片'));
        $('#editPhotoDialog .cancelBtn').html(base.getText('取消'));
        $('#editPhotoDialog .subBtn').html(base.getText('提交'));
        $('.right-top-wrap .yhm').html(base.getText('用户名'));
        $('.right-top-wrap .username-remind').html(base.getText('必须绑定您的手机，以应对您出现资金、密码等安全问题'));
        $('.right-top-wrap .ghdm').html(`${base.getText('电话')}<samp class="fr hidden goHref goChangeMobile" id="goChangeMobile" data-href="./setPhone.html">${base.getText('更换号码')}</samp>`);
        $('.right-top-wrap .ghdm').attr('placeholder', '请输入手机号码');
        $('#smsCaptcha').attr('placeholder', base.getText('输入确认码'));
        $('#firstName').attr('placeholder', base.getText('请输入名字'));
        $('#lastName').attr('placeholder', base.getText('请输入姓氏'));
        $('#introduce').attr('placeholder', base.getText('您的简介会出现在您的公开资料上'));
        $('.right-top-wrap .mobile-remind').html(`${base.getText('请设置带国家/地区代码的您的电话号码。')}<samp class="cur-pointer" id="sendCode">${base.getText('发送确认码')}</samp>${base.getText('必须是手机号码')}！`);
        $('#setMobileBtn').html(base.getText('提交'));
        $('.right-top-wrap .grzl').html(base.getText('个人资料图片'));
        $('#userInfo-wrapper .xm').html(base.getText('名字'));
        $('#userInfo-wrapper .xs').html(base.getText('姓氏'));
        $('#userInfo-wrapper .zdsh').html(base.getText('最多3行，并且最多180个字符'));
        $('#userInfo-wrapper .sxhb').html(base.getText('首选货币'));
        $('#userInfo-wrapper .xsnidqb').html(base.getText('选择您的钱包将使用的货币'));
        $('#userInfoSubBtn').html(base.getText('保存'));
        $('.right-top-wrap #countryDialog .gjxz').html(base.getText('国家选择'));
        $('#countryDialog .cancelBtn').html(base.getText('关闭'));
        $('.jj').html(base.getText('简介'));
    }

    // 货币列表
    function getPayTypeMoneyList() {
        return TradeCtr.getPayCoinList().then((res) => {
            let html = `<option value="">${base.getText('请选择')}</option>`;
            res.map((item) => {
                html += `<option value="${item.simpleName}">${item.name}</option>`
            });
            $('#defaultCurrency').html(html);

            $.when(
                getUser(),
                getQiniuToken()
            )
        }, base.hideLoadingSpin);
    }
    // 国家编码
    function getPayCoinList() {
        return TradeCtr.getCountryList({ status: 1 }).then((data) => {
            let html = '';
            let defaultData = {};
            data.map((item) => {
                if (item.interSimpleCode === 'CN' && item.chineseName === '中国') {
                    defaultData = item;
                }
                html += `<div class="item" id="code_${item.code}" data-code="${item.code}" data-pic="${item.pic}"
                            data-interCode="${item.interCode}">${item.chineseName}</div>`
            });
            $("#currencyList").html(html);
            $("#countryCode").attr('data-code', defaultData.code);
            $("#countryCode").css("background-image", `url('${base.getPic(defaultData.pic)}')`);
            $("#interCode").attr('data-code', defaultData.interCode);
            localStorage.setItem('countryCode',$('#countryCode').attr('data-code'));
            localStorage.setItem('interCode',$('#interCode').attr('data-code'));
            $("#interCode").text(defaultData.interCode);

        }, base.hideLoadingSpin);
    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {

            if (data.photo) {
                $("#photo").css({ "background-image": "url('" + base.getAvatar(data.photo) + "')" })
            } else {
                var tmpl = data.nickname ? data.nickname.substring(0, 1).toUpperCase() : '';
                var photoHtml = `<div class="noPhoto">${tmpl}</div>`
                $("#photo").html(photoHtml)
            }

            $("#nickname").text(data.nickname)
            $("#createDatetime").html(base.formateDatetime(data.createDatetime))
            if (data.userStatistics) {
                $("#beiXinRenCount").text(data.userStatistics.beiXinRenCount);
                $("#beiXinRenCount1").text(data.userStatistics.beiXinRenCount);
                $("#jiaoYiCount").text(data.userStatistics.jiaoYiCount);
                $("#beiHaoPingCount").text(data.userStatistics.beiHaoPingCount);
                $("#beiHaoPingCount1").text(data.userStatistics.beiHaoPingCount);
            }
            $("#firstName").val(data.firstName);
            $("#lastName").val(data.lastName);
            $("#introduce").val(data.introduce);
            $("#defaultCurrency").val(data.defaultCurrency);
            if (data.email) {
                $("#email").text(data.email)
            } else {
                $("#email").text(base.getText('未绑定')).addClass("no").click(function() {
                    base.gohref("./setEmail.html");
                });
            }
            if (data.mobileBindFlag) {
                $('#currencyBtn').unbind('click');
                $("#mobile").val(data.mobile).attr('disabled', 'disabled');
                $("#code_"+data.countryCode).click();
                $("#goChangeMobile").removeClass('hidden');
            } else {
                $('#form-wrapper1').removeClass('hidden');
                $('.username-wrap .mobile-remind').removeClass('hidden');
            }
            if (data.idNo) {
                $("#idNo").text(base.getText('已验证', langType))
            } else {
                $("#idNo").text(base.getText('未验证', langType)).addClass("no").click(function() {
                    base.gohref("./identity.html");
                });
            }

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    //加载七牛token
    function getQiniuToken() {
        return GeneralCtr.getQiniuToken().then((data) => {
            var token = data.uploadToken;

            base.showLoadingSpin();
            QiniuUpdata.uploadInit({
                btnId: 'photoFile',
                containerId: 'photoFile-wrap',
                starBtnId: 'subBtn',
                token: token
            })

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function changePhoto() {
        return UserCtr.changePhoto($("#editPhotoDialog .img-wrap .photoWrapSquare .photo").attr("data-src")).then((data) => {
            base.hideLoadingSpin();
            $("#editPhotoDialog").addClass("hidden")
            base.showMsg(base.getText('修改成功', langType));
            setTimeout(function() {
                location.reload(true);
            }, 800)
        }, base.hideLoadingSpin)
    }

    // 修改个人资料
    function setUserInfo(params) {
        base.showLoadingSpin();
        return UserCtr.setUserInfo(params).then(() => {
            base.hideLoadingSpin();
            base.showMsg(base.getText('操作成功'))
        }, () => {
            base.hideLoadingSpin();
        })
    }

    function addListener() {

        $("#editPhoto").click(function() {
            $("#editPhotoDialog").removeClass("hidden")
        })
        $("#editPhotoDialog .cancelBtn").click(function() {
            $("#editPhotoDialog").addClass("hidden");
            $("#editPhotoDialog .img-wrap .photoWrapSquare .photo").attr("data-src", "")
            $("#editPhotoDialog .img-wrap").addClass("hidden")
        })

        //选择图片
        $("#photoFile").bind('change', function() {
            if ($(this).attr("data-src") != "") {
                var src = $(this).attr("data-src");
                $("#editPhotoDialog .img-wrap").removeClass("hidden")
                $("#editPhotoDialog .img-wrap .photo").css({ "background-image": "url('" + base.getPic(src) + "')" })
                $("#editPhotoDialog .img-wrap .photo").attr("data-src", src)
            }

        })

        //提交按钮
        $("#subBtn").click(function() {
            var src = $("#editPhotoDialog .img-wrap .photoWrapSquare .photo").attr("data-src")
            if (src == "" || !src) {
                base.showMsg(base.getText('请选择图片', langType));
                return;
            }
            base.showLoadingSpin();
            changePhoto();
        })

        let _userInfoWrapper = $('#userInfo-wrapper');
        _userInfoWrapper.validate({
            'rules': {
                "firstName": {
                    required: true
                },
                "lastName": {
                    required: true
                },
                "introduct": {
                    required: true
                },
                "defaultCurrency": {
                    required: true
                }
            },
            onkeyup: false
        });
        $("#userInfoSubBtn").click(function(){
            if(_userInfoWrapper.valid()){
                base.showLoadingSpin();
                var params=_userInfoWrapper.serializeObject()
                setUserInfo(params)
            }
        })

        $("#currencyBtn").click(function () {
            $("#countryDialog").removeClass('hidden')
        })

        $("#countryDialog .cancelBtn").click(function () {
            $("#countryDialog").addClass('hidden')
        })

        $('#currencyList').on('click', '.item', function () {
            var _this = $(this);
            $("#countryCode").attr('data-code', _this.attr('data-code'));
            $("#countryCode").css("background-image", `url('${base.getPic(_this.attr('data-pic'))}')`);
            $("#interCode").attr('data-code', _this.attr('data-interCode'));
            $("#interCode").text(_this.attr('data-interCode'));
            localStorage.setItem('countryCode',$('#countryCode').attr('data-code'));
            localStorage.setItem('interCode',$('#interCode').attr('data-code'));
            $("#countryDialog").addClass('hidden')
        })

        let _formWrapper = $('#form-wrapper');
        _formWrapper.validate({
            'rules': {
                "mobile": {
                    required: true,
                    number: true
                }
            },
            onkeyup: false
        });
        $("#sendCode").click(function () {
            if(_formWrapper.valid()){
                base.showLoadingSpin();
                let params = _formWrapper1.serializeObject();
                params = {
                    ...params,
                    ..._formWrapper.serializeObject()
                };
                params.countryCode = $('#countryCode').attr('data-code');
                params.interCode = $('#interCode').attr('data-code');
                params.userId = base.getUserId();
                params.bizType = '805060';
                GeneralCtr.sendPhone(params).then(()=> {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('发送成功'));
                }, base.hideLoadingSpin)
            }
        })

        let _formWrapper1 = $('#form-wrapper1');
        _formWrapper1.validate({
            'rules': {
                "smsCaptcha": {
                    required: true
                }
            },
            onkeyup: false
        });

        $("#setMobileBtn").click(function () {
            if (_formWrapper.valid() && _formWrapper1.valid()) {
                let params = _formWrapper1.serializeObject();
                params = {
                    ...params,
                    ..._formWrapper.serializeObject()
                };
                params.countryCode = $('#countryCode').attr('data-code');
                params.interCode = $('#interCode').attr('data-code');
                base.showLoadingSpin();
                UserCtr.setCurrencyPhone(params).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功！'));
                    setTimeout(function () {
                        location.reload(true);
                    }, 1200);
                }, base.hideLoadingSpin);
            }
        })
    }
});