define([
  'app/controller/base',
  'app/interface/GeneralCtr'
], function (base, GeneralCtr) {
  let langType = localStorage.getItem('langType') || 'ZH';

  getFooData();

  function init() {
    $('.foo-en_gj').text(base.getText('工具', langType));
    $('.en-help').text(base.getText('帮助中心', langType));
    $('.foo-en_gywm').text(base.getText('关于我们', langType));
    $('.foo-en_pt').text(base.getText('平台介绍', langType));
    $('.foo-en_lx').text(base.getText('联系我们', langType));
    $('.foo-en_gg').text(base.getText('公告', langType));
    $('.foo-en_tk').text(base.getText('条款说明', langType));
    $('.foo-en_yhxy').text(base.getText('用户协议', langType));
    $('.foo-en_ystk').text(base.getText('隐私条款', langType));
    $('.foo-en_flsm').text(base.getText('法律声明', langType));
    $('.foo-en_fvsm').text(base.getText('费率说明', langType));

    if(langType === 'EN'){
      $('.contact-txt').css('width', '39%');
    }
    addListener();
    getListHelpCategory();
  }

  // 获取Q社群
  function getFooData() {
    return GeneralCtr.getBanner({
      location: 'community'
    }).then((data) => {
      let qHtml = '';
      if (data.length === 0) {
        $('.foot-text').addClass('hidden');
      } else {
        $('#qrcodeF').children('img').prop('src', base.getAvatar(data[0].pic));
      }
      data.forEach(item => {
        qHtml += `
                <div class="contact-info" data-url="${item.pic}" data-type="${item.type}" data-href="${item.type === 'qq' ? 'http://wpa.qq.com/msgrd?v=3&site=qq&menu=yes&uin='+item.url : ''}" >
                    <div class="foo-tip"  >
                        <img src="${item.type === 'qq' ? '/static/images/qq.png' : '/static/images/weixin.png'}">
                        <div class="foo-qq"><span class="fname">${base.getText('客服')}${base.getText(item.type)}</span>：<span class="foo-url">${item.url}</span></div>
                    </div>
                </div>
                `
      });
      $('.contact-info-wrap').html(qHtml);
      $('.foot-text').removeClass('hidden');
      $('.contact-info-wrap').removeClass('hidden');
      init();
    }, (msg) => {
      base.showMsg(msg || base.getText('加载失败', langType));
    });
  }
  
  // 列表查询文章类别
  // 列表查询文章类别
  function getListHelpCategory() {
    return GeneralCtr.getListHelpCategory().then((data) => {
      base.hideLoadingSpin();
      let html = `
        <li class="foo-li">
            <h2 class="foo-en_gj">工具</h2>
            <ul>
                <li class="help en-help goHref" data-href="../public/help.html">帮助中心</li>
            </ul>
        </li>
      `;
      data.forEach((item, index) => {
        let aHItem = '';
        item.articleList.forEach((dList, dIndex) => {
          aHItem += `<li class="goHref foo-en_pt" data-href="../public/help.html?pkey=${index}&key=${dIndex}">${dList.title}</li>`
        });
        html += `<li class="foo-li">
                    <h2 class="foo-en_tk">${item.name}</h2>
                    <ul>
                        ${aHItem}
                    </ul>
                </li>`;
        $('.contact-txt #foo_help').html(html);
      });
    }, base.hideLoadingSpin);
  }
  
  
  function addListener() {
    $('.contact-info-wrap .contact-info').mouseenter(function () {
      let src = $(this).attr('data-url');
      $('#qrcodeF').children('img').prop('src', base.getAvatar(src));
    })
    
    // $('#foo_help').on('click', 'li.help-article_item', function() {
    //   alert(1);
    // })
    // $("#footer .contact-info-wrap .goHref").off("click").click(function () {
    //     if (base.isLogin() && $(this.attr("data-type") == 'qq')) {
    //         var thishref = $(this).attr("data-href");
    //         window.location.href=thishref;
    //     }else {
    //         base.goLogin();
    //         return false;
    //     }
    // })
  }
})
