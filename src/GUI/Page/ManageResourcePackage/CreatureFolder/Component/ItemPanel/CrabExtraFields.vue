<template>
    <span class="sectionTitle">蟹类专属</span>
    <div class="wR_HC fieldRow">
        <span class="label">蜕壳周期</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="moltCycleDay" :precision="1" :min="0" />
            <span class="unit">天</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">蜕壳脆弱期</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="moltVulnerabilityDay" :precision="2" :min="0" />
            <span class="unit">天</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import { MS_PER_DAY, type ICrabItem } from '../../../Types';
import './itemPanel.css';

const props = defineProps<{
    item: ICrabItem;
}>();

const moltCycleDay = computed({
    get: () => props.item.moltCycle / MS_PER_DAY,
    set: (value) => { props.item.moltCycle = value * MS_PER_DAY; }
});

const moltVulnerabilityDay = computed({
    get: () => props.item.moltVulnerabilityDuration / MS_PER_DAY,
    set: (value) => { props.item.moltVulnerabilityDuration = value * MS_PER_DAY; }
});
</script>
