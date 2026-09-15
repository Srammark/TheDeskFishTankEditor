<template>
    <div class="wC_HC pixelFishEditor" style="height: 100%; overflow: hidden;">
        <template v-if="isReady">
            <PackageList v-if="currentPackageId === ''" @open="OnOpenPackage"></PackageList>
            <ResourcePackageEditor v-else :package-id="currentPackageId" @back="OnBackToList" />
        </template>
        <div v-else class="wR_HCVC wBlock" style="height: 100%;">
            <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">加载中...</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import Main from './Main';
import './Main.css';
import PackageList from '../Page/ManagePackage/PackageList.vue';
import ResourcePackageEditor from '../Page/ManageResourcePackage/ResourcePackageEditor.vue';

const main = new Main();
const isReady = ref(false);
const currentPackageId = ref('');

onBeforeMount(async () =>
{
    await main.Init();
    isReady.value = true;
});

onMounted(async () =>
{

});

function OnOpenPackage(packageId: string): void
{
    currentPackageId.value = packageId;
}

function OnBackToList(): void
{
    currentPackageId.value = '';
}
</script>

<style scoped>
.pixelFishEditor {
    height: 100%;
    background-color: var(--sumiStudioCore-color-surface-container-low);
    position: relative;
    box-sizing: border-box;
    user-select: none;
}
</style>