import { ref, computed } from 'vue'

const zIndex = ref(0)
const useZIndex = (initialValue = 2000) => {
    const initialZIndex = ref(initialValue)
    const currentZIndex = computed(() => zIndex.value + initialValue)
    const nextZIndex = () => {
        zIndex.value++
        return currentZIndex.value
    }
    return {
        currentZIndex,
        nextZIndex,
        initialZIndex
    }
}
export default useZIndex