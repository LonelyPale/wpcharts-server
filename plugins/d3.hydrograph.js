/**
 *
 *
 * */

(function (global, factory) {
    if(typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else {
        if (typeof global.d3 === 'object' && global.d3.version.slice(0, 1) === '5') {
            factory(global);
        } else {
            throw new Error("hydrograph requires a window with d3");
        }
    }
}(typeof window !== 'undefined' ? window : this, (function (window) {
    'use strict';

    var fetch = window.fetch || require('node-fetch');
    var d3 = window.d3 || require('d3');

    var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    //var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");
    var formatTime = d3.timeFormat("%Y-%m-%d %H:%M:%S");

    var day = 24 * 60 * 60 * 1000; // 1天
    var month = 31 * day; // 1月,计算间隔是31天,实际显示是32天
    var year = 12 * month; // 1年
    var time_level1 = day; // 1天
    var time_level2 = month; // 1月
    var time_level3 = 3 * year; // 3年
    var time_level4 = 8 * year; // 8年
    var time_level5 = 20 * year; // 20年
    var time_level6 = 50 * year; // 60年
    //var time_level6 = 60 * year; // 60年
    var time_level7 = 75 * year; // 100年
    //var time_level7 = 100 * year; // 100年

    var version = "0.0.1";

    var storage = {};

    var defaultOptions = {
        url: null,
        request: {
            method: 'POST',
            //body: JSON.stringify(testData),
            //credentials: 'include',
            //mode: 'cors',
            headers: {
                //'Content-Type': 'application/json'
                'Content-Type': 'application/x-www-form-urlencoded'
            }//new Headers()
        },
        data: null,
        width: 1000,
        height: 400,
        topHeight: 100,
        bottomHeight: 50,
        leftWidth: 100,
        rightWidth: 100,
        lineWidth: 1
    };

    //计算是否是闰年
    var isLeapYear = function(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 100 === 0 && year % 400 === 0);
    };

    //得到一个月的总天数
    //初始化d为月份的第0天，由于JavaScript中day的范围为1~31中的值，所以当设为0时，会向前一天，也即表示上个月的最后一天。自动处理闰年。特殊情况:此处传入的月份应为 1 - 12 (其他时候正常情况应为: 0 - 11)
    var getDayCount = function(year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    };

    var beautifyDatetime = function(date, type, time_level, date2) {
        //var date = new Date(timestamp);
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var millisecond = date.getMilliseconds();

        var year2, year_difference, year_len;

        if(type === "start") {//开始时间
            minute = 0;
            second = 0;
            millisecond = 0;
            if(time_level === "time_level1") {
            } else if(time_level === "time_level2") {
                hour = 0;
            } else if(time_level === "time_level3") {
                hour = 0;
                day = 1;
            } else if(time_level === "time_level4") {
                if(month === 0 || month === 1 || month === 2) {
                    month = 0;
                } else if(month === 3 || month === 4 || month === 5) {
                    month = 3;
                } else if(month === 6 || month === 7 || month === 8) {
                    month = 6;
                } else if(month === 9 || month === 10 || month === 11) {
                    month = 9;
                }
                hour = 0;
                day = 1;
            } else if(time_level === "time_level5") {
                hour = 0;
                day = 1;
                month = 0;
            } else if(time_level === "time_level6") {
                hour = 0;
                day = 1;
                month = 0;
            } else if(time_level === "time_level7") {
                hour = 0;
                day = 1;
                month = 0;
            } else if(time_level === "time_level99") {
                hour = 0;
                day = 1;
                month = 0;
            }
        } else if(type === "end") {//结束时间
            minute = 59;
            second = 59;
            millisecond = 999;
            if(time_level === "time_level1") {
            } else if(time_level === "time_level2") {
                hour = 23;
            } else if(time_level === "time_level3") {
                hour = 23;
                day = getDayCount(year, month + 1);
            } else if(time_level === "time_level4") {
                if(month === 0 || month === 1 || month === 2) {
                    month = 2;
                } else if(month === 3 || month === 4 || month === 5) {
                    month = 5;
                } else if(month === 6 || month === 7 || month === 8) {
                    month = 8;
                } else if(month === 9 || month === 10 || month === 11) {
                    month = 11;
                }
                hour = 23;
                day = getDayCount(year, month + 1);
            } else if(time_level === "time_level5") {
                hour = 23;
                day = 31;
                month = 11;
            } else if(time_level === "time_level6") {
                hour = 23;
                day = 31;
                month = 11;
                year2 = date2.getFullYear();
                year_difference = year - year2;
                year_len = Math.ceil(year_difference / 2);
                year = year2 + year_len * 2;
            } else if(time_level === "time_level7") {
                hour = 23;
                day = 31;
                month = 11;
                year2 = date2.getFullYear();
                year_difference = year - year2;
                year_len = Math.ceil(year_difference / 3);
                year = year2 + year_len * 3;
            } else if(time_level === "time_level99") {
                hour = 23;
                day = 31;
                month = 11;
                //todo
            }
        }

        return new Date(year, month, day, hour, minute, second, millisecond);
    };

    function test() {
        console.log("now:", new Date().getTime(), new Date() instanceof Date);
        console.log("Date-0:", new Date(2019, 2, 0).getDate(), new Date(2019, 2, 0).getMonth());
        console.log("Date-1:", new Date(2019, 2, 1).getDate(), new Date(2019, 2, 1).getMonth());
        console.log(Math.ceil(0.60), Math.ceil(0));

        var str = '';
        var obj = {};
        console.log("typeof:", typeof str, typeof obj);
        console.log("instanceof:", str instanceof String, obj instanceof Object);

        /*
        //console.log("Promise:", Promise);
        //console.log("fetch:", fetch);
        console.log("Headers:", new Headers({
            'Content-Type': 'application/json'
            //'Content-Type': 'application/x-www-form-urlencoded'
        }), new Headers().toString());
        console.log("Object:", new Object(), new Object().toString());
        console.log(1, JSON.stringify(new Headers({'a':'1'})), new Headers({'a':'1'}).a, new Headers({'a':'1'}).entries());
        */
    }

    var fun_time_level = {
        "time_level1": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();
            var maxMonth = max.getMonth() + 1;
            var minMonth = min.getMonth() + 1;
            var maxDay = max.getDate();
            var minDay = min.getDate();
            var maxHour = max.getHours();
            var minHour = min.getHours();

            var year_difference = maxYear - minYear;
            var month_difference;
            var day_difference;
            var hour_difference;

            var time_group = {
                times1: [],
                times2: []
            };

            //只有两种情况：1、同年同月同日；2、同年同月跨日、同年跨月跨日、跨年跨月跨日(情况相同，代码可精简，不精简是为了逻辑更清晰)
            if(year_difference === 0) {//同年
                month_difference = maxMonth - minMonth;
                if(month_difference === 0) {//同月
                    day_difference = maxDay - minDay;
                    if(day_difference === 0) {//同日
                        hour_difference = maxHour - minHour + 1;
                        for(var i = 0; i < hour_difference; i++) {
                            time_group.times1.push(minHour + i);
                        }
                        time_group.times2.push({
                            text: minYear + "-" + minMonth + "-" + minDay,
                            len: hour_difference
                        });
                    } else {//跨日
                        hour_difference = 23 - minHour + 1; //0 至 23
                        for(var i = 0; i < hour_difference; i++) {
                            time_group.times1.push(minHour + i);
                        }
                        time_group.times2.push({
                            text: minYear + "-" + minMonth + "-" + minDay,
                            len: hour_difference
                        });

                        for(var j = 0; j <= maxHour; j++) {
                            time_group.times1.push(j);
                        }
                        time_group.times2.push({
                            text: maxYear + "-" + maxMonth + "-" + maxDay,
                            len: maxHour + 1
                        });
                    }
                } else {//跨月
                    hour_difference = 23 - minHour + 1; //0 至 23
                    for(var i = 0; i < hour_difference; i++) {
                        time_group.times1.push(minHour + i);
                    }
                    time_group.times2.push({
                        text: minYear + "-" + minMonth + "-" + minDay,
                        len: hour_difference
                    });

                    for(var j = 0; j <= maxHour; j++) {
                        time_group.times1.push(j);
                    }
                    time_group.times2.push({
                        text: maxYear + "-" + maxMonth + "-" + maxDay,
                        len: maxHour + 1
                    });
                }
            } else if(year_difference === 1) {//跨年
                hour_difference = 23 - minHour + 1; //0 至 23
                for(var i = 0; i < hour_difference; i++) {
                    time_group.times1.push(minHour + i);
                }
                time_group.times2.push({
                    text: minYear + "-" + minMonth + "-" + minDay,
                    len: hour_difference
                });

                for(var j = 0; j <= maxHour; j++) {
                    time_group.times1.push(j);
                }
                time_group.times2.push({
                    text: maxYear + "-" + maxMonth + "-" + maxDay,
                    len: maxHour + 1
                });
            }

            return time_group;
        },
        "time_level2": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();
            var maxMonth = max.getMonth() + 1;
            var minMonth = min.getMonth() + 1;
            var maxDay = max.getDate();
            var minDay = min.getDate();

            var year_difference = maxYear - minYear;
            var month_difference;
            var day_difference;

            var time_group = {
                times1: [],
                times2: []
            };

            if(year_difference === 0) {
                month_difference = maxMonth - minMonth;
                if(month_difference === 0) {
                    day_difference = maxDay - minDay + 1;
                    for(var i = 0; i < day_difference; i++) {
                        time_group.times1.push(minDay + i);
                    }
                    time_group.times2.push({
                        text: minYear + "-" + minMonth,
                        len: day_difference
                    });
                } else if(month_difference === 1) {
                    day_difference = getDayCount(minYear, minMonth) - minDay + 1;
                    for(var i = 0; i < day_difference; i++) {
                        time_group.times1.push(minDay + i);
                    }
                    time_group.times2.push({
                        text: minYear + "-" + minMonth,
                        len: day_difference
                    });

                    for(var j = 0; j < maxDay; j++) {
                        time_group.times1.push(1 + j);
                    }
                    time_group.times2.push({
                        text: maxYear + "-" + maxMonth,
                        len: maxDay
                    });
                } else {
                    day_difference = getDayCount(minYear, minMonth) - minDay + 1;
                    for(var i = 0; i < day_difference; i++) {
                        time_group.times1.push(minDay + i);
                    }
                    time_group.times2.push({
                        text: minYear + "-" + minMonth,
                        len: day_difference
                    });

                    for(var m = 1; m < month_difference; m++) {
                        var dayCount = getDayCount(minYear, minMonth + m);
                        for(var n = 1; n <= dayCount; n++) {
                            time_group.times1.push(n);
                        }
                        time_group.times2.push({
                            text: minYear + "-" + (minMonth + m),
                            len: dayCount
                        });
                    }

                    for(var j = 0; j < maxDay; j++) {
                        time_group.times1.push(1 + j);
                    }
                    time_group.times2.push({
                        text: maxYear + "-" + maxMonth,
                        len: maxDay
                    });
                }
            } else if(year_difference === 1) {
                day_difference = getDayCount(minYear, minMonth) - minDay + 1;
                for(var i = 0; i < day_difference; i++) {
                    time_group.times1.push(minDay + i);
                }
                time_group.times2.push({
                    text: minYear + "-" + minMonth,
                    len: day_difference
                });

                for(var j = 0; j < maxDay; j++) {
                    time_group.times1.push(1 + j);
                }
                time_group.times2.push({
                    text: maxYear + "-" + maxMonth,
                    len: maxDay
                });
            }

            return time_group;
        },
        "time_level3": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();
            var maxMonth = max.getMonth() + 1;
            var minMonth = min.getMonth() + 1;

            var year_difference = maxYear - minYear;
            var month_difference;

            var time_group = {
                times1: [],
                times2: []
            };

            if(year_difference === 0) {
                month_difference = maxMonth - minMonth + 1;
                for(var i = 0; i < month_difference; i++) {
                    time_group.times1.push(minMonth + i);
                }
                time_group.times2.push({
                    text: minYear,
                    len: month_difference
                });
            } else if(year_difference === 1) {
                month_difference = 12 - minMonth + 1;
                for(var i = 0; i < month_difference; i++) {
                    time_group.times1.push(minMonth + i);
                }
                time_group.times2.push({
                    text: minYear,
                    len: month_difference
                });

                for(var j = 0; j < maxMonth; j++) {
                    time_group.times1.push(1 + j);
                }
                time_group.times2.push({
                    text: maxYear,
                    len: maxMonth
                });
            } else {
                month_difference = 12 - minMonth + 1;
                for(var i = 0; i < month_difference; i++) {
                    time_group.times1.push(minMonth + i);
                }
                time_group.times2.push({
                    text: minYear,
                    len: month_difference
                });

                for(var m = 1; m < year_difference; m++) {
                    for(var n = 1; n <= 12; n++) {
                        time_group.times1.push(n);
                    }
                    time_group.times2.push({
                        text: minYear + m,
                        len: 12
                    });
                }

                for(var j = 0; j < maxMonth; j++) {
                    time_group.times1.push(1 + j);
                }
                time_group.times2.push({
                    text: maxYear,
                    len: maxMonth
                });
            }

            return time_group;
        },
        "time_level4": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();
            var maxMonth = max.getMonth() + 1;
            var minMonth = min.getMonth() + 1;

            var year_difference = maxYear - minYear;

            var time_group = {
                times1: [],
                times2: []
            };

            if(minMonth === 1 || minMonth === 2 || minMonth === 3) {
                time_group.times1.push("Q1");
                time_group.times1.push("Q2");
                time_group.times1.push("Q3");
                time_group.times1.push("Q4");
                time_group.times2.push({
                    text: minYear,
                    len: 4
                });
            } else if(minMonth === 4 || minMonth === 5 || minMonth === 6) {
                time_group.times1.push("Q2");
                time_group.times1.push("Q3");
                time_group.times1.push("Q4");
                time_group.times2.push({
                    text: minYear,
                    len: 3
                });
            } else if(minMonth === 7 || minMonth === 8 || minMonth === 9) {
                time_group.times1.push("Q3");
                time_group.times1.push("Q4");
                time_group.times2.push({
                    text: minYear,
                    len: 2
                });
            } else if(minMonth === 10 || minMonth === 11 || minMonth === 12) {
                time_group.times1.push("Q4");
                time_group.times2.push({
                    text: minYear,
                    len: 1
                });
            }

            for(var m = 1; m < year_difference; m++) {
                for(var n = 1; n <= 4; n++) {
                    time_group.times1.push("Q" + n);
                }
                time_group.times2.push({
                    text: minYear + m,
                    len: 4
                });
            }

            if(maxMonth === 1 || maxMonth === 2 || maxMonth === 3) {
                time_group.times1.push("Q1");
                time_group.times2.push({
                    text: maxYear,
                    len: 1
                });
            } else if(maxMonth === 4 || maxMonth === 5 || maxMonth === 6) {
                time_group.times1.push("Q1");
                time_group.times1.push("Q2");
                time_group.times2.push({
                    text: maxYear,
                    len: 2
                });
            } else if(maxMonth === 7 || maxMonth === 8 || maxMonth === 9) {
                time_group.times1.push("Q1");
                time_group.times1.push("Q2");
                time_group.times1.push("Q3");
                time_group.times2.push({
                    text: maxYear,
                    len: 3
                });
            } else if(maxMonth === 10 || maxMonth === 11 || maxMonth === 12) {
                time_group.times1.push("Q1");
                time_group.times1.push("Q2");
                time_group.times1.push("Q3");
                time_group.times1.push("Q4");
                time_group.times2.push({
                    text: maxYear,
                    len: 4
                });
            }

            return time_group;
        },
        "time_level5": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();

            var year_difference = maxYear - minYear;

            var time_group = {
                times1: [],
                times2: []
            };

            for(var m = 0; m <= year_difference; m++) {
                time_group.times1.push(minYear + m);
            }

            return time_group;
        },
        "time_level6": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();

            var year_difference = maxYear - minYear;

            var time_group = {
                times1: [],
                times2: []
            };

            var year_len = Math.ceil(year_difference / 2);
            for(var m = 0; m <= year_len; m++) {
                time_group.times1.push(minYear + m * 2);
            }

            return time_group;
        },
        "time_level7": function (max, min) {
            var maxYear = max.getFullYear();
            var minYear = min.getFullYear();

            var year_difference = maxYear - minYear;

            var time_group = {
                times1: [],
                times2: []
            };

            var year_len = Math.ceil(year_difference / 3);
            for(var m = 0; m <= year_len; m++) {
                time_group.times1.push(minYear + m * 3);
            }

            return time_group;
        },
        "time_level99": function (max, min) {
            //todo
        }
    };

    var fun_scale = function(min, max) {
        //var tickNumber = 7;
        var tickNumber = 7;
        var step = (max - min) / tickNumber;
        var ticks = [];
        ticks.push(min);
        for(var i = 1, num = min; i < tickNumber; i++) {
            num += step;
            ticks.push(num);
        }
        ticks.push(max);
        return ticks;
    };

    //Return an object as an `x-www-form-urlencoded` string
    var formurlencoded = function (data) {
        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var sorted = Boolean(opts.sorted),
            skipIndex = Boolean(opts.skipIndex),
            ignorenull = Boolean(opts.ignorenull),
            encode = function encode(value) {
                return String(value).replace(/(?:[\0-\x1F"-&\+-\}\x7F-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, encodeURIComponent).replace(/ /g, '+').replace(/[!'()~\*]/g, function (ch) {
                    return '%' + ch.charCodeAt().toString(16).slice(-2).toUpperCase();
                });
            },
            keys = function keys(obj) {
                var keyarr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.keys(obj);
                return sorted ? keyarr.sort() : keyarr;
            },
            filterjoin = function filterjoin(arr) {
                return arr.filter(function (e) {
                    return e;
                }).join('&');
            },
            objnest = function objnest(name, obj) {
                return filterjoin(keys(obj).map(function (key) {
                    return nest(name + '[' + key + ']', obj[key]);
                }));
            },
            arrnest = function arrnest(name, arr) {
                return arr.length ? filterjoin(arr.map(function (elem, index) {
                    return skipIndex ? nest(name + '[]', elem) : nest(name + '[' + index + ']', elem);
                })) : encode(name + '[]');
            },
            nest = function nest(name, value) {
                var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : typeof value === 'undefined' ? 'undefined' : _typeof(value);
                var f = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

                if (value === f) f = ignorenull ? f : encode(name) + '=' + f;else if (/string|number|boolean/.test(type)) f = encode(name) + '=' + encode(value);else if (Array.isArray(value)) f = arrnest(name, value);else if (type === 'object') f = objnest(name, value);

                return f;
            };

        return data && filterjoin(keys(data).map(function (key) {
            return nest(key, data[key]);
        }));
    };

    var hydrograph = function (selector, node) {
        test();
        return new hydrograph.fn.init(selector, node);
    };

    hydrograph.fn = hydrograph.prototype = {
        constructor: hydrograph, //构造函数
        version: version,
        length: 0,
        index: 0,

        setOption: function (option) {
            //this.option = Object.assign(this.option, option);
            this.option = hydrograph.extend(this.option, option);//console.log(JSON.stringify(this.option.request));

            var self = this;

            if(this.option.url) {
                /*
                d3.json(this.option.url, {}).then(function (data) {
                    self.option.data = data;
                    self._initData(data);
                    self._drawGraph();
                    console.log("self.physical:", self.physical);
                });
                */

                var body = this.option.request.body;
                if(typeof body === 'object') {
                    //this.option.request.body = JSON.stringify(body);
                    this.option.request.body = formurlencoded(body);
                    //this.option.request.headers = new Headers({
                        //'Content-Type': 'application/json'
                        //'Content-Type': 'application/x-www-form-urlencoded'
                    //});
                }

                fetch(this.option.url, this.option.request).then(function(response) {
                    return response.json();
                }).then(function(data) {
                    self.option.data = data;
                    self._initData(data);
                    self._drawGraph();
                    //console.log("self.physical:", self.physical);
                }).catch(function(error) {
                    console.log(error);
                });
            } else if(this.option.data) {
                self._initData(this.option.data);
                self._drawGraph();
                //console.log("self.physical:", self.physical);
            }

            return this;
        },

        // sourceData, targetData
        _initData: function(data) {
            this.data = data && data.ObservLineList ? data : data.object;
            this.title = this.data.Title;

            var sourceData = this.data;
            var targetData = this.physical;
            var datetime = [];

            //只处理10根线
            for(var i = 0, i_len = sourceData.ObservLineList.length < 10 ? sourceData.ObservLineList.length : 10; i < i_len; i++) {
                var line = sourceData.ObservLineList[i];
                var unit = line.Unit;
                var phys = targetData.get(unit);
                if(!phys) {
                    //只显示4个物理量
                    if(targetData.size >= 4) {
                        continue;
                    }
                    phys = {values: []};
                    targetData.set(unit, phys);
                }
                var del = [];

                for(var j = 0, j_len = line.ObservPointList.length; j < j_len; j++) {
                    var point = line.ObservPointList[j];
                    if(point.Value === -99) {
                        // -99为无效值
                        del.unshift(j);//无效值，待删除
                        continue;
                    }

                    datetime.push(parseTime(point.SuvDate));
                    phys.values.push(parseFloat(point.Value));
                }

                //从后向前删除无效值
                for(var k = 0, k_len = del.length; k < k_len; k++) {
                    line.ObservPointList.splice(del[k], 1);
                }
            }

            targetData.forEach(function (value, key) {
                value.unit = key;
                value.max = d3.max(value.values);
                value.min = d3.min(value.values);
            });

            //处理日期 X 轴
            var max = d3.max(datetime);
            var min = d3.min(datetime);
            var phys_datetime = {};
            phys_datetime.unit = "datetime";
            phys_datetime.max = max;
            phys_datetime.min = min;
            phys_datetime.values = datetime;

            var time_difference = max - min;
            var time_level = null;
            if(time_difference <= time_level1){
                time_level = "time_level1";
            } else if(time_difference <= time_level2) {
                time_level = "time_level2";
            } else if(time_difference <= time_level3) {
                time_level = "time_level3";
            } else if(time_difference <= time_level4) {
                time_level = "time_level4";
            } else if(time_difference <= time_level5) {
                time_level = "time_level5";
            } else if(time_difference <= time_level6) {
                time_level = "time_level6";
            } else if(time_difference <= time_level7) {
                time_level = "time_level7";
            } else {
                time_level = "time_level99";
            }
            phys_datetime.time_difference = time_difference;
            phys_datetime.time_level = time_level;
            phys_datetime.time_group = fun_time_level[time_level](max, min);

            //console.log(time_difference/24/3600/1000, formatTime(info_datetime.get("max")), formatTime(info_datetime.get("min")));

            targetData.set("datetime", phys_datetime);

            this._initLegend();
        },

        _initScale: function() {

        },

        _initLegend: function() {
            var legend = this.legend;
            var defaultLegendSize = 20;

            legend[0] = {
                name: "solid_circle",
                color: "Blue",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolCircle)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "Blue");

                    /*
                    var points = [[x, y]];
                    context.selectAll("path")
                        .data(points).enter()
                        .append("path")
                        .attr("transform", function(d, index, node) {
                            return "translate(" + d + ")";
                        })
                        .attr("d", pathData)
                        .attr("fill", "Blue");
                    */
                }
            };

            legend[1] = {
                name: "hollow_circle",
                color: "Red",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolCircle)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "none")
                        .attr("stroke", "Red")
                        .attr("stroke-width", 1);
                }
            };

            legend[2] = {
                name: "solid_rect",
                color: "Cyan",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolSquare)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "Cyan");
                }
            };

            legend[3] = {
                name: "hollow_rect",
                color: "Pink",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolSquare)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "none")
                        .attr("stroke", "Pink")
                        .attr("stroke-width", 1);
                }
            };

            legend[4] = {
                name: "solid_triangle",
                color: "Green",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolTriangle)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "Green");
                }
            };

            legend[5] = {
                name: "hollow_triangle",
                color: "Purple",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolTriangle)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "none")
                        .attr("stroke", "Purple")
                        .attr("stroke-width", 1);
                }
            };

            legend[6] = {
                name: "solid_inverted_triangle",
                color: "LightBlue",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolTriangle)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})rotate(180)`)
                        .attr("d", pathData)
                        .attr("fill", "LightBlue");
                }
            };

            legend[7] = {
                name: "hollow_inverted_triangle",
                color: "PaleVioletRed",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolTriangle)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})rotate(180)`)
                        .attr("d", pathData)
                        .attr("fill", "none")
                        .attr("stroke", "PaleVioletRed")
                        .attr("stroke-width", 1)
                }
            };

            legend[8] = {
                name: "solid_rhombus",
                color: "SeaGreen",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolDiamond)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "SeaGreen");
                }
            };

            legend[9] = {
                name: "hollow_rhombus",
                color: "Yellow",
                draw: function(context, x, y, size) {
                    var legendSize = size || defaultLegendSize;
                    var symbolGenerator = d3.symbol()
                        .type(d3.symbolDiamond)
                        .size(legendSize);
                    var pathData = symbolGenerator();

                    context.append('path')
                        .attr("transform", `translate(${x}, ${y})`)
                        .attr("d", pathData)
                        .attr("fill", "none")
                        .attr("stroke", "Yellow")
                        .attr("stroke-width", 1);
                }
            };
        },

        _drawClear: function() {
            //d3.selectAll("svg").remove();
            d3.select(this.selector).select("svg").remove();
        },

        _drawGraph: function() {
            this.graph = {
                width: this.option.width,
                height: this.option.height,
                top: {
                    width: this.option.width,
                    height: this.option.topHeight,
                    x: 0,
                    y: 0
                },
                bottom: {
                    width: this.option.width,
                    height: this.option.bottomHeight,
                    x: 0,
                    y: this.option.height - this.option.bottomHeight
                },
                left: {
                    width: this.option.leftWidth,
                    height: this.option.height - this.option.topHeight - this.option.bottomHeight,
                    x: 0,
                    y: this.option.topHeight
                },
                right: {
                    width: this.option.rightWidth,
                    height: this.option.height - this.option.topHeight - this.option.bottomHeight,
                    x: this.option.width - this.option.rightWidth,
                    y: this.option.topHeight
                }
            };

            this.graph.AxisX = {
                //x: this.option.width * 0.05,
                x: this.graph.left.width,
                y: this.graph.bottom.y,
                //y: this.option.height * 0.9,
                width: this.graph.width - this.graph.left.width - this.graph.right.width,
                height: 40
            };

            this.graph.AxisY = {
                x: this.graph.left.width,
                y: this.graph.left.y,
                height: this.graph.left.height
            };

            //this.graph.x = this.option.width * 0.05;
            //this.graph.y = this.option.height * 0.9;
            //this.graph.xWidth = this.option.width * 0.9;

            var self = this;

            this._drawClear();

            this.svg = d3.select(this.selector).append("svg")
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr("width", this.graph.width)
                .attr("height", this.graph.height);

            this.svg.append("text")
                .attr("class", "title")
                .text(this.title)
                .attr("transform", `translate(${this.graph.top.width / 2 - 60}, ${this.graph.top.height / 2 - 30})`);

            this._drawLegend(this.svg);
            this._drawAxis(this.svg);
            this._drawLine(this.svg);
            this._drawPoint(this.svg);

            // 文本：下载图片
            this.svg.append('text')
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "#FF0000")
                .attr("x", 0)
                .attr("y", 25)
                .text("PNG")
                .on("click", function() {
                    //console.log("PNG:", self);//alert("下载图片");
                    self._downloadPNG(self);
                });
            this.svg.append('text')
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "#FF0000")
                .attr("x", 30)
                .attr("y", 25)
                .text("SVG")
                .on("click", function() {
                    self._downloadSVG(self);
                });
            this.svg.append('text')
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "#FF0000")
                .attr("x", 60)
                .attr("y", 25)
                .text("EMF")
                .on("click", function() {
                    self._downloadEMF(self);
                });

            /*
            d3.text("/d3/d3-v5.9.7/plugins/d3.hydrograph.css", {}).then(function (data) {
                //console.log("css:", data);
                self.svg.append("style").attr("type", "text/css").attr("media", "screen").text(data);
            });
            */
            if(self.node) {//node
                if(self.node.style) {
                    self.svg.append("style").attr("type", "text/css").attr("media", "screen").text(self.node.style);
                }
                if(self.node.response && self.node.document) {
                    self.node.response.statusCode = 200;
                    self.node.response.setHeader('Content-Type', 'image/svg+xml');
                    self.node.response.send(self.node.document.body.innerHTML);
                }
            } else {
                fetch("/d3/d3-v5.9.7/plugins/d3.hydrograph.css").then(function(response) {
                    return response.text();
                }).then(function(text) {
                    //console.log("css:", text);
                    self.svg.append("style").attr("type", "text/css").attr("media", "screen").text(text);
                }).catch(function(error) {
                    console.log(error);
                });
            }

        },

        _drawLegend: function(context) {
            var data = this.data;
            var x = this.graph.left.width;
            var y = this.graph.top.height - 40;
            var rectWidth = 80;
            var rectHeight = 20;

            context = context.append('g')
                .attr("class", "legend")
                .attr("transform", `translate(${x}, ${y})`);

            /*
            var physical = this.physical;
            physical.forEach(function (value, key) {
                if(key === "datetime") return;
                context.append();
            });
            */

            //只处理10根线
            var lines = data.ObservLineList;
            for(var i = 0, i_len = lines.length < 10 ? lines.length : 10; i < i_len; i++) {
                var line = lines[i];
                var unit = line.Unit;
                var pointId = line.PointId;
                var legend = this.legend[i];

                var x_legend = i * rectWidth + i * 5;
                var y_legend = rectHeight / 2;
                context.append("rect")
                    .attr("x", x_legend)
                    .attr("width", rectWidth)
                    .attr("height", rectHeight);

                context.append("text")
                    .text(pointId)
                    .attr("transform", `translate(${x_legend + 20}, ${y_legend - 15})`);
                context.append("text")
                    .text(unit)
                    .attr("transform", `translate(${x_legend + 20}, ${y_legend - 30})`);

                context.append("line")
                    .attr("x1", x_legend + 5)
                    .attr("y1", y_legend)
                    .attr("x2", x_legend + rectWidth - 5)
                    .attr("y2", y_legend)
                    .attr("stroke", legend.color);
                legend.draw(context, x_legend + 40, y_legend, 80);
            }

            /*
            this.legend[0].draw(this.svg, 50, 20);
            this.legend[1].draw(this.svg, 70, 20);
            this.legend[2].draw(this.svg, 90, 20);
            this.legend[3].draw(this.svg, 110, 20);
            this.legend[4].draw(this.svg, 130, 20);
            this.legend[5].draw(this.svg, 150, 20);
            this.legend[6].draw(this.svg, 170, 20);
            this.legend[7].draw(this.svg, 190, 20);
            this.legend[8].draw(this.svg, 210, 20);
            this.legend[9].draw(this.svg, 230, 20);
            */

        },

        _drawAxis: function(context) {
            var axis = context.append('g')
                .attr("class", "axis");
            this._drawAxisX(axis);
            this._drawAxisY(axis);
        },

        _drawAxisX: function (context) {
            var datetime = this.physical.get("datetime");
            var time_level = datetime.time_level;
            var time_group = datetime.time_group;

            var AxisX = this.graph.AxisX;
            var x = AxisX.x;
            var y = AxisX.y;
            var width = AxisX.width;
            var AxisY = this.graph.AxisY;

            var axisX = context.append('g')
                .attr("class", "x-axis")
                .attr("transform", `translate(${x},${y})`);
            var line1 = axisX.append("line")
                .attr("x2", width);
            var line2 = axisX.append("line")
                .attr("y1", 20)
                .attr("x2", width)
                .attr("y2", 20);
            var tick_group = axisX.append("g")
                .attr("class", 'tick-group')
                .attr("transform", `translate(0.5, 0)`);

            var ticks1_len = time_group.times1.length;
            var tick1_width = (width / ticks1_len).toFixed(2);
            var tick1_text = (tick1_width / 2).toFixed(2);

            var tick1 = tick_group.append("g")
                .attr("class", 'tick1');
            for(var i = 0; i < ticks1_len; i++) {
                var tick = tick1.append("g")
                    .attr("class", 'tick')
                    .attr("transform", `translate(${tick1_width * i}, 0)`);
                tick.append("line")
                    .attr("y2", 20);
                tick.append("text")
                    .text(time_group.times1[i])
                    .attr("transform", `translate(${tick1_text}, 14)`);
                if(i !== 0) {
                    //虚线X
                    tick.append("line")
                        .attr("stroke-dasharray", 2)
                        .attr("y2", -AxisY.height)
                        .style("opacity", 0.5);
                }
            }
            var t = tick1.append("g")
                .attr("class", 'tick')
                .attr("transform", `translate(${width - 1}, 0)`);
            t.append("line")
                .attr("y2", 20);

            //虚线X right
            t.append("line")
                .attr("stroke-dasharray", 2)
                .attr("y2", -AxisY.height)
                .style("opacity", 0.5);

            if(time_group.times2.length > 0) {
                var line3 = axisX.append("line")
                    .attr("y1", 40)
                    .attr("x2", width)
                    .attr("y2", 40);

                var tick2 = tick_group.append("g")
                    .attr("class", 'tick2')
                    .attr("transform", `translate(0, 20)`);
                tick2.append("g")
                    .attr("class", 'tick')
                    .append("line")
                    .attr("y2", 20);
                var ticks2_len = time_group.times2.length;
                var tick2_width = 0;
                var tick2_text = 0;
                for(var j = 0; j < ticks2_len; j++) {
                    var time2 = time_group.times2[j];
                    tick2_width += tick1_width * time2.len;
                    tick2_text = (tick1_width * time2.len / 2).toFixed(2);
                    var tick = tick2.append("g")
                        .attr("class", 'tick');
                    if(j === ticks2_len - 1) {
                        tick.attr("transform", `translate(${tick2_width - 1}, 0)`);
                    } else {
                        tick.attr("transform", `translate(${tick2_width}, 0)`);
                    }
                    tick.append("line")
                        .attr("y2", 20);
                    tick.append("text")
                        .text(time2.text)
                        .attr("transform", `translate(${-tick2_text}, 14)`);
                }
            }

            var scaleTime = d3.scaleTime()
                .domain([beautifyDatetime(datetime.min, "start", time_level), beautifyDatetime(datetime.max, "end", time_level, datetime.min)])
                .range([AxisX.x, AxisX.x + AxisX.width]);
            this.scale["datetime"] = scaleTime;

            //var a = scaleTime(datetime.min);
            //var b = scaleTime.invert(a);
            //console.log("a:", a, datetime.min, formatTime(datetime.min));
            //console.log("b:", b, a);
            //console.log("instanceof:", datetime.min instanceof Date);

            //axisX.call(scaleTime);
            //var xAxisTime = d3.axisBottom(scaleTime).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S")).ticks(7);
            //axisX.call(xAxisTime);
        },

        _drawAxisY: function (context) {
            var phys = this.physical;
            var phys_index = 0;

            var graph = this.graph;
            var AxisY = this.graph.AxisY;
            //var x = AxisY.x;
            //var y = AxisY.y;
            var height = AxisY.height;

            var scale = this.scale;
            var scaleMaster;

            //只处理4个物理量
            phys.forEach(function(value, key) {
                //console.log("phys-key:", key);
                if(key === "datetime") return;
                phys_index += 1;

                var yScale, yAxis;
                var x, y;

                //var diff = value.max - value.min;
                //var space = diff * 0.1;
                //var min = value.min - space;
                //var max = value.max + space;
                var min = value.min;
                var max = value.max;

                if(scaleMaster) {
                    yScale = scaleMaster.copy().domain([min, max]);//.nice()
                } else {
                    yScale = d3.scaleLinear()
                        .domain([min, max])
                        .range([AxisY.y + AxisY.height, AxisY.y]);//.nice()
                    scaleMaster = yScale;
                }
                scale[key] = yScale;

                if(phys_index === 1) {
                    x = AxisY.x;
                    y = AxisY.y;
                    yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(20)
                        //.ticks(7)
                        .tickValues(fun_scale(min, max)).tickFormat(d3.format(".2f"));
                    context.append('g')
                        .attr("class", "y-axis")
                        .attr("transform", `translate(${x}, ${-0.5})`)
                        .call(yAxis);
                    context.append('text')
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black")
                        .attr("x", x)
                        .attr("y", y-6)
                        .text(value.unit);
                } else if(phys_index === 2) {
                    x = graph.right.x;
                    y = AxisY.y;

                    yAxis = d3.axisRight(yScale)
                        .tickValues(fun_scale(min, max))
                        //.ticks(7) //刻度数量
                        .tickSize(0) //控制刻度的大小
                        .tickPadding(20) //设置标签数字与坐标轴的距离
                        .tickFormat(d3.format(".2f")); //设置标签数字的格式
                    context.append('g')
                        .attr("class", "y-axis-2")
                        .attr("transform", `translate(${x-1}, ${-0.5})`)
                        .call(yAxis);

                    context.append('text')
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black")
                        .attr("x", x)
                        .attr("y", y-6)
                        .text(value.unit);
                } else if(phys_index === 3) {
                    x = AxisY.x - 50;
                    y = AxisY.y;
                    yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(20)
                        //.ticks(7)
                        .tickValues(fun_scale(min, max)).tickFormat(d3.format(".2f"));
                    context.append('g')
                        .attr("class", "y-axis-3")
                        .attr("transform", `translate(${x}, ${-0.5})`)
                        .call(yAxis);
                    context.append('text')
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black")
                        .attr("x", x)
                        .attr("y", graph.bottom.y + 20)
                        .text(value.unit);
                } else if(phys_index === 4) {
                    x = graph.right.x + 50;
                    y = AxisY.y;

                    yAxis = d3.axisRight(yScale)
                        //.ticks(7)
                        .tickValues(fun_scale(min, max))
                        .tickSize(0) //控制刻度的大小
                        .tickPadding(20) //设置标签数字与坐标轴的距离
                        .tickFormat(d3.format(".2f")); //设置标签数字的格式
                    context.append('g')
                        .attr("class", "y-axis-4")
                        .attr("transform", `translate(${x-1}, ${-0.5})`)
                        .call(yAxis);

                    context.append('text')
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black")
                        .attr("x", x)
                        .attr("y", graph.bottom.y + 20)
                        .text(value.unit);
                }
            });

            //context.selectAll(".y-axis .tick line").remove();
            //context.selectAll(".y-axis-2 .tick line").remove();
            //context.selectAll(".y-axis-3 .tick line").remove();
            //context.selectAll(".y-axis-4 .tick line").remove();

            //虚线 Y
            context.selectAll(".y-axis .tick").append("line")
                .attr("stroke-dasharray", 2)
                .attr("x2", graph.AxisX.width)
                .style("opacity", 0.5);

            /*
            var yDataSet = [1010, 1050, 1100, 1150, 1190, 1245];
            var yScale = d3.scaleLinear()
                .domain([d3.min(yDataSet), d3.max(yDataSet)])
                .range([canvasHeight - padding.top - padding.bottom, 0]);
            var yAxis = d3.axisRight(yScale).tickValues(yDataSet);
            svg.append('g')
                .attr("class", "axis")
                .attr("transform", `translate(${canvasWidth - padding.right}, ${padding.top})`)
                .call(yAxis);
                */
        },

        _drawLine: function(context) {
            var data = this.data;
            var scale = this.scale;
            var scaleX = scale["datetime"];

            //只处理10根线
            var lines = data.ObservLineList;
            for(var i = 0, i_len = lines.length < 10 ? lines.length : 10; i < i_len; i++) {
                var line = lines[i];
                var points = line.ObservPointList;
                var unit = line.Unit;
                //var pointId = line.PointId;

                var scaleY = scale[unit];
                var legend = this.legend[i];
                var lineGenerator = null;

                if(points.length === 0) continue;//跳过没有数据的线

                //用闭包保存住当前循环的i的值。
                (function(scaleY){
                    lineGenerator = d3.line()
                        .x(function(d) {
                            //console.log(d.SuvDate, scaleX(parseTime(d.SuvDate)));
                            //console.log(d.SuvDate, parseTime(d.SuvDate), typeof parseTime(d.SuvDate));
                            return scaleX(parseTime(d.SuvDate));
                        })
                        .y(function(d) {
                            return scaleY(d.Value);
                        });
                })(scaleY);

                context.append('path')
                    //.attr('stroke-dasharray', '5,5')//虚线样式
                    .attr('stroke', legend.color)//线条颜色 gray DarkGray
                    .attr('stroke-width', 1)//线条宽度
                    .attr('fill', 'none')//是否填充区域
                    .attr('d', lineGenerator(points));

                //for(var j = 0, j_len = points.length; j < j_len; j++) {
                //}
            }
        },

        _drawPoint: function(context) {
            var data = this.data;
            var scale = this.scale;
            var scaleX = scale["datetime"];

            //只处理10根线
            var lines = data.ObservLineList;
            for(var i = 0, i_len = lines.length < 10 ? lines.length : 10; i < i_len; i++) {
                var line = lines[i];
                var points = line.ObservPointList;
                var unit = line.Unit;
                //var pointId = line.PointId;

                var scaleY = scale[unit];
                var legend = this.legend[i];

                var pointsLength = points.length;
                var pointsSpace = Math.floor(points.length / 10);
                var point, j, x, y;
                if(pointsLength <= 12) {
                    //显示所有的点
                    for(j = 0; j < pointsLength; j++) {
                        point = points[j];
                        x = scaleX(parseTime(point.SuvDate));
                        y = scaleY(point.Value);
                        legend.draw(context, x, y);
                    }
                } else {
                    //显示12个点
                    for(j = 1; j <= 10; j++) {
                        if(pointsLength === (j * pointsSpace)) {
                            //能整除的情况，最后一个点会重合，如：20，300
                            point = points[j * pointsSpace - Math.floor(pointsSpace / 2)];
                        } else {
                            point = points[j * pointsSpace];
                        }
                        x = scaleX(parseTime(point.SuvDate));
                        y = scaleY(point.Value);
                        legend.draw(context, x, y);
                    }
                    legend.draw(context, scaleX(parseTime(points[0].SuvDate)), scaleY(points[0].Value));//第一个点
                    legend.draw(context, scaleX(parseTime(points[pointsLength - 1].SuvDate)), scaleY(points[pointsLength - 1].Value));//最后一个点
                }

                /*
                    .on('mouseover', function(a) {
                                    console.log("mouseover:", a);
                                })
                                .on('mouseout', function(a) {
                                    console.log("mouseout:", a);
                                });
                */
            }
        },

        //png
        _downloadPNG: function(self) {
            var serializer = new XMLSerializer();
            var source = serializer.serializeToString(self.svg.node());//console.log(source);

            //var css = '<?xml-stylesheet type="text/css" href="d3.hydrograph.css"?>\r\n';

            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            //document.write('<img src="' + url + '"/>');//输出svg图像,会覆盖源html文档页面

            var root = document.getElementById(self.selector.substr(1));
            var img = document.getElementById("download_image");
            if(img) {
                img.src = url;//重复下载时刷新图片
            } else {
                img = document.createElement("img");
                img.style.display = "none";//不显示图片
                img.id = "download_image";
                img.src = url;
                root.appendChild(img);//可以重复添加
            }

            var canvas = document.createElement("canvas");
            canvas.width = self.graph.width;
            canvas.height = self.graph.height;

            var context = canvas.getContext("2d");
            context.fillStyle = "#FFFFFF";//必须先设置背景色
            context.fillRect(0, 0, canvas.width, canvas.height);//然后再设置背景大小

            var image = new Image;
            image.src = document.getElementsByTagName('img')[0].src;
            image.onload = function() {
                context.drawImage(image, 0, 0);//再绘制svg图
                var a = document.createElement("a");//console.log(a);
                //a.target = "_blank";
                a.download = self.title + ".png";
                a.href = canvas.toDataURL("image/png");//获取图片合并后的data-URL,参数可选图片格式，图片质量，详自查API
                a.click();
                //canvas.style.display = "none";
            };
        },

        //svg
        _downloadSVG: function(self) {
            fetch("http://127.0.0.1:8888/hydrograph", self.option.request).then(function(response) {
                return response.blob();
            }).then(function(blob) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(blob);   // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
                //var filename = res.headers.get('Content-Disposition');
                a.href = url;
                //a.download = filename;
                a.download = self.title + ".svg";
                a.click();
                window.URL.revokeObjectURL(url);
            }).catch(function(error) {
                console.log(error);
            });
        },

        //emf
        _downloadEMF: function(self) {
            fetch("/api/image/hydrograph", self.option.request).then(function(response) {
                return response.blob();
            }).then(function(blob) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(blob);   // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上)
                //var filename = res.headers.get('Content-Disposition');
                a.href = url;
                //a.download = filename;
                a.download = self.title + ".emf";
                a.click();
                window.URL.revokeObjectURL(url);
            }).catch(function(error) {
                console.log(error);
            });
        }

    };

    // Deep Clone merge
    hydrograph.extend = hydrograph.fn.extend = function (target, source) {
        for (var key in source) {
            target[key] = target[key] && target[key].toString() === "[object Object]" ? hydrograph.extend(target[key], source[key]) : target[key] = source[key];
        }
        return target;
    };

    var init = hydrograph.fn.init = function (selector, node) {
        if (!selector) {
            return this;
        }

        this.selector = selector; //选择器
        this.node = node; //nodejs

        //this.option = Object.assign({}, defaultOptions); //浅拷贝合并
        //this.option = JSON.parse(JSON.stringify(defaultOptions)); //参数选项
        this.option = hydrograph.extend({}, defaultOptions); //参数选项

        this.physical = new Map(); //物理量 不使用 Object
        this.scale = {}; //比例尺
        this.legend = []; //图例
        this.graph = null; //图形坐标、宽高信息
        this.data = null; //数据集
        this.title = "过程线"; //标题
        this.svg = null; //svg 对象
    };

    init.prototype = hydrograph.fn;

    window.hydrograph = d3.hydrograph = hydrograph;

    //Object.defineProperty(exports, '__esModule', { value: true });//es6
    //exports.version = version;

    return hydrograph;
})));
