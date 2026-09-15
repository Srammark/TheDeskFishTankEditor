<template>
    <button v-wave="{ color: effectiveVariant === 'filled' ? 'var(--sumiStudioCore-color-primary-on)' : 'var(--sumiStudioCore-color-primary)' }" :class="['button', `button_${effectiveVariant}`, { disabled, 'button_iconMode': isIconMode }]" :style="{ width: computedWidth, height: computedHeight, borderRadius: isIconMode ? '50%' : borderRadius }" :disabled="disabled" @click="OnClick">
        <div class="button_stateLayer"></div>
        <div v-if="iconPath" class="button_icon">
            <SvgIcon :path="iconPath" :type="iconType" :size="computedIconSize" :viewbox="iconViewbox" :flip="iconFlip" :rotate="iconRotate" />
        </div>
        <div v-if="$slots.default || text" class="button_content">
            <slot>{{ text }}</slot>
        </div>
    </button>
</template>

<script lang="ts" setup>
import { computed, useSlots } from "vue";
import SvgIcon from '../SvgIcon/SvgIcon.vue';
import VWave from 'v-wave';
const { vWave } = VWave.createLocalWaveDirective({ color: 'var(--sumiStudioCore-color-primary)' });

type IconType = 'mdi' | 'simple-icons' | string;
type FlipType = 'horizontal' | 'vertical' | 'both' | 'none' | undefined;

const props = withDefaults(defineProps<{
    width?: string,
    height?: string,
    borderRadius?: string,
    variant?: "filled" | "outlined" | "text" | "tonal";
    disabled?: boolean;
    text?: string;
    iconPath?: string;
    iconType?: IconType;
    iconSize?: string | number;
    iconViewbox?: string;
    iconFlip?: FlipType;
    iconRotate?: number;
}>(), {
    height: "28px",
    borderRadius: "4px",
    variant: "filled",
    disabled: false,
    iconPath: "",
    iconType: "mdi",
    iconFlip: "none",
    iconRotate: 0,
});

const emit = defineEmits<{
    (e: "click", ev: MouseEvent): void;
}>();

const slots = useSlots();
// 是否为 icon 模式（有 iconPath 且无文本、无插槽内容）
const isIconMode = computed(() => props.iconPath && !slots.default && !props.text);
// 图标尺寸：icon 模式默认 24，其它 18；可通过 iconSize 覆盖
const computedIconSize = computed(() => props.iconSize ?? (isIconMode.value ? 24 : 18));
// icon 模式下自动使用 text 变体（透明底色），否则使用传入的 variant
const effectiveVariant = computed(() => isIconMode.value ? 'text' : props.variant);
// icon 模式下计算宽高
const computedWidth = computed(() =>
{
    if (!isIconMode.value) return props.width;
    if (props.width) return props.width;
    if (props.height) return props.height;
    return '40px';
});
const computedHeight = computed(() =>
{
    if (!isIconMode.value) return props.height;
    if (props.height) return props.height;
    if (props.width) return props.width;
    return '40px';
});

function OnClick(ev: MouseEvent)
{
    if (props.disabled)
    {
        return;
    }
    emit("click", ev);
}
</script>

<style scoped>
.button {
    --state-opacity: 0;
    --state-color: var(--sumiStudioCore-color-primary);
    background: transparent;
    border: none;
    border-radius: 4px;
    outline: none;
    padding: 0 24px;
    font-size: var(--sumiStudio-font-label-large-size);
    font-weight: 500;
    letter-spacing: 0.1px;
    gap: 8px;
    align-items: center;
    justify-content: center;
    display: inline-flex;
    position: relative;
    transition: box-shadow var(--sumiStudio-transition-time-medium) ease, background-color var(--sumiStudio-transition-time-medium) ease;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
}

.button_filled {
    --state-color: var(--sumiStudioCore-color-primary-on);
    background-color: var(--sumiStudioCore-color-primary);
    color: var(--sumiStudioCore-color-primary-on);
}

.button_outlined {
    background-color: transparent;
    border: 1px solid var(--sumiStudioCore-color-outline-variant);
    color: var(--sumiStudioCore-color-primary);
}

.button_text {
    background-color: transparent;
    color: var(--sumiStudioCore-color-primary);
}

.button_tonal {
    background-color: var(--sumiStudioCore-color-secondary-container);
    color: var(--sumiStudioCore-color-secondary-container-on);
}

/* icon 模式（纯图标，圆形） */
.button_iconMode {
    padding: 0;
    border-radius: 50%;
}

/* Icon 容器 */
.button_icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    position: relative;
    z-index: var(--sumiStudio-z-default);
}

/* 文本容器 */
.button_content {
    position: relative;
    z-index: var(--sumiStudio-z-default);
    white-space: nowrap;
}

.button_stateLayer {
    inset: 0;
    background-color: var(--state-color);
    opacity: var(--state-opacity);
    position: absolute;
    z-index: var(--sumiStudio-z-default);
    transition: opacity var(--sumiStudio-transition-time-fast) ease;
    pointer-events: none;
}

.button:hover:not(.disabled):not(:disabled) {
    color: var(--sumiStudioCore-color-primary-on);
    --state-opacity: var(--sumiStudioCore-state-hover-opacity);
}

.button:active:not(.disabled):not(:disabled) {
    --state-opacity: var(--sumiStudioCore-state-pressed-opacity);
}

/* 禁用 */
.button.disabled,
.button:disabled {
    --state-opacity: 0;
    opacity: var(--sumiStudio-state-disabled-opacity);
    pointer-events: none;
}
</style>
