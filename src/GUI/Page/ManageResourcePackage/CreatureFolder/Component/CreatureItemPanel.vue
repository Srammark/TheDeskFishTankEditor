<template>
    <div class="wC_HSVS panel creatureItemPanel">
        <span class="sumiStudio_font_title-small panelTitle">📋 {{ categoryText }}属性 (item.json)</span>
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
import FishItemPanel from './ItemPanel/FishItemPanel.vue';
import ShrimpItemPanel from './ItemPanel/ShrimpItemPanel.vue';
import CrabItemPanel from './ItemPanel/CrabItemPanel.vue';
import SnailItemPanel from './ItemPanel/SnailItemPanel.vue';
import BivalveItemPanel from './ItemPanel/BivalveItemPanel.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import {
    type ICreatureItem, type IFishItem, type IShrimpItem, type ICrabItem, type ISnailItem, type IBivalveItem,
    type TSexFolder, type TSpeciesCategory,
    SpeciesCategoryOptionList
} from '../../Types';
import './ItemPanel/itemPanel.css';

const props = defineProps<{
    data: IResourcePackageData;
    speciesName: string;
    strainName: string;
    sexName: TSexFolder;
}>();

/** 物种类别（从 speciesKey 解析） */
const category = computed<TSpeciesCategory>(() =>
{
    const index = props.speciesName.indexOf('/');
    return (index === -1 ? 'Fish' : props.speciesName.substring(0, index)) as TSpeciesCategory;
});

const categoryText = computed(() =>
{
    return SpeciesCategoryOptionList.find(o => o.value === category.value)?.text ?? '生物';
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
