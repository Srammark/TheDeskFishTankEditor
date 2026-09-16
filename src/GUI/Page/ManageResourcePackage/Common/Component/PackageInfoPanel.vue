<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">📦 {{ T('page.manageResourcePackage.packageInfo.title') }}</span>
        <div class="wC_HC form">
            <div class="wR_HC fieldRow">
                <span class="label">ID</span>
                <InputBox v-model:text="data.packageInfo.id" width="300px" placeholder="com.example.package" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.packageInfo.name') }}</span>
                <InputBox v-model:text="data.packageInfo.name" width="300px" :placeholder="T('page.manageResourcePackage.packageInfo.namePlaceholder')" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.packageInfo.keywords') }}</span>
                <InputBox v-model:text="data.packageInfo.keywords" width="300px" :placeholder="T('page.manageResourcePackage.packageInfo.keywordsPlaceholder')" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.packageInfo.version') }}</span>
                <InputBox v-model:text="data.packageInfo.version" width="300px" placeholder="1.0.0" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.packageInfo.author') }}</span>
                <InputBox v-model:text="data.packageInfo.author" width="300px" :placeholder="T('page.manageResourcePackage.packageInfo.authorPlaceholder')" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">{{ T('page.manageResourcePackage.packageInfo.license') }}</span>
                <InputBox v-model:text="data.packageInfo.license" width="300px" placeholder="MIT" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import type { IResourcePackageData } from '../../ResourcePackageData';

defineProps<{
    data: IResourcePackageData;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);
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
