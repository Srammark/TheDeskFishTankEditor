<template>
    <div class="wR_HSVCB">
        <div v-wave class="wR_HCVC radio_container" :class="[isDisabled === true ? 'disabled' : '']" role="radio" @click="OnClick">
            <svg class="icon" :class="[isSelected === true ? 'isSelected' : '']"  viewBox="0 0 20 20">
                <mask :id="maskId">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="10" cy="10" r="8" fill="black" />
                </mask>
                <circle class="outer circle" cx="10" cy="10" r="10" :mask="`url(#${maskId})`" />
                <circle class="inner circle" cx="10" cy="10" r="5" />
            </svg>
            <div class="touch"></div>
        </div>
        <span class="radio_text" v-text="name" @click="OnClick"></span>
    </div>
</template>
<script setup lang="ts">
import { computed, inject } from 'vue';
import VWave from 'v-wave';

const { vWave } = VWave.createLocalWaveDirective({ color: 'var(--sumiStudioCore-color-primary)' });

const props = defineProps({
    isDisabled: Boolean,
    name: { type: String, default: '' },
    value: { type: [String, Number, Boolean], required: true },
});

const maskId = `cutout-${Math.random().toString(36).slice(2)}`;

const radioGroup = inject<{
  selectedValue: any
  disabled: any
  SetSelected: (val: any) => void
} | null>('custom-radio-group', null);

const isDisabled = computed(() =>
{
    return radioGroup?.disabled?.value || props.isDisabled;
});
const isSelected = computed(
{
    get()
    {
        return radioGroup ? radioGroup.selectedValue.value === props.value : false;
    },
    set(val: boolean)
    {
        if (val && radioGroup && !isDisabled.value)
        {
            radioGroup.SetSelected(props.value);
        }
    },
});


function OnClick(): void
{
    if (props.isDisabled === true)
    {
        return;
    }

    isSelected.value = !isSelected.value;
}
</script>
<style scoped>
.radio_container {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
}

.radio-container.disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.touch {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: absolute;
    background-color: var(--sumiStudioCore-color-surface-on);
    opacity: 0;
    transition-property: color, background-color, border-color, box-shadow, opacity;
    transition-duration: var(--sumiStudio-transition-time-medium);
}

.touch:hover {
    opacity: 0.08;
}

svg.icon {
    width: 20px;
    height: 20px;
}

.outer.circle {
    fill: var(--sumiStudioCore-color-surface-variant-on);
    transition-property: color, background-color, border-color, box-shadow, opacity, transform;
    transition-duration: var(--sumiStudio-transition-time-medium);
}

.isSelected .inner.circle {
    transform: scale(1);
}

.inner.circle {
    fill: var(--sumiStudioCore-color-primary);
    transform: scale(0);
    transform-origin: center; 
    transform-box: fill-box;
    transition-property: color, background-color, border-color, box-shadow, opacity, transform;
    transition-duration: var(--sumiStudio-transition-time-medium);
}

.isSelected .outer.circle {
    fill: var(--sumiStudioCore-color-primary);
}

.radio_text {
    color: var(--sumiStudioCore-color-surface-on);
    font-size: var(--sumiStudio-font-title-medium-size);
    cursor: pointer;
}
</style>