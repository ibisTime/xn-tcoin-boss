'use strict';

define('js/app/module/searchMap/index', ['js/lib/jquery', 'js/app/util/dialog'], function ($, dialog) {
    var tmpl = "<div class=\"show-search-map-wrap\" id=\"J_SearchMapWrapper\">\n\t<div class=\"show-one-point-map-title\">\n\t\t<div class=\"show-one-point-map-back\" id=\"search-map-back\"></div>\n\t\t<div class=\"show-one-point-map-title-name\"></div>\n\t</div>\n\t<nav class=\"search-map-search-wrap\">\n        <input id=\"J_SearchMapInput\" placeholder=\"输入地点\" class=\"search-map-search-input\" type=\"text\">\n        <a href=\"javascript:void(0)\" id=\"search-map-icon\" class=\"search-map-icon\">\n        \t<img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAADtklEQVRYR+2YTVoaQRCGv5pxILuQE0RPIGTYBzYKq+gJ1BPEnCB4AskJ1BNIVozZiHvmGXIC8QTRpbRM5enBwZ5mfhGfsIhL7K5+56ufrmrCmv/RmvNheUDvurLBYpt8v0pElfBDmTFmg8ZPn3ZuVvHxxQC964o1fTwgoAHCXhoAA/fEGDCoJ+q7F8vC5ga0hlcHIO4SMFerwKFj3+Cjp1p7UGBPsDQb0OtvWlO6JEK1qPGF9YzexCwfoda8z2srFXDD6zfIp8t41fhOug/gERsYhweSj00wGgDtEeG9DsKMkTB5H7X2fE8abCKghDN8ul44AHzDBjp53GW5/UMCOgB9VO3I+BRGeSuPkvGA0q0+eapyzHgA8bGw2+d53ROuK7l9Cfk9AhkoWW5mQcYCWkPHU2MugDONhqjtjIrChetnatKZpuQPYbeOC7lYN7QKuDRI3+BmWrhEFZR1zn+8jbgWfLSMW5NUsVxHlqqvSmEfiHqrmbQ+Ami5zjEBp/PN4BthtxvLujV236zYj9UMZ8OoJYVPBLA0dHogfAkNZ8m/LPiiEEiMxRdA77pS8h//vBzKdxO7vbksROo+r79Z8ulWcfNI1Fu1uD1zQL3uMZK/ahXQluuMCNgObU3sVmxFmf+oyz5l2p/Wd3urgImzoSdLUjjNAfVi+lbxl1S8/wMWDYW8HlNiMHoV8YoLtP4B1rB/TkQH80xOqIXJWcx8Iertw6LK5F1fch1ZZuZlLDOLpWFr6NyHFT5oiezWh7wHFlqn18GUGyv1JnkrN+vxx8A3Ybe6qYU6UHCxJRpP7NZWIXWyFmvqyeUTg7eSOuyF6l1y++NoB8wnE7vdyTo37/9LQ+dSnQg5I9YXAONa/VW5OqbVehAmV9Pmk9j7T+9qpDqvhbRc55QArXvO9k7CTBI0rgP1Mp9BoiuM8knWHBFxt4y5KZ3qg36Wa0MbyWPnbB4e6aOjLD9gdITJP1NHxyAZjAOAF+KXgd/CKDfyfGj64D4bARaUVPs4IjkbK10kuEIInkVie8lAOfNd4OrS9PGMgQoRDSb27klmmYnNxBlkR50j8mZsBJzxQMTdsCLocc7AubBbR7rt7KeP5x2zVwZ0CPS5KOBMNXTUkLDc/kC3FQeZGzCEsrxfVfi+vKMbehJprr6BfNkyuBcXq3HD/HMiRpQsDKirJ5VVfyOY93kHfL2jCe2o3fyrAYu6W18fD/lSH/85YNADaL2h2v6vBaCENIdXeyb5Vd/AQH0KWRvApFBZe8C/NZ/5OLIR2mYAAAAASUVORK5CYII=\">\n        </a>\n    </nav>\n\t<div class=\"search-map-cont\" id=\"J_SearchMapCont\"></div>\n\t<div class=\"show-search-special-button\">\n        <input type=\"button\" id=\"J_SearchMapBtn\" value=\"确定\">\n    </div>\n</div>";
    var defaultOpt = {
        title: "选择地点",
        lng: '120.21937542',
        lat: '30.25924446'
    };
    var css = "/*地图上显示定位css---start*/\n.show-search-map-wrap{\n    position: fixed;\n    top: 0;\n    left: 100%;\n    width: 100%;\n    height: 100%;\n    display: none;\n    z-index: 9999;\n    background: #f5f5f5;\n}\n.show-one-point-map-title{\n\theight: 40px;\n\tline-height: 40px;\n\tfont-size: 16px;\n\tcolor: #000;\n\tposition: relative;\n\tborder-bottom: 1px solid #ededed;\n\tbackground-color: #fff;\n}\n.show-one-point-map-title-name{\n\ttext-align: center;\n    color: #333;\n}\n.show-one-point-map-back{\n\twidth: 40px;\n\theight: 40px;\n\tbackground-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAhCAMAAADj/gtmAAAAXVBMVEUAAACPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4/ShKOpAAAAHnRSTlMA+/ICzBILBtT27OfYwrupnmhYSTsyJxm2sWBQQSxZCgntAAAAc0lEQVQoz4XSSQ6DMBBEUXAmJxAS5rnuf0zYFl8CL58suV1dyeF0eXGUTNFlzZT3Ju1HEXJ/mDThWpag79OkfotSuMyphpdJlWqE/FymXW4mpfS/kiQomuAWjC9yrrPp+UcmwbyYKrM/M+6R22Yn2Bz2awMrKgnwgdZu+wAAAABJRU5ErkJggg==);\n\tbackground-position: 10px center;\n\tbackground-repeat: no-repeat;\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\t-webkit-background-size: 12px 12px;\n\t        background-size: 12px;\n}\n.search-map-search-wrap{\n\theight: 44px;\n\tposition: relative;\n\tmargin: 10px;\n}\n.search-map-icon{\n    position: absolute;\n    right: 10px;\n    width: 22px;\n    top: 11px;\n}\n.search-map-search-input {\n    height: 44px;\n    padding-left: 20px;\n    padding-right: 44px;\n    width: 100%;\n    font-size: 15px;\n    -webkit-border-radius: 6px;\n            border-radius: 6px;\n}\n.search-map-cont{\n\tposition: absolute;\n\ttop: 104px;\n\tleft: 0;\n\twidth: 100%;\n\tbottom: 70px;\n}\n.show-search-special-button{\n\tpadding: 13px 10px 16px;\n\twidth: 100%;\n\tposition: absolute;\n\tbottom: 0;\n}\n.show-search-special-button input{\n    line-height: 40px;\n    width: 100%;\n    -webkit-border-radius: 3px;\n            border-radius: 3px;\n    color: #fff;\n    font-size: 14px;\n    background-color: #06cdb8;\n}\n.tangram-suggestion-main{\n\tz-index: 9999;\n}\n/*地图上显示定位css---end*/";
    var myValue, point, map, transit;

    init();

    function init() {
        $("head").append('<style>' + css + '</style>');
    }

    function addListener() {
        var wrap = $("#J_SearchMapWrapper");
        wrap.find(".show-one-point-map-title-name").html(defaultOpt.title);
        var that = this;
        $("#search-map-back").on("click", function () {
            that.hideMap();
        });
        wrap.find(".show-one-point-map-title").on("touchmove", function (e) {
            e.preventDefault();
        });
        $("#J_SearchMapBtn").on("click", function (e) {
            if (!point) {
                showMsg("未选择地点");
                return;
            }
            Map.hideMap(defaultOpt.success);
        });
        $("#search-map-icon").on("click", function (e) {
            var val = $("#J_SearchMapInput").val();
            if (!val || val.trim() == "") return;
            myValue = val;
            setPlace();
        });
    }

    function showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function () {
            d.close().remove();
        }, time || 1500);
    }

    function setPlace() {
        map.clearOverlays(); //清除地图上所有覆盖物
        function myFun() {
            var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
            point = pp;
            map.centerAndZoom(pp, 18);
            map.addOverlay(new BMap.Marker(pp)); //添加标注
        }
        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(myValue);
    }

    function setShowPlace() {
        $("#J_SearchMapInput").val(myValue);
        map.clearOverlays();
        map.centerAndZoom(point, 18);
        map.addOverlay(new BMap.Marker(point)); //添加标注
    }

    function searchComplete(results) {
        if (transit.getStatus() != BMAP_STATUS_SUCCESS) {
            if (defaultOpt.calcError) {
                defaultOpt.calcError(transit.getStatus());
            }
            return;
        }
        var plan = results.getPlan(0);
        defaultOpt.calcSuccess && defaultOpt.calcSuccess(plan);
    }
    var Map = {
        addMap: function addMap(option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if (!this.hasMap()) {
                var temp = $(tmpl);
                temp.find(".show-one-point-map-title-name").text(defaultOpt.title);
                $("body").append(tmpl);
                addListener.call(this);

                map = new BMap.Map("J_SearchMapCont");
                var po = new BMap.Point(defaultOpt.lng, defaultOpt.lat);
                map.centerAndZoom(po, 12);
                var marker = new BMap.Marker(po); // 创建标注
                map.addOverlay(marker); // 将标注添加到地图中
                //marker.disableDragging();           // 不可拖拽
                map.enableScrollWheelZoom(true);

                var ac = new BMap.Autocomplete({ //建立一个自动完成的对象
                    "input": "J_SearchMapInput",
                    "location": map
                });
                ac.addEventListener("onconfirm", function (e) {
                    //鼠标点击下拉列表后的事件
                    var _value = e.item.value;
                    myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                    setPlace();
                });
            }
            return this;
        },
        hasMap: function hasMap() {
            if (!$("#J_SearchMapWrapper").length) return false;
            return true;
        },
        showMap: function showMap(option) {
            if (this.hasMap()) {
                option = option || {};
                defaultOpt.success = option.success;
                if (option.text) {
                    point = new BMap.Point(option.point.lng, option.point.lat);
                    myValue = option.text;
                    setPlace();
                    $("#J_SearchMapInput").val(myValue);

                    //                  setShowPlace();
                }
                var mapCont = $("#J_SearchMapWrapper");
                mapCont.css("top", $(window).scrollTop() + "px");
                mapCont.show().animate({
                    left: 0
                }, 200);
            }
            return this;
        },
        hideMap: function hideMap(fnc) {
            if (this.hasMap()) {
                var mapCont = $("#J_SearchMapWrapper");
                // mapCont.fadeOut(100);
                mapCont.animate({
                    left: "100%"
                }, 200, function () {
                    mapCont.hide();
                    fnc && fnc(point, myValue);
                });
            }
            return this;
        },
        calculatePointDistance: function calculatePointDistance(point1, point2, mid, success, error) {
            //start,end,mid:array
            defaultOpt.calcError = error;
            defaultOpt.calcSuccess = success;
            var p1 = new BMap.Point(point1.lng, point1.lat);
            var p2 = new BMap.Point(point2.lng, point2.lat);
            var p3 = [];
            $.each(mid, function (i, m) {
                p3.push(new BMap.Point(m.lng, m.lat));
            });
            transit = new BMap.DrivingRoute(map, {
                onSearchComplete: searchComplete
            });
            transit.search(p1, p2, {
                waypoints: p3
            });
        }
    };
    return Map;
});