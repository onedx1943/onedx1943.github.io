//引入全局变量
import globalVariable from './global_variable.js'
Vue.prototype.GLOBAL = globalVariable;

// 1. 定义 (路由) 组件。引入组件。
import Home from '../../../components/Home.js';

import App from '../../../components/App.js';
import AppIndex from '../../../components/AppIndex.js';
import AppIcon from '../../../components/AppIcon.js';
import AppNovels from '../../../components/AppNovels.js';
import AppMusic from '../../../components/AppMusic.js';
import AppVideo from '../../../components/AppVideo.js';
import AppWorkHour from '../../../components/AppWorkHour.js';

import Blog from '../../../components/Blog.js';

// 2. 定义路由。
const routes = [
    { path: '/', component: Home },
    { path: '/app', component: App,
      children: [
          { path: '/', component: AppIndex },
          { path: 'icon', component: AppIcon },
          { path: 'novel', component: AppNovels },
          { path: 'music', component: AppMusic },
          { path: 'video', component: AppVideo },
          { path: 'work-hour', component: AppWorkHour },
      ]
    },
    { path: '/blog', component: Blog },
];

// 3. 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
    routes // (缩写) 相当于 routes: routes
});

// 4. 创建和挂载根实例。
const app = new Vue({
    router
}).$mount('#app');
