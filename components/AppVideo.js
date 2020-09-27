export default {
    filters: {

    },

    data: function () {
        return {
            activeNames: ['1'],
            video_api: 'https://api.github.com/repos/onedx1943/Music/contents',
            custom_api: 'https://api.github.com/repos/onedx1943/Music/contents',
            video_list: [],
            video_msg: '正在读取文件...',
            filterText: '',
            videoPlayer: null,
        }
    },

    watch: {
        filterText: function (val) {
            this.filter_video(val.toLowerCase())
        },
    },

    computed: {

    },

    mounted: function () {
        this.getVideoList(this.video_api);
    },

    beforeDestroy: function () {
        // 组件销毁前结束播放
        this.stopVideo();
    },

    methods: {
        getVideoList: function (file_api) {
            let _this = this;
            _this.video_msg = '别着急，正在查找文件！';
            axios.get(file_api, {
                headers: {
                    'Authorization': this.GLOBAL.token
                }
            }).then(function (response) {
                _this.limitNotification(response.headers);
                for(let i = 0; i < response.data.length; i++){
                    if (response.data[i].name.endsWith('.mp4')) {
                        _this.video_list.push(response.data[i])
                    } else if (response.data[i].type === 'dir') {
                        let new_url = file_api + '/' + response.data[i].name;
                        _this.getVideoList(new_url);
                    }
                }
            }).catch(function (error) {
                console.log(error);
                _this.video_msg = '网络或者链接有问题啊，读取失败了！';
            });
        },

        getMusicContent: function (event, download_url) {
            let _this = this;
            $('.music-list .active-music').removeClass('active-music');
            $(event.currentTarget).addClass('active-music');
            let index = parseInt($(event.currentTarget).attr('index'));
            if (this.videoPlayer == null) {
                _this.initVideo(download_url);
            } else {
                let data = {
                    src: download_url,
                    type: 'video/mp4'
                };
                //_this.videoPlayer.pause();
                _this.videoPlayer.src(data);
                _this.videoPlayer.load(data);
            }
            // 动态切换poster
            //_this.videoPlayer.posterImage.setSrc('xxx.jpg');
            //_this.videoPlayer.play();
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

        initVideo: function (download_url) {
            if (this.videoPlayer == null) {
                this.videoPlayer = videojs(document.getElementById('video-content'), {
                    controls: true, // 是否显示控制条
                    poster: 'https://raw.githubusercontent.com/onedx1943/onedx1943.github.io/master/static/image/bg007.jpg', // 视频封面图地址
                    preload: 'auto',
                    autoplay: false,
                    fluid: true, // 自适应宽高
                    language: 'zh-CN', // 设置语言
                    muted: false, // 是否静音
                    inactivityTimeout: false,
                    controlBar: { // 设置控制条组件
                        /* 设置控制条里面组件的相关属性及显示与否
                        'currentTimeDisplay':true,
                        'timeDivider':true,
                        'durationDisplay':true,
                        'remainingTimeDisplay':false,
                        volumePanel: {
                            inline: false,
                        }
                        */
                        /* 使用children的形式可以控制每一个控件的位置，以及显示与否 */
                        children: [
                            {name: 'playToggle'}, // 播放按钮
                            {name: 'currentTimeDisplay'}, // 当前已播放时间
                            {name: 'progressControl'}, // 播放进度条
                            {name: 'durationDisplay'}, // 总时间
                            { // 倍数播放
                                name: 'playbackRateMenuButton',
                                'playbackRates': [0.5, 1, 1.5, 2, 2.5]
                            },
                            {
                                name: 'volumePanel', // 音量控制
                                inline: false, // 不使用水平方式
                            },
                            {name: 'FullscreenToggle'} // 全屏
                        ]
                    },
                    sources:[ // 视频源
                        {
                            src: download_url,
                            type: 'video/mp4',
                        }
                    ]
                }, function (){
                    console.log('视频可以播放了');
                });
            }
        },

        stopVideo: function () {
            if (this.videoPlayer !== null) {
                this.videoPlayer.dispose();
                this.videoPlayer = null
            }
        },

        loadCustomApi: function () {
            // 检测链接合法性
            let reg = new RegExp(this.GLOBAL.apiReg, 'i');
            this.video_list = [];
            this.filterText = '';
            if (reg.test(this.custom_api)) {
                this.getVideoList(this.custom_api);
            } else {
                this.video_msg = '链接格式：https://api.github.com/repos/用户名/仓库名/contents（仓库内具体路径可以接着加 /xxx/xxx）';
            }
        },
        
        filter_video: function (val) {
            $('.music-list div').each(function () {
                if ($(this).text().toLowerCase().indexOf(val) > -1) {
                    $(this).show()
                } else {
                    $(this).hide()
                }
            })
        }
    },

    template: `
        <div>
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template slot="title">
                        <i class="fa fa-tasks"></i>
                    </template>
                    <div class="music-header">
                        <div class="music-custom">
                            <el-input placeholder="请输入内容" v-model="custom_api">
                                <template slot="prepend">从自定义github仓获取视频</template>
                                <el-button slot="append" icon="el-icon-search" @click="loadCustomApi"></el-button>
                            </el-input>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
            <div class="video-content">
                <!-- vjs-big-play-centered可使大的播放按钮居中，vjs-fluid可使视频占满容器 -->
                <video id="video-content" playsinline="true" class="video-js vjs-big-play-centered vjs-fluid">
                    <p class="vjs-no-js">
                        好像不支持？
                    </p>
                </video>
            </div>
            <el-input
                prefix-icon="el-icon-search"
                placeholder="仅供搜索，别想太多"
                v-model="filterText"
                clearable>
            </el-input>
            <div class="music-list" v-if="video_list.length > 0">
                <div v-for="(video, index) in video_list"
                    :index="index"
                    :key="video.sha"
                    @click="getMusicContent($event, video.download_url)">{{ index + 1 }}. {{ video.name }}  ( {{ (video.size / 1024 / 1024).toFixed(2) + 'M' }} )</div>
            </div>
            <div v-else>{{ video_msg }}</div>
        </div>
    `,
}