let Vue; // vue的构造函数

const forEach = (obj, callback) => {
    Object.keys(obj).forEach(key=>{
        callback(key,obj[key])
    })
};

class ModuleCollection {
    constructor(options){ // options其实就是我们的根模块
        this.register([], options);
    }
    register(path, rootModule){
        let newModule = {
            _raw: rootModule,
            _children: {},
            state: rootModule.state
        }
        if(path.length === 0){
            this.root = newModule
        }else {
            // reduce 如果数组为空 会传一个上一次的值，直接把传入的值返回
            let parent = path.slice(0, -1).reduce((root, current) => {
                return this.root._children[current]
            },this.root)
            parent._children[path[path.length - 1]] = newModule
        }
        if(rootModule.modules){
            forEach(rootModule.modules, (moduleName, module)=>{
                this.register(path.concat(moduleName), module)
            })
        }
    }
}

// 我需要递归收集 将结果挂载到getters mutations actions
const installModule = (store, state, path, rootModule) =>{
    if(path.length > 0){ // 子模块 把子模块的状态放到父模块上
        // [a] -> {age: 10}
        // [a,c] -> {age:10,a{x:1}}
        // {age:10,a:{x:1,c:{z:1},b:{y:1}}}
        let parent = path.slice(0,-1).reduce((state,current)=>{
            return state[current]
        },state);
        // vuex 依赖 vue, 动态增加属性
        Vue.set(parent,path[path.length - 1], rootModule.state)
    }

    // 先处理根模块的getters 属性
    let getters = rootModule._raw.getters
    if(getters){ // 给store 增加了getters属性
        forEach(getters,(getterName, fn) =>{
            Object.defineProperty(store.getters, getterName, {
                get:()=>{
                    return fn(rootModule.state)
                }
            })
        })
    }
    let mutations = rootModule._raw.mutations
    if(mutations){ // { syncAdd: [fn,fn] }
        forEach(mutations, (mutationName, fn) => {
            let arr = store.mutations[mutationName] || (store.mutations[mutationName] = [])
            arr.push((payload)=>{
                fn(rootModule.state,payload)
            })
        })
    }

    let actions = rootModule._raw.actions
    if(actions){ // { syncAdd: [fn,fn] }
        forEach(actions, (actionName, fn) => {
            let arr = store.actions[actionName] || (store.actions[actionName] = [])
            arr.push((payload)=>{
                fn(store,payload)
            })
        })
    }
    // rootModule._children
    forEach(rootModule._children,(moduleName, module)=>{
        installModule(store, store, path.concat(moduleName), module)
    })
}

class Store {
    constructor (options){
        this._vm = new Vue({ // 把对象变成监控对象, new Vue主要用到事件监听
            data:{
                state: options.state
            }
        })

        this.getters = {};
        this.mutations = {};
        this.actions = {};

        // 先格式化一下当前用户传递来的数据
        // 收集模块
        this.modules = new ModuleCollection(options);
        // this.$store 包含着getters mutations

        // 安装模块
        installModule(this, this.state, [], this.modules.root);
    };
    dispatch = (type, payload) => {
        this.actions[type].forEach(fn => fn(payload))
    };
    commit = (type, payload) => { // 找到对应的actions
        this.mutations[type].forEach(fn => fn(payload))
    };
    get state(){ // store state
        return this._vm.state;
    };
}

// vue 的组件渲染 先渲染父组件 再渲染子组件 子组件渲染完成后
// 再回来渲染父组件深度优先
const install = (_vue) => { // install 默认会被调用
    Vue = _vue;
    // 我需要给每个组件都注册一个this.$store的属性
    Vue.mixin({ // 混合
        beforeCreate() {
            // 需要先判别是父组件还是子组件，如果是子组件，应该把父组件
            // 的store增加给自组件
            if(this.$options && this.$options.store){
                this.$store = this.$options.store;
            }else {
                this.$store = this.$parent && this.$parent.$store
            }
        }
    })
};

export default {
    install,
    Store
}