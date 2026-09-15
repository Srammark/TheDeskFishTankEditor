<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🐠 物种描述 (speciesDescription.json)</span>
        <div class="wC_HC form">
            <div class="wR_HC fieldRow">
                <span class="label">物种类型</span>
                <SelectBox v-model:value="desc.category" width="300px" :list="SpeciesCategoryOptionList" placeholder="未设置" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">拉丁学名</span>
                <InputBox v-model:text="desc.scientificName" width="300px" placeholder="Poecilia reticulata" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">名称</span>
                <InputBox v-model:text="desc.nameKey" width="300px" placeholder="国际化字符串键名" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">Wiki</span>
                <InputBox v-model:text="desc.wikiKey" width="300px" placeholder="国际化字符串键名" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import { SpeciesCategoryOptionList, type ISpeciesDescription } from '../../Types';

const props = defineProps<{
    data: IResourcePackageData;
    speciesName: string;
}>();

const desc = ref<ISpeciesDescription>({ scientificName: '', nameKey: '', wikiKey: '' });

watch(() => props.speciesName, (newName) => {
    const existing = props.data.GetSpeciesDesc(newName);
    desc.value = existing ? { ...existing } : { scientificName: '', nameKey: '', wikiKey: '' };
}, { immediate: true });

watch(desc, (newVal) => {
    props.data.SetSpeciesDesc(props.speciesName, { ...newVal });
}, { deep: true });
</script>

<style scoped>
.panel {
    padding: 16px 24px;
    flex: 1;
    overflow-y: auto;
    gap: 16px;
}

.panelTitle {
    color: var(--sumiStudioCore-color-surface-on);
}

.form {
    gap: 12px;
}

.fieldRow {
    gap: 12px;
    align-items: center;
}

.label {
    width: 80px;
    text-align: right;
    font-size: var(--sumiStudio-font-body-medium-size);
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}
</style>
