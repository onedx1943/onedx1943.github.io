export default {
    data: function () {
        return {
            msg: '',
            activeMenu: null,
        }
    },

    created: function () {
        this.activeMenu = this.$router.currentRoute.fullPath;
    },

    mounted: function () {
        $(".app-item-content").on("click", function () {
            $(".page-sidebar").toggleClass("open", false);
        });
    },

    methods: {
        menuItemSelect (key, keyPath) {
            $(".page-sidebar").toggleClass("open", false);
        },
    },

    template: `
        <div class="page-container">
            <page-header></page-header>
            <div class="page-app">
                <div class="app-container">
                    <page-sidebar>
                        <el-menu :default-active="activeMenu" class="app-container-menu" @select="menuItemSelect" router="true">
                            <el-menu-item index="/app/icon">
                                <i class="el-icon-sugar"></i>
                                <span slot="title">Icon</span>
                            </el-menu-item>
                            <el-menu-item index="/app/novel">
                                <i class="el-icon-reading"></i>
                                <span slot="title">Novels</span>
                            </el-menu-item>
                            <el-menu-item index="/app/music">
                                <i class="el-icon-headset"></i>
                                <span slot="title">Music</span>
                            </el-menu-item>
                            <el-menu-item index="/app/video">
                                <i class="el-icon-monitor"></i>
                                <span slot="title">Video</span>
                            </el-menu-item>
                            <el-menu-item index="/app/work-hour">
                                <i class="el-icon-date"></i>
                                <span slot="title">Work Hour</span>
                            </el-menu-item>
                        </el-menu>
                    </page-sidebar>
                    <div class="app-item-content">
                        <router-view></router-view>
                    </div>
                </div>
                <el-backtop target=".app-container" :visibility-height="1000"></el-backtop>
            </div>
        </div>
    `,

}