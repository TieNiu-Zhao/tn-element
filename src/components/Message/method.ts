import { render, h, shallowReactive } from 'vue'
import type { CreateMessageProps, MessageContext } from './types'
import MessageConstructor from './Message.vue'
import useZIndex from '../../hooks/useZIndex'
let seed = 1        // id 计数器
const instances: MessageContext[] = shallowReactive([])      // 中枢 instances
export const createMessage = (props: CreateMessageProps) => {
    const { nextZIndex } = useZIndex()
    const id = `message_${seed++}`      // 每次新建Message 计数器就加一
    const container = document.createElement('div')  // 容器
    const destroy = () => {
        // 删除数组中的实例
        const idx = instances.findIndex(instance => instance.id === id)
        if (idx === -1) return
        instances.splice(idx, 1)
        render(null, container)             // 销毁 DOM
    }
    // 手动删除 - 即手动调整组件中 visible 的值
    const manualDestroy = () => {
        const instance = instances.find(instance => instance.id === id)
        if (instance) {
            instance.vm.exposed!.visible.value = false
        }
    }
    const newProps = {
        ...props,
        id,
        zIndex: nextZIndex(),
        onDestroy: destroy
    }
    const vnode = h(MessageConstructor, newProps)       // VNode
    render(vnode, container)    // 把 vnode渲染到 div 中
    // 再把 div 内的内容加到 body 上
    document.body.appendChild(container.firstElementChild!) // !表示此变量不为 null 或 undefined
    const vm = vnode.component!
    const instance = {
        id,
        vnode,
        vm,
        props: newProps,
        destroy: manualDestroy
    }
    instances.push(instance)
    return instance
}

export const getLastInstance = () => {
    return instances.at(-1)     // 拿到数组最后一项
}
// 计算上一个组件底部的 top
export const getLastBottomOffset = (id: string) => {
    const idx = instances.findIndex(instance => instance.id === id) 
    // 第一项为 0
    if (idx <= 0) {
        return 0
    } else {
        // 取前一项的 exposed
        const prev = instances[idx - 1]
        // vm 实例是异步的，必须等组件创建后才有值
        return prev.vm.exposed!.bottomOffset.value
    }
}