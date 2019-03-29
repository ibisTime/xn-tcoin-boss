define([
    'app/controller/base',
    'pagination',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo',
    'app/controller/public/DealLeft'
], function(base, pagination, UserCtr, Top, Foo, DealLeft) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var type = base.getUrlParam("trustType") || '1'; // 0: 你屏蔽的人，1:你信任的人，2:信任你的人
    let gohref = base.getUrlParam('go') || 'm_xr'; // m_xr: 你信任的人, xr_m: 信任你的人, m_pb:你屏蔽的人
    var config = {
        start: 1,
        limit: 10,
    };

    if (!base.isLogin()) {
        base.goLogin()
    } else {
        init();
    }

    function init() {
        base.showLoadingSpin();
        setHtml();
        switch (gohref) {
            case 'm_xr':
                $('.k-trustStatus li').eq(0).addClass('on');
                break;
            case 'xr_m':
                $('.k-trustStatus li').eq(1).addClass('on');
                break;
            case 'm_pb':
                $('.k-trustStatus li').eq(2).addClass('on');
                break;
        }
        //你屏蔽的人
        if (type == '2') {
            // $("title").text("信任您的人-HappyMoney")
            $("#left-wrap .trustYou").addClass("on");
            config.toUser = base.getUserId();
            getPageTrust(config, '1');
            //你信任的人
        } else if (type == '1') {
            // $("title").text("您信任的人-HappyMoney")
            $("#left-wrap .youTrust").addClass("on")
            config.type = type
            getPageTrust(config);
            //信任你的人
        } else if (type == '0') {
            // $("title").text("您屏蔽的人-HappyMoney")
            $("#left-wrap .youDefriend").addClass("on")
            config.type = type
            getPageTrust(config);
        }
        addListener();
    }
    function setHtml() {
        base.getDealLeftText();
        $('.en_wait').text(base.getText('我信任的', langType));
        $('.en_waitme').text(base.getText('信任我的', langType));
        $('.en_nowait').text(base.getText('我屏蔽的', langType));
    }

    // 初始化分页器
    function initPagination(data) {
        $(".trust-container #pagination .pagination").pagination({
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
                    getPageTrust(config);
                }
            }
        });
    }

    //分页获取关系
    function getPageTrust(params, to) {
        return UserCtr.getPageTrust(params, to).then((data) => {
            var lists = data.list;
            if (lists.length > 0) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtml(item);
                });
                $("#content-trust").html(html);
                config.start == 1 && initPagination(data);
            } else {
                $(".trust-container .no-data").removeClass('hidden');
                $("#pagination").addClass("hidden");
            }
            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    function buildHtml(item) {
        var photoHtml = "";
        if (item.toUserInfo) {
            if (item.toUserInfo.photo) {
                photoHtml = `<div class="photo goHref" style="background-image:url('${base.getAvatar(item.toUserInfo.photo)}')" data-href="../user/user-detail.html?userId=${item.toUserInfo.userId}"></div>`
            } else {
                var tmpl = item.toUserInfo.nickname.substring(0, 1).toUpperCase();
                photoHtml = `<div class="photo"><div class="noPhoto goHref" data-href="../user/user-detail.html?userId=${item.toUserInfo.userId}">${tmpl}</div></div>`
            }
            return `<tr>
					<td>
						<div class="photoWrap">${photoHtml}</div>
					</td>
					<td><div class="txt1">${item.toUserInfo.nickname}</div></td>
					<td>
						<div class="txt2"><p>${item.toUserInfo.userStatistics.jiaoYiCount}</p><samp>${base.getText('交易次数', langType)}</samp></div>
					</td>
					<td>
						<div class="txt2"><p>${item.toUserInfo.userStatistics.beiXinRenCount}</p><samp>${base.getText('信任人数', langType)}</samp></div>
					</td>
					<td>
						<div class="txt2"><p>${base.getPercentum(item.toUserInfo.userStatistics.beiHaoPingCount,item.toUserInfo.userStatistics.beiPingJiaCount)}</p><samp>${base.getText('好评率', langType)}</samp></div>
					</td>
					<td>
					    <div class="txt2"><p>${base.formatMoney(item.toUserInfo.userStatistics.totalTradeCountBtc,'','BTC')} + BTC</p><samp>${base.getText('历史交易', langType)}</samp></div>
					</td>
					<td>
					    跟他交易过${item.toUserInfo.userStatistics.betweenTradeTimes}次
                    </td>
				</tr>`;
        }

        if (item.fromUserInfo) {
            if (item.fromUserInfo.photo) {
                photoHtml = `<div class="photo goHref" style="background-image:url('${base.getAvatar(item.fromUserInfo.photo)}')" data-href="../user/user-detail.html?userId=${item.fromUserInfo.userId}"></div>`
            } else {
                var tmpl = item.fromUserInfo.nickname.substring(0, 1).toUpperCase();
                photoHtml = `<div class="photo"><div class="noPhoto goHref" data-href="../user/user-detail.html?userId=${item.fromUserInfo.userId}">${tmpl}</div></div>`
            }
            return `<tr>
					<td>
						<div class="photoWrap">${photoHtml}</div>
					</td>
					<td><div class="txt1">${item.fromUserInfo.nickname}</div></td>
					<td>
						<div class="txt2"><p>${item.fromUserInfo.userStatistics.jiaoYiCount}</p><samp>${base.getText('交易次数', langType)}</samp></div>
					</td>
					<td>
						<div class="txt2"><p>${item.fromUserInfo.userStatistics.beiXinRenCount}</p><samp>${base.getText('信任人数', langType)}</samp></div>
					</td>
					<td>
						<div class="txt2"><p>${base.getPercentum(item.fromUserInfo.userStatistics.beiHaoPingCount,item.fromUserInfo.userStatistics.beiPingJiaCount)}</p><samp>${base.getText('好评率', langType)}</samp></div>
					</td>
				</tr>`;
        }
    }

    function addListener() {}

    //点击事件
    allClick();

    function allClick() {

        $('.k-list').click((e) => {
            let target = e.target;
            $(target).addClass('on').siblings('li').removeClass('on');
        })
    }

});