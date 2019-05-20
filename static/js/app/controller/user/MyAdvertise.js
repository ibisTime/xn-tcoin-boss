define([
    'app/controller/base',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr',
    'app/interface/TradeCtr',
    'pagination',
    'app/controller/Top',
    'app/controller/foo',
    'app/controller/public/DealLeft'
], function(base, AccountCtr, GeneralCtr, TradeCtr, pagination, Top, Foo, DealLeft) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var type = base.getUrlParam("adverType") || "sell"; // buy: 购买，sell:出售
    var coin = base.getUrlParam("coin") || 'BTC'; // wait
    var adsStatusValueList = {}; // 广告狀態
    let adverConfig = {
        start: 1,
        limit: 10,
        tradeType: 1,
        statusList: [0, 1,2],
        userId: base.getUserId()
    }
    var typeList = {
        "buy": base.getText('购买', langType),
        "sell": base.getText('出售', langType),
    };
    let trade_btc_bail = '';
    let trade_usdt_bail = '';
    let moneyBTC = '';
    let moneyUSDT = '';
    init();

    function init() {
        $(".myAdvertise-container .titleStatus li." + type.toLowerCase()).addClass("on").siblings('li').removeClass('on');
        base.showLoadingSpin();
        setHtml();
        getAmount();
        type = type.toLowerCase();
        if (type == 'buy') {
            $("#left-wrap .buy-nav-item ." + type.toLowerCase()).addClass("on");
          adverConfig.tradeType = 0;
        } else if (type == 'sell') {
            $("#left-wrap .sell-nav-item ." + type.toLowerCase()).addClass("on");
          adverConfig.tradeType = 1;
        }

        GeneralCtr.getDictList({ "parentKey": "ads_status" }).then((data) => {
            data.forEach(function(item) {
                adsStatusValueList[item.dkey] = item.dvalue;
            });
            getPageAdvertise(adverConfig); // 正式
        }, base.hideLoadingSpin);
        
        // 获取保证金
      GeneralCtr.getSysConfig('trade_btc_bail').then(data => {
        trade_btc_bail = data.cvalue + 'BTC';
      });
      GeneralCtr.getSysConfig('trade_usdt_bail').then(data => {
        trade_usdt_bail = data.cvalue + 'USDT';
      });
        
        addListener();
    }

    function setHtml() {
        base.getDealLeftText();
        $('.code').text(base.getText('编号', langType));
        $('.myAdvertise-container .titleStatus .sell').text(base.getText('出售广告', langType));
        $('.myAdvertise-container .titleStatus .buy').text(base.getText('购买广告', langType));
        $('.fy_type').text(base.getText('广告类型', langType));
        $('.en_jg').text(base.getText('价格', langType));
        $('.quantity').text(base.getText('交易数量', langType));
        $('.en_yj').text(base.getText('溢价比例', langType));
        $('.createDatetime').text(base.getText('创建时间', langType));
        $('.status').text(base.getText('交易状态', langType));
        $('.zwgg').text(base.getText('暂无广告'));
    }
    // 初始化交易记录分页器
    function initPagination(data) {
        $(".myAdvertise #adver-pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: adverConfig.limit,
            jump: true,
            coping: true,
            prevContent: '<img src="/static/images/arrow---left.png" />',
            nextContent: '<img src="/static/images/arrow---right.png" />',
            keepShowPN: true,
            totalData: data.totalCount,
            jumpIptCls: 'pagination-ipt',
            jumpBtnCls: 'pagination-btn',
            jumpBtn: base.getText('确定', langType),
            isHide: true,
            callback: function(_this) {
                if (_this.getCurrent() != adverConfig.start) {
                    base.showLoadingSpin();
                  adverConfig.start = _this.getCurrent();
                    getPageAdvertise(adverConfig);
                }
            }
        });
    }

    // 获取广告列表
    function getPageAdvertise(config, refresh) {
        return TradeCtr.getPageAdvertiseUser(config, refresh).then((data) => {
            var lists = data.list;
            if (data.list.length > 0) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content-adver").html(html);
                $(".myAdvertise-container .trade-list-wrap .no-data").addClass("hidden")
            } else {
              config.start == 1 && $("#content-adver").empty();
                // config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
          config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);

    }

    function buildHtml(item) {
        var operationHtml = '';
        var tipHtml = '';
        var goHrefHtml = '';

        //当前用户为买家
            //待发布
            if (adverConfig.statusList == null || adverConfig.statusList.length == 1) {
                operationHtml = `<div class="am-button am-button-red publish mr20 goHref" href-type="_blank" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>
        		 			<div class="am-button publish goHref am-button-ghost am-button-out" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('查看', langType)}</div>`

                //已发布
            } else {
                if (item.status == '0') {
                    operationHtml = `<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`;
                    let isMoneyOk = '';
                    if(item.tradeCoin === 'BTC') {
                        isMoneyOk = +item.truePrice * moneyBTC;
                    }else {
                        isMoneyOk = +item.truePrice * moneyUSDT;
                    }
                    console.log(isMoneyOk, item.minTrade);
                    if(!item.fixTrade && isMoneyOk < item.minTrade) {
                        tipHtml=`<p style="
                            position: absolute;
                            width: 400px;
                            font-size: 12px;
                            color: #d83b37;
                        "
                        >${base.getText(`您的${item.tradeCoin}账户余额低于该广告的最小交易值，别人将不可见`)}</p>`
                    }
                    if(item.fixTrade) {
                        let minFixTrade = item.fixTrade.split('||')[0];
                        if(isMoneyOk < minFixTrade) {
                            tipHtml=`<p style="
                            position: absolute;
                            width: 400px;
                            font-size: 12px;
                            color: #d83b37;
                        "
                        >${base.getText(`您的${item.tradeCoin}账户余额低于该广告的最小交易值，别人将不可见`)}</p>`
                        }
                    }
                } else if (item.status == "1"){
                  operationHtml = `<div class="am-button am-button-red publish mr20 goHref" href-type="_blank" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`;
                  tipHtml=`<p style="
                    position: absolute;
                    width: 300px;
                    font-size: 12px;
                    color: #d83b37;
                    "
                  >${base.getText('您的出价当前未公开显示,请存入')}<span class="goHref" style="color: #E9967A;" data-href="../wallet/wallet.html">${base.getText('保证金')}(${item.tradeCoin === 'BTC' ? trade_btc_bail : trade_usdt_bail})</span></p>`
                }else if (item.status == "2") {//已下架
                  operationHtml = `<div class="am-button am-button-red publish mr20 goHref" href-type="_blank" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`
                }
            }
        if (type == 'buy') {
            operationHtml += `<div class="goHref am-button am-button-red" data-href="../trade/buy-detail.html?code=${item.code}&isD=1&statusList=${adverConfig.statusList}&status=${item.status}&coin=${item.tradeCoin}&type=${type}">${base.getText('查看')}</div>`
        } else if (type == 'sell') {
            operationHtml += `<div class="goHref  am-button am-button-red" data-href="../trade/sell-detail.html?code=${item.code}&isD=1&statusList=${adverConfig.statusList}&status=${item.status}&coin=${item.tradeCoin}&type=${type}">${base.getText('查看')}</div>`
        }
        setTimeout(() => {
          if(item.status === "2") {
            $(`#buyitem${item.code.substring(item.code.length-8)}`).prop('checked', false);
          }
        }, 200);
        return `<tr>
        <td><label class="switch"><input type="checkbox" id="buyitem${item.code.substring(item.code.length-8)}" checked="${item.status !== '2' ? true : false}" data-status="${item.status}" data-code="${item.code}"><div class="slider round"></div></label></td>
        <td class="code">${item.code.substring(item.code.length-8)} ${tipHtml}</td>
        <td class="type">${typeList[type.toLowerCase()]}${item.tradeCoin?item.tradeCoin:'ETH'}</td>
        <td>${item.user.country ? `<img src='${base.getPic(item.user.country.pic)}' /><span>${item.user.country.interSimpleCode}</span>` : '-'} </td>
        <td class="price">${item.truePrice ? item.truePrice.toFixed(2) : '-'} ${item.truePrice ? item.tradeCurrency : ''} </td>
        <td class="price">${(item.premiumRate * 100).toFixed(2) + '%'}</td>
        <td class="createDatetime">${base.formatDate(item.createDatetime)} </td>
        <td class="status tc">${item.status=="-1"?base.getText('交谈中') + ','+adsStatusValueList[item.status]:adsStatusValueList[item.status]}</td>
          <td>${operationHtml}</td>
    </tr>`;



    }
    
    /**
     * 获取当前余额
     */
    function getAmount() {
        AccountCtr.getAccount().then((accountData) => {
            accountData.accountList.forEach(item => {
                if (item.currency === 'BTC') {
                    moneyBTC = base.formatMoney((item.amount - item.frozenAmount),'',item.currency);
                }
                if(item.currency === 'USDT') {
                    moneyUSDT = base.formatMoney((item.amount - item.frozenAmount),'',item.currency);
                }
            });
        });
    }

    function addListener() {
        $(".myAdvertise-container .titleStatus li").click(function() {
            var _this = $(this);
            base.gohrefReplace("../order/order-list.html?coin=BTC" + "&adverType=" + $(this).attr("data-type").toUpperCase());
            _this.addClass("on").siblings('li').removeClass("on");
            if (_this.hasClass("wait")) {
              adverConfig.statusList = ['0'];
            } else if (_this.hasClass('already')) {
              adverConfig.statusList = ['1', '2', '3'];
            }
          adverConfig.start = 1;
            base.showLoadingSpin();
            getPageAdvertise(adverConfig, true);
        });

        $(document).on("click", "#content-adver input", function() {
            if ($(this).prop('checked') === false){
                var adsCode = $(this).attr("data-code");
                var adsStatus = $(this).attr("data-status");
                if(+adsStatus !== 2) {
                  TradeCtr.downAdvertise(adsCode).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功'));
                    setTimeout(function() {
                      base.showLoadingSpin();
                      adverConfig.start = 1;
                      getPageAdvertise(adverConfig, true)
                    }, 1000)
                  }, () => {
                    $(this).prop('checked', false);
                    base.hideLoadingSpin();
                  })
                }
            }else {
              var adsCode = $(this).attr("data-code");
              var adsStatus = $(this).attr("data-status");
              if(+adsStatus === 2) {
                base.showLoadingSpin();
                TradeCtr.upAdvertise(adsCode).then(() => {
                  base.hideLoadingSpin();
                  base.showMsg(base.getText('操作成功'));
                  setTimeout(function() {
                    base.showLoadingSpin();
                    adverConfig.start = 1;
                    getPageAdvertise(adverConfig, true)
                  }, 1000)
                }, () => {
                  $(this).prop('checked', true);
                  base.hideLoadingSpin();
                })
              }
            }
        });
        $('.adver-select span').click(function() {
          $(this).addClass('set_sp').siblings().removeClass('set_sp');
          adverConfig.coin = $(this).attr('data-coin') || '';
          getPageAdvertise(adverConfig, true);
        });
    }
});