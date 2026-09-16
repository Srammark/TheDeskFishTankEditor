<template>
    <div class="wC_HSVS panel">
        <span class="sumiStudio_font_title-small panelTitle">🪨 {{ T('page.manageResourcePackage.substrate.title', { name: substrateName }) }}</span>

        <div class="wC_HSB basicInfo">
            <div class="propRow">
                <label>{{ T('page.manageResourcePackage.substrate.nameKey') }}</label>
                <input :value="item?.nameKey" type="text" :placeholder="T('page.manageResourcePackage.substrate.nameKeyPlaceholder')" @change="OnUpdateItemField($event, 'nameKey')" />
            </div>
            <div class="propRow">
                <label>{{ T('page.manageResourcePackage.substrate.descriptionKey') }}</label>
                <input :value="item?.descriptionKey" type="text" :placeholder="T('page.manageResourcePackage.substrate.descriptionKeyPlaceholder')" @change="OnUpdateItemField($event, 'descriptionKey')" />
            </div>
            <div class="propRow">
                <label>{{ T('page.manageResourcePackage.substrate.type') }}</label>
                <SelectBox width="200px" v-model:value="type" :list="GetSubstrateTypeOptionList()" :placeholder="T('page.manageResourcePackage.substrate.typePlaceholder')" />
            </div>
        </div>

        <div class="wC_HS thumbnailRow">
            <span class="thumbnailLabel">{{ T('page.manageResourcePackage.substrate.thumbnail') }}</span>
            <div class="wC_HCVCB thumbnailWrap">
                <div class="avatarBox" @click="OnUploadThumbnailClick">
                    <img v-if="thumbnailUrl !== null" :src="thumbnailUrl" class="avatarImg" />
                    <span v-else class="avatarPlaceholder">{{ T('page.manageResourcePackage.substrate.noAvatar') }}<br />{{ T('page.manageResourcePackage.substrate.clickUpload') }}</span>
                </div>
                <div class="wR_HC thumbnailActions">
                    <Button :text="T('page.manageResourcePackage.substrate.uploadAvatar')" variant="outlined" @click="OnUploadThumbnailClick" />
                    <Button v-if="thumbnailUrl !== null" :text="T('page.manageResourcePackage.substrate.removeAvatar')" variant="outlined" @click="OnRemoveThumbnail" />
                </div>
                <span class="thumbnailTip">{{ T('page.manageResourcePackage.substrate.thumbnailTip') }}</span>
            </div>
        </div>

        <div class="wC_HSB textureRow">
            <div class="wC_HCVCB textureCard">
                <span class="textureTitle">{{ T('page.manageResourcePackage.substrate.topView') }}</span>
                <div class="texturePreview" @click="OnUploadSpriteClick('top')">
                    <img v-if="topUrl !== null" :src="topUrl" class="textureImg" />
                    <span v-else class="texturePlaceholder">{{ T('page.manageResourcePackage.substrate.uploadTopView') }}</span>
                </div>
                <div class="propRow small">
                    <label>{{ T('page.manageResourcePackage.substrate.width') }}</label>
                    <span class="readOnlyValue">{{ item?.topView.width ?? 0 }} px</span>
                </div>
                <div class="propRow small">
                    <label>{{ T('page.manageResourcePackage.substrate.height') }}</label>
                    <span class="readOnlyValue">{{ item?.topView.height ?? 0 }} px</span>
                </div>
                <div class="wR_HC textureActions">
                    <Button :text="T('page.manageResourcePackage.substrate.upload')" variant="outlined" @click="OnUploadSpriteClick('top')" />
                    <Button v-if="topUrl !== null" :text="T('page.manageResourcePackage.substrate.remove')" variant="outlined" @click="OnRemoveSprite('top')" />
                </div>
            </div>

            <div class="wC_HCVCB textureCard">
                <span class="textureTitle">{{ T('page.manageResourcePackage.substrate.frontView') }}</span>
                <div class="texturePreview" @click="OnUploadSpriteClick('front')">
                    <img v-if="frontUrl !== null" :src="frontUrl" class="textureImg" />
                    <span v-else class="texturePlaceholder">{{ T('page.manageResourcePackage.substrate.uploadFrontView') }}</span>
                </div>
                <div class="propRow small">
                    <label>{{ T('page.manageResourcePackage.substrate.width') }}</label>
                    <span class="readOnlyValue">{{ item?.frontView.width ?? 0 }} px</span>
                </div>
                <div class="propRow small">
                    <label>{{ T('page.manageResourcePackage.substrate.height') }}</label>
                    <span class="readOnlyValue">{{ item?.frontView.height ?? 0 }} px</span>
                </div>
                <div class="wR_HC textureActions">
                    <Button :text="T('page.manageResourcePackage.substrate.upload')" variant="outlined" @click="OnUploadSpriteClick('front')" />
                    <Button v-if="frontUrl !== null" :text="T('page.manageResourcePackage.substrate.remove')" variant="outlined" @click="OnRemoveSprite('front')" />
                </div>
            </div>
        </div>
    </div>
    <input ref="thumbnailInputRef" type="file" accept="image/*" style="display: none;" @change="OnThumbnailSelected" />
    <input ref="spriteInputRef" type="file" accept="image/*" style="display: none;" @change="OnSpriteSelected" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import { EMSubstrateType, GetSubstrateTypeOptionList, type ISubstrateItem, type TSubstrateSpriteSlot } from '../TypeSubstrate';

const props = defineProps<{
    data: IResourcePackageData;
    substrateName: string;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

const thumbnailInputRef = ref<HTMLInputElement | null>(null);
const spriteInputRef = ref<HTMLInputElement | null>(null);
const thumbnailUrl = ref<string | null>(null);
const topUrl = ref<string | null>(null);
const frontUrl = ref<string | null>(null);
const pendingSpriteSlot = ref<TSubstrateSpriteSlot>('top');

const item = computed(() => props.data.GetSubstrateItem(props.substrateName));

const type = computed<number>({
    get: () => item.value?.type ?? EMSubstrateType.Texture,
    set: (value: number) =>
    {
        if (item.value === undefined) return;
        item.value.type = value;
        CommitItem();
    }
});

watch(() => props.substrateName, () =>
{
    LoadImages();
}, { immediate: true });

function LoadImages(): void
{
    thumbnailUrl.value = GetDataURL(props.data.GetSubstrateImage(props.substrateName));
    topUrl.value = GetDataURL(props.data.GetSubstrateSprite(props.substrateName, 'top'));
    frontUrl.value = GetDataURL(props.data.GetSubstrateSprite(props.substrateName, 'front'));
}

function GetDataURL(data: Uint8Array | null | undefined): string | null
{
    if (data === null || data === undefined || data.length === 0) return null;
    const blob = new Blob([data.slice()], { type: 'image/png' });
    return URL.createObjectURL(blob);
}

function OnUpdateItemField(event: Event, field: 'nameKey' | 'descriptionKey'): void
{
    if (item.value === undefined) return;
    item.value[field] = (event.target as HTMLInputElement).value;
    CommitItem();
}

function CommitItem(): void
{
    if (item.value === undefined) return;
    props.data.SetSubstrateItem(props.substrateName, JSON.parse(JSON.stringify(item.value)) as ISubstrateItem);
}

function OnUploadThumbnailClick(): void
{
    thumbnailInputRef.value?.click();
}

async function OnThumbnailSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    const resized = await ResizeImage(files[0], 100, 100);
    props.data.SetSubstrateImage(props.substrateName, resized);
    thumbnailUrl.value = GetDataURL(resized);
    input.value = '';
}

function OnRemoveThumbnail(): void
{
    props.data.SetSubstrateImage(props.substrateName, null);
    thumbnailUrl.value = null;
}

function OnUploadSpriteClick(slot: TSubstrateSpriteSlot): void
{
    pendingSpriteSlot.value = slot;
    spriteInputRef.value?.click();
}

async function OnSpriteSelected(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    const file = files[0];
    const imageSize = await ReadImageSize(file);
    const data = new Uint8Array(await file.arrayBuffer());

    const slot = pendingSpriteSlot.value;
    props.data.SetSubstrateSprite(props.substrateName, slot, data);

    if (slot === 'top')
    {
        topUrl.value = GetDataURL(data);
        if (item.value !== undefined)
        {
            item.value.topView.width = imageSize.width;
            item.value.topView.height = imageSize.height;
        }
    }
    else if (slot === 'front')
    {
        frontUrl.value = GetDataURL(data);
        if (item.value !== undefined)
        {
            item.value.frontView.width = imageSize.width;
            item.value.frontView.height = imageSize.height;
        }
    }

    CommitItem();
    input.value = '';
}

function OnRemoveSprite(slot: TSubstrateSpriteSlot): void
{
    props.data.SetSubstrateSprite(props.substrateName, slot, null);
    if (slot === 'top')
    {
        topUrl.value = null;
        if (item.value !== undefined)
        {
            item.value.topView.width = 0;
            item.value.topView.height = 0;
        }
    }
    else if (slot === 'front')
    {
        frontUrl.value = null;
        if (item.value !== undefined)
        {
            item.value.frontView.width = 0;
            item.value.frontView.height = 0;
        }
    }
    CommitItem();
}

async function ResizeImage(file: File, width: number, height: number): Promise<Uint8Array>
{
    return new Promise((resolve, reject) =>
    {
        const img = new Image();
        img.onload = () =>
        {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx === null)
            {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
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

async function ReadImageSize(file: File): Promise<{ width: number; height: number }>
{
    return new Promise((resolve, reject) =>
    {
        const img = new Image();
        img.onload = () =>
        {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
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
    overflow: hidden;
    gap: 16px;
}

.panelTitle {
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.basicInfo {
    gap: 12px;
    flex-shrink: 0;
}

.propRow {
    display: flex;
    align-items: center;
    gap: 8px;
}

.propRow label {
    width: 80px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
}

.propRow input,
.propRow select {
    flex: 1;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--sumiStudioCore-color-surface-container-highest);
    background: var(--sumiStudioCore-color-surface);
    color: var(--sumiStudioCore-color-surface-on);
}

.readOnlyValue {
    flex: 1;
    padding: 4px 8px;
    font-size: 13px;
    color: var(--sumiStudioCore-color-surface-on-60);
}

.thumbnailRow {
    gap: 12px;
    align-items: flex-start;
    flex-shrink: 0;
}

.thumbnailLabel {
    width: 80px;
    font-size: 12px;
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.thumbnailWrap {
    gap: 12px;
    align-items: flex-start;
}

.avatarBox {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container-highest);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
}

.avatarImg {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.avatarPlaceholder {
    font-size: 12px;
    text-align: center;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.thumbnailActions {
    gap: 8px;
}

.thumbnailTip {
    font-size: 11px;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.textureRow {
    gap: 24px;
    flex: 1;
    align-items: flex-start;
    overflow-y: auto;
}

.textureCard {
    width: 220px;
    padding: 16px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container);
    gap: 12px;
    align-items: stretch;
}

.textureTitle {
    font-size: 14px;
    color: var(--sumiStudioCore-color-surface-on);
    text-align: center;
}

.texturePreview {
    width: 180px;
    height: 180px;
    border-radius: 4px;
    background: var(--sumiStudioCore-color-surface-container-highest);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
}

.textureImg {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.texturePlaceholder {
    font-size: 12px;
    text-align: center;
    color: var(--sumiStudioCore-color-surface-on-20);
}

.textureActions {
    gap: 8px;
    justify-content: center;
}
</style>
