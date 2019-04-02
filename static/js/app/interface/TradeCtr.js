define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询广告
         * @param config: {start, limit, maxPrice, minPrice, payType, tradeType(0买、1卖),coin}
         */
        getPageAdvertise(config, refresh) {
            return Ajax.get("625227", config, refresh); // new 625227 old 625228
        },
        /**
         * 分页查询广告 带userId,status
         * @param config: {start, limit, maxPrice, minPrice,payType,tradeType(0买、1卖),userId,status,coin}
         */
        getPageAdvertiseUser(config, refresh) {
            config.coin = '';
            return Ajax.post("625225", config, refresh);
        },
        getUserPageAdvertiseUser(config, refresh) {
            return Ajax.get("625228", config, refresh);
        },
        //用户昵称查询广告
        getListAdvertiseNickname(nickName, refresh) {
            return Ajax.get("625228", { nickName }, refresh);
        },
        //下架广告
        downAdvertise(adsCode) {
            return Ajax.get("625222", {
                userId: base.getUserId(),
                adsCode
            }, true);
        },
        // 获取广告详情
        getAdvertiseDetail(adsCode) {
            return Ajax.get("625226", {
                adsCode,
                userId:base.getUserId()
            });
        },
      //下架广告
      upAdvertise(adsCode) {
        return Ajax.get("625223", {
          userId: base.getUserId(),
          adsCode: adsCode
        }, true);
      },
        // 获取广告价格
        getAdvertisePrice(coin, ctype) {
            let referCurrency = ctype || 'CNY';
            return Ajax.get("650102", {
                symbol: coin,
                referCurrency: referCurrency
            });
        },
        // 数字货币折合
        getNumberMoney(symbol, referCurrency){
            return Ajax.get('650102', {
                symbol,
                referCurrency
            })
        },
        /**
         * 购买ETH
         * @param config{adsCode,count,tradeAmount,tradePrice}
         */
        buyETH(config) {
            return Ajax.get("625240", {
                buyUser: base.getUserId(),
                ...config
            });
        },
        /**
         * 出售ETH
         * @param config{adsCode,count,tradeAmount,tradePrice}
         */
        sellETH(config) {
            return Ajax.get("625241", {
              userId: base.getUserId(),
                ...config
            });
        },
        // 购买开始聊天，提交交易订单
        chatOrderBuy(adsCode) {
            return Ajax.get("625247", {
                buyUser: base.getUserId(),
                adsCode
            });
        },
        //出售开始聊天，提交交易订单
        chatOrderSell(adsCode) {
            return Ajax.get("625248", {
                sellUser: base.getUserId(),
                adsCode
            });
        },
        /**
         * 分页查询我的订单
         * @param config: {start, limit, statusList,tradeCoin}
         */
        getPageOrder(config, refresh) {
            return Ajax.get("625250", {
                belongUser: base.getUserId(),
                ...config
            }, refresh);
        },
        //获取订单详情
        getOrderDetail(code) {
            return Ajax.get("625251", {
                code
            }, true);
        },
        //获取未读消息
        getUnreadDetail(userId,status) {
            return Ajax.get("805316", {
                userId,
                status
            }, true);
        },
        //訂單-取消交易
        cancelOrder(code) {
            return Ajax.get("625242", {
                updater: base.getUserId(),
                code
            });
        },
        //訂單-標記打款
        payOrder(code) {
            return Ajax.get("625243", {
                updater: base.getUserId(),
                code
            });
        },
        //訂單-解冻以太币
        releaseOrder(code) {
            return Ajax.get("625244", {
                updater: base.getUserId(),
                code
            });
        },
        //訂單-评价
        commentOrder(config) {
            return Ajax.get("625245", config);
        },
        //个人-评价
        userEvaluate(config) {
            return Ajax.get("628279", config);
        },
        /**
         * 申請仲裁
         * @param config{code,reason}
         */
        arbitrationlOrder(config) {
            return Ajax.get("625246", {
                applyUser: base.getUserId(),
                ...config
            });
        },
        //取消仲裁
        arbitrationlCancel(code) {
            return Ajax.get("625253", {
                userId: base.getUserId(),
                code
        });
    },
        // 标记付款
        bjPlayfo(config) {
            return Ajax.get('625273', config);
        },
        // 取消订单
        qxOrder(config) {
            return Ajax.get('625272', config);
        },
        // 获取交易对
        getTradePair() {
            return Ajax.post("650100", {
                start: '1',
                limit: '10'
            }, true);
        },
        //阅读消息
        readNews(config) {
            return Ajax.post("805310",config);
        },
      // 列表查付款方式
      getPayTypeList(data) {
        return Ajax.post("625350", data, true);
      },
      // 列表查交易货币
      getPayCoinList(name) {
        return Ajax.post("625370", name, true);
      },
      // 获取币种行情
      getMarket(ex_type) {
        return Ajax.post('650101', {
          referCurrency: ex_type,
          symbol: 'BTC'
        },true);
      },
      // 列表查标签
      getTagsList(config) {
        return Ajax.post('625330', config, true);
      },
      // 列表查国家
      getCountryList(config) {
        return Ajax.post('625310', config, true);
      },
      /**
       * 发布广告
       * @param adsCode
       */
      submitAdvertise(config) {
        return Ajax.get("625220", {
          userId: base.getUserId(),
          tradeCoin: 'BTC',
          ...config
        }, true);
      },
        /**
         * 编辑广告
         */
        editAdvertise(config) {
            return Ajax.post("625221", {
                ...config
            }, true);
        },
        getBtc(config){
            return Ajax.post("650102", {
                ...config
            }, true);
        }
    };
})