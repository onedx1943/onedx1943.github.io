export default {
    data: function () {
        return {
            msg: '瞅啥呢，这里啥也没有啊 ʅ（´◔౪◔）ʃ',
        }
    },

    created: function () {

    },

    mounted: function () {

    },

    methods: {

    },

    template: `
        <div class="page-container">
            <page-header></page-header>
            <div class="page-blog">
                <div>这是Blog页</div>
                <div>{{ msg }}</div>
            </div>
        </div>
    `,
}