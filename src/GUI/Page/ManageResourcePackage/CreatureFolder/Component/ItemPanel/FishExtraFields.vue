<template>
    <span class="sectionTitle">{{ T('page.manageResourcePackage.item.fish.section') }}</span>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.fish.swimMode') }}</span>
        <SelectBox v-model:value="item.swimMode" width="220px" :list="GetSwimModeOptionList()" />
    </div>
</template>

<script setup lang="ts">
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import { GetSwimModeOptionList, type IFishItem } from '../../../Types';
import './itemPanel.css';

defineProps<{
    item: IFishItem;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);
</script>
