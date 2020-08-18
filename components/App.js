export default {
    data: function () {
        return {
            github: 'https://github.com/onedx1943/onedx1943.github.io',
            msg: '',
        }
    },
    template: `
        <div>
            <div><router-link to="/">Go to Home</router-link></div>
            <div><a :href="github" target="_blank">Go to Github</a></div>
            <div>这是App页</div>
            <div><router-link to="/app/icon">Go to Icon</router-link></div>
            <div><router-link to="/app/test">Go to Test</router-link></div>
            <router-view></router-view>
        </div>
    `,
    created: function () {

    },
    mounted: function () {

    },
    methods: {

    }
}