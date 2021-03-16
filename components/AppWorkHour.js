export default {
    data: function () {
        return {
            start_date: new Date(),
            work_hour: 0,
            total_hour: 0,
            date_list: [],
            today: new Date(new Date().toLocaleDateString()).getTime(),
        }
    },

    computed: {
        workHourType: function () {
            let hour = Number.parseFloat(this.total_hour);
            if (Number.isNaN(hour)) {
                return ''
            } else if (hour > 4) {
                return 'success'
            } else if (hour >= 0) {
                return 'warning'
            } else {
                return 'danger'
            }
        }
    },

    mounted: function () {
        let date = new Date(new Date(new Date().toLocaleDateString()).setDate(1));
        let mouth = `${date.getFullYear()}/${date.getMonth() + 1}`;
        let mouth_time = localStorage.getItem(mouth);
        if (mouth_time) {
            let mouth_time_obj = JSON.parse(mouth_time);
            this.start_date = new Date(mouth_time_obj.date);
            this.work_hour = mouth_time_obj.work_hour
        } else {
            this.start_date = date;
            this.work_hour = 0
        }
        this.work_mouth_picker(this.start_date);
    },

    methods: {
        work_mouth_picker: function (date) {
            this.start_date = date;
            let mouth = `${date.getFullYear()}/${date.getMonth() + 1}`;
            let mouth_time = localStorage.getItem(mouth);
            if (mouth_time) {
                let mouth_time_obj = JSON.parse(mouth_time);
                mouth_time_obj.date = date;
                this.work_hour = mouth_time_obj.work_hour;
                localStorage.setItem(mouth, JSON.stringify(mouth_time_obj))
            } else {
                this.work_hour = 0;
                let mouth_time_obj = {
                    date: this.start_date,
                    work_hour: this.work_hour
                };
                localStorage.setItem(mouth, JSON.stringify(mouth_time_obj))
            }
            this.setShowDate(new Date(date))
        },

        init_work_hour: function (work_hour) {
            let mouth = `${this.start_date.getFullYear()}/${this.start_date.getMonth() + 1}`;
            let mouth_time = localStorage.getItem(mouth);
            if (mouth_time) {
                let mouth_time_obj = JSON.parse(mouth_time);
                mouth_time_obj.work_hour = work_hour;
                localStorage.setItem(mouth, JSON.stringify(mouth_time_obj))
            } else {
                let mouth_time_obj = {
                    date: this.start_date,
                    work_hour: this.work_hour
                };
                localStorage.setItem(mouth, JSON.stringify(mouth_time_obj))
            }
            this.calculateTotalHour();
        },

        setShowDate: function (date) {
            this.date_list = [];
            let days_of_mouth = this.getDaysOfMouth(date);
            if (days_of_mouth.length === 0) {
                return
            }
            let weekday = days_of_mouth[0].getDay();
            let previous_day = 0;
            if (weekday === 0) {
                previous_day = 6;
            } else {
                previous_day = weekday - 1;
            }
            let one_day = 1000 * 60 * 60 * 24;
            // 添加上月的日期
            for (let i = 0; i < previous_day; i++) {
                this.date_list.unshift({
                    is_current_month: false,
                    date: new Date(days_of_mouth[0].getTime() - (i + 1) * one_day).toLocaleDateString(),
                    need_calculate: false
                })
            }
            // 添加本月的数据
            for (let day of days_of_mouth) {
                let time_range = [new Date(day.toLocaleDateString() + ' 09:00:00').getTime()];
                if ([1, 4].includes(day.getDay())) {
                    time_range.push(new Date(day.toLocaleDateString() + ' 20:30:00').getTime());
                } else {
                    time_range.push(new Date(day.toLocaleDateString() + ' 17:30:00').getTime());
                }
                let need_calculate = true;
                let account_time = this.calculateWorkHour(time_range);
                if ([0, 6].includes(day.getDay())) {
                    need_calculate = false;
                }
                let day_time = localStorage.getItem(day.toLocaleDateString());
                if (day_time) {
                    let day_time_obj = JSON.parse(day_time);
                    time_range = day_time_obj.time_range;
                    need_calculate = day_time_obj.need_calculate;
                    account_time = day_time_obj.account_time;
                }
                this.date_list.push({
                    is_current_month: true,
                    date: day.toLocaleDateString(),
                    time_range: time_range,
                    account_time: account_time,
                    need_calculate: need_calculate
                })
            }
            weekday  = this.date_list.length % 7;
            let next_day = 0;
            if (weekday === 0) {
                next_day = 0;
            } else {
                next_day = 7 - weekday;
            }
            // 添加下月的日期
            let next_mouth_days = 42 - this.date_list.length;
            for (let i = 0; i < next_mouth_days; i++) {
                this.date_list.push({
                    is_current_month: false,
                    date: new Date(days_of_mouth[days_of_mouth.length - 1].getTime() + (i + 1) * one_day).toLocaleDateString(),
                    need_calculate: false
                })
            }
            this.calculateTotalHour();
        },

        getDaysOfMouth: function (date) {
            let current_month_first_day = date.setDate(1);
            let next_month = date.getMonth() + 1;
            let next_month_first_day = new Date(date.getFullYear(), next_month, 1).getTime();
            let one_day = 1000 * 60 * 60 * 24;
            let days_of_mouth = [];
            for (let day = current_month_first_day; day < next_month_first_day; day += one_day) {
                days_of_mouth.push(new Date(day));
            }
            return days_of_mouth
        },

        dateFormat: function (date) {
            let time = new Date(date);
            return time.getMonth() + 1 + '-' + time.getDate()
        },

         significantDigits: function (num) {
            let digits = Number.parseFloat(num);
            if (Number.isNaN(digits)) {
                return '00'
            } else if (digits < 10) {
                return `0${digits}`
            } else {
                return `${digits}`
            }
         },

        timeFormat: function (time_range) {
            if (time_range) {
                return `${this.significantDigits(new Date(time_range[0]).getHours().toString())}:${this.significantDigits(new Date(time_range[0]).getMinutes().toString())} - ${this.significantDigits(new Date(time_range[1]).getHours().toString())}:${this.significantDigits(new Date(time_range[1]).getMinutes().toString())}`;
            } else {
                return ''
            }
        },

        switchCalculate: function (state, date) {
            let day_time = localStorage.getItem(date.date);
            if (day_time) {
                let day_time_obj = JSON.parse(day_time);
                day_time_obj.need_calculate = state;
                localStorage.setItem(date.date, JSON.stringify(day_time_obj))
            } else {
                let day_time_obj = {
                    time_range: date.time_range,
                    account_time: date.account_time,
                    need_calculate: state
                };
                localStorage.setItem(date.date, JSON.stringify(day_time_obj))
            }
            this.calculateTotalHour();
        },

        calculateToday: function (time_range, date) {
            date.account_time = this.calculateWorkHour(time_range);
            let day_time = localStorage.getItem(date.date);
            if (day_time) {
                let day_time_obj = JSON.parse(day_time);
                day_time_obj.time_range = time_range;
                day_time_obj.account_time = date.account_time;
                localStorage.setItem(date.date, JSON.stringify(day_time_obj))
            } else {
                let day_time_obj = {
                    time_range: date.time_range,
                    account_time: date.account_time,
                    need_calculate: true
                };
                localStorage.setItem(date.date, JSON.stringify(day_time_obj))
            }
            this.calculateTotalHour();
        },

        calculateWorkHour: function (time_range) {
            let work_hour = 0;
            if (time_range) {
                let hour_start = new Date(time_range[0]).getHours();
                let minute_start = new Date(time_range[0]).getMinutes();
                let second_start = new Date(time_range[0]).getSeconds();
                if (hour_start < 8) {
                    hour_start = 8;
                    minute_start = 0;
                    second_start = 0;
                } else if (hour_start === 12 || (hour_start === 13 && minute_start < 30)) {
                    hour_start = 13;
                    minute_start = 30;
                    second_start = 0;
                } else if (hour_start > 17) {
                    return work_hour
                }
                let hour_end = new Date(time_range[1]).getHours();
                let minute_end = new Date(time_range[1]).getMinutes();
                let second_end = new Date(time_range[1]).getSeconds();
                if (hour_end === 17 && minute_end >= 30) {
                    hour_end = 17;
                    minute_end = 30;
                    second_end = 0;
                } else if (hour_end === 12 || (hour_end === 13 && minute_end < 30)) {
                    hour_end = 12;
                    minute_end = 0;
                    second_end = 0;
                } else if (hour_end < 8) {
                    return work_hour
                }
                work_hour = (hour_end - hour_start) * 3600 + (minute_end - minute_start) * 60 + (second_end - second_start);
                if (hour_start < 12 && hour_end > 12) {
                    work_hour -= 5400;
                }
                if (hour_start < 18 && hour_end > 17) {
                    work_hour -= 1800;
                }
                return (work_hour / 3600).toFixed(2)
            } else {
                return work_hour
            }
        },

        calculateTotalHour: function () {
            let work_hour_count = Number.parseFloat(this.work_hour);
            if (Number.isNaN(work_hour_count)) {
                work_hour_count = 0;
            }
            for (let day of this.date_list) {
                if (day.need_calculate && new Date(day.date).getTime() >= new Date(this.start_date).getTime()) {
                    work_hour_count += Number.parseFloat(day.account_time) - 8
                }
            }
            this.total_hour = work_hour_count.toFixed(2);
        }
    },

    template: `
        <div>
            <el-form label-position="right" label-width="160px">
                <el-form-item label="开始统计时间：">
                    <el-date-picker
                        v-model="start_date"
                        type="date"
                        placeholder="选择日期"
                        :clearable="false"
                        :editable="false"
                        :picker-options="{'firstDayOfWeek': 1}"
                        @change="work_mouth_picker($event)">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="初始工时：">
                    <el-input class="work_hour_input" v-model="work_hour" placeholder="请输入内容" @change="init_work_hour($event)"></el-input>
                </el-form-item>
                <el-form-item label="结算工时：">
                    <el-tag effect="dark" :type="workHourType">{{ total_hour }}</el-tag>
                </el-form-item>
            </el-form>
            <el-divider></el-divider>
            <div class="date-list" v-if="date_list.length > 0">
                <div class="title-content" 
                    v-for="name in ['一', '二', '三', '四', '五', '六', '日']"
                    :key="name">{{ name }}</div>
                <div class="date-content" 
                    v-for="date in date_list" 
                    :class="{'current_month': date.is_current_month, 'today': new Date(date.date).getTime() == today, 'yesterday': new Date(date.date).getTime() < today}" :key="date.date">
                    <div class="date-content-row">
                        <div>{{ dateFormat(date.date) }}</div>
                        <div>
                            <el-switch v-if="date.is_current_month" v-model="date.need_calculate" 
                                @change="switchCalculate($event, date)"></el-switch>
                        </div>
                    </div>
                    <div class="date-content-row" v-if="date.is_current_month && date.need_calculate">
                        <div class="account_time"><el-tag>{{ date.account_time }}</el-tag></div>
                    </div>
                    <div class="date-content-row" v-if="date.is_current_month && date.need_calculate">
                        <div>
                            <el-popover
                                width="350"
                                trigger="click">
                                <div class="date-setting">
                                    <el-time-picker
                                        is-range
                                        v-model="date.time_range"
                                        :clearable="false"
                                        range-separator="至"
                                        @change="calculateToday($event, date)">
                                    </el-time-picker>
                                </div>
                                <div slot="reference">{{ timeFormat(date.time_range) }}</div>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
}