"use strict";

define('js/app/module/showImg/index', ['js/lib/jquery'], function ($) {
    var tmpl = "<div class=\"module-show-img-mask\">\n\t<img id=\"J_ShowImg_Cont\" class=\"module-center-img\" src=\u001furi0\u001f\"\"\u001f0uri\u001f/>\n</div>";
    var css = ".module-show-img-mask{\n\tposition: fixed;\n\ttop: 0;\n\tleft: 0;\n\twidth: 100%;\n\theight: 100%;\n\tbackground-color: rgb(0,0,0);\n\tz-index: 9999;\n\tdisplay: none;\n}\n.module-show-img-mask .module-center-img{\n\tmax-width: 100%;\n\tmax-height: 100%;\n\tposition: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n    -webkit-transform: translate(-50%, -50%);\n    -ms-transform: translate(-50%, -50%);\n    -moz-transform: translate(-50%, -50%);\n}";

    $("head").append('<style>' + css + '</style>');
    function _hasShowImg() {
        return !!$(".module-show-img-mask").length;
    }
    return {
        createImg: function createImg(pic) {
            pic = pic && pic.replace(/\?.*/gi, "") || "";
            pic += '?imageMogr2/auto-orient';
            if (_hasShowImg()) {
                $("#J_ShowImg_Cont").attr("src", pic);
            } else {
                var cont = $(tmpl);
                cont.find("#J_ShowImg_Cont").attr("src", pic);
                $("body").append(cont);
                var that = this;
                $(".module-show-img-mask").on("click", function () {
                    that.hideImg();
                });
            }
            return this;
        },
        showImg: function showImg(time) {
            if (_hasShowImg()) {
                $(".module-show-img-mask").fadeIn(time || 200);
            }
            return this;
        },
        hideImg: function hideImg(time) {
            if (_hasShowImg()) {
                $(".module-show-img-mask").fadeOut(time || 200);
            }
            return this;
        }
    };
});