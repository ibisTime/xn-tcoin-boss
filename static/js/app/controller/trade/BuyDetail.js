define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/interface/AccountCtr',
    'app/module/tencentChat',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, GeneralCtr, UserCtr, TradeCtr, AccountCtr, TencentChat, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var code = base.getUrlParam("code");
    var isDetail = !!base.getUrlParam("isD"); //是否我的广告查看详情
    var userId = '';
    var nickname = '';
    var config = {
        adsCode: code,
        tradePrice: 0
    };

    var tradePhoto = '';
    var tradePhotoMy = '';
    var userName = '',
        myName = '';
    var limit = '';
    var tradeCoin = 'BTC';
    let tradeCurrency = 'CNY';
    let coin = base.getUrlParam("coin") || 'BTC';
    let coinName = {
      'BTC': '比特币',
      'USDT': 'USDT'
    };

    let platTagList = [];
      let availableBalanceString = '';
      let marketPrice = '';
      let amountAll = 0;
      let feeRate = 0;
    let isSellOk = true;
    let loginStatus = '';

    if (!base.isLogin()) {
        base.goLogin();
        return;
    }
    init();

    function init() {
        base.showLoadingSpin();
        setHtml();
        if (!isDetail) {
            $(".buy-wrap").removeClass("hidden");
        }
        $.when(
          TradeCtr.getTagsList({ status: 1 })
        ).then((res) => {
          base.hideLoadingSpin();
          res.map((item) => {
            platTagList.push({
              key: item.id,
              value: item.name
            });
          });
          getAdvertiseDetail();
        }, base.hideLoadingSpin);
        addListener();
    }
    function setHtml() {
        $('title').text(base.getText('购买详情') + '-' +base.getText('区块链技术应用实验平台'));
        $('.en-buy_jy').text(base.getText('交易次数'));
        $('.en-buy_xr').text(base.getText('信任人数'));
        $('.en-buy_hp').text(base.getText('好评率'));
        $('.sp-lx').text(base.getText('联系对方'));
        $('.en-buy_bj').text(base.getText('报价') + ':');
        $('.en-buy_xe').text(base.getText('交易限额') + ':');
        $('.en-buy_sl').text(base.getText('交易数量') + ':');
        $('.en-buy_fk').text(base.getText('付款方式') + ':');
        $('.en-buy_mmds').text(base.getText('您想购买多少') + '?');
        $('.en-buy_fz').text(base.getText('分钟'));
        $('.en-buy_tx').text(base.getText('交易提醒'));
        $('.warnWrap .warn-txt1').html(base.getText('提醒：请确认价格再下单,下单彼此交易的'));
        $('.warnWrap .warn-txt2').html(base.getText('将被托管锁定，请放心购买。'));
        $('.buy-detail-container .en-buy_ggsy').html(base.getText('点击此处获取帮助'));
        $('.buy-detail-container .en-buy_poundage').html(base.getText('手续费') + '：0 ' + coinName[coin]);
        $('.buy-detail-container #buyAmount').attr('placeholder', base.getText('请输入您购买的金额'));
        $('.buy-detail-container #buyEth').attr('placeholder', base.getText('请输入您购买的数量'));
        $('#buyBtn .buy-now').html(base.getText('立即购买'));
        $('.buy-detail-container .buy-info .zdj').html(`${base.getText('最低为')}<span class="buy-info-weighter min"></span>`);
        $('.buy-detail-container .buy-info .zdjy').html(`${base.getText('最大交易')}<span class="buy-info-weighter max"></span>`);
        $('.buy-detail-container .buy-info .mykq').html(`${base.getText('每一块钱将花费您')}<span class="buy-info-weighter rate"></span>`);
        $('.buy-detail-container .buy-info .scjg').html(`${base.getText(`市场价格为每${coinName[coin]}`)}<span class="buy-info-weighter price"></span>（${base.getText(`您可以购买任意分之一的${coinName[coin]}`)}）`);
        $('.buy-detail-container .buy-quick-condition .buy-quick-title').html(base.getText('快速出价概览'));
        $('.buy-detail-container .buy-cjtk .buy-quick-title').html(`<span class="buy-title"></span><span class="goHref" data-href="../public/help.html">${base.getText('社区提示')}</span>`);
        $('.buy-detail-container .detail-container-right .buy-user-online').html(`${base.getText('已查看')}<span class="interval"></span>${base.getText('前')}`);
        $('.buy-detail-container .detail-container-right .buy-user-sy').html(`${base.getText('声誉')}<span class="buy-user-sy-plus"></span>/<span class="buy-user-sy-negative"></span>`);
        $('.buy-detail-container .buy-share-title').html(base.getText('分享该出价') + '：');
        $('.buy-detail-container .jymm').html(base.getText('交易密码'));
        $('.buy-detail-container #moneyPow').attr('placeholder', base.getText('请输入交易密码'));
        $('.buy-detail-container #submitMon .subBtn').html(base.getText('确认'));
        $('.buy-detail-container #submitMon .closeBtn').html(base.getText('取消'));
        $('.buy-detail-container .xdqr').html(base.getText('下单确认'));
        $('.buy-detail-container .gmjg').html(base.getText('购买价格'));
        $('.buy-detail-container .gmje').html(base.getText('购买金额'));
        $('.buy-detail-container .gmsl').html(base.getText('购买数量'));
        $('.buy-detail-container #submitDialog .subBtn').html(base.getText('确认购买'));
        $('.buy-detail-container #submitDialog .closeBtn').html(base.getText('放弃购买'));
    }

    //获取详情
    function getAdvertiseDetail() {
        return TradeCtr.getAdvertiseDetail(code).then((data) => {
          feeRate = data.feeRate;
            userId = data.user.userId;
            nickname = data.user.nickname;
            tradeCurrency = data.tradeCurrency;
            $('.item-unit').text(tradeCurrency);
            $('#limit').next().text(tradeCurrency);
            var user = data.user;
            userName = user.nickname;
            tradeCoin = data.tradeCoin ? data.tradeCoin : 'BTC';
            let totalCountString = base.formatMoney(data.totalCountString, '', tradeCoin);

            if (user.photo) {
                tradePhoto = `<div class="photo goHref" data-href="../user/user-detail.html?coin=${tradeCoin}&userId=${user.userId} style="background-image:url(${base.getAvatar(user.photo)})"></div>`;
            } else {
                var tmpl = user.nickname ? user.nickname.substring(0, 1).toUpperCase() : '-';
                tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin=' + tradeCoin + '&userId=' + user.userId + '" ><div class="noPhoto">' + tmpl + '</div></div>'
            }

            if (data.user.photo) {
                $("#photo").css({ "background-image": "url('" + base.getAvatar(data.user.photo) + "')" })
            } else {
                var tmpl = data.user.nickname ? data.user.nickname.substring(0, 1).toUpperCase() : '';
                var photoHtml = `<div class="noPhoto">${tmpl}</div>`
                $("#photo").html(photoHtml)
            }
            config.tradePrice = data.truePrice;
            limit = data.minTrade + '-' + data.maxTrade

            $("#nickname").html(data.user.nickname);
            if(data.user.idNo){
                $('.rz').text(base.getText('已认证')).addClass('sp-yrz');
            }else{
                $('.rz').text(base.getText('未认证')).addClass('sp-wrz');
            }
            if (data.status == "1" && isDetail) {
                $("#doDownBtn").removeClass("hidden");
            }

            var totalTradeCount = data.user.userStatistics.totalTradeCount == '0' ? '0' : base.formatMoney(data.user.userStatistics.totalTradeCount, '0', data.tradeCoin) + '+';

            $("#jiaoYiCount").html(data.user.userStatistics.jiaoYiCount)
            $("#beiXinRenCount").html(data.user.userStatistics.beiXinRenCount)
            $("#beiHaoPingCount").html(base.getPercentum(data.user.userStatistics.beiHaoPingCount, data.user.userStatistics.beiPingJiaCount))
            $("#totalTradeCount").html(totalTradeCount + data.tradeCoin)
            $("#leaveMessage").html(data.leaveMessage.replace(/\n/g, '<br>'))
            $("#limit").html(limit);
            $('#countString').html(totalCountString);
            $("#payLimit").html(data.payLimit);

            $("#truePrice").html(Math.floor(data.truePrice * 100) / 100 + '&nbsp;'+ tradeCurrency +'/' + tradeCoin)
            $("#submitDialog .tradePrice").html(config.tradePrice + '&nbsp;'+ tradeCurrency +'/' + tradeCoin)
            // $("#leftCountString").html(base.formatMoney(data.leftCountString, '', tradeCoin))
            $("#coin").text(tradeCoin);
          availableBalanceString = +base.formatMoney(data.availableBalanceString, '', tradeCoin);
          marketPrice = data.marketPrice;
          amountAll = (Math.floor(+(marketPrice * availableBalanceString) * 10000) / 10000).toFixed(2);
            $('.buy-info .rate').html(data.truePrice + data.tradeCurrency);
            $('.buy-info .price').html(data.marketPrice + data.tradeCurrency);
            $('.buy-cjtk').append(`<span>${data.item}</span>`);
            $('.buy-cjtk .buy-quick-title .buy-title').html(data.user.nickname + base.getText('的出价条款'));
            $('.buy-user-nickname').html(data.user.nickname);
            $('.buy-talk').html(base.getText('安全托管') + base.getText('与') +data.user.nickname+base.getText('实时交谈'));
            if(data.fixTrade === '' ||  data.fixTrade === undefined){
                $('.item-buyAmount').removeClass('hidden');
                $('.item-selectAmount').addClass('hidden');
                $('.buy-info .min').html(data.minTrade + '' + data.tradeCurrency);
                $('.buy-info .max').html(data.maxTrade + '' + data.tradeCurrency);
                if(amountAll < +data.minTrade ) {
                  $('#buyBtn').css({
                    'background-color': '#aaa',
                    'color': '#fff',
                    'cursor': 'default'
                  });
                  isSellOk = false;
                }
            }else{
                $('.item-buyAmount').addClass('hidden');
                $('.item-selectAmount').removeClass('hidden');
                $('#buyEth').attr('readonly','true');
                let selectHtml =`<option value="">${base.getText('请选择')}</option>`;
                let slen = 0;
                data.fixTradeList.forEach(function(item) {
                    if(+item < amountAll || +item === amountAll) {
                      selectHtml += `<option  value="${item}">${item}</option>`;
                      slen ++;
                    }
                });
                if(slen === 0) {
                  $('#buyBtn').css({
                    'background-color': '#aaa',
                    'color': '#fff',
                    'cursor': 'default'
                  });
                  isSellOk = false;
                }
                $('.item-selectAmount #amounSelect').html(selectHtml)
                $('.buy-info .min').html(data.fixTradeList[0] + '' + data.tradeCurrency);
                $('.buy-info .max').html(data.fixTradeList[data.fixTradeList.length - 1] + '' + data.tradeCurrency);

            }
            if(data.user.photo) {
              $('.icon-user-photo').css({ "background-image": "url('" + base.getAvatar(data.user.photo) + "')" });
            }else {
              let nick = data.user.nickname.substring(0, 1);
              $('.icon-user-photo').text(nick);
            }
          buildTagsHtml(data.platTag, data.customTag);
          let time = base.calculateDays(data.user.lastLogin, new Date());
          if (time <= 10) {
            loginStatus = 'green'
          } else if (time <= 30) {
            loginStatus = 'yellow'
          } else {
            loginStatus = 'gray'
          }
          $('.user_loginTime').addClass(loginStatus);
          let interval = base.fun(Date.parse(data.user.lastLogin), new Date());
          $('.detail-container-right .buy-user-info .buy-user-online .interval').html(interval);

          $('.buy-user-sy-plus').html(`+${data.userStatistics.beiHaoPingCount}`);
          $('.buy-user-sy-negative').html(`-${data.userStatistics.beiChaPingCount}`);
          $.when(
                getAccount(data.tradeCoin),
                getUser()
            )

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    // 构建tag的dom结构
    function buildTagsHtml(tag1, tag2) {
      let tagsHtml = ``;
      if(tag1) {
        tag1.split('||').map((item) => {
          platTagList.map((k) => {
            if(item == k.key) {
              tagsHtml += `<span>${k.value}</span>`;
            }
          })
        });
      }
      if(tag2) {
        tagsHtml += `<span>${tag2}</span>`;
      }
      if(!tag1 && !tag2) {
        tagsHtml += `<span>${base.getText('暂无')}</span>`;
      }
      $('.buy-quick-condition').append(tagsHtml);
    }
    //我的账户
    function getAccount(currency) {
        return AccountCtr.getAccount().then((data) => {
            if (data.accountList) {
                data.accountList.forEach(function(item) {
                    if (item.currency == currency) {
                        let dmoney = +base.formatMoneySubtract(item.amount.toString(), item.frozenAmount.toString(), currency);
                    }
                })

            }
        }, base.hideLoadingSpin)
    }

    //获取用户详情
    function getUser() {
        return UserCtr.getUser().then((data) => {
            var myInfo = data;
            myName = myInfo.nickname;
            if (myInfo.photo) {
                tradePhotoMy = `<div class="photo" style="background-image:url(${base.getAvatar(myInfo.photo)})"></div>`
            } else {
                var tmpl = myInfo.nickname.substring(0, 1).toUpperCase();
                tradePhotoMy = '<div class="photo"><div class="noPhoto">' + tmpl + '</div></div>'
            }

            //聊天框加载
            TencentChat.addCont({
                tradePhoto: tradePhoto,
                tradePhotoMy: tradePhotoMy,
                userName: userName,
                myName: myName,
                truePrice: $("#truePrice").html(),
                limit: limit + ' ' + tradeCurrency,
                success: function() {
                    $("#chatBtn").removeClass("hidden")
                }
            });
        }, base.hideLoadingSpin)
    }

    //购买
    function buyETH() {
        if($('.item-buyAmount').hasClass('hidden')){
            config.tradeAmount = $("#amounSelect option:selected").text();
        }else {
            config.tradeAmount = $("#buyAmount").val();
        }
        config.count = base.formatMoneyParse($("#buyEth").val(), '', $('.buy-detail-formwrapper #coin').text());
        
        base.showLoadingSpin();
        return TradeCtr.buyETH(config).then((data) => {
            if(document.getElementById('audioBuyDetail').muted != false){
                document.getElementById('audioBuyDetail').muted = false;
            }
            document.getElementById('audioBuyDetail').play();
                base.showMsg(base.getText('下单成功'));
                setTimeout(function() {
                    base.gohref("../order/order-detail.html?code="+data.code+'&coin='+coin, '_bank');
                }, 1000);
              setTimeout(function() {
                base.gohref(`../index.html?coin=${coin}`);
              }, 1500);
                base.hideLoadingSpin();
            }, base.hideLoadingSpin) //

    }

    function addListener() {
        var _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                'buyAmount': {
                    amountCny: true
                },
                'buyEth': {
                    amountEth: true
                },
            }
        })

        //立即下单点击
        $(document).on('click','#buyBtn',function() {
            if(!isSellOk) {
                return false;
            }
            $('.bb-m').text(tradeCoin);
            $("#submitDialog .tradeAmount").html($("#buyAmount").val() + tradeCurrency);
            $("#submitDialog .count").html($("#buyEth").val() + tradeCoin);
            UserCtr.getUser().then((data) => {
                if($('.item-selectAmount').hasClass('hidden')){
                    if ($("#buyAmount").val() != '') {
                        buyETH();
                    } else {
                        base.showMsg(base.getText('请输入您购买的金额'))
                    }
                }else {
                    if ($("#amounSelect").val() != '') {
                        // $("#submitDialog").removeClass("hidden")
                        buyETH();
                    } else {
                        base.showMsg(base.getText('请选择您购买的金额'))
                    }
                }
            }, base.hideLoadingSpin);
        });
      
        //下单确认弹窗-放弃点击
        $("#submitDialog .closeBtn").click(function() {
            $("#submitDialog").addClass("hidden")
        });
        
        // 点击头像跳个人中心
      $('.buy-user-info .icon-user-photo').stop().click(function() {
        base.gohref(`../user/user-detail.html?userId=${userId}`);
      });

        $("#buyEth").keyup(function() {
            let truePrice = $("#buyEth").val() * marketPrice;
            $("#buyAmount").val((Math.floor(truePrice * 100) / 100).toFixed(2));
            if(+$(this).val() > availableBalanceString * (1 - feeRate)) {
              base.showMsg(base.getText('对方余额不足'));
              $(this).val((availableBalanceString * (1 - feeRate)).toFixed(8));
              $("#buyAmount").val((availableBalanceString * marketPrice * (1 - feeRate)).toFixed(2));
            }
        });
        $("#buyAmount").keyup(function() {
            $("#buyEth").val(($("#buyAmount").val() / marketPrice).toFixed(8));
            if(+$(this).val() > amountAll * (1 - feeRate)) {
                base.showMsg(base.getText('对方余额不足'));
                $(this).val((availableBalanceString * marketPrice * (1 - feeRate)).toFixed(2));
              $("#buyEth").val((availableBalanceString * (1 - feeRate)).toFixed(8));
            }
        })
        $("#amounSelect").change(function() {
            if($("#amounSelect").val() == ''){
                $("#buyEth").val('')
            }else {
                $("#buyEth").val(($("#amounSelect option:selected").text() / config.tradePrice).toFixed(8));
            }
        })
        //下架-点击
        $("#doDownBtn").click(function() {
            base.confirm(base.getText('确认下架此广告？'), base.getText('取消'), base.getText('确定')).then(() => {
                base.showLoadingSpin()
                TradeCtr.downAdvertise(code).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功'));
                    $("#doDownBtn").addClass("hidden");
                    setTimeout(function() {
                        base.gohref("./index.html?mod=gm");
                    }, 1000)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })
        $(document).on("click", ".buy-operation .doDownBtn", function() {
            var adsCode = $(this).attr("data-code");
            base.confirm(base.getText('确认下架此广告？'), base.getText('取消'), base.getText('确定')).then(() => {
                base.showLoadingSpin()
                TradeCtr.downAdvertise(adsCode).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功'));
                    setTimeout(function() {
                        base.showLoadingSpin();
                        config.start = 1;
                        base.gohref("../index.html?mod=gm");
                    }, 1500)
                }, base.hideLoadingSpin)
            }, base.emptyFun)
        })
        //聊天按钮点击
        $(".det-lx").click(function() {
            base.showLoadingSpin();
            // 购买开始聊天，提交交易订单
            TradeCtr.chatOrderBuy(code).then((data) => {
                TencentChat.showCont({
                    code: data.code,
                })
            }, base.hideLoadingSpin)

        });

        // 查看评价
        $('.detail-container-wrap').on('click', '.topj', function(){
            base.gohref(`../user/user-pj.html?userId=${userId}&nickname=${nickname}`);
        })
    }
});