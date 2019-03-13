'use strict';

define('js/app/controller/wallet/wallet_jilu', ['js/app/controller/base', 'js/lib/pagination/jquery.pagination', 'js/app/util/ajax', 'js/app/interface/GeneralCtr', 'js/app/interface/TradeCtr', 'js/app/controller/Top', 'js/app/controller/foo'], function (base, pagination, Ajax, GeneralCtr, TradeCtr, Top, Foo) {
    var langType = localStorage.getItem('langType') || 'ZH';
    var userCTSList = [];

    var statusList = {};
    var typeList = {
        '0': base.getText('买入', langType),
        '1': base.getText('卖出', langType)
    };

    var j_config = {
        limit: '10',
        start: '1',
        userId: base.getUserId()
    };

    init();

    function init() {
        base.showLoadingSpin();
        $('.tradeRecord-wrap-title').text(base.getText('订单记录', langType));
        $('.wajl-en_lx').text(base.getText('类型', langType));
        $('.wajl-en_bz').text(base.getText('币种', langType));
        $('.wajl-en_zje').text(base.getText('总金额', langType));
        $('.date_n').text(base.getText('Quantity', langType));
        $('.date_li').text(base.getText('下单日期', langType));
        $('.wajl-en_zt').text(base.getText('状态', langType));
        $('.wajl-en_cz').text(base.getText('操作', langType));
        if (langType == 'EN') {
            $('title').text('orders records-FUNMVP blockchain technology application experimental platform');
        }
        $('title').text('订单记录-FUNMVP区块链技术应用实验平台');
        addListener();
        GeneralCtr.getDictList({
            "parentKey": "accept_order_status"
        }).then(function (data) {
            data.forEach(function (item) {
                statusList[item.dkey] = item.dvalue;
            });
            getCTSFn(j_config);
        });
    }

    function getCTSFn(j_config) {
        getCTSData(j_config).then(function (data) {
            userCTSList = data.list;
            var ctsHtml = '';
            userCTSList.forEach(function (item) {
                var pHtml = '';
                if (item.type == 0) {
                    switch (item.status) {
                        case '0':
                            pHtml = '<p>\n                                <span>' + base.getText('标记付款', langType) + '</span>\n                                <span>' + base.getText('取消订单', langType) + '</span>\n                                <span class="goHref" data-href="../wallet/wallet-det.html?code=' + item.code + '">' + base.getText('详情', langType) + '</span>\n                                </p>';
                            break;
                        default:
                            pHtml = '<p>\n                                <span class="goHref" data-href="../wallet/wallet-det.html?code=' + item.code + '">' + base.getText('详情', langType) + '</span>\n                            </p>';
                    }
                }
                if (item.type == 1) {
                    switch (item.status) {
                        case '0':
                            pHtml = '<p>\n                                <span>' + base.getText('取消订单', langType) + '</span>\n                                <span class="goHref" data-href="../wallet/wallet-det.html?code=' + item.code + '">' + base.getText('详情', langType) + '</span>\n                                </p>';
                            break;
                        default:
                            pHtml = '<p>\n                                <span class="goHref" data-href="../wallet/wallet-det.html?code=' + item.code + '">' + base.getText('详情', langType) + '</span>\n                            </p>';
                    }
                }

                ctsHtml += '<li>\n                        <p class="' + (item.type == 0 ? 'd-mr' : 'd-mc') + '">' + typeList[item.type] + '</p>\n                        <p>' + item.tradeCurrency + '</p>\n                        <p>' + (Math.floor(item.tradeAmount * 100) / 100).toFixed(2) + '</p>\n                        <p class="date_num">' + base.formatMoney('' + item.count, '', 'FMVP') + '</p>\n                        <p class="date_p">' + base.formateDatetime(item.createDatetime) + '</p>\n                        <p>' + statusList[item.status] + '</p>\n                        <div class="cz-type" data-code="' + item.code + '">\n                        ' + pHtml + '\n                        </div>\n                    </li>';
            });

            $('.x-order_warp ul').html(ctsHtml);
            j_config.start == 1 && initPagination(data);
            addListener();
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
    }

    // 初始化交易记录分页器
    function initPagination(data) {
        $("#pagination .pagination").pagination({
            pageCount: data.totalPage,
            showData: j_config.limit,
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
                if (_this.getCurrent() != j_config.start) {
                    base.showLoadingSpin();
                    j_config.start = _this.getCurrent();
                    getCTSFn(j_config);
                }
            }
        });
    }

    //查询我的承兑商信息
    function getCTSData(j_config) {
        return Ajax.get('625287', j_config);
    }

    function addListener() {
        $('.cz-type span').off('click').click(function () {
            var selTxt = $(this).text();
            var code = $(this).parents('.cz-type').data('code');
            var config = {
                userId: base.getUserId(),
                code: code
            };
            switch (selTxt) {
                case base.getText('标记付款', langType):
                    TradeCtr.bjPlayfo(config).then(function () {
                        location.reload();
                    });
                    break;
                case base.getText('取消订单', langType):
                    TradeCtr.qxOrder(config).then(function () {
                        location.reload();
                    });
                    break;
            }
        });
    }
});