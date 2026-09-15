<template>
    <div class="numericInlineInput" :style="{ width: width, height: height }">
        <!-- 非编辑态 -->
        <span v-show="isEditing === false" class="display" :style="{ textAlign: textAlign }" role="textbox" tabindex="-1" @click="EnterEdit"
            @keydown.enter.prevent="EnterEdit" @focus="EnterEdit" @wheel.prevent="OnWheel" v-text="displayText"></span>

        <!-- 编辑态 -->
        <input v-show="isEditing === true" ref="inputDom" class="editor" :placeholder="placeholder" v-model="editingValue" @blur="Commit"
            @keydown.enter.prevent="Commit" @keydown.esc.prevent="Revert" @keydown.up.prevent="StepUp"
            @keydown.down.prevent="StepDown" @wheel.prevent="OnWheel" inputmode="decimal" autocomplete="off" />
    </div>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, type PropType, watch, onMounted } from 'vue';
import ConciseMenu from '../../ContextMenu_DLL/RightMenu/ConciseMenu/ConciseMenu';

type AlignType = 'left' | 'right' | 'center';
const props = defineProps({
    width: { type: String, default: '60px' },
    height: { type: String, default: '24px' },
    textAlign: { type: String as PropType<AlignType>, default: 'right' },
    modelValue: { type: Number as () => number | null, default: null },
    placeholder: { type: String, default: '' },
    // 小数点后保留的位数
    precision: { type: Number, default: undefined },
    min: { type: Number as () => number | undefined, default: undefined },
    max: { type: Number as () => number | undefined, default: undefined },
    // 按照放大后的比例步进
    step: { type: Number, default: 1 },
    // 是否在显示模式下对 null/undefined 显示占位文本
    emptyText: { type: String, default: '-' },
    // 新增：显示值与实际值的比例
    scale: { type: Number, default: 1 }
});

const conciseMenu = ConciseMenu.GetInstance();
const isEditing = ref(false);
const editingValue = ref('');
const previousValue = ref<number | null>(null);
const inputDom = ref<HTMLInputElement | null>(null);
const emit = defineEmits(['update:modelValue', 'change']);

onMounted(() =>
{
    inputDom.value!.addEventListener('contextmenu', (e: MouseEvent) => { conciseMenu.ShowContextMenu(e); });
});

watch(() => props.modelValue, (newVal) =>
{
    if (!isEditing.value)
    {
        editingValue.value = FormatNumber(newVal);
    }
});

function FormatNumber(v: number | null): string
{
    if (v == null || Number.isNaN(v))
    {
        return props.emptyText;
    }
    const scaled = v * props.scale;
    if (typeof props.precision === 'number')
    {
        return scaled.toFixed(props.precision);
    }
    return String(Math.round(scaled));
}

function ParseNumber(s: string): number | null
{
    if (!s.trim())
    {
        return null;
    }
    const n = Number(s.replace(/,/g, ''));
    if (!Number.isFinite(n)) return null;
    return n / props.scale;
}

function Clamp(n: number): number
{
    let res = n;
    if (props.min != null)
    {
        res = Math.max(res, props.min);
    }
    if (props.max != null)
    {
        res = Math.min(res, props.max);
    }
    if (typeof props.precision === 'number')
    {
        const factor = Math.pow(10, props.precision);
        res = Math.round(res * factor) / factor;
    }
    return res;
}

const displayText = computed(() => FormatNumber(props.modelValue));
const titleText = computed(() => props.modelValue == null ? props.placeholder : String(props.modelValue));

function EnterEdit(): void
{
    if (isEditing.value) return;

    previousValue.value = props.modelValue ?? null;
    isEditing.value = true;
    editingValue.value = props.modelValue == null ? '' : FormatNumber(props.modelValue);
    nextTick(() =>
    {
        inputDom.value?.focus();
        inputDom.value?.select();
    });
}

function Commit(): void
{
    if (isEditing.value && conciseMenu.IsShowMenu() === true)
    {
        return;
    }

    const parsed = ParseNumber(editingValue.value);
    const finalVal = parsed != null ? Clamp(parsed) : null;
    isEditing.value = false;
    if (finalVal !== props.modelValue)
    {
        emit('update:modelValue', finalVal);
        emit('change', finalVal);
    }
}

function Revert(): void
{
    editingValue.value = previousValue.value == null ? '' : FormatNumber(previousValue.value);
    isEditing.value = false;
}

function StepUp(): void
{
    const baseDisplay = (ParseNumber(editingValue.value) ?? props.modelValue ?? 0) * props.scale;
    editingValue.value = String((baseDisplay + props.step).toFixed(props.precision ?? 0));
}

function StepDown(): void
{
    const baseDisplay = (ParseNumber(editingValue.value) ?? props.modelValue ?? 0) * props.scale;
    editingValue.value = String((baseDisplay - props.step).toFixed(props.precision ?? 0));
}

function OnWheel(e: WheelEvent): void
{
    if (e.deltaY < 0)
    {
        StepUp();
    }
    else
    {
        StepDown();
    }
    if (!isEditing.value)
    {
        const parsed = ParseNumber(editingValue.value || String(props.modelValue ?? 0)) ?? 0;
        const finalVal = Clamp(parsed);
        emit('update:modelValue', finalVal);
        emit('change', finalVal);
    }
}
</script>
<style scoped>
.numericInlineInput {
    display: inline-block;
    box-sizing: border-box;
    color: var(--sumiStudioCore-color-surface-on);
    font-size: var(--sumiStudio-font-title-medium-size);
}

.display {
    width: 100%;
    display: inline-block;
}

.editor {
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-outline);
    font: inherit;
    box-sizing: border-box;
    outline: none;
}

.editor:focus {
    border-color: var(--sumiStudioCore-color-primary);
}
</style>