/**

 @Name : layDate v1.1 日期控件
 @Author: 贤心
 @Date: 2014-06-25
 @QQ群：176047195
 @Site：http://sentsin.com/layui/laydate

 */;
!function(a) {
var css = "/** \n \n @Name： laydate 核心样式\n @Author：贤心\n @Site：http://sentsin.com/layui/laydate\n \n**/\n\nhtml{_background-image:url(about:blank); _background-attachment:fixed;}\n.laydate_body .laydate_box, .laydate_body .laydate_box *{margin:0; padding:0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box;}\n.laydate-icon,\n.laydate-icon-default,\n.laydate-icon-danlan,\n.laydate-icon-dahong,\n.laydate-icon-molv{height:22px; line-height:22px; padding-right:20px; border:1px solid #C6C6C6; background-repeat:no-repeat; background-position:right center;  background-color:#fff; outline:0;}\n.laydate-icon-default{ background-image:url(../skins/default/icon.png)}\n.laydate-icon-danlan{border:1px solid #B1D2EC; background-image:url(../skins/danlan/icon.png)}\n.laydate-icon-dahong{background-image:url(../skins/dahong/icon.png)}\n.laydate-icon-molv{background-image:url(../skins/molv/icon.png)}\n.laydate_body .laydate_box{width:240px; font:12px '\\5B8B\\4F53'; z-index:99999999; *margin:-2px 0 0 -2px; *overflow:hidden; _margin:0; _position:absolute!important; background-color:#fff;}\n.laydate_body .laydate_box li{list-style:none;}\n.laydate_body .laydate_box .laydate_void{cursor:text!important;}\n.laydate_body .laydate_box a, .laydate_body .laydate_box a:hover{text-decoration:none; blr:expression(this.onFocus=this.blur()); cursor:pointer;}\n.laydate_body .laydate_box a:hover{text-decoration:none;}\n.laydate_body .laydate_box cite, .laydate_body .laydate_box label{position:absolute; width:0; height:0; border-width:5px; border-style:dashed; border-color:transparent; overflow:hidden; cursor:pointer;}\n.laydate_body .laydate_box .laydate_yms, .laydate_body .laydate_box .laydate_time{display:none;}\n.laydate_body .laydate_box .laydate_show{display:block;}\n.laydate_body .laydate_box input{outline:0; font-size:14px; background-color:#fff;}\n.laydate_body .laydate_top{position:relative; height:26px; padding:5px; *width:100%; z-index:99;}\n.laydate_body .laydate_ym{position:relative; float:left; height:24px; cursor:pointer;}\n.laydate_body .laydate_ym input{float:left; height:24px; line-height:24px; text-align:center; border:none; cursor:pointer;}\n.laydate_body .laydate_ym .laydate_yms{position:absolute; left: -1px; top: 24px; height:181px;}\n.laydate_body .laydate_y{width:121px; margin-right:6px;}\n.laydate_body .laydate_y input{width:64px; margin-right:15px;}\n.laydate_body .laydate_y .laydate_yms{width:121px; text-align:center;}\n.laydate_body .laydate_y .laydate_yms a{position:relative; display:block; height:20px;}\n.laydate_body .laydate_y .laydate_yms ul{height:139px; padding:0; *overflow:hidden;}\n.laydate_body .laydate_y .laydate_yms ul li{float:left; width:60px; height:20px; line-height: 20px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;}\n.laydate_body .laydate_m{width:99px;}\n.laydate_body .laydate_m .laydate_yms{width:99px; padding:0;}\n.laydate_body .laydate_m input{width:42px; margin-right:15px;}\n.laydate_body .laydate_m .laydate_yms span{display:block; float:left; width:42px; margin: 5px 0 0 5px; line-height:24px; text-align:center; _display:inline;}\n.laydate_body .laydate_choose{display:block; float:left; position:relative; width:20px; height:24px;}\n.laydate_body .laydate_choose cite, .laydate_body .laydate_tab cite{left:50%; top:50%;}\n.laydate_body .laydate_chtop cite{margin:-7px 0 0 -5px; border-bottom-style:solid;}\n.laydate_body .laydate_chdown cite, .laydate_body .laydate_ym label{top:50%; margin:-2px 0 0 -5px; border-top-style:solid;}\n.laydate_body .laydate_chprev cite{margin:-5px 0 0 -7px;}\n.laydate_body .laydate_chnext cite{margin:-5px 0 0 -2px;}\n.laydate_body .laydate_ym label{right:28px;}\n.laydate_body .laydate_table{ width:230px; margin:0 5px; border-collapse:collapse; border-spacing:0px; }\n.laydate_body .laydate_table td{width:31px; height:19px; line-height:19px; text-align: center; cursor:pointer; font-size: 12px;}\n.laydate_body .laydate_table thead{height:22px; line-height:22px;}\n.laydate_body .laydate_table thead th{font-weight:400; font-size:12px; text-align:center;}\n.laydate_body .laydate_bottom{position:relative; height:22px; line-height:20px; padding:5px; font-size:12px;}\n.laydate_body .laydate_bottom #laydate_hms{position: relative; z-index: 1; float:left; }\n.laydate_body .laydate_time{ position:absolute; left:5px; bottom: 26px; width:129px; height:125px; *overflow:hidden;}\n.laydate_body .laydate_time .laydate_hmsno{ padding:5px 0 0 5px;}\n.laydate_body .laydate_time .laydate_hmsno span{display:block; float:left; width:24px; height:19px; line-height:19px; text-align:center; cursor:pointer; *margin-bottom:-5px;}\n.laydate_body .laydate_time1{width:228px; height:154px;}\n.laydate_body .laydate_time1 .laydate_hmsno{padding: 6px 0 0 8px;}\n.laydate_body .laydate_time1 .laydate_hmsno span{width:21px; height:20px; line-height:20px;}\n.laydate_body .laydate_msg{left:49px; bottom:67px; width:141px; height:auto; overflow: hidden;}\n.laydate_body .laydate_msg p{padding:5px 10px;}\n.laydate_body .laydate_bottom li{float:left; height:20px; line-height:20px; border-right:none; font-weight:900;}\n.laydate_body .laydate_bottom .laydate_sj{width:33px; text-align:center; font-weight:400;}\n.laydate_body .laydate_bottom input{float:left; width:21px; height:20px; line-height:20px; border:none; text-align:center; cursor:pointer; font-size:12px;  font-weight:400;}\n.laydate_body .laydate_bottom .laydte_hsmtex{height:20px; line-height:20px; text-align:center;}\n.laydate_body .laydate_bottom .laydte_hsmtex span{position:absolute; width:20px; top:0; right:0px; cursor:pointer;}\n.laydate_body .laydate_bottom .laydte_hsmtex span:hover{font-size:14px;}\n.laydate_body .laydate_bottom .laydate_btn{position:absolute; right:5px; top:5px;}\n.laydate_body .laydate_bottom .laydate_btn a{float:left; height:20px; padding:0 6px; _padding:0 5px;}\n.laydate_body .laydate_bottom .laydate_v{position:absolute; left:10px; top:6px; font-family:Courier; z-index:0;}\n\n";
var css1 = "/** \n \n @Name： laydate皮肤：默认\n @Author：贤心\n @Site：http://sentsin.com/layui/laydate\n \n**/\n\n.laydate-icon{border:1px solid #C6C6C6; background-image:url(icon.png)}\n\n.laydate_body .laydate_box,\n.laydate_body .laydate_ym,\n.laydate_body .laydate_ym .laydate_yms,\n.laydate_body .laydate_table,\n.laydate_body .laydate_table td,\n.laydate_body .laydate_bottom #laydate_hms,\n.laydate_body .laydate_time,\n.laydate_body .laydate_bottom .laydate_btn a{border:1px solid #ccc;}\n\n.laydate_body .laydate_y .laydate_yms a,\n.laydate_body .laydate_choose,\n.laydate_body .laydate_table thead,\n.laydate_body .laydate_bottom .laydte_hsmtex{background-color:#F6F6F6;}\n\n.laydate_body .laydate_box, \n.laydate_body .laydate_ym .laydate_yms,\n.laydate_body .laydate_time{-webkit-box-shadow: 2px 2px 5px rgba(0,0,0,.1);box-shadow: 2px 2px 5px rgba(0,0,0,.1);}\n\n.laydate_body .laydate_box{border-top:none; border-bottom:none; background-color:#fff; color:#333;}\n.laydate_body .laydate_box input{color:#333;}\n.laydate_body .laydate_box .laydate_void{color:#ccc!important; /*text-decoration:line-through;*/}\n.laydate_body .laydate_box .laydate_void:hover{background-color:#fff!important}\n.laydate_body .laydate_box a, .laydate_body .laydate_box a:hover{color:#333;}\n.laydate_body .laydate_box a:hover{color:#666;}\n.laydate_body .laydate_click{background-color:#eee!important;}\n.laydate_body .laydate_top{border-top:1px solid #C6C6C6;}\n.laydate_body .laydate_ym .laydate_yms{border:1px solid #C6C6C6; background-color:#fff;}\n.laydate_body .laydate_y .laydate_yms a{border-bottom:1px solid #C6C6C6;}\n.laydate_body .laydate_y .laydate_yms .laydate_chdown{border-top:1px solid #C6C6C6; border-bottom:none;}\n.laydate_body .laydate_choose{border-left:1px solid #C6C6C6;}\n.laydate_body .laydate_chprev{border-left:none; border-right:1px solid #C6C6C6;}\n.laydate_body .laydate_choose:hover, \n.laydate_body .laydate_y .laydate_yms a:hover{background-color:#fff;}\n.laydate_body .laydate_chtop cite{border-bottom-color:#666;}\n.laydate_body .laydate_chdown cite, .laydate_body .laydate_ym label{border-top-color:#666;}\n.laydate_body .laydate_chprev cite{border-right-style:solid; border-right-color:#666;}\n.laydate_body .laydate_chnext cite{border-left-style:solid; border-left-color:#666;}\n.laydate_body .laydate_table td{border:none;  height:21px!important; line-height:21px!important; background-color:#fff;}\n.laydate_body .laydate_table .laydate_nothis{color:#999;}\n.laydate_body .laydate_table thead{height:21px!important; line-height:21px!important;}\n.laydate_body .laydate_table thead th{border-bottom:1px solid #ccc;}\n.laydate_body .laydate_bottom{border-bottom:1px solid #C6C6C6;}\n.laydate_body .laydate_bottom #laydate_hms{background-color:#fff;}\n.laydate_body .laydate_time{background-color:#fff;}\n.laydate_body .laydate_bottom .laydate_sj{border-right:1px solid #C6C6C6; background-color:#F6F6F6;}\n.laydate_body .laydate_bottom input{background-color:#fff;}\n.laydate_body .laydate_bottom .laydte_hsmtex{border-bottom:1px solid #C6C6C6;}\n.laydate_body .laydate_bottom .laydate_btn{border-right:1px solid #C6C6C6;}\n.laydate_body .laydate_bottom .laydate_v{color:#999}\n.laydate_body .laydate_bottom .laydate_btn a{border-right:none; background-color:#F6F6F6;}\n.laydate_body .laydate_bottom .laydate_btn a:hover{color:#000; background-color:#fff;}\n\n.laydate_body .laydate_m .laydate_yms span:hover,\n.laydate_body .laydate_y .laydate_yms ul li:hover,\n.laydate_body .laydate_table td:hover,\n.laydate_body .laydate_time .laydate_hmsno span:hover{background-color:#F3F3F3}\n\n\n";
$('<style>' + css + css1 + '</style>').appendTo('head');
  var b = {
      path: "",
      defSkin: "default",
      format: "YYYY-MM-DD",
      min: "1900-01-01 00:00:00",
      max: "2099-12-31 23:59:59",
      isv: !1
    },
    c = {},
    d = document,
    e = "createElement",
    f = "getElementById",
    g = "getElementsByTagName",
    h = [
      'laydate_box',
      'laydate_void',
      'laydate_click',
      'LayDateSkin',
      'skins/',
      '/laydate.css'
    ];
  a.laydate = function(b) {
    b = b || {};
    try {
      h.event = a.event
        ? a.event
        : laydate.caller.arguments[0]
    } catch (d) {}
    return c.run(b),
    laydate
  },
  laydate.v = "1.1",
  c.getPath = function() {
    var a = document.scripts,
      c = a[a.length - 1].src;
    return b.path
      ? b.path
      : c.substring(0, c.lastIndexOf("/") + 1)
  }(),
  c.use = function(a, b) {
       var f=d[e]("link");f.type="text/css",f.rel="stylesheet",f.href=c.getPath+a+h[5],b&&(f.id=b),d[g]("head")[0].appendChild(f),f=null
  },
  c.trim = function(a) {
    return a = a || "",
    a.replace(/^\s|\s$/g, "").replace(/\s+/g, " ")
  },
  c.digit = function(a) {
    return 10 > a
      ? "0" + (0 | a)
      : a
  },
  c.stopmp = function(b) {
    return b = b || a.event,
    b.stopPropagation
      ? b.stopPropagation()
      : b.cancelBubble = !0,
    this
  },
  c.each = function(a, b) {
    for (var c = 0, d = a.length; d > c && b(c, a[c]) !== !1; c++) ;
    }
  ,
  c.hasClass = function(a, b) {
    return a = a || {},
    new RegExp("\\b" + b + "\\b").test(a.className)
  },
  c.addClass = function(a, b) {
    return a = a || {},
    c.hasClass(a, b) || (a.className += " " + b),
    a.className = c.trim(a.className),
    this
  },
  c.removeClass = function(a, b) {
    if (a = a || {}, c.hasClass(a, b)) {
      var d = new RegExp("\\b" + b + "\\b");
      a.className = a.className.replace(d, "")
    }
    return this
  },
  c.removeCssAttr = function(a, b) {
    var c = a.style;
    c.removeProperty
      ? c.removeProperty(b)
      : c.removeAttribute(b)
  },
  c.shde = function(a, b) {
    a.style.display = b
      ? "none"
      : "block"
  },
  c.query = function(a) {
    var e,
      b,
      h,
      i,
      j;
    return a = c.trim(a).split(" "),
    b = d[f](a[0].substr(1)),
    b
      ? a[1]
        ? /^\./.test(a[1])
          ? (i = a[1].substr(1), j = new RegExp("\\b" + i + "\\b"), e = [], h = d.getElementsByClassName
            ? b.getElementsByClassName(i)
            : b[g]("*"), c.each(h, function(a, b) {
            j.test(b.className) && e.push(b)
          }), e[0]
            ? e
            : "")
          : (e = b[g](a[1]), e[0]
            ? b[g](a[1])
            : "")
        : b
      : void 0
  },
  c.on = function(b, d, e) {
    return b.attachEvent
      ? b.attachEvent("on" + d, function() {
        e.call(b, a.even)
      })
      : b.addEventListener(d, e, !1),
    c
  },
  c.stopMosup = function(a, b) {
    "mouseup" !== a && c.on(b, "mouseup", function(a) {
      c.stopmp(a)
    })
  },
  c.run = function(a) {
    var d,
      e,
      g,
      b = c.query,
      f = h.event;
    try {
      g = f.target || f.srcElement || {}
    } catch (i) {
      g = {}
    }
    if (d = a.elem
      ? b(a.elem)
      : g, f && g.tagName) {
      if (!d || d === c.elem)
        return;
      c.stopMosup(f.type, d),
      c.stopmp(f),
      c.view(d, a),
      c.reshow()
    } else
      e = a.event || "click",
      c.each((0 | d.length) > 0
        ? d
        : [d], function(b, d) {
        c.stopMosup(e, d),
        c.on(d, e, function(b) {
          c.stopmp(b),
          d !== c.elem && (c.view(d, a), c.reshow())
        })
      })
  },
  c.scroll = function(a) {
    return a = a
      ? "scrollLeft"
      : "scrollTop",
    d.body[a] | d.documentElement[a]
  },
  c.winarea = function(a) {
    return document.documentElement[a
        ? "clientWidth"
        : "clientHeight"]
  },
  c.isleap = function(a) {
    return 0 === a % 4 && 0 !== a % 100 || 0 === a % 400
  },
  c.checkVoid = function(a, b, d) {
    var e = [];
    return a = 0 | a,
    b = 0 | b,
    d = 0 | d,
    a < c.mins[0]
      ? e = ["y"]
      : a > c.maxs[0]
        ? e = ["y", 1]
        : a >= c.mins[0] && a <= c.maxs[0] && (a == c.mins[0] && (b < c.mins[1]
          ? e = ["m"]
          : b == c.mins[1] && d < c.mins[2] && (e = ["d"])), a == c.maxs[0] && (b > c.maxs[1]
          ? e = ["m", 1]
          : b == c.maxs[1] && d > c.maxs[2] && (e = ["d", 1]))),
    e
  },
  c.timeVoid = function(a, b) {
    if (c.ymd[1] + 1 == c.mins[1] && c.ymd[2] == c.mins[2]) {
      if (0 === b && a < c.mins[3])
        return 1;
      if (1 === b && a < c.mins[4])
        return 1;
      if (2 === b && a < c.mins[5])
        return 1
    } else if (c.ymd[1] + 1 == c.maxs[1] && c.ymd[2] == c.maxs[2]) {
      if (0 === b && a > c.maxs[3])
        return 1;
      if (1 === b && a > c.maxs[4])
        return 1;
      if (2 === b && a > c.maxs[5])
        return 1
    }
    return a > (b
      ? 59
      : 23)
      ? 1
      : void 0
  },
  c.check = function() {
    var a = c.options.format.replace(/YYYY|MM|DD|hh|mm|ss/g, "\\d+\\").replace(/\\$/g, ""),
      b = new RegExp(a),
      d = c.elem[h.elemv],
      e = d.match(/\d+/g) || [],
      f = c.checkVoid(e[0], e[1], e[2]);
    if ("" !== d.replace(/\s/g, "")) {
      if (!b.test(d))
        return c.elem[h.elemv] = "",
        c.msg("日期不符合格式，请重新选择。"),
        1;
      if (f[0])
        return c.elem[h.elemv] = "",
        c.msg("日期不在有效期内，请重新选择。"),
        1;
      f.value = c.elem[h.elemv].match(b).join(),
      e = f.value.match(/\d+/g),
      e[1] < 1
        ? (e[1] = 1, f.auto = 1)
        : e[1] > 12
          ? (e[1] = 12, f.auto = 1)
          : e[1].length < 2 && (f.auto = 1),
      e[2] < 1
        ? (e[2] = 1, f.auto = 1)
        : e[2] > c.months[(0 | e[1]) - 1]
          ? (e[2] = 31, f.auto = 1)
          : e[2].length < 2 && (f.auto = 1),
      e.length > 3 && (c.timeVoid(e[3], 0) && (f.auto = 1), c.timeVoid(e[4], 1) && (f.auto = 1), c.timeVoid(e[5], 2) && (f.auto = 1)),
      f.auto
        ? c.creation([
          e[0], 0 | e[1],
          0 | e[2]
        ], 1)
        : f.value !== c.elem[h.elemv] && (c.elem[h.elemv] = f.value)
    }
  },
  c.months = [
    31,
    null,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ],
  c.viewDate = function(a, b, d) {
    var f = (c.query, {}),
      g = new Date;
    a < (0 | c.mins[0]) && (a = 0 | c.mins[0]),
    a > (0 | c.maxs[0]) && (a = 0 | c.maxs[0]),
    g.setFullYear(a, b, d),
    f.ymd = [
      g.getFullYear(), g.getMonth(), g.getDate()
    ],
    c.months[1] = c.isleap(f.ymd[0])
      ? 29
      : 28,
    g.setFullYear(f.ymd[0], f.ymd[1], 1),
    f.FDay = g.getDay(),
    f.PDay = c.months[0 === b
        ? 11
        : b - 1] - f.FDay + 1,
    f.NDay = 1,
    c.each(h.tds, function(a, b) {
      var g,
        d = f.ymd[0],
        e = f.ymd[1] + 1;
      b.className = "",
      a < f.FDay
        ? (b.innerHTML = g = a + f.PDay, c.addClass(b, "laydate_nothis"), 1 === e && (d -= 1), e = 1 === e
          ? 12
          : e - 1)
        : a >= f.FDay && a < f.FDay + c.months[f.ymd[1]]
          ? (b.innerHTML = g = a - f.FDay + 1, a - f.FDay + 1 === f.ymd[2] && (c.addClass(b, h[2]), f.thisDay = b))
          : (b.innerHTML = g = f.NDay++, c.addClass(b, "laydate_nothis"), 12 === e && (d += 1), e = 12 === e
            ? 1
            : e + 1),
      c.checkVoid(d, e, g)[0] && c.addClass(b, h[1]),
      c.options.festival && c.festival(b, e + "." + g),
      b.setAttribute("y", d),
      b.setAttribute("m", e),
      b.setAttribute("d", g),
      d = e = g = null
    }),
    c.valid = !c.hasClass(f.thisDay, h[1]),
    c.ymd = f.ymd,
    h.year.value = c.ymd[0] + "年",
    h.month.value = c.digit(c.ymd[1] + 1) + "月",
    c.each(h.mms, function(a, b) {
      var d = c.checkVoid(c.ymd[0], (0 | b.getAttribute("m")) + 1);
      "y" === d[0] || "m" === d[0]
        ? c.addClass(b, h[1])
        : c.removeClass(b, h[1]),
      c.removeClass(b, h[2]),
      d = null
    }),
    c.addClass(h.mms[c.ymd[1]], h[2]),
    f.times = [
      0 | c.inymd[3] || 0,
      0 | c.inymd[4] || 0,
      0 | c.inymd[5] || 0
    ],
    c.each(new Array(3), function(a) {
      c.hmsin[a].value = c.digit(c.timeVoid(f.times[a], a)
        ? 0 | c.mins[a + 3]
        : 0 | f.times[a])
    }),
    c[c.valid
        ? "removeClass"
        : "addClass"](h.ok, h[1])
  },
  c.festival = function(a, b) {
    var c;
    switch (b) {
      case "1.1":
        c = "元旦";
        break;
      case "3.8":
        c = "妇女";
        break;
      case "4.5":
        c = "清明";
        break;
      case "5.1":
        c = "劳动";
        break;
      case "6.1":
        c = "儿童";
        break;
      case "9.10":
        c = "教师";
        break;
      case "10.1":
        c = "国庆"
    }
    c && (a.innerHTML = c),
    c = null
  },
  c.viewYears = function(a) {
    var b = c.query,
      d = "";
    c.each(new Array(14), function(b) {
      d += 7 === b
        ? "<li " + (parseInt(h.year.value) === a
          ? 'class="' + h[2] + '"'
          : "") + ' y="' + a + '">' + a + "年</li>"
        : '<li y="' + (a - 7 + b) + '">' + (a - 7 + b) + "年</li>"
    }),
    b("#laydate_ys").innerHTML = d,
    c.each(b("#laydate_ys li"), function(a, b) {
      "y" === c.checkVoid(b.getAttribute("y"))[0]
        ? c.addClass(b, h[1])
        : c.on(b, "click", function(a) {
          c.stopmp(a).reshow(),
          c.viewDate(0 | this.getAttribute("y"), c.ymd[1], c.ymd[2])
        })
    })
  },
  c.initDate = function() {
    var d = (c.query, new Date),
      e = c.elem[h.elemv].match(/\d+/g) || [];
    e.length < 3 && (e = c.options.start.match(/\d+/g) || [], e.length < 3 && (e = [
      d.getFullYear(), d.getMonth() + 1,
      d.getDate()
    ])),
    c.inymd = e,
    c.viewDate(e[0], e[1] - 1, e[2])
  },
  c.iswrite = function() {
    var a = c.query,
      b = {
        time: a("#laydate_hms")
      };
    c.shde(b.time, !c.options.istime),
    c.shde(h.oclear, !("isclear" in c.options
      ? c.options.isclear
      : 1)),
    c.shde(h.otoday, !("istoday" in c.options
      ? c.options.istoday
      : 1)),
    c.shde(h.ok, !("issure" in c.options
      ? c.options.issure
      : 1))
  },
  c.orien = function(a, b) {
    var d,
      e = c.elem.getBoundingClientRect();
    a.style.left = e.left + (b
      ? 0
      : c.scroll(1)) + "px",
    d = e.bottom + a.offsetHeight / 1.5 <= c.winarea()
      ? e.bottom - 1
      : e.top > a.offsetHeight / 1.5
        ? e.top - a.offsetHeight + 1
        : c.winarea() - a.offsetHeight,
    a.style.top = d + (b
      ? 0
      : c.scroll()) + "px"
  },
  c.follow = function(a) {
    c.options.fixed
      ? (a.style.position = "fixed", c.orien(a, 1))
      : (a.style.position = "absolute", c.orien(a))
  },
  c.viewtb = function() {
    var a,
      b = [],
      f = [
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六"
      ],
      h = {},
      i = d[e]("table"),
      j = d[e]("thead");
    return j.appendChild(d[e]("tr")),
    h.creath = function(a) {
      var b = d[e]("th");
      b.innerHTML = f[a],
      j[g]("tr")[0].appendChild(b),
      b = null
    },
    c.each(new Array(6), function(d) {
      b.push([]),
      a = i.insertRow(0),
      c.each(new Array(7), function(c) {
        b[d][c] = 0,
        0 === d && h.creath(c),
        a.insertCell(c)
      })
    }),
    i.insertBefore(j, i.children[0]),
    i.id = i.className = "laydate_table",
    a = b = null,
    i.outerHTML.toLowerCase()
  }(),
  c.view = function(a, f) {
    var i,
      g = c.query,
      j = {};
    f = f || a,
    c.elem = a,
    c.options = f,
    c.options.format || (c.options.format = b.format),
    c.options.start = c.options.start || "",
    c.mm = j.mm = [
      c.options.min || b.min,
      c.options.max || b.max
    ],
    c.mins = j.mm[0].match(/\d+/g),
    c.maxs = j.mm[1].match(/\d+/g),
    h.elemv = /textarea|input/.test(c.elem.tagName.toLocaleLowerCase())
      ? "value"
      : "innerHTML",
    c.box
      ? c.shde(c.box)
      : (i = d[e]("div"), i.id = h[0], i.className = h[0], i.style.cssText = "position: absolute;", i.setAttribute("name", "laydate-v" + laydate.v), i.innerHTML = j.html = '<div class="laydate_top"><div class="laydate_ym laydate_y" id="laydate_YY"><a class="laydate_choose laydate_chprev laydate_tab"><cite></cite></a><input id="laydate_y" readonly><label></label><a class="laydate_choose laydate_chnext laydate_tab"><cite></cite></a><div class="laydate_yms"><a class="laydate_tab laydate_chtop"><cite></cite></a><ul id="laydate_ys"></ul><a class="laydate_tab laydate_chdown"><cite></cite></a></div></div><div class="laydate_ym laydate_m" id="laydate_MM"><a class="laydate_choose laydate_chprev laydate_tab"><cite></cite></a><input id="laydate_m" readonly><label></label><a class="laydate_choose laydate_chnext laydate_tab"><cite></cite></a><div class="laydate_yms" id="laydate_ms">' + function() {
        var a = "";
        return c.each(new Array(12), function(b) {
          a += '<span m="' + b + '">' + c.digit(b + 1) + "月</span>"
        }),
        a
      }() + "</div>" + "</div>" + "</div>" + c.viewtb + '<div class="laydate_bottom">' + '<ul id="laydate_hms">' + '<li class="laydate_sj">时间</li>' + "<li><input readonly>:</li>" + "<li><input readonly>:</li>" + "<li><input readonly></li>" + "</ul>" + '<div class="laydate_time" id="laydate_time"></div>' + '<div class="laydate_btn">' + '<a id="laydate_clear">清空</a>' + '<a id="laydate_today">今天</a>' + '<a id="laydate_ok">确认</a>' + "</div>" + (b.isv
        ? '<a href="http://sentsin.com/layui/laydate/" class="laydate_v" target="_blank">laydate-v' + laydate.v + "</a>"
        : "") + "</div>",
      d.body.appendChild(i),
      c.box = g("#" + h[0]),
      c.events(),
      i = null),
    c.follow(c.box),
    f.zIndex
      ? c.box.style.zIndex = f.zIndex
      : c.removeCssAttr(c.box, "z-index"),
    c.stopMosup("click", c.box),
    c.initDate(),
    c.iswrite(),
    c.check()
  },
  c.reshow = function() {
    return c.each(c.query("#" + h[0] + " .laydate_show"), function(a, b) {
      c.removeClass(b, "laydate_show")
    }),
    this
  },
  c.close = function() {
    c.reshow(),
    c.shde(c.query("#" + h[0]), 1),
    c.elem = null
  },
  c.parse = function(a, d, e) {
    return a = a.concat(d),
    e = e || (c.options
      ? c.options.format
      : b.format),
    e.replace(/YYYY|MM|DD|hh|mm|ss/g, function() {
      return a.index = 0 | ++a.index,
      c.digit(a[a.index])
    })
  },
  c.creation = function(a, b) {
    var e = (c.query, c.hmsin),
      f = c.parse(a, [e[0].value, e[1].value, e[2].value]);
    c.elem[h.elemv] = f,
    b || (c.close(), "function" == typeof c.options.choose && c.options.choose(f))
  },
  c.events = function() {
    var b = c.query,
      e = {
        box: "#" + h[0]
      };
    c.addClass(d.body, "laydate_body"),
    h.tds = b("#laydate_table td"),
    h.mms = b("#laydate_ms span"),
    h.year = b("#laydate_y"),
    h.month = b("#laydate_m"),
    c.each(b(e.box + " .laydate_ym"), function(a, b) {
      c.on(b, "click", function(b) {
        c.stopmp(b).reshow(),
        c.addClass(this[g]("div")[0], "laydate_show"),
        a || (e.YY = parseInt(h.year.value), c.viewYears(e.YY))
      })
    }),
    c.on(b(e.box), "click", function() {
      c.reshow()
    }),
    e.tabYear = function(a) {
      0 === a
        ? c.ymd[0]--
        : 1 === a
          ? c.ymd[0]++
          : 2 === a
            ? e.YY -= 14
            : e.YY += 14,
      2 > a
        ? (c.viewDate(c.ymd[0], c.ymd[1], c.ymd[2]), c.reshow())
        : c.viewYears(e.YY)
    },
    c.each(b("#laydate_YY .laydate_tab"), function(a, b) {
      c.on(b, "click", function(b) {
        c.stopmp(b),
        e.tabYear(a)
      })
    }),
    e.tabMonth = function(a) {
      a
        ? (c.ymd[1]++, 12 === c.ymd[1] && (c.ymd[0]++, c.ymd[1] = 0))
        : (c.ymd[1]--, -1 === c.ymd[1] && (c.ymd[0]--, c.ymd[1] = 11)),
      c.viewDate(c.ymd[0], c.ymd[1], c.ymd[2])
    },
    c.each(b("#laydate_MM .laydate_tab"), function(a, b) {
      c.on(b, "click", function(b) {
        c.stopmp(b).reshow(),
        e.tabMonth(a)
      })
    }),
    c.each(b("#laydate_ms span"), function(a, b) {
      c.on(b, "click", function(a) {
        c.stopmp(a).reshow(),
        c.hasClass(this, h[1]) || c.viewDate(c.ymd[0], 0 | this.getAttribute("m"), c.ymd[2])
      })
    }),
    c.each(b("#laydate_table td"), function(a, b) {
      c.on(b, "click", function(a) {
        c.hasClass(this, h[1]) || (c.stopmp(a), c.creation([
          0 | this.getAttribute("y"),
          0 | this.getAttribute("m"),
          0 | this.getAttribute("d")
        ]))
      })
    }),
    h.oclear = b("#laydate_clear"),
    c.on(h.oclear, "click", function() {
      c.elem[h.elemv] = "",
      c.close(), ("function" == typeof c.options.choose && c.options.choose(''))
    }),
    h.otoday = b("#laydate_today"),
    c.on(h.otoday, "click", function() {
      var __now = laydate.now(0, c.options.format);
      c.elem[h.elemv] = __now,
      c.close(), ("function" == typeof c.options.choose && c.options.choose(__now))
    }),
    h.ok = b("#laydate_ok"),
    c.on(h.ok, "click", function() {
      c.valid && c.creation([
        c.ymd[0], c.ymd[1] + 1,
        c.ymd[2]
      ])
    }),
    e.times = b("#laydate_time"),
    c.hmsin = e.hmsin = b("#laydate_hms input"),
    e.hmss = [
      "小时", "分钟", "秒数"
    ],
    e.hmsarr = [],
    c.msg = function(a, d) {
      var f = '<div class="laydte_hsmtex">' + (d || "提示") + "<span>×</span></div>";
      "string" == typeof a
        ? (f += "<p>" + a + "</p>", c.shde(b("#" + h[0])), c.removeClass(e.times, "laydate_time1").addClass(e.times, "laydate_msg"))
        : (e.hmsarr[a]
          ? f = e.hmsarr[a]
          : (f += '<div id="laydate_hmsno" class="laydate_hmsno">', c.each(new Array(0 === a
            ? 24
            : 60), function(a) {
            f += "<span>" + a + "</span>"
          }), f += "</div>", e.hmsarr[a] = f), c.removeClass(e.times, "laydate_msg"), c[0 === a
            ? "removeClass"
            : "addClass"](e.times, "laydate_time1")),
      c.addClass(e.times, "laydate_show"),
      e.times.innerHTML = f
    },
    e.hmson = function(a, d) {
      var e = b("#laydate_hmsno span"),
        f = c.valid
          ? null
          : 1;
      c.each(e, function(b, e) {
        f
          ? c.addClass(e, h[1])
          : c.timeVoid(b, d)
            ? c.addClass(e, h[1])
            : c.on(e, "click", function() {
              c.hasClass(this, h[1]) || (a.value = c.digit(0 | this.innerHTML))
            })
      }),
      c.addClass(e[0 | a.value], "laydate_click")
    },
    c.each(e.hmsin, function(a, b) {
      c.on(b, "click", function(b) {
        c.stopmp(b).reshow(),
        c.msg(a, e.hmss[a]),
        e.hmson(this, a)
      })
    }),
    c.on(d, "mouseup", function() {
      var a = b("#" + h[0]);
      a && "none" !== a.style.display && (c.check() || c.close())
    }).on(d, "keydown", function(b) {
      b = b || a.event;
      var d = b.keyCode;
      13 === d && c.creation([
        c.ymd[0], c.ymd[1] + 1,
        c.ymd[2]
      ])
    })
  },
  c.init = function() {
//  c.use("need"),
//  c.use(h[4] + b.defSkin, h[3]),
    c.skinLink = c.query("#" + h[3])
  }(),
  laydate.reset = function() {
    c.box && c.elem && c.follow(c.box)
  },
  laydate.now = function(a, b) {
    var d = new Date(0 | a
      ? function(a) {
        return 864e5 > a
          ? + new Date + 864e5 * a
          : a
      }(parseInt(a))
      : + new Date);
    return c.parse([
      d.getFullYear(), d.getMonth() + 1,
      d.getDate()
    ], [
      d.getHours(), d.getMinutes(), d.getSeconds()
    ], b)
  },
  laydate.skin = function(a) {
    c.skinLink.href = c.getPath + h[4] + a + h[5]
  }
}(window);
