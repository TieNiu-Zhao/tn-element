import { computed, defineComponent, Fragment, ref } from 'vue'
import Tooltip from '../Tooltip/Tooltip.vue'
import type { PropType } from 'vue'
import type { Placement, Options } from '@popperjs/core'
import type { MenuOption } from './types'
import type { TooltipInstance } from '../Tooltip/types'
export default defineComponent({
  name: 'TnDropdown',
  props: {
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom'
    },
    trigger: {
      type: String as PropType<'hover' | 'click'>,
      default: 'hover'
    },
    transition: {
      type: String,
      default: 'fade'
    },
    openDelay: {
      type: Number,
      default: 0
    },
    closeDelay: {
      type: Number,
      default: 0,
    },
    popperOptions: {
      type: Object as PropType<Options>,
    },
    menuOptions: {
      type: Array as PropType<MenuOption[]>,
      required: true
    },
    hideAfterClick: {
      type: Boolean,
      default: true
    },
    manual: {
      type: Boolean
    }
  },
  emits: ['visible-change', 'select'],
  setup(props, { slots, emit, expose }) {
    const tooltipRef = ref<TooltipInstance | null>(null)
    const itemClick = (e: MenuOption) => {
      if (e.disabled) {
        return
      }
      emit('select', e)
      if (props.hideAfterClick) {
        tooltipRef.value?.hide()
      }
    }
    const visibleChange = (e:boolean) => {
      emit('visible-change', e)
    }
    const options = computed(() => {
      return props.menuOptions.map(item => {
        return (
          // 空节点 Fragment
          <Fragment key={item.key}>
            { item.divided ? <li role="separator" class="divided-placeholder"/> : '' }
            <li // 动态 class：静态设置为永久为 true
              class={{'tn-dropdown__item': true, 'is-disabled': item.disabled, 'is-divided': item.divided }}
              id={`dropdown-item-${item.key}`}
              onClick={() => itemClick(item)}
            >
              { item.label }
            </li>
          </Fragment>
        )
      })
    })
    // 暴露实例
    expose({
      // expose 暴露出去时比 setup 执行要早，使用闭包，使得再次调用时触发
      show: () => tooltipRef.value?.show(),
      hide: () => tooltipRef.value?.hide()
    })
    return () => (
      <div
        class="tn-dropdown"
      >
        <Tooltip 
          trigger={props.trigger} 
          placement={props.placement}
          popperOptions={props.popperOptions}
          openDelay={props.openDelay}
          closeDelay={props.closeDelay}
          manual={props.manual}
          ref={tooltipRef}
          onVisibleChange={visibleChange}
        >
          {{
            // 插槽
            default: () => slots.default && slots.default(),
            // 具名插槽
            content: () => (
              <ul class="tn-dropdown__menu">
                { options.value }
              </ul>
            )
          }}
        </Tooltip>
      </div>
    )
  }
})