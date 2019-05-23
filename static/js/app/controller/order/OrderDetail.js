define([
    'app/controller/base',
    'app/module/validate',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr',
    'app/interface/TradeCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Validate, GeneralCtr, UserCtr, TradeCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let code = base.getUrlParam("code");
    let loginInfo = {};
    let userId = base.getUserId();
    const selType = webim.SESSION_TYPE.GROUP;
    const subType = webim.GROUP_MSG_SUB_TYPE.COMMON;
    const groupId = code;
    const groupName = 'groupName';
    const reqMsgCount = 10;
    let selSess;
    let getPrePageGroupHistroyMsgInfoMap = {};
    let emotionFlag = false;
    let tradePhoto = '';
    let tradePhotoMy = '';
    let userName = '',
        myName = '';
    let payType = {};
    let tradeOrderStatusObj = {};
    let firstLoad = false;
    let newMsgHtml = '';
    let tradeType;
    let adsCode;
    let tradeCoin = base.getUrlParam('coin') || ''; //交易币种
    let toUserId = '';
    let toUserName = '';
    let settimeout = true;
    let showTimeName = '';
    let isNewMsg = false;
    let mj_time = 0;
    let setInterTime = null;
    let isFqzc = false;
    let loginStatus = '';
    let getPicData = [];

  let payTypeList = [];
  let platTagList = [];
  let tradeOrderStatus = '';
  let orderPjStatus = false;
  
  let isWebUser = 1;
  let setImgIndex = null;
  let xIndexList = [];
  
  let coinName = {
    'BTC': '比特币',
    'USDT': 'USDT'
  };
  let isSendOk = true;

    init();
    window.onfocus = function () {
      settimeout = false;
    };
    function init() {
        base.showLoadingSpin();
        setHtml();
        if(!base.isLogin()){
            base.goLogin();
            return ;
        }
        $.when(
            GeneralCtr.getDictList({ "parentKey": "pay_type" }),
            GeneralCtr.getDictList({ "parentKey": "trade_order_status" }),
            TradeCtr.getPayTypeList({ status: 1 }),
            TradeCtr.getTagsList({ status: 1 })
            // GeneralCtr.getSysConfig('tips')
        ).then((payTypeData, tradeOderStatusData, res, tagData) => {
          payTypeData.forEach(function(item) {
            payType[item.dkey] = item.dvalue;
          });
          tradeOderStatusData.forEach(function(item) {
            tradeOrderStatusObj[item.dkey] = item.dvalue;
          });
          tagData.forEach(function(item) {
            platTagList.push({
              key: item.id,
              value: item.name
            })
          });
          res.map((item) => {
            payTypeList.push({
              key: item.code,
              value: item.name
            });
          });
          getOrderDetail();
          getPhraseData();
        }, base.hideLoadingSpin);
        addListener();
        getUserTips();
    }
  // 常用语设置
  function getPhraseData() {
    UserCtr.userPhraseList().then(data => {
      let li_html = ``;
      data.forEach((item, index) => {
        li_html += `<li class="li0${index}"><p title="${item.content}">${item.content}</p> <span class="dele-phrase hidden" data-id="${item.id}" data-index="${index}"></span></li>`;
      });
      $('#phrase-list').html(li_html);
    });
  }
    function timeout() {
      if(settimeout) {
        setTimeout(() => {
          document.querySelector('title').innerText = base.getText('新消息') + '~';
          setTimeout(() => {
            document.querySelector('title').innerText = showTimeName;
            timeout && timeout();
          }, 1000);
        }, 1000);
      }
    }
    //判断用户风险提醒
    function getUserTips() {
        let chapingCount;
        UserCtr.getUser().then((item) => {
            chapingCount = item.userStatistics.beiChaPingCount;
            GeneralCtr.getUserTip({
              type:'trade_rule',
              ckey:'risk_tip_feedback_count'
            }).then(data => {
              base.hideLoadingSpin();
              if(chapingCount >= +data.risk_tip_feedback_count){
                $('.orderDetail-left-tips').show();
              }
            }, base.hideLoadingSpin);
        });
    }
    function setHtml() {
        if(langType == 'EN'){
            $('.file-wrap .file').css('width', '180px');
            $('.am-modal-body .file-wrap .am-button').css('width', '180px');
        }
        $('.en-det_msg').text(base.getText('订单信息'));
        $('.en-det_gg').text(base.getText('交易价格') + ':');
        $('.en-det_sl').text(base.getText('交易数量') + ':');
        $('.en-det_je').text(base.getText('交易金额') + ':');
        $('.en-det_bj').text(base.getText('报价') + ':');
        $('.en-det_xe').text(base.getText('交易限额') + ':');
        $('.en-det_jycz').text(base.getText('交易操作'));
        $('.en-det_code').text(base.getText('订单编号'));
        $('.en-det_fkfs').text(base.getText('付款方式'));
        $('.en-det_ly').text(base.getText('广告留言'));
        $('.en-o_lt').text(base.getText('聊天'));
        $('#msgedit').attr('placeholder', base.getText('按回车发送消息'));
        $('#send').html(base.getText('发送'));
        $('.fy_dzyx').html(base.getText('电子邮箱') + '：');
        $('.fy_sjhm').html(base.getText('手机号码') + '：');
        $('.fy_smrz').html(base.getText('实名认证') + '：');
        $('.fy_yhcjsj').html(base.getText('用户创建时间') + '：');
        $('.payBtn').html(base.getText('已支付'));
        $('.cancelBtn').html(base.getText('取消交易'));
        $('.commentBtn').html(base.getText('交易评价'));
        $('.releaseBtn').html(base.getText('解冻货币'));
        $('.arbitrationBtn').html(base.getText('申请仲裁'));
        $('.goBuyDetailBtn').html(base.getText('购买'));
        $('.goSellDetailBtn').html(base.getText('出售'));
        $('.fy_wxts').html(base.getText('温馨提示'));
        $('#upload_pic_low_ie_dialog_label').html(base.getText('发送图片'));
        $('.fy_xztp').html(base.getText('选择图片'));
        $('.fy_xz').html(base.getText('选择'));
        $('#updli_close').html(base.getText('关闭'));
        $('#updli_send').html(base.getText('发送'));

        $('#upload_pic_dialog_label').html(base.getText('发送图片'));
        $('.fy_xztp').html(base.getText('选择图片'));
        $('.fy_xz').html(base.getText('选择'));
        $('.fy_yl').html(base.getText('预览'));
        $('.fy_jd').html(base.getText('进度'));
        $('#upd_close').html(base.getText('关闭'));
        $('#upd_send').html(base.getText('发送'));

        $('#click_pic_dialog_label').html(base.getText('查看图片'));

        $('#upd_close').html(base.getText('关闭'));

        $('#arbitrationDialog .fy_sqzc').html(base.getText('申请仲裁'));
      $('#arbitrationDialog .fy_qryzf').html(base.getText('是否申请仲裁'));
      $('#arbitrationDialog .zchf').html(base.getText('仲裁之后客服将会介入'));
        $('#arbitrationDialog .fy_reason').attr('placeholder', base.getText('请填写您申请仲裁的理由'));
        $('#arbitrationDialog .closeBtn').html(base.getText('放弃'));
        $('#arbitrationDialog .subBtn').html(base.getText('确认申请'));
        $('#arbitrationDialog .arbitration-subBtn').html(base.getText('确认'));
        $('#arbitrationDialog .arbitration-canBtn').html(base.getText('取消'));

        $('.commentDialog .fy_jypj').html(base.getText('交易评价'));
        $('.commentDialog .fy_jyyx').html(base.getText('交易有何印象？快來评价吧'));
        $('.commentDialog .fy_hp').html(base.getText('好评'));
        $('.commentDialog .fy_zp').html(base.getText('中评'));
        $('.commentDialog .fy_cp').html(base.getText('差评'));
        $('.commentDialog #pjText').attr('placeholder', base.getText('快來评价吧'));
        $('.commentDialog .subBtn').html(base.getText('提交'));

      $('#paidDialog .fy_qryzf').html(base.getText('确认已支付'));
      $('#paidDialog .fy_content').html(base.getText(`注意：如已付款，请及时跟商家联系，让商家及时放行${coinName[tradeCoin]}；如商家未放行${coinName[tradeCoin]}请及时申请仲裁`));
      $('#paidDialog .paid-subBtn').html(base.getText('确认'));
      $('#paidDialog .paid-canBtn').html(base.getText('取消'));

      $('#cancelDialog .fy_qryzf').html(base.getText('确认取消'));
      $('#cancelDialog .fy_content').html(base.getText('请仔细查看该商家的支付信息是否符合您的交易需求'));
      $('#cancelDialog .paid-subBtn').html(base.getText('确认'));
      $('#cancelDialog .paid-canBtn').html(base.getText('取消'));

      $('#releasePaidDialog .fy_release-paid-title').html(base.getText(`买家已付款，是否确认放行${coinName[tradeCoin]}`));
      $('#releasePaidDialog .fy_release-paid-content').html(base.getText('注意：请仔细核实，如发生交易失误、诈骗，交易资金不会撤回，平台不会给予退款，请谨慎交易'));
      $('#releasePaidDialog .subBtn').html(base.getText('确认'));
      $('#releasePaidDialog .canBtn').html(base.getText('取消'));

      $('#releaseUnpaidDialog .fy_release-unpaid-title').html(base.getText(`买家未付款，不能放行${coinName[tradeCoin]}`));
      $('#releaseUnpaidDialog .fy_release-unpaid-content').html(base.getText('注意：如发生交易失误、诈骗，交易资金不会撤回，平台不会给予退款，请谨慎交易'));
      $('#releaseUnpaidDialog .subBtn').html(base.getText('确认'));

      $('#tradePwdDialog .fy_tradePwd-title').html(base.getText('资金密码'));
      $('#tradePwdDialog .fy_tradePwd-content').html(base.getText('注意：请仔细核实，如发生交易失误、诈骗，交易资金不会撤回，平台不会给予退款，请谨慎交易'));
      $('#tradePwdDialog .subBtn').html(base.getText('确认'));
      $('#tradePwdDialog .canBtn').html(base.getText('取消'));
      $('.order-detail-container .orderDetail-left-tips-content').html(base.getText('注意！这位卖家的声誉反馈较低。在分享您的礼品卡信息前，请确保卖家在线并回复了您。请确保卖家在线并回复了您。如果您已经给了他信息，而他要求您取消交易，请点击已支付完成按钮。版主将会介入来确保卖家服从规则。'));
      $('.order-detail-container .orderDetail-left-tips-button').html(base.getText('我理解'));
      $('.order-detail-container .orderDetail-left-status').html(base.getText('交易已开始'));
      $('.order-detail-container .payBtn').html(base.getText('已支付'));
      $('.order-detail-container .cg_tips').html(base.getText(`在您完成支付后，请务必点击“我已支付”按钮。否则，交易将超时，${coinName[tradeCoin]}将退回给卖家。`));
      $('.order-detail-container .canBtn').html(base.getText('取消'));
      $('.order-detail-container .sb_tips').html(base.getText('如果错误的发起了交易，或者您不满足交易说明中提出的要求，您随时可以取消交易。'));
      $('.order-detail-container .zs-title').html(`${base.getText('请按照')}<span class="zs-nickname"></span> ${base.getText('的指示操作')}`);
      $('.order-detail-container .syzfsj').html(base.getText('支付剩余时间'));
      $('.order-detail-container .message-title').html(base.getText('信息'));
      $('.order-detail-container .more_fv').html(base.getText('费率'));
      $('.order-detail-container .more_jyid').html(base.getText('交易ID'));
      $('.order-detail-container .more_yks').html(base.getText('已开始'));
      $('.order-detail-container .release-btn').html(base.getText(`放行${coinName[tradeCoin]}`));
      $('.order-detail-container .release-warning').html(`<span class="warning">${base.getText('警告')}：</span>${base.getText('买家未支付')}`);
      $('.order-detail-container .finished-top-status').html(base.getText('交易已完成'));
      $('.order-detail-container .finished-bottom-title').html(base.getText('订单信息'));
      $('.order-detail-container .finished-ddbh').html(base.getText('订单编号'));
      $('.order-detail-container .finished-fkfs').html(base.getText('付款方式'));
      $('.order-detail-container .finished-jyjg').html(base.getText('交易价格'));
      $('.order-detail-container .finished-jysl').html(base.getText('交易数量'));
      $('.order-detail-container .finished-jyje').html(base.getText('交易金额'));
      $('.order-detail-container .finished-ggly').html(base.getText('广告留言'));
      $('.order-detail-container .orderDetail-right-user-info .time').html(`${base.getText('已查看')}<span class="interval"></span>${base.getText('前')}`);
      $('.order-detail-container .orderDetail-right-user-info .dhyyz').html(base.getText('电话已验证'));
      $('.order-detail-container .more-info').html(`${base.getText('更多信息')} >`);
      $('.order-detail-container #click_pic_dialog_close').html(base.getText('关闭'));
      $('.order-detail-container .arbitrate-title').html(base.getText(`已支付，等待卖家放行${coinName[tradeCoin]}`));
      $('.order-detail-container .arbitrate-tips').html(base.getText(`如卖家在指定时间未放行${coinName[tradeCoin]}，请及时申请仲裁`));
      $('.order-detail-container .arbitrate-btn').html(base.getText('申请仲裁'));
      $('.order-detail-container .orderDetail-cancel').html(base.getText('取消订单'));
      $('.orderDetail-left-arbitrate .cancel-btn').html(base.getText('取消订单'));
      $('.order-detail-container .bmy_qxdd').html(base.getText('如果错误的发起了交易，或者您不满足交易说明中提出的要求，您随时可以取消交易。'));
      $('.order-detail-container .wxdx').html(base.getText(`无需担心，你的${coinName[tradeCoin]}安全保存在拖管中，且这个交易不会过期，只有在卖家没回应且没有其他办法的情况下才能发起纠纷处理，滥用纠纷处理会被封禁。`));
      $('.order-detail-container .orderDetail-tip').html(`${base.getText('纠纷将在下列时间后处理')} <a></a>`);
      $('.order-detail-container #pwd-input').attr('placeholder', base.getText('请输入资金密码'));
    }
    function getTencunLogin() {
        return GeneralCtr.getTencunLogin().then((data) => {
            loginInfo = {
                identifier: userId,
                userSig: data.sign,
                sdkAppID: data.txAppCode,
                appIDAt3rd: data.txAppCode,
                accountType: data.accountType
            };
            login();
        })
    }

    function getOrderDetail() {
        return TradeCtr.getOrderDetail(code).then((data) => {
            tradeCoin = data.tradeCoin;
          adsCode = data.adsCode;
          tradeOrderStatus = data.status;
          if(tradeOrderStatus === '1') {
            $('.orderDetail-left-release .sqzc').css({
              'cursor': 'pointer',
              'background-color': '#F19348'
            });
          }else {
            $('.orderDetail-left-release .sqzc').addClass('hidden');
          }
          localStorage.setItem('orderDetailStatus',data.status);
          getAdvertiseDetail();
          let maxtime = data.surplusSeconds; //一个小时，按秒计算，自己调整!
          let minutes;
          let seconds;
          let msg;
          getCountDown();
          function getCountDown() {
            if (maxtime > 0) {
              minutes = Math.floor(maxtime / 60);
              seconds = Math.floor(maxtime % 60);
              msg = minutes + base.getText('分') + seconds + base.getText('秒');
              --maxtime
              $('.orderDetail-tip a').text(msg);
              mj_time = msg;
            } else{
              clearInterval(setInterTime);
              $('.orderDetail-tip a').text('0' + base.getText('秒'));
              mj_time = '0' + base.getText('秒');
            }
            if(isFqzc) {
              $('.orderDetail-left-release .sqzc').html(base.getText(`纠纷将在${mj_time}时间后处理`)).css({
                'cursor': 'default',
                'background-color': '#F19348'
              });
            }
          }
          // setInterTime = setInterval(getCountDown, 1000);
          //待支付
          if(data.buyUser === userId) {
              console.log('买家：---------------------------------------------------------------------', data.status);
              $('.order-detail-container .orderDetail-left-todo .todo').html(`${base.getText('请通过')}<span class="todo-payType"></span>${base.getText('发送')}<span class="amount"></span>`);
              $('.order-detail-container .orderDetail-left-todo .todo-tips').html(`<span></span> ${base.getText(`将加载至您的${coinName[tradeCoin]}钱包`)}`);
            toUserId = data.sellUserInfo.userId;
            document.querySelector('title').innerText = data.sellUserInfo.nickname;
            let time = base.calculateDays(data.sellUserInfo.lastLogin, new Date());
            if (time <= 10) {
              loginStatus = 'green'
            } else if (time <= 30) {
              loginStatus = 'yellow'
            } else {
              loginStatus = 'gray'
            }
            $('.user_loginTime').addClass(loginStatus);
            let interval = base.fun(Date.parse(data.sellUserInfo.lastLogin), new Date());
            $('.orderDetail-right-user-info .user-info .time .interval').html(interval);
            if(data.status === '0') {
              $('.orderDetail-container .wait').removeClass('hidden');
              $('.orderDetail-container .finished').addClass('hidden');
            } else if(data.status === '1') {
              $('.orderDetail-container .wait-release-btc').removeClass('hidden');
            }else if(data.status === '5'){
                $('.orderDetail-container .wait-release-btc').removeClass('hidden');
                $('.orderDetail-arbitration-befer').hide();
                $('.orderDetail-arbitration-after').show();
            }else if(data.status === '6'){
              //仲裁状态
              $('.orderDetail-container .finished').removeClass('hidden').siblings().addClass('hidden');
              $('.finished-top .finished-top-status').text(base.getText('仲裁已完成'));
            }else if(data.status === '7') {
              //仲裁状态
              $('.orderDetail-container .finished .failure-top-icon').removeClass('hidden');
              $('.orderDetail-container .finished .finished-top-icon').addClass('hidden');
              $('.orderDetail-container .finished').removeClass('hidden').siblings().addClass('hidden');
              $('.finished-top .finished-top-status').text(base.getText('仲裁已完成，卖家胜'));
            }
          } else {
              console.log('卖家：---------------------------------------------------------------------', data.status);
              $('.order-detail-container .orderDetail-left-todo .todo').html(`
                您正在以 <span class="fb-num">
                ${data.tradeAmount}${data.tradeCurrency}</span>
                出售 <span class="coin-num">
                    ${base.formatMoney(data.countString,'',data.tradeCoin)}${data.tradeCoin}
                </span>，支付方式为
                <span class="pay-type">${data.payment}</span>`);
            toUserId = data.buyUserInfo.userId;
            document.querySelector('title').innerText = data.buyUserInfo.nickname;
            let time = base.calculateDays(data.buyUserInfo.lastLogin, new Date());
            if (time <= 10) {
              loginStatus = 'green'
            } else if (time <= 30) {
              loginStatus = 'yellow'
            } else {
              loginStatus = 'gray'
            }
            $('.user_loginTime').addClass(loginStatus);
            let interval = base.fun(Date.parse(data.buyUserInfo.lastLogin), new Date());
            $('.orderDetail-right-user-info .user-info .time .interval').html(interval);
            $('.cljf-box').hide();
            if(data.status === '0') {
              $('.orderDetail-container .before-release-btc').removeClass('hidden');
              $('.orderDetail-container .finished').addClass('hidden');
            } else if(data.status === '1') {
              $('.orderDetail-container .before-release-btc').removeClass('hidden');
              $('.release-warning').html(base.getText('买家已支付'));
              $('.orderDetail-left-time').addClass('hidden');
            }else if(data.status === '5'){
                $('.orderDetail-left-status').html(base.getText('仲裁中'));
                $('.orderDetail-container .before-release-btc').removeClass('hidden');
                $('.release-warning').addClass('hidden');
                $('.orderDetail-left-time').addClass('hidden');
              $('.cljf-box').show();
            }else if (data.status === '6'){
              // 仲裁状态
              $('.orderDetail-container .finished').removeClass('hidden').siblings().addClass('hidden');
              $('.finished-top .finished-top-status').text(base.getText('仲裁已完成，买家胜'));
            }else if(data.status === '7') {
              // 仲裁状态
              $('.orderDetail-container .finished').removeClass('hidden').siblings().addClass('hidden');
              $('.orderDetail-container .finished .failure-top-icon').removeClass('hidden');
              $('.orderDetail-container .finished .finished-top-icon').addClass('hidden');
              $('.finished-top .finished-top-status').text(base.getText('仲裁已完成'));
            }else if(data.status === '8') {
              $('.jyycs').removeClass('hidden');
            }
          }
          if(data.status == '4') {
            //取消状态
            $('.orderDetail-container .finished').removeClass('hidden').siblings().addClass('hidden');
            $('.finished-top .finished-top-status').text(base.getText('交易已取消'));
            $('.finished .remove-top-icon').removeClass('hidden').siblings('.top-icon').addClass('hidden');
            $('.jyycs').addClass('hidden');
          }
          if(data.status === '8') {
            $('.orderDetail-container .finished').removeClass('hidden').siblings().addClass('hidden');
            $('.finished .finished-top-icon').addClass('hidden');
            $('.finished .failure-top-icon').removeClass('hidden');
            $('.finished-top .finished-top-status').text(base.getText('交易已超时'));
          }
          if(data.status === '2' || data.status == '3' || data.status == '9' || data.status == '10') {
            // 待评价
            let comment = 0;
            // 未评价
            if(data.buyUser == userId && !data.bsComment) {
              comment = 1;
            } else if(data.buyUser != userId && !data.sbComment) {
              comment = 1;
            }
            // 已评价
            let index = 0, pjtext = '';
            if(data.buyUser === userId && data.bsComment) {
              comment = 2;
              index = 2 - (+data.bsComment);
              pjtext = data.bsCommentContent;
            }
            if(data.buyUser !== userId && data.sbComment) {
              comment = 2;
              index = 2 - (+data.sbComment);
              pjtext = data.sbCommentContent;
            }
            // 已投诉
            if(data.status === '9') {
              $('.comment_pjts .comment_yts').removeClass('hidden');
              $('.comment_pjts .comment_ts').addClass('hidden');
            }
            if(data.status === '10') {
              $('.comment_pjts .comment_yts').removeClass('hidden').text('已处理');
              $('.comment_pjts .comment_ts').addClass('hidden');
            }
            $('.finished-top .comment-btn').remove();
            if(comment === 1) {
              $(".comment_pjts").removeClass('hidden');
            }
            if(comment === 2) {
              $('.comment_pjts .comment_pj').text('修改评价');
              $(".comment_pjts").removeClass('hidden');
              $(".commentDialog").addClass('hidden');
              orderPjStatus = true;
              $($(".commentDialog .comment-Wrap .item")[index]).addClass('on').siblings().removeClass('on');
              $('#pjText').val(pjtext);
            }
            // 待评价和已完成状态
            $('.orderDetail-container .finished').removeClass('hidden').siblings('.orderDetail-left').addClass('hidden');
          }
          payTypeList.map((item) => {
            if(item.key === data.payType) {
              $('.wait .orderDetail-left-todo .todo .todo-payType').html(item.value);
              $('.wait-release-btc .orderDetail-left-todo .todo .todo-payType').html(item.value);
              $('.before-release-btc .orderDetail-left-todo .todo .todo-payType').html(item.value);
              $('.finished .finished-bottom .code-payType .payType .finished-bottom-item-content').html(item.value);
            }
          });
          $('.wait .orderDetail-left-todo .todo-tips span').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin);
          $('.wait .orderDetail-left-message .message-tips').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin + base.getText('被安全的保存在托管处'));
          $('.wait .orderDetail-left-todo .todo .amount').html(data.tradeAmount + data.tradeCurrency);
          $('.wait .orderDetail-left-zs .zs-title .zs-nickname').html(data.sellUserInfo.nickname);
          $('.wait .orderDetail-left-more-info .trade-id .more-info-value').html(code);
          $('.wait .orderDetail-left-more-info .frate .more-info-value').html(data.tradePrice + ` ${data.tradeCurrency}/${data.tradeCoin}`);
          $('.wait .orderDetail-left-more-info .time .more-info-value').html(base.formateDatetime(data.createDatetime));


          $('.wait-release-btc .orderDetail-left-message .message-tips').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin + base.getText('被安全的保存在托管处'));
          $('.wait-release-btc .orderDetail-left-zs .zs-title .zs-nickname').html(data.sellUserInfo.nickname);
          $('.wait-release-btc .orderDetail-left-todo .todo .amount').html(data.tradeAmount + data.tradeCurrency);
          $('.wait-release-btc .orderDetail-left-todo .todo-tips span').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin);
          $('.wait-release-btc .orderDetail-left-more-info .trade-id .more-info-value').html(code);
          $('.wait-release-btc .orderDetail-left-more-info .frate .more-info-value').html(data.tradePrice + ` ${data.tradeCurrency}/${data.tradeCoin}`);
          $('.wait-release-btc .orderDetail-left-more-info .time .more-info-value').html(base.formateDatetime(data.createDatetime));

          $('.before-release-btc .orderDetail-left-todo .todo-tips span').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin);
          $('.before-release-btc .orderDetail-left-message .message-tips').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin + base.getText('被安全的保存在托管处'));
          $('.before-release-btc .orderDetail-left-todo .todo .amount').html(data.tradeAmount + data.tradeCurrency);
          $('.before-release-btc .orderDetail-left-zs .zs-title .zs-nickname').html(data.sellUserInfo.nickname);
          $('.before-release-btc .orderDetail-left-more-info .trade-id .more-info-value').html(code);
          $('.before-release-btc .orderDetail-left-more-info .frate .more-info-value').html(data.tradePrice + ` ${data.tradeCurrency}/${data.tradeCoin}`);
          $('.before-release-btc .orderDetail-left-more-info .time .more-info-value').html(base.formateDatetime(data.createDatetime));


          $('.finished .finished-bottom .finished-code .finished-bottom-item-content').html(code);
          $('.finished .finished-bottom .price-quantity-amount .price .finished-bottom-item-content').html(data.tradePrice + data.tradeCurrency);
          $('.finished .finished-bottom .price-quantity-amount .amount .finished-bottom-item-content').html(data.tradeAmount + data.tradeCurrency);
          $('.finished .finished-bottom .message .price .finished-bottom-item-content').html(data.leaveMessage);
          $('.finished .finished-bottom .finished-quantity .finished-bottom-item-content').html(base.formatMoney(data.countString,'',data.tradeCoin) + data.tradeCoin);
          $('.finished .finished-bottom .amount .finished-bottom-item-content').html(data.tradeAmount + data.tradeCurrency);

          let startTime = new Date();
          let endTime = new Date(Date.parse(data.invalidDatetime));
          let intervalTime = null, timeoutTime = null, user = '', myInfo;
          if(endTime > startTime) {
              if(intervalTime) {
                  clearInterval(intervalTime);
              }
              if(timeoutTime) {
                  clearTimeout(timeoutTime);
              }
              let showTime = Math.floor((endTime - startTime) / 1000 / 60);
            $('.orderDetail-left-time .text .left-time-minute').html(showTime + base.getText('分钟'));
              let interTime = (new Date(Date.parse(data.invalidDatetime)).getTime() - new Date().getTime()) - showTime * 1000 * 60;
              timeoutTime = setTimeout(() => {
                  let newDate = new Date();
                  $('.orderDetail-left-time .text .left-time-minute').html(Math.floor((endTime - newDate) / 1000 / 60) + base.getText('分钟'));
                  intervalTime = setInterval(() => {
                      let newDate = new Date();
                      $('.orderDetail-left-time .text .left-time-minute').html(Math.floor((endTime - newDate) / 1000 / 60) + base.getText('分钟'));
                  }, 60000);
              }, interTime)
          } else {
              clearInterval(intervalTime);
              clearTimeout(timeoutTime);
            $('.orderDetail-left-time .text .left-time-minute').html('0' + base.getText('分钟'));
          }
          if(data.buyUser == userId) {
            // 对面是卖家
              let showPhoto = data.sellUserInfo.nickname.substring(0, 1);
              if(!!data.sellUserInfo.photo) {
                $('.orderDetail-right .orderDetail-right-user-info .icon-user-avatar').css({
                  "background-image": "url('" + base.getAvatar(data.sellUserInfo.photo) + "')",
                  'background-color': '#000',
                  'color': '#fff',
                  'text-align': 'center',
                  'line-height': '42px'
                });
              }else {
                $('.orderDetail-right .orderDetail-right-user-info .icon-user-avatar').css({
                  'background-image': 'none',
                  'background-color': '#000',
                  'color': '#fff',
                  'text-align': 'center',
                  'line-height': '42px',
                  'font-size': '18px'
                }).text(showPhoto);
              }
              toUserName = data.sellUserInfo.nickname;
              $('.orderDetail-right .orderDetail-right-user-info .user-info .name').html(data.sellUserInfo.nickname);
              $('.orderDetail-right .more-info').attr('userId',data.sellUserInfo.userId);
              getUser(data.sellUserInfo.userId)
              if(data.sellUserInfo.email != undefined){
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:last-child span').html(base.getText('电子邮件已验证'));
              }else{
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:last-child span').html(base.getText('电子邮件未验证')).next('i').removeClass('icon-checked');
              }
              if(data.sellUserInfo.mobile != undefined){
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:first-child span').html(base.getText('电话已验证'));
              }else{
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:first-child span').html(base.getText('电话未验证')).next('i').removeClass('icon-checked');;
              }
          } else {
            // 对面是买家
            let showPhoto = data.buyUserInfo.nickname.substring(0, 1);
            if(!!data.buyUserInfo.photo) {
              $('.orderDetail-right .orderDetail-right-user-info .icon-user-avatar').css({
                "background-image": "url('" + base.getAvatar(data.buyUserInfo.photo) + "')",
                'background-color': '#000',
                'color': '#fff',
                'text-align': 'center',
                'line-height': '42px'
              });
            }else {
              $('.orderDetail-right .orderDetail-right-user-info .icon-user-avatar').css({
                'background-image': 'none',
                'background-color': '#000',
                'color': '#fff',
                'text-align': 'center',
                'line-height': '42px',
                'font-size': '18px'
              }).text(showPhoto);
            }
            toUserName = data.buyUserInfo.nickname;
              $('.orderDetail-right .orderDetail-right-user-info .user-info .name').html(data.buyUserInfo.nickname);
              $('.orderDetail-right .more-info').attr('userId',data.buyUserInfo.userId);
              getUser(data.buyUserInfo.userId);
              if( data.buyUserInfo.email != undefined){
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:last-child span').html(base.getText('电子邮件已验证'));
              }else{
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:last-child span').html(base.getText('电子邮件未验证')).next('i').removeClass('icon-checked');
              }
              if(data.buyUserInfo.mobile != undefined){
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:first-child span').html(base.getText('电话已验证'));
              }else{
                  $('.orderDetail-right .orderDetail-right-user-info  .yz span:first-child span').html(base.getText('电话未验证')).next('i').removeClass('icon-checked');;
              }
            }
            
            $("#statusInfo samp").html(tradeOrderStatusObj[data.status]);
            $("#tradePrice").html(data.tradePrice);
            $('.m_type').text(data.tradeCurrency);
            tradeCoin = data.tradeCoin ? data.tradeCoin : 'ETH';
            $("#countString").html(base.formatMoney(data.countString, '', tradeCoin) + '&nbsp;' + tradeCoin);

            $("#tradeAmount").html(data.tradeAmount);
            $("#orderCode").html(data.code.substring(data.code.length - 8));
            $("#payType").html(payType[data.payType]);
            $("#leaveMessage").html(data.leaveMessage);

            //卖家/买家信息
            $(".btn-wrap .am-button").addClass("hidden");
            //当前用户为买家，显示卖家信息
            if (data.buyUser == userId) {
                tradeType = '0';
                user = data.sellUserInfo;
                myInfo = data.buyUserInfo;
                $("#user").html(base.getText('卖家信息'));

                //待支付
                if (data.status == "0") {
                    $(".payBtn").removeClass("hidden");
                    $(".cancelBtn").removeClass("hidden");

                } else if (data.status == "2") {
                    if (data.bsComment != "0" && data.bsComment != "1") {

                        $(".commentBtn").removeClass("hidden");
                    }
                }

                //当前用户为卖家，显示买家信息
            } else {
                tradeType = '1';
                user = data.buyUserInfo;
                myInfo = data.sellUserInfo;
                $("#user").html(base.getText('买家信息'));

                //待支付
                if (data.status == "1") {
                    $(".releaseBtn").removeClass("hidden");
                } else if (data.status == "2") {
                    if (data.sbComment != "0" && data.sbComment != "1") {
                        $(".commentBtn").removeClass("hidden");
                    }
                }
            }

            //操作按鈕
            //已支付，待解冻
            if (data.status == "1") {
                $(".arbitrationBtn").removeClass("hidden");

            }
            //待下单
            if (data.status == "-1") {
                $(".orderDetail-info .info-wrap").addClass("hidden");
                if(data.type == 'buy'){
                    if(data.buyUser == userId){
                        $(".orderDetail-info .title").html('<i class="icon icon-order"></i>' + base.getText('购买订单'));
                        $(".goBuyDetailBtn").removeClass("hidden");
                    }
                }
                if(data.type == 'sell'){
                    if(data.sellUser == userId){
                        $(".orderDetail-info .title").html('<i class="icon icon-order"></i>' + base.getText('出售订单'));
                        $(".goSellDetailBtn").removeClass("hidden");
                    }
                }
                $('.cancelBtn').removeClass("hidden");
            }
            
            if (user.photo) {
                tradePhoto = `<div class="photo goHref" data-href="../user/user-detail.html?coin=${tradeCoin}&userId=${user.userId}"   style="background-image:url('${base.getAvatar(user.photo)}')"></div>`;
            } else {
                let tmpl = user.nickname ? user.nickname.substring(0, 1).toUpperCase() : '-';
                tradePhoto = '<div class="photo goHref" data-href="../user/user-detail.html?coin=' + tradeCoin + '&userId=' + user.userId + '" ><div class="noPhoto">' + tmpl + '</div></div>'
            }
            if (myInfo.photo) {
                tradePhotoMy = `<div class="photo" style="background-image:url('${base.getAvatar(myInfo.photo)}')"></div>`;
            } else {
                let tmpl = myInfo.nickname ? myInfo.nickname.substring(0, 1).toUpperCase() : '-';
                tradePhotoMy = '<div class="photo"><div class="noPhoto">' + tmpl + '</div></div>'
            }


            $("#photoWrap").html(tradePhoto);
            $("#nickname").html(user.nickname);

            if (!firstLoad) {
                getTencunLogin(); // 测试
                firstLoad = true;
            }
            $("#mobile").html(user.mobile != "" && user.mobile ? base.getText('已验证') : base.getText('未验证'));
            $("#email").html(user.email != "" && user.email ? base.getText('已验证') : base.getText('未验证'));
            $("#identity").html(user.realname != "" && user.realName ? base.getText('已验证') : base.getText('未验证'));
            $("#createDatetime").html(base.formateDatetime(user.createDatetime));

            base.hideLoadingSpin();
        }, base.hideLoadingSpin)
    }

    //获取用户详情
    function getUser(userId) {
        return UserCtr.getUser(true,userId).then((data) => {
            $('.orderDetail-right .orderDetail-right-user-info  .num .plus').html('+'+data.userStatistics.beiHaoPingCount);
            $('.orderDetail-right .orderDetail-right-user-info  .num .negative').html('-'+data.userStatistics.beiChaPingCount);
            $('.orderDetail-right .orderDetail-right-user-info  .trade span:first-child').html(data.userStatistics.jiaoyifangCount + ` ${base.getText('交易伙伴')}`);
            $('.orderDetail-right .orderDetail-right-user-info  .trade span:last-child').html(data.userStatistics.jiaoYiCount + base.getText('交易'));
        }, base.hideLoadingSpin)
    }
    //获取详情
    function getAdvertiseDetail() {
        return TradeCtr.getAdvertiseDetail(adsCode).then((data) => {
          let limit = data.minTrade + '-' + data.maxTrade;
          $("#truePrice").html(Math.floor(data.truePrice * 100) / 100 + '&nbsp;CNY/' + tradeCoin);
          $("#limit").html(limit);
          $(".info-wrap1").removeClass("hidden");
          let tagsHtml = ``;
          data.platTag.split('||').map((item) => {
            platTagList.map((k) => {
              if(item == k.key) {
                tagsHtml += `<span>${k.value}</span>`;
              }
            })
          });
          data.customTag ? tagsHtml += `<span>${data.customTag}</span>` : '';
          $('.zs-tags').html(tagsHtml);
          $('.zs-introduction').html(data.item);
        }, base.hideLoadingSpin)
    }

    function login() {
        let listeners = {
            'onConnNotify': onConnNotify,
            'onMsgNotify': onMsgNotify,
            'onBigGroupMsgNotify': onBigGroupMsgNotify,
            // 'onKickedEventCall': onKickedEventCall,
            'jsonpCallback': jsonpCallback //IE9(含)以下浏览器用到的jsonp回调函数，
        };
        let options = {
            'isAccessFormalEnv': true,
            'isLogOn': false
        };
        webim.login(loginInfo, listeners, options, function(resp) {
            // 获取历史消息;
            getLastGroupHistoryMsgs(function(msgList) {
                getHistoryMsgCallback(msgList);

                let msgflow = document.getElementById("msgflow");

                //向上翻页，获取更早的群历史消息
                let bindScrollHistoryEvent = {
                    init: function() {
                        msgflow.onscroll = function() {
                            if (msgflow.scrollTop == 0) {
                                msgflow.scrollTop = 10;
                                getPrePageGroupHistoryMsgs();
                            }
                        }
                    },
                    reset: function() {
                        msgflow.onscroll = null;
                    }
                };
                bindScrollHistoryEvent.init();
                getMyGroup();
            }, function(err) {
                console.log(err.ErrorInfo);
            });

        }, function() {
            //			console.log('login err');
            // self.setTententLogined(false);
        });
    }
    // 被其他登录实例踢下线
    function onKickedEventCall() {
        base.showMsg(base.getText('登录失效，请重新登录'));
        base.clearSessionUser();
        setTimeout(() => {
            base.showLoadingSpin();
            base.goLogin(true);
            base.hideLoadingSpin();
        }, 800);
    }
    //获取我的群组
    function getMyGroup() {

        let options = {
            'Member_Account': loginInfo.identifier,
            //'GroupType':'',
            'GroupBaseInfoFilter': [],
            'SelfInfoFilter': [
                'UnreadMsgNum'
            ]
        };
        webim.getJoinedGroupListHigh(
            options,
            function(resp) {
                if (!resp.GroupIdList || resp.GroupIdList.length == 0) {
                    return;
                }
                let unreadMsgFlag = false;
                for (let i = 0; i < resp.GroupIdList.length; i++) {
                    let unreadMsgNum = resp.GroupIdList[i].SelfInfo.UnreadMsgNum;

                    if (unreadMsgNum > 1) {
                        unreadMsgFlag = true
                    }
                }
                if (unreadMsgFlag) {
                    if (!$("#newMsgWrap").length) {
                        $("body").append(newMsgHtml)
                    }
                    if (!$("#newMsgWrap").hasClass("on")) {
                        $("#newMsgWrap").addClass('on')
                    }
                }
            },
            function(err) {
                console.log(err.ErrorInfo);
            }
        );
    }

    //表情初始化
    function showEmotionDialog() {
        if (emotionFlag) {
            $('#wl_faces_box').css({
                "display": "block"
            });
            return;
        }
        emotionFlag = true;

        for (let index in webim.Emotions) {
            let emotions = $('<img>').attr({
                "id": webim.Emotions[index][0],
                "src": webim.Emotions[index][1],
                "style": "cursor:pointer;"
            }).click(function() {
                selectEmotionImg(this);
            });
            $('<li>').append(emotions).appendTo($('#emotionUL'));
        }
        $('#wl_faces_box').css({
            "display": "block"
        });
    };

    function selectEmotionImg(selImg) {
        let txt = document.getElementById("msgedit");
        txt.value = txt.value + selImg.id;
        txt.focus();
    };

    //IE9(含)以下浏览器用到的jsonp回调函数
    function jsonpCallback(rspData) {
        webim.setJsonpLastRspData(rspData);
    }

    function onConnNotify(resp) {
        let info;
        switch (resp.ErrorCode) {
            case webim.CONNECTION_STATUS.ON:
                webim.Log.warn(base.getText('建立连接成功') + ': ' + resp.ErrorInfo);
                break;
            case webim.CONNECTION_STATUS.OFF:
                info = base.getText('连接已断开，无法收到新消息，请检查下你的网络是否正常') + ': ' + resp.ErrorInfo;
                webim.Log.warn(info);
                break;
            case webim.CONNECTION_STATUS.RECONNECT:
                info = base.getText('连接状态恢复正常') + ': ' + resp.ErrorInfo;
                webim.Log.warn(info);
                break;
            case '91101':
                // 被踢下线
                onKickedEventCall(resp);
                break;
            default:
                webim.Log.error(base.getText('未知连接状态') + ': =' + resp.ErrorInfo);
                break;
        }
    }

    // 监听新消息事件
    // newMsgList 为新消息数组，结构为[Msg]
    function onMsgNotify(newMsgList) {
      isNewMsg = true;
        let sess, newMsg;
        //获取所有聊天会话
        let sessMap = webim.MsgStore.sessMap();
        for (let j in newMsgList) { //遍历新消息
            newMsg = newMsgList[j];
            if (!selSess) { // 没有聊天对象
                selSess = newMsg.getSession();
            }
            if (newMsg.getSession().id() == groupId) { //为当前聊天对象的消息
                //在聊天窗体中新增一条消息
                //				console.warn(newMsg);
                addMsg(newMsg, '', 1);
            }
        }

        //消息已读上报，以及设置会话自动已读标记
        webim.setAutoRead(selSess, true, true);
        let otherNew = false;
        for (let i in sessMap) {
            sess = sessMap[i];
            if (groupId != sess.id()) { //更新其他聊天对象的未读消息数
                if (sess.unread() >= 1) {
                    otherNew = true;
                    //		            updateSessDiv(sess.type(), sess.id(), sess.unread());
                }
            } else {
                // console.log(sess);
            }
        }
        if (otherNew) {
            if (!$("#newMsgWrap").length) {
                $("body").append(newMsgHtml)
            }
            if (!$("#newMsgWrap").hasClass("on")) {
                $("#newMsgWrap").addClass('on')
            }
        }

    }
  
  function onBigGroupMsgNotify(msgList) {
    for (let i = msgList.length - 1; i >= 0; i--) {//遍历消息，按照时间从后往前
      let msg = msgList[i];
      webim.Log.error('receive a new group msg: ' + msg.getFromAccountNick());
      //显示收到的消息
    }
  }

    //读取群组基本资料-高级接口
    function getGroupInfo(group_id, cbOK, cbErr) {
        let options = {
            'GroupIdList': [
                group_id
            ],
            'GroupBaseInfoFilter': [
                'Type',
                'Name',
                'Introduction',
                'Notification',
                'FaceUrl',
                'CreateTime',
                'Owner_Account',
                'LastInfoTime',
                'LastMsgTime',
                'NextMsgSeq',
                'MemberNum',
                'MaxMemberNum',
                'ApplyJoinOption',
                'ShutUpAllMember'
            ],
            'MemberInfoFilter': [
                'Account',
                'Role',
                'JoinTime',
                'LastSendMsgTime',
                'ShutUpUntil'
            ]
        };
        webim.getGroupInfo(
            options,
            function(resp) {
                if (resp.GroupInfo[0].ShutUpAllMember == 'On') {
                    console.log(base.getText('该群组已开启全局禁言'));
                }
                if (cbOK) {
                    cbOK(resp);
                }
            },
            function(err) {
                console.log(err.ErrorInfo);
            }
        );
    };
    //获取最新的群历史消息,用于切换群组聊天时，重新拉取群组的聊天消息
    function getLastGroupHistoryMsgs(cbOk) {
        getGroupInfo(groupId, function(resp) {
            //拉取最新的群历史消息
            let options = {
                'GroupId': groupId,
                'ReqMsgSeq': resp.GroupInfo[0].NextMsgSeq - 1,
                'ReqMsgNumber': reqMsgCount
            };
            if (options.ReqMsgSeq == null || options.ReqMsgSeq == undefined || options.ReqMsgSeq <= 0) {
                webim.Log.warn(base.getText('该群还没有历史消息') + ":options=" + JSON.stringify(options));
                return;
            }
            selSess = null;
            //清空会话
            webim.MsgStore.delSessByTypeId(selType, groupId);
            // 获取消息
          setTimeout(() => {
            webim.syncGroupMsgs(
              options,
              function(msgList) {
                if (msgList.length == 0) {
                  webim.Log.warn(base.getText('该群还没有历史消息') + ":options=" + JSON.stringify(options));
                  return;
                }
                let msgSeq = msgList[0].seq - 1;
                getPrePageGroupHistroyMsgInfoMap[groupId] = {
                  "ReqMsgSeq": msgSeq
                };
                //清空聊天界面
                // document.getElementsByClassName("msgflow")[0].innerHTML = "";
                cbOk && cbOk(msgList);
              },
              function(err) {
                console.log(err.ErrorInfo);
              }
            );
          }, 200);
        });
    }
    //向上翻页，获取更早的群历史消息
    function getPrePageGroupHistoryMsgs(cbOk) {
        let tempInfo = getPrePageGroupHistroyMsgInfoMap[groupId]; //获取下一次拉取的群消息seq
        let reqMsgSeq;
        if (tempInfo) {
            reqMsgSeq = tempInfo.ReqMsgSeq;
            if (reqMsgSeq <= 0) {
                webim.Log.warn(base.getText('该群没有历史消息可拉取了'));
                return;
            }
        } else {
            webim.Log.error(base.getText('获取下一次拉取的群消息seq为空'));
            return;
        }
        let options = {
            'GroupId': groupId,
            'ReqMsgSeq': reqMsgSeq,
            'ReqMsgNumber': reqMsgCount
        };

        webim.syncGroupMsgs(
            options,
            function(msgList) {
                if (msgList.length == 0) {
                    webim.Log.warn(base.getText('该群还没有历史消息') + ":options=" + JSON.stringify(options));
                    return;
                }
                let msgSeq = msgList[0].seq - 1;
                getPrePageGroupHistroyMsgInfoMap[groupId] = {
                    "ReqMsgSeq": msgSeq
                };

                if (cbOk) {
                    cbOk(msgList);
                } else {
                    getHistoryMsgCallback(msgList, true);
                }
            },
            function(err) {
                console.log(err.ErrorInfo);
            }
        );
    };
    //获取历史消息(c2c或者group)成功回调函数
    //msgList 为消息数组，结构为[Msg]
    function getHistoryMsgCallback(msgList, prepage) {
        let msg;
        prepage = prepage || false;

        //如果是加载前几页的消息，消息体需要prepend，所以先倒排一下
        if (prepage) {
            msgList.reverse();
        }
        //		console.log('History', msgList);
        for (let j in msgList) { //遍历新消息
            msg = msgList[j];
            if (msg.getSession().id() == groupId) { //为当前聊天对象的消息
                selSess = msg.getSession();
                //在聊天窗体中新增一条消息
                addMsg(msg, prepage);
            }
        }
        //消息已读上报，并将当前会话的消息设置成自动已读login
        webim.setAutoRead(selSess, true, true);
    }

    // 发送-校验
    function onSendMsg(msgContent, suc) {
      let msg = '';
      if(msgContent.search(/^WE_B:/) === 0) {
        msg = msgContent.substring(5);
      };
      if(msg.trim() !== "") {
        let msgLen = webim.Tool.getStrBytes(msgContent);
        let maxLen = webim.MSG_MAX_LENGTH.GROUP;
        if (msgLen > maxLen) {
          if(langType == 'EN'){
            base.showMsg('Message length exceeded limit (up to' + Math.round(maxLen / 3) + 'characters)');
          }else{
            base.showMsg(`${base.getText('消息长度超出限制')}(${base.getText('最多')}` + Math.round(maxLen / 3) + `${base.getText('汉字')})`);
          }
          return;
        }
        handleMsgSend(msgContent, suc);
      }else {
        $('#msgedit').val('');
      }
    }

    // 发送-解析发送
    function handleMsgSend(msgContent, suc) {
        let sess = webim.MsgStore.sessByTypeId(webim.SESSION_TYPE.GROUP, groupId);
        if (!sess) {
            sess = new webim.Session(selType, groupId, groupName, '' /*, groupPhoto*/ , Math.round(new Date().getTime() / 1000));
        }
        let random = Math.round(Math.random() * 4294967296); // 消息随机数，用于去重
        let msgTime = Math.round(new Date().getTime() / 1000); // 消息时间戳
        let msg = new webim.Msg(sess, true, -1, random, msgTime, userId, subType, 'nickname' /*, this.user.nickname*/ );
        let textObj, faceObj, tmsg, emotionIndex, emotion, restMsgIndex;
        // 解析文本和表情
        let expr = /\[[^[\]]{1,3}\]/mg;
        let emotions = msgContent.match(expr);
        if (!emotions || emotions.length < 1) {
            textObj = new webim.Msg.Elem.Text(msgContent);
            msg.addText(textObj);
        } else {
            for (let i = 0; i < emotions.length; i++) {
                tmsg = msgContent.substring(0, msgContent.indexOf(emotions[i]));
                if (tmsg) {
                    textObj = new webim.Msg.Elem.Text(tmsg);
                    msg.addText(textObj);
                }
                emotionIndex = webim.EmotionDataIndexs[emotions[i]];
                emotion = webim.Emotions[emotionIndex];
                if (emotion) {
                    faceObj = new webim.Msg.Elem.Face(emotionIndex, emotions[i]);
                    msg.addFace(faceObj);
                } else {
                    textObj = new webim.Msg.Elem.Text(emotions[i]);
                    msg.addText(textObj);
                }
                restMsgIndex = msgContent.indexOf(emotions[i]) + emotions[i].length;
                msgContent = msgContent.substring(restMsgIndex);
            }
            if (msgContent) {
                textObj = new webim.Msg.Elem.Text(msgContent);
                msg.addText(textObj);
            }
        }
        // 发送
        webim.sendMsg(msg, () => {
            webim.Tool.setCookie("tmpmsg_" + groupId, '', 0);
            $('#msgedit').val('')
        }, () => {
            base.showMsg(base.getText('消息发送失败，请重新发送'));
        });
    }

    //聊天页面增加一条消息
    function addMsg(msg, prepend, isNew) {
        let isSelfSend, fromAccount, fromAccountNick, fromAccountImage, sessType, subType;
        //获取会话类型，目前只支持群聊
        //webim.SESSION_TYPE.GROUP-群聊，
        //webim.SESSION_TYPE.C2C-私聊，
        sessType = msg.getSession().type();

        isSelfSend = msg.getIsSend(); // 消息是否为自己发的
        fromAccount = msg.getFromAccount();
        if (!fromAccount) {
            return;
        }
        fromAccountNick = msg.getFromAccountNick() || fromAccount;
        fromAccountImage = msg.fromAccountHeadurl || '';
        if (fromAccount == 'admin') {
            fromAccountNick = base.getText('系统消息');
        }
        let onemsg = document.createElement("div");

        onemsg.className = "onemsg";
        let msghead = document.createElement("div");
        let msgbody = document.createElement("div");
        let msgPre = document.createElement("div");
        msghead.className = "msghead";
        msgPre.className = "msgcon";

        //解析消息

        //获取消息子类型
        //会话类型为群聊时，子类型为：webim.GROUP_MSG_SUB_TYPE
        //会话类型为私聊时，子类型为：webim.C2C_MSG_SUB_TYPE
        let adminMsg = '';
        subType = msg.getSubType();

        switch (subType) {
            case webim.GROUP_MSG_SUB_TYPE.COMMON: //群普通消息
                let tmpl = convertMsgtoHtml(msg);
                if (tmpl.sta) {
                    return;
                }
                if (fromAccount != 'admin') {
                    msgPre.innerHTML = tmpl.html;
                } else {
                    adminMsg = tmpl.html
                }
                break;
        }
        
        //系統消息 //昵称  消息时间
        if (fromAccount === 'admin') {
            msghead.innerHTML = base.getText(adminMsg) + '<samp style="color: #999;">(' + webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime())) + ")</samp>";
            onemsg.setAttribute('class', 'onemsg admin');
            showTimeName = base.getText('系統消息');
          // 客服消息
        }else if (fromAccount !== toUserId && fromAccount !== userId) {
          msghead.innerHTML = `<div class='photoWrap'><div class='photo'><div class='noPhoto'>${base.getText('客')}</div></div></div><div class='nameWrap'><samp class='name'>${base.getText('客服')}</samp><samp>` + webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime())) + '</samp></div>';
          onemsg.setAttribute('class', 'onemsg user');
          showTimeName = base.getText('客服消息');
          msgbody.className = "msgbody_kf";
          //对方消息
        } else if (fromAccount === toUserId) {
            msghead.innerHTML = "<div class='photoWrap'>" + tradePhoto + "</div><div class='nameWrap'><samp class='name'>" + webim.Tool.formatText2Html(userName) + "</samp><samp>" + webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime())) + '</samp></div>';
            onemsg.setAttribute('class', 'onemsg user');
          msgbody.className = "msgbody_ta";
          showTimeName = toUserName;
            //我的消息
        } else if(fromAccount === userId) {
            msghead.innerHTML = "<div class='photoWrap'>" + tradePhotoMy + "</div><div class='nameWrap'><samp class='name'>" + webim.Tool.formatText2Html(myName) + "</samp><samp>" + webim.Tool.formatText2Html(webim.Tool.formatTimeStamp(msg.getTime())) + '</samp></div>';
            onemsg.setAttribute('class', 'onemsg my');
          msgbody.className = "msgbody_my";
        }
        try {
          if(fromAccount !== userId) {
            if(document.getElementById('audioBuyDetail').muted !== false){
              document.getElementById('audioBuyDetail').muted = false;
            }
            document.getElementById('audioBuyDetail').play();
          }
        }catch (e) {
          console.log(e);
        }
        if(fromAccount !== userId && isNewMsg) {
          settimeout = true;
          isNewMsg = false;
          timeout();
        }
        if (fromAccount !== 'admin') {
            msgbody.appendChild(msgPre);
        }

        onemsg.appendChild(msghead);
        onemsg.appendChild(msgbody);
        if (fromAccount == 'admin') {
            if (isNew) {
                setTimeout(function() {
                    getOrderDetail();
                }, 1000)
            }
        }
        //消息列表
        let msgflow = document.getElementById("msgflow");
        if (prepend) {
            //300ms后,等待图片加载完，滚动条自动滚动到底部
            msgflow.insertBefore(onemsg, msgflow.firstChild);
            if (msgflow.scrollTop == 0) {
                setTimeout(function() {
                    msgflow.scrollTop = 0;
                }, 300);
            }
        } else {
            msgflow.appendChild(onemsg);
            //300ms后,等待图片加载完，滚动条自动滚动到底部
            setTimeout(function() {
                msgflow.scrollTop = msgflow.scrollHeight;
            }, 300);
        }

    }
    //把消息转换成Html
    function convertMsgtoHtml(msg) {
        let html = "",
            elems, elem, type, content;
        elems = msg.getElems(); //获取消息包含的元素数组
        let count = elems.length;
        let sta = 0;
        for (let i = 0; i < count; i++) {
            elem = elems[i];
            type = elem.getType(); //获取元素类型
            content = elem.getContent(); //获取元素对象
            switch (type) {
                case webim.MSG_ELEMENT_TYPE.TEXT:
                    let eleHtml = convertTextMsgToHtml(content);
                    //转义，防XSS
                    html += webim.Tool.formatText2Html(eleHtml);
                    break;
                case webim.MSG_ELEMENT_TYPE.CUSTOM:
                    sta = 1;
                    break;
                case webim.MSG_ELEMENT_TYPE.FACE:
                    html += convertFaceMsgToHtml(content);
                    break;
                case webim.MSG_ELEMENT_TYPE.IMAGE:
                    if (i <= count - 2) {
                        let customMsgElem = elems[i + 1]; // 获取保存图片名称的自定义消息elem
                        let imgName = customMsgElem.getContent().getData(); // 业务可以自定义保存字段，demo中采用data字段保存图片文件名
                        html += convertImageMsgToHtml(content, imgName);
                        i++; //下标向后移一位
                    } else {
                        html += convertImageMsgToHtml(content);
                    }
                    break;
                default:
                    webim.Log.error(base.getText('未知消息元素类型') + ': elemType=' + type);
                    break;
            }
        }
        return {
            html,
            sta
        };
    }

    //解析文本消息元素
    function convertTextMsgToHtml(content) {
      let context = content.getText();
      isWebUser = context.search(/^WE_B:/);
      if(isWebUser === 0) {
        return context.substring(5);
      }
      return context;
    }
    //解析表情消息元素
    function convertFaceMsgToHtml(content) {
        isWebUser = 1;
        let faceUrl = null;
        let data = content.getData();
        let index = webim.EmotionDataIndexs[data];

        let emotion = webim.Emotions[index];
        if (emotion && emotion[1]) {
            faceUrl = emotion[1];
        }
        if (faceUrl) {
            return "<img src='" + faceUrl + "'/>";
        } else {
            return data;
        }
    }
    //解析图片消息元素
  let picTime = null;
    function convertImageMsgToHtml(content, imageName) {
        let UUID = content.UUID;
        isWebUser = 1;
        let smallImage = content.getImage(webim.IMAGE_TYPE.SMALL); // 小图
        let bigImage = content.getImage(webim.IMAGE_TYPE.LARGE); // 大图
        let oriImage = content.getImage(webim.IMAGE_TYPE.ORIGIN); // 原图
        if (!bigImage) {
            bigImage = smallImage;
        }
        if (!oriImage) {
            oriImage = smallImage;
        }
      let len = getPicData.length;
      getPicData.push({
        imgUrls: smallImage.getUrl(),
        uuid: UUID
      });
        if(picTime) {
          clearTimeout(picTime);
        }
        picTime = setTimeout(() => {
          let doc = document;
          let bigPicDiv = doc.getElementById('bigPicDiv');
          bigPicDiv.innerHTML = '';
          let span = '';
          getPicData.forEach((item, index) => {
            span += `<span class="${item.uuid}${index}" data-index="${index}"><img class="img-thumbnail" src="${item.imgUrls}" /></span>`;
          });
          bigPicDiv.innerHTML = span;
        }, 1000);
        return `<img name='${imageName}' src='${smallImage.getUrl()}#${bigImage.getUrl()}#${oriImage.getUrl()}' style='cursor: pointer;' id='${content.getImageId()}' bigImgUrl='${bigImage.getUrl()}' data-index="${len}" />`;
    }

    // picUpload
    //选择图片触发事件
    function fileOnChange(uploadFile) {
        if (!window.File || !window.FileList || !window.FileReader) {
            console.log(base.getText('您的浏览器不支持') + "File Api");
            return;
        }
        let fileList = Array.from(uploadFile.files);
        let preDiv = document.getElementById('previewPicDiv');
        let span = document.createElement('span');
        if(fileList.length > 5) {
          base.showMsg('一次性上传不得超过5张');
          fileList.length = 5;
          isSendOk = false;
        }
        fileList.forEach((file, index) => {
          let reader = new FileReader();
          let fileSize = file.size;
          //先检查图片类型和大小
          if (!checkPic(uploadFile, fileSize)) {
            return;
          }
          //预览图片
          reader.onload = (function(file) {
            return function() {
              span.innerHTML += `<span class="x${index}"><img class="img-responsive" src="${this.result}" alt="${file.name}" /><b class="x" data-index="${index}"></b></span>`;
            };
          })(file);
          //预览图片
          reader.readAsDataURL(file);
        });
        preDiv.insertBefore(span, null);
    }

    //上传图片进度条回调函数
    //loadedSize-已上传字节数
    //totalSize-图片总字节数
    function onProgressCallBack(loadedSize, totalSize) {
        let progress = document.getElementById('upd_progress'); //上传图片进度条
        progress.value = (loadedSize / totalSize) * 100;
    }

    //上传图片
    function uploadPic() {
        let uploadFiles = document.getElementById('upd_pic');
        let fileList = Array.from(uploadFiles.files);
        if(fileList.length > 5) {
          fileList.length = 5;
        }
      fileList.forEach((file, index) => {
          if(!xIndexList.includes(index)) {
              let businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
              //封装上传图片请求
              let opt = {
                  'file': file, //图片对象
                  'onProgressCallBack': onProgressCallBack, //上传图片进度条回调函数
                  //'abortButton': document.getElementById('upd_abort'), //停止上传图片按钮
                  'To_Account': groupId, //接收者
                  'businessType': businessType //业务类型
              };
              //上传图片
              webim.uploadPic(opt,
                function(resp) {
                    //上传成功发送图片
                    sendPic(resp, file.name);
                    $('#upload_pic_dialog').hide();
                    isSendOk = true;
                },
                function(err) {
                    console.log(err.ErrorInfo);
                }
              );
          }
      });
    }
    //发送图片消息
    function sendPic(images, imgName) {
        if (!groupId) {
            alert(base.getText('您还没有好友，暂不能聊天'));
            return;
        }
        let sess = webim.MsgStore.sessByTypeId(webim.SESSION_TYPE.GROUP, groupId);
        if (!sess) {
            sess = new webim.Session(selType, groupId, groupName, '' /*, groupPhoto*/ , Math.round(new Date().getTime() / 1000));
        }
        let msg = new webim.Msg(sess, true, -1, -1, -1, userId, 0, 'nickname');
        let images_obj = new webim.Msg.Elem.Images(images.File_UUID);
        for (let i in images.URL_INFO) {
            let img = images.URL_INFO[i];
            let newImg;
            let type;
            switch (img.PIC_TYPE) {
                case 1: //原图
                    type = 1; //原图
                    break;
                case 2: //小图（缩略图）
                    type = 3; //小图
                    break;
                case 4: //大图
                    type = 2; //大图
                    break;
            }
            newImg = new webim.Msg.Elem.Images.Image(type, img.PIC_Size, img.PIC_Width, img.PIC_Height, img.DownUrl);
            images_obj.addImage(newImg);
        }
        msg.addImage(images_obj);
        //调用发送图片消息接口
        webim.sendMsg(msg, function(resp) {
            // if (selType == webim.SESSION_TYPE.C2C) {//私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
            //   addMsg(msg);
            // }
        }, function(err) {
            alert(err.ErrorInfo);
        });
    }
    //上传图片(用于低版本IE)
    function uploadPicLowIE() {
        let uploadFile = $('#updli_file')[0];
        let file = uploadFile.files[0];
        let fileSize = 50;
        //先检查图片类型和大小
        if (!checkPic(uploadFile, fileSize)) {
            return;
        }
        let businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
        //封装上传图片请求
        let opt = {
            'formId': 'updli_form', //上传图片表单id
            'fileId': 'updli_file', //file控件id
            'To_Account': groupId, //接收者
            'businessType': businessType //图片的使用业务类型
        };
        webim.submitUploadFileForm(opt,
            function(resp) {
                $('#upload_pic_low_ie_dialog').hide();
                //发送图片
                sendPic(resp);
            },
            function(err) {
                $('#upload_pic_low_ie_dialog').hide();
                alert(err.ErrorInfo);
            }
        );
    }
    //检查文件类型和大小
    function checkPic(obj, fileSize) {
        let picExts = 'jpg|jpeg|png|bmp|gif|webp';
        let photoExt = obj.value.substr(obj.value.lastIndexOf(".") + 1).toLowerCase(); //获得文件后缀名
        let pos = picExts.indexOf(photoExt);
        if (pos < 0) {
            alert(base.getText('您选中的文件不是图片，请重新选择'));
            return false;
        }
        fileSize = Math.round(fileSize / 1024 * 100) / 100; //单位为KB
        if (fileSize > 30 * 1024) {
            alert(base.getText('您选择的图片大小超过限制(最大为30M)，请重新选择'));
            return false;
        }
        return true;
    }
    //单击图片事件
    function imageClick(imgObj) {
        let imgId = imgObj.id;
        let imgIndex = $(imgObj).attr('data-index');
        let imgClass = '.' + imgId + imgIndex;
        setImgIndex = imgIndex;
        $(imgClass).show(300).siblings().hide(200);
        $('#click_pic_dialog').show();
    }
    //弹出发图对话框
    function selectPicClick() {
        // 判断浏览器版本
        if (webim.BROWSER_INFO.type == 'ie' && parseInt(webim.BROWSER_INFO.ver) <= 9) {
            $('#updli_form')[0].reset();
            $('#upload_pic_low_ie_dialog').show();
        } else {
            $('#upd_form')[0].reset();
            let preDiv = document.getElementById('previewPicDiv');
            preDiv.innerHTML = '';
            let progress = document.getElementById('upd_progress'); //上传图片进度条
            progress.value = 0;
            $('#upload_pic_dialog').show();
        }
    }
    function addListener() {
      
      // 发送常用语
        $('#phraseUL').click(function(e) {
            e.stopPropagation();
            let target = e.target;
            if($(target).hasClass('phrase-add')) {
                $('#click_phrase').removeClass('hidden');
            }
            if($(target).hasClass('phrase-set')) {
                $('#phraseUL .phrase-add').addClass('hidden');
                $('#phraseUL .phrase-set').addClass('hidden');
                $('#phraseUL .phrase-rem').removeClass('hidden');
                $('#phraseUL .dele-phrase').removeClass('hidden');
            }
            if($(target).hasClass('phrase-rem')) {
                $('#phraseUL .phrase-add').removeClass('hidden');
                $('#phraseUL .phrase-set').removeClass('hidden');
                $('#phraseUL .phrase-rem').addClass('hidden');
                $('#phraseUL .dele-phrase').addClass('hidden');
            }
            if($(target).hasClass('dele-phrase')) {
                let dex = $(target).attr('data-index');
                let dID = $(target).attr('data-id');
                UserCtr.delUserPhrase({id: dID}).then(() => {
                    $('#phraseUL li').remove(`.li0${dex}`);
                    if($('#phraseUL li').length === 0) {
                        $('#phraseUL .phrase-add').removeClass('hidden');
                        $('#phraseUL .phrase-set').removeClass('hidden');
                        $('#phraseUL .phrase-rem').addClass('hidden');
                        $('#phraseUL .dele-phrase').addClass('hidden');
                    };
                }, () => {
                    base.showMsg('操作失败');
                });
            }
        });
      $('#phraseUL').on('click', 'li p', function(e) {
        let txt = $(this).text();
        onSendMsg('WE_B:' + txt);
        $('.phraseUL-warp').addClass('hidden');
      });

        //立即下单点击
        $(".orderDetail-middle .title .item").click(function() {
                let _this = $(this)
                if (!_this.hasClass("on")) {
                    _this.addClass("on").siblings(".item").removeClass("on");
                    $(".orderDetail-middle .content-wrap .wrap").eq(_this.index())
                        .removeClass("hidden").siblings(".wrap").addClass("hidden");
                }
            })
            //--聊天 star--
            $('#send').on('click', function() {
                if($('#msgedit').val()!=""&&$('#msgedit').val()){
                    onSendMsg('WE_B:' + $('#msgedit').val());
                }
            });
            // $('#msgedit').on('click', function() {
            //     if ($('#msgedit').val() != "" && $('#msgedit').val()) {
            //         onSendMsg($('#msgedit').val());
            //     }
            // });
        $(document).keyup(function(event) {
            if (event.keyCode === 13 && $('#msgedit').val().trim() !== "" ) {
                if ($('#msgedit').val()) {
                    onSendMsg('WE_B:' + $('#msgedit').val());
                    $('#msgedit').val('')
                }else {
                  return;
                }
            }
        });

        $('#group').on('click', function() {
            createGroup();
        });
        // 图片上传 star
        $('#openPic').on('click', selectPicClick);
        $('#upd_pic').on('change', function() {
            if(isSendOk) {
                fileOnChange(this);
            }
        });
        $('#upd_send').on('click', function() {
            if ($('#upd_pic').val() !== "" && $('#upd_pic').val()) {
                uploadPic();
            }else {
                base.showMsg(base.getText('请选择图片后操作'));
            }
        });
        $('#upd_close').on('click', function() {
            $('#upload_pic_dialog').hide();
        });
        $('#upload_pic_dialog .close').on('click', function() {
            $('#upload_pic_dialog').hide();
        });

        // ie<=9
        $('#updli_send').on('click', function() {
            if ($('#updli_file').val() != "" && $('#updli_file').val()) {
                uploadPicLowIE();
            }
        });
        $('#updli_close').on('click', function() {
            $('#upload_pic_low_ie_dialog').hide();
        });
        $('#upload_pic_low_ie_dialog .close').on('click', function() {
            $('#upload_pic_low_ie_dialog').hide();
        });

        $('#msgflow').on('click', 'img', function() {
            window.requestAnimationFrame(() => {
                $('#bigPicDiv').children().eq(setImgIndex).children('img').css('transform', 'scale(1)');
                $('#bigPicDiv').css('overflow', 'hidden');
            });
            scaleIndex = 1;
            imageClick(this);
        });
        $('#click_pic_dialog_close').on('click', function() {
            $('#click_pic_dialog').hide();
        })
        $('#click_pic_dialog .close').on('click', function() {
            $('#click_pic_dialog').hide();
        });

        //表情
        $('.k-orderDet-mid').on('click', function(){
            if($("#msgImg").hasClass("on")){
                $(".emotionUL-wrap").addClass("hidden");
                $("#msgImg").removeClass("on");
            }
        });
        $(document).on('click', function(e) {
          $("#msgImg").removeClass("on");
          $(".emotionUL-wrap").addClass("hidden");
          $('.phraseUL-warp').addClass('hidden');
        });
        $('#msgImg').on('click', function() {
            event.stopPropagation();
            $('.phraseUL-warp').addClass('hidden');
            if ($(this).hasClass("on")) {
                $(".emotionUL-wrap").addClass("hidden");
                $(this).removeClass("on");
            } else {
                $(".emotionUL-wrap").removeClass("hidden");
                $(this).addClass("on");
                showEmotionDialog();
            }
        });
        $('#phrase').on('click', function(e) {
            e.stopPropagation();
            $(".emotionUL-wrap").addClass("hidden");
          if($('.phraseUL-warp').hasClass('hidden')) {
              $('#phraseUL .phrase-add').removeClass('hidden');
              $('#phraseUL .phrase-set').removeClass('hidden');
              $('#phraseUL .phrase-rem').addClass('hidden');
              $('#phraseUL .dele-phrase').addClass('hidden');
            $('.phraseUL-warp').removeClass('hidden');
          }else {
            $('.phraseUL-warp').addClass('hidden');
          }
        });

      //评价
      // $("#commentDialog .comment-Wrap .item .icon").click(function() {
      //   // $(this).addClass('on').parent().addClass("on").siblings(".item").removeClass("on")
      //   $(this).addClass('on');
      // });
        //取消订单按钮 点击
        $(".cancelBtn").on("click", function() {
            base.confirm(base.getText('确认取消交易？'), base.getText('取消'), base.getText('确定')).then(() => {
                base.showLoadingSpin();
                TradeCtr.cancelOrder(code).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功'));
                    auSx();
                }, base.hideLoadingSpin);
            }, base.emptyFun)
        })

        //标记打款按钮 点击
        $(".operation-item .payBtn").on("click", function() {
          $("#paidDialog").removeClass("hidden")
        });
      //取消 点击
      $(".operation-item .canBtn").on("click", function() {
        $("#cancelDialog").removeClass("hidden")
      })
      // 放行比特币按钮 点击
      $(".release-btn").on("click", function() {
        if(tradeOrderStatus == '1') {
          // 买家已付款
          $("#releasePaidDialog").removeClass("hidden");
        } else if(tradeOrderStatus == '5'){
          $("#releasePaidDialog").removeClass("hidden");
        }else {
          // 买家未付款
          $("#releaseUnpaidDialog").removeClass("hidden")
        }
      });
      
      // 买家已支付，可发起仲裁
      $('.orderDetail-left-release .sqzc').click(function() {
        if(tradeOrderStatus == '1') {
          // 买家已付款
          $("#arbitrationDialog").removeClass("hidden");
          isFqzc = true;
        }
      });
      
      // 重新打开
      $('.jyycs .sp_cxdk').click(function() {
        base.showLoadingSpin();
        TradeCtr.openOrder({
          updater: userId,
          code
        }).then(() => {
          base.hideLoadingSpin();
        }, base.hideLoadingSpin);
      });

      //申請仲裁按钮 点击
      $(document).on("click",'.arbitrate-btn', function() {
          $("#arbitrationDialog").removeClass("hidden");
      });

        let _arbitrationformWrapper = $("#arbitrationform-wrapper");
        _arbitrationformWrapper.validate({
            'rules': {
                'reason': {
                    required: true
                },
            }
        })

        //彈窗-申請仲裁
        $(".arbitration-subBtn").click(function() {
            let params = _arbitrationformWrapper.serializeObject();
            if (_arbitrationformWrapper.valid()) {
                base.showLoadingSpin();
                TradeCtr.arbitrationlOrder({
                    code: code,
                    reason: params.reason
                }).then(() => {
                    base.hideLoadingSpin();
                    base.showMsg(base.getText('操作成功'));
                    auSx();
                    $("#arbitrationDialog").addClass("hidden");
                    $("#form-wrapper .textarea-item").val("")
                }, base.hideLoadingSpin)
            }
        });
      $(".arbitration-canBtn").on("click", function() {
        $('#arbitrationDialog .fy_reason').val('');
         $("#arbitrationDialog").addClass("hidden");
      });
      //评价按钮 点击
      $(".finished-top").on("click", '.comment-btn', function() {
        $("#commentDialog").removeClass("hidden");
      });

        //彈窗-放棄
        $("#arbitrationDialog .closeBtn").click(function() {
          $("#arbitrationform-wrapper .textarea-item").val("");
            $("#arbitrationDialog").addClass("hidden");
        });

        let _formWrapper = $("#form-wrapper");
        _formWrapper.validate({
            'rules': {
                'reason': {
                    required: true
                },
            }
        })

        //彈窗-申請仲裁
        $("#arbitrationDialog .subBtn").click(function() {
            let params = _formWrapper.serializeObject();
            if (_formWrapper.valid()) {
                base.showLoadingSpin();
                TradeCtr.arbitrationlOrder({
                    code: code,
                    reason: params.reason
                }).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功'));
                    auSx();
                    $("#arbitrationDialog").addClass("hidden");
                    $("#form-wrapper .textarea-item").val("")
                }, base.hideLoadingSpin)
            }
        });
        
        //取消仲裁改成取消订单
        $(".orderDetail-cancel").click(function () {
            // TradeCtr.arbitrationlCancel(code).then(() => {
            //     base.hideLoadingSpin();
            //     base.showMsg(base.getText('操作成功'));
            //     auSx();
            // }, base.hideLoadingSpin)
          $("#cancelDialog").removeClass("hidden");
        });

        //交易评价按钮 点击
        // $(".commentBtn").on("click", function() {
        //     let orderCode = $(this).attr("data-ocode");
        //     $('#pjText').val('');
        //     $("#commentDialog .subBtn").attr("data-ocode", orderCode)
        //     $("#commentDialog").removeClass("hidden")
        // })

        //解冻货币按钮 点击
        $(".releaseBtn").on("click", function() {
            base.confirm(base.getText('确认解冻货币？'), base.getText('取消'), base.getText('确定')).then(() => {
                base.showLoadingSpin()
                TradeCtr.releaseOrder(code).then(() => {
                    base.hideLoadingSpin();

                    base.showMsg(base.getText('操作成功'));
                    auSx();
                }, base.hideLoadingSpin);
            }, base.emptyFun)
        })

        $(".commentDialog .comment-Wrap .item").click(function() {
            $(this).addClass("on").siblings(".item").removeClass("on")
        });
  
      $('.comment_yhts .ts_btn').click(function() {
        const reason = $('#tsText').val();
        if(!reason){
          base.showMsg(base.getText('请填写投诉理由'));
          return;
        }
        let config={
          updater: userId,
          code:code,
          reason
        };
        TradeCtr.userComplaints(config).then(() => {
          base.showMsg(base.getText('操作成功'));
          $('.commentDialog').addClass('hidden');
          $('.comment_pjts').removeClass('hidden');
          $('.comment_yhts').addClass('hidden');
        });
      });
        $('.comment_yhts .qx_btn').click(function() {
            $('.commentDialog').addClass('hidden');
            $('.comment_pjts').removeClass('hidden');
            $('.comment_yhts').addClass('hidden');
        });
        $('.commentDialog .fhBtn').click(function() {
            $('.commentDialog').addClass('hidden');
            $('.comment_pjts').removeClass('hidden');
            $('.comment_yhts').addClass('hidden');
        });

        $(".commentDialog .subBtn").click(function() {
            base.showLoadingSpin();
            let comment = $(".commentDialog .comment-Wrap .item.on").attr("data-value");
            let content = $('#pjText').val();
            let code = base.getUrlParam("code");
            let config={
                updater: userId,
                code:code,
                starLevel:comment,
                content:content
            };
            if(!orderPjStatus) {
              TradeCtr.commentOrder(config).then((data) => {
                base.hideLoadingSpin();
                if(data.filterFlag === '2'){
                  base.showMsg(base.getText('操作成功, 其中含有关键字，需平台进行审核'));
                }else{
                  base.showMsg(base.getText('操作成功'));
                }
                $(".commentDialog .comment-Wrap .item").eq(0).addClass("on").siblings(".item").removeClass("on");
              }, base.hideLoadingSpin)
            }else {
              TradeCtr.exitCommentOrder(config).then((data) => {
                base.hideLoadingSpin();
                if(data.filterFlag === '2'){
                  base.showMsg(base.getText('操作成功, 其中含有关键字，需平台进行审核'));
                }else{
                  base.showMsg(base.getText('操作成功'));
                }
                $(".commentDialog .comment-Wrap .item").eq(0).addClass("on").siblings(".item").removeClass("on");
              }, base.hideLoadingSpin);
            }
        });

        //购买 点击
        $(".goBuyDetailBtn").on("click", function() {
                base.gohref("../trade/buy-detail.html?code=" + adsCode)
            });
            //出售 点击
        $(".goSellDetailBtn").on("click", function() {
            base.gohref("../trade/sell-detail.html?code=" + adsCode)
        });

        // 取消弹窗 - 确定
        $('.cancel-dialog .paid-subBtn').click(() => {
          TradeCtr.cancelOrder(code).then(() => {
            base.showLoadingSpin();
            base.showMsg(base.getText('操作成功'));
            auSx();
              // setTimeout(function() {
              //     base.gohref('./order-list.html');
              // }, 1500)
          }, base.hideLoadingSpin);
        });

        // 取消弹窗 - 取消
        $('.cancel-dialog .paid-canBtn').click(() => {
          $("#cancelDialog").addClass("hidden")
        });
  
      // 取消弹窗 - 取消
      $('.orderDetail-left-arbitrate .cancel-btn').click(() => {
        $("#cancelDialog").removeClass("hidden")
      });

      // 支付弹窗 - 确定
      $('.paid-dialog .paid-subBtn').click(() => {
        TradeCtr.payOrder(code).then(() => {
          if(document.getElementById('audioOrderDetail').muted != false){
              document.getElementById('audioOrderDetail').muted = false;
          }
            document.getElementById('audioOrderDetail').play();
          base.hideLoadingSpin();
          base.showMsg(base.getText('操作成功'));
          setTimeout(function() {
            auSx();
          }, 3000)
        }, base.hideLoadingSpin)
      });

        // 支付弹窗 - 取消
        $('.paid-dialog .paid-canBtn').click(() => {
          $("#paidDialog").addClass("hidden")
        });


      // 释放比特币（买家已支付）弹窗 - 确定
      $('.release-paid-dialog .subBtn').click(() => {
        base.showLoadingSpin();
        TradeCtr.releaseOrder(code).then(() => {
          base.hideLoadingSpin();

          base.showMsg(base.getText('操作成功'));
          $('#releasePaidDialog').addClass('hidden');
        }, base.hideLoadingSpin);
      });

      // 释放比特币（买家已支付）弹窗 - 取消
      $('.release-paid-dialog .canBtn').click(() => {
        $("#releasePaidDialog").addClass("hidden")
      });

      // 释放比特币（买家未支付）弹窗 - 确定
      $('.release-unpaid-dialog .subBtn').click(() => {
        $("#releaseUnpaidDialog").addClass("hidden")
      });

      //订单详情提示消失
        $('.orderDetail-left-tips-button').click(() => {
            $('.orderDetail-left-tips').hide();
        })

        //跳转卖家信息
        $('.more-info').click(() => {
            let userId = $('.more-info').attr('userId');
            if(base.getUrlParam('adsCode') == '' || base.getUrlParam('adsCode') == undefined){
                base.gohref("../user/user-detail.html?userId="+userId+"&adsCode="+base.getUrlParam('code'));
            }else {
                base.gohref("../user/user-detail.html?userId="+userId+"&adsCode="+base.getUrlParam('adsCode'));
            }
        });
        
        // 进入评价
      $('.comment_pjts .comment_pj').click(function() {
        $('.commentDialog').removeClass('hidden');
        $('.comment_pjts').addClass('hidden');
      });
      
      // 投诉
      $('.comment_pjts .comment_ts').click(function() {
        $('.commentDialog').addClass('hidden');
        $('.comment_pjts').addClass('hidden');
        $('.comment_yhts').removeClass('hidden');
      });
        
        // 放大缩小图片
      let scaleIndex = 1, outscroll = null;
      $('#click_pic_dialog .jia').click(function() {
        scaleIndex += 0.2;
        $('#bigPicDiv img').css({
          transform: `scale(${scaleIndex})`
        });
        $('#bigPicDiv').css('overflow', 'auto');
        if(outscroll) {
          clearTimeout(outscroll);
        }
        outscroll = setTimeout(() => {
          $('#bigPicDiv').css('overflow', 'scroll');
        }, 16);
      });
      $('.am-modal-body').click(function(e) {
        e.stopPropagation();
        let target = e.target;
        if($(target).hasClass('pic-left')) {
          if(setImgIndex === 0) {
            setImgIndex = getPicData.length - 1
          }else {
            setImgIndex --;
          }
          $('#bigPicDiv').children().eq(setImgIndex).show(100).siblings().hide();
          $('#bigPicDiv').children().eq(setImgIndex).children('img').css('transform', 'scale(1)');
            setTimeout(() => {
                $('#bigPicDiv').css('overflow', 'hidden');
            }, 200);
          scaleIndex = 1;
        }
        if($(target).hasClass('pic-right')) {
          if(setImgIndex === getPicData.length - 1) {
            setImgIndex = 0
          }else {
            setImgIndex ++;
          }
          $('#bigPicDiv').children().eq(setImgIndex).show(100).siblings().hide();
          $('#bigPicDiv').children().eq(setImgIndex).children('img').css('transform', 'scale(1)');
          setTimeout(() => {
              $('#bigPicDiv').css('overflow', 'hidden');
          }, 200);
          // window.requestAnimationFrame(() => {
          //     $('#bigPicDiv').css('overflow', 'hidden');
          // });
          scaleIndex = 1;
        }
        if($(target).hasClass('x')) {
            let xIndex = +$(target).attr('data-index');
            xIndexList.push(xIndex);
            $('#previewPicDiv span').remove(`.x${xIndex}`);
        }
      });
      
      $('#click_pic_dialog .jian').click(function() {
        if(scaleIndex > 1) {
          scaleIndex -= 0.2;
        }else {
          scaleIndex = 1;
        }
        $('#bigPicDiv img').css({
          transform: `scale(${scaleIndex})`
        });
        $('#bigPicDiv').css('overflow', 'auto');
        if(outscroll) {
          clearTimeout(outscroll);
        }
        outscroll = setTimeout(() => {
          $('#bigPicDiv').css('overflow', 'scroll');
        }, 16);
      });
      $('#click_pic_dialog').click(function() {
        $('#click_pic_dialog').hide();
      });
      $('#phrase_close').click(function() {
          $('#click_phrase').addClass('hidden');
      });
      $('#click_phrase .close').click(function() {
          $('#click_phrase').addClass('hidden');
      });
      $('#phrase_Bt').click(function() {
          let phraseArea = $('#phrase_area').val().trim();
          if(!phraseArea) {
              base.showMsg(base.getText('请输入常用语'));
              return;
          }else {
              base.showLoadingSpin();
              UserCtr.addUserPhrase({content: phraseArea}).then(() => {
                  base.hideLoadingSpin();
                  base.showMsg(base.getText('常用语添加成功'));
                  $('#click_phrase').addClass('hidden');
                  $('.phraseUL-warp').removeClass('hidden');
                  $('#phrase_area').val('');
                  getPhraseData();
              }, base.hideLoadingSpin);
          }
      });
        // 自动刷新页面
        function auSx() {
            window.location.reload();
        }
    }
});