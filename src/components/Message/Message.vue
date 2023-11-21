<template>
    <Transition 
        :name="transitionName"
        @after-leave="destroyComponent"
        @enter="updateHeight"
    >
        <div
            class="tn-message"
            role="alert"
            :class="{
                [`tn-message--${type}`]: type,
                'is-close': showClose
            }"
            v-show="visible"
            ref="messageRef"
            :style="cssStyle"
            @mouseenter="clearTimer"
            @mouseleave="startTimer"
        >
            <div class="tn-message__content">
                <slot>
                    <RenderVNode v-if="message" :vNode="message"></RenderVNode>
                </slot>
            </div>
            <div class="tn-message__close" v-if="showClose">
                <Icon icon="xmark" @click.stop="visible = false"></Icon>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import type { MessageProps } from './types'
import RenderVNode from '../Common/RenderVnode'
import Icon from '../Icon/Icon.vue'
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import { getLastBottomOffset } from './method'
import useEventListener from '../../hooks/useEventListener'
const props = withDefaults(defineProps<MessageProps>(), {
    type: 'info',
    duration: 3000,
    offset: 20,
    transitionName: 'fade-up'
})
// Message 的 DOM
const messageRef = ref<HTMLElement>()
// 计算偏移高度 - div 的高度
const height = ref(0)
// 上一个实例底部坐标（第一个是0）
const lastBottomOffset = computed(() => getLastBottomOffset(props.id))
// 这个元素应该使用的 top
const topOffset = computed(() => props.offset + lastBottomOffset.value)
// 为下一个元素预留的 offset, 即它的 bottom 值
const bottomOffset = computed(() => height.value + topOffset.value)
const cssStyle = computed(() => ({
    top: topOffset.value + 'px',
    zIndex: props.zIndex
}))
const visible = ref(false)
let timer: any
function startTimer() {
    // 实现一定时间后隐藏 - 更改 visible
    if (props.duration === 0) return // 计时器设置为 0 永远不关闭
    timer = setTimeout(() => {
        visible.value = false
    }, props.duration)
}
function clearTimer() {
    clearTimeout(timer)
}
onMounted(async () => {
    visible.value = true
    startTimer()
    // await nextTick()
    // height.value = messageRef.value!.getBoundingClientRect().height // 拿到 div 的高度
})
function keydown(e: Event) {
    const event = e as KeyboardEvent
    if (event.code === 'Escape') {
        visible.value = false
    }
}
useEventListener(document, 'keydown', keydown)
// watch(visible, (newValue) => {
//     if (!newValue) {
//         // 隐藏时直接销毁
//         props.onDestroy()
//     }
// })
function destroyComponent() {
    props.onDestroy()
}
function updateHeight() {
    height.value = messageRef.value!.getBoundingClientRect().height
}
defineExpose({
    bottomOffset,
    visible
})
</script>