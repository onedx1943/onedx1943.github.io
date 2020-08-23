export default {
    data: function () {
        return {
            novel_api: 'https://api.github.com/repos/onedx1943/Files/contents',
            novel_list: [],
            novel_msg: '正在读取文件...',
            novel_name: '',
            novel_chapter: [],
            novel_content: [],
            novel_page: 0,
            input_page: 0,
            setting: {
                font_size: '18.7px',
                font_family: 'Microsoft YaHei',
                bg_color: '#f5edd4',
                color: '#262626',
                width: 1000,
                height: 600
            },
            custom_api: 'https://api.github.com/repos/onedx1943/Files/contents',
        }
    },
    template: `
        <div>
            <div class="novel-header-collapse" data-toggle="collapse" data-target="#novel_header"><i class="fa fa-tasks"></i></div>
            <div id="novel_header" class="collapse show">
                <div class="novel-custom">
                    <span>自定义github仓库地址: </span>
                    <input v-model="custom_api">
                    <button class="btn btn-primary btn-sm" @click="loadCustomApi()"><i class="fa fa-flash"></i></button>
                </div>
                <div class="novel-header">
                    <div class="novel-list" v-if="novel_list.length > 0">
                        <div v-for="novel in novel_list" :key="novel.name" @click="getNovelContent($event, novel.download_url)">{{ novel.name }}</div>
                    </div>
                    <div class="novel-list" v-else>{{ novel_msg }}</div>
                    <div class="novel-setting">
                        <div>字体大小: 
                            <select v-model="setting.font_size" 
                                @change="$('.novel_content pre').css('font-size', setting.font_size)">
                                <option value="56px">初号</option>
                                <option value="48px">小初</option>
                                <option value="34.7px">一号</option>
                                <option value="32px">小一</option>
                                <option value="29.3px">二号</option>
                                <option value="24px">小二</option>
                                <option value="21.3px">三号</option>
                                <option value="20px">小三</option>
                                <option value="18.7px">四号</option>
                                <option value="16px">小四</option>
                                <option value="14px">五号</option>
                                <option value="12px">小五</option>
                                <option value="10px">六号</option>
                                <option value="8.7px">小六</option>
                                <option value="7.3px">七号</option>
                                <option value="6.7px">八号</option>
                            </select>
                        </div>
                        <div>字体类型: 
                            <select v-model="setting.font_family" 
                                @change="$('.novel_content pre').css('font-family', setting.font_family)">
                                <option value="SimHei">黑体</option>
                                <option value="SimSun">宋体</option>
                                <option value="NSimSun">新宋体</option>
                                <option value="FangSong">仿宋</option>
                                <option value="KaiTi">楷体</option>
                                <option value="FangSong_GB2312">仿宋_GB2312</option>
                                <option value="KaiTi_GB2312">楷体_GB2312</option>
                                <option value="Microsoft JhengHei">微软正黑体</option>
                                <option value="Microsoft YaHei">微软雅黑体</option>
                                <option value="LiSu">隶书</option>
                                <option value="YouYuan">幼圆</option>
                                <option value="STHeiti">华文黑体</option>
                                <option value="STXihei">华文细黑</option>
                                <option value="STKaiti">华文楷体</option>
                                <option value="STSong">华文宋体</option>
                                <option value="STZhongsong">华文中宋</option>
                                <option value="STFangsong">华文仿宋</option>
                                <option value="FZShuTi">方正舒体</option>
                                <option value="FZYaoti">方正姚体</option>
                                <option value="STCaiyun">华文彩云</option>
                                <option value="STHupo">华文琥珀</option>
                                <option value="STLiti">华文隶书</option>
                                <option value="STXingkai">华文行楷</option>
                                <option value="STXinwei">华文新魏</option>
                            </select>
                        </div>
                        <div>背景颜色: 
                            <select v-model="setting.bg_color" 
                                @change="$('.novel_content pre').css('background-color', setting.bg_color)">
                                <option style="background-color: #ffffff;color: #262626" value="#ffffff"> #ffffff</option>
                                <option style="background-color: #f9f6ed;color: #262626" value="#f9f6ed"> #f9f6ed</option>
                                <option style="background-color: #f5edd4;color: #262626" value="#f5edd4"> #f5edd4</option>
                                <option style="background-color: #e6f3e9;color: #262626" value="#e6f3e9"> #e6f3e9</option>
                                <option style="background-color: #e7f4f5;color: #262626" value="#e7f4f5"> #e7f4f5</option>
                                <option style="background-color: #f5e8e7;color: #262626" value="#f5e8e7"> #f5e8e7</option>
                                <option style="background-color: #e3e5e3;color: #262626" value="#e3e5e3"> #e3e5e3</option>
                                <option style="background-color: #181a1b;color: #666" value="#181a1b"> #181a1b</option>
                            </select>
                        </div>
                        <div>文字颜色: 
                            <select v-model="setting.color" 
                                @change="$('.novel_content pre').css('color', setting.color)">
                                <option style="color: #262626" value="#262626"> #262626</option>
                                <option style="color: #666" value="#666"> #666</option>
                            </select>
                        </div>
                        <div>内容宽度: 
                            <input v-model.number="setting.width" type="number" min="0"
                                @input="$('.novel_content pre').css('width', setting.width)">
                        </div>
                        <div>内容高度: 
                            <input v-model.number="setting.height" type="number" min="0"
                                @input="$('.novel_content pre').css('max-height', setting.height)">
                        </div>
                    </div>
                </div>
            </div>
            <div class="novel-container">
                <div v-if="novel_page > 0 && novel_page <= novel_chapter.length">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary" @click="deletePageNum()"><i class="fa fa-chevron-left"></i></button>
                        <input v-model.number="input_page" type="number" @input="inputChange()">
                        <button class="btn btn-primary" @click="addPageNum()"><i class="fa fa-chevron-right"></i></button>
                    </div>
                    <div class="chapter-menu">
                        <span>总页数：{{ novel_chapter.length }}</span>
                        <button class="btn btn-primary btn-sm" @click="showChapterMenu()"><i class="fa fa-th"></i></button>
                        <div class="chapter-list" v-if="novel_chapter.length > 0">
                            <div class="chapter-list-content" v-for="(name, index) in novel_chapter" :key="index" @click="jumpChapter(index)">
                                <span>{{ index | chapter }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="novel_chapter.length > 0">
                    <button @click="novel_page=1,input_page=1"><i class="fa fa-rotate-right"></i></button>
                </div>
                <div class="novel_chapter">{{ novel_chapter[novel_page - 1] }}</div>
                <div class="novel_content">
                    <pre>{{ novel_content[novel_page - 1] }}</pre>
                </div>
            </div>
        </div>
    `,
    mounted: function () {
        this.getNovelList(this.novel_api);
    },
    filters: {
        chapter: function (value) {
            if (value === 0) {
                return ''
            }
            return '第' + value + '页';
        }
    },
    methods: {
        getNovelList: function (file_api) {
            let _this = this;
            _this.novel_msg = '别着急，正在查找txt文件！';
            _this.novel_page = 0;
            _this.input_page = 0;
            axios.get(file_api)
                .then(function (response) {
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
            _this.input_page = 1;
            axios.get(novel_url)
                .then(function (response) {
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
                    _this.input_page = 1;
                    _this.getChapterFromSession();
                })
                .catch(function (error) {
                    console.log(error);
                    _this.novel_content = ['取文件失败喽！'];
                });
        },
        deletePageNum: function () {
            if (this.novel_page > 1) {
                this.novel_page -= 1;
            }
            this.input_page = this.novel_page;
            this.saveToSession();
        },
        addPageNum: function () {
            if (this.novel_page < this.novel_chapter.length) {
                this.novel_page += 1;
            }
            this.input_page = this.novel_page;
            this.saveToSession();
        },
        inputChange: function() {
            if (this.input_page == '') {
                this.input_page = 1;
            }
            if (this.input_page < 1) {
                this.input_page = 1;
            }
            if (this.input_page > this.novel_chapter.length) {
                this.input_page = this.novel_chapter.length;
            }
            this.novel_page = this.input_page;
            this.saveToSession();
        },
        jumpChapter: function (index) {
            if (index === 0) {
                return
            }
            this.input_page = index;
            this.novel_page = index;
            $('.chapter-list').toggleClass('open', false);
            this.saveToSession();
        },
        getChapterFromSession: function () {
            if (this.novel_name == '') {
                return
            }
            let num = sessionStorage.getItem(this.novel_name);
            if(num) {
                this.input_page = num;
                this.novel_page = num;
            }
        },
        saveToSession: function () {
            if (this.novel_name == '') {
                return
            }
            $('.novel_content pre').animate({scrollTop: 0});
            sessionStorage.setItem(this.novel_name, this.novel_page);
        },
        showChapterMenu: function () {
            let Chapter_menu = $('.chapter-list');
            Chapter_menu.css('width', $('.novel_content').width());
            Chapter_menu.toggleClass('open');
        },
        loadCustomApi: function () {
            // 检测链接合法性
            let reg = new RegExp("^https://api.github.com/repos/[0-9a-z_!~*'().&=+$%-]+/[0-9a-z_!~*'().&=+$%-]+/contents(/[0-9a-z_!~*'().&=+$%-]+)*$", 'i');
            // 清空原有的txt，并重新加载列表
            this.novel_name = '';
            this.novel_chapter = [];
            this.novel_content = [];
            this.novel_page = 0;
            this.input_page = 0;
            this.novel_list = [];
            if (reg.test(this.custom_api)) {
                this.getNovelList(this.custom_api);
            } else {
                this.novel_msg = '别瞎填链接~';
                this.novel_page = 1;
                this.input_page = 1;
                this.novel_chapter = [''];
                this.novel_content = ['链接格式：https://api.github.com/repos/用户名/仓库名/contents（仓库内具体路径可以接着加 /xxx/xxx）'];
            }
        }
    },
}