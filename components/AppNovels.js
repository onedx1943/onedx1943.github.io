export default {
    filters: {
        chapter: function (value) {
            if (value === 0) {
                return ''
            }
            return '第' + value + '页';
        },

        interceptStr: function (value) {
            return (value || '').replaceAll("\r|\n", "").trim().slice(0, 25);
        }
    },

    data: function () {
        return {
            activeNames: ['1', '2'],
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
            bg_color: '#ffffff',
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
            width: 1060,
            height: 600,
            max_width: 1060,
            custom_api: 'https://api.github.com/repos/onedx1943/Files/contents',
            filterText: '',
            defaultProps: {
                children: 'children',
                label: 'label',
                isLeaf: 'isLeaf'
            },
            node_had: undefined,
            resolve_had : undefined,
            loading: false,
            dialogVisible: false,
        }
    },

    watch: {
        filterText: function (val) {
            this.$refs.tree.filter(val.toLowerCase());
        },
        width: function (val) {
            let novel_content = document.getElementsByClassName('novel_content')[0];
            if (novel_content) {
                this.max_width = novel_content.offsetWidth - 40;
            }
        }
    },

    mounted: function () {
        const _this = this;
        let novel_content = document.getElementsByClassName('novel_content')[0];
        if (novel_content) {
            _this.max_width = novel_content.offsetWidth - 40;
        }
        window.onresize = () => {
            return (() => {
                let novel_content = document.getElementsByClassName('novel_content')[0];
                if (novel_content) {
                    _this.max_width = novel_content.offsetWidth - 40;
                }
            })()
        }
    },

    methods: {
        loadNode: function (node, resolve) {
            if (node.level === 0 || !node.data.isLeaf) {
                let _this = this;

                let url = '';
                if (node.level === 0) {
                    url = _this.custom_api;
                    _this.node_had = node;
                    _this.resolve_had = resolve;
                } else {
                    url = node.data.url;
                }
                axios.get(url, {
                    headers: {
                        'Authorization': this.GLOBAL.token
                    }
                }).then(function (response) {
                    _this.limitNotification(response.headers);
                    let data = [];
                    for(let i = 0; i < response.data.length; i++){
                        if (response.data[i].name.endsWith('.txt')) {
                            data.push({
                                label: response.data[i].name + ' (' + (response.data[i].size / 1024 / 1024).toFixed(2) + 'M' + ')',
                                isLeaf: true,
                                url: response.data[i].download_url,
                                id: response.data[i].sha,
                                name: response.data[i].name
                            });
                        } else if (response.data[i].type === 'dir') {
                            data.push({
                                label: response.data[i].name,
                                isLeaf: false,
                                url: response.data[i].url,
                                id: response.data[i].sha,
                                name: response.data[i].name
                            });
                        }
                    }
                    return resolve(data);
                }).catch(function (error) {
                    _this.$notify({
                        type: 'error',
                        title: '错误',
                        message: 'API访问失败，请检查',
                        offset: 60
                    });
                    console.log(error);
                });
            } else {
                return resolve([]);
            }
        },

        clearTree: function () {
            if (this.node_had) {
                this.node_had.childNodes = [];
                this.loadNode(this.node_had, this.resolve_had);
            }
        },

        filterNode: function (value, data) {
            if (!value) return true;
            return data.label.toLowerCase().indexOf(value) !== -1;
        },

        handleNodeClick: function (data) {
            if (this.loading) {
                return this.$notify({
                    type: 'info',
                    title: '提示',
                    message: '请等待当前文件加载完成~',
                    offset: 60
                });
            }
            if (data.isLeaf) {
                let _this = this;
                // $('.novel-list .active-novel').removeClass('active-novel');
                // $(event.currentTarget).addClass('active-novel');
                _this.loading = true;
                _this.novel_name = data.name;
                _this.novel_chapter = ['提示：'];
                _this.novel_content = ['正在读取...'];
                _this.novel_page = 1;
                axios.get(data.url).then(function (response) {
                    if (response.data === '') {
                        _this.novel_content = ['该文件内容为空，还是看看别的吧'];
                        _this.loading = false;
                        return
                    }
                    let reg = /\n\s*[第]{1,2}[0-9零○一二两三四五六七八九十百千廿卅卌壹贰叁肆伍陆柒捌玖拾佰仟万１２３４５６７８９０]{1,5}[章节節堂讲回集部分品]{1,2}.*/g;
                    let chapter = response.data.match(reg);
                    if (chapter) {
                        chapter.unshift(_this.novel_name);
                    } else {
                        chapter = [_this.novel_name];
                        if (response.data.length > 1024 * 1024) {
                            _this.novel_content = ['没找到章节名，而且内容还挺大，是不是文件编码有问题'];
                            _this.loading = false;
                            return
                        }
                    }
                    _this.novel_chapter = chapter;
                    _this.novel_content = response.data.split(reg);
                    _this.novel_page = 1;
                    _this.getChapterFromSession();
                    _this.loading = false;
                }).catch(function (error) {
                    console.log(error);
                    _this.novel_content = ['取文件失败喽！'];
                    _this.$notify({
                        type: 'error',
                        title: '错误',
                        message: '获取文件失败，请检查',
                        offset: 60
                    });
                    _this.loading = false;
                });
            }
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

        handleCurrentChange: function (val) {
            this.saveToSession();
        },

        getChapterFromSession: function () {
            if (this.novel_name === '') {
                return
            }
            let num = localStorage.getItem(this.novel_name);
            if(num) {
                this.novel_page = num;
            }
        },

        pre_page: function () {
            if (this.novel_page > 1) {
                this.novel_page -= 1;
                this.saveToSession();
            }
        },

        next_page: function () {
            if (this.novel_page < this.novel_chapter.length) {
                this.novel_page += 1;
                this.saveToSession();
            }
        },

        saveToSession: function () {
            if (this.novel_name === '') {
                return
            }
            $('.novel_content pre').animate({scrollTop: 0});
            localStorage.setItem(this.novel_name, this.novel_page);
        },

        loadCustomApi: function () {
            // 检测链接合法性
            let reg = new RegExp(this.GLOBAL.apiReg, 'i');
            // 清空原有的txt，并重新加载列表
            this.novel_name = '';
            this.novel_chapter = [];
            this.novel_content = [];
            this.novel_page = 0;
            if (reg.test(this.custom_api)) {
                this.clearTree();
            } else {
                this.novel_msg = '别瞎填链接~';
                this.novel_page = 1;
                this.novel_chapter = ['下面是提示信息：'];
                this.novel_content = ['链接格式：https://api.github.com/repos/用户名/仓库名/contents（仓库内具体路径可以接着加 /xxx/xxx）'];
            }
        },
        selectFile: function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('#local_file').click();
        },
        uploadLocalFile: function (event) {
            if (this.loading) {
                $('#local_file').val('');
                return this.$notify({
                    type: 'info',
                    title: '提示',
                    message: '请等待当前文件加载完成~',
                    offset: 60
                });
            }
            let files = event?.target?.files || [];
            if (files.length === 0) {
                return
            }
            let file = files[0];
            let _this = this;
            let reader = new FileReader();
            reader.onload = function() {
                let fileData = this.result;
                if (fileData === '') {
                    _this.novel_content = ['该文件内容为空，还是看看别的吧'];
                    _this.loading = false;
                    return
                }
                let reg = /\n\s*[第]{1,2}[0-9零○一二两三四五六七八九十百千廿卅卌壹贰叁肆伍陆柒捌玖拾佰仟万１２３４５６７８９０]{1,5}[章节節堂讲回集部分品]{1,2}.*/g;
                let chapter = fileData.match(reg);
                if (chapter) {
                    chapter.unshift(_this.novel_name);
                } else {
                    chapter = [_this.novel_name];
                    if (fileData.length > 1024 * 1024) {
                        _this.novel_content = ['没找到章节名，而且内容还挺大，是不是文件编码有问题'];
                        _this.loading = false;
                        return
                    }
                }
                _this.novel_chapter = chapter;
                _this.novel_content = fileData.split(reg);
                _this.novel_page = 1;
                _this.getChapterFromSession();
                _this.loading = false;
                $('#local_file').val('');
            };
            _this.loading = true;
            _this.novel_name = file.name;
            _this.novel_chapter = ['提示：'];
            _this.novel_content = ['正在读取...'];
            _this.novel_page = 1;
            reader.readAsText(file);
        }
    },

    template: `
        <div>
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template slot="title">
                        <i class="header-icon el-icon-notebook-2"></i>
                    </template>
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
                            <el-tree
                                class="filter-tree novel-list-content"
                                lazy
                                ref="tree"
                                node-key="id"
                                :load="loadNode"
                                :props="defaultProps"
                                :filter-node-method="filterNode"
                                @node-click="handleNodeClick">
                            </el-tree>
                        </div>
                    </div>
                </el-collapse-item>
                <el-collapse-item name="2">
                    <template slot="title">
                        <i class="header-icon el-icon-document"></i>{{ novel_name }}
                        <el-button type="primary" plain size="small" class="load-local-btn" @click="selectFile($event)">打开本地TXT文件</el-button>
                    </template>
                    <input type="file" id="local_file" accept=".txt" style="display: none" @change="uploadLocalFile($event)"/>
                    <div class="novel-container" 
                        v-loading="loading"
                        element-loading-text="拼命加载中"
                        element-loading-background="rgba(255, 255, 255, 0.8)">
                        <div class="novel-operate">
                            <div>
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
                            </div>
                            <div v-if="novel_page > 0 && novel_page <= novel_chapter.length">
                                <el-button type="success" size="mini" @click="dialogVisible=true">阅读模式</el-button>
                            </div>
                            <div>
                                <el-popover
                                    placement="left"
                                    width="400"
                                    trigger="click">
                                    <div class="novel-setting">
                                        <div>字体大小：&nbsp;&nbsp;
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
                                        <div>字体类型：&nbsp;&nbsp;
                                            <div>
                                                <el-radio-group v-model="font_family" size="small">
                                                    <el-radio-button label="SimSun">宋体</el-radio-button>
                                                    <el-radio-button label="Microsoft YaHei">雅黑</el-radio-button>
                                                    <el-radio-button label="KaiTi">楷体</el-radio-button>
                                                    <el-radio-button label="STXingkai">行楷</el-radio-button>
                                                </el-radio-group>
                                            </div>
                                        </div>
                                        <div>背景颜色：&nbsp;&nbsp;
                                            <el-color-picker
                                                v-model="bg_color"
                                                show-alpha
                                                :predefine="predefine_bg_colors"
                                                size="small">
                                            </el-color-picker>
                                        </div>
                                        <div>文字颜色：&nbsp;&nbsp;
                                            <el-color-picker
                                                v-model="color"
                                                show-alpha
                                                :predefine="predefine_colors"
                                                size="small">
                                            </el-color-picker>
                                        </div>
                                        <div>内容宽度：&nbsp;&nbsp;
                                            <el-input-number 
                                                v-model="width" 
                                                controls="false"
                                                size="small"
                                                :min="200" 
                                                :max="1060">      
                                            </el-input-number>
                                        </div>
                                        <div>内容高度：&nbsp;&nbsp;
                                            <el-input-number 
                                                v-model="height" 
                                                controls="false"
                                                size="small"
                                                :min="0" 
                                                :max="1200">      
                                            </el-input-number>
                                        </div>
                                    </div>
                                    <el-button type="primary" icon="el-icon-s-tools" slot="reference" circle></el-button>
                                </el-popover>
                            </div>
                        </div>
                        <div class="novel_chapter">{{ novel_chapter[novel_page - 1] }}</div>
                        <div class="novel_content">
                            <pre :style="{'font-size': font_size, 'font-family': font_family, 'background-color': bg_color, 'color': color, 'width': width + 'px', 'max-height': height + 'px', 'max-width': max_width + 'px'}">
                                <span>{{ novel_content[novel_page - 1] }}</span>
                                <div v-if="novel_chapter.length > 1" class="turn_page">
                                    <el-button plain @click="pre_page" icon="el-icon-arrow-left">{{ novel_chapter[novel_page - 2] | interceptStr }}</el-button>
                                    <div>{{ novel_chapter[novel_page - 1] | interceptStr }}</div>
                                    <el-button plain @click="next_page">{{ novel_chapter[novel_page] | interceptStr }}<i class="el-icon-arrow-right el-icon--right"></i></el-button>
                                </div>
                            </pre>
                            <div v-if="novel_chapter.length > 1" class="turn_page">
                                <el-button plain @click="pre_page">上一章</el-button>
                                <div>{{ novel_page }}</div>
                                <el-button plain @click="next_page">下一章</el-button>
                            </div>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
            <el-dialog
                :visible.sync="dialogVisible"
                :fullscreen="true"
                :modal="false"
                custom-class="custom-dialog">
                <div class="novel_content">
                    <pre :style="{'font-size': font_size, 'font-family': font_family, 'background-color': bg_color, 'color': color, 'width': 'calc(100vw - 40px)', 'max-height': 'calc(100vh - 130px)', 'max-width': '99%', 'line-height': '1.5'}">
                        <span>{{ novel_content[novel_page - 1] }}</span>
                        <div v-if="novel_chapter.length > 1" class="turn_page">
                            <el-button plain @click="pre_page" icon="el-icon-arrow-left">{{ novel_chapter[novel_page - 2] | interceptStr }}</el-button>
                            <div>{{ novel_chapter[novel_page - 1] | interceptStr }}</div>
                            <el-button plain @click="next_page">{{ novel_chapter[novel_page] | interceptStr }}<i class="el-icon-arrow-right el-icon--right"></i></el-button>
                        </div>
                    </pre>
                    <div v-if="novel_chapter.length > 1" class="turn_page">
                        <el-button plain @click="pre_page">上一章</el-button>
                        <div>{{ novel_page }}</div>
                        <el-button plain @click="next_page">下一章</el-button>
                    </div>
                </div>
            </el-dialog>
        </div>
    `,
}