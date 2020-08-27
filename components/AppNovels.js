export default {
    filters: {
        chapter: function (value) {
            if (value === 0) {
                return ''
            }
            return '第' + value + '页';
        }
    },

    data: function () {
        return {
            activeNames: ['1', '2'],
            novel_api: 'https://api.github.com/repos/onedx1943/Files/contents',
            novel_list: [],
            novel_msg: '正在读取文件...',
            novel_name: '',
            novel_chapter: [],
            novel_content: [],
            novel_page: 0,
            font_size: '18.7px',
            font_size_options: [
                {value: '56px', label: '初号'},
                {value: '48px', label: '小初'},
                {value: '34.7px', label: '一号'},
                {value: '32px', label: '小一'},
                {value: '29.3px', label: '二号'},
                {value: '24px', label: '小二'},
                {value: '21.3px', label: '三号'},
                {value: '20px', label: '小三'},
                {value: '18.7px', label: '四号'},
                {value: '16px', label: '小四'},
                {value: '14px', label: '五号'},
                {value: '12px', label: '小五'},
                {value: '10px', label: '六号'},
                {value: '8.7px', label: '小六'},
                {value: '7.3px', label: '七号'},
                {value: '6.7px', label: '八号'},
            ],
            font_family: 'Microsoft YaHei',
            bg_color: '#f5edd4',
            predefine_bg_colors: [
                '#ffffff',
                '#f9f6ed',
                '#f5edd4',
                '#e6f3e9',
                '#e7f4f5',
                '#f5e8e7',
                '#e3e5e3',
                '#181a1b'
            ],
            color: '#262626',
            predefine_colors: [
                '#262626',
                '#666',
            ],
            width: 1100,
            height: 600,
            custom_api: 'https://api.github.com/repos/onedx1943/Files/contents',
        }
    },

    mounted: function () {
        this.getNovelList(this.novel_api);
    },

    methods: {
        getNovelList: function (file_api) {
            let _this = this;
            _this.novel_msg = '别着急，正在查找txt文件！';
            _this.novel_page = 0;
            axios.get(file_api)
                .then(function (response) {
                    _this.limitNotification(response.headers);
                    for(let i = 0; i < response.data.length; i++){
                        if (response.data[i].name.endsWith('.txt')) {
                            _this.novel_list.push(response.data[i])
                        } else if (response.data[i].type === 'dir') {
                            let new_url = file_api + '/' + response.data[i].name;
                            _this.getNovelList(new_url);
                        }
                    }
                })
                .catch(function (error) {
                    _this.novel_msg = '网络或者链接有问题啊，读取失败了！';
                    console.log(error);
                });
        },

        getNovelContent: function (event, novel_url) {
            let _this = this;
            $('.novel-list .active-novel').removeClass('active-novel');
            $(event.currentTarget).addClass('active-novel');
            _this.novel_name = $(event.currentTarget).text();
            _this.novel_chapter = [''];
            _this.novel_content = ['正在读取...'];
            _this.novel_page = 1;
            axios.get(novel_url)
                .then(function (response) {
                    _this.limitNotification(response.headers);
                    if (response.data == '') {
                        _this.novel_content = ['该文件内容为空，还是看看别的吧'];
                        return
                    }
                    let reg = /.*[第]{1,2}[0-9零○一二两三四五六七八九十百千廿卅卌壹贰叁肆伍陆柒捌玖拾佰仟万１２３４５６７８９０]{1,5}[章节節堂讲回集部分品]{1,2}.*/g;
                    let chapter = response.data.match(reg);
                    if (chapter) {
                        chapter.unshift('');
                    } else {
                        chapter = [''];
                        if (response.data.length > 1024 * 1024) {
                            _this.novel_content = ['没找到章节名，而且内容还挺大，是不是文件编码有问题'];
                            return
                        }
                    }
                    _this.novel_chapter = chapter;
                    _this.novel_content = response.data.split(reg);
                    _this.novel_page = 1;
                    _this.getChapterFromSession();
                })
                .catch(function (error) {
                    console.log(error);
                    _this.novel_content = ['取文件失败喽！'];
                });
        },

        limitNotification: function (headers) {
            let limit = headers['x-ratelimit-limit'];
            let remaining = headers['x-ratelimit-remaining'];
            if (parseInt(remaining) / parseInt(limit) > 0.6) {
                this.$notify({
                    type: 'warning',
                    title: '警告',
                    message: '请求速率限制: ' + remaining + '/' + limit + '每小时',
                    offset: 60
                })
            }
        },

        handleCurrentChange(val) {
            this.saveToSession();
        },

        getChapterFromSession: function () {
            if (this.novel_name === '') {
                return
            }
            let num = sessionStorage.getItem(this.novel_name);
            if(num) {
                this.novel_page = num;
            }
        },

        saveToSession: function () {
            if (this.novel_name === '') {
                return
            }
            $('.novel_content pre').animate({scrollTop: 0});
            sessionStorage.setItem(this.novel_name, this.novel_page);
        },

        loadCustomApi: function () {
            // 检测链接合法性
            let reg = new RegExp("^https://api.github.com/repos/[0-9a-z_!~*'().&=+$%-]+/[0-9a-z_!~*'().&=+$%-]+/contents(/[0-9a-z_!~*'().&=+$%-]+)*$", 'i');
            // 清空原有的txt，并重新加载列表
            this.novel_name = '';
            this.novel_chapter = [];
            this.novel_content = [];
            this.novel_page = 0;
            this.novel_list = [];
            if (reg.test(this.custom_api)) {
                this.getNovelList(this.custom_api);
            } else {
                this.novel_msg = '别瞎填链接~';
                this.novel_page = 1;
                this.novel_chapter = [''];
                this.novel_content = ['链接格式：https://api.github.com/repos/用户名/仓库名/contents（仓库内具体路径可以接着加 /xxx/xxx）'];
            }
        }
    },

    template: `
        <div>
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template slot="title">
                        <i class="fa fa-tasks"></i>
                    </template>
                    <div>
                        <div class="novel-custom">
                            <el-input placeholder="请输入内容" v-model="custom_api">
                                <template slot="prepend">自定义github仓库地址</template>
                                <el-button slot="append" icon="el-icon-search" @click="loadCustomApi"></el-button>
                            </el-input>
                        </div>
                        <div class="novel-header">
                            <div class="novel-list" v-if="novel_list.length > 0">
                                <div v-for="novel in novel_list" :key="novel.name" @click="getNovelContent($event, novel.download_url)">{{ novel.name }}  ( {{ (novel.size / 1024 / 1024).toFixed(2) + 'M' }} )</div>
                            </div>
                            <div class="novel-list" v-else>{{ novel_msg }}</div>
                            <div class="novel-setting">
                                <div>字体大小: 
                                    <el-select v-model="font_size" placeholder="请选择"
                                        size="small">
                                        <el-option
                                            v-for="item in font_size_options"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                        </el-option>
                                    </el-select>
                                </div>
                                <div>字体类型: 
                                    <div>
                                        <el-radio-group v-model="font_family" size="small">
                                            <el-radio-button label="SimSun">宋体</el-radio-button>
                                            <el-radio-button label="Microsoft YaHei">雅黑</el-radio-button>
                                            <el-radio-button label="KaiTi">楷体</el-radio-button>
                                            <el-radio-button label="STXingkai">行楷</el-radio-button>
                                        </el-radio-group>
                                    </div>
                                </div>
                                <div>背景颜色: 
                                    <el-color-picker
                                        v-model="bg_color"
                                        show-alpha
                                        :predefine="predefine_bg_colors"
                                        size="small">
                                    </el-color-picker>
                                </div>
                                <div>文字颜色: 
                                    <el-color-picker
                                        v-model="color"
                                        show-alpha
                                        :predefine="predefine_colors"
                                        size="small">
                                    </el-color-picker>
                                </div>
                                <div>内容宽度: 
                                    <el-input-number 
                                        v-model="width" 
                                        controls="false"
                                        size="small"
                                        :min="0" 
                                        :max="1400">      
                                    </el-input-number>
                                </div>
                                <div>内容高度: 
                                    <el-input-number 
                                        v-model="height" 
                                        controls="false"
                                        size="small"
                                        :min="0" 
                                        :max="1400">      
                                    </el-input-number>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-collapse-item>
                <el-collapse-item name="2">
                    <template slot="title">
                        <i class="fa fa-bookmark"></i>
                    </template>
                    <div class="novel-container">
                        <div v-if="novel_page > 0 && novel_page <= novel_chapter.length">
                            <el-pagination 
                                background
                                @current-change="handleCurrentChange"
                                :current-page.sync="novel_page"
                                :page-size="1"
                                layout="prev, pager, next, jumper, ->, total"
                                :total="novel_chapter.length"
                                :hide-on-single-page="true">
                            </el-pagination>
                        </div>
                        <div v-else-if="novel_chapter.length > 0">
                            <button @click="novel_page=1"><i class="fa fa-rotate-right"></i></button>
                        </div>
                        <div class="novel_chapter">{{ novel_chapter[novel_page - 1] }}</div>
                        <div class="novel_content">
                            <pre :style="{'font-size': font_size, 'font-family': font_family, 'background-color': bg_color, 'color': color, 'width': width + 'px', 'max-height': height + 'px'}">{{ novel_content[novel_page - 1] }}</pre>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
    `,
}