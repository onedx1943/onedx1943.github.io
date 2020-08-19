export default {
    data: function () {
        return {
            novel_api: 'https://api.github.com/repos/onedx1943/Files/contents/%E5%B0%8F%E8%AF%B4',
            novel_list: [],
            novel_msg: '正在读取文件...',
            novel_chapter: [],
            novel_content: [],
            novel_page: 0,
            input_page: 0,
        }
    },
    template: `
        <div>
            <div class="novel-list" v-if="novel_list.length > 0">
                <div v-for="novel in novel_list" :key="novel.name" @click="getNovelContent($event, novel.download_url)">{{ novel.name }}</div>
            </div>
            <div v-else>{{ novel_msg }}</div>
            <div v-if="novel_page > 0 && novel_page <= novel_chapter.length">
                <div>
                    <button @click="deletePageNum()"><i class="fa fa-chevron-left"></i></button>
                    <input v-model="input_page" @input="inputChange()" type="number">
                    <button @click="addPageNum()"><i class="fa fa-chevron-right"></i></button>
                    章节数：{{ novel_chapter.length }}
                </div>
                <div class="novel_chapter">{{ novel_chapter[novel_page - 1] }}</div>
                <div class="novel_content">
                    <pre>{{ novel_content[novel_page - 1] }}</pre>
                </div>
            </div>
            <div v-else>
                <button @click="novel_page=1,input_page=1"><i class="fa fa-rotate-right"></i></button>
            </div>
        </div>
    `,
    mounted: function () {
        this.getNovelList();
    },
    methods: {
        getNovelList: function () {
            let _this = this;
            _this.novel_page = 0;
            _this.input_page = 0;
            axios.get(this.novel_api)
                .then(function (response) {
                    for(let i = 0; i < response.data.length; i++){
                        if (response.data[i].name.endsWith('.txt')) {
                            _this.novel_list.push(response.data[i])
                        }
                    }
                    if (_this.novel_list.length === 0) {
                        _this.novel_msg = '你为啥把小说都删了?';
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        getNovelContent: function (event, novel_url) {
            let _this = this;
            $('.novel-list .active-novel').removeClass('active-novel');
            $(event.currentTarget).addClass('active-novel');
            _this.novel_chapter = [''];
            _this.novel_content = ['正在读取...'];
            _this.novel_page = 1;
            _this.input_page = 1;
            axios.get(novel_url)
                .then(function (response) {
                    let reg = /.*[第]{1,2}[0-9零○一二两三四五六七八九十百千廿卅卌壹贰叁肆伍陆柒捌玖拾佰仟万１２３４５６７８９０]{1,5}[章节節堂讲回集部分品]{1,2}.*/g;
                    let chapter = response.data.match(reg);
                    chapter.unshift('');
                    _this.novel_chapter = chapter;
                    _this.novel_content = response.data.split(reg);
                    _this.novel_page = 1;
                    _this.input_page = 1;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        deletePageNum: function () {
            if (this.novel_page > 1) {
                this.novel_page -= 1;
            }
            this.input_page = this.novel_page;
        },
        addPageNum: function () {
            if (this.novel_page < this.novel_chapter.length) {
                this.novel_page += 1;
            }
            this.input_page = this.novel_page;
        },
        inputChange: function() {
            this.input_page = parseInt(this.input_page);
            if (this.input_page < 1) {
                this.input_page = 1;
            }
            if (this.input_page > this.novel_chapter.length) {
                this.input_page = this.novel_chapter.length;
            }
            this.novel_page = this.input_page;
        },
    },
}