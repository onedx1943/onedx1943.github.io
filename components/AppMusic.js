export default {
    data: function () {
        return {
            music_api: 'https://api.github.com/repos/onedx1943/Music/contents',///CloudMusic/xixi
            music_list: [],
            music_msg: '正在读取文件...',
            tips_msg: '',
            audioContext: null,
            play_num: 0
        }
    },
    template: `
        <div>
            <div><canvas id="canvas"></canvas></div>
            <div>{{ tips_msg }}</div>
            <div>
                <button @click="preMusic()"><i class="fa fa-backward"></i></button>
                <button @click="playMusic()"><i class="fa fa-play"></i></button>
                <button @click="nextMusic()"><i class="fa fa-forward"></i></button>
                <button @click="stopMusic()"><i class="fa fa-stop"></i></button>
            </div>
            <div>音乐列表：</div>
            <div class="novel-list" v-if="music_list.length > 0">
                <div v-for="(music, index) in music_list"
                    :index="index"
                    :key="music.name"
                    @click="getMusicContent($event, music.download_url)">{{ index + 1 }}. {{ music.name }}</div>
            </div>
            <div v-else>{{ music_msg }}</div>
        </div>
    `,
    mounted: function () {
        //统一前缀，方便调用
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        //这里顺便也将requestAnimationFrame也打个补丁，后面用来写动画要用
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        this.getMusicList(this.music_api);
    },
    methods: {
        getMusicList: function (file_api) {
            let _this = this;
            axios.get(file_api)
                .then(function (response) {
                    for(let i = 0; i < response.data.length; i++){
                        if (response.data[i].name.endsWith('.mp3') || response.data[i].name.endsWith('.flac')) {
                            _this.music_list.push(response.data[i])
                        } else if (response.data[i].type === 'dir') {
                            let new_url = _this.music_api + '/' + response.data[i].path;
                            _this.getMusicList(new_url);
                        }
                    }
                }).then(() => {
                    // _this.music_list.sort();
                    // if (_this.music_list.length === 0) {
                    //     _this.music_msg = '没找到音乐文件啊！';
                    // }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        getMusicContent: function (event, music_url) {
            // fa-pause
            let _this = this;
            _this.tips_msg = '正在加载。。。';
            $('.novel-list .active-novel').removeClass('active-novel');
            $(event.currentTarget).addClass('active-novel');
            axios({
                method: 'get',
                url: music_url,
                responseType: 'arraybuffer'
            }).then(function (response) {
                if (_this.audioContext == null) {
                    try {
                        _this.audioContext = new AudioContext();
                    } catch (e) {
                        console.log('你的浏览器不支持AudioContext:(');
                        console.log(e);
                    }
                } else {
                    _this.audioContext.close();
                    _this.audioContext = new AudioContext();
                }

                let audioContext = _this.audioContext;
                audioContext.decodeAudioData(response.data, function(buffer) {
                    //解码成功则调用此函数，参数buffer为解码后得到的结果
                    //调用_visualize进行下一步处理
                    _this._visualize(audioContext, buffer);
                    _this.tips_msg = '';
                }, function(e) {
                    //这个是解码失败会调用的函数
                    console.log("!哎玛，文件解码失败:(");
                });
            }).catch(function (error) {
                console.log(error);
            });
        },
        _visualize: function(audioContext, buffer) {
            let audioBufferSourceNode = audioContext.createBufferSource(),
                analyser = audioContext.createAnalyser();
            //将source与分析器连接
            audioBufferSourceNode.loop = true; //循环播放
            audioBufferSourceNode.connect(analyser);
            //将分析器与destination连接，这样才能形成到达扬声器的通路
            analyser.connect(audioContext.destination);
            //将上一步解码得到的buffer数据赋值给source
            audioBufferSourceNode.buffer = buffer;
            //播放
            audioBufferSourceNode.start(0);
            //音乐响起后，把analyser传递到另一个方法开始绘制频谱图了，因为绘图需要的信息要从analyser里面获取
            this._drawSpectrum(analyser);
        },
        _drawSpectrum: function(analyser) {
            let canvas = document.getElementById('canvas'),
                cwidth = canvas.width,
                cheight = canvas.height - 2,
                meterWidth = 10, //频谱条宽度
                gap = 2, //频谱条间距
                capHeight = 2,
                capStyle = '#fff',
                meterNum = 800 / (10 + 2), //频谱条数量
                capYPositionArray = []; //将上一画面各帽头的位置保存到这个数组
            let ctx = canvas.getContext('2d'),
                gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(1, '#0f0');
            gradient.addColorStop(0.5, '#ff0');
            gradient.addColorStop(0, '#f00');
            let drawMeter = function() {
                let array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                //计算采样步长
                let step = Math.round(array.length / meterNum);
                ctx.clearRect(0, 0, cwidth, cheight);
                for (let i = 0; i < meterNum; i++) {
                    //获取当前能量值
                    let value = array[i * step];
                    if (capYPositionArray.length < Math.round(meterNum)) {
                        //初始化保存帽头位置的数组，将第一个画面的数据压入其中
                        capYPositionArray.push(value);
                    }
                    ctx.fillStyle = capStyle;
                    //开始绘制帽头
                    if (value < capYPositionArray[i]) {
                        //如果当前值小于之前值
                        //则使用前一次保存的值来绘制帽头
                        ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                    } else {
                        //否则使用当前值直接绘制
                        ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                        capYPositionArray[i] = value;
                    }
                    //开始绘制频谱条
                    ctx.fillStyle = gradient;
                    ctx.fillRect(i * 12, cheight - value + capHeight, meterWidth, cheight);
                }
                requestAnimationFrame(drawMeter);
            };
            requestAnimationFrame(drawMeter);
        },
        preMusic: function () {
            this.play_num -= 1;
            if (this.play_num == -1) {
                this.play_num = this.music_list.length - 1;
            }
            $('div[index=' + this.play_num + ']').click();
        },
        playMusic: function () {
            $('div[index=' + this.play_num + ']').click();
        },
        nextMusic: function () {
            this.play_num += 1;
            if (this.play_num == this.music_list.length) {
                this.play_num = 0;
            }
            $('div[index=' + this.play_num + ']').click();
        },
        stopMusic: function () {
            if (this.audioContext != null) {
                this.audioContext.close();
                this.audioContext = null;
            }
        },
    },
}