import { describe, test, expect } from "vitest"
import { mount } from '@vue/test-utils'
import Button from './Button.vue'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import Icon from '../Icon/Icon.vue'

describe('Button.vue', () => {
    test('basic button', () => {
        const wrapper = mount(Button, {
            props: {
                type: 'primary'
            },
            slots: {
                default: 'button'
            }
        })
        console.log(wrapper.html())
        // 使用 classes() 拿到 DOM 节点上的 class，使用 toContain 判断是否包含类名
        expect(wrapper.classes()).toContain('tn-button--primary')
        // 使用 get 或 find 遍历对应的 wrapper
        expect(wrapper.get('button').text()).toBe('button')
        // 使用 trigger 触发对应事件，使用 emitted() 拿到所有发送出去的事件
        wrapper.get('button').trigger('click')
        console.log(wrapper.emitted())
        // 判断事件中是否有 click
        expect(wrapper.emitted()).toHaveProperty('click')
    })
    test('disabled', () => {
        const wrapper = mount(Button, {
            props: {
                disabled: true
            },
            slots: {
                default: 'disabled'
            }
        })
        // 在 wrapper 上直接 attributes 拿到属性
        expect(wrapper.attributes('disabled')).toBeDefined()
        // 或者拿到真实节点并获取属性
        expect(wrapper.find('button').element.disabled).toBeDefined()
        wrapper.get('button').trigger('click')
        expect(wrapper.emitted()).not.toHaveProperty('click')
    })
    test('icon', () => {
        const wrapper = mount(Button, {
            props: {
                icon: 'arrow-up'
            },
            slots: {
                default: 'icon'
            },
            global: {
                stubs: ['FontAwesomeIcon']
            }
        })
        const iconElement = wrapper.findComponent(FontAwesomeIcon)
        expect(iconElement.exists()).toBeTruthy()
        expect(iconElement.attributes('icon')).toBe('arrow-up')
    })
    test('loading', () => {
        const wrapper = mount(Button, {
            props: {
                loading: true
            },
            slots: {
                default: 'loading'
            },
            global: {
                stubs: ['Icon']
            }
        })
        console.log(wrapper.html())
        const iconElement = wrapper.findComponent(Icon)
        expect(iconElement.exists()).toBeTruthy()
        expect(iconElement.attributes('icon')).toBe('spinner')
        expect(wrapper.attributes('disabled')).toBeDefined()
    })
})