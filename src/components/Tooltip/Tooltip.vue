<template>
    <div
        class="tn-tooltip"
        ref="popperContainerNode"
        v-on="outerEvents"
    >
        <div
            class="tn-tooltip__trigger"
            ref="triggerNode"
            v-on="events"
        >
            <slot></slot>
        </div>
        <Transition :name="transition">
            <div
                v-if="isOpen"
                class="tn-tooltip__popper"
                ref="popperNode"
            >
                <slot name="content">{{ content }}</slot>
                <div id="arrow" data-popper-arrow></div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import type { TooltipProps, TooltipEmits, TooltipInstance } from './types'
import type { Instance } from '@popperjs/core'
import { createPopper } from '@popperjs/core'
import { ref, reactive, watch, onUnmounted, computed } from 'vue'
import useClickOutside from '../../hooks/useClickOutside'
import { debounce } from 'lodash-es'
defineOptions({
    name: 'TnTooltip'
})
const props = withDefaults(defineProps<TooltipProps>(), {
    // 设置默认值
    placement: 'bottom',
    trigger: 'hover',
    tiansition: 'fade',
    openDelay: 0,
    closeDelay: 0
})
const emits = defineEmits<TooltipEmits>()
// 响应式对象控制显示隐藏
const isOpen = ref(false)
const popperNode = ref<HTMLElement>()
const triggerNode = ref<HTMLElement>()
const popperContainerNode = ref<HTMLElement>()
let popperInstance: null | Instance = null
let events: Record<string, any> = reactive({})
let outerEvents: Record<string, any> = reactive({})
let openTimes = 0
let closeTimes = 0
const popperOptions = computed(() => {
    return {
        placement: props.placement,
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 9]
                }
            }
        ],
        ...props.popperOptions
    }
})

const open = () => {
    openTimes++
    console.log('trgger times', openTimes)
    isOpen.value = true
    emits('visible-change', true)
}
const close = () => {
    closeTimes++
    console.log('close times', closeTimes)
    isOpen.value = false
    emits('visible-change', false)
}
const openDebounce = debounce(open, props.openDelay)
const closeDebounce = debounce(close, props.closeDelay)

const openFinal = () => {
    closeDebounce.cancel()
    openDebounce()
}
const closeFinal = () => {
    openDebounce.cancel()
    closeDebounce()
}
const togglePoper = () => {
    if (isOpen.value) {
        closeDebounce()
    } else {
        openDebounce()
    }
}
useClickOutside(popperContainerNode, () => {
    if (props.trigger === 'click' && isOpen.value && !props.manual) {
        closeFinal()
    }
})
const attachEvents = () => {
    if (props.trigger === 'hover') {
        events['mouseenter'] = openFinal
        outerEvents['mouseleave'] = closeFinal
    } else if (props.trigger === 'click') {
        events['click'] = togglePoper
    }
}
if (!props.manual) {
    attachEvents()
}
watch(() => props.manual, (isManual) => {
    if (isManual) {
        events = {}
        outerEvents = {}
    } else {
        attachEvents()
    }
})
watch(() => props.trigger, (newTrigger, oldTrigger) => {
    if (newTrigger !== oldTrigger) {
        events = {}
        outerEvents = {}
        attachEvents()
    }
})
watch(isOpen, (newValue) => {
    if (newValue) {
        // 创建或销毁
        if (triggerNode.value && popperNode.value) {
            popperInstance = createPopper(triggerNode.value, popperNode.value, popperOptions.value)
        } else {
            popperInstance?.destroy()
        }
    }
}, { flush: 'post' })
onUnmounted(() => {
    popperInstance?.destroy()
})
defineExpose<TooltipInstance>({
    'show': openFinal,
    'hide': closeFinal
})
</script>

<style scoped>

</style>