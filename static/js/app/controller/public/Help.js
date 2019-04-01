define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Ajax, GeneralCtr, Top, Foo) {
    var code = base.getUrlParam('code') || '';
    let langType = localStorage.getItem('langType') || 'ZH';
    let detailMsg = '';

    init();

    function init() {
        base.showLoadingSpin();
        if(langType == 'EN'){
            $('title').text('blockchain technology application experimental platform');
        }
        $('title').text('区块链技术应用实验平台');
        $('.fy_help').html(base.getText('帮助中心'));

        $(".head-nav-wrap .help").addClass("active");
        getListHelpCategory();
        addListener();
    }

    // 列表查询文章类别
    function getListHelpCategory() {
        return GeneralCtr.getListHelpCategory().then((data) => {
            base.hideLoadingSpin();
            let html = '';
            data.forEach((item, index) => {
                html += `<li class="article-item code_${item.code}" data-code="${item.code}">${item.name}</li>`;
            });
            $('#help-left').append(html);

            // 选中
            if(code) {
                $('#help-left li.code_' + code).addClass('sel-li');
            } else {
                $('#help-left li').eq(1).addClass('sel-li');
                code = $('#help-left li').eq(1).attr('data-code');
            }
            $('.hmoney-tit').text($('#help-left li.sel-li').text());

            getListHelp();
        }, base.hideLoadingSpin);
    }

    // 列表查询帮助
    function getListHelp() {
        return GeneralCtr.getListHelp(code).then((data) => {
            base.hideLoadingSpin();
            let html = '';
            data.forEach((item, index) => {
                html += buildHtml(item);
                
            });
          getDetailHelp(data[0].code);
            $('#content').html(html);
        }, base.hideLoadingSpin);
    }
    
    // 详情查帮助
    function getDetailHelp(detailCode) {
      return GeneralCtr.getDetailHelp(detailCode).then(data => {
        detailMsg = data.content;
      });
    }

    function buildHtml(item) {
        return `<div class="help-list-item">
                    <div class="title-wrap over-hide">
                        <div class="title fl">${item.title}</div>
                        <div class="icon icon-right fr"></div>
                    </div>
                    <div class="content-wrap hidden">${item.content}</div>
                </div>`;
    }

    function addListener() {
        $('.article-left').on('click', 'li.article-item', function(){
            let thisCode = $(this).attr('data-code');
            base.gohref(base.changeURLArg(location.href, "code", thisCode));
        });

        $('#content').on('click', '.help-list-item .title-wrap', function(){
            if ($(this).siblings('.content-wrap').hasClass('hidden')) {
                $(this).siblings('.content-wrap').removeClass('hidden');
            } else {
                $(this).siblings('.content-wrap').addClass('hidden')
            }

        });
    }
});