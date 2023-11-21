<template>
    <div
        class="tn-dropdown"
    >
        <Tooltip
            :trigger="trigger"
            :placement="placement"
            :popper-options="popperOptions"
            :open-delay="openDelay"
            :close-delay="closeDelay"
            @visable-change="visibleChange"
            ref="tooltipRef"
        >
            <slot></slot>
            <template #content>
                <ul class="tn-dropdown__menu">
                    <template v-for="item in menuOptions" :key="item.key">
                        <li
                            v-if="item.divided"
                            role="separator"
                            class="divided-placeholder"
                        >
                        </li>
                        <li 
                            class="tn-dropdown__item"
                            @click="itemClick(item)"
                            :class="{'is-disabled': item.disabled, 'is-divided': item.disabled}"
                            :id="`dropdown-item-${item.key}`"
                        >
                            <RenderVnode :vNode="item.label"></RenderVnode>
                        </li>
                    </template>
                </ul>
            </template>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import type { DropdownProps, DropdownEmits, DropdownInstance, MenuOption } from './types'
import type { Ref } from 'vue'
import type { TooltipInstance } from '../Tooltip/types'
import Tooltip from '../Tooltip/Tooltip.vue'
import { ref } from 'vue'
import RenderVnode from '../Common/RenderVnode'
defineOptions({
    name: 'TnDropdown'
})
const props = withDefaults(defineProps<DropdownProps>(), { hideAfterClick: true })
const emits = defineEmits<DropdownEmits>()
// 获取 Tooltip 实例
const tooltipRef = ref() as Ref<TooltipInstance>
const visibleChange = (e: boolean) => {
    emits('visible-change', e)
}
const itemClick = (e: MenuOption) => {
    if (e.disabled) return
    emits('select', e)
    if (props.hideAfterClick) {
        tooltipRef.value.hide()
    }
}
defineExpose({
    show: tooltipRef.value?.show,
    hide: tooltipRef.value?.hide
})
</script>

<style scoped>

</style>