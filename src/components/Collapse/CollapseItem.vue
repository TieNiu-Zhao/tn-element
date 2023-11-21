<template>
    <div 
        class="tn-collapse-item"
        :class="{
            'is-disabled': disabled
        }" 
    >
        <!-- 标题 - 下划线表示基于此元素，是一种命名规范，改变样式采用中划线 -->
        <div
            class="tn-collapse-item__header"
            :class="{
                'is-disabled': disabled,
                'is-active': isActive
            }"
            :id='`item-header-${name}`'
            @click="handleClick"
        >
            <slot name="title">{{ title }}</slot>
            <Icon icon="angle-right" class="header-angle"></Icon>
        </div>
        <!-- 内容 -->
        <Transition name="slide" v-on="transitionEvents">
            <div class="tn-collapse-item__wrapper" v-show="isActive">
                <div class="tn-collapse-item__content" :id="`item-content-${name}`">
                    <slot></slot>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import type { CollapseItemProps } from './types'
import { collapseContentKey } from './types'
import Icon from '../Icon/Icon.vue'
defineOptions({
    name: 'TnCollapseItem'
})
const props = defineProps<CollapseItemProps>()
const collapseContext = inject(collapseContentKey)
// 包含说明状态为打开，不包含说明关闭-
const isActive = computed(() => collapseContext?.activeNames.value.includes(props.name))
// 处理函数
const handleClick = () => {
    if (props.disabled) { return }
    collapseContext?.handleItemClick(props.name)
}
// Transition 动画事件钩子 - 参考 vue 文档
const transitionEvents: Record<string, (el: HTMLElement) => void> = {
    beforeEnter(el) {
        el.style.height = '0px'
        el.style.overflow = 'hidden'
    },
    enter(el) {
        el.style.height = `${el.scrollHeight}px`
    },
    afterEnter(el) {
        el.style.height = ''
        el.style.overflow = ''
    },
    beforeLeave(el) {
        el.style.height = `${el.scrollHeight}px`
        el.style.overflow = 'hidden'
    },
    leave(el) {
        el.style.height = '0px'
    },
    afterLeave(el) {
        el.style.height = ''
        el.style.overflow = ''
    },
}
</script>

<style>
.tn-collapse-item__header {
    font-size: 30px;
}
</style>