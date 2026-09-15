<template>
    <div class="radio_group" role="radiogroup">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue';

const props = defineProps(
{
    /** 选中的值 */
    modelValue: [String, Number, Boolean],
    /** 是否禁用整个组 */
    disabled: Boolean
});

const emit = defineEmits(['update:modelValue', 'change']);
const selectedValue = toRef(props, 'modelValue');

// 向子组件提供 context
provide('custom-radio-group',
{
    selectedValue: selectedValue,
    disabled: toRef(props, 'disabled'),
    SetSelected: function (value: any)
    {
        emit('update:modelValue', value);
        emit('change', value);
    },
});
</script>

<style scoped>
.radio_group {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>