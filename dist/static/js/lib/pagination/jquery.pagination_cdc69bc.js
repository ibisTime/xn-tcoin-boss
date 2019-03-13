/**
 * pagination分页插件
 * @version 1.5.0
 * @author mss
 * @url https://github.com/Maxiaoxiang
 *
 * @调用方法
 * $(selector).pagination(option, callback);
 * -此处callback是初始化调用，option里的callback才是点击页码后调用
 *
 * -- example --
 * $(selector).pagination({
 *     ...
 *     callback: function(api){
 *         console.log('点击页码调用该回调'); //把请求接口函数放在这儿，每次点击请求一次
 *     }
 * }, function(){
 *     console.log('初始化'); //插件初始化时调用该回调，比如请求第一次接口来初始化分页配置
 * });
 */
;
(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd)) {
        // AMD或CMD
        define('js/lib/pagination/jquery.pagination', ["js/lib/jquery"], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function (root, jQuery) {
            if (jQuery === undefined) {
                if (typeof window !== 'undefined') {
                    jQuery = require('js/lib/jquery');
                } else {
                    jQuery = require('js/lib/jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        //Browser globals
        factory(jQuery);
    }
}(function ($) {//skip
    let langType = localStorage.getItem('langType') || 'ZH';
    var css = "@charset \"UTF-8\";\n.demo-image{\n    width: 100%;\n}\n.M-box,.M-box1,.M-box2,.M-box3,.M-box4{\n\tposition: relative;\n    text-align: center;\n  \tzoom: 1;\n}\n.M-box:before,.M-box:after,.M-box1:before,.M-box1:after ,.M-box2:before,.M-box2:after ,.M-box3:before,.M-box3:after,.M-box4:before,.M-box4:after{\n    content:\"\";\n    display:table;\n}\n.M-box:after,.M-box1:after,.M-box2:after,.M-box3:after,.M-box4:after{\n\tclear:both;\n\toverflow:hidden;\n}\n.M-box span,.M-box1 span,.M-box2 span,.M-box3 span,.M-box4 span{\n\tfloat: left;\n\tmargin:0 5px;\n\twidth: 38px;\n    height: 38px;\n    line-height: 38px;\n    color: #bdbdbd;\n    font-size: 14px;\n}\n.M-box .active,.M-box1 .active,.M-box2 .active,.M-box3 .active,.M-box4 .active{\n\tfloat: left;\n\tmargin:0 5px;\n\twidth: 38px;\n    height: 38px;\n    line-height: 38px;\n    background: #e91e63;\n    color: #fff;\n    font-size: 14px;\n    border: 1px solid #e91e63;\n}\n.M-box a,.M-box1 a,.M-box2 a,.M-box3 a,.M-box4 a{\n\tfloat: left;\n\tmargin:0 5px;\n\twidth: 38px;\n    height: 38px;\n    line-height: 38px;\n    background: #fff;\n    border: 1px solid #ebebeb;\n    color: #bdbdbd;\n    font-size: 14px;\n}\n.M-box a:hover,.M-box1 a:hover,.M-box2 a:hover,.M-box3 a:hover,.M-box4 a:hover{\n\tcolor:#fff;\n    background: #e91e63;\n}\n.M-box .next,.M-box .prev,.M-box1 .next,.M-box1 .prev{\n\tfont-family: \"Simsun\";\n    font-size: 16px;\n    font-weight: bold;\n}\n.now,.count{\n\tpadding:0 5px;\n\tcolor:#f00;\n}\n.eg img{\n\tmax-width: 800px;\n\tmin-height: 500px;\n}\n.M-box input,.M-box1 input,.M-box2 input,.M-box3 input,.M-box4 input{\n    float: left;\n    margin:0 5px;\n    width: 38px;\n    height: 38px;\n    line-height: 38px;\n    text-align: center;\n    background: #fff;\n    border: 1px solid #ebebeb;\n    outline: none;\n    color: #bdbdbd;\n    font-size: 14px;\n}";
    $('<style>' + css + '</style>').appendTo('head');
    //配置参数
    var defaults = {
        totalData: 0, //数据总条数
        showData: 0, //每页显示的条数
        pageCount: 9, //总页数,默认为9
        current: 1, //当前第几页
        prevCls: 'prev', //上一页class
        nextCls: 'next', //下一页class
        prevContent: '<', //上一页内容
        nextContent: '>', //下一页内容
        activeCls: 'active', //当前页选中状态
        coping: false, //首页和尾页
        isHide: false, //当前页数为0页或者1页时不显示分页
        homePage: '', //首页节点内容
        endPage: '', //尾页节点内容
        keepShowPN: false, //是否一直显示上一页下一页
        count: 3, //当前页前后分页个数
        jump: false, //跳转到指定页数
        jumpIptCls: 'jump-ipt', //文本框内容
        jumpBtnCls: 'jump-btn', //跳转按钮
        jumpBtn: langType == 'ZH' ? '跳转' : 'skip', //跳转按钮文本
        callback: function () {
        } //回调
    };

    var Pagination = function (element, options) {
        //全局变量
        var opts = options, //配置
            current, //当前页
            $document = $(document),
            $obj = $(element); //容器

        /**
         * 设置总页数
         * @param {int} page 页码
         * @return opts.pageCount 总页数配置
         */
        this.setPageCount = function (page) {
            return opts.pageCount = page;
        };

        /**
         * 获取总页数
         * 如果配置了总条数和每页显示条数，将会自动计算总页数并略过总页数配置，反之
         * @return {int} 总页数
         */
        this.getPageCount = function () {
            return opts.totalData && opts.showData ? Math.ceil(parseInt(opts.totalData) / opts.showData) : opts.pageCount;
        };

        /**
         * 获取当前页
         * @return {int} 当前页码
         */
        this.getCurrent = function () {
            return current;
        };

        /**
         * 填充数据
         * @param {int} 页码
         */
        this.filling = function (index) {
            var html = '';
            current = parseInt(index) || parseInt(opts.current); //当前页码
            var pageCount = this.getPageCount(); //获取的总页数
            if (opts.keepShowPN || current > 1) { //上一页
                html += '<a href="javascript:;" class="' + opts.prevCls + '">' + opts.prevContent + '</a>';
            } else {
                if (opts.keepShowPN == false) {
                    $obj.find('.' + opts.prevCls) && $obj.find('.' + opts.prevCls).remove();
                }
            }
            if (current >= opts.count + 2 && current != 1 && pageCount != opts.count) {
                var home = opts.coping && opts.homePage ? opts.homePage : '1';
                html += opts.coping ? '<a href="javascript:;" data-page="1">' + home + '</a><span>...</span>' : '';
            }
            var start = (current - opts.count) <= 1 ? 1 : (current - opts.count);
            var end = (current + opts.count) >= pageCount ? pageCount : (current + opts.count);
            for (; start <= end; start++) {
                if (start <= pageCount && start >= 1) {
                    if (start != current) {
                        html += '<a href="javascript:;" data-page="' + start + '">' + start + '</a>';
                    } else {
                        html += '<span class="' + opts.activeCls + '">' + start + '</span>';
                    }
                }
            }
            if (current + opts.count < pageCount && current >= 1 && pageCount > opts.count) {
                var end = opts.coping && opts.endPage ? opts.endPage : pageCount;
                html += opts.coping ? '<span>...</span><a href="javascript:;" data-page="' + pageCount + '">' + end + '</a>' : '';
            }
            if (opts.keepShowPN || current < pageCount) { //下一页
                html += '<a href="javascript:;" class="' + opts.nextCls + '">' + opts.nextContent + '</a>'
            } else {
                if (opts.keepShowPN == false) {
                    $obj.find('.' + opts.nextCls) && $obj.find('.' + opts.nextCls).remove();
                }
            }
            let all = langType == 'ZH' ? '共' : 'total ';
            let page = langType == 'ZH' ? '页' : ' pages';
            let topage = langType == 'EN' ? '</samp><samp>to page</samp><input type="text" class="' + opts.jumpIptCls + '"><a href="javascript:;" class="ml15 ' + opts.jumpBtnCls + '">' : '</samp><samp>到第</samp><input type="text" class="' + opts.jumpIptCls + '"><samp>页</samp><a href="javascript:;" class="' + opts.jumpBtnCls + '">';
            let allpage = '<samp>' + all + opts.pageCount + page + topage + opts.jumpBtn + '</a>';
            html += opts.jump ? allpage : '';
            $obj.empty().html(html);
        };

        //绑定事件
        this.eventBind = function () {
            var that = this;
            var pageCount = that.getPageCount(); //总页数
            var index = 1;
            $obj.off().on('click', 'a', function () {
                if ($(this).hasClass(opts.nextCls)) {
                    if ($obj.find('.' + opts.activeCls).text() >= pageCount) {
                        $(this).addClass('disabled');
                        return false;
                    } else {
                        index = parseInt($obj.find('.' + opts.activeCls).text()) + 1;
                    }
                } else if ($(this).hasClass(opts.prevCls)) {
                    if ($obj.find('.' + opts.activeCls).text() <= 1) {
                        $(this).addClass('disabled');
                        return false;
                    } else {
                        index = parseInt($obj.find('.' + opts.activeCls).text()) - 1;
                    }
                } else if ($(this).hasClass(opts.jumpBtnCls)) {
                    if ($obj.find('.' + opts.jumpIptCls).val() !== '') {
                        index = parseInt($obj.find('.' + opts.jumpIptCls).val());
                    } else {
                        return;
                    }
                } else {
                    index = parseInt($(this).data('page'));
                }
                that.filling(index);
                typeof opts.callback === 'function' && opts.callback(that);
            });
            //输入跳转的页码
            $obj.on('input propertychange', '.' + opts.jumpIptCls, function () {
                var $this = $(this);
                var val = $this.val();
                var reg = /[^\d]/g;
                if (reg.test(val)) $this.val(val.replace(reg, ''));
                (parseInt(val) > pageCount) && $this.val(pageCount);
                if (parseInt(val) === 0) $this.val(1); //最小值为1
            });
            //回车跳转指定页码
            $document.keydown(function (e) {
                if (e.keyCode == 13 && $obj.find('.' + opts.jumpIptCls).val()) {
                    var index = parseInt($obj.find('.' + opts.jumpIptCls).val());
                    that.filling(index);
                    typeof opts.callback === 'function' && opts.callback(that);
                }
            });
        };

        //初始化
        this.init = function () {
            this.filling(opts.current);
            this.eventBind();
            if (opts.isHide && this.getPageCount() == '1' || this.getPageCount() == '0') $obj.hide();
            else $obj.show();
        };
        this.init();
    };

    $.fn.pagination = function (parameter, callback) {
        if (typeof parameter == 'function') { //重载
            callback = parameter;
            parameter = {};
        } else {
            parameter = parameter || {};
            callback = callback || function () {
            };
        }
        var options = $.extend({}, defaults, parameter);
        return this.each(function () {
            var pagination = new Pagination(this, options);
            callback(pagination);
        });
    };

}));