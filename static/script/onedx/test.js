// .*[第]{1,2}[0-9零○一二两三四五六七八九十百千廿卅卌壹贰叁肆伍陆柒捌玖拾佰仟万１２３４５６７８９０]{1,5}[章节節堂讲回集部分品]{1,2}.*

let TestChart = (function () {
    let time_axis = echarts.init(document.getElementById('time-axis'));
    let chart1 = echarts.init(document.getElementById('chart1'));
    let chart2 = echarts.init(document.getElementById('chart2'));

    let _init = function () {
        get_trace_data();
    };

    let get_trace_data = function () {
        // 如何快速创建数组
        // [...(new Array(10)).keys()];
        // Array.from({length: 10},(v, k) => k);
        // (Array.from({length:n})).map((v,k) => k)
        let chart_data1 = {
            'name': 'chart1',
            'time': [...(new Array(100)).keys()],
            'value': Array.from({length: 100},(v, k) => Math.round(Math.random() * (999 + 1)))
        };
        let chart_data2 = {
            'name': 'chart2',
            'time': [...(new Array(100)).keys()],
            'value': Array.from({length: 100},(v, k) => Math.round(Math.random() * (999 + 1)))
        };
        load_time_axis(time_axis, chart_data1);
        load_chart(chart1, chart_data1);
        load_chart(chart2, chart_data2);
        echarts.connect([time_axis, chart1, chart2]);
    };

    let load_time_axis = function (chart, data) {
        let option = {
            dataZoom: {
                type: 'slider',
                filterMode: 'none', // empty none
                minValueSpan: 3
            },
            xAxis: {
                show: true,
                type: 'category', // time
                data: data.time
            },
            yAxis: {
                show: false,
                // type: 'value',
                // inverse: true
            },
            series: [{
                // data: data.value,
                type: 'line'
            }]
        };
        chart.setOption(option);
    };

    let load_chart = function (chart, data) {
        let option = {
            title: {
                text: data.name,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                // formatter: 'name: {b}<br />value: {c}'
                formatter: function (params) {
                    return data.name + '<br />name: ' + params[0].name + '<br />value: ' + params[0].value;
                }
            },
            dataZoom: {
                type: 'inside',
                filterMode: 'none', // empty none
                minValueSpan: 3
            },
            xAxis: {
                show: false,
                type: 'category',
                data: data.time
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: data.value,
                type: 'line'
            }]
        };
        chart.setOption(option);
    };

    return {
        init: _init,
    }
})();
TestChart.init();