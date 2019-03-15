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
  // var bizTypeList = {
  //   "0": base.getText('支付宝  '),
  //   "1": base.getText('微信'),
  //   "2": base.getText('银联转账'),
  //   "3": base.getText('苹果礼品卡'),
  //   "4": base.getText('steam礼品卡'),
  //   "5": base.getText('银行转账'),
  //   "6": base.getText('尼日利亚银行转账'),
  //   "7": base.getText('Paypal 贝宝'),
  //   "8": base.getText('西联')
  // };
    // 货币下拉
    var payTypeMoneyList = [];
    // 付款类型下拉
  // var payTypeList = [{
  //   key: '0',
  //   value: base.getText('支付宝', langType)
  // }, {
  //   key: '1',
  //   value: base.getText('微信', langType)
  // }, {
  //   key: '2',
  //   value: base.getText('银联转账', langType)
  // }, {
  //   key: '3',
  //   value: base.getText('苹果礼品卡', langType)
  // }, {
  //   key: '4',
  //   value: base.getText('steam礼品卡', langType)
  // }, {
  //   key: '5',
  //   value: base.getText('银行转账', langType)
  // },{
  //   key: '6',
  //   value: base.getText('尼日利亚银行转账', langType)
  // }, {
  //   key: '5',
  //   value: base.getText('Paypal 贝宝', langType)
  // },{
  //   key: '6',
  //   value: base.getText('西联', langType)
  // }];
  let payTypeList = [];
  let platTagList = [];
  let tradeType = 'buy';

    init();

    function init() {
        base.showLoadingSpin();
        getCoinList();
        setHtml();
        getPageAdvertise(config);
        getPayTypeList();
        getplatTagList();
        getPayTypeMoneyList();
        addListener();
    }
    // 支付方式
    function getPayTypeList() {
      return TradeCtr.getPayTypeList({ status: 1 }).then((res) => {
        base.hideLoadingSpin();
        res.map((item) => {
          payTypeList.push({
            key: item.code,
            value: item.name
          });
        });
        setHtml();
        let payTypeHtml = '';
        payTypeList.map((item, index) => {
          payTypeHtml += buildPayTypeHtml(item, index);
        });
        $('.left-item-group').html(payTypeHtml);
      }, base.hideLoadingSpin);
    }
    // 标签列表
    function getplatTagList() {
      return TradeCtr.getTagsList({ status: 1 }).then((res) => {
        base.hideLoadingSpin();
        res.map((item) => {
          platTagList[item.id] = item.name;
        });
        setHtml();
      }, base.hideLoadingSpin);
    }
    // 货币列表
    function getPayTypeMoneyList() {
      return TradeCtr.getPayCoinList().then((res) => {
        base.hideLoadingSpin();
        res.map((item) => {
          payTypeMoneyList.push({
            key: item.simpleName,
            value: item.name
          });
        });
        setHtml();
      }, base.hideLoadingSpin);
    }
    function setHtml() {
        base.getDealLeftText();
        $('.head-nav-wrap .index').addClass('active');
        $('.en_buyer').text(base.getText('买家'));
        $('.en_pay').text(base.getText('支付方法'));
        $('.en_min_max').text(base.getText('最低-最高金额'));
        // $('.en_xe').text(base.getText('限额'));
        $('.en_price').text(base.getText('每个比特币的价格'));
        $('.show-search').text(base.getText('全部货币，全部付款方式'));
        $('buy_sell .buy').text(base.getText('购买比特币'));
        $('buy_sell .sell').text(base.getText('出售比特币'));
        $('.advertisement-wrap .hb').text(base.getText('货币'));
        $('.advertisement-wrap .fkfs').text(base.getText('付款方式'));
        $('#search-btn .search-txt').text(base.getText('搜索'));
        $('#bestSearch-btn .search-txt').text(base.getText('请给我最好的'));
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

    // 构建左侧支付方式list的dom结构
    function buildPayTypeHtml(item) {
      return ` <div class="left-item">
                <div class="nav-item goHref sell-eth gm" data-value=${item.key}>
                    <span class="nav-item-type en_zf01">${item.value}</span>
                    <span class="num">1234</span>
                </div>
            </div>`
    }
    function buildHtml(item) {
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
            operationHtml = `<div class="am-button am-button-ghost goHref" data-href="../trade/buy-detail.html?code=${item.code}">${base.getText('购买', langType)}</div>`;
        }
        let hpCount = 0;
        if (item.userStatistics.beiPingJiaCount != 0) {
            hpCount = base.getPercentum(item.userStatistics.beiHaoPingCount, item.userStatistics.beiPingJiaCount);
        }
        let payTypeHtml = ``;
        if(item.payType) {
          payTypeList.map((k) => {
            if(item.payType === k.key) {
              payTypeHtml = `<i>${k.value}</i>`;
            }
          })
        }
        let paySecondHtml = ``;
        if(item.platTag) {
            item.platTag.split('||').map((item) => {
              paySecondHtml += `<span>${platTagList[item]}</span>`;
            });
          }
        let country = '/static/images/China.png';
        let countryHtml = ``;
        countryHtml = `<i class="icon country" style="background-image: url('${country}')"></i>`;

        return `<tr>
					<td class="nickname" style="padding-left: 20px;">
                        <p class="pfirst">
                            ${countryHtml}
                            <span class="dot ${loginStatus}"></span>
                            <span class="name">${item.user.nickname ? item.user.nickname : '-'}</span>
                            <span class="num">+${item.userStatistics.beiHaoPingCount}</span>
                        </p>
                        <p class="n-dist"><samp><i>2小时以前查看过</i></samp></p>
					</td>
                    <td class="payType">
                        <p class="payType_pfirst">
                            ${payTypeHtml}
                        </p>
                        <p class="payType_psecond">
                            ${paySecondHtml}
                        </p>
                    </td>
                    <td class="limit">${item.minTrade}-${item.maxTrade} ${item.tradeCurrency}</td>
                    <td class="price">${item.truePrice.toFixed(2)} ${item.tradeCurrency}</td>
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
                    if (item.tradeType == '1') {
                        html += buildHtml(item);
                    }
                });
                $("#content").append(html);
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

          if($('#payTypeMoney').val()) {
            config.price = $('#payTypeMoney').val() * 1000;
          }
          config.start = 1;
          config.tradeType = tradeType === 'buy' ? '1' : '0';
          base.showLoadingSpin();

          getPageAdvertise(config);
        });

        // 点击付款方式筛选数据
        $('.left-item-group').on('click', '.left-item', (function(ev) {
            // ev = ev || window.event;
            let target = ev.target;
            let payType = $(target).attr('data-value');
            let payConfig = {
                  start: 1,
                  limit: 10,
                  tradeType: 0,
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
        }));

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
      // 切换购买比特币/出售比特币

      // $('.buy_sell div').on('click', (e) => {
      //   let target = e.target;
      //   if (!$(target).hasClass("on")) {
      //     if($(target).hasClass('buy')) {
      //       tradeType = 'buy';
      //     } else {
      //       tradeType = 'sell';
      //     }
      //     $(target).addClass('on').siblings().removeClass('on');
      //   } else {
      //     if($(target).hasClass('buy')) {
      //       tradeType = 'sell';
      //     } else {
      //       tradeType = 'buy';
      //     }
      //     $(target).removeClass('on').siblings().addClass('on');
      //   }
      // })
      $('.buy_sell div').on('click', (e) => {
        let target = e.target;
        if($(target).hasClass('sell')) {
          base.gohref("../trade/sell-list.html");
        }
      })
    }
});