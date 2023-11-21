import type { VNode, ComponentInternalInstance } from 'vue'
export interface MessageProps {
    message?: string | VNode
    duration?: number
    showClose?: boolean
    type?: 'success' | 'info' | 'warning' | 'error'
    onDestroy: () => void
    id: string
    zIndex: number
    offset?: number
    transitionName?: string
}

export interface MessageContext {
    id: string
    vnode: VNode
    vm: ComponentInternalInstance
    props: MessageProps
    destroy: () => void
}

// onDestroy 是必须属性，而不想让用户自己手写再组件上 - 忽略没传 onDestroy 的报错
export type CreateMessageProps = Omit<MessageProps, 'onDestroy' | 'id' | 'zIndex'>