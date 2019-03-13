'use strict';

define('js/app/controller/public/Invitation', ['js/app/controller/base', 'js/lib/pagination/jquery.pagination', 'js/app/interface/GeneralCtr', 'js/app/interface/UserCtr', 'js/app/controller/Top', 'js/app/controller/foo'], function (base, pagination, GeneralCtr, UserCtr, Top, Foo) {
    var inviteCode = sessionStorage.getItem("inviteCode");
    var langType = localStorage.getItem('langType') || 'ZH';

    var config = {
        start: 1,
        limit: 5,
        userId: base.getUserId()
    };
    var inviNumber = 0;
    var INVITATION_HREF = '';
    init();

    function init() {
        // base.showLoadingSpin();
        $(".head-nav-wrap .invitation").addClass("active"); //DOMAIN_NAME
        setHtml();
        // web端文字推荐
        $("#invitationDialog .hrefWrap p").html(DOMAIN_NAME + "/user/register.html?inviteCode=" + inviteCode);

        $.when(getInvitationHistory(config), getInvitation(), getSysConfig(), getInvitaFn()
        // getUserInviteProfit()
        );
        if (langType == 'EN') {
            $('#invitationBtn').css({ 'width': 'auto', 'padding': '0 15px' });
            $('.pt10').css('display', 'flex');
        }
        addListener();
    }

    function setHtml() {
        $('title').text(base.getText('邀请好友') + '-' + base.getText('FUNMVP区块链技术应用实验平台'));
        $('.invi-en_yq').text(base.getText('成功邀请', langType));
        $('.invi-en_sy').text(base.getText('注册分佣奖励', langType));
        $('#qrcodeBtn').text(base.getText('二维码推荐', langType));
        $('#invitationBtn').text(base.getText('文字推荐', langType));
        $('.sel-span').text(base.getText('邀请记录', langType));
        $('.invi-en_yhm').text(base.getText('用户名', langType));
        $('.invi-en_zc').text(base.getText('注册时间', langType));
        $('.invi-en_jy').text(base.getText('交易总额', langType));
        $('.fy_ren').text('(' + base.getText('人', langType) + ')');
        $('.fy_hdgz').text(base.getText('活动规则', langType));
        $('.fy_smewm').text(base.getText('扫描二维码邀请注册', langType));
        $('.fy_fzljsm').text(base.getText('复制下面这段文字...', langType));
        $('.invi-en_yjn').text(base.getText('注册分佣奖励') + '(FMVP)');
    }

    // 获取邀请好友的链接
    function getInvitaFn() {
        return GeneralCtr.getSysConfig('invite_url').then(function (data) {
            INVITATION_HREF = data.cvalue;
            // h5 二维码推荐
            var qrcode = new QRCode('qrcode', INVITATION_HREF + "/user/register.html?inviteCode=" + inviteCode);
            qrcode.makeCode(INVITATION_HREF + "/user/register.html?inviteCode=" + inviteCode);
        });
    }

    //获取我推荐的人数和收益统计
    function getInvitation() {
        return UserCtr.getInvitation().then(function (data) {
            $('.regAcount').text(data.regAcount);
        }, base.hideLoadingSpin);
    }

    //活动说明
    function getSysConfig() {
        return GeneralCtr.getSysConfig("activity_rule").then(function (data) {
            $(".activity-content").html(data.cvalue.replace(/\n/g, '<br>'));
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
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
            callback: function callback(_this) {
                if (_this.getCurrent() != config.start) {
                    base.showLoadingSpin();
                    config.start = _this.getCurrent();
                    getInvitationHistory(config);
                }
            }
        });
    }

    //获取推荐人历史
    function getInvitationHistory(refresh) {
        return UserCtr.getInvitationHistory(config, refresh).then(function (data) {
            if (data.list.length === 0) {
                $('.no-data').removeClass('hidden');
            }
            var lists = data.list;
            inviNumber = data.totalCount;
            $('.inviteCount').text(inviNumber);
            if (data.list.length) {
                var html = "";
                lists.forEach(function (item, i) {
                    var tradeAwardCount = base.formatMoney('' + item.tradeAwardCount, '', 'FMVP');
                    var regAwardCount = base.formatMoney('' + item.regAwardCount, '', 'FMVP');
                    var awardCount = parseFloat(tradeAwardCount) + parseFloat(regAwardCount) + ' FMVP ';
                    var tradeAwardTxt = '(' + base.getText('交易佣金', langType) + '\uFF1A' + tradeAwardCount + ')';
                    if (item.tradeAwardCount != 0) {
                        awardCount += tradeAwardTxt;
                    }
                    html += '<tr>\n                        <td>' + item.nickname + '</td>\n                        <td>' + base.datetime(item.createDatetime) + '</td>\n                        <td>' + regAwardCount + ' FMVP</td>\n                    </tr>';
                });
                $("#yq-content").html(html);
            }
            config.start == 1 && initPagination(data);
            base.hideLoadingSpin();
        }, base.hideLoadingSpin);
    }

    function addListener() {
        $("#qrcodeBtn").click(function () {
            $("#qrcodeDialog").removeClass("hidden");
        });
        $("#invitationBtn").click(function () {
            $("#invitationDialog").removeClass("hidden");
        });
    }
});