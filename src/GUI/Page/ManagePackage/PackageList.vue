<template>
    <div class="wC_HC packageList">
        <div class="wR_HC toolBar">
            <div class="wR_HSVC leftTools" style="width: 50%;">
                <span class="sumiStudio_font_title-small" style="color: var(--sumiStudioCore-color-surface-on);">📦 资源包管理</span>
            </div>
            <div class="wR_HEVC rightTools" style="width: 50%;">
                <input ref="importInputRef" type="file" webkitdirectory directory multiple style="display: none;" @change="OnImport" />
                <Button text="导入包" variant="outlined" @click="OnClickImport" />
                <Button text="新建包" @click="OnCreatePackage" />
            </div>
        </div>
        <div class="wC_HS listBody">
            <template v-if="packageList.length > 0">
                <div v-for="info in packageList" :key="info.id" class="wR_HC packageCard" @click="OnOpenPackage(info.id)">
                    <span class="packageIcon">🎒</span>
                    <div class="wC_HSB packageMeta">
                        <span class="sumiStudio_font_body-large lineBreak1" style="color: var(--sumiStudioCore-color-surface-on);">{{ info.name || '(未命名)' }}</span>
                        <span class="sumiStudio_font_body-small lineBreak1" style="color: var(--sumiStudioCore-color-surface-on-20);">v{{ info.version }} · {{ info.author || '未知作者' }} · {{ info.id }}</span>
                    </div>
                    <div class="wR_HCB cardActions">
                        <Button text="导出" variant="outlined" @click.stop="OnExportPackage(info)" />
                        <Button text="删除" variant="outlined" @click.stop="OnDeletePackage(info)" />
                    </div>
                </div>
            </template>
            <div v-else class="wR_HCVC placeholderPanel">
                <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">暂无资源包，点击右上角"新建包"或"导入包"开始</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import PackageListData from './PackageListData';
import { type IPackageInfo } from '../ManageResourcePackage/Types';

const emit = defineEmits<{
    open: [packageId: string]
}>();

const listData = new PackageListData();
const packageList = ref<IPackageInfo[]>([]);
const importInputRef = ref<HTMLInputElement | null>(null);

onMounted(async () =>
{
    await RefreshList();
});

async function RefreshList(): Promise<void>
{
    packageList.value = await listData.GetPackageList();
}

function OnOpenPackage(packageId: string): void
{
    emit('open', packageId);
}

function OnCreatePackage(): void
{
    const name = prompt('请输入新包名称：');
    if (name === null || name.trim() === '') return;

    void listData.CreatePackage(name.trim()).then(RefreshList);
}

function OnClickImport(): void
{
    importInputRef.value?.click();
}

async function OnImport(event: Event): Promise<void>
{
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files === null || files.length === 0) return;

    await listData.ImportPackage(files);
    input.value = '';
    await RefreshList();
}

async function OnExportPackage(info: IPackageInfo): Promise<void>
{
    const blob = await listData.ExportPackage(info.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (info.name || 'resourcePackage') + '.zip';
    a.click();
    URL.revokeObjectURL(url);
}

async function OnDeletePackage(info: IPackageInfo): Promise<void>
{
    if (confirm(`确定要删除资源包 "${info.name || info.id}" 吗？此操作不可撤销。`) === false) return;
    await listData.DeletePackage(info.id);
    await RefreshList();
}
</script>

<style scoped>
.packageList {
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.toolBar {
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid var(--sumiStudioCore-color-surface-variant-on);
    align-items: center;
    justify-content: space-between;
}

.leftTools {
    gap: 12px;
}

.rightTools {
    padding-right: 8px;
    gap: 8px;
    box-sizing: border-box;
}

.listBody {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    gap: 8px;
    align-content: flex-start;
}

.packageCard {
    padding: 12px 16px;
    gap: 12px;
    align-items: center;
    border-radius: 8px;
    background-color: var(--sumiStudioCore-color-surface-container);
    cursor: pointer;
    transition: background-color 0.15s;
    box-sizing: border-box;
}

.packageCard:hover {
    background-color: var(--sumiStudioCore-color-surface-container-high);
}

.packageIcon {
    font-size: 24px;
}

.packageMeta {
    flex: 1;
    gap: 4px;
    overflow: hidden;
}

.cardActions {
    gap: 8px;
    align-items: center;
}

.placeholderPanel {
    flex: 1;
}
</style>
