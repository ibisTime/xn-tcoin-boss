define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/UserCtr',
  'app/interface/TradeCtr',
  'app/interface/GeneralCtr',
    'app/controller/Top',
    'app/controller/foo',
], function(base, Validate, smsCaptcha, UserCtr, TradeCtr, GeneralCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var type = base.getUrlParam("type");//设置类型： 0,设置  1，修改
  var isOk = true;
    if (!base.isLogin()) {
        base.goLogin()
    } else {
        $("#left-wrap .security").addClass("on")
        init();
    }

    function init() {
        $('.left-title').text(base.getText('用户中心'));
        $('.en_yhzl').text(base.getText('用户资料'));
        $('.uleft_en').text(base.getText('基本信息'));
        $('.identity').text(base.getText('身份验证'));
        $('.security').text(base.getText('安全设置'));
        $('.position').text(base.getText('当前位置', langType) + '：');
        $('.ph-en_yh').text(base.getText('用户中心', langType) + '>');
        $('.ph-en_aq').text(base.getText('安全设置', langType) + '>');
        $('.ph-en_sj').text(base.getText('手机号', langType));
        $('.title').text(base.getText('绑定手机号', langType));
        $('#getVerification1').text(base.getText('获取手机验证码', langType));
        $('#subBtn').text(base.getText('确定', langType));
        $('#mobile').attr('placeholder', base.getText('请输入手机号', langType));
        $('#captcha').attr('placeholder', base.getText('手机验证码', langType));
        if(langType == 'EN'){
            $('title').text('Cellphone number- blockchain technology application experimental platform');
        }
        $('title').text('手机号-区块链技术应用实验平台');
        getPayCoinList();
        base.hideLoadingSpin();
        addListener();
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
      sessionStorage.setItem('countryCode',$('#countryCode').attr('data-code'));
      sessionStorage.setItem('interCode',$('#interCode').attr('data-code'));
      $("#interCode").text(defaultData.interCode);
      
    }, base.hideLoadingSpin);
  }
    //綁定手机
    function setPhone(params) {
        return UserCtr.setCurrencyPhone(params).then(() => {
            base.hideLoadingSpin();
            base.showMsg(base.getText('设置成功', langType))
            sessionStorage.setItem("mobile", mobile);
            setTimeout(function() {
                base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }
    //修改手机
    function detPhone(params,smsCaptcha) {
        return UserCtr.detPhone(params,smsCaptcha).then(() => {
            base.hideLoadingSpin();
            base.showMsg(base.getText('设置成功', langType))
            sessionStorage.setItem("mobile", mobile);
            setTimeout(function() {
                // base.gohrefReplace("../user/security.html")
            }, 800)
        }, base.hideLoadingSpin)
    }
    function addListener() {
      $("#interCode").click(function () {
        $("#countryDialog").removeClass('hidden')
      });
      $('#currencyList').on('click', '.item', function () {
        var _this = $(this);
        $("#countryCode").attr('data-code', _this.attr('data-code'));
        $("#countryCode").css("background-image", `url('${base.getPic(_this.attr('data-pic'))}')`);
        $("#interCode").attr('data-code', _this.attr('data-interCode'));
        $("#interCode").text(_this.attr('data-interCode'));
        sessionStorage.setItem('countryCode',$('#countryCode').attr('data-code'));
        sessionStorage.setItem('interCode',$('#interCode').attr('data-code'));
        $("#countryDialog").addClass('hidden')
      });
      $("#getVerification1").stop().click(function () {
        if(isOk) {
          let params = {};
          params.mobile = $('#mobile').val().trim();
          if(params.mobile) {
            params.countryCode = $('#countryCode').attr('data-code');
            params.interCode = $('#interCode').attr('data-code');
            params.userId = base.getUserId();
            params.bizType = '805060';
            let time = 60;
            GeneralCtr.sendPhone(params).then(()=> {
              isOk = false;
              base.showMsg('发送成功');
              var showTime = '';
              showTime = setInterval(() => {
                if(time > 0) {
                  time --;
                  $('#getVerification1').text('重新发送' + time + 's');
                }else {
                  clearInterval(showTime);
                  $('#getVerification1').text('获取手机验证码');
                  isOk = true;
                }
              }, 1000);
            });
          }else {
            base.showMsg('手机号不为空');
            return;
          }
        }
      });
      $("#subBtn").click(function() {
        if($('#mobile').val().trim() !== '' || $('#captcha').val().trim() !== '') {
          base.showLoadingSpin();
          let params = {};
          params.countryCode = sessionStorage.getItem('countryCode')
          params.interCode = sessionStorage.getItem('interCode')
          params.smsCaptcha = $('#captcha').val();
          params.mobile = $('#mobile').val();
          if(type == 1){
            detPhone(params);
          }
          if(type == 0){
            setPhone(params);
          }
        }else {
          base.showMsg('请填写完整');
          return;
        }
      })
    }
});