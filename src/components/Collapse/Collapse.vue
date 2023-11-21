<!-- 父组件很简单，只负责展示，使用 slot -->
<template>
    <div class="tn-collapse">
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
import { ref, provide, watch } from 'vue'
import type { NameType, CollapseProps, CollapseEmits } from './types'
import { collapseContentKey } from './types'
defineOptions({
    name: 'TnCollapse'
})
const props = defineProps<CollapseProps>()
const emits = defineEmits<CollapseEmits>()
// 处理数组变化
const activeNames = ref<NameType[]>(props.modelValue)
// 一旦 props 传递给本地的 ref，就要想到用 watch 解决异步 DOM 更新问题
watch(() => props.modelValue, () => {
    activeNames.value = props.modelValue
})
if (props.accordion && activeNames.value.length > 1) {
    console.warn('accordion mode should only have one active item')
}
// 这个函数要传到子组件中调用
const handleItemClick = (item: NameType) => {
    // 手风琴
    if (props.accordion) {
        activeNames.value = [ activeNames.value[0] === item ? '' : item ]
    } else {
        const index = activeNames.value.indexOf(item)
        if (index > -1) {
            // 存在，删除数组中对应的项
            activeNames.value.splice(index, 1)
        } else {
            // 不存在，插入对应的 name
            activeNames.value.push(item)
        }
        emits('update:modelValue', activeNames.value)
        emits('change', activeNames.value)
    }
}
// 传递给子组件
provide(collapseContentKey, {
    activeNames,
    handleItemClick
})
</script>