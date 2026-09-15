<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">📦 包信息 (info.json)</span>
        <div class="wC_HC form">
            <div class="wR_HC fieldRow">
                <span class="label">ID</span>
                <InputBox v-model:text="data.packageInfo.id" width="300px" placeholder="com.example.package" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">名称</span>
                <InputBox v-model:text="data.packageInfo.name" width="300px" placeholder="包名" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">关键词</span>
                <InputBox v-model:text="data.packageInfo.keywords" width="300px" placeholder="关键词，逗号分隔" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">版本</span>
                <InputBox v-model:text="data.packageInfo.version" width="300px" placeholder="1.0.0" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">作者</span>
                <InputBox v-model:text="data.packageInfo.author" width="300px" placeholder="作者名称" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">协议</span>
                <InputBox v-model:text="data.packageInfo.license" width="300px" placeholder="MIT" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';

defineProps<{
    data: IResourcePackageData;
}>();
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
