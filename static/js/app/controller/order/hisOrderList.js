define([
  'app/controller/base',
  'pagination',
  'app/module/validate',
  'app/interface/GeneralCtr',
  'app/interface/UserCtr',
  'app/interface/TradeCtr',
  'app/module/tencentCloudLogin/orderList',
  'app/controller/Top',
  'app/controller/foo',
  'app/controller/public/DealLeft'
], function(base, pagination, Validate, GeneralCtr, UserCtr, TradeCtr, TencentCloudLogin, Top, Foo, DealLeft) {
  let langType = localStorage.getItem('langType') || 'ZH';
  let coin = base.getUrlParam("coin") || '';
  let typeList = {
      "buy": base.getText('购买'),
      "sell": base.getText('出售')
    },
    orderTypeList = {
      "buy": base.getText('买入'),
      "sell": base.getText('卖出')
    },
    statusValueList = {};
  let config = {
    start: 1,
    limit: 12,
    statusList: ["2", "3", "4", "6", "7", '8'],
    tradeCoin: coin
  };
    let docIndex = 0;
  let colors = {
    '7': '#D53D3D',
    '6': '#f19348',
    '9': '#333',
    '2': '#333',
    '3': '#999',
    '4': '#999',
    '8': '#999',
    '10': '#999'
  };
  let unreadMsgList = {},
    lists = [];
  let isUnreadList = false,
    isOrderList = false;
  let tradeCoin = '';
  init();

  function init() {
      $(".tradeDetail-container .titleStatus li.end").addClass("on");
      base.showLoadingSpin();
    setHtml();
    TencentCloudLogin.goLogin(function(list) {
      unreadMsgList = list;
      isUnreadList = true;
      addUnreadMsgNum();
    });
    GeneralCtr.getDictList({ "parentKey": "trade_order_status" }).then((data) => {
      data.forEach(function(item) {
        statusValueList[item.dkey] = item.dvalue
      });
      getPageOrder();
    }, base.hideLoadingSpin);
    addListener();
  }

  function setHtml() {
    base.getDealLeftText();
    $('.progress').text(base.getText('进行中'));
    $('.end').text(base.getText('已结束'));
    $('.b_e_b .nickname').text(base.getText('交易伙伴'));
    $('.code').text(base.getText('订单编号'));
    $('.type').text(base.getText('类型'));
    $('.amount').text(base.getText('交易金额'));
    $('.quantity').text(base.getText('交易数量'));
    $('.createDatetime').text(base.getText('创建时间'));
    $('.status').text(base.getText('交易状态'));
    $('.operation').text(base.getText('交易操作'));
    $('.fy_zwdd').text(base.getText('暂无订单'));

    $('#arbitrationDialog .fy_sqzc').text(base.getText('申请仲裁'));
    $('#arbitrationDialog .fy_reason').attr('placeholder', base.getText('请填写您申请仲裁的理由'));
    $('#arbitrationDialog .closeBtn').html(base.getText('放弃'));
    $('#arbitrationDialog .subBtn').html(base.getText('确认申请'));

    $('#commentDialog .fy_jypj').html(base.getText('交易评价'));
    $('#commentDialog .fy_jyyx').html(base.getText('交易有何印象？快來评价吧'));
    $('#commentDialog .fy_hp').html(base.getText('好评'));
    $('#commentDialog .fy_cp').html(base.getText('差评'));
    $('#commentDialog #pjText').attr('placeholder', base.getText('快來评价吧'));
    $('#commentDialog .subBtn').html(base.getText('提交'));
    $('.hisorder-btn .hisorder-reset-btn').html(base.getText('重置'));
    $('.hisorder-btn .hisorder-search-btn').html(base.getText('搜索'));
    $('.hisorder-btn .hisorder-export-btn').html(base.getText('导出'));
    $('.hisorder-wrap .hb').html(base.getText('订单类型') + '<span>：</span>');
    $('.hisorder-wrap .jyzt').html(base.getText('交易状态') + '<span>：</span>');
    $('.hisorder-wrap .cjsj').html(base.getText('创建时间') + '<span>：</span>');
    $('.hisorder-wrap .h_qxz').attr('placeholder', base.getText('请选择'));
    $('.hisorder-wrap #payType').html(`
      <option value="">${base.getText('选择订单类型')}</option>
      <option value="0">${base.getText('买入')}</option>
      <option value="1">${base.getText('卖出')}</option>
    `);
    $('.hisorder-wrap #payStatic').html(`
      <option value="">${base.getText('选择交易状态')}</option>
      <option value="2">${base.getText('已解冻待评价')}</option>
      <option value="3">${base.getText('已完成')}</option>
      <option value="4">${base.getText('已取消')}</option>
      <option value="6">${base.getText('仲裁买家胜')}</option>
      <option value="7">${base.getText('仲裁卖家胜')}</option>
      <option value="8">${base.getText('超时取消')}</option>
      <option value="9">${base.getText('已申诉')}</option>
      <option value="10">${base.getText('投诉已处理')}</option>
    `);
  }

  //分页查询订单
  function getPageOrder(refresh) {
    config.start = docIndex;
    base.showLoadingSpin();
    return TradeCtr.getPageOrder(config, refresh).then((data) => {
      lists = [...lists, ...data.list];
        let html = "";
        lists.forEach((item, i) => {
            html += buildHtml(item,data);
        });
        $("#content-order").html(html);
        isOrderList = true;
        addUnreadMsgNum();
    
        $(".tradeDetail-container .trade-list-wrap .no-data").addClass("hidden")
      if(langType == 'EN'){
        $('.k-order-list .am-button').css({
          'width': 'auto',
          'padding-left': '6px',
          'padding-right': '6px',
        });
      }
      base.hideLoadingSpin();
    }, base.hideLoadingSpin)
  }

  function buildHtml(item,data) {
    //头像
    let photoHtml = "";
    //操作按钮
    let operationHtml = '';
    //未读消息
    let unreadHtml = '';
    //交易数量
    let quantity = '';
    //类型
    let type = '';
    let toBuySell = '', user = '';
    //当前用户为买家
    if (item.buyUser == base.getUserId()) {
      user = item.sellUserInfo;
      
      toBuySell = `/trade/buy-detail.html?code=${item.adsCode}&coin=${item.tradeCoin}`;
      type = 'buy';
      //当前用户为卖家
    } else {
      user = item.buyUserInfo;
      toBuySell = `/trade/sell-detail.html?code=${item.adsCode}&coin=${item.tradeCoin}`;
      type = 'sell';
    }
    
      $(".orderDetail-operation-btn").html('');
      return `<tr data-code="${item.code}">
					<td class="type">${typeList[type]}${item.tradeCoin?item.tradeCoin:'BTC'}</td>
					<td>${base.formatMoney(item.countString,'',item.tradeCoin)} ${item.tradeCoin}</td>
					<td class="quantity">${item.tradeAmount} ${item.tradeCurrency}</td>
					<td>${item.tradePrice}</td>
					<td>${base.formatMoney(item.feeString,'',item.tradeCoin)} ${item.tradeCoin}</td>
					<td>${item.payment}</td>
					<td class="nickname">
						<samp class="name k-name goHref" style="color: #D53D3D" data-href="../user/user-detail.html?coin=${item.tradeCoin}&userId=${type == 'sell' ? item.buyUser : item.sellUser}&adsCode=${item.code}">${user.nickname ? user.nickname : '-'}</samp>
					</td>
					<td class="status" style="color: ${colors[item.status]}">${item.status=="-1"? base.getText('交谈中') + ','+statusValueList[item.status]:statusValueList[item.status]}</td>
					<td class="code">${item.code.substring(item.code.length-8)}<i>(${orderTypeList[item.type]})</i></td>
					<td class="createDatetime">${base.datetime(item.createDatetime)}</td>
					<td class="his_jy goHref" href-type="_blank" data-href="../order/order-detail.html?code=${item.code}&buyUser=${user.userId}&coin=${item.tradeCoin}">${item.code}</td>
					<td class="his_cj goHref" href-type="_blank" data-href="${toBuySell}">${item.adsCode}</td>
				</tr>`;
  }


  //按条件查找已结束订单
    $('.hisorder-search-btn').click(function () {
      base.showLoadingSpin();
      let type = $('.hisorder-wrap #payType option:selected').val();
      let createDatetimeStart = $('#createDatetimeStart input').val();
      let createDatetimeEnd = $('#createDatetimeEnd input').val();
      if( createDatetimeStart === '' || createDatetimeEnd === ''){
          createDatetimeStart = '';
          createDatetimeEnd =''
      }else {
          createDatetimeStart = base.formateDatetime(createDatetimeStart);
          createDatetimeEnd = base.formateDatetime(createDatetimeEnd);
      }
      let statusList = [];
      let payStatic =  $('.hisorder-wrap #payStatic option:selected').val();
      if(payStatic === ""){
          statusList = ['2','3','4','6','7','8'];
      }else {
          statusList.push(payStatic)
      }
        docIndex = 1;
        lists = [];
        config={
          start: 1,
          limit: 10,
          tradeCoin,
          type: type && (type === '0' ? 'buy' : 'sell'),
          statusList:statusList,
          createDatetimeStart:createDatetimeStart || undefined,
          createDatetimeEnd:createDatetimeEnd || undefined
      };
      return getPageOrder(true);

    });
  //条件重置
    $('.hisorder-reset-btn').click(function () {
        $('.hisorder-wrap #payType').val('');
        $('#createDatetimeStart input').val('');
        $('#createDatetimeEnd input').val('');
        $('.hisorder-wrap #payStatic').val('');
        docIndex = 1;
        lists = [];
        config = {
            start: 1,
            limit: 12,
            statusList: ["2", "3", "4", "6", "7", '8'],
            tradeCoin: coin
        };
        getPageOrder(true);
    });
  //添加未读消息数
  function addUnreadMsgNum() {
    if (isUnreadList && isOrderList) {
      $("#content-order tr").each(function() {
        let _this = $(this);
        let oCode = _this.attr("data-code");
        if (unreadMsgList[oCode] && unreadMsgList[oCode] != '0') {
          if (unreadMsgList[oCode] >= 100) {
            _this.find(".unread").html(base.getText('未读') + '(99+)')
          } else {
            _this.find(".unread").html(base.getText('未读') + '(' + unreadMsgList[oCode] + ')')
          }
        }
      })
    }
  }

  function addListener() {

    let _formWrapper = $("#form-wrapper");
    _formWrapper.validate({
      'rules': {
        'reason': {
          required: true
        },
      }
    });
    $('.coin-select span').click(function() {
      base.showLoadingSpin();
      $('.hisorder-wrap #payType').val('');
      $('#createDatetimeStart input').val('');
      $('#createDatetimeEnd input').val('');
      $('.hisorder-wrap #payStatic').val('');
      $(this).addClass('set_sp').siblings().removeClass('set_sp');
      tradeCoin = $(this).attr('data-coin') || '';
        config = {
            start: 1,
            limit: 12,
            statusList: ["2", "3", "4", "6", "7", '8'],
            tradeCoin
        };
        lists = [];
      getPageOrder(true);
    });
    
      $(document).scroll(function() {
          if(Math.floor($(this).scrollTop() / 300) === (docIndex + 1)) {
              docIndex ++;
              getPageOrder(true);
          }
      });
  }
});