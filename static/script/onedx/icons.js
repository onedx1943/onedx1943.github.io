$(function () {

    let load_icons = function () {
        // 获取所有的css文件并筛选出font awesome对应的文件
        let css_files = document.styleSheets;
        let icon_html = '';
        for (let css_file of css_files) {
            if (css_file.href.includes('font-awesome.min.css')) {
                let rules = css_file.cssRules;
                for (let rule of rules) {
                    if (rule.selectorText && rule.selectorText.endsWith('::before')) {
                        let name = rule.selectorText.slice(1, rule.selectorText.indexOf('::'));
                        icon_html += '<div class="icon-content"><i class="fa ' + name + '"></i><span>' + name + '</span></div>';
                    }
                }
            }
        }
        $('#icons_list').html(icon_html);
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