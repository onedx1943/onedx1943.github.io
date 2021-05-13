export default {
    data: function () {
        return {
            picture_list: [],
            picture_show: [],
            custom_api: 'https://api.github.com/repos/onedx1943/Picture/contents',
            filterText: '',
            loading: false,
        }
    },

    watch: {
        filterText: function (val) {
            this.picture_show = this.picture_list.filter(item => item.name.includes(this.filterText))
        },
        picture_list: function (val) {
            this.picture_show = this.picture_list.filter(item => item.name.includes(this.filterText))
        }
    },

    created: function () {
        this.loadData(this.custom_api);
    },

    methods: {
        loadData: function (url) {
            let _this = this;
            axios.get(url, {
                headers: {
                    'Authorization': this.GLOBAL.token
                }
            }).then(function (response) {
                _this.limitNotification(response.headers);
                let data = [];
                for(let i = 0; i < response.data.length; i++){
                    if (response.data[i].name.endsWith('.gif') || response.data[i].name.endsWith('.png')) {
                        _this.picture_list.push({
                            url: response.data[i].download_url,
                            id: response.data[i].sha,
                            name: response.data[i].name
                        });
                    } else if (response.data[i].type === 'dir') {
                        _this.loadData(response.data[i].url);
                    }
                }
            }).catch(function (error) {
                _this.$notify({
                    type: 'error',
                    title: '错误',
                    message: 'API访问失败，请检查',
                    offset: 60
                });
                console.log(error);
            });
        },

        limitNotification: function (headers) {
            let limit = headers['x-ratelimit-limit'];
            let remaining = headers['x-ratelimit-remaining'];
            if (parseInt(remaining) / parseInt(limit) < 0.4) {
                this.$notify({
                    type: 'warning',
                    title: '警告',
                    message: '请求速率限制: ' + remaining + '/' + limit + '每小时',
                    offset: 60
                })
            }
        },

        loadCustomApi: function () {
            // 检测链接合法性
            let reg = new RegExp(this.GLOBAL.apiReg, 'i');
            this.picture_list = [];
            if (reg.test(this.custom_api)) {
                this.loadData(this.custom_api);
            } else {
                this.$notify({
                    type: 'error',
                    title: '提示',
                    message: '链接格式：https://api.github.com/repos/用户名/仓库名/contents（仓库内具体路径可以接着加 /xxx/xxx）',
                    offset: 60
                });
            }
        }
    },

    template: `
        <div>
            <div class="novel-custom">
                <el-input placeholder="请输入内容" v-model="custom_api">
                    <template slot="prepend">自定义github仓库地址</template>
                    <el-button slot="append" icon="el-icon-search" @click="loadCustomApi"></el-button>
                </el-input>
            </div>
            <div class="novel-list">
                <el-input
                    placeholder="输入关键字进行过滤"
                    v-model="filterText">
                </el-input>
                <div class="demo-image__lazy custom-picture-list scroll-container">
                    <el-image 
                        v-for="item in picture_show" 
                        :key="item.id" 
                        :src="item.url"
                        :preview-src-list="[item.url]"
                        style="width: 200px; height: 200px"
                        fit="scale-down"
                        lazy>
                        <div slot="placeholder" class="image-slot">
                            <i class="el-icon-picture-outline"></i>
                        </div>
                    </el-image>
                </div>
            </div>
        </div>
    `,
}