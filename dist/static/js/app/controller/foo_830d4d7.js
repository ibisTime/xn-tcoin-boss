'use strict';

define('js/app/controller/foo', ['js/app/controller/base', 'js/app/interface/GeneralCtr'], function (base, GeneralCtr) {
  var langType = localStorage.getItem('langType') || 'ZH';

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

    if (langType === 'EN') {
      $('.contact-txt').css('width', '39%');
    }
    addListener();
  }

  // 获取Q社群
  function getFooData() {
    return GeneralCtr.getBanner({
      location: 'community'
    }).then(function (data) {
      var qHtml = '';
      if (data.length === 0) {
        $('.foot-text').addClass('hidden');
      } else {
        $('#qrcodeF').children('img').prop('src', base.getAvatar(data[0].pic));
      }
      data.forEach(function (item) {
        qHtml += '\n                <div class="contact-info" data-url="' + item.pic + '">\n                    <div class="foo-tip">\n                        <img src="' + (item.type === 'qq' ? '/static/images/qq.png' : '/static/images/weixin.png') + '">\n                        <div class="foo-qq"><span class="fname">' + base.getText('客服') + base.getText(item.type) + '</span>\uFF1A<span class="foo-url">' + item.url + '</span></div>\n                    </div>\n                </div>\n                ';
      });
      $('.contact-info-wrap').html(qHtml);
      $('.foot-text').removeClass('hidden');
      $('.contact-info-wrap').removeClass('hidden');
      init();
    }, function (msg) {
      base.showMsg(msg || base.getText('加载失败', langType));
    });
  }

  function addListener() {
    $('.contact-info-wrap .contact-info').mouseenter(function () {
      var src = $(this).attr('data-url');
      $('#qrcodeF').children('img').prop('src', base.getAvatar(src));
    });
  }
});