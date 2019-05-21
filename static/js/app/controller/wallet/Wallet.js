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
    let currency = base.getUrlParam("coin") || 'BTC'; //币种
    let gmType = {}; // 去出售支付方式
    let isInternal = false;
    let changeCoinText = {
        'BTC': 'USDT',
        'USDT': 'BTC'
    };
    
    let coinName = {
        'BTC': '比特币',
        'USDT': 'USDT'
    };
    let toCurrencyMoney = '';
    
    let usdMarket = 0;
    
    let accountNumberTB = '';

    let addAddressWrapperRules = {
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
        TradeCtr.getNumberMoney(currency, 'USD').then(data => {
          usdMarket = data.mid;
        });
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
        $('.wallet-account-wrap .crbzj').html(`${base.getText('存入')}<a class="accept-bail"></a> ${currency} ${base.getText('保证金')} <b class="balance_tq">提取</b>`);
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
        $('.zfba').html(base.getText('确认提取保证金?'));
        $('#wAddressDialog .addBtn').html(base.getText('取消'));
        $('#wAddressDialog .subBtn').html(base.getText('确认'));
        
        $('#sendBtcDialog .ctwfs').html(base.getText('从T网钱包发送'));
        $('#sendBtcDialog .sendBtn').html(base.getText('继续'));
        $('#sendBtcDialog .wallet-account').html(`${base.getText('可用')} <span>0</span> ${currency}`);
        $('#sendBtcDialog .rate').html(`${base.getText('手续费')}:<span>0</span> ${currency}`);
        $('#sendBtcDialog .btbje').html(base.getText(`${coinName[currency]}金额`) + '：');
        $('#sendBtcDialog .mbbtb').html(base.getText(`目标${coinName[currency]}地址`) + '：');
        $('#sendBtcDialog .jymm').html(base.getText('交易密码') + '：');
        $('#sendBtcDialog .srdfbtb').attr('placeholder', base.getText(`输入接收方的${coinName[currency]}地址`));
        $('#sendBtcDialog .srzjmm').attr('placeholder', base.getText('输入您的资金密码'));
        $('.change_coin .coin').html(changeCoinText[currency]);
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
            });
            params.applyUser = base.getUserId();
            params.payCardInfo = $(this).parents('.con-tb').siblings('.tr-mx').children('li').eq(0).text();
            params.accountNumber = $(this).prev().attr('data-accountNumber');
            params.amount = base.formatMoneyParse(params.amount, '', params.payCardInfo);
            withDraw(params).then(data => {
                $(this).parents('form').reset();
            })
        });
        $('#wAddressDialog').on('click', function() {
            $('#wAddressDialog').addClass('hidden');
        });
        $('#wAddressDialog .am-modal').on('click', function(e) {
            e.stopPropagation();
        });
        //取消提取
        $("#wAddressDialog .addBtn").click(function () {
            $('#wAddressDialog').addClass('hidden');
        });

        //确认提取
        $("#wAddressDialog .subBtn").click(function () {
            base.showLoadingSpin();
            UserCtr.extractUserMargin({
                accountNumber: accountNumberTB
            }).then(() => {
                base.hideLoadingSpin();
                base.showMsg(base.getText('提取保证金成功'));
                $('#wAddressDialog').addClass('hidden');
            }, () => {
                base.hideLoadingSpin();
                $('#wAddressDialog').addClass('hidden');
            });
        });

        $('.am-modal-content .out').click(function(){
            $("#wAddressDialog").addClass("hidden");
        });
        
        $('.wallet-account-wrap').on('click', '.balance_tq', function() {
            $("#wAddressDialog").removeClass("hidden");
        })
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
            // let bail_crash_space_minutes = +ruleData.bail_crash_space_minutes * 60 * 1000;
            accountData.accountList.forEach(item => {
              if (item.currency === currency) {
                  accountNumberTB = item.accountNumber;
                  let money = base.formatMoney((item.amount - item.frozenAmount),'',item.currency);
                  // let bailTime = !!item.bailDatetimeStr && !!(new Date().getTime() - new Date(item.bailDatetimeStr).getTime() > bail_crash_space_minutes);
                $(".wallet-account-wrap .s-bb").text(money);
                $(".wallet-account-wrap .y-amount").text(' ≈ ' + (usdMarket * money).toFixed(2) + ' USD');
                $('.wallet-account-wrap .freez-amount a').text(base.formatMoney(item.frozenAmount - (+item.bailAmount),'',item.currency));
                $('.sendBtc-form-wrap .wallet-account span').text(base.formatMoney((item.amount - item.frozenAmount),'',item.currency));
                $('#address-BTC').val(item.address);
                let qrcode = new QRCode(`qrcode2`, item.address);
                qrcode.makeCode(item.address);
                getRate();
                localStorage.setItem('accountNumber', item.accountNumber);
              }else {
                toCurrencyMoney = base.formatMoney((item.amount - item.frozenAmount),'',item.currency);
                $('.change_coin .coin-ye').html(`${base.getText('余额')}${toCurrencyMoney}` + changeCoinText[currency]);
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
        });
        params.applyUser = base.getUserId();
        params.applyNote = '提现';
        params.payCardInfo = currency;
        params.accountNumber = localStorage.getItem('accountNumber');
        params.amount = base.formatMoneyParse(params.amount, '', params.payCardInfo);
        if(!params.tradePwd || !params.payCardNo) {
            base.showMsg(base.getText('请填写完整', langType));
            return;
        }
        return AccountCtr.withDraw(params).then((data) => {
            base.showMsg(base.getText('操作成功', langType));
            $('#qrcode2').empty();
            getAmount();
            $("#sendBtcDialog").addClass("hidden");
        }, function () {
        })
    })
});