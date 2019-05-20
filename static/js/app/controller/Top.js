define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/AccountCtr',
    'app/interface/UserCtr',
    'app/module/tencentCloudLogin',
    'app/interface/TradeCtr'
], function (base, GeneralCtr, AccountCtr, UserCtr, TencentCloudLogin,TradeCtr) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var coin = base.getUrlParam("coin") || 'BTC'; // 币种
    var firstLoad = true;
    // langPackage 配置文件

    let langPackage = LANGUAGE;
    var typeList = {
        "buy":base.getText('出售') ,
        "sell":base.getText('购买'),
    };
      let coinName = {
        'USDT': 'USDT',
        'BTC': base.getText('比特币')
      };
    $(document).ready(function () {
        init();
      localStorage.removeItem('sellSearchConfig');
      localStorage.removeItem('buySearchConfig');
        getBTC();
        if(base.isLogin()){
            initSocket();
            getUnreadList();
        }
    });

    // 初始化页面
    function init() {
        //中英文切换  先头部切换
        $('.yj_sell-ul').html(`<li class="nav-cwjy goHref" data-href="../trade/sell-list.html?langType=${langType}&coin=USDT">${base.getText(`出售USDT`)}</li>`);
        $('.yj_buy-ul').html(`<li class="nav-cwjy goHref" data-href="../index.html?langType=${langType}&coin=USDT">${base.getText(`购买USDT`)}</li>`);
        $('.en_page').text(base.getText(`购买比特币`));
        $('.en_store').text(base.getText(`出售比特币`));
        $('.en_deal').text(base.getText('发布广告'));
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
        $('.store_ye').text(base.getText('游戏余额'));
        $('.active-news .hyxx').html('您有活跃消息');
        $('.active-news .bt').html('标题');
        $('.active-news .maij').html('买家');
        $('.active-news .jg').html('价格');
        $('.active-news .sl').html('数量');
        $('.active-news .mj').html('卖家');
        $('.active-news .zffs').html('支付方式');
        $('.active-news .zt').html('状态');

        if(langType === 'EN'){
            $('.lang_select option.l-en').attr('selected', true);
            $('.head-user .dd-ul').css({
                'width': '150px',
                'left': '-80px'
            });
            $('.str-h_l').css('margin-right', '15px');

            setTimeout(function () {
                if (firstLoad) {
                    firstLoad = false;
                    changeLanguageFn($(document))
                }
            }, 1);
        }

        $('.lang_select').change(function(){
            switch($(this).val()){
                case 'zh': localStorage.removeItem('langType');break;
                case 'en': localStorage.setItem('langType', 'EN');break;
            }
            location.reload(true);
        });

        $("#footTeTui").html(FOOT_TETUI);
        $("#footEmail").html(FOOT_EMAIL);
        if (base.isLogin()) {
            if(localStorage.getItem("nickname")) {
                $("#head-user-wrap .nickname").text(localStorage.getItem("nickname"))
                $("#head-user-wrap").removeClass("hidden");
            }
        } else {
            $("#head-button-wrap").removeClass("hidden");
        }
        if($('.advertise-out-container').length === 0) {
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
        }
        addListener();
    }

    /**
     * 获取未读消息
     */
    function getUnreadList() {
        TradeCtr.getNotUnread(base.getUserId()).then(notMsg => {
        
        });
        TradeCtr.getUnreadDetail(base.getUserId(), 0, 5).then((msgData) => {
          let taget = $('#head-user-wrap .head-user .msg_num');
          let msg_num = +taget.text() > 0 ? +taget.text() : '';
          taget.show();
          taget.text(msg_num + (msgData.unreadNum > 0 ? msgData.unreadNum : ''));
          if(!msg_num && !msgData.unreadNum) {
            taget.hide();
          }else {
            taget.show();
          }
            let item = msgData.list, msgLen = msgData.list.length - 1;
            let messageHtml = '';
            item.forEach((data, itemIndex) => {
              if(+data.smsInfo.type !== 4) {
                messageHtml = `<li class="goMessageHref" data-href="../order/order-detail.html?code=${data.smsInfo.refNo}&coin=${data.smsInfo.symbol}" data-refNo="${data.smsInfo.refNo}" data-readId="${data.id}">
                    <img src="${data.smsInfo.type === 2 ? '/static/images/system-msg.png' : '/static/images/order-msg.png'}" alt="">
                    <div class="message-text">
                        <p class="message-title">${data.smsInfo.title}</p>
                        <span class="message-content">${data.smsInfo.content}</span>
                    </div>
                </li>`;
              }else {
                messageHtml = `<li class="goMessageHref" data-href="../wallet/wallet.html" data-refNo="${data.smsInfo.refNo}" data-readId="${data.id}">
                    <img src="${data.smsInfo.type === 2 ? '/static/images/system-msg.png' : '/static/images/order-msg.png'}" alt="">
                    <div class="message-text">
                        <p class="message-title">${data.smsInfo.title}</p>
                        <span class="message-content">${data.smsInfo.content}</span>
                    </div>
                </li>`;
              }
                $('.down-wrap-message ul').append(messageHtml);
                if(itemIndex === msgLen) {
                  messageHtml = `<li class="goHref" data-href="../user/user-pj.html" style="font-size: 12px; color: #999;text-align: center;display: block;">查看全部</li>`;
                  $('.down-wrap-message ul').append(messageHtml);
                }
            })
        })
    }
    /**
     * 初始化Socket链接
     */
    function initSocket() {
        // var ws = new WebSocket('wss://www.tychely.com/ws?userId='+ localStorage.getItem('userId')); // 线上
        var ws = new WebSocket('ws://120.26.6.213:5802/ogc-standard/webSocketServer?userId='+ localStorage.getItem('userId')); // 研发
        // var ws = new WebSocket('ws://120.26.6.213:6802/ogc-standard/webSocketServer?userId='+ localStorage.getItem('userId')); // 测试
        ws.onopen = function (event) {
            // ws.send('你好啊')
        }
        ws.onmessage = function(event) {
            let data =event.data;
            // data = data.replace(/\"\{/, '{').replace(/\}\"/, '}').replace(/\'/g, '"');
            data = JSON.parse(data);
            let taget = $('#head-user-wrap .head-user .msg_num');
            let msg_num = +taget.text();
            taget.show();
            taget.text(msg_num + data.length);
            let messageHtml = '';
            let activeNewsHtml = '';
           data.forEach(item => {
                if(window.location.pathname == "/order/order-detail.html"){
                    var orderDetailCode = base.getUrlParam('code');
                    var orderDetailStatus;
                    return TradeCtr.getOrderDetail(orderDetailCode).then((data) => {
                        orderDetailStatus = data.status;
                        if(orderDetailCode == item.refNo){
                            if(orderDetailStatus == item.status){
                                window.location.reload();
                            }
                        }
                    })
                }
                if(item.isNew == 0){
                    messageHtml = `<li class="goMessageHref" data-href="../order/order-detail.html?code=${item.refNo}&coin=${item.symbol}" data-refNo="${item.refNo}" data-readId="${item.readId}">
                            <img src="${data.type == 2 ? '/static/images/system-msg.png' : '/static/images/order-msg.png'}" alt="">
                            <div class="message-text">
                                <p class="message-title">${item.title}</p>
                                <span class="message-content">${item.content}</span>
                            </div>
                        </li>`;
                    $('.down-wrap-message ul').prepend(messageHtml);
                    let liLength = $('.down-wrap-message ul li').length;
                  if(liLength > 6) {
                    $('.down-wrap-message ul').find('li')[5].remove();
                  }
                }else{
                    messageHtml = `<li class="goMessageHref" data-href="../order/order-detail.html?code=${item.refNo}&coin=${item.symbol}" data-refNo="${item.refNo}" data-readId="${item.readId}">
                            <img src="${data.type == 2 ? '/static/images/system-msg.png' : '/static/images/order-msg.png'}" alt="">
                            <div class="message-text">
                                <p class="message-title">${item.title}</p>
                                <span class="message-content">${item.content}</span>
                            </div>
                        </li>`;
                    $('.down-wrap-message ul').prepend(messageHtml);
                      let liLength = $('.down-wrap-message ul li').length;
                      if(liLength > 6) {
                        $('.down-wrap-message ul').find('li')[5].remove();
                      }
                    if(item.type == 1){
                        var refNo;
                        var readId;
                        data.forEach(item => {
                            refNo = item.refNo;
                            readId = item.readId;
                        })
                        setTimeout(() => {
                            if(document.getElementById('audio-message2').muted != false){
                                document.getElementById('audio-message2').muted = false;
                            }
                            document.getElementById('audio-message2').play();
                        }, 1000);
                        TradeCtr.getOrderDetail(refNo).then((data) => {
                            activeNewsHtml =`<li class="goMessageHref" data-href="../order/order-detail.html?code=${refNo}&coin=${data.tradeCoin}" data-readId="${readId}">
                            <span> <button style="border: none;padding: 0px;">${base.getText('聊天')}</button></span>
                            <span>${data.buyUserInfo.nickname}</span>
                            <span>${data.tradeAmount}  ${data.tradeCurrency}</span>
                            <span>${base.formatMoney(data.countString,'',data.tradeCoin)} ${data.tradeCoin}</span>
                            <span>${data.sellUserInfo.nickname}</span>
                            <span>${data.payment}</span>
                            <span>${typeList[data.type]}</span>
                        </li>`;
                            $('.active-news').show();
                            $('.active-news ul').prepend(activeNewsHtml);
                            setTimeout(() => {
                              $('.active-news').hide();
                            }, 50000);
                        });
                    }else if(item.type == 2){
                        setTimeout(() => {
                            if(document.getElementById('audio-message1').muted != false){
                                document.getElementById('audio-message1').muted = false;
                            }
                            document.getElementById('audio-message1').play();
                        }, 1000);
                    }
                }
            })
        };

        ws.onclose = function() {
            console.log('链接断开，尝试重连')
            // initSocket()
        };
    }

    /**
     * 消息查看
     */
    $(".head-user.message").mouseenter(function () {
        var length = $('.down-wrap-message li').length;
        if(length == 0){
            $(".head-user.message .head-triangle").hide();
            $(".head-user.message .down-wrap-message").hide();
        }else{
            $(".head-user.message .head-triangle").show();
          $(".head-user.message .down-wrap-message").show();
        }
    });

    function changeLanguageFn(nodeObj){
        if (nodeObj.children().length > 0){
            nodeObj.children().each(function(){
                changeLanguageFn($(this));
                FindChsAndReplaceIt($(this));
            });
        } else {
            FindChsAndReplaceIt(nodeObj);
        }

        function FindChsAndReplaceIt(nodeObj){
            var pat = new RegExp("[\u4e00-\u9fa5]+","g");
            if ((nodeObj.text() || nodeObj.val() || nodeObj.attr("title") || nodeObj.attr("placeholder"))
                && (pat.exec(nodeObj.text()) || pat.exec(nodeObj.val()) || pat.exec(nodeObj.attr("title")) || pat.exec(nodeObj.attr("placeholder")))){
                var str = "";
                if (nodeObj.text()){
                    str = nodeObj.text();
                    ReplaceValue(str, nodeObj, "text");
                }
                if (nodeObj.val()){
                    str = nodeObj.val();
                    ReplaceValue(str, nodeObj, "val");
                }
                if (nodeObj.attr("title")){
                    str = nodeObj.attr("title");
                    ReplaceValue(str, nodeObj, "title");
                }
                if (nodeObj.attr("placeholder")){
                    str = nodeObj.attr("placeholder");
                    ReplaceValue(str, nodeObj, "placeholder");
                }
            }
        }

        function ReplaceValue(str, nodeObj, attrType){
            var arr;
            var pat = new RegExp("[\u4e00-\u9fa5]+","g");
            while((arr = pat.exec(str)) != null){
              if (langPackage[arr.input]){
                  str = str.replace(arr.input, langPackage[arr.input]['EN']);
                  if (attrType == "text"){
                    nodeObj.text(str);
                  }
                  else if (attrType == "val"){
                    nodeObj.val(str);
                  }
                  else if (attrType == "title"){
                    nodeObj.attr("title", str);
                  }
                  else if (attrType == "placeholder"){
                    nodeObj.prop("placeholder", str);
                  }
              }
            }
        }
    }
    function getBTC() {
        let params = {};
        var payTypeMoney= $('.payTypeMoney option:selected').val();
        if(payTypeMoney == '' || payTypeMoney == undefined){
            payTypeMoney ='USD'
        }
        params.referCurrency = payTypeMoney;
        params.symbol = coin;
        TradeCtr.getBtc(params).then((data) => {
            $('.market-price').html(base.getText(`目前${coinName[coin]}市场价`)+data.mid +'USD')
        });
    }
    function addListener() {

        $("#headLogout").click(function () {
            base.logout()
        });
        $(".am-modal-mask").on('click', function () {
          $("#arbitrationform-wrapper .textarea-item").val("");
          $(this).parent(".dialog").addClass("hidden");
        });
        $("#head .advertise .goHref").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref)
            }
        })

        $("#head .head-nav-wrap .advertise .goHref").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref)
            }
        })

        $("#head .head-nav-wrap .invitation").off("click").click(function () {
            if (!base.isLogin()) {
                base.goLogin();
                return false;
            } else {
                var thishref = $(this).attr("data-href");
                base.gohref(thishref)
            }
        })

        $("#head .head-nav-wrap .store").off("click").click(function () {
            var thishref = $(this).attr("data-href");
            base.gohref(thishref)
        });
        
        $('#topAdvertise').off('click').click(function () {
          if(!base.isLogin()){
            base.goLogin();
            return;
          }else {
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
            base.gohref('../trade/advertise.html')
          }
        });

        $("body").on('click','.isTradePwdFlag', function () {
            var _this = $(this);

            UserCtr.getUser().then((data) => {
                if (data.tradepwdFlag) {
                    base.gohref(_this.attr("data-href"))
                } else if (!data.tradepwdFlag) {
                    base.showMsg(base.getText('请先设置交易密码'))
                    setTimeout(function () {
                        base.gohref("../user/setTradePwd.html?type=1")
                    }, 1800)
                }
            }, base.hideLoadingSpin)
        })
        /**
         * 消息阅读
         */
        $("body").on('click', '.down-wrap-message ul li',function () {
            if($(this).length === 0){
                $('#head-user-wrap .head-user .msg_num').hide();
            }
            var readId = $(this).attr('data-readid');
            var params ={"id":readId};
            TradeCtr.readNews(params).then((data) => {
                if (!base.isLogin()) {
                    base.goLogin();
                    return false;
                } else {
                    var thishref = $(this).attr("data-href");
                    base.gohref(thishref)
                }

            });
        });
        $("body").on('click', '.active-news ul li',function () {
            if($(this).length === 0){
                $('#head-user-wrap .head-user .msg_num').hide();
            }
            var readId = $(this).attr('data-readId');
            var params ={"id":readId};
            TradeCtr.readNews(params).then((data) => {
                if (!base.isLogin()) {
                    base.goLogin();
                    return false;
                } else {
                    var thishref = $(this).attr("data-href");
                    base.gohref(thishref)
                }

            });
        });
        $(document).on('click',function () {
            if(document.getElementById('audio-message1').muted ||  document.getElementById('audio-message2').muted != false){
                document.getElementById('audio-message1').muted = false;
                document.getElementById('audio-message2').muted = false;
            }
        });
        $(document).on('click','.left-item',function () {
            var i = $(this).index();
            $(this).addClass('pay-active');
            $(this).siblings().removeClass('pay-active');
        });
        $(document).on('click', '.left-title',function(){
            $(".left-item").removeClass('pay-active'); //隐藏阴影效果
        });

        $(document).on('click', '.article-tit-list',function(){
            let i = $(this).index();
            $(this).addClass('sel-li');

            $(this).siblings().removeClass('sel-li');
        });

        $('.jybuy-list').click(function() {
          base.gohref('../index.html');
        });
      $('.jysell-list').click(function() {
        base.gohref('../trade/sell-list.html');
      })
    }
});