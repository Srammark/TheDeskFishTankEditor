<template>
    <span class="sectionTitle">{{ T('page.manageResourcePackage.item.bivalve.section') }}</span>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.bivalve.filterRate') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.filterRate" :precision="1" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.mlPerSecond') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import { type IBivalveItem } from '../../../Types';
import './itemPanel.css';

defineProps<{
    item: IBivalveItem;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);
</script>
