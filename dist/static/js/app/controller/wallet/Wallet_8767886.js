'use strict';

define('js/app/controller/wallet/Wallet', ['js/app/controller/base', 'js/lib/pagination/jquery.pagination', 'js/app/module/validate/validate', 'js/app/module/smsCaptcha/smsCaptcha', 'js/app/interface/AccountCtr', 'js/app/interface/GeneralCtr', 'js/app/interface/TradeCtr', 'js/app/interface/UserCtr', 'js/app/controller/Top', 'js/app/controller/foo'], function (base, pagination, Validate, smsCaptcha, AccountCtr, GeneralCtr, TradeCtr, UserCtr, Top, Foo) {
    var langType = localStorage.getItem('langType') || 'ZH';
    var isbuy = base.getUrlParam('isbuy'); // 1 去购买   0 去出售
    var bbKey = base.getUrlParam('key');
    var withdrawFee = 0; // 取现手续费
    var currency = base.getUrlParam("c") || 'BTC'; //币种
    currency = currency.toUpperCase(); // 转换大写

    var moneyHS = 0;
    var zfType = {}; // 去购买支付方式
    var zfNumber = {};
    var zfOne = '';
    var gmType = {}; // 去出售支付方式

    var acceptRule = {};

    var picList = {};

    var buyOrderCode = ''; // 去购买订单号

    var configAddress = {
        start: 1,
        limit: 10,
        currency: currency
    };

    var addAddressWrapperRules = {
        "label": {
            required: true
        },
        "address": {
            required: true
        },
        "smsCaptcha": {
            required: true,
            sms: true
        },
        "tradePwd": {},
        "googleCaptcha": {}
    },
        sendOutWrapperRules = {
        "accountNumber": {
            required: true
        },
        "amount": {
            required: true,
            amountEth: true
        },
        "tradePwd": {
            required: true
        },
        "payCardNo": {
            required: true
        },
        "applyNote": {},
        "googleCaptcha": {}
    };

    if (!base.isLogin()) {
        base.goLogin();
    } else {
        init();
    }

    function init() {
        base.showLoadingSpin();
        setHtml();
        $('.yue').removeClass('none');
        $("#addWAddressMobile").val(base.getUserMobile());
        if (base.getGoogleAuthFlag() == "true" && base.getGoogleAuthFlag()) {
            $(".googleAuthFlag").removeClass("hidden");
            addAddressWrapperRules["googleCaptcha"] = {
                required: true,
                sms: true
            };
            sendOutWrapperRules["googleCaptcha"] = {
                required: true,
                sms: true
            };
        }
        $.when(GeneralCtr.getSysConfig('withdraw_fee'), // 提现手续费
        getUserAllMoneyX(), getAcceptRule()).then(function (withdrawFeeData) {
            base.hideLoadingSpin();
            withdrawFee = parseFloat(withdrawFeeData.cvalue) * 100 + '%';
            getAccount();
        }, function () {
            base.hideLoadingSpin();
        });
        // 获取银行卡
        getBankData();
        // 获取银行渠道
        getGmBankData();
    }

    function setHtml() {
        // $('title').text(base.getText('钱包-FUNMVP区块链技术应用实验平台'));
        $('.wall-en_zzc').text(base.getText('当前余额', langType));
        $('.wall-en_bz').text(base.getText('币种', langType));
        $('.wall-en_ky').text(base.getText('可用', langType));
        $('.wall-en_dj').text(base.getText('冻结', langType));
        $('.wall-en_cz').text(base.getText('操作', langType));
    }
    //总资产
    function getUserAllMoneyX() {
        return UserCtr.userAllMoneyX('CNY').then(function (data) {
            $('.u-bb').text(data.symbol);
            $('.u-money').text((Math.floor(data.currency * 100) / 100).toFixed(2));
        });
    }
    // 获取银行卡
    function getBankData() {
        return AccountCtr.getBankData().then(function (data) {
            if (data.length > 0) {
                data.forEach(function (item) {
                    zfType[item.bankName] = item.bankCode;
                    zfNumber[item.bankCode] = item.bankcardNumber;
                    picList[item.bankCode] = item.pic;
                });
                zfOne = data[0].bankName;
            }
        });
    }
    // 获取银行渠道
    function getGmBankData() {
        return AccountCtr.getGmBankData().then(function (data) {
            data.forEach(function (item) {
                gmType[item.bankName] = item.bankCode;
            });
        });
    }

    // 获取承兑商FMVP价格
    function getAcceptRule() {
        return GeneralCtr.getSysConfigType('accept_rule', true).then(function (data) {
            base.hideLoadingSpin();
            acceptRule = data;
            withdrawFee = base.formatMoney(base.getCoinWithdrawFee(currency), '', currency);
            $("#withdrawFee").val(withdrawFee + currency);
        }, base.hideLoadingSpin);
    }

    function qhMoneyType(pType, m_type, isw) {
        //m_cyn
        var toType = '';
        acceptRule.min_cny = parseFloat(acceptRule.accept_order_min_cny_amount);
        acceptRule.max_cny = parseFloat(acceptRule.accept_order_max_cny_amount);
        acceptRule.min_usd = parseFloat(acceptRule.accept_order_min_usd_amount);
        acceptRule.max_usd = parseFloat(acceptRule.accept_order_max_usd_amount);
        // 购买
        if (isw == '0') {
            if (m_type == 'CNY') {
                $('.con-toBuy .x-p_money').text('USD');
                if ($('.con-toBuy .sel-p').text() === base.getText('数量', langType)) {
                    $('.con-toBuy .m_bb').text('FMVP');
                }
                $('.con-toBuy .m_cyn').text('USD');
            } else {
                $('.con-toBuy .x-p_money').text('CNY');
                if ($('.con-toBuy .sel-p').text() === base.getText('数量', langType)) {
                    $('.con-toBuy .m_bb').text('FMVP');
                }
                $('.con-toBuy .m_cyn').text('CNY');
            }
        }
        // 出售
        if (isw == '1') {
            if (m_type == 'CNY') {
                $('.con-toSell .x-p_money').text('USD');
                if ($('.con-toSell .sel-p').text() === base.getText('数量', langType)) {
                    $('.con-toSell .m_bb').text('FMVP');
                }
                $('.con-toSell .m_cyn').text('USD');
            } else {
                $('.con-toSell .x-p_money').text('CNY');
                if ($('.con-toSell .sel-p').text() === base.getText('数量', langType)) {
                    $('.con-toSell .m_bb').text('FMVP');
                }
                $('.con-toSell .m_cyn').text('CNY');
            }
        }
        toType = $(pType + ' .x-p_money').eq(0).text();
        if (toType == 'CNY') {
            moneyHS = parseFloat(acceptRule.accept_cny_price);
        } else {
            moneyHS = parseFloat(acceptRule.accept_usd_price);
        }
        if (!isw) {
            $('.x-mon').text((Math.floor(moneyHS * 100) / 100).toFixed(2));
        } else {
            $(pType + ' .x-mon').text((Math.floor(moneyHS * 100) / 100).toFixed(2));
        }

        if (toType == 'CNY') {
            $(pType + ' .currency_type').text('￥');
            $(pType + ' .x-p_money').text('CNY');
            if ($(pType + ' .sel-p').text() === base.getText('数量', langType)) {
                $(pType + ' .m_bb').text('FMVP');
            } else {
                $(pType + ' .m_cyn').text('FMVP');
            }
            $(pType + ' .min-money').text(acceptRule.accept_order_min_cny_amount);
            $(pType + ' .max-money').text(acceptRule.accept_order_max_cny_amount);
        } else {
            $(pType + ' .currency_type').text('$');
            $(pType + ' .min-money').text(acceptRule.accept_order_min_usd_amount);
            $(pType + ' .max-money').text(acceptRule.accept_order_max_usd_amount);
            $(pType + ' .x-p_money').text('USD');
            if ($(pType + ' .sel-p').text() === base.getText('数量', langType)) {
                $(pType + ' .m_bb').text('FMVP');
            } else {
                $(pType + ' .m_cyn').text('FMVP');
            }
        }
    }

    //我的账户
    function getAccount() {
        return AccountCtr.getAccount().then(function (data) {
            var ulElement = '';
            var erWm = [];
            data.map(function (item, i) {
                if (item.currency.toLowerCase() === 'btc') {
                    sessionStorage.setItem('accountNumber', item.accountNumber);
                    ulElement += buildHtml(item, i);
                    erWm.push(item.address);
                    require(['js/lib/domReady!'], function (doc) {
                        require(['js/app/controller/wallet/WalletMx']);
                    });
                }
            });
            $('.tr-ul').html(ulElement);
            $('.con-toBuy .sxf').text(parseFloat(acceptRule.accept_order_buy_fee_rate) * 100);
            $('.con-toSell .sxf').text(parseFloat(acceptRule.accept_order_sell_fee_rate) * 100);
            if (isbuy) {
                $('.b-c_h p').eq(0).addClass('sel-p').siblings().removeClass('sel-p');
            }
            if (isbuy == '1') {
                $('.to-buy').addClass('sel-sp');
                $('.con-toBuy').show();
            }
            if (isbuy == '0') {
                $('.to-sell').addClass('sel-sp');
                $('.con-toSell').show();
            }
            if (bbKey == 'BTC') {
                $('.toCbBTC').addClass('sel-sp');
                $('.toCbBTC').parents('.tr-mx').siblings('.con-box').show();
            }
            if (bbKey == 'ETH') {
                $('.toCbETH').addClass('sel-sp');
                $('.toCbETH').parents('.tr-mx').siblings('.con-box').show();
            }
            qhMoneyType('.con-toBuy', 'CNY');
            qhMoneyType('.con-toSell', 'CNY');
            // zfType[item.zfType[item.bankName] = item.bankCode] = item.bankCode
            AccountCtr.getBankData().then(function (data) {
                var zfTypeHtml = '';
                data.forEach(function (item) {
                    zfTypeHtml += '<option value="' + item.bankName + '">' + item.bankName + '</option>';
                });
                $('#zf_select').html(zfTypeHtml);
            });
            AccountCtr.getGmBankData().then(function (data) {
                var zfTypeHtml = '';
                data.forEach(function (item) {
                    zfTypeHtml += '<option value="' + item.bankName + '">' + item.bankName + '</option>';
                    if (item.bankCode == 'alipay') {
                        // let rwmcode = new QRCode('rwmcode', picList['支付宝']);
                        // rwmcode.makeCode(picList['支付宝']);
                        $("#rwmcodeAccount").text(zfNumber[item.bankCode]);
                        $(".zf-apliy").text(zfNumber[item.bankCode]);
                        // $('#rwmcode').css({
                        //     'backgroundImage': `url(${base.getPic(picList[item.bankName]) })`,
                        //     'background-size': '100% 100%'
                        // });
                        $('#wAddressDialog .pagination').css({
                            'backgroundImage': 'url(' + base.getPic(picList[item.bankCode]) + ')',
                            'background-size': '100% 100%'
                        });
                    }
                });
                $('#zf_select1').html(zfTypeHtml);
                base.hideLoadingSpin();
            }, base.hideLoadingSpin);
            setTimeout(function () {
                console.log(erWm);
                erWm.forEach(function (item, i) {
                    var qrcode = new QRCode('qrcode2', item);
                    qrcode.makeCode(item);
                });
            }, 10);
            $('.zhanghao').text(zfNumber[zfOne]);
            if (langType == 'EN') {
                $('.w-zh').addClass('none');
                $('.w-en').removeClass('none');
                $('.tradeRecord-list-wrap .list-item div:nth-of-type(1)').css('width', '120px');
                $('.tr-ul li .tr-mx li:nth-of-type(1)').css('width', '120px');
                $('.tr-ul li .tr-mx li:nth-of-type(4) .cz-btns').css('width', '400px');
                $('.tr-ul li .tr-mx li:nth-of-type(4)').css('width', '760px');
            }
            addListener();
        }, base.hideLoadingSpin);
    }

    function buildHtml(item, i) {
        var kyAmount = base.formatMoney('' + (item.amount - item.frozenAmount), '', item.currency);
        var frozenAmount = base.formatMoney('' + item.frozenAmount, '', item.currency);
        var DHtml = '\n                <li>\n                <ul class="tr-mx">\n                    <li>' + item.currency + '</li>\n                    <li title="' + kyAmount + '">' + kyAmount + '</li>\n                    <li>' + frozenAmount + '</li>\n                    <li>\n                        <p class="cz-btns">\n                            <span class="toCb' + item.currency + '">' + base.getText('充币', langType) + '</span>\n                            <span>' + base.getText('提币', langType) + '</span>\n                        </p>\n                    </li>\n                </ul>\n                <div class="con-box bb-box">\n                    <div class="contant-mx">\n                        <h3>' + base.getText('充币', langType) + '</h3>\n                        <div class="address-Wrap receive-wrap ">\n                            <div class="address">' + base.getText('接收地址', langType) + '\uFF1A<samp id="myCoinAddress">' + item.address + '</samp>\n                                <div class="icon icon-qrcode">\n                                    <div id="qrcode' + i + '" class="qrcode"></div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class="contant-ts">\n                        <h5>' + base.getText('温馨提示', langType) + '</h5>\n                        <ul class="ts-ul">\n                            <li class="w-zh"> ' + item.currency + ' \u5730\u5740\u53EA\u80FD\u5145\u503C ' + item.currency + ' \u8D44\u4EA7\uFF0C\u4EFB\u4F55\u5145\u5165 ' + item.currency + ' \u5730\u5740\u7684\u975E ' + item.currency + ' \u8D44\u4EA7\u5C06\u4E0D\u53EF\u627E\u56DE\u3002</li>\n                            <li class="w-en none"> ' + item.currency + ' address can only recharge ' + item.currency + ' assets, any non - ' + item.currency + ' assets that fill the ' + item.currency + ' address will not be recovered.</li>\n                            <li> ' + base.getText('在平台内相互转账是实时到账且免费的。', langType) + '</li>\n                        </ul>\n                    </div>\n                </div>\n                <div class="con-tb bb-box" style="display: none;">\n                    <div class="sendOut-form-wrap">\n                        <h4>' + base.getText('提币', langType) + '</h4>\n                        <form class="form-wrapper form-wrapper-38 wp100" id="sendOut-form' + i + '">\n                            <div class="form-item-wrap">\n                                <p class="label">' + base.getText('提现地址', langType) + '</p>\n                                <div class="form-item mr20 k_b">\n                                    <input type="text" class="input-item payCardNo" name="payCardNo" placeholder="' + base.getText('请输入提现地址', langType) + '" />\n                                </div>\n                            </div>\n                            <div class="form-item-wrap">\n                                <samp class="label">' + base.getText('提现数量', langType) + '</samp>\n                                <div class="form-item k_b">\n                                    <input type="text" class="input-item amount" name="amount" placeholder="' + base.getText('请输入提现数量', langType) + '" />\n                                </div>\n                            </div>\n                            <div class="form-item-wrap" id="withdrawFee-wrap' + i + '">\n                                <samp class="label">' + base.getText('手续费率', langType) + '</samp>\n                                <div class="form-item k_b">\n                                    <input type="text" class="input-item withdrawFee tx-fee" id="withdrawFee' + i + '" value="' + withdrawFee + '" disabled="disabled" />\n                                </div>\n                            </div>\n                            <div class="form-item-wrap tradePwdWrap">\n                                <samp class="label">' + base.getText('交易密码', langType) + '</samp>\n                                <div class="form-item k_b mr20">\n                                    <input type="password" class="input-item" name="tradePwd" placeholder="' + base.getText('请输入交易密码', langType) + '" />\n                                </div>\n                                <div class="findPwd fl goHref" data-href="../user/setTradePwd.html?type=1&isWallet=1">' + base.getText('忘记密码？', langType) + '</div>\n                            </div>\n                            <div class="form-item-wrap hidden googleAuthFlag">\n                                <samp class="label">' + base.getText('谷歌验证码', langType) + '</samp>\n                                <div class="form-item k_b mr20">\n                                    <input type="password" class="input-item" name="googleCaptcha" placeholder="' + base.getText('请输入谷歌验证码', langType) + '" />\n                                </div>\n                            </div>\n                            <div class="form-item-wrap">\n                                <samp class="label">' + base.getText('备注', langType) + '</samp>\n                                <div class="form-item k_b">\n                                    <input type="text" class="input-item" name="applyNote" placeholder="' + base.getText('请输入提现备注', langType) + '" />\n                                </div>\n                            </div>\n                            <div class="form-btn-item">\n                                <div data-accountNumber="' + item.accountNumber + '"></div>\n                                <div class="am-button am-button-red subBtn">' + base.getText('确定提现', langType) + '</div>\n                            </div>\n                        </form>\n                    </div>\n                    <div class="contant-ts" style="padding-top: 30px;">\n                        <h5>' + base.getText('温馨提示', langType) + '</h5>\n                        <ul class="ts-ul">\n                            <li class="w-zh"> ' + item.currency + ' \u5730\u5740\u53EA\u80FD\u5145\u503C ' + item.currency + ' \u8D44\u4EA7\uFF0C\u4EFB\u4F55\u5145\u5165 ' + item.currency + ' \u5730\u5740\u7684\u975E ' + item.currency + ' \u8D44\u4EA7\u5C06\u4E0D\u53EF\u627E\u56DE\u3002</li>\n                            <li class="w-en none"> ' + item.currency + ' address can only recharge ' + item.currency + ' assets, any non - ' + item.currency + ' assets will not be recovered.</li>\n                            <li> ' + base.getText('在平台内相互转账是实时到账且免费的。', langType) + '</li>\n                        </ul>\n                    </div>\n                </div>\n            </li>';
        return DHtml;
    }

    //分页查询地址
    function getPageCoinAddress() {
        return AccountCtr.getPageCoinAddress(configAddress, true).then(function (data) {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach(function (item, i) {
                    html += buildHtmlAddress(item, i);
                });
                $("#wAddressDialog .list").html(html);
            } else {
                configAddress.start == 1 && $("#wAddressDialog .list").empty();
                configAddress.start == 1 && $("#wAddressDialog .list").html("<div class='tc ptb30 fs13'> " + base.getText('暂无地址', langType) + "</div>");
            }
            configAddress.start == 1 && initPaginationAddress(data);
        }, base.hideLoadingSpin);
    }

    function buildHtmlAddress(item, i) {
        var statusHtml = '';
        if (item.status == '0') {
            statusHtml = base.getText('未认证', langType);
        } else if (item.status == '1') {
            statusHtml = base.getText('已认证', langType);
        }
        return '<li data-address="' + item.address + '" data-status="' + item.status + '" class="' + (i == '0' ? 'on' : '') + ' b_e_t">\n    \t\t\t\t<div class="txt wp100">\n\t\t\t\t\t\t<p>' + base.getText('标签', langType) + ': ' + item.label + '</p>\n\t\t\t\t\t\t<p>' + item.address + '(' + statusHtml + ')</p>\n\t\t\t\t\t</div>\n    \t\t\t\t<i class="icon deleteBtn" data-code="' + item.code + '"></i>\n    \t\t\t</li>';
    }

    // 初始化地址分页器
    function initPaginationAddress(data) {
        $("#paginationAddress .pagination").pagination({
            pageCount: data.totalPage,
            showData: configAddress.limit,
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
                if (_this.getCurrent() != configAddress.start) {
                    base.showLoadingSpin();
                    configAddress.start = _this.getCurrent();
                    getPageCoinAddress();
                }
            }
        });
    }

    //提现 / 发送
    function withDraw(params) {
        return AccountCtr.withDraw(params).then(function (data) {
            base.hideLoadingSpin();
            base.showMsg(base.getText('操作成功', langType));
            $("#addWAddressDialog").addClass("hidden");
            base.showLoadingSpin();
            getAccount();
            $("#withdrawFee").val(withdrawFee + currency);
        }, function () {
            base.hideLoadingSpin();
        });
    }

    function addListener() {
        var _addAddressWrapper = $("#addAddress-form");
        _addAddressWrapper.validate({
            'rules': addAddressWrapperRules,
            onkeyup: false
        });

        var _sendOutWrapper = $("#sendOut-form");
        _sendOutWrapper.validate({
            'rules': sendOutWrapperRules,
            onkeyup: false
        });

        //接受/发送点击
        $(".trList .subBtn").off('click').click(function () {
            var _this2 = this;

            //提币/发送 需要验证是否有交易密码 和实名
            var params = {};
            var formData = $(this).parents('form').serializeArray();
            formData.forEach(function (item) {
                params[item.name] = item.value;
            });
            params.applyUser = base.getUserId();
            params.payCardInfo = $(this).parents('.con-tb').siblings('.tr-mx').children('li').eq(0).text();
            params.accountNumber = $(this).prev().attr('data-accountNumber');
            params.amount = base.formatMoneyParse(params.amount, '', params.payCardInfo);
            withDraw(params).then(function (data) {
                $(_this2).parents('form').reset();
            });
        });
        //取消支付
        $("#wAddressDialog .addBtn").click(function () {
            var config = {
                userId: base.getUserId(),
                code: buyOrderCode
            };
            TradeCtr.qxOrder(config).then(function () {
                showMsg(base.getText('已取消支付', langType));
                $('.con-toBuy .bz_put textarea').val('');
                $("#wAddressDialog").addClass("hidden");
            });
        });

        //标记付款
        $("#wAddressDialog .subBtn").click(function () {
            var config = {
                userId: base.getUserId(),
                code: buyOrderCode
            };
            base.showLoadingSpin();
            TradeCtr.bjPlayfo(config).then(function () {
                base.gohref('./wallet-jilu.html');
            });
        });

        $('.am-modal-content .out').click(function () {
            $("#wAddressDialog").addClass("hidden");
            base.showLoadingSpin();
            setTimeout(function () {
                base.gohref('./wallet-jilu.html');
            }, 1000);
        });

        $('#wAddressDialog');

        // 充币、提币操作
        $('.tr-ul').off('click').click(function (e) {
            var target = e.target;
            if ($(target).text() == base.getText('充币', langType)) {
                $('.bb-box').hide(200);
                if ($(target).hasClass('sel-sp')) {
                    $(target).parents('.tr-mx').siblings('.con-box').hide(200);
                    $(target).removeClass('sel-sp');
                } else {
                    $('.cz-btns span').removeClass('sel-sp');
                    $(target).addClass('sel-sp').siblings().removeClass('sel-sp');
                    $(target).parents('.tr-mx').siblings('.con-box').show(200).siblings('.con-tb').hide(200);
                }
                return;
            }
            UserCtr.getUser(true).then(function (data) {
                if ($(target).text() == base.getText('提币', langType)) {
                    if (data.tradepwdFlag) {
                        $('.bb-box').hide(200);
                        if ($(target).attr('class') == 'sel-sp') {
                            $(target).parents('.tr-mx').siblings('.con-tb').hide(200);
                            $(target).removeClass('sel-sp');
                        } else {
                            $('.cz-btns span').removeClass('sel-sp');
                            $(target).addClass('sel-sp').siblings().removeClass('sel-sp');
                            $(target).parents('.tr-mx').siblings('.con-tb').show(200).siblings('.con-box').hide(200);
                        }
                    } else if (!data.tradepwdFlag) {
                        base.showMsg(base.getText('请先设置交易密码', langType));
                        setTimeout(function () {
                            base.gohref("../user/setTradePwd.html?type=0");
                        }, 1800);
                    }
                    // else if (!data.realName) {
                    //     base.showMsg("请先进行身份验证");
                    //     setTimeout(function() {
                    //         base.gohref("../user/identity.html")
                    //     }, 1800)
                    // }
                }
            }, base.hideLoadingSpin);
        });

        // 切换交易货币类型-购买
        $('.con-toBuy .x-h_p2 img').click(function () {
            event.stopPropagation();
            var m_type = $(this).parent().prev().children('.x-p_money').text();
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            qhMoneyType('.con-toBuy', m_type, '0');
        });
        // 切换交易货币类型-出售
        $('.con-toSell .x-h_p2 img').click(function () {
            event.stopPropagation();
            var m_type = $(this).parent().prev().children('.x-p_money').text();
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            qhMoneyType('.con-toSell', m_type, '1');
        });

        var isSell = true;

        // 去购买操作
        $('.to-buy').off('click').click(function () {
            // if(isbuy == '1'){}
            $('.b-c_h p').eq(0).addClass('sel-p').siblings().removeClass('sel-p');
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            var minMoney = $('.con-toSell .min-money').text();
            var moneyType = $('.con-toSell .x-p_money').eq(0).text();
            $('.b-c_put p').text(base.getText('请输入购买金额', langType) + ', ' + base.getText('最低额度', langType) + ' ' + minMoney + moneyType);
            isSell = false;
            if ($(this).hasClass('sel-sp')) {
                $('.con-toBuy').hide();
                $(this).removeClass('sel-sp');
            } else {
                $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
                $('.bb-box').hide();
                $('.con-toBuy').show(200);
            }
        });

        // 去出售操作
        $('.to-sell').off('click').click(function () {
            $('.sell-c p').eq(0).addClass('sel-p').siblings().removeClass('sel-p');
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            isSell = true;
            var minMoney = $('.con-toSell .min-money').text();
            var moneyType = $('.con-toSell .x-p_money').eq(0).text();
            $('.con-toSell .b-c_put p').text(base.getText('请输入出售金额', langType) + ', ' + base.getText('最低额度', langType) + ' ' + minMoney + moneyType);
            if ($(this).hasClass('sel-sp')) {
                $('.con-toSell').hide();
                $(this).removeClass('sel-sp');
            } else {
                $(this).addClass('sel-sp').siblings().removeClass('sel-sp');
                $('.bb-box').hide();
                $('.con-toSell').show(200);
            }
        });

        //切换方式
        $('.b-c_h p').off('click').click(function () {
            event.stopPropagation();
            $(this).addClass('sel-p').siblings('p').removeClass('sel-p');
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            $('.back-type input').val('');
            $('#money_pow').val('');
            if (isSell) {
                var m_type = $('.con-toSell .x-p_money').eq(0).text();
                var minMoney = $('.con-toSell .min-money').text();
                $('.con-toSell .b-c_put input').val('');
                if ($(this).index() === 0) {
                    $('.m_cyn').text('CNY');
                    $('.m_bb').text(m_type);
                    $('.con-toSell .b-c_put p').text(base.getText('请输入出售金额', langType) + ', ' + base.getText('最低额度', langType) + ' ' + minMoney + m_type);
                } else {
                    $('.m_bb').text('FMVP');
                    $('.con-toSell .m_cyn').text(m_type);
                    $('.con-toSell .b-c_put p').text(base.getText('请输入出售数量', langType) + ', ' + base.getText('最低额度', langType) + ' ' + minMoney + m_type);
                }
            } else {
                var _m_type = $('.con-toBuy .x-p_money').eq(0).text();
                var _minMoney = $('.con-toSell .min-money').text();
                $('.con-toBuy .b-c_put p').text('');
                if ($(this).text() == base.getText('金额', langType)) {
                    $('.con-toBuy .b-c_put p').text(base.getText('请输入购买金额', langType) + ', ' + base.getText('最低额度', langType) + ' ' + _minMoney + _m_type);
                    $('.m_cyn').text('FMVP');
                    $('.m_bb').text(_m_type);
                } else {
                    $('.m_bb').text('FMVP');
                    $('.con-toBuy .b-c_put p').text(base.getText('请输入购买数量', langType) + ', ' + base.getText('最低额度', langType) + ' ' + _minMoney + _m_type);
                    $('.con-toBuy .m_cyn').text(_m_type);
                }
            }
        });

        var inpTxt = '';

        $('.b-c_put input').focus(function () {
            inpTxt = $(this).next('p').text();
            $(this).next().text('');
        });
        $('.b-c_put input').blur(function () {
            if ($(this).val() == '') {
                $(this).next().text(inpTxt);
            }
        });

        $('.b-c_put input').keyup(function () {
            var rmb = '';
            var setW = $(this).parent().prev().children('.sel-p').text();
            if (setW == base.getText('金额', langType)) {
                rmb = parseFloat($(this).val()) / moneyHS;
            } else {
                rmb = parseFloat($(this).val()) * moneyHS;
            }
            rmb = (Math.floor(rmb * 100000000) / 100000000).toFixed(8);
            if (isNaN(rmb)) {
                rmb = '0.00';
            }
            $('.x_num').text(rmb);
        });

        // 点击下订单
        $('.b-c_foo button').off('click').click(function () {
            event.stopPropagation();
            var receiveType = $("#zf_select").find("option:selected").val();
            var receiveType1 = $("#zf_select1").find("option:selected").val();
            var p_money = $('.con-toBuy .x-p_money').eq(0).text(); //判断货币类型
            var buyNote = $('.con-toBuy .bz_put textarea').val();
            //买入
            if ($(this).text() == base.getText('买入', langType) && $('.buy-c .sel-p').text() == base.getText('金额', langType)) {
                var allMoney = parseFloat($('.con-toBuy .b-c_put input').val().trim());
                var m_count = base.formatMoneyParse($('.con-toBuy .x_num').text(), '', 'FMVP');
                changeBuyMoney(p_money, allMoney, m_count, buyNote);
            }

            if ($(this).text() == base.getText('买入', langType) && $('.con-toBuy .sel-p').text() == base.getText('count', langType)) {
                var _allMoney = $('.con-toBuy .x_num').text().trim();
                var _m_count = base.formatMoneyParse($('.con-toBuy .b-c_put input').val().trim(), '', 'FMVP');
                changeBuyMoney(p_money, _allMoney, _m_count, buyNote);
            }

            function changeBuyMoney(p_money, allMoney, m_count, buyNote) {
                if (p_money == 'CNY') {
                    if (acceptRule.min_cny <= allMoney && allMoney <= acceptRule.max_cny) {
                        // allMoney = allMoney * 1000;
                        var buyConfig = {
                            tradeCurrency: 'CNY',
                            tradePrice: moneyHS,
                            userId: base.getUserId(),
                            count: m_count,
                            receiveType: 'alipay',
                            tradeAmount: allMoney,
                            remark: buyNote
                        };
                        base.showLoadingSpin();
                        AccountCtr.buyX(buyConfig).then(function (data) {
                            base.hideLoadingSpin();
                            buyOrderCode = data.code;
                            $('#wAddressDialog').removeClass('hidden');
                        }, base.hideLoadingSpin);
                    } else {
                        showMsg(base.getText('输入金额不在限额之内，请重新输入！', langType));
                    }
                }
                if (p_money == 'USD') {
                    if (acceptRule.min_usd <= allMoney && allMoney <= acceptRule.max_usd) {
                        // allMoney = allMoney * 1000;
                        var _buyConfig = {
                            tradeCurrency: 'USD',
                            tradePrice: moneyHS,
                            userId: base.getUserId(),
                            count: m_count,
                            receiveType: 'alipay',
                            tradeAmount: allMoney,
                            remark: buyNote
                        };
                        base.showLoadingSpin();
                        AccountCtr.buyX(_buyConfig).then(function () {
                            base.hideLoadingSpin();
                            showMsg();
                            setTimeout(function () {
                                base.gohref('./wallet-jilu.html');
                            }, 1500);
                        }, base.hideLoadingSpin);
                    } else {
                        showMsg(base.getText('输入金额不在限额之内，请重新输入！', langType));
                    }
                }
            }

            //卖出
            if ($(this).text() == base.getText('卖出', langType)) {
                var changeSellMoney = function changeSellMoney(p_money, allMoney, m_count, m_receiveCardNo) {
                    if (p_money == 'CNY') {
                        if (acceptRule.min_cny <= allMoney && allMoney <= acceptRule.max_cny) {
                            // allMoney = allMoney * 1000;
                            var sellConfig = {
                                userId: base.getUserId(),
                                tradeCurrency: 'CNY',
                                tradePrice: moneyHS,
                                count: m_count,
                                receiveCardNo: m_receiveCardNo,
                                receiveType: gmType[receiveType1],
                                tradeAmount: allMoney,
                                tradePwd: moneyPow
                            };
                            base.showLoadingSpin();
                            AccountCtr.sellX(sellConfig).then(function () {
                                base.hideLoadingSpin();
                                showMsg();
                                setTimeout(function () {
                                    base.gohref('./wallet-jilu.html');
                                }, 1500);
                            }, base.hideLoadingSpin);
                        } else {
                            showMsg(base.getText('输入金额不在限额之内，请重新输入！', langType));
                        }
                    }
                    if (p_money == 'USD') {
                        if (acceptRule.min_usd <= allMoney && allMoney <= acceptRule.max_usd) {
                            // allMoney = allMoney * 1000;
                            var _sellConfig = {
                                userId: base.getUserId(),
                                tradeCurrency: 'USD',
                                tradePrice: moneyHS,
                                count: m_count,
                                receiveCardNo: m_receiveCardNo,
                                receiveType: gmType[receiveType1],
                                tradeAmount: allMoney,
                                tradePwd: moneyPow
                            };
                            base.showLoadingSpin();
                            AccountCtr.sellX(_sellConfig).then(function () {
                                base.hideLoadingSpin();
                                showMsg();
                                setTimeout(function () {
                                    base.gohref('./wallet-jilu.html');
                                }, 1500);
                            }, base.hideLoadingSpin);
                        } else {
                            showMsg(base.getText('输入金额不在限额之内，请重新输入！', langType));
                        }
                    }
                };

                //back-type
                var _p_money = $('.con-toSell .x-p_money').eq(0).text(); //判断货币类型
                var moneyPow = $('#money_pow').val().trim();
                if ($('.sell-c .sel-p').text() == base.getText('金额', langType)) {
                    var _allMoney2 = $('.con-toSell .b-c_put input').val().trim();
                    var _m_count2 = base.formatMoneyParse($('.con-toSell .x_num').text().trim(), '', 'FMVP');
                    var m_receiveCardNo = $('.back-type input').val().trim();
                    changeSellMoney(_p_money, _allMoney2, _m_count2, m_receiveCardNo);
                }

                if ($('.sell-c .sel-p').text() == base.getText('count', langType)) {
                    var _allMoney3 = $('.con-toSell .x_num').text().trim();
                    var _m_count3 = base.formatMoneyParse($('.con-toSell .b-c_put input').val().trim(), '', 'FMVP');
                    var _m_receiveCardNo = $('.back-type input').val().trim();
                    changeSellMoney(_p_money, _allMoney3, _m_count3, _m_receiveCardNo);
                }
            }
        });

        function showMsg(txt) {
            var text = txt || base.getText('订单提交成功', langType);
            $('.b-c_put input').val('');
            $('.x_num').text('0.00');
            $('.back-type input').val('');
            $('#money_pow').val('');
            base.showMsg(text);
        }

        // 发送-确定
        $("#sendOut-form .subBtn").click(function () {
            event.stopPropagation();
            if (_sendOutWrapper.valid()) {
                base.showLoadingSpin();
                var params = _sendOutWrapper.serializeObject();
                params.amount = base.formatMoneyParse(params.amount, '', currency);
                params.accountNumber = accountNumber;
                params.payCardInfo = currency;
                withDraw(params);
            }
        });
    }
    function copyText() {
        var text = document.getElementById("address-BTC").innerText;
        var input = document.getElementById("input");
        input.value = text; // 修改文本框的内容
        input.select(); // 选中文本
        document.execCommand("copy"); // 执行浏览器复制命令
        alert("复制成功");
    }
    /**
     *发送比特币
     */
    $(".send-btc").click(function () {
        $("#sendBtcDialog").removeClass("hidden");
    });
});