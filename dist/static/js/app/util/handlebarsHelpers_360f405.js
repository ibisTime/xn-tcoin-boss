define('js/app/util/handlebarsHelpers', ['js/lib/handlebars.runtime-v3.0.3', 'js/app/util/ajax', 'js/app/util/dict'], function( Handlebars, Ajax, Dict) {
    Handlebars.registerHelper('formatMoney', function(num, options){
        if(!num && num !== 0)
            return "--";
        num = +num;
        return (num / 1000).toFixed(2);
    });
    Handlebars.registerHelper('formatZeroMoney', function(num, places, options){
        if (typeof num == 'undefined' || typeof num != 'number') {
            return 0;
        }
        num = +(num || 0) / 1000;
        return num.toFixed(0);
    });

    Handlebars.registerHelper('compare', function(v1, v2, res1, res2, res3, options){
        if (v1 > v2) {
            return res1;
        } else if (v1 = v2) {
            return res2;
        } else {
            return res3;
        }
    });

    Handlebars.registerHelper('safeString', function(text, options){
        return new Handlebars.SafeString(text);
    });
    Handlebars.registerHelper('formatImage', function(pic, isAvatar, options){
        var defaultAvatar = "data:image/png;base64,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";
        if(pic){
            pic = pic.split(/\|\|/)[0];
        }
        if(!/^http/i.test(pic)){
            pic = pic ? (PIC_PREFIX + pic + PHOTO_SUFFIX) :
            (isAvatar && !isAvatar.name) ? defaultAvatar : "";
        }
        return pic;
    });
    Handlebars.registerHelper('formatImageAvatar', function(pic, isAvatar, options){
        var defaultAvatar = "data:image/png;base64,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";
        if(pic){
            pic = pic.split(/\|\|/)[0];
        }
        if(!/^http/i.test(pic)){
            pic = pic ? (PIC_PREFIX + pic + PHOTO_SUFFIX) :defaultAvatar;
        }
        return pic;
    });
    Handlebars.registerHelper('formatListImage', function(pic, options){
    	var defaultImg = "";
        if(!pic)
            return defaultImg;
        pic = pic.split(/\|\|/)[0];
        return (PIC_PREFIX + pic + '?imageMogr2/auto-orient/thumbnail/!280x175r');
    });
    Handlebars.registerHelper('formateDatetime', function(date, options){
        return date ? new Date(date).format("yyyy-MM-dd hh:mm:ss") : "--";
    });
    Handlebars.registerHelper('formateDate', function(date, options){
        return date ? new Date(date).format("yyyy-MM-dd") : "--";
    });
    Handlebars.registerHelper('formateCNDate', function(date, options){
        return date ? new Date(date).format("yyyy年MM月dd日") : "--";
    });
    Handlebars.registerHelper('formatePointDate', function(date, options){
        return date ? new Date(date).format("yyyy.MM.dd") : "--";
    });
    Handlebars.registerHelper('formateTime', function(date, options){
        return date ? new Date(date).format("hh:mm") : "--";
    });
    Handlebars.registerHelper('clearTag', function(des, options){
        return des && des.replace(/(\<[^\>]+\>)|(\<\/[^\>]+\>)|(\<[^\/\>]+\/\>)/ig, "") || "";
    });
    Handlebars.registerHelper('formatAddress', function(addr, options){
        if(!addr)
            return "";
        var province = options.data.root.items[0].province,
            city = options.data.root.items[0].city,
            area = options.data.root.items[0].area,
            address = options.data.root.items[0].detail;
        if(province == city){
            province = "";
        }
        return province + city + area +" "+ address;
    });
    Handlebars.registerHelper('format2line', function(cont, options){
        return cont
            ? cont.length > 40
                ? cont.substring(0, 40) + "..."
                : cont
            : "";
    });
    Handlebars.registerHelper('formatHotelRoomDescription', function(desc, options){
    	var distData = Dict.get("hotelRoomDescription")
    	var desc = desc.split(",");
    	var val = ""
    	desc.forEach(function(d,i){
    		val += distData[d]+" "
    	})
    	return val;
    });
    

    return Handlebars;
});
