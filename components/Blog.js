export default {
    data: function () {
        return {
            github: 'https://github.com/onedx1943/onedx1943.github.io',
            msg: '这啥也没有啊',
        }
    },
    template: `
        <div>
            <div><router-link to="/">Go to Home</router-link></div>
            <div><a :href="github" target="_blank">Go to Github</a></div>
            <div>这是Blog页</div>
            <div>{{ msg }}</div>
        </div>
    `,
    created: function () {

    },
    mounted: function () {

    },
    methods: {

    }
}