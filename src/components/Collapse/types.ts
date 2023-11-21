// 使用 Ref 类型
import type { Ref, InjectionKey } from 'vue'
export type NameType = string | number

// v-model，accordion 控制手风琴效果
export interface CollapseProps {
    modelValue: NameType[]
    accordion?: boolean
}

export interface CollapseItemProps {
    name: NameType
    title?: string
    disabled?: boolean
}
export interface CollapseContent {
    activeNames: Ref<NameType[]>
    handleItemClick: (name: NameType) => void
}
// 事件 - change 为点击 title 时触发的事件
export interface CollapseEmits {
    (e: 'update:modelValue', values: NameType[]) : void
    (e: 'change', values: NameType[]) : void
}

export const collapseContentKey: InjectionKey<CollapseContent> = Symbol('collapseContentKey')