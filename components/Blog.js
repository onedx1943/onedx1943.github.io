export default {
    data: function () {
        return {
            msg: '瞅啥呢，这里啥也没有啊 ʅ（´◔౪◔）ʃ',
        }
    },
    template: `
        <div>
            <page-header></page-header>
            <div class="page-blog">
                <div>这是Blog页</div>
                <div>{{ msg }}</div>
            </div>
        </div>
    `,
    created: function () {

    },
    mounted: function () {

    },
    methods: {

    }
}