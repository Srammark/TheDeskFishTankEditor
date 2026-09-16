<template>
    <div class="wC_HSVS panel creatureItemPanel">
        <span class="sumiStudio_font_title-small panelTitle">📋 {{ T('page.manageResourcePackage.item.title', { category: categoryText }) }}</span>
        <div class="wC_HC form">
            <FishItemPanel v-if="category === 'Fish'" :item="(item as IFishItem)" />
            <ShrimpItemPanel v-else-if="category === 'Shrimp'" :item="(item as IShrimpItem)" />
            <CrabItemPanel v-else-if="category === 'Crab'" :item="(item as ICrabItem)" />
            <SnailItemPanel v-else-if="category === 'Snail'" :item="(item as ISnailItem)" />
            <BivalveItemPanel v-else-if="category === 'Bivalve'" :item="(item as IBivalveItem)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import FishItemPanel from './ItemPanel/FishItemPanel.vue';
import ShrimpItemPanel from './ItemPanel/ShrimpItemPanel.vue';
import CrabItemPanel from './ItemPanel/CrabItemPanel.vue';
import SnailItemPanel from './ItemPanel/SnailItemPanel.vue';
import BivalveItemPanel from './ItemPanel/BivalveItemPanel.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    type ICreatureItem, type IFishItem, type IShrimpItem, type ICrabItem, type ISnailItem, type IBivalveItem,
    type TSexFolder, type TSpeciesCategory,
    GetSpeciesCategoryOptionList
} from '../../Types';
import './ItemPanel/itemPanel.css';

const props = defineProps<{
    data: IResourcePackageData;
    speciesName: string;
    strainName: string;
    sexName: TSexFolder;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

/** 物种类别（从 speciesKey 解析） */
const category = computed<TSpeciesCategory>(() =>
{
    const index = props.speciesName.indexOf('/');
    return (index === -1 ? 'Fish' : props.speciesName.substring(0, index)) as TSpeciesCategory;
});

const categoryText = computed(() =>
{
    return GetSpeciesCategoryOptionList().find(o => o.value === category.value)?.text ?? T('page.manageResourcePackage.item.fallbackCategory');
});

function CreateDefaultItem(): ICreatureItem
{
    return props.data.CreateDefaultCreatureItem(category.value);
}

const item = ref<ICreatureItem>(CreateDefaultItem());

function LoadItem(): void
{
    const existing = props.data.GetItem(props.speciesName, props.strainName, props.sexName);
    if (existing)
    {
        item.value = JSON.parse(JSON.stringify(existing)) as ICreatureItem;
    }
    else
    {
        item.value = CreateDefaultItem();
    }
}

watch(() => [props.speciesName, props.strainName, props.sexName], LoadItem, { immediate: true });

watch(item, (value) =>
{
    props.data.SetItem(props.speciesName, props.strainName, props.sexName, value);
}, { deep: true });
</script>

<style scoped>
.panel {
    padding: 16px 24px;
    flex: 1;
    overflow-y: auto;
    gap: 16px;
}
</style>
