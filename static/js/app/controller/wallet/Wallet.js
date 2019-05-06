define([
    'app/controller/base',
    'pagination',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/AccountCtr',
    'app/interface/GeneralCtr',
    'app/interface/TradeCtr',
    'app/interface/UserCtr',
    'app/controller/Top',
    'app/controller/foo'
], function (base, pagination, Validate, smsCaptcha, AccountCtr, GeneralCtr, TradeCtr, UserCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    var currency = base.getUrlParam("coin") || 'BTC'; //币种

    let moneyHS = 0;
    let gmType = {}; // 去出售支付方式

    let acceptRule = {};

    let isInternal = false;

    let buyOrderCode = ''; // 去购买订单号

    var configAddress = {
            start: 1,
            limit: 10,
            currency: currency
        };
    let changeCoinText = {
        'BTC': '切换USDT',
        'USDT': '切换BTC'
    };
    
    let coinName = {
        'BTC': '比特币',
        'USDT': 'USDT'
    };

    var addAddressWrapperRules = {
            "label": {
                required: true,
            },
            "address": {
                required: true,
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
                required: true,
            },
            "amount": {
                required: true,
                amountEth: true,
            },
            "tradePwd": {
                required: true,
            },
            "payCardNo": {
                required: true
            },
            "applyNote": {},
            "googleCaptcha": {}
        };

    if (!base.isLogin()) {
        base.goLogin()
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
            }
        }
        getGmBankData();
        /**
         * 获取余额
         */
        getAmount();
    }

    function setHtml() {
        // $('title').text(base.getText('钱包-区块链技术应用实验平台'));
        $('.wall-en_zzc').text(base.getText('当前余额', langType));
        $('.wall-en_bz').text(base.getText('币种', langType));
        $('.wall-en_ky').text(base.getText('可用', langType));
        $('.wall-en_dj').text(base.getText('冻结', langType));
        $('.wall-en_cz').text(base.getText('操作', langType));
        $('.wallet-account-wrap .freez-amount').html(`${base.getText('冻结金额')}: <a></a> ${currency}`);
        $('.wallet-account-wrap .add-amount').html(`<a href="../index.html?coin=${currency}">${base.getText(`购买${coinName[currency]}`)}</a>`);
        $('.wallet-account-wrap .crbzj').html(`${base.getText('存入')}<a class="accept-bail"></a> ${currency} ${base.getText('保证金')}`);
        $('.wallet-account-wrap .tip').html(base.getText(`就像黄金一样，您的${coinName[currency]} US dollars价值因市场而异，这是正常的，您仍有相同${coinName[currency]}金额`));
        $('.wallet-account-wrap .send-btc').html(base.getText(`发送${coinName[currency]}`));
        $('.wallet-account-wrap .yxbtb').html(base.getText(`以下为您的${coinName[currency]}存款地址`));
        $('.wallet-account-wrap .copy-address').html(base.getText('复制地址'));
        $('.tradeRecord-export-btn').html(base.getText('导出'));
        $('.tradeRecord-time .kssj').html(base.getText('开始时间') + '：');
        $('.tradeRecord-time .jssj').html(base.getText('结束时间') + '：');
        $('.tradeRecord-time .form-control').attr('placeholder', base.getText('请选择'));
        $('.hisorder-btn .tradeRecord-search-btn').html(base.getText('搜索'));
        $('.hisorder-btn .tradeRecord-reset-btn').html(base.getText('重置'));
        $('.zwmx').html(base.getText('暂无明细'));
        $('.zfba').html(`<span class="currency"></span>${base.getText('支付宝')}(<span class="zf-apliy"></span>)`);
        $('#wAddressDialog .addBtn').html(base.getText('取消支付'));
        $('#wAddressDialog .subBtn').html(base.getText('标记付款'));
        $('#addWAddressDialog .tjxdz').html(`${base.getText('添加新')}<span class="currency"></span>${base.getText('地址')}`);
        $('#addWAddressDialog .bq').html(base.getText('标签') + '：');
        $('#addWAddressDialog .tbdz').html(base.getText('提币地址') + '：');
        $('#addWAddressDialog .ggyzm').html(base.getText('谷歌验证码') + '：');
        $('#addWAddressDialog .yzm').html(base.getText('验证码') + '：');
        $('#addWAddressDialog .jymm').html(base.getText('交易密码') + '：');
        $('#getVerification').html(base.getText('获取验证码'));
        $('#addWAddressDialog .szwrz').html(base.getText('将该账户设置为认证账户'));
        $('#addWAddressDialog .remark').html(base.getText('向认证账户中提现不再输入交易密码、谷歌验证码'));
        $('#addWAddressDialog .closeBtn').html(base.getText('关闭'));
        $('#addWAddressDialog .subBtn').html(base.getText('确认地址'));
        $('#addWAddressDialog .srbq').attr('placeholder', base.getText('请输入标签'));
        $('#addWAddressDialog .tbdz').attr('placeholder', base.getText('请输入提币地址'));
        $('#addWAddressDialog .srggyzm').attr('placeholder', base.getText('请输入谷歌验证码'));
        $('#addWAddressDialog .sryzm').attr('placeholder', base.getText('请输入验证码'));
        $('#addWAddressDialog .srjymm').attr('placeholder', base.getText('请输入交易密码'));
        
        $('#sendBtcDialog .ctwfs').html(base.getText('从T网钱包发送'));
        $('#sendBtcDialog .sendBtn').html(base.getText('继续'));
        $('#sendBtcDialog .wallet-account').html(`${base.getText('可用')} <span>0</span> ${currency}`);
        $('#sendBtcDialog .rate').html(`${base.getText('手续费')}:<span>0</span> ${currency}`);
        $('#sendBtcDialog .btbje').html(base.getText(`${coinName[currency]}金额`) + '：');
        $('#sendBtcDialog .mbbtb').html(base.getText(`目标${coinName[currency]}地址`) + '：');
        $('#sendBtcDialog .jymm').html(base.getText('交易密码') + '：');
        $('#sendBtcDialog .srdfbtb').attr('placeholder', base.getText(`输入接收方的${coinName[currency]}地址`));
        $('#sendBtcDialog .srzjmm').attr('placeholder', base.getText('输入您的资金密码'));
        $('.change_coin').html(base.getText(changeCoinText[currency]));
        $('#sendBtc-form .unit').html(currency);
    }
    
    // 获取银行渠道
    function getGmBankData() {
        return AccountCtr.getGmBankData().then(data => {
            data.forEach(item => {
                gmType[item.bankName] = item.bankCode
            })
        });
    }

    function qhMoneyType(pType, m_type, isw) { //m_cyn
        let toType = '';
        acceptRule.min_cny = parseFloat(acceptRule.accept_order_min_cny_amount);
        acceptRule.max_cny = parseFloat(acceptRule.accept_order_max_cny_amount);
        acceptRule.min_usd = parseFloat(acceptRule.accept_order_min_usd_amount);
        acceptRule.max_usd = parseFloat(acceptRule.accept_order_max_usd_amount);
        // 购买
        if (isw == '0') {
            if (m_type == 'CNY') {
                $('.con-toBuy .x-p_money').text('USD');
                if($('.con-toBuy .sel-p').text() === base.getText('数量', langType)){
                    // $('.con-toBuy .m_bb').text('FMVP');
                }
                $('.con-toBuy .m_cyn').text('USD');
            } else {
                $('.con-toBuy .x-p_money').text('CNY');
                if($('.con-toBuy .sel-p').text() === base.getText('数量', langType)){
                    // $('.con-toBuy .m_bb').text('FMVP');
                }
                $('.con-toBuy .m_cyn').text('CNY');
            }
        }
        // 出售
        if (isw == '1') {
            if (m_type == 'CNY') {
                $('.con-toSell .x-p_money').text('USD');
                if($('.con-toSell .sel-p').text() === base.getText('数量', langType)){
                    // $('.con-toSell .m_bb').text('FMVP');
                }
                $('.con-toSell .m_cyn').text('USD');
            } else {
                $('.con-toSell .x-p_money').text('CNY');
                if($('.con-toSell .sel-p').text() === base.getText('数量', langType)){
                    // $('.con-toSell .m_bb').text('FMVP');
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
            if($(pType + ' .sel-p').text() === base.getText('数量', langType)){
                // $(pType + ' .m_bb').text('FMVP');
            } else {
                // $(pType + ' .m_cyn').text('FMVP');
            }
            $(pType + ' .min-money').text(acceptRule.accept_order_min_cny_amount);
            $(pType + ' .max-money').text(acceptRule.accept_order_max_cny_amount);
        } else {
            $(pType + ' .currency_type').text('$');
            $(pType + ' .min-money').text(acceptRule.accept_order_min_usd_amount);
            $(pType + ' .max-money').text(acceptRule.accept_order_max_usd_amount);
            $(pType + ' .x-p_money').text('USD');
            if($(pType + ' .sel-p').text() === base.getText('数量', langType)){
                // $(pType + ' .m_bb').text('FMVP');
            }  else {
                // $(pType + ' .m_cyn').text('FMVP');
            }
        }
    }

    //分页查询地址
    function getPageCoinAddress() {
        return AccountCtr.getPageCoinAddress(configAddress, true).then((data) => {
            var lists = data.list;
            if (data.list.length) {
                var html = "";
                lists.forEach((item, i) => {
                    html += buildHtmlAddress(item, i);
                });
                $("#wAddressDialog .list").html(html)
            } else {
                configAddress.start == 1 && $("#wAddressDialog .list").empty()
                configAddress.start == 1 && $("#wAddressDialog .list").html("<div class='tc ptb30 fs13'> " + base.getText('暂无地址', langType) +"</div>")
            }
            configAddress.start == 1 && initPaginationAddress(data);
        }, base.hideLoadingSpin)
    }

    function buildHtmlAddress(item, i) {
        var statusHtml = '';
        if (item.status == '0') {
            statusHtml = base.getText('未认证', langType)
        } else if (item.status == '1') {
            statusHtml = base.getText('已认证', langType)
        }
        return `<li data-address="${item.address}" data-status="${item.status}" class="${i == '0' ? 'on' : ''} b_e_t">
    				<div class="txt wp100">
						<p>${base.getText('标签', langType)}: ${item.label}</p>
						<p>${item.address}(${statusHtml})</p>
					</div>
    				<i class="icon deleteBtn" data-code="${item.code}"></i>
    			</li>`
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
            callback: function (_this) {
                if (_this.getCurrent() != configAddress.start) {
                    base.showLoadingSpin();
                    configAddress.start = _this.getCurrent();
                    getPageCoinAddress();
                }
            }
        });
    }
    
    // 查询是否为内部转账
  function internalTransfer () {
    let address = $('.srdfbtb').val();
    address && AccountCtr.internalTransfer(address).then(data => {
        if(data && data.address) {
          isInternal = true;
        }else {
          isInternal = false;
        }
      getRate();
    })
  }


    function addListener() {
      $('.change_coin').click(function() {
        base.gohref(`../wallet/wallet.html?coin=${currency === 'BTC' ? 'USDT' : 'BTC'}`);
      });
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
            //提币/发送 需要验证是否有交易密码 和实名
            let params = {};
            let formData = $(this).parents('form').serializeArray();
            formData.forEach(item => {
                params[item.name] = item.value;
            })
            params.applyUser = base.getUserId();
            params.payCardInfo = $(this).parents('.con-tb').siblings('.tr-mx').children('li').eq(0).text();
            params.accountNumber = $(this).prev().attr('data-accountNumber');
            params.amount = base.formatMoneyParse(params.amount, '', params.payCardInfo);
            withDraw(params).then(data => {
                $(this).parents('form').reset();
            })
        })
        //取消支付
        $("#wAddressDialog .addBtn").click(function () {
            let config = {
                userId: base.getUserId(),
                code: buyOrderCode
            };
            TradeCtr.qxOrder(config).then(() => {
                showMsg(base.getText('已取消支付', langType));
                $('.con-toBuy .bz_put textarea').val('');
                $("#wAddressDialog").addClass("hidden");
            });
        });

        //标记付款
        $("#wAddressDialog .subBtn").click(function () {
            let config = {
                userId: base.getUserId(),
                code: buyOrderCode
            };
            base.showLoadingSpin();
            TradeCtr.bjPlayfo(config).then(() => {

                base.gohref('./wallet-jilu.html');
            });
        })

        $('.am-modal-content .out').click(function(){
            $("#wAddressDialog").addClass("hidden");
            base.showLoadingSpin();
            setTimeout(() => {
                base.gohref('./wallet-jilu.html');
            }, 1000);
        })

        $('#wAddressDialog');
    }

    /**
     * 复制
     */
    $(".copy-address").click(function () {
        var content=document.getElementById("address-BTC");
        content.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        base.showMsg(base.getText('已复制到剪贴板', langType));
    });

    /**
     * 计算费率
     */
    function getRate(){
        return GeneralCtr.getUserTip({
            type:'withdraw_rule',
            ckey: currency === 'BTC' ? 'btc_withdraw_fee' : 'usdt_withdraw_fee'
        }).then(data => {
            base.hideLoadingSpin();
            var rate;
            rate = currency === 'BTC' ? (+data.btc_withdraw_fee) : (+data.usdt_withdraw_fee);
            if(isInternal) {
              rate = 0;
            }
            $('.sendBtc-form-wrap  .rate span').text(rate.toFixed(8))

        }, base.hideLoadingSpin);
    }
    /**
     * 获取当前余额
     */
    function getAmount() {
        AccountCtr.getAccount().then((accountData) => {
          GeneralCtr.getSysConfigType('trade_rule', true).then(ruleData => {
            $(".wallet-account-wrap .accept-bail").text(currency === 'BTC' ? ruleData.trade_btc_bail : ruleData.trade_usdt_bail);
            //bailAmount: 10000000
            // bailDatetime: "Apr 29, 2019 9:24:28 PM"
            let bail_crash_space_minutes = +ruleData.bail_crash_space_minutes * 60 * 1000;
            accountData.accountList.forEach(item => {
              if (item.currency === currency) {
                  let bailTime = !!item.bailDatetimeStr && !!(new Date().getTime() - new Date(item.bailDatetimeStr).getTime() > bail_crash_space_minutes);
                $(".wallet-account-wrap .s-bb").text(base.formatMoney(item.amount,'',item.currency) + ' ' + item.currency);
                $(".wallet-account-wrap .y-amount").text(' ≈ ' + item.amountUSD + ' USD');
                $('.wallet-account-wrap .freez-amount a').text(base.formatMoney(item.frozenAmount,'',item.currency));
                $('.sendBtc-form-wrap .wallet-account span').text(bailTime ? base.formatMoney((item.amount - item.frozenAmount) + (+item.bailAmount),'',item.currency) : base.formatMoney((item.amount - item.frozenAmount),'',item.currency));
                $('#address-BTC').val(item.address);
                var  erWn =[];
                erWn.push(item.address);
                erWn.forEach((item, i) => {
                  var qrcode = new QRCode(`qrcode2`, item);
                  qrcode.makeCode(item);
                });
                getRate();
                localStorage.setItem('accountNumber', item.accountNumber);
              }
            });
          });
          addListener();
        });
    }

    //计算费率
    $('.s-account .input-item').keyup(function () {
        getRate();
    });
    
    $('.s-address .srdfbtb').change(function() {
      internalTransfer ();
    });
    /**
     *发送比特币
     */
    $(".send-btc").click(function () {
        UserCtr.getUser().then((data) => {
            if (data.tradepwdFlag) {
                $("#sendBtcDialog").removeClass("hidden");
            } else if (!data.tradepwdFlag) {
                base.showMsg(base.getText('请先设置交易密码'));
                setTimeout(function () {
                    base.gohref("../user/setTradePwd.html?type=1")
                }, 1800)
            }
        }, base.hideLoadingSpin)
    })
    /**
     *发送-确定
     */
    $(document).on('click','#sendBtcDialog .sendBtn',function(e) {
        let params = {};
        let formData = $('#sendBtc-form').serializeArray();
        formData.forEach(item => {
            params[item.name] = item.value;
        })
        params.applyUser = base.getUserId();
        params.applyNote = '提现';
        params.payCardInfo = currency;
        params.accountNumber = localStorage.getItem('accountNumber');
        params.amount = base.formatMoneyParse(params.amount, '', params.payCardInfo);
        if(!params.tradePwd && !params.payCardNo) {
            base.showMsg(base.getText('请填写完整', langType));
            return;
        }
        return AccountCtr.withDraw(params).then((data) => {
            base.showMsg(base.getText('操作成功', langType));
            $("#sendBtcDialog").addClass("hidden");
        }, function () {
        })
    })
});