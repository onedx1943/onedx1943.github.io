$(function () {

    let load_icons = function () {
        // 获取所有的css文件并筛选出font awesome对应的文件
        let css_files = document.styleSheets;
        for (let css_file of css_files) {
            if (css_file.href.includes('font-awesome.min.css')) {
                console.log(css_file);
                //let data = css_file.cssRules;
                let data = css_file.rules;
                console.log(data);
            }
        }
        console.log(123);
    };

    load_icons();
});