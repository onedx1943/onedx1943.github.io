$(function () {

    let load_icons = function () {
        // 获取所有的css文件并筛选出font awesome对应的文件
        let css_files = document.styleSheets;
        let icon_list = [];
        for (let css_file of css_files) {
            if (css_file.href.includes('font-awesome.min.css')) {
                let rules = css_file.cssRules;
                for (let rule of rules) {
                    if (rule.selectorText && rule.selectorText.endsWith('::before')) {
                        icon_list.push(rule.selectorText.slice(1, rule.selectorText.indexOf('::')));
                    }
                }
            }
        }
        $('#icons_content').html(_.template($('#icon_item_template').html())({data: icon_list}));
    };

    load_icons();

    $('#icons_list').on('click', '.icon-content', function () {
        let input = document.createElement("input");
        input.setAttribute('display', 'none');
        document.body.appendChild(input);
        input.setAttribute('value', $(this).find('span').text());
        input.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        document.body.removeChild(input);
    })
});