export default {
    data: function () {
        return {
            msg: '欢迎来到 App 首页',
        }
    },
    template: `
        <div>
            {{ msg }}
            <div class="app-index">
                <el-card shadow="hover">
                    Icon
                </el-card>
                <el-card shadow="hover">
                    Novels
                </el-card>
                <el-card shadow="hover">
                    Music
                </el-card>
                <el-card shadow="hover">
                    Video
                </el-card>
            </div>
        </div>
    `
}