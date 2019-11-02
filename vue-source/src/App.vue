<template>
    <div id="app">
        {{this.$store.state.age}}
        <br/>我的年龄 {{this.$store.getters.myAge}}
        <button @click="add">同步 点击按钮增加10</button>
        <button @click="minus">异步 减的操作</button>
        {{ this.$store.getters.getA }}
        {{ this.$store.a.x }}
        <button @click="changeX()">更新</button>
        {{ this.$store.a.x }}
    </div>
</template>

<script>
    export default {
        name: 'app',
        mounted() {
            // setTimeout(()=>{
            //     console.log(this.$store.state.age)
            //     this.$store.state.age = 5
            // })
        },
        methods:{
            add(){
                this.$store.commit('syncAdd',10)
            },
            minus(){
                this.$store.dispatch('syncMinus',10)
            },
            changeX(){
                this.$store.commit('changeX')
                console.log(this.$store.a.x)
            }
        },
    }
</script>

<style>

</style>
