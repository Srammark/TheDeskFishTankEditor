<template>
    <div class="textArea" :class="{ 'textArea_error': error, 'textArea_focus': isFocused }" :style="{ width: width }" @mousedown.stop @click.stop>
        <textarea
            ref="textareaDom"
            class="form-textarea"
            spellcheck="false"
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
import { onMounted, ref, watch } from 'vue';
import ConciseMenu from '../../ContextMenu_DLL/RightMenu/ConciseMenu/ConciseMenu';

const props = withDefaults(defineProps<{
    width?: string;
    placeholder?: string;
    text?: string;
    readonly?: boolean;
    default?: string;
}>(), {
    width: '100%',
    placeholder: '',
    text: '',
    readonly: false,
    default: ''
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

const textareaDom = ref<HTMLTextAreaElement | null>(null);
const isFocused = ref(false);
const error = ref(false);
const contextMenu = ConciseMenu.GetInstance();

onMounted(() => {
    if (props.default !== '' && props.default !== undefined) {
        value.value = props.default;
    }

    textareaDom.value?.addEventListener('contextmenu', (e: MouseEvent) => {
        contextMenu.ShowContextMenu(e);
    });
});

watch(() => props.text, (newValue) => {
    value.value = newValue ?? '';
});

function OnInput(): void {
    emit('change', value.value);
}

function OnFocus(): void {
    isFocused.value = true;
    error.value = false;
    emit('focus');
}

function OnBlur(): void {
    isFocused.value = false;
    emit('blur');
}

function Focus(): void {
    textareaDom.value?.focus();
}

function Select(): void {
    textareaDom.value?.select();
}
</script>

<style scoped>
.textArea {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid var(--sumiStudioCore-color-outline-variant);
    border-radius: 4px;
    background-color: var(--sumiStudioCore-color-surface);
    box-sizing: border-box;
    transition: border-color var(--sumiStudio-transition-time-medium) ease;
}

.textArea:focus-within,
.textArea_focus {
    border-color: var(--sumiStudioCore-color-primary);
}

.textArea_error {
    border-color: var(--sumiStudioCore-color-error);
}

.form-textarea {
    flex: 1;
    width: 100%;
    min-height: 80px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--sumiStudioCore-color-surface-on);
    font-size: var(--sumiStudio-font-body-medium-size, 14px);
    line-height: 20px;
    padding: 0;
    margin: 0;
    resize: vertical;
    font-family: inherit;
}

.form-textarea::placeholder {
    color: var(--sumiStudioCore-color-surface-variant-on);
}

.form-textarea:read-only {
    cursor: default;
}
</style>
