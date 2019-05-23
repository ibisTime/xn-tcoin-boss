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
    let userId = base.getUrlParam('userId');
    let tradeType = base.getUrlParam('tradeType') || 0; // 买卖类型
    let currency = base.getUrlParam('coin') || 'BTC';
    let nickname = '';
    let coinList = {},
        payType = {};
    let payTypeList = [];
    let platTagList = [];
    let tradeTypeList = {
        '1': base.getText('购买'),
        '0': base.getText('出售')
    };
    let coinName = {
        'BTC': '比特币',
        'USDT': 'USDT'
    };
    let config = {
        start: 1,
        limit: 10,
        tradeType: tradeType,
        status: '0',
        userId: userId,
        coin: currency // 测试
    };
    let relationConfig = {
        toUser: userId
    };
    let evaluateConfig = {
        objectUserId: userId,
        limit: 100,
        start: 0
    };
    let starLevelObj = {
        '0': 'lv_bad',
        '1': 'lv_zd',
        '2': 'lv_god'
    };
    let starLevelGod = 0, starLevelZd = 0, starLevelBad = 0;
    let evaluateData = [];
    init();

    function init() {
        $('title').text(base.getText('个人主页') + '-' +base.getText('区块链技术应用实验平台'));
        $('.udet-en_jy').text(base.getText('交易次数', langType));
        $('.udet-en_xr').text(base.getText('信任人数', langType));
        $('.udet-en_hp').text(base.getText('好评度', langType));
        $('.udet-en_ls').text(base.getText('历史交易', langType));
        $('.k-fb').text(base.getText('发布的广告', langType));
        $('.titleWrap .buy').text(base.getText('在线购买', langType));
        $('.titleWrap .sell').text(base.getText('在线出售', langType));
        $('.userDetail-container .yck').html(`${base.getText('已查看')}<i id="interval"></i>`);
        $('.userDetail-container .zmsy').html(base.getText('正面声誉'));
        $('.userDetail-container .zxsy').html(base.getText('中性声誉'));
        $('.userDetail-container .fmsy').html(base.getText('负面声誉'));
        $('.userDetail-container .user-left-wrap .yz').html(base.getText('验证'));
        $('.userDetail-container .user-left-wrap .xx').html(base.getText('信息'));
        $('.userDetail-container .jyhzf').html(`<samp class="jiaoyifangCount"></samp> ${base.getText('个交易合作方')}`);
        $('.userDetail-container .cjy').html(`<samp class="jiaoYiCount"></samp> ${base.getText('次交易')}`);
        $('.userDetail-container .jyl').html(`<samp class="tradeCounBtc"></samp> ${currency} ${base.getText('交易量')}`);
        $('.userDetail-container .xrf').html(`${base.getText('信任方')} <samp class="beiXinRenCount"></samp> ${base.getText('人')}`);
        $('.userDetail-container .pbf').html(`${base.getText('屏蔽方')} <samp class="pingBiCount"></samp> ${base.getText('人')}`);
        $('.userDetail-container .yjr').html(`${base.getText('已加入')} <samp id="registerTime"></samp>`);
        $('.userDetail-container .title-wrap').html(`${base.getText('向')}<samp class="nickname"></samp><samp id="tradeType"></samp>${base.getText(coinName[currency])}`);
        $('.userDetail-container .public-container .price').html(base.getText('价格'));
        $('.userDetail-container .public-container .fanwei').html(base.getText('范围'));
        $('.userDetail-container .public-container .action').html(base.getText('支付方式'));
        $('.userDetail-container .public-container .speed').html(base.getText('速度'));
        $('.zwgg').html(base.getText('暂无广告'));
        $('#tradeType').html(tradeTypeList[tradeType]);

        base.showLoadingSpin();
        // getUserRelation() // 测试
        // 查询币种和付款方式
        $.when(
            GeneralCtr.getDictList({ "parentKey": "coin" }),
            GeneralCtr.getDictList({ "parentKey": "pay_type" }),
            getUserEvaluate(evaluateConfig),
            getUserRelation(), // 正式
            getUserDetail(),
            getPayTypeList(),
            getplatTagList(),
        ).then((data1, data2) => {
            data1.forEach(function(item) {
                coinList[item.dkey] = item.dvalue;
            });
            data2.forEach(function(item) {
                payType[item.dkey] = item.dvalue;
            });
          getPageAdvertise();
        });
        addListener();
    }
    
    function getUserEvaluate(getUserEvaluate) {
        base.showLoadingSpin();
        TradeCtr.userEvaluate(getUserEvaluate).then(data => {
            if(data.list.length > 0) {
                evaluateData = data.list.map(item => {
                    return {
                        photo: item.fromUserInfo.photo ? base.getAvatar(item.fromUserInfo.photo) : item.fromUserInfo.nickname.substr(0, 1),
                        isPhoto: !!item.fromUserInfo.photo,
                        nickName: item.fromUserInfo.nickname,
                        createDatetime: base.formatDate(item.createDatetime),
                        content: item.content,
                        paymentName: item.paymentName,
                        paymentCode: item.paymentCode,
                        starLevel: item.starLevel,
                        buyUser: item.fromUser
                    }
                });
                let contentPj = '';
                console.log(data);
                evaluateData.forEach(item => {
                    let lvStyle = starLevelObj[item.starLevel] || '';
                    contentPj += `<tr>
                                <td>
                                    <div class="trade-pj_box goHref" data-href="../user/user-detail.html?userId=${item.buyUser}">
                                        ${item.isPhoto ?
                      `<div class="left" style="background-image: url('${item.photo}');">
                                        </div>` :
                      `<div class="left no-photo" >
                                            ${item.photo}
                                        </div>`}
                                        <div class="right">
                                            <p>${item.nickName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="goHref" href-type="_blank" data-href="../order/order-detail.html?code=${item.tradeOrderCode}&buyUser=${item.buyUser}">
                                    <div>
                                        <div class="con-pj_top">
                                            ${item.content} <span class="${lvStyle}">+1</span>
                                        </div>
                                        <div class="con-pj_bottom">
                                            ${item.createDatetime}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="tran-pj goHref" data-href="../index.html?payment=${item.paymentCode}">
                                        ${item.paymentName}
                                    </div>
                                </td>
                            </tr>`
                });
                $('#content-pj').html(contentPj);
            }else {
                $('#content-pj').html('');
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
    }
    // 支付方式
    function getPayTypeList() {
        return TradeCtr.getPayTypeList({ status: 1, tradeType: 1, symbol: currency }).then((res) => {
            base.hideLoadingSpin();
            res.map((item) => {
                payTypeList.push({
                    key: item.code,
                    value: item.name,
                    adsCount: item.adsCount
                });
            });
        }, base.hideLoadingSpin);
    }
    // 标签列表
    function getplatTagList() {
        return TradeCtr.getTagsList({ status: 1 }).then((res) => {
            base.hideLoadingSpin();
            res.map((item) => {
                platTagList[item.id] = item.name;
            });
        }, base.hideLoadingSpin);
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
            var photoHtml = "";
                // 头像
            if (data.photo) {
                photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(data.photo)}')"></div>`
            } else {
                var tmpl = data.nickname ? data.nickname.substring(0, 1).toUpperCase() : '-';
                photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
            }
            nickname = data.nickname ? data.nickname : '-';
            $('.userDetail-container .nickname').html(data.nickname ? data.nickname : '-');
            $('.userDetail-top .photoWrap').html(photoHtml);

            let loginStatus = '';
            let time = base.calculateDays(data.lastLogin, new Date())
            if (time <= 10) {
                loginStatus = 'green'
            } else if (time <= 30) {
                loginStatus = 'yellow'
            } else {
                loginStatus = 'gray'
            }
            let interval = base.fun(Date.parse(data.lastLogin), new Date());
            let registerTime = base.fun(Date.parse(data.createDatetime), new Date());
            $("#loginStatus").addClass(loginStatus);
            $("#interval").html(interval);
            $("#registerTime").html(registerTime);

            // 邮箱验证，手机验证，身份验证
            $('#user-yanzheng .email').html(data.email ? base.getText('邮箱已验证', langType) : base.getText('邮箱未验证', langType));
            $('#user-yanzheng .tel').html(data.mobile ? base.getText('手机已验证', langType) : base.getText('手机未验证', langType));

            $('#userStatistics .jiaoyifangCount').html(data.userStatistics.jiaoyifangCount);
            $('#userStatistics .jiaoYiCount').html(data.userStatistics.jiaoYiCount);
            $('#userStatistics .beiXinRenCount').html(data.userStatistics.beiXinRenCount);
            $('#userStatistics .pingBiCount').html(data.userStatistics.pingBiCount);
            $('#beiHaoPingCount').html(data.userStatistics.beiHaoPingCount);
            $('#beiZhongPingCount').html(data.userStatistics.beiZhongPingCount);
            $('#beiChaPingCount').html(data.userStatistics.beiChaPingCount);
            $('#userStatistics .tradeCounBtc').html(currency === 'BTC' ? data.userStatistics.tradeCountBtc : data.userStatistics.tradeCountUsdt);
            $('#introduce').html(data.introduce);
            starLevelGod = +data.userStatistics.beiHaoPingCount;
            starLevelZd = +data.userStatistics.beiZhongPingCount;
            starLevelBad = +data.userStatistics.beiChaPingCount;
            $('.title-wrap_pj .pj-num').text(starLevelGod + starLevelZd + starLevelBad);
            $('.title-wrap_pj .god-num').text(starLevelGod);
            $('.title-wrap_pj .zd-num').text(starLevelZd);
            $('.title-wrap_pj .bad-num').text(starLevelBad);
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
        // 登录状态
        var loginStatus = '';
        var time = base.calculateDays(item.user.lastLogin, new Date())
        if (time <= 10) {
            loginStatus = 'green'
        } else if (time <= 30) {
            loginStatus = 'yellow'
        } else {
            loginStatus = 'gray'
        }
        var operationHtml = '';

        if (item.tradeType == '1') {
            operationHtml = `<div class="goHref user-buy" data-href="../trade/buy-detail.html?code=${item.code}&coin=${item.tradeCoin}">${base.getText('购买')}</div>`
        } else {
            operationHtml = `<div class="goHref user-sell" data-href="../trade/sell-detail.html?code=${item.code}&coin=${item.tradeCoin}">${base.getText('出售', langType)}</div>`
        }

        let hpCount = 0;
        if (item.userStatistics.beiPingJiaCount != 0) {
            hpCount = base.getPercentum(item.userStatistics.beiHaoPingCount, item.userStatistics.beiPingJiaCount);
        }

        let payTypeHtml = ``;
        if(item.payType) {
            payTypeList.map((k) => {
                if(item.payType === k.key) {
                    payTypeHtml = `<i>${k.value ? k.value : ''}</i>`;
                }
            })
        }
        let paySecondHtml = ``;
        if(item.platTag) {
            item.platTag.split('||').map((it) => {
              paySecondHtml += `${platTagList[it] ? `<span>${platTagList[it]}</span>` : ''}`;
            });
        }
        let country = '/static/images/China.png';
        let countryHtml = ``;
        countryHtml = `<i class="icon country" style="background-image: url('${country}')"></i>`;

        let interval = base.fun(Date.parse(item.user.lastLogin), new Date());

        let speenHtml = '';
        if (item.releaseTime) {
            speenHtml = item.releaseTime + base.getText('分钟');
        } else {
            speenHtml = `<i class="new">${base.getText('新')}</i>`
        }

        return `<tr>
                    <td class="operation">
                        ${operationHtml}
                    </td>
                    <td class="price">${item.truePrice.toFixed(2)} ${item.tradeCurrency}</td>
                    <td class="limit">${item.minTrade}-${item.maxTrade} ${item.tradeCurrency}</td>
                    <td class="payType">
                        <p class="payType_pfirst">
                            ${payTypeHtml}
                        </p>
                        <p class="payType_psecond">
                            ${paySecondHtml}
                        </p>
                    </td>
                    <td class="speed">
                    ${speenHtml}
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
                if(!base.isLogin()) {
                  base.showMsg(base.getText('请登录后操作', langType));
                  return;
                }
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
            if(!base.isLogin()) {
                base.showMsg(base.getText('请登录后操作', langType));
                return;
            }
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
        });
        
        // 查看全部评价
        $('.title-wrap_pj .pj-all').click(function() {
            return getUserEvaluate(evaluateConfig);
        });
        
        // 查看好评
        $('.title-wrap_pj .pj-god').click(function() {
            return getUserEvaluate({
                starLevel: '2',
                ...evaluateConfig
            });
        });
        
        // 查看中评
        $('.title-wrap_pj .pj-zd').click(function() {
            return getUserEvaluate({
                starLevel: '1',
                ...evaluateConfig
            });
        });
    
        // 查看差评
        $('.title-wrap_pj .pj-bad').click(function() {
            return getUserEvaluate({
                starLevel: '0',
                ...evaluateConfig
            });
        });

        // 查看评价
        $('.userDetail-container').on('click', '.topj', function(){
            base.gohref(`../user/user-pj.html?userId=${userId}&nickname=${nickname}`);
        })
    }
});