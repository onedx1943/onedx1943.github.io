export default {
    data: function () {
        return {
            msg: '',
        }
    },
    template: `
        <div class="page-container">
            <page-header></page-header>
            <div class="page-app">
                <div class="app-container">
                    <page-sidebar>
                        <div>这是App列表</div>
                        <div class="app-sidebar-menu">
                            <div><router-link to="/app/icon">Icon</router-link></div>
                            <div><router-link to="/app/novel">Novels</router-link></div>
                            <div><router-link to="/app/music">Music</router-link></div>
                            <div><router-link to="/app/test">Test</router-link></div>
                        </div>
                    </page-sidebar>
                    <div class="app-item-content">
                        <router-view></router-view>
                    </div>
                </div>
            </div>
        </div>
    `,
    created: function () {

    },
    mounted: function () {

    },
    methods: {

    }
}