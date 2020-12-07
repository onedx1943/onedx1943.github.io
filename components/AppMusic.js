export default {
    filters: {
        formatSeconds: function (value) {
            let time_list = [];//Hour minute second
            let hour = Math.floor(value / 3600);
            if (hour !== 0) {
                time_list.push(hour > 9 ? hour : '0' + hour);
            }
            let minute = Math.floor((value % 3600) / 60);
            time_list.push(minute > 9 ? minute : '0' + minute);
            let second = value % 60;
            time_list.push(second > 9 ? second : '0' + second);
            return time_list.join(':')
        },
    },

    data: function () {
        return {
            activeNames: ['1'],
            music_api: 'https://api.github.com/repos/onedx1943/Music/contents',
            music_list: [],
            music_msg: '正在读取文件...',
            tips_msg: '',
            audioContext: null,
            source: null, //the audio source
            animationId: null,
            status: 0, //flag for sound is playing 1 or stopped 0 suspend 2
            forceStop: false,
            allCapsReachBottom: false,
            play_model: 0, // 列表循环 0 单曲循环 1 随机播放 2
            play_num: 0,
            play_name: '',
            custom_api: 'https://api.github.com/repos/onedx1943/Music/contents',
            timer: null,
            start_time: 0,
            duration_time: 0,
            current_time: 0,
            percentage: 0,
            volume: 50,
            volume_actual: 50,
            muted: false,
            gainNode: null,
            filterText: '',
            imgUrl: 'data:image/jpeg;base64,',
            jsMediaTags: null,
            musicTitle: '',
            musicAlbum: '',
            musicArtist: '',
            lyricsList: [],
            lyricsContent: [],
            musicLyricsMsg: '',
        }
    },

    watch: {
        filterText: function (val) {
            this.filter_music(val.toLowerCase())
        },
    },

    computed: {

    },

    mounted: function () {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        this.jsMediaTags = window.jsmediatags;
        this.getMusicLyrics(this.music_api);
        this.getMusicList(this.music_api);
    },

    beforeDestroy: function () {
        // 组件销毁前结束播放
        this.stopMusic(true);
        if (this.audioContext != null) {
            this.audioContext.close();
            this.audioContext = null;
        }
    },

    methods: {
        getMusicList: function (file_api) {
            let _this = this;
            _this.music_msg = '别着急，正在查找音乐文件！';
            axios.get(file_api, {
                headers: {
                    'Authorization': this.GLOBAL.token
                }
            }).then(function (response) {
                _this.limitNotification(response.headers);
                for(let i = 0; i < response.data.length; i++){
                    if (response.data[i].name.endsWith('.mp3') || response.data[i].name.endsWith('.flac')) {
                        _this.music_list.push(response.data[i])
                    } else if (response.data[i].type === 'dir') {
                        let new_url = file_api + '/' + response.data[i].name;
                        _this.getMusicList(new_url);
                    }
                }
            }).catch(function (error) {
                console.log(error);
                _this.music_msg = '网络或者链接有问题啊，读取失败了！';
            });
        },

        getMusicContent: function (event, music_url) {
            let _this = this;
            _this.imgUrl = 'data:image/jpeg;base64,';
            _this.musicTitle = '';
            _this.musicAlbum = '';
            _this.musicArtist = '';
            _this.musicLyricsMsg = '';
            _this.lyricsContent = [];
            $('.music-list .active-music').removeClass('active-music');
            $(event.currentTarget).addClass('active-music');
            let index = parseInt($(event.currentTarget).attr('index'));
            _this.play_name = $(event.currentTarget).text();
            //stop the previous sound if any
            this.stopMusic(false);
            _this.tips_msg = '正在远程读取文件，可能要等个几十秒，不要着急';
            axios({
                method: 'get',
                url: music_url,
                responseType: 'arraybuffer',
            }).then(function (response) {
                if (_this.audioContext == null) {
                    try {
                        _this.audioContext = new AudioContext();
                    } catch (e) {
                        console.log(e);
                        _this.tips_msg = '你的浏览器不支持AudioContext:(';
                        return
                    }
                } else {
                    _this.audioContext.close();
                    _this.audioContext = null;
                    _this.audioContext = new AudioContext();
                }
                let audioContext = _this.audioContext;
                _this.tips_msg = '正在解码...';
                _this.getMusicInfo(response.data);
                audioContext.decodeAudioData(response.data, function(buffer) {
                    //解码成功则调用此函数，参数buffer为解码后得到的结果
                    //调用_visualize进行下一步处理
                    _this.play_num = index;
                    _this._visualize(audioContext, buffer);
                }, function(e) {
                    //这个是解码失败会调用的函数
                    console.log("文件解码失败:(");
                });
            }).catch(function (error) {
                console.log(error);
                _this.tips_msg = '完了~取文件失败了';
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

        _visualize: function(audioContext, buffer) {
            let audioBufferSourceNode = audioContext.createBufferSource(),
                analyser = audioContext.createAnalyser(),
                gainNode = audioContext.createGain(),  // 创建一个GainNode,它可以控制音频的总音量
                _this = this;
            _this.duration_time = Math.round(buffer.duration);
            _this.current_time = 0;
            clearInterval(_this.timer);
            _this.start_time = audioContext.currentTime;
            _this.timer = setInterval(function () {
                let time = audioContext.currentTime - _this.start_time;
                _this.setActiveLyrics(time);
                _this.current_time = Math.floor(time);
                _this.percentage = _this.current_time / _this.duration_time * 100;
            }, 100);
            //将source与分析器以及音量进行关联
            audioBufferSourceNode.connect(gainNode);
            audioBufferSourceNode.connect(analyser);
            //将分析器与destination连接，这样才能形成到达扬声器的通路
            // audioContext.destination返回AudioDestinationNode对象，表示当前audioContext中所有节点的最终节点，一般表示音频渲染设备
            gainNode.connect(audioContext.destination);
            //将上一步解码得到的buffer数据赋值给source
            audioBufferSourceNode.buffer = buffer;
            //设置音量
            gainNode.gain.linearRampToValueAtTime(_this.volume / 100, audioContext.currentTime + 1);
            _this.gainNode = gainNode;
            //播放
            if (!audioBufferSourceNode.start) {
                audioBufferSourceNode.start = audioBufferSourceNode.noteOn; //in old browsers use noteOn method
                audioBufferSourceNode.stop = audioBufferSourceNode.noteOff; //in old browsers use noteOff method
            }
            _this.tips_msg = _this.play_name;
            audioBufferSourceNode.start(0);
            $('.album-picture').addClass('play');
            _this.status = 1;
            _this.source = audioBufferSourceNode;
            audioBufferSourceNode.onended = function() {
                _this._audioEnd();
            };
            // 绘制频谱图
            this._drawSpectrum(analyser);
        },

        _drawSpectrum: function(analyser) {
            let _this = this,
                canvas = document.getElementById('music_canvas'),
                c_width = canvas.width,
                c_height = canvas.height - 2,
                meterWidth = 10, //width of the meters in the spectrum
                gap = 2, //gap between meters
                capHeight = 2,
                capStyle = '#fff',
                meterNum = c_width / (meterWidth + gap), //count of the meters
                capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
            let ctx = canvas.getContext('2d'),
                gradient = ctx.createLinearGradient(0, 0, 0, c_height);
            gradient.addColorStop(1, '#0f0');
            gradient.addColorStop(0.5, '#ff0');
            gradient.addColorStop(0, '#f00');
            let drawMeter = function() {
                let array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                if (_this.status === 0) {
                    //fix when some sounds end the value still not back to zero
                    for (let i = array.length - 1; i >= 0; i--) {
                        array[i] = 0;
                    }
                    _this.allCapsReachBottom = true;
                    for (let i = capYPositionArray.length - 1; i >= 0; i--) {
                        _this.allCapsReachBottom = _this.allCapsReachBottom && (capYPositionArray[i] === 0);
                    }
                    if (_this.allCapsReachBottom) {
                        cancelAnimationFrame(_this.animationId); //since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                        return;
                    }
                }
                let step = Math.round(array.length / meterNum); //sample limited data from the total array
                ctx.clearRect(0, 0, c_width, c_height);
                for (let i = 0; i < meterNum; i++) {
                    let value = array[i * step];
                    if (capYPositionArray.length < Math.round(meterNum)) {
                        capYPositionArray.push(value);
                    }
                    ctx.fillStyle = capStyle;
                    //draw the cap, with transition effect
                    if (value < capYPositionArray[i]) {
                        ctx.fillRect(i * 12, c_height - (--capYPositionArray[i]), meterWidth, capHeight);
                    } else {
                        ctx.fillRect(i * 12, c_height - value, meterWidth, capHeight);
                        capYPositionArray[i] = value;
                    }
                    ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                    ctx.fillRect(i * 12 /*meterWidth+gap*/ , c_height - value + capHeight, meterWidth, c_height); //the meter
                }
                _this.animationId = requestAnimationFrame(drawMeter);
            };
            this.animationId = requestAnimationFrame(drawMeter);
        },

        _audioEnd: function() {
            this.status = 0;
            // 如果是强制停止则不再播放下一首
            if (this.forceStop) {
                this.forceStop = false;
                return
            }
            // 播放结束后自动播放
            if (this.play_model === 0) {
                this.nextMusic();
            } else if (this.play_model === 1) {
                this.playMusic();
            } else if (this.play_model === 2) {
                this.play_num = Math.floor(Math.random() * this.music_list.length);
                this.playMusic();
            }
        },

        preMusic: function () {
            if (this.play_model === 2) {
                this.play_num = Math.floor(Math.random() * this.music_list.length);
            } else {
                this.play_num -= 1;
            }
            if (this.play_num === -1) {
                this.play_num = this.music_list.length - 1;
            }
            $('div[index=' + this.play_num + ']').click();
        },

        playMusic: function () {
            if (this.status === 0) {
                $('div[index=' + this.play_num + ']').click();
            } else if (this.status === 1) {
                this.audioContext.suspend();
                this.status = 2;
                $('.album-picture').removeClass('play');
            } else if (this.status === 2) {
                this.audioContext.resume();
                this.status = 1;
                $('.album-picture').addClass('play');
            }
        },

        nextMusic: function () {
            if (this.play_model === 2) {
                this.play_num = Math.floor(Math.random() * this.music_list.length);
            } else {
                this.play_num += 1;
            }
            if (this.play_num === this.music_list.length) {
                this.play_num = 0;
            }
            $('div[index=' + this.play_num + ']').click();
        },

        stopMusic: function (value) {
            // 是否强制停止，不再播放下一首
            this.forceStop = value;
            clearInterval(this.timer);
            this.duration_time = 0;
            this.current_time = 0;
            this.tips_msg = '';
            this.percentage = 0;
            if (this.animationId !== null) {
                cancelAnimationFrame(this.animationId);
            }
            if (this.source !== null) {
                this.source.stop(0);
            }
            if (this.audioContext != null) {
                this.audioContext.close();
                this.audioContext = null;
            }
            this.status = 0;
            // 清空画布
            let canvas = document.getElementById('music_canvas');
            if (canvas) {
                let c_width = canvas.width,
                    c_height = canvas.height - 2;
                let ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, c_width, c_height);
            }
            this.imgUrl = 'data:image/jpeg;base64,';
            this.musicTitle = '';
            this.musicAlbum = '';
            this.musicArtist = '';
            this.lyricsContent = [];
            this.musicLyricsMsg = '';
            $('.album-picture').removeClass('play');
        },

        switchModel: function () {
            this.play_model = (this.play_model + 1) % 3;
        },

        loadCustomApi: function () {
            // 检测链接合法性
            let reg = new RegExp(this.GLOBAL.apiReg, 'i');
            // 停止正在播放的音乐，并重新加载列表
            this.stopMusic(true);
            this.music_list = [];
            this.filterText = '';
            if (reg.test(this.custom_api)) {
                this.getMusicList(this.custom_api);
                this.lyricsList.length = 0;
                this.getMusicLyrics(this.custom_api);
            } else {
                this.tips_msg = '别瞎填链接~';
                this.music_msg = '链接格式：https://api.github.com/repos/用户名/仓库名/contents（仓库内具体路径可以接着加 /xxx/xxx）';
            }
        },

        mutedPage: function () {
            this.muted = !this.muted;
            if (this.muted) {
                this.volume_actual = this.volume;
                this.volume = 0;
            } else {
                this.volume = this.volume_actual;
            }
            if (this.gainNode && this.audioContext) {
                this.gainNode.gain.linearRampToValueAtTime(this.volume / 100 * (!this.muted), this.audioContext.currentTime + 1);
            }
        },

        resizeVolume: function (value) {
            this.volume = value;
            this.muted = (this.volume === 0);
            if (this.gainNode && this.audioContext) {
                this.gainNode.gain.linearRampToValueAtTime(this.volume / 100 * (!this.muted), this.audioContext.currentTime + 1);
            }
        },
        
        filter_music: function (val) {
            $('.music-list div').each(function () {
                if ($(this).text().toLowerCase().indexOf(val) > -1) {
                    $(this).show()
                } else {
                    $(this).hide()
                }
            })
        },

        getMusicInfo: function (data) {
            let _this = this;
            _this.jsMediaTags.read(new Blob([data]), {
                onSuccess: function(tag) {
                    if (tag.tags.title) {
                        _this.musicTitle = tag.tags.title;
                        _this.getLyricsContent(tag.tags.title);
                    }
                    if (tag.tags.album) {
                        _this.musicAlbum = '专辑：' + tag.tags.album;
                    }
                    if (tag.tags.artist) {
                        _this.musicArtist = '歌手：' + tag.tags.artist;
                    }
                    let picture  = tag.tags.picture;
                    if (picture) {
                        let imageReader = new FileReader();
                        imageReader.onload = function (e) {
                            _this.imgUrl = e.target.result;
                        };
                        imageReader.readAsDataURL(new Blob([new Uint8Array(picture.data)], {type: picture.format}));
                    } else {
                        _this.imgUrl = 'data:image/jpeg;base64,';
                    }
                },
                onError: function(error) {
                    console.log(error);
                    _this.imgUrl = 'data:image/jpeg;base64,';
                }
            });
        },

        getMusicLyrics: function (file_api) {
            let _this = this;
            axios.get(file_api, {
                headers: {
                    'Authorization': this.GLOBAL.token
                }
            }).then(function (response) {
                _this.limitNotification(response.headers);
                for(let i = 0; i < response.data.length; i++){
                    if (response.data[i].name.endsWith('.lrc')) {
                        _this.lyricsList.push(response.data[i])
                    } else if (response.data[i].type === 'dir') {
                        let new_url = file_api + '/' + response.data[i].name;
                        _this.getMusicLyrics(new_url);
                    }
                }
            }).catch(function (error) {
                console.log(error);
            });
        },

        getLyricsContent: function (name) {
            let _this = this;
            let url = null;
            for (let lyrics of _this.lyricsList) {
                if (lyrics.name.includes(name)) {
                    url = lyrics.download_url;
                    break
                }
            }
            if (url) {
                axios.get(url).then(function (response) {
                    let items = response.data.split(/[\r\n]/);
                    for (let item of items) {
                        let time = item.substring(item.indexOf("[") + 1, item.indexOf("]"));
                        if ((/\d+:\d+.\d+/).test(time)) {
                            _this.lyricsContent.push({
                                time: (time.split(":")[0] * 60 + parseFloat(time.split(":")[1])).toFixed(3),
                                content: item.substring(item.indexOf("]") + 1, item.length)
                            })
                        }
                    }
                    _this.lyricsContent.unshift({time: 0, content: ''});
                    if (_this.lyricsContent.length === 1) {
                        _this.musicLyricsMsg = '暂无歌词';
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            } else {
                _this.musicLyricsMsg = '暂无歌词';
            }
        },
        setActiveLyrics: function (time) {
            let _this = this;
            for (let num = 0, len = _this.lyricsContent.length; num < len; num++) {
                if (num === len - 1 || (_this.lyricsContent[num].time <= time && time < _this.lyricsContent[num + 1].time)) {
                    let activeLyricsDom = $('.music-lyrics div[time="' + _this.lyricsContent[num].time + '"]');
                    if (!activeLyricsDom.hasClass('active')) {
                        let musicLyricsDom = $('.music-lyrics');
                        let position = activeLyricsDom.position().top;
                        let scrollTop = musicLyricsDom.scrollTop() - (124 - position);
                        musicLyricsDom.animate({scrollTop: scrollTop}, 300);
                        $('.music-lyrics div').removeClass('active');
                        activeLyricsDom.addClass('active');
                    }
                    break
                }
            }
        },
    },

    template: `
        <div>
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template slot="title">
                        <i class="fa fa-tasks"></i>
                    </template>
                    <el-tabs value="third">
                        <el-tab-pane label="Custom" name="first">
                            <div class="music-custom">
                                <el-input placeholder="请输入内容" v-model="custom_api">
                                    <template slot="prepend">从自定义github仓获取音乐</template>
                                    <el-button slot="append" icon="el-icon-search" @click="loadCustomApi"></el-button>
                                </el-input>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="Visualize" name="second">
                            <div><canvas id="music_canvas" width="1080" height="250"></canvas></div>
                        </el-tab-pane>
                        <el-tab-pane label="Lyrics" name="third">
                            <div class="media-tags-container">
                                <div class="album-picture-container">
                                    <el-image 
                                        class="album-picture"
                                        fit="fill"
                                        :src="imgUrl">
                                        <div slot="placeholder" class="image-slot">
                                            加载中<span class="dot">...</span>
                                        </div>
                                        <div slot="error" class="image-slot">
                                            <div></div>
                                        </div>
                                    </el-image>
                                </div>
                                <div class="music-info-container">
                                    <div class="music-info-title">{{ musicTitle }}</div>
                                    <div class="music-info-data">
                                        <div>{{ musicAlbum }}</div>
                                        <div>{{ musicArtist }}</div>
                                    </div>
                                    <div class="music-lyrics" v-if="lyricsContent.length > 0">
                                        <div v-for="(lyrics, index) in lyricsContent"
                                            :time="lyrics.time"
                                            :key="index">
                                            {{ lyrics.content }}
                                        </div>
                                    </div>
                                    <div class="music-lyrics" v-else>{{ musicLyricsMsg }}</div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-collapse-item>
            </el-collapse>
            <div class="tips-msg">{{ tips_msg }}</div>
            <div class="music-control">
                <el-button-group>
                    <el-button type="primary" @click="playMusic">
                        <i class="fa" :class="{'fa-pause': status == 1, 'fa-play': status != 1}"></i>
                    </el-button>
                    <el-button type="primary" @click="stopMusic(true)"><i class="fa fa-stop"></i></el-button>
                    <el-button type="primary" @click="preMusic"><i class="fa fa-backward"></i></el-button>
                    <el-button type="primary" @click="nextMusic"><i class="fa fa-forward"></i></el-button>
                </el-button-group>
                <div class="music-progress-container">
                    <span>{{ current_time | formatSeconds }}</span>
                    <el-progress :percentage="percentage" :show-text="false" class="music-progress"></el-progress>
                    <span>{{ duration_time | formatSeconds }}</span>
                </div>
                <div class="music-volume-container">
                    <el-button plain class="volume-control-button control-button" @click="mutedPage">
                        <i class="fa" :class="muted ? 'fa-volume-off' : 'fa-volume-up'"></i>
                    </el-button>
                    <div class="volume-bar">
                        <el-slider v-model="volume" :show-tooltip="false" @input="resizeVolume"></el-slider>
                    </div>
                    <el-button plain class="control-button" @click="switchModel">
                        <i v-if="play_model === 0" class="fa fa-sort-numeric-asc"></i>
                        <i v-else-if="play_model === 1" class="fa fa-rotate-right"></i>
                        <i v-else class="fa fa-random"></i>
                    </el-button>
                    <el-button plain class="control-button" @click="$('.music-list').slideToggle()">
                        <i class="fa fa-th-list"></i>
                    </el-button>
                </div>
            </div>
            <el-input
                prefix-icon="el-icon-search"
                placeholder="仅供搜索，别想太多"
                v-model="filterText"
                clearable>
            </el-input>
            <div class="music-list" v-if="music_list.length > 0">
                <div v-for="(music, index) in music_list"
                    :index="index"
                    :key="music.sha"
                    @click="getMusicContent($event, music.download_url)">{{ index + 1 }}. {{ music.name }}  ( {{ (music.size / 1024 / 1024).toFixed(2) + 'M' }} )</div>
            </div>
            <div v-else>{{ music_msg }}</div>
        </div>
    `,
}