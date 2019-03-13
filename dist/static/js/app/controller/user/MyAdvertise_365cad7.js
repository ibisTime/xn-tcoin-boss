'use strict';

define('js/app/controller/user/MyAdvertise', ['js/app/controller/base', 'js/app/interface/AccountCtr', 'js/app/interface/GeneralCtr', 'js/app/interface/TradeCtr', 'js/lib/pagination/jquery.pagination', 'js/app/controller/Top', 'js/app/controller/foo', 'js/app/controller/public/DealLeft'], function (base, AccountCtr, GeneralCtr, TradeCtr, pagination, Top, Foo, DealLeft) {
    var langType = localStorage.getItem('langType') || 'ZH';
    var type = base.getUrlParam("adverType") || "buy"; // buy: 购买，sell:出售
    var coin = base.getUrlParam("coin") || 'BTC'; // wait
    var adsStatusValueList = {}; // 广告狀態
    var config = {
        start: 1,
        limit: 10,
        tradeType: 1,
        statusList: [0, 1],
        userId: base.getUserId(),
        coin: coin.toUpperCase()
    };
    var typeList = {
        "buy": base.getText('购买', langType),
        "sell": base.getText('出售', langType)
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

        GeneralCtr.getDictList({ "parentKey": "ads_status" }).then(function (data) {
            data.forEach(function (item) {
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
        $('.quantity').text(base.getText('剩余数量', langType));
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
            callback: function callback(_this) {
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
        return TradeCtr.getPageAdvertiseUser(config, refresh).then(function (data) {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach(function (item, i) {
                    html += buildHtml(item);
                });
                $("#content-adver").html(html);
                $(".myAdvertise-container .trade-list-wrap .no-data").addClass("hidden");
            } else {
                config.start == 1 && $("#content-adver").empty();
                config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden");
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
    }

    function buildHtml(item) {
        var operationHtml = '';

        //待发布
        if (config.statusList == null || config.statusList.length == 1) {
            operationHtml = '<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=' + item.code + '&mod=gg&coin=' + item.tradeCoin + '">' + base.getText('编辑', langType) + '</div>\n        \t\t\t\t\t<div class="am-button publish goHref am-button-ghost am-button-out" data-href="../trade/advertise.html?code=' + item.code + '&mod=gg&coin=' + item.tradeCoin + '">' + base.getText('查看', langType) + '</div>';

            //已发布
        } else {
            // 待发布
            if (item.status == '0') {
                operationHtml = '<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=' + item.code + '&mod=gg&coin=' + item.tradeCoin + '">' + base.getText('编辑', langType) + '</div>';
                //已上架
            } else if (item.status == "1") {
                operationHtml = '<div class="am-button am-button-red publish mr20 goHref" data-href="../trade/advertise.html?code=' + item.code + '&mod=gg&coin=' + item.tradeCoin + '">' + base.getText('编辑', langType) + '</div>\n                                <div class="am-button am-button-red mr20 doDownBtn" data-code="' + item.code + '">' + base.getText('下架', langType) + '</div>';
            }
            if (type == 'buy') {
                operationHtml += '<div class="am-button goHref am-button-red" data-href="../trade/buy-detail.html?code=' + item.code + '&isD=1">' + base.getText('查看详情', langType) + '</div>';
            } else if (type == 'sell') {
                operationHtml += '<div class="am-button goHref am-button-red" data-href="../trade/sell-detail.html?code=' + item.code + '&isD=1">' + base.getText('查看详情', langType) + '</div>';
            }
        }
        return '<tr>\n        <td class="type">' + typeList[type.toLowerCase()] + (item.tradeCoin ? item.tradeCoin : 'ETH') + '</td>\n        <td class="price">' + (item.truePrice ? item.truePrice.toFixed(2) : '-') + '</td>\n        <td class="quantity ">' + (item.leftCountString ? base.formatMoney(item.leftCountString, '', item.tradeCoin) : '-') + '</td>\n        <td class="price">' + ((item.premiumRate * 100).toFixed(2) + '%') + '</td>\n        <td class="createDatetime">' + base.formatDate(item.createDatetime) + '</td>\n        <td class="status tc">' + (item.status == "-1" ? base.getText('交谈中', langType) + ',' + adsStatusValueList[item.status] : adsStatusValueList[item.status]) + '</td>\n        <td class="operation" style="padding-right: 0;">\n            ' + operationHtml + '\n        </td>\n    </tr>';
    }

    function addListener() {
        $(".myAdvertise-container .titleStatus li").click(function () {
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

        $("#content-adver").on("click", ".doDownBtn", function () {
            var adsCode = $(this).attr("data-code");
            base.confirm(base.getText('确认下架此广告？', langType), base.getText('取消', langType), base.getText('确定', langType)).then(function () {
                base.showLoadingSpin();
                TradeCtr.downAdvertise(adsCode).then(function () {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功', langType));
                    setTimeout(function () {
                        base.showLoadingSpin();
                        config.start = 1;
                        getPageAdvertise(true);
                    }, 1500);
                }, base.hideLoadingSpin);
            }, base.emptyFun);
        });
    }
});