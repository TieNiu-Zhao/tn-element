import { defineComponent } from 'vue'
const RenderVnode = defineComponent({
    props: {
        vNode: {
            type: [String, Object],
            required: true      // 必选
        }
    },
    setup(props) {
        return () => props.vNode
    }
})

export default RenderVnode