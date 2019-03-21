define([
    'app/controller/base',
    'pagination',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, pagination, Validate, smsCaptcha, AccountCtr, GeneralCtr, UserCtr, TradeCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var userId = base.getUrlParam('userId');
    var adsCode = base.getUrlParam('adsCode');
    var currency = base.getUrlParam('coin') || 'BTC';
    var nickname = '';
    var coinList = {},
        payType = {};
    var config = {
        start: 1,
        limit: 10,
        tradeType: 0,
        status: '1',
        userId: userId,
        coin: currency // 测试
    }
    var relationConfig = {
        toUser: userId
    }
    init();

    function init() {
        $('title').text(base.getText('个人主页') + '-' +base.getText('FUNMVP区块链技术应用实验平台'));
        $('.udet-en_jy').text(base.getText('交易次数', langType));
        $('.udet-en_xr').text(base.getText('信任人数', langType));
        $('.udet-en_hp').text(base.getText('好评度', langType));
        $('.udet-en_ls').text(base.getText('历史交易', langType));
        $('.k-fb').text(base.getText('发布的广告', langType));
        $('.buy').text(base.getText('在线购买', langType));
        $('.sell').text(base.getText('在线出售', langType));
        $('.currency').text(base.getText('交易币种', langType));
        $('.oayType').text(base.getText('付款方式', langType));
        $('.limit').text(base.getText('交易限额', langType));
        $('.price').text(base.getText('价格', langType));

        base.showLoadingSpin();
        // getUserRelation() // 测试
        // 查询币种和付款方式
        $.when(
            GeneralCtr.getDictList({ "parentKey": "coin" }),
            GeneralCtr.getDictList({ "parentKey": "pay_type" }),
            getUserRelation(), // 正式
            getUserDetail()
        ).then((data1, data2) => {
            data1.forEach(function(item) {
                coinList[item.dkey] = item.dvalue;
            })
            data2.forEach(function(item) {
                payType[item.dkey] = item.dvalue;
            });
            // getAdvertiseDetail();
            getPageAdvertise();
        })
        addListener();
    }

    // 查询用户的信任关系
    function getUserRelation() {
        return UserCtr.getUserRelation(currency, userId).then((data) => {
            $('.k-userbtn .trust').attr('data-isTrust', data.isTrust);
            $('.k-userbtn .trust').html($('.k-userbtn .trust').attr('data-isTrust') != '0' ? base.getText('已信任', langType) : base.getText('信任', langType));

            $('.k-userbtn .black').attr('data-isAddBlackList', data.isAddBlackList);
            $('.k-userbtn .black').html($('.k-userbtn .black').attr('data-isAddBlackList') != '0' ? base.getText('已拉黑', langType) : base.getText('屏蔽', langType));

            var totalTradeCount = data.totalTradeCount == '0' ? '0' : base.formatMoney(data.totalTradeCount, '0', currency) + '+';
            $('.totalTradeCount').html(totalTradeCount + currency);
        }, () => {})
    }
    // 获取用户详情
    function getUserDetail() {
        return UserCtr.getUser(true, userId).then((data) => {
            var photoHtml = ""
                // 头像
            if (data.photo) {
                photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(data.photo)}')"></div>`
            } else {
                var tmpl = data.nickname ? data.nickname.substring(0, 1).toUpperCase() : '-';
                photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
            }
            nickname = data.nickname ? data.nickname : '-';
            $('.userDetail-top .nickname').html(data.nickname ? data.nickname : '-');
            $('.userDetail-top .photoWrap').html(photoHtml);

            // 邮箱验证，手机验证，身份验证
            $('.bindWrap .email samp').html(data.email ? base.getText('邮箱已验证', langType) : base.getText('邮箱未验证', langType));
            $('.bindWrap .mobile samp').html(data.mobile ? base.getText('手机已验证', langType) : base.getText('手机未验证', langType));
            $('.bindWrap .identity samp').html(data.realName ? base.getText('身份已验证', langType) : base.getText('身份未验证', langType));

            let jiaoYiCount = data.userStatistics ? data.userStatistics.jiaoYiCount : '-';
            let beiXinRenCount = data.userStatistics ? data.userStatistics.beiXinRenCount : '-';
            let beiHaoPingCount = data.userStatistics ? data.userStatistics.beiHaoPingCount : '-';
            let beiPingJiaCount = data.userStatistics ? data.userStatistics.beiPingJiaCount : '-';
            $('.jiaoYiCount').html(jiaoYiCount);
            $('.beiXinRenCount').html(beiXinRenCount);
            $('.beiHaoPingCount').html(base.getPercentum(beiHaoPingCount, beiPingJiaCount));
            base.hideLoadingSpin();
        }, () => {});
    }

    // 分页查广告
    function getPageAdvertise() {
        TradeCtr.getPageAdvertiseUser(config, true).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content").html(html);
                $(".trade-list-wrap .no-data").addClass("hidden")
            } else {
                config.start == 1 && $("#content").empty()
                config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
        $('.userName').text(nickname);
    }

    function buildHtml(item) {
        var operationHtml = '';
        if (item.tradeType == '1') {
            operationHtml = `<div class="am-button goHref" data-href="../trade/buy-detail.html?code=${item.code}&coin=${item.tradeCoin}">${base.getText('购买')}</div>`
        } else {
            operationHtml = `<div class="am-button goHref" data-href="../trade/sell-detail.html?code=${item.code}&coin=${item.tradeCoin}">${base.getText('出售', langType)}</div>`
        }

        return `<tr>
					<td class="currency">${item.tradeCoin}</td>
					<td class="payType">${payType[item.payType]}</td>
					<td class="limit">${item.minTrade}-${item.maxTrade} ${item.tradeCurrency}</td>
					<td class="price">${item.truePrice} ${item.tradeCurrency}/${item.tradeCoin?item.tradeCoin:' ETH'}</td>
					<td class="operation">
						${operationHtml}
					</td>
				</tr>`

    }

    // 初始化交易记录分页器
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
            jumpBtn: base.getText('确定', langType),
            isHide: true,
            callback: function(_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getPageAdvertise();
                }
            }
        });
    }


    function addListener() {
        // 切换在线购买和在线出售
        $('.titleStatus li').click(function() {
            var _this = $(this)
            _this.addClass("on").siblings('li').removeClass("on");
            if (_this.hasClass("sell")) {
                config.tradeType = 1;
            } else if (_this.hasClass("buy")) {
                config.tradeType = 0;
            }
            base.showLoadingSpin();
            config.start = 1;
            getPageAdvertise();
        })

        // 信任按钮的点击事件
        $('.k-userbtn .trust').click(function() {
                relationConfig.type = '1';
                var _this = $(this);
                base.showLoadingSpin();
                if (_this.attr("data-isTrust") == '1') {

                    UserCtr.removeUserRelation(relationConfig, true).then((data) => {
                        _this.empty().append(base.getText('信任', langType));
                        _this.attr("data-isTrust", _this.attr("data-isTrust") == '1' ? '0' : '1');
                        base.hideLoadingSpin()
                        base.showMsg(base.getText('已取消信任', langType));
                        getUserDetail();
                        location.reload();
                    }, base.hideLoadingSpin)
                } else {
                    UserCtr.addUserRelation(relationConfig, true).then((data) => {
                        _this.empty().append(base.getText('已信任', langType));
                        if ($('.k-userbtn .black').attr("data-isAddBlackList") == '1') {
                            $('.k-userbtn .black').empty().append(base.getText('屏蔽', langType));
                            $('.k-userbtn .black').attr("data-isAddBlackList", !_this.attr("data-isAddBlackList"))
                        }

                        _this.attr("data-isTrust", _this.attr("data-isTrust") == '1' ? '0' : '1');
                        base.hideLoadingSpin()
                        base.showMsg(base.getText('已信任', langType));
                        getUserDetail();
                        location.reload();
                    }, base.hideLoadingSpin)
                }
            })
            // 屏蔽按钮的点击事件
        $('.k-userbtn .black').click(function() {
            relationConfig.type = '0';
            var _this = $(this);
            base.showLoadingSpin();
            if (_this.attr("data-isAddBlackList") == '1') {
                UserCtr.removeUserRelation(relationConfig, true).then((data) => {
                    _this.empty().append(base.getText('屏蔽', langType));
                    _this.attr("data-isAddBlackList", _this.attr("data-isAddBlackList") == '1' ? '0' : '1');
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('已取消拉黑', langType));
                    getUserDetail();
                    location.reload();
                }, base.hideLoadingSpin)
            } else {
                UserCtr.addUserRelation(relationConfig, true).then((data) => {
                    _this.empty().append(base.getText('已拉黑', langType));
                    if ($('.k-userbtn .trust').attr("data-isTrust") == '1') {
                        $('.k-userbtn .trust').empty().append(base.getText('信任', langType));
                        $('.k-userbtn .trust').attr("data-isTrust", !_this.attr("data-isTrust"))
                    }
                    _this.attr("data-isAddBlackList", _this.attr("data-isAddBlackList") == '1' ? '0' : '1');
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('已拉黑', langType));
                    getUserDetail();
                    location.reload();
                }, base.hideLoadingSpin)
            }
        })

        // 查看评价
        $('.userDetail-container').on('click', '.topj', function(){
            base.gohref(`../user/user-pj.html?userId=${userId}&nickname=${nickname}`);
        })
    }
});