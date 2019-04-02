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
  var coin = base.getUrlParam("orderCoin") || 'end';
  var typeList = {
      "buy": base.getText('购买'),
      "sell": base.getText('出售'),
    },
    statusValueList = {};
  var config = {
    start: 1,
    limit: 10,
    statusList: ["2", "3", "4", "6", "7"]
  };
  var unreadMsgList = {},
    lists = [];
  var isUnreadList = false,
    isOrderList = false;
  init();

  function init() {
      $(".tradeDetail-container .titleStatus li." + coin.toLowerCase()).addClass("on").siblings('li').removeClass('on');
      base.showLoadingSpin();
    setHtml();
    TencentCloudLogin.goLogin(function(list) {
      unreadMsgList = list;
      isUnreadList = true;
      addUnreadMsgNum();
    })
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
  }

  // 初始化分页器
  function initPagination(data) {
    $("#pagination .pagination").pagination({
      pageCount: data.totalPage,
      showData: config.limit,
      jump: true,
      coping: true,
      prevContent: '<img src="/static/images/arrow---left.png" />',
      nextContent: '<img src="/static/images/arrow---right.png" />',
      keepShowPN: true,
      totalData: data.totalCount,
      jumpIptCls: 'pagination-ipt',
      jumpBtnCls: 'pagination-btn',
      jumpBtn: base.getText('确定'),
      isHide: true,
      callback: function(_this) {
        if (_this.getCurrent() != config.start) {
          base.showLoadingSpin();
          config.start = _this.getCurrent();
          getPageOrder(config);
        }
      }
    });
  }

  //分页查询订单
  function getPageOrder(refresh) {
    return TradeCtr.getPageOrder(config, refresh).then((data) => {
      lists = data.list;
      if (data.list.length) {
        var html = "";
        lists.forEach((item, i) => {
          html += buildHtml(item,data);
        });
        $("#content-order").html(html);
        isOrderList = true;
        addUnreadMsgNum();

        $(".tradeDetail-container .trade-list-wrap .no-data").addClass("hidden")
      } else {
        config.start == 1 && $("#content-order").empty()
        config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
      }
      config.start == 1 && initPagination(data);
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
    var photoHtml = "";
    //操作按钮
    var operationHtml = '';
    //未读消息
    var unreadHtml = '';
    //交易数量
    var quantity = '';
    //类型
    var type = '';

    //当前用户为买家
    if (item.buyUser == base.getUserId()) {
      var user = item.sellUserInfo;

      type = 'sell';
      //待支付
      if (item.status == "0") {
        operationHtml = `<div class="am-button am-button-red payBtn" data-ocode="${item.code}">${base.getText('标记付款')}</div>
								<div class="am-button am-button-out ml5 cancelBtn" data-ocode="${item.code}">${base.getText('取消交易')}</div>`;
      } else if (item.status == "2") {
        if (!item.bsComment) {
          operationHtml = `<div class="am-button am-button-red commentBtn"  data-ocode="${item.code}">${base.getText('交易评价')}</div>`
        }
      }
      //当前用户为卖家
    } else {
      var user = item.buyUserInfo;

      type = 'buy';
      //待支付
      if (item.status == "1") {
        operationHtml = `<div class="am-button am-button-red releaseBtn mr10" data-ocode="${item.code}">${base.getText('解冻货币')}</div>`;
      } else if (item.status == "2") {
        if (!item.sbComment) {
          operationHtml = `<div class="am-button am-button-red commentBtn"  data-ocode="${item.code}">${base.getText('交易评价')}</div>`
        }
      }
    }

    //操作按鈕
    //已支付，待解冻
    /*if (item.status == "1") {
      operationHtml += `<div class="am-button arbitrationBtn"  data-ocode="${item.code}">${base.getText('申请仲裁')}</div>`
    }*/

    //待下单
    if (item.status == "-1") {
      operationHtml += `<div class="am-button cancelBtn"  data-ocode="${item.code}">${base.getText('取消订单')}</div>`;
      if(item.type == 'buy'){
        if(item.buyUser == base.getUserId()){
          operationHtml += `<div class="am-button am-button-red buyBtn" style="margin-left: 10px;"  data-ocode="${item.adsCode}">${base.getText('去购买')}</div>`;
        }
      }
      if(item.type == 'sell'){
        if(item.sellUser == base.getUserId()){
          operationHtml += `<div class="am-button am-button-red sellBtn" style="margin-left: 10px;"  data-ocode="${item.adsCode}">${base.getText('去出售')}</div>`;
        }
      }
    }

    if (user.photo) {
      photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(user.photo)}')"></div>`
    } else {
      var tmpl = user.nickname ? user.nickname.substring(0, 1).toUpperCase() : '-';
      photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
    }


      $(".orderDetail-operation-btn").html('')
      var totalCount = data.totalCount.toFixed(8);
      return `<tr data-code="${item.code}">
                    <td><input  type="checkbox" value="" /></td>
					<td class="nickname" style="border-left:1px solid #eee;">
                        <div class="photoWrap fl goHref" data-href="../user/user-detail.html?coin=${item.tradeCoin}&userId=${type == 'sell' ? item.sellUser : item.buyUser}&adsCode=${item.code}">
							${photoHtml}
						</div>
						<samp class="name k-name">${user.nickname ? user.nickname : '-'}</samp>
					</td>
					<td class="code">${item.code.substring(item.code.length-8)}</td>
					<td class="type">${typeList[type]}${item.tradeCoin?item.tradeCoin:'ETH'}</td>
					<td>${base.formatMoney(item.countString,'',item.tradeCoin)} ${item.tradeCoin}</td>
					<td class="quantity">${item.tradeAmount} ${item.tradeCurrency}</td>
					<td class="createDatetime">${base.datetime(item.createDatetime)}</td>
					<td class="status">${item.status=="-1"? base.getText('交谈中') + ','+statusValueList[item.status]:statusValueList[item.status]}</td>
                    <td class="operation">
                        <div class="am-button am-button-red goHref " data-href="../order/order-detail.html?code=${item.code}&buyUser=${user.userId}">聊天</div>
                        <samp class="unread goHref fl hidden" data-href="../order/order-detail.html?code=${item.code}&buyUser=${user.userId}"></samp>
						<i class="icon icon-detail goHref fr" data-href="../order/order-detail.html?code=${item.code}&buyUser=${user.userId}"> ></i>
                    </td>
				</tr>`;
  }


  //按条件查找已结束订单
    $('.hisorder-search-btn').click(function () {
      var data;
      var type =$('.hisorder-wrap #payType option:selected').val();
      var createDatetimeStart =$('#createDatetimeStart input').val();
      var createDatetimeEnd =$('#createDatetimeEnd input').val();
      if( createDatetimeStart == '' || createDatetimeEnd == ''){
          createDatetimeStart = ''
          createDatetimeEnd =''
      }else {
          createDatetimeStart = base.formateDatetime(createDatetimeStart);
          createDatetimeEnd = base.formateDatetime(createDatetimeEnd);
      }
      var statusList = [];
      var payStatic =  $('.hisorder-wrap #payStatic option:selected').val();
      if(payStatic == ""){
          statusList = ['2','3','4','6','7'];
      }else {
          statusList.push(payStatic)
      }
        data={
          start: 1,
          limit: 10,
          type: type === '0' ? 'buy' : 'sell',
          statusList:statusList,
          createDatetimeStart:createDatetimeStart || undefined,
          createDatetimeEnd:createDatetimeEnd || undefined
      };
        return TradeCtr.getPageOrder(data, true).then((data) => {
            lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item,data);
                });
                $("#content-order").html(html);
                isOrderList = true;
                addUnreadMsgNum();

                $(".tradeDetail-container .trade-list-wrap .no-data").addClass("hidden")
            } else {
                config.start == 1 && $("#content-order").empty()
                config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            if(langType == 'EN'){
                $('.k-order-list .am-button').css({
                    'width': 'auto',
                    'padding-left': '6px',
                    'padding-right': '6px',
                });
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);

    })
  //条件重置
    $('.hisorder-reset-btn').click(function () {
        $('.hisorder-wrap #payType').val('')
        $('#createDatetimeStart input').val('')
        $('#createDatetimeEnd input').val('')
        $('.hisorder-wrap #payStatic').val('')
        getPageOrder(config);
    })
  //添加未读消息数
  function addUnreadMsgNum() {
    if (isUnreadList && isOrderList) {
      $("#content-order tr").each(function() {
        var _this = $(this)
        var oCode = _this.attr("data-code")
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
    //购买 点击
    $("#content-order").on("click", ".operation .buyBtn", function() {
      var orderCode = $(this).attr("data-ocode");
      base.gohref("../trade/buy-detail.html?code=" + orderCode)
    })
    //出售 点击
    $("#content-order").on("click", ".operation .sellBtn", function() {
      var orderCode = $(this).attr("data-ocode");
      base.gohref("../trade/sell-detail.html?code=" + orderCode)
    })
    // 已结束
    $('.tradeDetail-container .titleStatus .progress').click(function() {
      if($(this).text() === '进行中') {
        base.gohref("../order/order-list.html");
      }
    });

    //取消订单按钮 点击
    $("#content-order").on("click", ".operation .cancelBtn", function() {
      var orderCode = $(this).attr("data-ocode");
      base.confirm(base.getText('确认取消交易？'), base.getText('取消'), base.getText('确定')).then(() => {
        base.showLoadingSpin()
        TradeCtr.cancelOrder(orderCode).then(() => {
          base.hideLoadingSpin();
          base.showMsg(base.getText('操作成功'));
          setTimeout(function() {
            base.showLoadingSpin();
            getPageOrder(true)
          }, 1500)
        }, base.hideLoadingSpin)
      }, base.emptyFun)
    })

    //標記打款按钮 点击
    $("#content-order").on("click", ".operation .payBtn", function() {
      var orderCode = $(this).attr("data-ocode");
      base.confirm(base.getText('确认标记打款？'), base.getText('取消'), base.getText('确定')).then(() => {
        base.showLoadingSpin()
        TradeCtr.payOrder(orderCode).then(() => {
          base.hideLoadingSpin();
          base.showMsg(base.getText('操作成功'));
          setTimeout(function() {
            base.showLoadingSpin();
            getPageOrder(true)
          }, 1500)
        }, base.hideLoadingSpin)
      }, base.emptyFun)
    })

    //申請仲裁按钮 点击
    $("#content-order").on("click", ".operation .arbitrationBtn", function() {
      var orderCode = $(this).attr("data-ocode");

      $("#arbitrationDialog .subBtn").attr("data-ocode", orderCode);
      $("#arbitrationDialog").removeClass("hidden")

    })

    //彈窗-放棄
    $("#arbitrationDialog .closeBtn").click(function() {
      $("#arbitrationDialog").addClass("hidden");
      $("#form-wrapper .textarea-item").val("")
    })

    var _formWrapper = $("#form-wrapper");
    _formWrapper.validate({
      'rules': {
        'reason': {
          required: true
        },
      }
    })

    //彈窗-申請仲裁
    $("#arbitrationDialog .subBtn").click(function() {
      var orderCode = $(this).attr("data-ocode");
      var params = _formWrapper.serializeObject();
      if (_formWrapper.valid() ) {
        base.showLoadingSpin();
        TradeCtr.arbitrationlOrder({
          code: orderCode,
          reason: params.reason
        }).then(() => {
          base.hideLoadingSpin();
          base.showMsg(base.getText('操作成功'));
          $("#arbitrationDialog").addClass("hidden");
          setTimeout(function() {
            base.showLoadingSpin();
            $("#form-wrapper .textarea-item").val("")
            getPageOrder(true)
          }, 1500)
        }, base.hideLoadingSpin)
      }
    });

    //交易评价按钮 点击
    $("#content-order").on("click", ".operation .commentBtn", function() {
      var orderCode = $(this).attr("data-ocode");
      $('#pjText').val('');
      $("#commentDialog .subBtn").attr("data-ocode", orderCode);
      $("#commentDialog").removeClass("hidden");
    })

    //解冻货币按钮 点击
    $("#content-order").on("click", ".operation .releaseBtn", function() {
      var orderCode = $(this).attr("data-ocode");
      base.confirm(base.getText('确认解冻货币？'), base.getText('取消'), base.getText('确定')).then(() => {
        base.showLoadingSpin()
        TradeCtr.releaseOrder(orderCode).then(() => {
          base.hideLoadingSpin();

          base.showMsg(base.getText('操作成功'));
          setTimeout(function() {
            base.showLoadingSpin();
            getPageOrder(true)
          }, 1500)
        }, base.hideLoadingSpin)
      }, base.emptyFun)
    })

    //评价
    $("#commentDialog .comment-Wrap .item").click(function() {
      $(this).addClass("on").siblings(".item").removeClass("on")
    })

      $("#commentDialog .subBtn").click(function() {
          base.showLoadingSpin();
          var comment = $("#commentDialog .comment-Wrap .item.on").attr("data-value");
          var content = $('#pjText').val();
          var code = base.getUrlParam("code");
          var config={
              updater: base.getUserId(),
              code:code,
              starLevel:comment,
              content:content
          }
          console.log(config)
          TradeCtr.commentOrder(config).then((data) => {
              base.hideLoadingSpin();
              if(data.filterFlag == '2'){
                  base.showMsg(base.getText('操作成功, 其中含有关键字，需平台进行审核'));
              }else{
                  base.showMsg(base.getText('操作成功'));
              }
              auSx();
              $("#commentDialog").addClass("hidden");
              $("#commentDialog .comment-Wrap .item").eq(0).addClass("on").siblings(".item").removeClass("on");
          }, base.hideLoadingSpin)
      })
      // 自动刷新页面
      function auSx() {
          window.location.reload();
      }
  }
});