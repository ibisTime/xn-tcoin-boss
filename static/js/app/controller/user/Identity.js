define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'app/module/qiniu',
    'app/module/validate',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Ajax, GeneralCtr, QiniuUpdata, validate, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let CerStatusList = {}

    let imageSrcZ = '',
        imageSrcF = '';

    let userConfig = {
        applyUser: base.getUserId(),
        country: 'cn'
    }

    var sf_photoFile = [{
        '0': 'sf_photoFile1',
        '1': 'sf_photoFile-wrap1',
        '2': 'sf_subBtn'
    }, {
        '0': 'sf_photoFile2',
        '1': 'sf_photoFile-wrap2',
        '2': 'sf_subBtn'
    }, {
        '0': 'hz_photoFile1',
        '1': 'hz_photoFile-wrap1',
        '2': 'hz_subBtn'
    }, {
        '0': 'hz_photoFile2',
        '1': 'hz_photoFile-wrap2',
        '2': 'hz_subBtn'
    }, {
        '0': 'jz_photoFile1',
        '1': 'jz_photoFile-wrap1',
        '2': 'jz_subBtn'
    }, {
        '0': 'jz_photoFile2',
        '1': 'jz_photoFile-wrap2',
        '2': 'jz_subBtn'
    }]

    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .identity").addClass("on")
        init();
    }

    function init() {
        base.showLoadingSpin();
        setHtml();
        $.when(
            getUser(),
            getQiniuToken(sf_photoFile)
        )
        GeneralCtr.getDictList({
            "parentKey": "approve_status"
        }).then((data) => {
            data.forEach(item => {
                CerStatusList[`${item.dkey}`] = item.dvalue;
            });
        })
        addListener();
    }
    function setHtml() {
        $('title').text(base.getText('身份验证') + '-' +base.getText('FUNMVP区块链技术应用实验平台'));
        $('.left-title').text(base.getText('用户中心'));
        $('.en_yhzl').text(base.getText('用户资料'));
        $('.uleft_en').text(base.getText('基本信息'));
        $('.identity').text(base.getText('身份验证'));
        $('.security').text(base.getText('安全设置'));
        $('.fy_rzsm').text(base.getText('为确保交易安全...'));
        $('.fy_zgdlsfz').text(base.getText('中国大陆身份证'));
        $('.fy_syyddszgdlyh').text(base.getText('适用于大多数中国大陆用户'));
        $('.fy_zk').text(base.getText('展开'));
        $('.fy_xm').text(base.getText('姓名') + '：');
        $('.fy_zjh').text(base.getText('证件号') + '：');
        $('.fy_sctpzysx').text(base.getText('上传图片注意事项') + '：');
        $('.fy_sfzh').text(base.getText('身份证号') + '：');


    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {
            let idAuthStatus = '';
            let userIdAuthInfo = data.userIdAuthInfo;
            function isYz(wId, wClass){
                $(wId).removeClass('none').find('.yz_p').off('click');
                $(wClass).text(CerStatusList[idAuthStatus]);
                if(idAuthStatus == 1){
                    $(wClass).css({
                        borderColor: '#f15353',
                        color: '#f15353'
                    });
                }
            }

            setTimeout(() => {
                if(userIdAuthInfo){
                    idAuthStatus = parseInt(userIdAuthInfo.status);
                    if(idAuthStatus == 2 && !userIdAuthInfo.idKind){
                        base.showMsg(base.getText('认证审核不通过，请重新认证！', langType));
                        $('.identity-content').removeClass('none');
                        return;
                    }
                    switch(userIdAuthInfo.idKind){
                        case '1':
                            isYz('#alreadyIdentity', '.sfz');
                            break;
                        case '2':
                            isYz('#hzIdentity', '.hz');
                            break;
                        case '3':
                            isYz('#jzIdentity', '.jz');
                            break;
                    }
                }else{
                    $('.identity-content').removeClass('none');
                }
            }, 100);
            if (data.realName) {
                $("#form-wrapper").setForm(data);
                $("#alreadyIdentity").removeClass("hidden");
            } else {
                $("#goAppIdentity").removeClass("hidden");
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    // 分页查用户认证记录
    // function getUserCerRecords() {
    //     return Ajax.post('805165', {
    //         limit: '10',
    //         start: '1',
    //         applyUser: base.getUserId()
    //     })
    // }

    //加载七牛token
    function getQiniuToken(sf_photoFile) {
        return GeneralCtr.getQiniuToken().then((data) => {
            var token = data.uploadToken;
            base.showLoadingSpin();
            sf_photoFile.forEach(item => {
                QiniuUpdata.uploadInit({
                    btnId: item[0],
                    containerId: item[1],
                    starBtnId: item[2],
                    token: token
                })
            })

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }


    // 进行身份验证
    function userSFVerify(config) {
        return Ajax.post('805160', config);
    }


    function addListener() {
        var _registerForm = $("#sf_form-wrapper");
        _registerForm.validate({
            'rules': {
                "idNo": {
                    isIdCardNo: true
                },
            },
            onkeyup: false
        });
        var _registerFormHz = $("#hz_form-wrapper");
        _registerFormHz.validate({
            'rules': {
                "hz_code": {
                    isHzCard: true
                },
            },
            onkeyup: false
        });
        // 展开、收起
        $('.yz_p').off('click').click(function() {
            if ($(this).children('span').text() == base.getText('收起', langType)) {
                $(this).parent().next().hide(200);
                $(this).children('span').text(base.getText('展开', langType));
                $(this).children('i').css('background-image', 'url(/static/images/zk.png)');
            } else {
                $('.form-detail').hide(200);
                $('.yz_p').children('span').text(base.getText('展开', langType));
                $('.yz_p').children('i').css('background-image', 'url(/static/images/zk.png)');
                $(this).parent().next().show(200);
                $(this).children('span').text(base.getText('收起', langType));
                $(this).children('i').css('background-image', 'url(/static/images/sq.png)');
            }
        })

        // 显示图片
        function showImg(that, isZf) {
            if ($(that).attr("data-src") != "") {
                if (isZf) {
                    imageSrcZ = $(that).attr("data-src");
                } else {
                    imageSrcF = $(that).attr("data-src");
                }
                let imgSrc = $(that).attr("data-src");
                $(that).next().css({ "background-image": "url('" + base.getPic(imgSrc) + "')" });
            }
        }

        //选择身份证图片
        //正
        $("#sf_photoFile1").bind('change', function() {
                showImg(this, true);
            })
            //反
        $("#sf_photoFile2").bind('change', function() {
            showImg(this, false);
        })

        //选择护照图片
        //正
        $('#hz_photoFile1').bind('change', function() {
            showImg(this, true);
        })

            //反
        $("#hz_photoFile2").bind('change', function() {
            showImg(this, false);
        })

        //选择驾照图片
        //正
        $('#jz_photoFile1').bind('change', function() {
            showImg(this, true);
        })

        //反
        $("#jz_photoFile2").bind('change', function() {
            showImg(this, false);
        })

        function loadFn(){
            base.showMsg(base.getText('认证请求发起成功', langType));
                setTimeout(() => {
                    location.reload();
                }, 600);
        }


        //身份验证
        $('#sf_subBtn').off('click').click(function() {
            userConfig.idFace = imageSrcZ;
            userConfig.idOppo = imageSrcF;
            userConfig.idKind = '1';
            userConfig.idNo = $('#idNo').val().trim();
            userConfig.realName = $('#realName').val().trim();
            if (_registerForm.valid()) {
                userSFVerify(userConfig).then(data => {
                    loadFn();
                })
            }
        })

        //护照认证
        $('#hz_subBtn').off('click').click(function() {
            userConfig.idFace = imageSrcZ;
            userConfig.idOppo = imageSrcF;
            userConfig.idKind = '2';
            userConfig.idNo = $('#hz_code').val().trim();
            userConfig.realName = $('#hz_name').val().trim();
            userSFVerify(userConfig).then(data => {
                loadFn();
            })
        })

        //驾照认证
        $('#jz_subBtn').off('click').click(function() {
            userConfig.idFace = imageSrcZ;
            userConfig.idOppo = imageSrcF;
            userConfig.idKind = '3';
            userConfig.idNo = $('#jz_code').val().trim();
            userConfig.realName = $('#jz_name').val().trim();
            userSFVerify(userConfig).then(data => {
                loadFn();
            })
        })
    }
});