// 定义一个名为 page-header 的新组件
Vue.component('page-header', {
    data: function () {
        return {
            github_url: 'https://github.com/onedx1943/onedx1943.github.io',
        }
    },

    methods: {
        switchSidebar: function () {
            $(".page-sidebar").toggleClass("open");
        },
    },

    template: `
        <div class="page-header">
            <div class="menu-button"><i class="fa fa-navicon" @click="switchSidebar()"></i></div>
            <div class="header-container">
                <div class="header-container-button"><router-link to="/">Home</router-link></div>
                <div class="header-container-button"><a :href="github_url" target="_blank"><i class="fa fa-github"></i> GitHub</a></div>
            </div>
        </div>
    `,

});
// page-sidebar 插槽
Vue.component('page-sidebar', {
    mounted: function () {
        $(".page-sidebar").on("click","a",function () {
            $(".page-sidebar").toggleClass("open", false);
        })
    },

    template: `
        <div class="page-sidebar">
            <div class="page-sidebar-inner">
                <slot></slot>
            </div>
        </div>
    `,
});