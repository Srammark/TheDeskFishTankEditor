<template>
    <span class="sectionTitle">{{ T('page.manageResourcePackage.item.shrimp.section') }}</span>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.shrimp.moltCycle') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="moltCycleDay" :precision="1" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.day') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.shrimp.moltVulnerability') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="moltVulnerabilityDay" :precision="2" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.day') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import { MS_PER_DAY, type IShrimpItem } from '../../../Types';
import './itemPanel.css';

const props = defineProps<{
    item: IShrimpItem;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

const moltCycleDay = computed({
    get: () => props.item.moltCycle / MS_PER_DAY,
    set: (value) => { props.item.moltCycle = value * MS_PER_DAY; }
});

const moltVulnerabilityDay = computed({
    get: () => props.item.moltVulnerabilityDuration / MS_PER_DAY,
    set: (value) => { props.item.moltVulnerabilityDuration = value * MS_PER_DAY; }
});
</script>
