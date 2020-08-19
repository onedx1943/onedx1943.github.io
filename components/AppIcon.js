export default {
    data: function () {
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
        return {
            icon_list: icon_list,
            icon_msg: '似乎没找到css文件 (ノへ￣、)',
        }
    },
    template: `
        <div class="icons-list" v-if="icon_list.length > 0">
            <div class="icon-content" v-for="icon in icon_list" :key="icon" @click="copyIconName(icon)">
                <i class="fa" :class="icon"></i>
                <span>{{ icon }}</span>
            </div>
        </div>
        <div class="icons-msg" v-else>
            {{ icon_msg }}
        </div>
    `,
    methods: {
        copyIconName: function (name) {
            let input = document.createElement("input");
            input.setAttribute('display', 'none');
            document.body.appendChild(input);
            input.setAttribute('value', name);
            input.select();
            if (document.execCommand('copy')) {
                document.execCommand('copy');
            }
            document.body.removeChild(input);
        }
    },
}