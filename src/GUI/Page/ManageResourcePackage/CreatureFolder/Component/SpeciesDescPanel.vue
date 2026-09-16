<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🐠 {{ T('page.manageResourcePackage.speciesDesc.title') }}</span>
        <div class="wC_HC form">
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.speciesDesc.category') }}</span>
                <SelectBox v-model:value="desc.category" width="300px" :list="GetSpeciesCategoryOptionList()" :placeholder="T('page.manageResourcePackage.speciesDesc.categoryPlaceholder')" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.speciesDesc.scientificName') }}</span>
                <InputBox v-model:text="desc.scientificName" width="300px" placeholder="Poecilia reticulata" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.speciesDesc.name') }}</span>
                <InputBox v-model:text="desc.nameKey" width="300px" :placeholder="T('page.manageResourcePackage.speciesDesc.keyPlaceholder')" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.speciesDesc.wiki') }}</span>
                <InputBox v-model:text="desc.wikiKey" width="300px" :placeholder="T('page.manageResourcePackage.speciesDesc.keyPlaceholder')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import { GetSpeciesCategoryOptionList, type ISpeciesDescription } from '../../Types';

const props = defineProps<{
    data: IResourcePackageData;
    speciesName: string;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

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
