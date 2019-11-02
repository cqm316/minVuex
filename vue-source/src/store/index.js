import Vue from 'vue'
import Vuex from '../vuex'

Vue.use(Vuex); // 用插件会默认调用这个库的install

export default new Vuex.Store({
    // 把项目分成很多模块
    modules: {
        a:{
            state: {
                x : 1
            },
            // 获取的时候 {{this.$store.getters.a.getA}} -> 报错
            // 所以 应该肢解取 {{this.$store.getters.getA}}
            getters:{
                getA(state){
                    return state.x + 100 + 'a'
                }
            },
            mutations: { // 发布订阅，他会把同名的放到 mutations里面
                // syncAdd(state, payload){ // {'syncAdd': [fn,fn]}
                //     console.log('a-module') // 调用下面的syncAdd，这里也会执行
                // },
                changeX(state, payload){
                    state.x = 100
                    console.log(state)
                }
            }
        },
        b:{
            state: {
                y : 1
            }
        }
    },
    state: {
        age: 10
    },
    getters:{
        myAge(state){
            return state.age * 2
        }
    },
    mutations: {
        syncAdd(state, payload) {
            state.age += payload
        },
        syncMinus(state, payload){
            state.age -= payload
        }
    },
    actions: {
        syncMinus({commit, dispatch}, payload){
            setTimeout(()=>{
                commit('syncMinus', payload);
            }, 1000)
        }
    }
})
