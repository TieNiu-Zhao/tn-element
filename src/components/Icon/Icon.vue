<!-- 将所有 fontawesome 的属性透传到 font-awesome-icon 组件上 -->
<template>
    <i 
        class="tn-icon"
        :class="{[`tn-icon--${type}`] : type }"
        :style="customStyles"
        v-bind="$attrs"
    >
        <font-awesome-icon v-bind="filteredProps"/>
    </i>
</template>

<script setup lang="ts">
import type { IconProps } from './types'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { omit } from 'lodash-es'
import { computed } from 'vue'
defineOptions({
    name: 'TnIcon',
    inheritAttrs: false
})
// 要将属性过滤一下，使用 lodash 的 omit 函数
const props = defineProps<IconProps>()
const filteredProps = computed(() => omit(props, ['type', 'color']))
const customStyles = computed(() => {
    return props.color ? { color: props.color } : {}
})
</script>

<style>

</style>