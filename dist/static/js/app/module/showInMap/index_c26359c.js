"use strict";

define('js/app/module/showInMap/index', ['js/lib/jquery'], function ($) {
    var tmpl = "<div class=\"show-one-point-map\" id=\"J_OnePointMapWrapper\">\n\t<div class=\"show-one-point-map-title\">\n\t\t<div class=\"show-one-point-map-back\" id=\"show-one-point-map-back\"></div>\n\t\t<div class=\"show-one-point-map-title-name\"></div>\n\t</div>\n\t<div class=\"show-one-point-map-cont\" id=\"J_OnePointMapCont\"></div>\n</div>";
    var defaultOpt = {
        title: "地址",
        lng: '120.21937542',
        lat: '30.25924446'
    };
    var css = "/*地图上显示定位css---start*/\n.show-one-point-map{\n    position: fixed;\n    top: 0;\n    left: 100%;\n    width: 100%;\n    height: 100%;\n    display: none;\n    z-index: 9999;\n}\n.show-one-point-map-title{\n\theight: 40px;\n\tline-height: 40px;\n\tfont-size: 16px;\n\tcolor: #000;\n\tposition: relative;\n\tborder-bottom: 1px solid #ededed;\n\tbackground-color: #fff;\n}\n.show-one-point-map-title-name{\n\ttext-align: center;\n    color: #333;\n}\n.show-one-point-map-back{\n\twidth: 40px;\n\theight: 40px;\n\tbackground-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAhCAMAAADj/gtmAAAAXVBMVEUAAACPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4/ShKOpAAAAHnRSTlMA+/ICzBILBtT27OfYwrupnmhYSTsyJxm2sWBQQSxZCgntAAAAc0lEQVQoz4XSSQ6DMBBEUXAmJxAS5rnuf0zYFl8CL58suV1dyeF0eXGUTNFlzZT3Ju1HEXJ/mDThWpag79OkfotSuMyphpdJlWqE/FymXW4mpfS/kiQomuAWjC9yrrPp+UcmwbyYKrM/M+6R22Yn2Bz2awMrKgnwgdZu+wAAAABJRU5ErkJggg==);\n\tbackground-position: 10px center;\n\tbackground-repeat: no-repeat;\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\t-webkit-background-size: 12px 12px;\n\t        background-size: 12px;\n}\n.show-one-point-map-cont{\n\tposition: absolute;\n\ttop: 40px;\n\tleft: 0;\n\twidth: 100%;\n\tbottom: 0;\n}\n\n/*地图上显示定位css---end*/";
    var first = true,
        map;
    init();
    function init() {
        $("head").append('<style>' + css + '</style>');
    }

    return {
        addMap: function addMap(option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if (!this.hasMap()) {
                var temp = $(tmpl);
                temp.find(".show-one-point-map-title-name").text(defaultOpt.title);
                $("body").append(tmpl);
            }
            var wrap = $("#J_OnePointMapWrapper");
            wrap.find(".show-one-point-map-title-name").html(defaultOpt.title);
            var that = this;
            $("#show-one-point-map-back").off("click").on("click", function () {
                that.hideMap();
            });
            wrap.find(".show-one-point-map-title").off("touchmove").on("touchmove", function (e) {
                e.preventDefault();
            });
            return this;
        },
        hasMap: function hasMap() {
            var mapCont = $("#J_OnePointMapWrapper");
            if (!mapCont.length) return false;
            return true;
        },
        showMap: function showMap() {
            if (this.hasMap()) {
                var mapCont = $("#J_OnePointMapWrapper");
                // mapCont.fadeIn(100);
                //              mapCont.css("top", $(window).scrollTop()+"px");
                mapCont.show().animate({
                    left: 0
                }, 200);
                if (first) {
                    var map = new BMap.Map("J_OnePointMapCont");
                    var point = new BMap.Point(defaultOpt.lng, defaultOpt.lat);
                    map.centerAndZoom(point, 12);
                    var marker = new BMap.Marker(point); // 创建标注
                    map.addOverlay(marker); // 将标注添加到地图中
                    //marker.disableDragging();           // 不可拖拽
                    map.enableScrollWheelZoom(true);
                    first = false;
                }
            }
            return this;
        },
        showMapByName: function showMapByName(name) {
            if (this.hasMap()) {
                var myFun = function myFun() {
                    var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
                    var point = pp;
                    map.centerAndZoom(pp, 18);
                    map.addOverlay(new BMap.Marker(pp)); //添加标注
                };

                var mapCont = $("#J_OnePointMapWrapper");
                // mapCont.fadeIn(100);
                mapCont.css("top", $(window).scrollTop() + "px");
                mapCont.show().animate({
                    left: 0
                }, 200);
                if (first) {
                    map = new BMap.Map("J_OnePointMapCont");
                    // var point = new BMap.Point(defaultOpt.lng, defaultOpt.lat);
                    // map.centerAndZoom(point, 12);
                    // var marker = new BMap.Marker(point);// 创建标注
                    // map.addOverlay(marker);             // 将标注添加到地图中
                    //marker.disableDragging();           // 不可拖拽
                    map.enableScrollWheelZoom(true);
                    first = false;
                }
                map.clearOverlays();

                var local = new BMap.LocalSearch(map, { //智能搜索
                    onSearchComplete: myFun
                });
                local.search(name);
            }
            return this;
        },
        hideMap: function hideMap(option) {
            if (this.hasMap()) {
                var mapCont = $("#J_OnePointMapWrapper");
                // mapCont.fadeOut(100);
                mapCont.animate({
                    left: "100%"
                }, 200, function () {
                    mapCont.hide();
                });
            }
            return this;
        }
    };
});