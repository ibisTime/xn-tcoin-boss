define([
    'app/controller/base',
    'pagination',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, pagination, TradeCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var coin = base.getUrlParam("coin") || 'BTC'; // 币种
    //币种
    var config = {
        start: 1,
        limit: 10,
        tradeType: 1,
        coin: coin.toUpperCase()
    };
  var bizTypeList = {
    "0": base.getText('支付宝'),
    "1": base.getText('微信'),
    "2": base.getText('银联转账'),
    "3": base.getText('苹果礼品卡'),
    "4": base.getText('steam礼品卡'),
    "5": base.getText('银行转账'),
    "6": base.getText('尼日利亚银行转账'),
    "7": base.getText('Paypal 贝宝'),
    "8": base.getText('西联')
  };
    // 货币下拉
    var payTypeMoneyList = [{
        key: 'CNY',
        value: base.getText('CNY人民币')
    }, {
        key: 'USD',
        value: base.getText('USD美元')
    }];
    // 付款类型下拉
  var payTypeList = [{
    key: '0',
    value: base.getText('支付宝', langType)
  }, {
    key: '1',
    value: base.getText('微信', langType)
  }, {
    key: '2',
    value: base.getText('银联转账', langType)
  }, {
    key: '3',
    value: base.getText('苹果礼品卡', langType)
  }, {
    key: '4',
    value: base.getText('steam礼品卡', langType)
  }, {
    key: '5',
    value: base.getText('银行转账', langType)
  },{
    key: '6',
    value: base.getText('尼日利亚银行转账', langType)
  }, {
    key: '5',
    value: base.getText('Paypal 贝宝', langType)
  },{
    key: '6',
    value: base.getText('西联', langType)
  }];

    init();

    function init() {
        base.showLoadingSpin();
        getCoinList();
        setHtml();
        getPageAdvertise(config);
        addListener();
    }

    function setHtml() {
        base.getDealLeftText();
        $('.head-nav-wrap .index').addClass('active');
        $('.en_nick').text(base.getText('昵称'));
        $('.en_pay').text(base.getText('付款方式'));
        $('.en_count').text(base.getText('Avaliable'));
        $('.en_xe').text(base.getText('限额'));
        $('.en_price').text(base.getText('价格'));
        $('.show-search').text(base.getText('全部货币，全部付款方式'));
        $('.searchType-wrap .en_sgg').text(base.getText('搜广告'));
        $('.searchType-wrap .user').text(base.getText('搜用户'));
        $('.advertisement-wrap .hb').text(base.getText('货币'));
        $('.advertisement-wrap .fkfs').text(base.getText('货币'));
        $('.search-btn .search-txt').text(base.getText('搜索'));
        if(langType === 'EN'){
            $('.search-wrap .searchType-wrap').css('width', '200px');
            $('.search-wrap .search-con').css('width', '562px');
        }
        var payTypeMoneyHtml = `<option value="">${base.getText('请选择')}</option>`;
        payTypeMoneyList.map(item => {
            payTypeMoneyHtml += `<option value="${item.key}">${item.value}</option>`
        });

        var payTypeHtml = `<option value="">${base.getText('请选择')}</option>`;
        payTypeList.map(item => {
            payTypeHtml += `<option value="${item.key}">${item.value}</option>`
        });
        $('.advertisement-wrap .payTypeMoney').html(payTypeMoneyHtml);
        $('.advertisement-wrap .payType').html(payTypeHtml);
    }

    //根据config配置设置 币种列表
    function getCoinList() {
        var coinList = base.getCoinArray();
        var listHtml = '';
        coinList.map(item => {
            listHtml += `<li class="${item.coin.toLowerCase()}" data-coin="${item.coin}">${item.coin}</li>`;
        });
        $("#coin-top ul").html(listHtml);
        if (coin) {
            $("#coin-top ul li." + coin.toLowerCase()).addClass("on");
        } else {
            $("#coin-top ul li:nth-of-type(1)").addClass("on");
            config.coin = coinList[0].coin.toUpperCase();
        }
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
                    getPageAdvertise(config);
                }
            }
        });
    }

    //分页查询广告
    function getPageAdvertise(config) {
        return TradeCtr.getPageAdvertise(config, true).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content").html(html);
                $(".trade-list-wrap .no-data").addClass("hidden")

                $("#content .operation .goHref").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
                $("#content .photoWrap").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
            } else {
                config.start == 1 && $("#content").empty()
                config.start == 1 && $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtml(item) {
        //头像
        var photoHtml = ""
        if (item.user.photo) {
            photoHtml = `<div class="photo" style="background-image:url('${base.getAvatar(item.user.photo)}')"></div>`
        } else {
            var tmpl = item.user.nickname.substring(0, 1).toUpperCase();
            photoHtml = `<div class="photo"><div class="noPhoto">${tmpl}</div></div>`
        }

        //登录状态
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

        if (item.userId == base.getUserId()) {
            operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/advertise.html?code=${item.code}&coin=${item.tradeCoin}">${base.getText('编辑', langType)}</div>`;
        } else {
            operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/buy-detail.html?code=${item.code}">${base.getText('购买', langType)}${item.tradeCoin}</div>`;
        }
        let hpCount = 0;
        if (item.userStatistics.beiPingJiaCount != 0) {
            hpCount = base.getPercentum(item.userStatistics.beiHaoPingCount, item.userStatistics.beiPingJiaCount);
        }
        let payTypeList = {
            '0': '/static/images/pay-zfb.png',
            '1': '/static/images/pay-weChat.png',
            '2': '/static/images/pay-bankcard.png',
        };

        let payTypeHtml = ``;
        if (payTypeList[item.payType]) {
            payTypeHtml = `<i class="icon" style="background-image: url('${payTypeList[item.payType]}')"></i>`;
        } else {
            payTypeHtml = bizTypeList[item.payType];
        }
        return `<tr>
					<td class="nickname" style="padding-left: 20px;">
						<div class="photoWrap fl goHref" data-href="../user/user-detail.html?coin=${item.tradeCoin}&userId=${item.userId}&adsCode=${item.code}" style="margin-right: 10px;">
							${photoHtml}
							<div class="dot ${loginStatus}"></div>
						</div>
                        <samp class="name">${item.user.nickname ? item.user.nickname : '-'}</samp>
                        <p class="n-dist"><samp>${base.getText('Trades', langType)}<i>${item.userStatistics.jiaoYiCount}</i></samp> ·
                            <samp>${base.getText('好评度', langType)}<i>${hpCount}</i></samp> ·
                            <samp>${base.getText('信任', langType)}<i>${item.userStatistics.beiXinRenCount}</i></samp>
                        </p>
					</td>
					<td class="avaliable">${base.formatMoney(item.leftCountString, '', item.tradeCoin)}</td>
					<td class="limit">${item.minTrade}-${item.maxTrade} ${item.tradeCurrency}</td>
					<td class="price">${item.truePrice.toFixed(2)} ${item.tradeCurrency}</td>
					<td class="payType">${payTypeHtml}</td>
					<td class="operation">
						${operationHtml}
					</td>
				</tr>`
    }

    //用户昵称查询广告
    function getListAdvertiseNickname(nickName) {
        return TradeCtr.getListAdvertiseNickname(nickName, true).then((data) => {
            var lists = data;
            if (lists.length) {
                var html = "";
                lists.forEach((item, i) => {
                    if (item.tradeType == '1s') {
                        html += buildHtml(item);
                    }
                });
                $("#content").html(html);
                $(".trade-list-wrap .no-data").addClass("hidden")

                $("#content .operation .goHref").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
                $("#content .photoWrap").off("click").click(function() {
                    if (!base.isLogin()) {
                        base.goLogin();
                        return false;
                    } else {
                        var thishref = $(this).attr("data-href");
                        base.gohref(thishref)
                    }
                })
            } else {
                $("#content").empty();
                $(".trade-list-wrap .no-data").removeClass("hidden")
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)

    }

    function addListener() {
        $("#searchTypeWrap .select-ul li").click(function() {
            var _this = $(this);
            var _thisType = $(this).attr("data-type")

            if ($("#searchTypeWrap .show-wrap").attr("data-type") != _thisType) {
                $("#searchTypeWrap .show-wrap").attr("data-type", _thisType);
                $("#searchTypeWrap .show-wrap samp").text(_this.text());
                $("#searchConWrap ." + _thisType).removeClass("hidden").siblings().addClass("hidden")
            }
        })

        $("#searchBtn").click(function() {
            var _searchType = $("#searchTypeWrap .show-wrap").attr("data-type");
            //搜广告
            if (_searchType == "adver") {
                if ($("#searchConWrap .minPrice").val()) {
                    config.minPrice = $("#searchConWrap .minPrice").val();
                } else {
                    delete config.minPrice;
                }
                if ($("#searchConWrap .maxPrice").val()) {
                    config.maxPrice = $("#searchConWrap .maxPrice").val();
                } else {
                    delete config.maxPrice;
                }
                if ($("#searchConWrap .payType").val()) {
                    config.payType = $("#searchConWrap .payType").val();
                  switch(config.payType) {
                    case '0':
                      $('#left-wrap .en_zf01').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '1':
                      $('#left-wrap .en_zf02').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '2':
                      $('#left-wrap .en_zf03').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '3':
                      $('#left-wrap .en_zf04').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '4':
                      $('#left-wrap .en_zf05').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '5':
                      $('#left-wrap .en_zf06').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '6':
                      $('#left-wrap .en_zf07').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '7':
                      $('#left-wrap .en_zf08').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                    case '8':
                      $('#left-wrap .en_zf09').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
                      break;
                  }
                } else {
                    delete config.payType
                }
                if ($("#searchConWrap .payTypeMoney").val()) {
                    config.tradeCurrency = $("#searchConWrap .payTypeMoney").val();
                } else {
                    delete config.tradeCurrency
                }

                config.start = 1;
                base.showLoadingSpin();

                getPageAdvertise(config);
                //搜用户
            } else if (_searchType == "user") {
                if ($("#searchConWrap .nickname").val()) {
                    base.showLoadingSpin()
                    getListAdvertiseNickname($("#searchConWrap .nickname").val())
                }
            }
        });

        // 点击付款方式筛选数据
        $('#left-wrap').click(function(ev) {
            ev = ev || window.event;
            let target = ev.target;
            let payType = $(target).attr('data-value');
            let payConfig = {
                start: 1,
                limit: 10,
                tradeType: 1,
                payType,
                coin: coin.toUpperCase()
            };
          switch(payType) {
            case '0':
              $("#searchConWrap .payType").val('0');
              $('#left-wrap .en_zf01').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '1':
              $("#searchConWrap .payType").val('1');
              $('#left-wrap .en_zf02').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '2':
              $("#searchConWrap .payType").val('2');
              $('#left-wrap .en_zf03').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '3':
              $("#searchConWrap .payType").val('3');
              $('#left-wrap .en_zf04').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '4':
              $("#searchConWrap .payType").val('4');
              $('#left-wrap .en_zf05').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '5':
              $("#searchConWrap .payType").val('5');
              $('#left-wrap .en_zf06').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '6':
              $("#searchConWrap .payType").val('6');
              $('#left-wrap .en_zf07').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '7':
              $("#searchConWrap .payType").val('7');
              $('#left-wrap .en_zf08').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
            case '8':
              $("#searchConWrap .payType").val('8');
              $('#left-wrap .en_zf09').addClass('sel-nav_item').parents().siblings().children().removeClass('sel-nav_item');
              break;
          }
          base.showLoadingSpin();
          getPageAdvertise(payConfig);
        });

        //币种点击
        $("#coin-top ul li").click(function() {
            base.gohref("../trade/buy-list.html?coin=" + $(this).attr("data-coin").toUpperCase() + "&mod=gm")
        });

        $('.show-search').click(() => {
            let reg = /none/g;
            if (reg.test($('.search-wrap').attr('class'))) {
                $('.search-wrap').removeClass('none');
            } else {
                $('.search-wrap').addClass('none');
            }
        })
    }
});