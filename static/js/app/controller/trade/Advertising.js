define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/interface/AccountCtr',
    'app/interface/BaseCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, GeneralCtr, UserCtr, TradeCtr, AccountCtr, BaseCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var code = base.getUrlParam("code") || '';
    var coin = base.getUrlParam("coin") || 'BTC'; // 币种
    var status = '1';
    let adverType = base.getUrlParam("type") || 'sell';
    var mid = 0,
        jdLeft = 0,
        selOnlyCert = 0;
    var pay = '';
    var midBlv = 0;
    var isKup = true;
    let langText = '';
    if (langType === 'EN') {
        langText = '_en';
    }
    // step1
    let payBigType = '';
    let paySubType = '';
    let paySearch = '';
    let tradeCoin = sessionStorage.getItem('tradeCoin') || '';
    let tradeCoin001 = sessionStorage.getItem('tradeCoin001') || '';
    let payList = [];
    let step1SelectName = [];

    let tradeType = 1;
    //step2
    let step2TagInitData = [];
    // step3
    let step3TagInitData = [];
    let targetArea = '';    // 目标国家
    let customTag = '';     // 用户自定义标签
    let step3ConditionConfig = {
      email: 0,
      mobile: 0,
      id: 0
    };                      // 验证
    let step3AreaLimit = '';    //国家/地区限制
    let step3Visible = '';     // 可见性
    let isAllowProxy = '';
    let cancelTimeInput = '';
    let href = '';
    let coinName = {
      'USDT': 'USDT',
      'BTC': base.getText('比特币')
    };
    let tradeObj = {
      'BTC': 'trade_btc_bail',
      'USDT': 'trade_usdt_bail'
    };
    let adverTypeObj = {
      'buy': '购买',
      'sell': '出售'
    };
    
    let step3TagsData = '';
    
    let rateList = [];
    
    let trade_btc_bail = '',
      trade_usdt_bail = '',
      defaultFee = '';

      if(!base.isLogin()){
        base.goLogin();
        return;
      }else {
          $('.head-nav-wrap .advertise').addClass('active');
        if(code) {
          href = window.location.href.split('?')[1];
        }
        if(location.href.indexOf('step2') !== -1) {
          step2Init();
        } else if(location.href.indexOf('step3') !== -1) {
          step3Init();
        } else {
          init();
        }
      }
      function removeSession() {
          sessionStorage.removeItem('cancelTime');
          sessionStorage.removeItem('myTagInput');
          sessionStorage.removeItem('clauseTextarea');
          sessionStorage.removeItem('explainTextarea');
          sessionStorage.removeItem('jzxe');
          sessionStorage.removeItem('step2AccuracyTags');
          sessionStorage.removeItem('max');
          sessionStorage.removeItem('min');
          sessionStorage.removeItem('tradeCoin');
          sessionStorage.removeItem('zq');
          sessionStorage.removeItem('step3TagsData');
          sessionStorage.removeItem('tradeCoin001');
          sessionStorage.removeItem('tradeType');
          sessionStorage.removeItem('paySubType');
          sessionStorage.removeItem('payBigType');
          sessionStorage.removeItem('optionPay');
      }
    function init() {
        base.showLoadingSpin();
        setHtml();
        if (code !== "") {
            $("#draftBtn").addClass("hidden");
        }
        $("#coin").text(coin.toUpperCase());
        $("#price").attr("disabled", true);
      $.when(
        GeneralCtr.getDictList({ "parentKey": "payment_method" }),
        TradeCtr.getPayCoinList(),
        BaseCtr.getCoinList(),
        GeneralCtr.rateList(),
        GeneralCtr.getSysConfig('trade_default_fee_rate'),
        getAdvertiseDetail()
      ).then((data1, data2, data3, data4, data5) => {
        defaultFee = +data5.cvalue * 100;
        rateList = data4;
        let tabHtml = '';
        data1.forEach((item, i) => {
          tabHtml += buildTabHtml(item, i)
        });
        $(".advertise-step1-tabs").append(tabHtml);
          setTimeout(() => {
              let payBigType = +sessionStorage.getItem('payBigType') || 0;
              $('.advertise-step1-tabs .tab-item').eq(payBigType).addClass('active').siblings().removeClass('active');
              console.log(payBigType);
              getPayTypeList(payBigType);
          }, 300);
        tradeCoin = data2[0].simpleName;
        let step1SelectHtml = '';
        data2.forEach((item, i) => {
          step1SelectHtml += buildStep1SelectHtml(item, i)
        });
        $("#tradeCoin").append(step1SelectHtml);
        let coinHtml = '';
        data3.forEach(item => {
          coinHtml += coinListHtml(item);
        });
        $('.advertise-coin-container').html(coinHtml);
        let tradeCoin001Init = sessionStorage.getItem('tradeCoin001');
        if(tradeCoin001Init) {
          $(`.icon_${tradeCoin001Init}`).addClass('icon-step1-selected');
          $('.user-option .option-coin').text(coinName[tradeCoin001Init]);
          $('.user-option li').eq(0).show();
        }
        let tradeCoinInit = sessionStorage.getItem('tradeCoin');
        if(tradeCoinInit) {
          let setValue = '';
          step1SelectName.forEach(item => {
            if(item.code === tradeCoinInit) {
              setValue = item.name;
              tradeCoin = item.code;
            }
          });
          $('.user-option .option-tran').text(tradeCoin);
          $('#tradeCoin').val(setValue);
        }else {
          sessionStorage.setItem('tradeCoin', 'CNY');
            $('.user-option .option-tran').text('CNY');
        }
        let jzxe = sessionStorage.getItem('jzxe');
        let zq = sessionStorage.getItem('zq');
        let min = sessionStorage.getItem('min');
        let max = sessionStorage.getItem('max');
        let step2AccuracyTags = sessionStorage.getItem('step2AccuracyTags');
        if(!!zq) {
          if(zq > 0) {
            $('.user-option .step2-xq').text(`赚得${zq}%`);
          } else {
            $('.user-option .step2-xq').text(`亏损${zq}%`);
          }
          $('.user-option li').eq(3).show(300);
        }else {
          $('.user-option li').eq(3).hide(300);
        }
        if(min && max && jzxe === '1') {
            let t_min = min;
            let t_max = max;
            $('.user-option .op-min').html(`${t_min} <span class="op-tding_fb">${tradeCoin}</span>`);
            $('.user-option .op-max').html(`${t_max} <span class="op-tding_fb">${tradeCoin}</span>`);
          $('.user-option li').eq(5).show(300);
          $('.user-option li').eq(4).hide(300);
        }
        if(step2AccuracyTags && step2AccuracyTags !== 'null') {
          if( jzxe === '2') {
            let Tags = step2AccuracyTags.split('||').join(',');
            $('.user-option .op-tding').text(Tags);
            $('.user-option .op-tding_fb').text(tradeCoin);
            $('.user-option li').eq(4).show(300);
            $('.user-option li').eq(5).hide(300);
          }
        }
      }, base.hideLoadingSpin);
        addListener();
        let type=base.getUrlParam("type");
        if(type !== "buy") {
            $(".advertise-step1-bigbigTitle .change").removeClass('sell').addClass('buy');
            $('.advertise-step1-bigbigTitle .title').html(base.getText(`卖出您的数字货币以获得利润`));
            $('.advertise-step1-bigbigTitle .text').html(`<p class="text">${base.getText(`想要获得数字货币吗？`)}<span class="change sell">${base.getText(`创建一个出价来购买数字货币`)}</span></p>`);
            tradeType = 1;
        } else {
            $(".advertise-step1-bigbigTitle .change").removeClass('buy').addClass('sell');
            $('.advertise-step1-bigbigTitle .title').html(base.getText('购买数字货币'));
            $('.advertise-step1-bigbigTitle .text').html(`<p class="text">${base.getText('想要出售数字货币吗？')}<span class="change buy">${base.getText('去出售数字货币')}</span></p>`);
            tradeType = 0;
        }
    }
    function salesCalculation() {
        let inputValue =$('#zqInput').val();
        let price = $('.step2-zq-tips .step2-za-tip-market-price .step2-zq-tip-weighter').text();
        let tipMyprice =$('.step2-zq-tips .step2-za-tip-my-price .step2-zq-tip-weighter');
        let tipRate = $('.step2-zq-tips .step2-za-tip-rate .step2-zq-tip-weighter');
        let myprice = price*(1+inputValue/100);
        tipMyprice.html(myprice.toFixed(8));
        if(inputValue !== ''){
            let value = ( Number(inputValue) + 100).toFixed(8);
            tipRate.html(value  + '%');
        }else{
            tipRate.html(0 + '%');
        }
        var amountWeight =(Number(myprice) - Number(price)).toFixed(8);
          if(amountWeight < 0){
              $('.step2-zq-tips .step2-za-tip-amount .tip').html(base.getText(`每${adverTypeObj[adverType]}一个${coinName[tradeCoin001]}，我将亏损`));
              amountWeight = (-(amountWeight))
          }else{
              $('.step2-zq-tips .step2-za-tip-amount .tip').html(base.getText(`每${adverTypeObj[adverType]}一个${coinName[tradeCoin001]}，我将赚取`));
          }
          $('.step2-zq-tips .step2-za-tip-amount .step2-zq-tip-weighter').html(amountWeight);
    }
    //step2 -计算每笔销售
  let timeout = null;
    $('#zqInput').keyup(function(){
      if(+$(this).val() > 99) {
        base.showMsg('不得超过99%，请重新输入');
          $(this).val('');
          sessionStorage.removeItem('zq');
          $('.user-step2_option li').eq(3).hide(300);
        return;
      }
      if(timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        let inputValue = +$(this).val();
        if(!!inputValue) {
          if(inputValue > 0) {
            $('.user-step2_option .step2-xq').text(`赚得${inputValue}%`);
          } else {
            $('.user-step2_option .step2-xq').text(`亏损${inputValue}%`);
          }
          $('.user-step2_option li').eq(3).show(300);
        }else {
          $('.user-step2_option li').eq(3).hide(300);
        }
        sessionStorage.setItem('zq', inputValue);
        salesCalculation();
      }, 300);
    });
    if($('#zqInput').length > 0) {
      $('#zqInput').mousewheel(stopScrollFun);
      function stopScrollFun(evt) {
        evt = evt || window.event;
        if(evt.preventDefault) {
          // Firefox  
          evt.preventDefault();
          evt.stopPropagation();
        } else {
          // IE  
          evt.cancelBubble=true;
          evt.returnValue = false;
        }
        return false;
      }
    }
  
  function accuracyTags(step2SelectedData) {
      $("#step2AccuracyTags").length && $("#step2AccuracyTags").select2({
      tags: true,                          //支持新增，默认为false
      maximumSelectionLength: 3,           //最多能够选择的个数
      multiple: true,                      //支持多选，默认为false
      data: step2TagInitData,                      //下拉框绑定的数据
      allowClear: true,                    //支持清空，默认为false
      placeholder: base.getText('请选择标签')      //提示语
    }).val(step2SelectedData).trigger('change');  //多选情况下给选中项的赋值
  }
  
  // step2 - 初始化方法
  function step2Init() {
    let optionPay = sessionStorage.getItem('optionPay');
    $('.advertise-step2-bigbigTitle .title').html(base.getText(`卖出您的数字货币以获得利润`));
    $('.advertise-step2-bigTitle .zffs').html(base.getText('支付方式'));
    $('.advertise-step2-bigTitle .tksm').html(base.getText('条款和说明'));
    $('.advertise-step2-bigTitle .llzd').html(base.getText('利润率和最低/最高金额'));
    $('.xzqds').html(`<span class="step2">Step2：</span>${base.getText('您想赚取多少利润？')}`);
    $('.advertise-step2-zq .advertise-step2-title').html(base.getText('我想要赚取'));
    $('.advertise-step2-zq .mbxs').html(base.getText('每笔销售'));
    $('.advertise-step2-zq .step2-za-tip-market-price').html(`${base.getText(`${coinName[tradeCoin001]}的当前市场为`)}<span class="step2-zq-tip-weighter"></span> <span class="step2-zq-tip-unit"> USD</span>`);
    $('.advertise-step2-zq .step2-za-tip-my-price').html(`${base.getText(`我正在以每个${coinName[tradeCoin001]}`)}<span class="step2-zq-tip-weighter"></span> <span class="step2-zq-tip-unit"> USD</span>${base.getText(`的价格${adverTypeObj[adverType]}。`)}`);
    $('.advertise-step2-zq .step2-za-tip-rate').html(`${base.getText(`我将获得${optionPay}价值的`)}<span class="step2-zq-tip-weighter"></span>`);
    $('.advertise-step2-zq .step2-za-tip-amount').html(`<span class="tip">${base.getText(`每${adverTypeObj[adverType]}一个${coinName[tradeCoin001]}，我将赚取`)}</span><span class="step2-zq-tip-weighter"></span> <span class="step2-zq-tip-unit"> USD</span>。`);
    $('.advertise-step2-jyxe .jyxe').html(`<span class="step2-title step2-jyxe-title">${base.getText('我的交易限额')}</span><span class="jzxe" data-type="1">${base.getText('使用精准限额')}</span>`);
    $('.advertise-step2-jyxe .zdjye').html(base.getText('最低交易金额'));
    $('.advertise-step2-jyxe .zgjye').html(base.getText('最高交易金额'));
    $('.advertise-step2-jyxe .jyxe-tip1').html(base.getText('借助这些限额，人们可以在最低交易金额到最高交易金额范围内与您交易。'));
    $('.advertise-step2-jyxe .jyxe-tip2').html(base.getText(`当交易开始时，等额的${coinName[tradeCoin001]}将转到托管中。例如，当50USD的交易开始时，相应金额的${coinName[tradeCoin001]}将转入托管。`));
    $('.advertise-step2-jyxe .jyxe-tip3').html(`${base.getText('出价当前未公开显示。若要使其可见，请执行以下操作： 存入')} <span class="coin_bzj"></span> ${base.getText('保证金，或者请获得验证')}`);
    $('.advertise-setp2-cancel-transcation .advertise-step2-title').html(base.getText('如果买家不在以下时间内支付'));
    $('.advertise-setp2-cancel-transcation .fz').html(base.getText('分钟'));
    $('.advertise-setp2-cancel-transcation .qxjy').html(base.getText('交易将被取消'));
    $('.advertise-setp2-cancel-transcation .step2-cencel-tip').html(base.getText('对您的出价感兴趣的人有多少时间来实际支付，如果买家未在付款窗口过期前点击“标记为已付款”，则交易将自动取消'));
    $('.xyb').html(base.getText('下一步'));
    if(!tradeCoin001) {
      base.showMsg(base.getText('请先进行第一步'));
        removeSession();
      setTimeout(() => {
        base.gohref('../trade/advertise.html');
      }, 1000);
      return;
    }
      base.showLoadingSpin();
      $.when(
        TradeCtr.getMarket(sessionStorage.getItem('tradeCoin'), tradeCoin001),
        GeneralCtr.getSysConfig('trade_validate_min_minutes'),
        GeneralCtr.getSysConfig(tradeObj[tradeCoin001]),
        GeneralCtr.getSysConfigType('trade_rule', true),
        GeneralCtr.getDictList({ parentKey: 'trade_price_type' }),
        getAdvertiseDetail()
      ).then((data1, data2, data3, data4, data5) => {
        trade_btc_bail = data4.trade_btc_bail;
        trade_usdt_bail = data4.trade_usdt_bail;
        base.hideLoadingSpin();
        let timeInput = sessionStorage.getItem('cancelTimeInput') || '';
        if(timeInput) {
          cancelTimeInput = timeInput;
        }else {
          cancelTimeInput = data2.cvalue;
        }
        $('#cancelTimeInput').val(cancelTimeInput);
        $('.step2-zq-tips .step2-za-tip-market-price .step2-zq-tip-weighter').html(data1[0].lastPrice);
        $('.step2-zq-tips .step2-zq-tip-unit ,.advertise-step2-jyxe .step2-input .step2-input-tip,.min-price .step2-input-tip').html(data1[0].referCurrency);
          salesCalculation();
        data5.map((item) => {
          item.text = item.dvalue;
          item.id = item.dvalue;
        });
        step2TagInitData = data5;
        accuracyTags(step2TagInitData);
        let feeRate = sessionStorage.getItem('feeRate');
        let tradeCoin001 = sessionStorage.getItem('tradeCoin001');
        let tradeCoin = sessionStorage.getItem('tradeCoin');
        $('.coin_bzj').text((tradeCoin001 === 'BTC' ? trade_btc_bail : trade_usdt_bail) + ' ' + tradeCoin001);
        $('.user-step2_option .option-coin').text(coinName[tradeCoin001]);
        $('.user-step2_option .option-pay').text(optionPay);
        $('.user-step2_option .option-tran').text(tradeCoin);
        $('.user-step2_option .fee').text(feeRate);
        $('.user-step2_option li').eq(0).show(300);
        $('.user-step2_option li').eq(1).show(300);
        $('.user-step2_option li').eq(2).show(300);
        let jzxe = sessionStorage.getItem('jzxe');
        let zq = sessionStorage.getItem('zq');
        let min = sessionStorage.getItem('min');
        let max = sessionStorage.getItem('max');
        let step2AccuracyTags = sessionStorage.getItem('step2AccuracyTags');
        if(jzxe) {
          if(jzxe === '2'){
            $('.jzxe').text(base.getText('使用交易金额'));
            $('.step2-min,.step2-max').hide();
            $('.step2-accuracy').show();
            $('.jzxe').attr('data-type','2');
          }else{
            $('.jzxe').text(base.getText('使用精准限额'));
            $('.step2-min,.step2-max').show();
            $('.step2-accuracy').hide();
            $('.jzxe').attr('data-type','1');
          }
        }
        if(zq) {
          $('#zqInput').val(zq);
          let price = $('.step2-zq-tips .step2-za-tip-market-price .step2-zq-tip-weighter').text();
          let myprice = price*(1 + zq / 100);
          let tipMyprice = $('.step2-zq-tips .step2-za-tip-my-price .step2-zq-tip-weighter');
          let tipRate = $('.step2-zq-tips .step2-za-tip-rate .step2-zq-tip-weighter');
          tipMyprice.html(myprice);
          tipRate.text(zq + '%');
          let amountWeight =(Number(myprice) - Number(price)).toFixed(8);
          if(amountWeight < 0){
            $('.step2-zq-tips .step2-za-tip-amount .tip').html(base.getText(`每${adverTypeObj[adverType]}一个${coinName[tradeCoin001]}，我将亏损`));
            amountWeight = (-(amountWeight))
          }else{
            $('.step2-zq-tips .step2-za-tip-amount .tip').html(base.getText(`每${adverTypeObj[adverType]}一个${coinName[tradeCoin001]}，我将赚取`));
          }
          $('.step2-zq-tips .step2-za-tip-amount .step2-zq-tip-weighter').html(amountWeight);
          if(!!zq) {
            if(zq > 0) {
              $('.user-step2_option .step2-xq').text(`赚得${zq}%`);
            } else {
              $('.user-step2_option .step2-xq').text(`亏损${zq}%`);
            }
            $('.user-step2_option li').eq(3).show(300);
          }else {
            $('.user-step2_option li').eq(3).hide(300);
          }
        }
        if(min) {
          $('#minInput').val(min);
        }
        if(max) {
          $('#maxInput').val(max)
        }
        if(min && max && jzxe === '1') {
            let t_min = min;
            let t_max = max;
            $('.user-step2_option .op-min').html(`${t_min} <span class="op-tding_fb">${tradeCoin}</span>`);
            $('.user-step2_option .op-max').html(`${t_max} <span class="op-tding_fb">${tradeCoin}</span>`);
          $('.user-step2_option li').eq(5).show(300);
          $('.user-step2_option li').eq(4).hide(300);
        }
        if(step2AccuracyTags && step2AccuracyTags !== 'null') {
          if( jzxe === '2') {
            let Tags = step2AccuracyTags.split('||');
            $('.user-step2_option .op-tding').text(Tags.join(','));
              $('.user-step2_option .op-tding_fb').text(tradeCoin);
              accuracyTags(Tags);
            $('.user-step2_option li').eq(4).show(300);
            $('.user-step2_option li').eq(5).hide(300);
          }
        }
      }, base.hideLoadingSpin);
      addListener();
      let type = base.getUrlParam('type');
      if(type === 'buy') {
        $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText(`购买数字货币`));
      }else{
        $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText(`卖出您的数字货币以获得利润`));
      }
    }
  // step3 - 初始化方法
  function step3Init() {
    setHtml();
    $('.advertise-step3-bigbigTitle .title').html(base.getText('卖出您的数字货币以获得利润'));
    $('.advertise-step3-bigTitle .zffs').html(base.getText('支付方式'));
    $('.advertise-step3-bigTitle .mjtk').html(base.getText('条款和说明'));
    $('.advertise-step3-bigTitle .llv').html(base.getText('利润率和最低/最高金额'));
    $('.nxysm').html(`<span class="step3">Step3：</span>${base.getText('您需要客户提供什么？')}`);
    $('.advertise-step3-box .advertise-step3-tags-title').html(base.getText('选择最能描述您的出价的标签'));
    $('.advertise-step3-box .step3-tip-tags').html(base.getText('添加描述您的出价条款的简要标签，例如“无需ID”、“无需收据”，最多3个标签。'));
    $('.advertise-step3-box .advertise-step3-my-tag-title').html(base.getText('您的出价标签'));
    $('.advertise-step3-box .step3-tip-my-tag').html(base.getText('任何如“立即放行”或“无需收据”等推广内容将显示在支付方式后面。'));
    $('.advertise-step3-box .advertise-step3-clause-title').html(base.getText('为买家编写您的条款'));
    $('.advertise-step3-box .step3-tip-clause').html(base.getText('在您的出价列表中公开显示。出价条款必须向用户说明一些信息，如：接受现金或亲自到银行分行，或访问一个外部网站等。这些信息并不足以完成交易，只是可以让他们知道会发生什么情况。'));
    $('.advertise-step3-box .advertise-step3-explain-title').html(base.getText('确切的交易说明'));
    $('.advertise-step3-box .step3-tip-explain').html(base.getText('一旦交易开始即显示。交易说明必须简短、情绪，并尽可能以列表形式组织。需要清晰的分布说明。较长的文本请放至底部。'));
    $('.advertise-step3-target-area-title').html(base.getText('目标国家/地区'));
    $('.advertise-step3-target-area .gjdq').html(base.getText('选择要作为目标的国家/地区，此市场将产生额外流量。'));
    $('.advertise-step3-target-area .jg').html(base.getText('警告：对不符合的出价滥用此功能可能会导致账户被封停。'));
    $('.advertise-step3-condition .advertise-step3-condition-title').html(base.getText('验证'));
    $('.advertise-step3-condition .dzyj').html(`<i class="icon-step3-checked" data-code="email"></i>${base.getText('需要交易伙伴验证过他们的电子邮件')}`);
    $('.advertise-step3-condition .dh').html(`<i class="icon-step3-checked" data-code="mobile"></i>${base.getText('需要交易伙伴验证过他们的电话')}`);
    $('.advertise-step3-condition .sf').html(`<i class="icon-step3-checked" data-code="id"></i>${base.getText('需要交易伙伴验证过他们的身份')}`);
    $('.advertise-step3-visible-title').html(base.getText('可见性'));
    $('.visible-checkbox-item').html(`<i class="icon-step3-checked"></i>${base.getText('仅向受信任列表中的用户显示此出价')}`);
    $('.advertise-step3-min-trade-num-title').html(base.getText('需要的最小交易次数'));
    $('.advertise-step3-min-trade-num .step2-cencel-tip').html(base.getText('只有至少拥有这么多次交易的用户才能看到您的出价'));
    $('.advertise-step3-min-trade-num .step3-input-tip').html(base.getText('过去的交易'));
    $('.advertise-step3-area-limit-title').html(base.getText('国家/地区限制'));
    $('.advertise-step3-area-limit .step2-cencel-tip').html(base.getText('让您的出价对正从您在下面定义的国家/地区浏览的用户可见隐藏'));
    $('.advertise-step3-area-limit .byxgj').html(`<i class="icon-step3-checked" data-code="notAllow"></i>${base.getText('不允许的国家/地区')}`);
    $('.advertise-step3-area-limit .yxgj').html(`<i class="icon-step3-checked" data-code="allow"></i>${base.getText('允许的国家/地区')}`);
    $('.advertise-step3-vpn .advertise-step3-vpn-title').html(base.getText('代理/VPN 限制'));
    $('.advertise-step3-vpn .advertise-step3-vpn-title').html(`<i class="icon-step3-checked" data-code="0"></i>${base.getText('禁止VPN、Tor、代理和其他匿名用户')}`);
    
    base.showLoadingSpin();
    $.when(
      TradeCtr.getTagsList({ status: 1 }),
      TradeCtr.getCountryList({ status: 1 })
    ).then((data1, data2) => {
      base.hideLoadingSpin();
      data1.map((item) => {
        item.text = item.name;
      });
      step3TagInitData = data1;
      let step3SelectedData = [];
      select2WithData(step3SelectedData);

      let step3CountryListHtml = '';
      data2.map((item, i) => {
        step3CountryListHtml += buildStep3CountryListHtml(item);
      });
      $('#targetArea').html(step3CountryListHtml);
        getAdvertiseDetail();
      let optionPay = sessionStorage.getItem('optionPay');
      let feeRate = sessionStorage.getItem('feeRate');
      let step3TagsDataInit = sessionStorage.getItem('step3TagsData');
      let myTagInput = sessionStorage.getItem('myTagInput');
      let clauseTextarea = sessionStorage.getItem('clauseTextarea');
      let explainTextarea = sessionStorage.getItem('explainTextarea');
      if(step3TagsDataInit) {
        $('#step3Tags').select2("val", [step3TagsDataInit.split('||')]);
      }
      if(myTagInput) {
        $('#myTagInput').val(myTagInput);
      }
      if(clauseTextarea) {
        $('#clauseTextarea').val(clauseTextarea);
      }
      if(explainTextarea) {
        $('#explainTextarea').val(explainTextarea);
      }
      let tradeCoin001Init = sessionStorage.getItem('tradeCoin001');
      if(tradeCoin001Init) {
        $('.user-step3_option .option-coin').text(coinName[tradeCoin001Init]);
        $('.user-step3_option li').eq(0).show();
      }
      if(optionPay) {
        $('.user-step3_option .option-pay').text(optionPay);
        $('.user-step3_option .option-tran').text(tradeCoin);
        $('.user-step3_option li').eq(1).show();
      }
      if(feeRate) {
        $('.user-step3_option .fee').text(feeRate);
        $('.user-step3_option li').eq(2).show();
      }
      let jzxe = sessionStorage.getItem('jzxe');
      let zq = sessionStorage.getItem('zq');
      let min = sessionStorage.getItem('min');
      let max = sessionStorage.getItem('max');
      let step2AccuracyTags = sessionStorage.getItem('step2AccuracyTags');
      if(!!zq) {
        if(zq > 0) {
          $('.user-step3_option .step2-xq').text(`赚得${zq}%`);
        } else {
          $('.user-step3_option .step2-xq').text(`亏损${zq}%`);
        }
        $('.user-step3_option li').eq(3).show(300);
      }else {
        $('.user-step3_option li').eq(3).hide(300);
      }
      if(min && max && jzxe === '1') {
          let t_min = min;
          let t_max = max;
          $('.user-step3_option .op-min').html(`${t_min} <span class="op-tding_fb">${tradeCoin}</span>`);
          $('.user-step3_option .op-max').html(`${t_max} <span class="op-tding_fb">${tradeCoin}</span>`);
        $('.user-step3_option li').eq(5).show(300);
        $('.user-step3_option li').eq(4).hide(300);
      }
      if(step2AccuracyTags && step2AccuracyTags !== 'null') {
        if( jzxe === '2') {
            let Tags = step2AccuracyTags.split('||');
            accuracyTags(Tags);
          $('.user-step3_option .op-tding').text(Tags);
            $('.user-step3_option .op-tding_fb').text(tradeCoin);
          $('.user-step3_option li').eq(4).show(300);
          $('.user-step3_option li').eq(5).hide(300);
        }
      }
    }, base.hideLoadingSpin);
    addListener();
    let type = base.getUrlParam('type');
    if(type === 'buy') {
      $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText(`购买数字货币`));
    }else {
      $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText(`卖出您的数字货币以获得利润`));
    }
  }
  function select2WithData(step3SelectedData) {
    $("#step3Tags").select2({
      tags: true,                          //支持新增，默认为false
      maximumSelectionLength: 3,           //最多能够选择的个数
      multiple: true,                      //支持多选，默认为false
      data: step3TagInitData,                      //下拉框绑定的数据
      allowClear: true,                    //支持清空，默认为false
      placeholder: base.getText('请选择标签')      //提示语
    }).val(step3SelectedData).trigger('change');  //多选情况下给选中项的赋值
  }
  // step1-构建顶部tab的dom结构
  function buildTabHtml(data, i) {
      let classHtml;
      if(i === 0) {
        classHtml = 'tab-item active';
      } else {
        classHtml = 'tab-item'
      }
    return `<span class="${classHtml}" data-index=${i} data-dkey=${data.dkey}>${data.dvalue}<i class="active-triangle"></i></span>`
  }
  
  function coinListHtml(data) {
        return `<div class="advertise-coin-item" data-symbol=${data.symbol}>
                    <span>${data.symbol}</span><i class="icon_${data.symbol} icon-step1-unselected"></i>
                </div>`;
  }

  // step1-构建交易货币select的dom结构
  function buildStep1SelectHtml(data, i) {
    step1SelectName.push({
      name: data.name,
      code: data.simpleName
    });
    return `<option class="trade-item" value=${data.name} data-code=${data.simpleName}>${data.name}</option>`
  }

  // 构建list的dom结构
  function buildListHtml(data, i) {
    payList.push({
      name: data.name,
      code: data.code
    });
    return `<div class="advertise-payType-item ${data.code}" data-code=${data.code}>
                    <span>${data.name}</span><i class="icon icon-step1-unselected"></i>
                </div>`
  }
  
  function feeFunction() {
      let feeRateData = rateList.filter(item => item.paymentCode === paySubType && item.symbol === tradeCoin001);
      let feeRate = '';
      if(feeRateData.length > 0) {
          feeRate = feeRateData[0].feeRate * 100;
          $('.user-option .fee').text(feeRate);
          sessionStorage.setItem('feeRate', feeRate);
          $('.user-option .fee').text(feeRate);
      }else {
          $('.user-option .fee').text(defaultFee);
          sessionStorage.setItem('feeRate', defaultFee);
          $('.user-option .fee').text(defaultFee);
      }
  }
  
  // step3 - 构建目标国家/地区list
  function buildStep3CountryListHtml(data) {
    return `<option value=${data.code}>${data.chineseName}</option>`
  }

    // 列表查付款方式
    function getPayTypeList(dkey) {
      let config;
      if(dkey || dkey === 0) {
        config = {type: dkey, status: 1};
      } else {
        config = {type: payBigType, name: paySearch, status: 1}
      }
    return TradeCtr.adverPayTypeList(config).then((res) => {
        let listHtml = '';
        res.forEach((item, i) => {
          listHtml += buildListHtml(item, i)
        });
        $(".advertise-payType-item-container").html(listHtml);
        let paySubTypeInit = sessionStorage.getItem('paySubType');
        if(paySubTypeInit) {
          $('.advertise-payType-item-container .' + paySubTypeInit).addClass('on');
          paySubType = paySubTypeInit;
          let optionPay = $('.advertise-payType-item-container .' + paySubTypeInit).children('span').text();
          sessionStorage.setItem('optionPay', optionPay);
          $('.user-option .option-pay').text(optionPay);
            feeFunction();
          if($(".advertise-payType-item").length > 0){
              $(".advertise-payType-item").each(function(){
                  if($(this).attr("data-code") === paySubType){
                      $(this).addClass("on").siblings().removeClass("on");
                  }
              });
          }
          $('.user-option li').eq(1).show(300);
          $('.user-option li').eq(2).show(300);
        }
      })
    }

    function setHtml() {
        $('.fy_gjsz').html(base.getText('高级选项'));
        $('.fy_xsgjsz').html(base.getText('高级选项') + '...');
        $('.ljfb').html(base.getText('立即发布'));
        $('.advertise-out-container .advertise-step1-bigbigTitle .title').html(base.getText(`卖出您的数字货币以获得利润`));
        $('.advertise-out-container .advertise-step1-bigTitle .zffs').html(base.getText('支付方式'));
        $('.advertise-out-container .advertise-step1-bigTitle .mjtk').html(base.getText('条款和说明'));
        $('.advertise-out-container .advertise-step1-bigTitle .llv').html(base.getText('利润率和最低/最高金额'));
        $('.advertise-out-container .advertise-step1-bigTitle .ndkh').html(`<span class="step1">Step1：</span>${base.getText('您的客户将以哪种方式向您付款？')}`);
        $('.advertise-out-container .advertise-step1-bigbigTitle .text').html(`${base.getText(`想要获得数字货币吗？`)}<span class="change sell"> ${base.getText(`创建一个出价来购买数字货币`)}</span>`);
        $('.advertise-out-container #tradeCurrency').attr('placeHolder', base.getText('在所有支付方式中搜索'));
        $('.advertise-out-container .advertise-step1-title').html(base.getText('支付方式'));
        $('.advertise-out-container .advertise-payType-title').html(base.getText('选择下面的支付方式'));
        $('.advertise-out-container .advertise-step1-title').html(base.getText('我将以如下法币交易'));
        $('.advertise-out-container .step1-my-trade-coin-tips').html(base.getText(`您的出价将以选定法币${adverTypeObj[adverType]}。例如，如果您选择美元，则您的出价将对希望以美元购买的所有人可见。`));
        $('.advertise-out-container .advertise-step1-btn').html(base.getText('下一步'));
    }

    //获取广告详情
    function getAdvertiseDetail() {
      if(!code) {
        return;
      }
        return TradeCtr.getAdvertiseDetail(code).then((data) => {
            TradeCtr.getPayTypeDetail(data.payType).then(data => {
                let type = data.type;
                sessionStorage.setItem('payBigType', type);
            });
            pay = data.tradeCurrency;
            if(pay == 'CNY'){
                $('.m-type').text('CNY');
            }else{
                $('.m-type').text('USD');
            }
            status = data.status;
            data.premiumRate = (data.premiumRate * 100).toFixed(2);
            data.minTrade = (Math.floor(parseFloat(data.minTrade) * 100) / 100).toFixed(2);
            data.maxTrade = (Math.floor(parseFloat(data.maxTrade) * 100) / 100).toFixed(2);
            mid = data.marketPrice;
            let tradeCoin = data.tradeCoin;
            let tradeCoin001Init = sessionStorage.getItem('tradeCoin001') || '';
            let tradeCurrencyInit = sessionStorage.getItem('tradeCoin') || '';
            if($('.advertise-coin-container').length > 0) {
              tradeCoin001 = tradeCoin001Init ? tradeCoin001Init : tradeCoin;
              let tradeCurrency = tradeCurrencyInit ? tradeCurrencyInit : data.tradeCurrency;
              $(`.icon_${tradeCoin001}`).addClass('icon-step1-selected');
              //币种
              if(tradeCurrency === 'CNY'){
                $("#tradeCoin").val(base.getText('人民币'))
              }else{
                $("#tradeCoin").val(base.getText('美元'))
              }
              sessionStorage.setItem('tradeCoin', tradeCurrency);
              sessionStorage.setItem('tradeCoin001', tradeCoin001);
            }
            data.totalCount = base.formatMoney(data.totalCountString, '', tradeCoin);
            //广告类型
            if (data.tradeType === '1') {
                $(".trade-type .item").eq(0).addClass("on").siblings('.item').removeClass("on").addClass("hidden")
            } else {
                $(".trade-type .item").eq(1).addClass("on").siblings('.item').removeClass("on").addClass("hidden")
            }
            // $(".trade-type .item.on .icon-check").click();

            $("#form-wrapper").setForm(data);
            paySubType = sessionStorage.getItem('paySubType') || data.payType;
            sessionStorage.setItem('paySubType', paySubType);
            $("#coin").text($("#tradeCoin").val());
            $("#price").attr("data-coin", $("#tradeCoin").val());
            $("#price").val((Math.floor(data.truePrice * 100) / 100).toFixed(2));
            let type =base.getUrlParam('type');
            if(type == 'sell') {
                $('.advertise-step1-bigbigTitle .text').removeClass('buy').addClass('sell');
                $('.advertise-step1-bigbigTitle .title').html(base.getText(`卖出您的数字货币以获得利润`));
                $('.advertise-step1-bigbigTitle .text').html(`<p class="text">${base.getText(`想要获得数字货币吗？`)}<span class="change sell">${base.getText(`创建一个出价来购买数字货币`)}</span></p>`);
                tradeType = 1;
            } else {
                $('.advertise-step1-bigbigTitle .text').removeClass('sell').addClass('buy');
                $('.advertise-step1-bigbigTitle .title').html(base.getText(`购买数字货币`));
                $('.advertise-step1-bigbigTitle .text').html(`<p class="text">${base.getText(`想要出售数字货币吗？`)}<span class="change buy">${base.getText(`去出售数字货币`)}</span></p>`);
                tradeType = 0;
            }

            //step2
            $("#zqInput").val(data.premiumRate);
            salesCalculation();
            let jzxe = sessionStorage.getItem('jzxe');
            if(jzxe) {
              if(jzxe === '2') {
                  $('.jzxe').text(base.getText('使用交易金额'));
                  $('.step2-min,.step2-max').hide();
                  $('.step2-accuracy').show();
                  let step2AccuracyTags = sessionStorage.getItem('step2AccuracyTags') || '';
                  let fixTrade = '';
                  if(step2AccuracyTags) {
                      fixTrade = step2AccuracyTags.split('||');
                  }else {
                      step2AccuracyTags = data.fixTrade;
                      fixTrade = step2AccuracyTags.split('||');
                      sessionStorage.setItem('step2AccuracyTags', data.fixTrade);
                  }
                  accuracyTags(fixTrade);
                  $("#step2AccuracyTags").length && $("#step2AccuracyTags").select2("val", [fixTrade]);
                  $('.jzxe').attr('data-type','2');
              }else {
                  let min = sessionStorage.getItem('min');
                  let max = sessionStorage.getItem('max');
                  $('.jzxe').text(base.getText('使用精准限额'));
                  $('.step2-min,.step2-max').show();
                  $('.step2-accuracy').hide();
                  $("#minInput").val(min);
                  $("#maxInput").val(max);
                  $('.jzxe').attr('data-type','1');
              }
            }else {
                if(data.fixTrade !== ''){
                    $('.jzxe').text(base.getText('使用交易金额'));
                    $('.step2-min,.step2-max').hide();
                    $('.step2-accuracy').show();
                    var fixTrade = data.fixTrade;
                    fixTrade = fixTrade.split('||');
                    accuracyTags(fixTrade);
                    $("#step2AccuracyTags").length && $("#step2AccuracyTags").select2("val", [fixTrade]);
                    $('.jzxe').attr('data-type','2');
                    sessionStorage.setItem('jzxe', '2');
                    sessionStorage.setItem('step2AccuracyTags', data.fixTrade);
                }else{
                    $('.jzxe').text(base.getText('使用精准限额'));
                    $('.step2-min,.step2-max').show();
                    $('.step2-accuracy').hide();
                    $("#minInput").val(data.minTrade);
                    $("#maxInput").val(data.maxTrade);
                    $('.jzxe').attr('data-type','1');
                    sessionStorage.setItem('jzxe', '1');
                    sessionStorage.setItem('min', data.minTrade);
                    sessionStorage.setItem('max', data.maxTrade);
                }
            }
            let cancelTimeInput = sessionStorage.getItem('cancelTimeInput') || '';
            if(cancelTimeInput) {
                $("#cancelTimeInput").val(cancelTimeInput);
            }else {
                $("#cancelTimeInput").val(data.payLimit);
            }
            //step3
            let step3TagsData = sessionStorage.getItem('step3TagsData') || '';
            let platTag = '';
            if(step3TagsData) {
                platTag = step3TagsData.split('||');
                $("#step3Tags").length > 0 && $("#step3Tags").select2("val", [platTag]);
            }else {
                platTag = data.platTag.split('||');
                sessionStorage.setItem('step3TagsData', data.platTag);
            }
            $("#step3Tags").length > 0 && $("#step3Tags").select2("val", [platTag]);
          let myTagInput = sessionStorage.getItem('myTagInput') || '';
          let clauseTextarea = sessionStorage.getItem('clauseTextarea') || '';
          let explainTextarea = sessionStorage.getItem('explainTextarea') || '';
          if(myTagInput) {
              $("#myTagInput").val(myTagInput);
          }else {
              $("#myTagInput").val(data.customTag);
              sessionStorage.setItem('myTagInput', data.customTag);
          }
          if(clauseTextarea) {
              $("#clauseTextarea").val(clauseTextarea);
          }else {
              $("#clauseTextarea").val(data.item);
              sessionStorage.setItem('clauseTextarea', data.item);
          };
          if(explainTextarea) {
              $("#explainTextarea").val(explainTextarea);
          }else {
              $("#explainTextarea").val(data.leaveMessage);
              sessionStorage.setItem('explainTextarea', data.leaveMessage);
          }
            //正式
            //账户余额
            $(".accountLeftCountString").text($(".accountLeftCountString").attr('data-amount'));
            //是否仅粉丝
            if (data.onlyTrust == '1') {
                $("#onlyTrust").addClass("on")
            } else {
                $("#onlyTrust").removeClass("on")
            }

            //开放时间
            if (data.displayTime.length && data.displayTime.length > 0) { //自定义
                $(".time-type .item").eq(1).addClass("on").siblings(".item").removeClass("on");
                $("#timeWrap").removeClass("hide");

                $("#timeWrap .time-item:nth-of-type(1) .startTime").val(data.displayTime[0].startTime);
                $("#timeWrap .time-item:nth-of-type(1) .endTime").val(data.displayTime[0].endTime);
                $("#timeWrap .time-item:nth-of-type(2) .startTime").val(data.displayTime[1].startTime);
                $("#timeWrap .time-item:nth-of-type(2) .endTime").val(data.displayTime[1].endTime);
                $("#timeWrap .time-item:nth-of-type(3) .startTime").val(data.displayTime[2].startTime);
                $("#timeWrap .time-item:nth-of-type(3) .endTime").val(data.displayTime[2].endTime);
                $("#timeWrap .time-item:nth-of-type(4) .startTime").val(data.displayTime[3].startTime);
                $("#timeWrap .time-item:nth-of-type(4) .endTime").val(data.displayTime[3].endTime);
                $("#timeWrap .time-item:nth-of-type(5) .startTime").val(data.displayTime[4].startTime);
                $("#timeWrap .time-item:nth-of-type(5) .endTime").val(data.displayTime[4].endTime);
                $("#timeWrap .time-item:nth-of-type(6) .startTime").val(data.displayTime[5].startTime);
                $("#timeWrap .time-item:nth-of-type(6) .endTime").val(data.displayTime[5].endTime);
                $("#timeWrap .time-item:nth-of-type(7) .startTime").val(data.displayTime[6].startTime);
                $("#timeWrap .time-item:nth-of-type(7) .endTime").val(data.displayTime[6].endTime);

            } else { // 任何时候
                $(".time-type .item").eq(0).addClass("on").siblings(".item").removeClass("on");
                $("#timeWrap").addClass("hide")
            }

            if (data.status == "1") {
                $("#doDownBtn").removeClass("hidden")
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    //获取广告说明 type = buy ,sell
    function getExplain(type) {
        var param = '';
        if (type == 'buy') {
            param = 'buy_ads_hint'
        } else if (type == 'sell') {
            param = 'sell_ads_hint'
        }
        if(document.getElementById("form-wrapper")){
            document.getElementById("form-wrapper").reset();
        }
        $("#price").val(mid);

        return GeneralCtr.getSysConfigType(param, true).then((data) => {
            $("#displayTimeExp").html(data['displayTime'+langText]);
            $("#maxTradeExp").html(data['maxTrade'+langText])
            $("#minTradeExp").html(data['minTrade'+langText])
            $("#payLimitExp").html(data['payLimit'+langText])
            $("#payTypeExp").html(data['payType'+langText])
            $("#premiumRateExp").html(data['premiumRate'+langText])
            $("#priceExp").html(data['price'+langText]);
            if (type == 'buy') {
                $("#protectPriceExp").siblings('.txt').text(base.getText('最高价格') + '：');
                $("#protectPrice").attr('placeholder', base.getText('广告最高可成交的价格'));
                $("#totalCountExp").siblings('.txt').text(base.getText('购买总量') + '：');
                $("#totalCount").attr('placeholder', base.getText('请输入购买币的总量'));
            } else if (type == 'sell') {
                $("#protectPriceExp").siblings('.txt').text(base.getText('最低价格') + '：');
                $("#protectPrice").attr('placeholder', base.getText('广告最低可成交的价格'));
                $("#totalCountExp").siblings('.txt').text(base.getText('出售总量') + '：');
                $("#totalCount").attr('placeholder', base.getText('请输入售卖币的总量'));
              $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText(`卖出您的数字货币以获得利润`));
            }

            $("#protectPriceExp").html(data['protectPrice'+langText]);
            $("#totalCountExp").html(data['totalCount'+langText]);
            $("#trustExp").html(data['trust'+langText]);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    // 发布广告
    function publishAdvertising() {
        if(!$('#step3Tags').val()) {
          base.showMsg(base.getText('请选择标签'));
          return;
        }
        // if(!$('#myTagInput').val()) {
        //   base.showMsg(base.getText('请填写自定义标签'));
        //   return;
        // }
        if(!$('#clauseTextarea').val()) {
          base.showMsg(base.getText('请填写条款'));
          return;
        }
        if(!$('#explainTextarea').val()) {
          base.showMsg(base.getText('请填写交易说明'));
          return;
        }
        base.showLoadingSpin();
        let platTag = $('#step3Tags').val().join('||');
        let step2AccuracyTags = sessionStorage.getItem('step2AccuracyTags');
        step2AccuracyTags = step2AccuracyTags.split(',').join('||').toString();
        if(step2AccuracyTags === 'null'){
            step2AccuracyTags = '';
        }
        return TradeCtr.submitAdvertise({
          allowCountry: targetArea,
          fixTrade:step2AccuracyTags || undefined,
          customTag: $('#myTagInput').val(),
          isValidateEmail: step3ConditionConfig.email,
          isValidateIdentity: step3ConditionConfig.id,
          isValidateTelephone: step3ConditionConfig.mobile,
          item: $('#clauseTextarea').val(),
          leaveMessage: $('#explainTextarea').val(),
          maxTrade:  Number(sessionStorage.getItem('max')) || undefined,
          minTrade:  Number(sessionStorage.getItem('min')) || undefined,
          notAllowCountry: step3AreaLimit,
          onlyTrust: 0,
          payLimit: sessionStorage.getItem('cancelTime'),
          payType: sessionStorage.getItem('paySubType'),
          platTag: platTag,
          premiumRate: sessionStorage.getItem('zq') / 100,
          targetCountry: $('#targetArea').val(),
          tradeCurrency: sessionStorage.getItem('tradeCoin'),
          tradeType: Number(sessionStorage.getItem('tradeType')),
          tradeCoin: sessionStorage.getItem('tradeCoin001'),
          isAllowProxy: isAllowProxy || 1
        }).then(() => {
          base.showMsg(base.getText('操作成功'));
            let tType = sessionStorage.getItem('tradeType');
            removeSession();
          if (tType === '0') {
              base.gohref('../order/order-list.html?coin=' + coin + '&adverType=BUY&mod=gg');
          } else {
              base.gohref('../order/order-list.html?coin=' + coin + '&adverType=SELL&mod=gg');
          }
          base.showLoadingSpin();
        }, base.hideLoadingSpin);
      }

      let tag3Time = '';
    function addListener() {
      $('#zqInput').change(function() {
        if($(this).val()) {
          sessionStorage.setItem('zq', $(this).val());
        }
      });
      $('#minInput').change(function() {
        if($(this).val()) {
            sessionStorage.setItem('min', $(this).val());
            $('.user-step2_option .op-min').html(`${$(this).val()} <span class="op-tding_fb">${tradeCoin}</span>`);
            $('.user-step2_option li').eq(5).show(300);
            $('.user-step2_option li').eq(4).hide(300);
        }
      });
      $('#maxInput').change(function() {
        if($(this).val()) {
            sessionStorage.setItem('max', $(this).val());
            $('.user-step2_option .op-max').html(`${$(this).val()} <span class="op-tding_fb">${tradeCoin}</span>`);
            $('.user-step2_option li').eq(5).show(300);
            $('.user-step2_option li').eq(4).hide(300);
        }
      });
      $("#myTagInput").change(function() {
        if($(this).val()) {
          sessionStorage.setItem('myTagInput', $(this).val());
        }
      });
      $('#step2AccuracyTags').change(function() {
        if(!!$(this).val()) {
            let step2Tags = $(this).val().join('||');
            sessionStorage.setItem('step2AccuracyTags', step2Tags);
            let tags = step2Tags.split('||').join(',');
            $('.user-step2_option .op-tding').text(tags);
            $('.user-step2_option .op-tding_fb').text(tradeCoin);
            $('.user-step2_option li').eq(5).hide(300);
            $('.user-step2_option li').eq(4).show(300);
        }
      });
      $('#cancelTimeInput').change(function() {
          if($(this).val()) {
              sessionStorage.setItem('cancelTimeInput', $(this).val());
          }
      });
      $("#clauseTextarea").change(function() {
        if($(this).val()) {
          sessionStorage.setItem('clauseTextarea', $(this).val());
        }
      });
      $("#explainTextarea").change(function() {
        if($(this).val()) {
          sessionStorage.setItem('explainTextarea', $(this).val());
        }
      });
        $("#step3Tags").change(function() {
          if($(this).val()) {
            step3TagsData = $(this).val().join('||');
          }
          if(tag3Time) {
            clearTimeout(tag3Time);
          }
          tag3Time = setTimeout(() => {
            sessionStorage.setItem('step3TagsData', step3TagsData);
          }, 500);
        });
        $('.advertise-coin-container').on('click', '.advertise-coin-item', function(){
          $(this).children('i').addClass('icon-step1-selected');
          $(this).siblings().children('i').removeClass('icon-step1-selected');
          tradeCoin001 = $(this).attr('data-symbol');
          sessionStorage.setItem('tradeCoin001', tradeCoin001);
          $('.user-option li').eq(0).show(300);
          $('.user-option .option-coin').text(coinName[tradeCoin001]);
          feeFunction();
        });
        //選擇切換-点击
        $(".trade-type .icon-check").click(function() {
            var _this = $(this);
            base.showLoadingSpin();
            //在线出售
            if (_this.parent(".item").index() == '0') {
                $(".accountCount").removeClass("hidden");
                getExplain('sell')
                    //在线购买
            } else if (_this.parent(".item").index() == '1') {
                $(".accountCount").addClass("hidden");
                getExplain('buy');
                $('.num-go').css('left', '50%');
                $('.yj-num').val('0.00');
            }
            _this.parent(".item").addClass("on").siblings(".item").removeClass("on");
        })

        //受信任-点击
        $("#onlyTrust").click(function() {
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
            } else {
                $(this).addClass("on");
            }
        })

        //開放時間選擇-点击
        $(".time-type .icon-check").click(function() {
            var _this = $(this);
            _this.parent(".item").addClass("on").siblings(".item").removeClass("on");
            if (_this.parent(".item").hasClass("all")) {
                $("#timeWrap").addClass("hide")
            } else {
                $("#timeWrap").removeClass("hide")
            }
        })

        //显示高级设置 - 点击
        $(".advertise-hidden").click(function() {
            var _this = $(this);
            if (_this.hasClass("hide")) {
                $(".advertise-set .set-wrap").removeClass("hidden");
                _this.removeClass("hide");
                _this.text(base.getText('隐藏高级设置') + "...")
            } else {
                $(".advertise-set .set-wrap").addClass("hidden");
                _this.text(base.getText('显示高级设置') + "...");
                _this.addClass("hide")
            }
        });


        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                "truePrice": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "premiumRate": {
                    required: true,
                    number: true,
                    tofixed2: true,
                    range: [-99.99, 99.99]
                },
                "protectPrice": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "minTrade": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "maxTrade": {
                    required: true,
                    number: true,
                    amountCny: true
                },
                "totalCount": {
                    required: true,
                    number: true,
                    amountEth: true
                },
                "payType": {
                    required: true,
                },
                "payLimit": {
                    required: true,
                },
                "leaveMessage": {
                    required: true,
                },
            },
            onkeyup: false
        })

        $('.yj-num').keyup(function(){//(parWidth * data.premiumRate) / 100;
            let leftValue = parseFloat($(".yj-num").val());
            if($(".yj-num").val() != '-' && $(".yj-num").val().length == 1){
                if(isNaN(leftValue)){
                    base.showMsg(base.getText('请输入数字'));
                }
                return;
            }
            if($(".yj-num").val() == ''){
                $(".yj-num").val('0');
                leftValue = 0;
            }
            if(leftValue > 50){
                $(".yj-num").val('50');
                leftValue = 50;
            }
            if(leftValue < -50){
                $(".yj-num").val('-50');
                leftValue = -50;
            }
            let parWidth = $('.num-huadtiao').width();
            jdLeft = (parWidth * leftValue) / 100;
            isKup = false;
            let jdValue = (mid * (1 + (leftValue / 100))).toFixed(2);
            let ccWidth = 50 / $('.num-huadtiao').width();
            $("#price").val(jdValue);
            $('.num-go').css({
                left: (50 + leftValue - ccWidth) + '%'
            });
        });

      // step1 - 下一步按钮点击事件
      $('.advertise-step1-btn').on('click', () => {
          tradeCoin001 = sessionStorage.getItem('tradeCoin001');
          paySubType = sessionStorage.getItem('paySubType');
        if(!tradeCoin001) {
          base.showMsg(base.getText('请选择币种'));
          return;
        }
        if(!paySubType) {
          base.showMsg(base.getText('请选择一种支付方式'));
          return;
        }
        sessionStorage.setItem('payBigType', payBigType);
        sessionStorage.setItem('paySubType', paySubType);
        sessionStorage.setItem('tradeType', tradeType);
        let type = tradeType === 1 ? 'sell' : 'buy';
        if(code != ''){
            base.gohref('../trade/advertise-step2.html?code='+code+'&coin='+coin+'&type='+type);
        }else{
            base.gohref('../trade/advertise-step2.html?type='+type);
        }
      });

      // step2 - 下一步按钮点击事件
      $('.xyb').on('click', () => {
        if(!$('#zqInput').val() ||  !$('#cancelTimeInput').val()) {
          base.showMsg(base.getText('请填写所有信息'));
          return;
        }
        if(+$('#cancelTimeInput').val() < +cancelTimeInput) {
          base.showMsg(`${base.getText('请填写大于')}${cancelTimeInput}${base.getText('的时间')}`);
          return;
        }
        if($('.jzxe').attr('data-type') == 1){
            if(!$('#minInput').val() || !$('#maxInput').val()){
                base.showMsg(base.getText('请填写所有信息'));
                return;
            }
            if($("#minInput").val() <= 0) {
                base.showMsg(base.getText('单笔最小交易额必须大于0'));
                return;
            }
            if(Number($("#minInput").val()) >= Number($("#maxInput").val())) {
                base.showMsg(base.getText('最低不能大于最高交易额'));
                return;
            }
        }else {
            if(!$("#step2AccuracyTags").select2("val")){
                base.showMsg(base.getText('请填写所有信息'));
                return
            }
        }
          if($('.jzxe').attr('data-type') == 1){
              sessionStorage.setItem('step2AccuracyTags', '');
          }else{
              $('#minInput').val('');
              $('#maxInput').val('');
          }
        sessionStorage.setItem('jzxe', $('.jzxe').attr('data-type'));
        sessionStorage.setItem('zq', $('#zqInput').val());
        sessionStorage.setItem('min', $('#minInput').val());
        sessionStorage.setItem('max', $('#maxInput').val());
        let Tags = $('#step2AccuracyTags').val();
        if(Tags) {
            sessionStorage.setItem('step2AccuracyTags', Tags.join('||'));
        }else {
            sessionStorage.setItem('step2AccuracyTags', '');
        }
        sessionStorage.setItem('cancelTime', $('#cancelTimeInput').val());
        let type = +sessionStorage.getItem('tradeType') === 1 ? 'sell' : 'buy';
          if(code != ''){
              base.gohref('../trade/advertise-step3.html?code='+code+'&coin='+coin+'&type='+type);
          }else{
              base.gohref('../trade/advertise-step3.html?type='+type);
          }
      });
      // step2 上一步
      $('.step2-btns .syb').click(function() {
        if(code !== '') {
          base.gohref('../trade/advertise.html?' + href);
        }else {
          base.gohref('../trade/advertise.html');
        }
      });

      // step3 - 立即发布按钮点击事件
      $('.ljfb').on('click', () => {
        if(code !== ''){
            editAdvertise();//编辑广告
        }else{
            publishAdvertising();//发布广告
        }
      });
      // step3 上一步
      $('.btnWrap .syb').click(function() {
        if(code !== '') {
          base.gohref('../trade/advertise-step2.html?' + href);
        }else {
          base.gohref('../trade/advertise-step2.html');
        }
      });

      // step1 - 搜索框
      $("#tradeCurrency").bind('input propertychange',function(){
        paySearch = $('#tradeCurrency').val();
        getPayTypeList()
      });
      $('.icon-search').click(function () {
          paySearch = $('#tradeCurrency').val();
          getPayTypeList()
      })

      // step1-tab点击切换事件
      $(".advertise-step1-tabs").on("click", ".tab-item", function (e){
        let target = e.target;
        $(target).addClass('active').siblings().removeClass('active');
        payBigType = $(target).attr('data-dkey');
        sessionStorage.setItem('payBigType', payBigType);
        $('.user-option li').eq(1).hide(300);
        sessionStorage.removeItem('paySubType');
        getPayTypeList($(target).attr('data-dkey'));
      });

      // step1-list点击事件
      $('.advertise-payType-item-container').on('click', '.advertise-payType-item', (e) => {
            let target = e.target;
            paySubType = $(target).attr('data-code');
            sessionStorage.setItem('paySubType', paySubType);
            sessionStorage.setItem('optionPay', $(target).children('span').text());
          feeFunction();
        $('.user-option li').eq(1).show(300);
        $('.user-option li').eq(2).show(300);
        $('.user-option .option-pay').text($(target).children('span').text());
        $(target).addClass('on').siblings().removeClass('on');
      });
        $('.advertise-payType-item-container').on('click', '.icon-step1-unselected', (e) => {
          e.stopPropagation();
            let target = e.target;
            paySubType = $(target).parent().attr('data-code');
            sessionStorage.setItem('paySubType', paySubType);
            feeFunction();
            $('.user-option li').eq(1).show(300);
            $('.user-option li').eq(2).show(300);
            $('.user-option .option-pay').text($(target).siblings('span').text());
            $(target).parents('.advertise-payType-item').addClass('on').siblings('.advertise-payType-item').removeClass('on');
        });
      // step1-select点击事件
      $('#tradeCoin').on('change', (e) => {
        tradeCoin = $('#tradeCoin').find('option:selected').attr('data-code');
          $('.user-option .op-tding_fb').text(tradeCoin);
        $('.user-option .option-tran').text(tradeCoin);
        sessionStorage.setItem('tradeCoin', tradeCoin);
      });

      // step3-目标国家select点击事件
      $('#targetArea').on('change', (e) => {
        targetArea = $('#targetArea').find('option:selected').attr('value');
      });

      // step3 - 验证
      $('.step3-condition-checkbox .condition-checkbox-item i').on('click', (e) => {
        let target = e.target;
        if($(target).attr('data-code') === 'email') {
          if($(target).hasClass('on')) {
            step3ConditionConfig.email = 0;
          } else {
            step3ConditionConfig.email = 1;
          }
        } else if($(target).attr('data-code') === 'mobile') {
          if($(target).hasClass('on')) {
            step3ConditionConfig.mobile = 0;
          } else {
            step3ConditionConfig.mobile = 1;
          }
        } else if($(target).attr('data-code') === 'id') {
          if($(target).hasClass('on')) {
            step3ConditionConfig.id = 0;
          } else {
            step3ConditionConfig.id = 1;
          }
        }
        if($(target).hasClass('on')) {
          $(target).removeClass('on');
        } else {
          $(target).addClass('on');
        }

      });

      // step3 - 可见性
      $('.step3-visible-checkbox .visible-checkbox-item i').on('click', (e) => {
        let target = e.target;
        if($(target).hasClass('on')) {
          $(target).removeClass('on');
          step3Visible = 0;
        } else {
          $(target).addClass('on');
          step3Visible = 1;
        }
      });

      // step3 - 国家/地区限制
      $('.step3-area-limit-checkbox .area-limit-checkbox-item i').on('click', (e) => {
        let target = e.target;
        if($(target).hasClass('on')) {
          $(target).removeClass('on');
          return;
        }
        $($(target).addClass('on').parents('.area-limit-checkbox-item')[0]).siblings().children('i').removeClass('on');
        step3AreaLimit = $(target).attr('data-code');
      });

      // vpn
      $('.step3-vpn-checkbox .vpn-checkbox-item i').on('click', (e) => {
        let target = e.target;
        isAllowProxy = $(target).attr('data-code');
        $(target).addClass('on').siblings.removeClass('on');
      });

      // 切换买币卖币
      $('.advertise-step1-bigbigTitle .text').on('click', '.change', (e) => {
        let target = e.target;
        if($(target).hasClass('buy')) {
          $(target).removeClass('buy').addClass('sell');
          $('.advertise-step1-bigbigTitle .title').html(base.getText(`卖出您的数字货币以获得利润`));
          $('.advertise-step1-bigbigTitle .text').html(`<p class="text">${base.getText('想要获得数字货币吗？')}<span class="change sell">${base.getText('创建一个出价来购买数字货币')}</span></p>`);
          $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText('卖出您的数字货币以获得利润'));
            tradeType = 1;
        } else {
          $(target).removeClass('sell').addClass('buy');
          $('.advertise-step1-bigbigTitle .title').html(base.getText('购买数字货币'));
          $('.advertise-step1-bigbigTitle .text').html(`<p class="text">${base.getText('想要出售数字货币吗？')}<span class="change buy">${base.getText('去出售数字货币')}</span></p>`);
          $('.advertise-step2-bigbigTitle .title,.advertise-step3-bigbigTitle .title').text(base.getText('购买数字货币'));
          tradeType = 0;
        }
      });
      
      //精准查找切换
        $('.jzxe').click(function () {
            if($(this).attr('data-type') == 1){
                $('.jzxe').text(base.getText('使用交易金额'));
                $('.step2-min,.step2-max').hide();
                $('.step2-accuracy').show();
                $(this).attr('data-type',2);
                let step2AccuracyTags = $('#step2AccuracyTags').val();
                if(step2AccuracyTags) {
                  let tags = step2AccuracyTags.join(',');
                  $('.user-step2_option .op-tding').text(tags);
                    $('.user-step2_option .op-tding_fb').text(tradeCoin);
                  $('.user-step2_option li').eq(4).show(300);
                  $('.user-step2_option li').eq(5).hide(300);
                }
                sessionStorage.setItem('jzxe', 2);
            }else{
                $('.jzxe').text(base.getText('使用精准限额'));
                $('.step2-min,.step2-max').show();
                $('.step2-accuracy').hide();
                sessionStorage.setItem('jzxe', 1);
                $(this).attr('data-type',1);
                let min = $('#minInput').val();
                let max = $('#maxInput').val();
                if(min && max) {
                  let t_min = min;
                  let t_max = max;
                  $('.user-step2_option .op-min').html(`${t_min} <span class="op-tding_fb">${tradeCoin}</span>`);
                  $('.user-step2_option .op-max').html(`${t_max} <span class="op-tding_fb">${tradeCoin}</span>`);
                  $('.user-step2_option li').eq(5).show(300);
                  $('.user-step2_option li').eq(4).hide(300);
                }
            }
        });


        base.hideLoadingSpin();
    }

    /**
     * 编辑广告
     */
    function editAdvertise() {
        if(!$('#step3Tags').val()) {
            base.showMsg(base.getText('请选择标签'));
            return;
        }
        // if(!$('#myTagInput').val()) {
        //     base.showMsg(base.getText('请填写自定义标签'));
        //     return;
        // }
        if(!$('#clauseTextarea').val()) {
            base.showMsg(base.getText('请填写条款'));
            return;
        }
        if(!$('#explainTextarea').val()) {
            base.showMsg(base.getText('请填写交易说明'));
            return;
        }
        base.showLoadingSpin();
        let platTag = $('#step3Tags').val().join('||');

        let step2AccuracyTags = sessionStorage.getItem('step2AccuracyTags')
        step2AccuracyTags = step2AccuracyTags.split(',').join('||').toString()
        if(step2AccuracyTags == 'null'){
            step2AccuracyTags = '';
        }
        return TradeCtr.editAdvertise({
            adsCode:code,
            allowCountry: targetArea,
            fixTrade:step2AccuracyTags || undefined,
            customTag: $('#myTagInput').val(),
            isValidateEmail: step3ConditionConfig.email,
            isValidateIdentity: step3ConditionConfig.id,
            isValidateTelephone: step3ConditionConfig.mobile,
            item: $('#clauseTextarea').val(),
            leaveMessage: $('#explainTextarea').val(),
            maxTrade:  Number(sessionStorage.getItem('max')) || undefined,
            minTrade:  Number(sessionStorage.getItem('min')) || undefined,
            notAllowCountry: step3AreaLimit,
            onlyTrust: 0,
            payLimit: sessionStorage.getItem('cancelTime'),
            payType: sessionStorage.getItem('paySubType'),
            platTag: platTag,
            premiumRate: sessionStorage.getItem('zq') / 100,
            targetCountry: $('#targetArea').val(),
            tradeCurrency: sessionStorage.getItem('tradeCoin'),
            tradeCoin:sessionStorage.getItem('tradeCoin001'),
            tradeType: Number(sessionStorage.getItem('tradeType')),
            isAllowProxy: isAllowProxy || 1
        }).then(() => {
          let tType = sessionStorage.getItem('tradeType');
            removeSession();
          base.showMsg(base.getText('操作成功'));
          if (tType === '0') {
              base.gohref('../order/order-list.html?coin=' + coin + '&adverType=BUY&mod=gg');
          } else {
              base.gohref('../order/order-list.html?coin=' + coin + '&adverType=SELL&mod=gg');
          }
          base.showLoadingSpin();
        }, base.hideLoadingSpin);
    }
});