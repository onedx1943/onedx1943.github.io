// 定义一个名为 page-header 的新组件
Vue.component('page-header', {
    data: function () {
        return {
            github_url: 'https://github.com/onedx1943/onedx1943.github.io',
        }
    },
    template: `
        <div class="page-header">
            <div class="header-container">
                <div class="header-container-button"><router-link to="/">Home</router-link></div>
                <div class="header-container-button"><a :href="github_url" target="_blank"><i class="fa fa-github"></i>GitHub</a></div>
            </div>
        </div>
        
    `
});