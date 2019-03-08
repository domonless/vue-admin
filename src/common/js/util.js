var SIGN_REGEXP = /([yMdhsm])(\1*)/g;
var DEFAULT_PATTERN = 'yyyy-MM-dd';
function padding(s, len) {
    var len = len - (s + '').length;
    for (var i = 0; i < len; i++) { s = '0' + s; }
    return s;
};

export default {
    getQueryStringByName: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    },
    formatDate: {


        format: function (date, pattern) {
            pattern = pattern || DEFAULT_PATTERN;
            return pattern.replace(SIGN_REGEXP, function ($0) {
                switch ($0.charAt(0)) {
                    case 'y': return padding(date.getFullYear(), $0.length);
                    case 'M': return padding(date.getMonth() + 1, $0.length);
                    case 'd': return padding(date.getDate(), $0.length);
                    case 'w': return date.getDay() + 1;
                    case 'h': return padding(date.getHours(), $0.length);
                    case 'm': return padding(date.getMinutes(), $0.length);
                    case 's': return padding(date.getSeconds(), $0.length);
                }
            });
        },
        parse: function (dateString, pattern) {
            var matchs1 = pattern.match(SIGN_REGEXP);
            var matchs2 = dateString.match(/(\d)+/g);
            if (matchs1.length == matchs2.length) {
                var _date = new Date(1970, 0, 1);
                for (var i = 0; i < matchs1.length; i++) {
                    var _int = parseInt(matchs2[i]);
                    var sign = matchs1[i];
                    switch (sign.charAt(0)) {
                        case 'y': _date.setFullYear(_int); break;
                        case 'M': _date.setMonth(_int - 1); break;
                        case 'd': _date.setDate(_int); break;
                        case 'h': _date.setHours(_int); break;
                        case 'm': _date.setMinutes(_int); break;
                        case 's': _date.setSeconds(_int); break;
                    }
                }
                return _date;
            }
            return null;
        }

    },
    DX: function(n) {
        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
            return "数据非法";
        var unit = "仟佰拾亿仟佰拾万仟佰拾元角分", str = "";
            n += "00";
        var p = n.indexOf('.');
        if (p >= 0)
            n = n.substring(0, p) + n.substr(p+1, 2);
            unit = unit.substr(unit.length - n.length);
        for (var i=0; i < n.length; i++)
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    },
    formatNumber: function(num){
        return Number(Number(num).toFixed(2));
    },
    plus: function(a,b){
        return (a*100+b*100)/100;
    },
    minus: function(a,b){
        return (a*100-b*100)/100;
    },
    //供货商转化
    formatProvider: function (provider) {
        var reg1 = /超市(.+)?/g;
        var reg2 = /生活(.+)?/g;
        var reg3 = /机电(.+)?/g;
        var reg4 = /石材(.+)?/g;
        var reg5 = /日杂(.+)?/g;
        var reg6 = /副食(.+)?/g;
        var reg7 = /农副(.+)?/g;
        var reg8 = /五金(.+)?/g;
        var reg9 = /有限公司(.+)?/g;
        var reg10 = /经营部(.+)?/g;
        var reg11 = /贸易(.+)?/g;
        var reg12 = /商贸(.+)?/g;
        var reg13 = /办公(.+)?/g;
        var reg14 = /家具(.+)?/g;
        var reg15 = /消防(.+)?/g;

        var reg97 = /(.+)市/g;
        var reg98 = /(.+)区/g;
        var reg99 = /(.+)县/g;
        return provider.replace(reg1,"").replace(reg2,"")
        .replace(reg3,"").replace(reg4,"")
        .replace(reg5,"").replace(reg6,"")
        .replace(reg7,"").replace(reg8,"")
        .replace(reg9,"").replace(reg10,"")
        .replace(reg11,"").replace(reg12,"").replace(reg13,"").replace(reg14,"")
        .replace(reg15,"")
        .replace(reg97,"").replace(reg98,"").replace(reg99,"");
    },

};
