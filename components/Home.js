export default {
    mounted: function () {
        particlesJS.load('particles', 'static/file/particles.json');
    },

    template: `
        <div class="home-content">
            <router-link to="/app" class="home-content-button">Go to App</router-link>
            <router-link to="/blog" class="home-content-button">Go to Blog</router-link>
            <div id="particles"></div>
        </div>
    `
}