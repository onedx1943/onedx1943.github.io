export default {
    data: function () {
        return {
            apps: [
                {name: 'Icon', link: '/app/icon'},
                {name: 'Novels', link: '/app/novel'},
                {name: 'Music', link: '/app/music'},
                {name: 'Video', link: '/app/video'},
                {name: 'Work Hour', link: '/app/work-hour'},
            ],
            msg: '欢迎来到 App 首页',
        }
    },

    methods: {
        toPage: function (link) {
            this.$router.push(link)
        }
    },

    template: `
        <div>
            {{ msg }}
            <div class="app-index">
                <el-card v-for="app in apps" :key="app.name" shadow="hover" :body-style="{ padding: '0px' }">
                    <div @click="toPage(app.link)" class="app-card">{{ app.name }}</div>
                </el-card>
            </div>
        </div>
    `
}