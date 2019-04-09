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
    var type = base.getUrlParam("adverType") || "buy"; // buy: 购买，sell:出售
    var coin = base.getUrlParam("coin") || 'BTC'; // wait
    var adsStatusValueList = {}; // 广告狀態
    var config = {
        start: 1,
        limit: 10,
        tradeType: 1,
        statusList: [0, 1,2],
        userId: base.getUserId(),
        coin: coin.toUpperCase()
    }
    var typeList = {
        "buy": base.getText('购买', langType),
        "sell": base.getText('出售', langType),
    };
    init();

    function init() {
        $(".myAdvertise-container .titleStatus li." + type.toLowerCase()).addClass("on").siblings('li').removeClass('on');
        base.showLoadingSpin();
        setHtml();
        type = type.toLowerCase();
        if (type == 'buy') {
            $("#left-wrap .buy-nav-item ." + type.toLowerCase()).addClass("on");
            config.tradeType = 0;
        } else if (type == 'sell') {
            $("#left-wrap .sell-nav-item ." + type.toLowerCase()).addClass("on");
            config.tradeType = 1;
        }

        GeneralCtr.getDictList({ "parentKey": "ads_status" }).then((data) => {
            data.forEach(function(item) {
                adsStatusValueList[item.dkey] = item.dvalue;
            });
            getPageAdvertise(); // 正式
        }, base.hideLoadingSpin);
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
    }
    // 初始化交易记录分页器
    function initPagination(data) {
        $(".myAdvertise #adver-pagination .pagination").pagination({
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
            jumpBtn: base.getText('确定', langType),
            isHide: true,
            callback: function(_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getPageAdvertise(config);
                }
            }
        });
    }

    // 获取广告列表
    function getPageAdvertise(refresh) {
        return TradeCtr.getPageAdvertiseUser(config, refresh).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content-adver").html(html);
                $(".myAdvertise-container .trade-list-wrap .no-data").addClass("hidden")
            } else {
                config.start == 1 && $("#content-adver").empty()
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
            if (config.statusList == null || config.statusList.length == 1) {
                operationHtml = `<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>
        		 			<div class="am-button publish goHref am-button-ghost am-button-out" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('查看', langType)}</div>`

                //已发布
            } else {
                // 待发布
                // if(item.status == '0') {
                //operationHtml = `<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=${item.code}&mod=gg&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`
                //已上架
                // <div class="am-button am-button-red mr20 doDownBtn" data-code="${item.code}">${base.getText('下架', langType)}</div>
                if (item.status == '0') {
                    operationHtml = `<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`
                } else if (item.status == "1"){
                  operationHtml = `<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=${item.code}&type=${type}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`;
                    tipHtml=`<p style="
                position: absolute;
                width: 300px;
                font-size: 12px;
                color: #d83b37;
                ">您的出价当前未公开显示,请存入保证金</p>`
                }else if (item.status == "2") {//已下架
                }
            }
        if (type == 'buy') {
            operationHtml += `<div class="goHref am-button am-button-red" data-href="../trade/buy-detail.html?code=${item.code}&isD=1&statusList=${config.statusList}&status=${item.status}&tradeCoin=${item.tradeCoin}&type=${type}">查看</div>`
        } else if (type == 'sell') {
            operationHtml += `<div class="goHref  am-button am-button-red" data-href="../trade/sell-detail.html?code=${item.code}&isD=1&statusList=${config.statusList}&status=${item.status}&tradeCoin=${item.tradeCoin}&type=${type}">查看</div>`
        }
        setTimeout(() => {
          if(item.status === "2") {
            $(`#buyitem${item.code.substring(item.code.length-8)}`).prop('checked', false);
          }
        }, 200);
        // console.log(operationHtml)
        // console.log(base.getUrlParam('type'))
        // if(base.getUrlParam('type') == 'buy'){
        //     $(".buy-operation").html(operationHtml)
        // }
        // if(base.getUrlParam('type') == 'sell'){
        //     $(".sell-operation").html(operationHtml)
        // }
        return `<tr>
        <td><label class="switch"><input type="checkbox" id="buyitem${item.code.substring(item.code.length-8)}" checked="${item.status !== '2' ? true : false}" data-status="${item.status}" data-code="${item.code}"><div class="slider round"></div></label></td>
        <td class="code">${item.code.substring(item.code.length-8)} ${tipHtml}</td>
        <td class="type">${typeList[type.toLowerCase()]}${item.tradeCoin?item.tradeCoin:'ETH'}</td>
        <td>${item.user.country ? `<img src='${base.getPic(item.user.country.pic)}' /><span>${item.user.country.interSimpleCode}</span>` : '-'} </td>
        <td class="price">${item.truePrice ? item.truePrice.toFixed(2) : '-'} ${item.truePrice ? item.tradeCurrency : ''} </td>
        <td class="price">${(item.premiumRate * 100).toFixed(2) + '%'}</td>
        <td class="createDatetime">${base.formatDate(item.createDatetime)} </td>
        <td class="status tc">${item.status=="-1"?base.getText('交谈中', langType) + ','+adsStatusValueList[item.status]:adsStatusValueList[item.status]}</td>
          <td>${operationHtml}</td>
    </tr>`;



    }

    function addListener() {
        $(".myAdvertise-container .titleStatus li").click(function() {
            var _this = $(this);
            base.gohrefReplace("../order/order-list.html?coin=BTC" + "&adverType=" + $(this).attr("data-type").toUpperCase());
            _this.addClass("on").siblings('li').removeClass("on");
            if (_this.hasClass("wait")) {
                config.statusList = ['0'];
            } else if (_this.hasClass('already')) {
                config.statusList = ['1', '2', '3'];
            }
            config.start = 1;
            base.showLoadingSpin();
            getPageAdvertise(true);
        });

        $(document).on("click", "#content-adver input", function() {
            if ($(this).prop('checked') == false){
                var adsCode = $(this).attr("data-code");
                var adsStatus = $(this).attr("data-status");
                if(+adsStatus === 0) {
                  TradeCtr.downAdvertise(adsCode).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功', langType));
                    setTimeout(function() {
                      base.showLoadingSpin();
                      config.start = 1;
                      getPageAdvertise(true)
                    }, 1000)
                  }, base.hideLoadingSpin)
                }
            }else {
              var adsCode = $(this).attr("data-code");
              var adsStatus = $(this).attr("data-status");
              if(+adsStatus === 2) {
                base.showLoadingSpin();
                TradeCtr.upAdvertise(adsCode).then(() => {
                  base.hideLoadingSpin();
                  base.showMsg(base.getText('操作成功', langType));
                  setTimeout(function() {
                    base.showLoadingSpin();
                    config.start = 1;
                    getPageAdvertise(true)
                  }, 1000)
                }, base.hideLoadingSpin)
              }
            }
        })
    }
});