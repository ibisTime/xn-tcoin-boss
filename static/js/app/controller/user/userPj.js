define([
    'app/controller/base',
    'app/interface/TradeCtr',
    'app/interface/GeneralCtr',
    'app/controller/Top',
    'app/controller/foo'
], function(base, TradeCtr, GeneralCtr, Top, Foo) {
    let langType = localStorage.getItem('langType') || 'ZH';
    let userId = base.getUserId();
    let smsType = {};
    let docIndex = 1;
    init();
    function init() {
        $('.pj-en_pr').text(base.getText('类型', langType));
        $('.pj-en_sfhp').text(base.getText('消息', langType));
        $('.pj-en_sj').text(base.getText('时间', langType));
        
        $('title').text(base.getText('全部消息'));
        $.when(
          TradeCtr.getUnreadDetail(userId, docIndex, 20),
          GeneralCtr.getDictList({parentKey: 'sms_type'})
        ).then((data1, data2) => {
            let m_html = '';
            data2.forEach(item => {
              smsType[item.dkey] = [item.dvalue];
            });
          data1.list.forEach(item => {
              m_html += buildHtml(item);
          });
          $('#content').html(m_html);
          base.hideLoadingSpin();
        }, base.hideLoadingSpin);
        $(document).scroll(function() {
            if(Math.floor($(this).scrollTop() / 500) === (docIndex + 1)) {
              docIndex ++;
              TradeCtr.getUnreadDetail(userId, docIndex, 20).then(data => {
                let m_html = '';
                data.list.forEach(item => {
                  m_html += buildHtml(item);
                });
                $('#content').append(m_html);
              });
            }
        });
      addEventer();
    }
    
    function buildHtml(item) {
        let trHtml = '';
        let titGary = item.status === '1' ? 'tit-gary' : '';
        if(+item.smsInfo.type !== 4) {
            trHtml = `<tr class="${titGary}">
					<td class="currency">${smsType[item.smsInfo.type]}</td>
                    <td class="sms-info" data-href="../order/order-detail.html?code=${item.smsInfo.refNo}&coin=${item.smsInfo.symbol}" data-readId="${item.id}">${item.smsInfo.content}</td>
                    <td class="payType">${base.formateDatetime(item.createDatetime)}</td>
				</tr>`;
        }else {
          trHtml = `<tr class="${titGary}">
					<td class="currency">${smsType[item.smsInfo.type]}</td>
                    <td class="sms-info" data-href="../wallet/wallet.html?coin=BTC" data-readId="${item.id}">${item.smsInfo.content}</td>
                    <td class="payType">${base.formateDatetime(item.createDatetime)}</td>
				</tr>`;
        }
        return trHtml;

    }
    
    function addEventer() {
      $('#content').on('click', '.sms-info', function() {
        var readId = $(this).attr('data-readid');
        var params ={"id": readId};
        TradeCtr.readNews(params).then(() => {
          if (!base.isLogin()) {
            base.goLogin();
            return false;
          } else {
            var thishref = $(this).attr("data-href");
            base.gohref(thishref, '_blank')
          }
        });
      });
    }

});