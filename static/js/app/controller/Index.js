define([
    'app/controller/base',
    'app/util/handlebarsHelpers',
    'swiper',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Handlebars, Swiper, GeneralCtr, UserCtr, TradeCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let userId = base.getUrlParam('userId') || '';
    let token = base.getUrlParam('token') || '';
    let adverData = []; // 广告数据
    let aarketData = []; // 行情数据
    let typeList = {
        '0': base.getText('出售', langType),
        '1': base.getText('购买', langType)
    }

    $(document).ready(function () {
        if (userId && token) {
            getUserInfo();
        }
        init();
    });

    // 初始化页面
    function init() {
        base.showLoadingSpin();
        // 英文隐藏
        if(langType === 'EN'){
            $('.i-zh').addClass('none');
            $('.i-en').removeClass('none').css({
                'font-size': '30px',
                'line-height': '1.8'
            });
            $('.contact-txt').css('width', '39%');
            $('.sxjymmzy').html('&nbsp;');
            $('.en_space').html('&nbsp;');
            $('.title_txt').removeClass('none').css({
                'margin-bottom': '70px',
            });
        }
        $(".head-nav-wrap .index").addClass("active");
        $('.in-en_jq').text(base.getText('尽情游戏 无尽精彩', langType));
        $('.in-en_xss').text(base.getText('驯兽师', langType));
        $('.in-en_jxhm').text(base.getText('精彩画面, 任你游', langType));
        $('.in-en_jryx').text(base.getText('进入游戏', langType));
        $('.in-en_dh').text(base.getText('二手车兑换', langType));
        $('.in-en_jjtc').text(base.getText('即将推出，敬请期待', langType));
        $('.in-en_ksdh').text(base.getText('开始兑换', langType));
        $('.in-en_wsm').text(base.getText('为什么要选择FUNMVP？', langType));
        $('.fy_safe').text(base.getText('买卖自由', langType));
        $('.fy_safe_con').html(base.getText('支持多种数字货币的币币交易与场外交易，买卖自由、双向交易、快速方便', langType));
        $('.fy_teliable').text(base.getText('安全可靠', langType));
        $('.fy_teliable_con').html(base.getText('SSL、多重加密等银行级别安全技术，十年技术安全团队、多重保障资产安全', langType));
        $('.fy_convenient').text(base.getText('交易便捷', langType));
        $('.fy_convenient_con').html(base.getText('支持多终端交易，WEB、APP行情及时掌握，快速交易，贴心服务，全球市场，交易随时随地', langType));

        $.when(
            getBanner(),
            getPageAdvertiseUser(),
            getTradePair()
        ).then(() => {
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);

        addListener();

    }
    // 游戏跳转
    function getUserInfo() {
        UserCtr.getUser(true).then((item) => {
            sessionStorage.setItem("nickname", item.nickname);
            sessionStorage.setItem("googleAuthFlag", item.googleAuthFlag);
            sessionStorage.setItem("mobile",item.mobile ? item.mobile : '');
            sessionStorage.setItem("email",item.email ? item.email : '');
            sessionStorage.setItem("inviteCode", item.userId);

            $("#head-user-wrap .nickname").text(item.nickname);
            $("#head-user-wrap").removeClass("hidden");
        })
    }

    //获取最新4条广告
    function getPageAdvertiseUser() {
        return TradeCtr.getPageAdvertiseUser({
            start: '1',
            limit: '4',
            statusList: ['1']
        }).then(data => {
            adverData = data.list;
            let adverHtml = '';
            let payImageList = {
                '0': '/static/images/zfb.png',
                '1': '/static/images/wxpay.png',
                '2': '/static/images/yhk.png',
            };
            adverData.forEach(item => {
                let payImage = payImageList[item.payType];

                let mButHtml = '';
                mButHtml = `<button class="goHref" data-href="${item.tradeType == 0 ? '../trade/sell-list.html?coin=' + item.tradeCoin + '&mod=cs' : '../trade/buy-list.html?coin=' + item.tradeCoin + '&mod=gm'}">${typeList[item.tradeType]}</button>`
                adverHtml += `<li>
                    <div class="bb-img">
                        <img src="${item.tradeType == 1 ? '/static/images/buy.png' : '/static/images/sell.png'}" alt="">
                    </div>
                    <h5>${typeList[item.tradeType]} ${item.tradeCoin}</h5>
                    <p>${base.getText('价格', langType)}：<span>${(Math.floor(item.truePrice * 1000)/1000).toFixed(3)}</span>  ${item.tradeCurrency}</p>
                    <p>${base.getText('交易限额', langType)}：<span>${item.minTrade}</span> ～ <span>${item.maxTrade}</span>  ${item.tradeCurrency}</p>
                    <p>${base.getText('付款方式', langType)}：<span><img src="${payImage}" alt=""></span></p>
                    <div class="btn-box">
                        ${mButHtml}
                    </div>
                </li>`
            })
            $('.bb-jy ul').html(adverHtml);
        });
    }

    // 初始化swiper
    function initSwiperBanner() {
        var _swiper = $("#swiper");
        if (_swiper.find('.swiper-slide').length <= 1) {
            _swiper.find('.swiper-pagination').hide();
        }
        var mySwiper = new Swiper('#swiper', {
            'autoplay': 5000,
            'pagination': '#swiper',
            'pagination': '#swiper .swiper-pagination',
            'paginationClickable': true,
            'preventClicksPropagation': true,
            'loop': true,
            'speed': 600
        });
        $('#swiper .arrow-left').on('click', function(e) {
            e.preventDefault()
            mySwiper.swipePrev()
        })
        $('#swiper .arrow-right').on('click', function(e) {
            e.preventDefault()
            mySwiper.swipeNext()
        })
    }

    // 获取banner
    function getBanner(refresh) {
        return GeneralCtr.getBanner({
            type: '2',
            location: 'web_banner'
        }, refresh).then((data) => {
            var bannerHtml = "";
            data.forEach((d) => {
                var pics = base.getPicArr(d.pic);
                pics.forEach((pic) => {
                    if (d.url){
                        bannerHtml += `<div class='swiper-slide'><a href="${d.url || ""}" class="banner" data-url="${d.url || ""}" style="background-image:url(${pic});"></a></div>`;
                    } else {
                        bannerHtml += `<div class='swiper-slide'><div class="banner" data-url="${d.url || ""}" style="background-image:url(${pic});"></div></div>`;
                    }
                });
            });
            base.hideLoadingSpin()
            $("#swiper .swiper-wrapper").html(bannerHtml);
            initSwiperBanner();
        }, (msg) => {
            base.showMsg(msg || base.getText('加载失败', langType));
        });
    }

    // 市场（交易对）
    function getTradePair() {
        return TradeCtr.getTradePair({
            start: '1',
            limit: '10'
        }).then(data => {
            let bzfList = [];
            aarketData = data.list;
            aarketData.forEach(item => {
                let exchangeRate = item.exchangeRate;
                bzfList.push(`${exchangeRate < 0 ? '' : '+'}` + (exchangeRate * 100).toFixed(2));
            })
            aarketData.length = 2;
            let aarketHtml = '';
            aarketData.forEach((item, index) => {
                aarketHtml += `<li class="toHref" style="cursor: pointer;" data-href="../bbdeal/bbdeal.html" data-sym="${item.toSymbol}">
                    <p><span>${item.symbol}</span> / <span>${item.toSymbol}</span></p>
                    <h5>${(Math.floor(item.price * 100000000) / 100000000).toFixed(8)}</h5>
                    <p><span class="zj"></span><span class="zf">${bzfList[index]}</span>% <span class="zf-img"><img src=${bzfList[index].indexOf('-') == 0 ? '/static/images/xj.png' : '/static/images/ss.png'} alt=""></span></p>
                </li>`
            })
            $('.bb-hq_r ul').html(aarketHtml);
            $('.bb-hq_r li').click(function(){
                let href = $(this).attr('data-href');
                let sym = $(this).attr('data-sym');
                let setBazDeal = {
                    symbol: 'FMVP',
                    toSymbol: 'BTC'
                }
                if(sym == 'ETH'){
                    setBazDeal.toSymbol = 'ETH';
                    setBazDeal.toUnit = base.getCoinUnit('ETH');
                }
                sessionStorage.setItem('setBazDeal', JSON.stringify(setBazDeal));
                base.gohref(href);
            })
        });
    }

    // 获取币种行情
    function getMarket(ex_type) {
        return Ajax.post('650101', {
            referCurrency: ex_type
        });
    }

    function addListener() {

        $("#swiper").on("touchstart", ".swiper-slide div", function(e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper").on("touchend", ".swiper-slide div", function(e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if (Math.abs(xx) < 6) {
                var url = me.attr('data-url');
                if (url) {
                    if (!/^http/i.test(url)) {
                        location.href = "http://" + url;
                    } else {
                        location.href = url;
                    }
                }

            }
        });

    }
});