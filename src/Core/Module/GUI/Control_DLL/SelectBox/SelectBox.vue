<template>
    <div class="wR_HCB" :style="{ width: width, position: 'relative' }" @click="OnClick()" tabindex="-1" @focus="OnFoucus()" @blur="OnBlur()">
        <div :class="['wR_HCVC', 'selectBox', isSelect === true ? 'selectBox-focus' : '', readonly == true ? 'selectBox-reaonly' : '']">
            <span class="selectText lineBreak1" v-text="selectIndex === -1 ? placeholder : list[selectIndex].text"></span>
            <SvgIcon ref="svgIconVue" type="mdi" :path="mdiMenuUp" :flip="'both'"></SvgIcon>
        </div>
        <Transition @before-enter="TOnBeforeEnter" @enter="TOnEnter" @leave="TOnLeave">
            <div v-show="isShowList === true" class="wC_HC itemBox" :style="{ width: '100%' }">
                <template v-for="(value, index) of list" :key="value.text">
                    <div :class="['wR_HCVC', 'item', index === selectIndex ? 'item-select' : '']" @click="SelectItem(index)">
                        <span v-text="value.text"></span>
                    </div>
                </template>
            </div>
        </Transition>
    </div>
</template>
<script setup lang="ts">
import gsap from 'gsap';
import { onMounted, ref, watch } from 'vue';
import { mdiMenuUp } from '@mdi/js';
import SvgIcon from '../SvgIcon/SvgIcon.vue';

const props = defineProps({
    width: { type: String, default: '100%' },
    list: { type: Array<{ value: any, text: string }>, default: () => new Array<{ value: any, text: string }>() },
    index: { type: Number, default: -1 },
    placeholder: { type: String, default: '' },
    readonly: { type: Boolean, default: false }
});
const value = defineModel<string | number>('value');

const svgIconVue = ref<InstanceType<typeof SvgIcon> | null>(null);
const selectIndex = ref<number>(-1);
const isSelect = ref<boolean>(false);
const isShowList = ref<boolean>(false);

onMounted(() =>
{
    if (props.index !== -1)
    {
        selectIndex.value = props.index;
        value.value = props.list[selectIndex.value].value;
    }
});

watch(value, (newValue, oldValue) =>
{
    if (newValue === oldValue)
    {
        return;
    }

    for (let i = 0; i < props.list.length; i++)
    {
        if (props.list[i].value === newValue)
        {
            selectIndex.value = i;
            break;
        }
    }
}, { immediate: true });

function SelectItem(index: number): void
{
    if (selectIndex.value === index)
    {
        return;
    }

    selectIndex.value = index;
    value.value = props.list[index].value;
    isSelect.value = true;
}

function OnClick(): void
{
    if (props.readonly === true)
    {
        return;
    }
    isShowList.value = !isShowList.value;
}

function OnFoucus(): void
{
    if (props.readonly === true)
    {
        return;
    }
    isSelect.value = true;
}

function OnBlur(): void
{
    isSelect.value = false;
    isShowList.value = false;
}

function TOnBeforeEnter(el: Element)
{
    gsap.set(el, {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
    });
}

function TOnEnter(el: Element, done: () => void)
{
    // 先清除 height 计算 auto 的真实高度
    const elStyle = el as HTMLElement;
    elStyle.style.height = 'auto';
    const targetHeight = elStyle.scrollHeight + 'px';

    // 再恢复初始状态
    elStyle.style.height = '0px'; // 或初始高度
    elStyle.style.opacity = '0';

    gsap.to(el, {
        height: targetHeight,
        opacity: 1,
        duration: 0.15,
        ease: 'power2.out',
        onComplete: () => {
            gsap.set(el, { clearProps: 'height' });
            done();
        },
    });

    gsap.to(svgIconVue.value!.$el, {
        rotate: 0,
        duration: 0.15,
        ease: 'power2.out',
    });
}

function TOnLeave(el: Element, done: () => void)
{
    const height = (el as HTMLElement).scrollHeight;
    // 初始设置为当前高度
    gsap.set(el, { height });
    gsap.to(el,
    {
        height: 0,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: done,
    });

    gsap.to(svgIconVue.value!.$el, {
        rotate: 180,
        duration: 0.2,
        ease: 'power2.in',
    });
}
</script>
<style scoped>
.selectBox {
    width: 100%;
    height: 28px;
    box-sizing: border-box;
    border-radius: 4px;
    color: var(--sumiStudioCore-color-surface-on);
    background-color: var(--sumiStudioCore-color-secondary-container);
    outline: 0px;
}

.selectBox-focus {
    color: var(--sumiStudioCore-color-primary);
    border-color: var(--sumiStudioCore-color-primary);
}

.selectBox-reaonly {
    border-color: var(--sumiStudioCore-color-secondary-fixed-variant);
}

.selectText {
    width: 0;
    margin-left: 12px;
    font-size: var(--sumiStudio-font-body-medium-size);
    flex: 1;
}

.svgArrow > path {
    fill: var(--sumiStudioCore-color-surface-on);
}

.svgArrow.on > path {
    fill: var(--sumiStudioCore-color-primary);
}

.itemBox {
    margin-top: 28px;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 4px;
    background-color: var(--sumiStudioCore-color-surface-container);
    box-shadow: 0px 0px 4px var(--sumiStudioCore-color-shadow-40);
    position: absolute;
    z-index: var(--sumiStudio-z-dropdown);
}

.item {
    height: 28px;
    background-color: var(--sumiStudioCore-color-surface-container);
    color: var(--sumiStudioCore-color-surface-on);
    font-size: var(--sumiStudio-font-body-medium-size);
}

.item:hover {
    background-color: var(--sumiStudioCore-color-surface-on-10);
}

.item-select {
    background-color: var(--sumiStudioCore-color-secondary-container);
}
</style>