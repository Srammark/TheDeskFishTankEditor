<template>
    <div class="inputBox" :class="{ 'inputBox_error': error, 'inputBox_focus': isFocused }" :style="{ width: width }" @mousedown.stop @click.stop>
        <input
            ref="inputDom"
            class="form-input"
            spellcheck="false"
            :type="inputType"
            :maxlength="maxlength"
            :placeholder="placeholder"
            v-model="value"
            :readonly="readonly"
            @input="OnInput()"
            @focus="OnFocus()"
            @blur="OnBlur()"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import ConciseMenu from '../../ContextMenu_DLL/RightMenu/ConciseMenu/ConciseMenu';

const props = withDefaults(defineProps<{
    width?: string;
    placeholder?: string;
    text?: string;
    readonly?: boolean;
    number?: boolean;
    default?: string | number;
    minNum?: number | null;
    maxNum?: number | null;
    maxlength?: number;
}>(), {
    width: '100%',
    placeholder: '',
    text: '',
    readonly: false,
    number: false,
    default: '',
    minNum: null,
    maxNum: null,
    maxlength: 524288
});

const value = defineModel<string>('text', { default: '' });

defineExpose({
    Focus,
    Select
});

const emit = defineEmits<{
    (e: 'change', value: string): void;
    (e: 'focus'): void;
    (e: 'blur'): void;
}>();

const inputDom = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const error = ref(false);
const contextMenu = ConciseMenu.GetInstance();

const inputType = computed(() => props.number ? 'text' : 'text');

onMounted(() => {
    if (props.default !== '' && props.default !== undefined) {
        value.value = props.default.toString();
    }

    inputDom.value?.addEventListener('contextmenu', (e: MouseEvent) => {
        contextMenu.ShowContextMenu(e);
    });
});

watch(() => props.text, (newValue) => {
    value.value = newValue ?? '';
});

function OnInput(): void {
    if (props.number) {
        // 只允许数字、小数点和负号
        value.value = value.value.replace(/[^0-9.-]/g, '');

        // 验证数字格式
        if (!IsValidNumber(value.value)) {
            error.value = true;
            return;
        }

        error.value = false;
    }

    emit('change', value.value);
}

function OnFocus(): void {
    isFocused.value = true;
    error.value = false;
    emit('focus');
}

function OnBlur(): void
{
    isFocused.value = false;

    if (props.number && value.value !== '')
    {
        if (!IsValidNumber(value.value))
        {
            // 如果无效且有默认值，恢复默认值
            if (props.default !== '' && props.default !== undefined)
            {
                value.value = props.default.toString();
                error.value = false;
            }
            else
            {
                error.value = true;
            }
        }
        else
        {
            // 数值范围限制
            const numValue = Number(value.value);

            if (props.minNum !== null && numValue < props.minNum)
            {
                value.value = props.minNum.toString();
            }
            if (props.maxNum !== null && numValue > props.maxNum)
            {
                value.value = props.maxNum.toString();
            }
        }
    }

    emit('blur');
}

function IsValidNumber(val: string): boolean
{
    if (val === '' || val === '-') return true;

    const num = Number(val);
    return !isNaN(num) && isFinite(num);
}

function Focus(): void
{
    inputDom.value?.focus();
}

function Select(): void
{
    inputDom.value?.select();
}
</script>

<style scoped>
.inputBox {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid var(--sumiStudioCore-color-outline-variant);
    border-radius: 4px;
    background-color: var(--sumiStudioCore-color-surface);
    box-sizing: border-box;
    transition: border-color var(--sumiStudio-transition-time-medium) ease;
}

.inputBox:focus-within,
.inputBox_focus {
    border-color: var(--sumiStudioCore-color-primary);
}

.inputBox_error {
    border-color: var(--sumiStudioCore-color-error);
}

.form-input {
    flex: 1;
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--sumiStudioCore-color-surface-on);
    font-size: var(--sumiStudio-font-body-medium-size, 14px);
    line-height: 20px;
    padding: 0;
    margin: 0;
}

.form-input::placeholder {
    color: var(--sumiStudioCore-color-surface-variant-on);
}

.form-input:read-only {
    cursor: default;
}
</style>