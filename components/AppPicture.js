export default {
    data: function () {
        return {
            picture_list: [],
            picture_show: [],
            custom_api: 'https://api.github.com/repos/onedx1943/Picture/contents',
            filterText: '',
            loading: false,
            gifUrl: "https://raw.githubusercontent.com/onedx1943/Picture/master/png/sticker87.png"
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
                    if (response.data[i].type === 'file' && (response.data[i].name.endsWith('.gif') || response.data[i].name.endsWith('.png'))) {
                        if (response.data[i].name.endsWith('.gif')) {
                            _this.picture_list.push({
                                show_url: response.data[i].download_url.substring(0, response.data[i].download_url.lastIndexOf(".")) + '.jpg',
                                id: response.data[i].sha,
                                name: response.data[i].name,
                                preview_url: response.data[i].download_url.substring(0, response.data[i].download_url.lastIndexOf(".")) + '.mp4',
                                download_url: response.data[i].download_url,
                                is_gif: true
                            });
                        } else {
                            _this.picture_list.push({
                                show_url: response.data[i].download_url,
                                id: response.data[i].sha,
                                name: response.data[i].name,
                                preview_url: response.data[i].download_url,
                                download_url: response.data[i].download_url,
                                is_gif: false
                            });
                        }

                    } else if (response.data[i].type === 'dir') {
                        _this.loadData(response.data[i].url);
                    }
                }
            }).catch(function (error) {
                _this.$notify({
                    type: 'error',
                    title: '??????',
                    message: 'API????????????????????????',
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
                    title: '??????',
                    message: '??????????????????: ' + remaining + '/' + limit + '?????????',
                    offset: 60
                })
            }
        },

        loadCustomApi: function () {
            // ?????????????????????
            let reg = new RegExp(this.GLOBAL.apiReg, 'i');
            this.picture_list = [];
            if (reg.test(this.custom_api)) {
                this.loadData(this.custom_api);
            } else {
                this.$notify({
                    type: 'error',
                    title: '??????',
                    message: '???????????????https://api.github.com/repos/?????????/?????????/contents??????????????????????????????????????? /xxx/xxx???',
                    offset: 60
                });
            }
        }
    },

    template: `
        <div>
            <div class="novel-custom">
                <el-input placeholder="???????????????" v-model="custom_api">
                    <template slot="prepend">?????????github????????????</template>
                    <el-button slot="append" icon="el-icon-search" @click="loadCustomApi"></el-button>
                </el-input>
            </div>
            <div class="novel-list">
                <el-input
                    placeholder="???????????????????????????"
                    v-model="filterText">
                </el-input>
                <div class="demo-image__lazy custom-picture-list scroll-container">
                    <el-image 
                        v-for="item in picture_show" 
                        :key="item.id" 
                        :src="item.show_url"
                        :preview-src-list="[item.download_url]"
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