<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🧬 品系信息</span>
        <div class="wC_HC form">
            <div class="wR_HC fieldRow">
                <span class="label">拉丁学名</span>
                <InputBox v-model:text="desc.scientificName" width="300px" placeholder="继承自物种描述" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">名称</span>
                <InputBox v-model:text="desc.nameKey" width="300px" placeholder="国际化字符串键名" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">Wiki</span>
                <InputBox v-model:text="desc.wikiKey" width="300px" placeholder="国际化字符串键名" />
            </div>
            <div class="wR_HC fieldRow">
                <span class="label">品系头像</span>
                <div class="wC_HCVCB avatarWrap">
                    <div class="avatarBox" @click="OnUploadClick">
                        <img v-if="imageUrl !== null" :src="imageUrl" class="avatarImg" />
                        <span v-else class="avatarPlaceholder">无头像<br />点击上传</span>
                    </div>
                    <div class="wR_HC avatarActions">
                        <Button text="上传头像" variant="outlined" @click="OnUploadClick" />
                        <Button v-if="imageUrl !== null" text="删除头像" variant="outlined" @click="OnRemoveImage" />
                    </div>
                    <span class="avatarTip">推荐尺寸 100 × 100 像素，上传后会自动缩放</span>
                </div>
            </div>
        </div>
        <input ref="fileInputRef" type="file" accept="image/*" style="display: none;" @change="OnFileSelected" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import type { IStrainDescription } from '../../Types';

const props = defineProps<{
    data: IResourcePackageData;
    speciesName: string;
    strainName: string;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const imageUrl = ref<string | null>(null);
const desc = ref<IStrainDescription>({ scientificName: '', nameKey: '', wikiKey: '' });

watch(() => [props.speciesName, props.strainName], () =>
{
    LoadDesc();
    LoadImage();
}, { immediate: true });

watch(desc, (newVal) =>
{
    props.data.SetStrainDesc(props.speciesName, props.strainName, { ...newVal });
}, { deep: true });

function LoadDesc(): void
{
    const existing = props.data.GetStrainDesc(props.speciesName, props.strainName);
    desc.value = existing ? { ...existing } : { scientificName: '', nameKey: '', wikiKey: '' };
}

function LoadImage(): void
{
    const imageData = props.data.GetStrainImage(props.speciesName, props.strainName);
    if (imageData !== null && imageData !== undefined && imageData.length > 0)
    {
        const blob = new Blob([imageData.slice()], { type: 'image/png' });
        imageUrl.value = URL.createObjectURL(blob);
    }
    else
    {
        imageUrl.value = null;
    }
}

function OnUploadClick(): void
{
    fileInputRef.value?.click();
}

function OnRemoveImage(): void
{
    props.data.SetStrainImage(props.speciesName, props.strainName, null);
    imageUrl.value = null;
}

async function OnFileSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    const file = files[0];
    const resized = await ResizeTo100x100(file);
    props.data.SetStrainImage(props.speciesName, props.strainName, resized);
    LoadImage();
    input.value = '';
}

async function ResizeTo100x100(file: File): Promise<Uint8Array>
{
    return new Promise((resolve, reject) =>
    {
        const img = new Image();
        img.onload = () =>
        {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx === null)
            {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            const scale = Math.min(100 / img.width, 100 / img.height);
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            const offsetX = (100 - drawWidth) / 2;
            const offsetY = (100 - drawHeight) / 2;
            ctx.clearRect(0, 0, 100, 100);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            canvas.toBlob((blob) =>
            {
                if (blob === null)
                {
                    reject(new Error('Canvas toBlob failed'));
                    return;
                }
                blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
            }, 'image/png');
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
    });
}
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
    align-items: flex-start;
}

.label {
    width: 80px;
    text-align: right;
    font-size: var(--sumiStudio-font-body-medium-size);
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
    margin-top: 8px;
}

.avatarWrap {
    gap: 12px;
}

.avatarBox {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 2px dashed var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color var(--sumiStudio-transition-time-medium);
}

.avatarBox:hover {
    border-color: var(--sumiStudioCore-color-primary);
}

.avatarImg {
    width: 100px;
    height: 100px;
    object-fit: cover;
    display: block;
}

.avatarPlaceholder {
    font-size: var(--sumiStudio-font-body-small-size);
    color: var(--sumiStudioCore-color-surface-on-20);
    text-align: center;
    line-height: 1.4;
}

.avatarActions {
    gap: 8px;
}

.avatarTip {
    font-size: var(--sumiStudio-font-label-small-size);
    color: var(--sumiStudioCore-color-surface-on-20);
}
</style>
