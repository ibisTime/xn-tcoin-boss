define([
    'app/controller/base',
    'app/util/ajax',
    'app/interface/GeneralCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, Ajax, GeneralCtr, Top, Foo) {
    var code = base.getUrlParam('code') || 'WZ20190324210756951530028';
    let langType = localStorage.getItem('langType') || 'ZH';
    let detailMsg = '';

    init();

    function init() {
        base.showLoadingSpin();
        $('title').text(base.getText('区块链技术应用实验平台'));
        //$('.fy_help').html(base.getText('帮助中心222'));

        $(".head-nav-wrap .help").addClass("active");
        getListHelpCategory();
        addListener();
    }

    // 列表查询文章类别
    function getListHelpCategory() {
        return GeneralCtr.getListHelpCategory().then((data) => {
            base.hideLoadingSpin();
            let html = '', len = data.length - 1;
            GeneralCtr.getDetailHelp(code).then(data => {
              $('.hmoney-tit').text(data.title);
              $('#content').html(data.content);
            });
            data.forEach((item, index) => {
              let aHItem = '';
              item.articleList.forEach(dList => {
                aHItem += `<li class="help-article_item code_${dList.code}" data-code="${dList.code}">${dList.title}</li>`
              });
              html += `<li style="padding-left: 0px">
                        <p class="art-tit fy_hel">${item.name}</p>
                        <ul class="article-ul" style="text-align: center;">
                            ${aHItem}
                        </ul>
                   </li>`;
              if(index === len) {
                $('#help-left').append(html);
                setTimeout(() => {
                  $('#help-left li.help-article_item').removeClass('sel-li');
                  $($($(`#help-left li.code_${code}`)).addClass('sel-li'));
                }, 10);
              }
            });
        }, base.hideLoadingSpin);
    }
    
    function addListener() {
        $('.article-left').on('click', '.article-item', function(){
            let thisCode = $(this).attr('data-code');
            base.gohref(base.changeURLArg(location.href, "code", thisCode));
        });
  
      $('.article-left').on('click', 'li.help-article_item', function(e){
        e.stopPropagation();
        let thisCode = $(this).attr('data-code');
        let _this = this;
        if(thisCode) {
          GeneralCtr.getDetailHelp(thisCode).then(data => {
            $('.hmoney-tit').text(data.title);
            $('#content').html(data.content);
            $('li.help-article_item').removeClass('sel-li');
            $(_this).addClass('sel-li');
          });
        }
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