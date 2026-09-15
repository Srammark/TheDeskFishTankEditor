<template>
    <div class="wC_HC resourcePackageEditor">
        <div class="wR_HC toolBar">
            <div class="wR_HSVC leftTools" style="width: 50%;">
                <Button icon-path="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" variant="text" @click="OnBack" />
                <span class="sumiStudio_font_title-small" style="color: var(--sumiStudioCore-color-surface-on);">🎒 {{ packageData.packageInfo.name || '资源扩展包编辑器' }}</span>
            </div>
            <div class="wR_HEVC rightTools" style="width: 50%;">
                <input ref="importInputRef" type="file" webkitdirectory directory multiple style="display: none;" @change="OnImport" />
                <Button text="导入" variant="outlined" @click="OnClickImport" />
                <Button text="导出" variant="outlined" @click="OnExport" />
                <Button text="保存" @click="OnSave" />
            </div>
        </div>
        <div class="wR_HC editorBody">
            <PackageTree
                :data="packageData"
                @select="OnSelectNode"
                @addSpecies="OnAddSpecies"
                @removeSpecies="OnRemoveSpecies"
                @addStrain="OnAddStrain"
                @removeStrain="OnRemoveStrain"
                @addDecoration="OnAddDecoration"
                @removeDecoration="OnRemoveDecoration"
                @removeDecorationPart="OnRemoveDecorationPart"
                @addSubstrate="OnAddSubstrate"
                @removeSubstrate="OnRemoveSubstrate"
                @addGlass="OnAddGlass"
                @removeGlass="OnRemoveGlass"
                @addLanguage="OnAddLanguage"
                @removeLanguage="OnRemoveLanguage"
            />
            <div class="panelContainer">
                <PackageInfoPanel v-if="selection.nodeType === EMTreeNodeType.PackageInfo" :data="packageData" />
                <LanguagePanel v-else-if="selection.nodeType === EMTreeNodeType.LanguageFile" :data="packageData" :langTag="selection.langTag!" />
                <SpeciesDescPanel v-else-if="selection.nodeType === EMTreeNodeType.SpeciesDesc" :data="packageData" :speciesName="selection.speciesName!" />
                <StrainPanel v-else-if="selection.nodeType === EMTreeNodeType.Strain" :data="packageData" :speciesName="selection.speciesName!" :strainName="selection.strainName!" />
                <CreatureItemPanel v-else-if="selection.nodeType === EMTreeNodeType.ItemJson" :data="packageData" :speciesName="selection.speciesName!" :strainName="selection.strainName!" :sexName="selection.sexName!" />
                <SpritePanel v-else-if="selection.nodeType === EMTreeNodeType.SpriteFolder" :data="packageData" :speciesName="selection.speciesName!" :strainName="selection.strainName!" :sexName="selection.sexName!" />
                <DecorationPreviewPanel v-else-if="selection.nodeType === EMTreeNodeType.DecorationItem" :data="packageData" :decorationName="selection.decorationName!" />
                <DecorationItemPanel v-else-if="selection.nodeType === EMTreeNodeType.DecorationPart" :data="packageData" :decorationName="selection.decorationName!" :partID="selection.partID!" />
                <DecorationSpritePanel v-else-if="selection.nodeType === EMTreeNodeType.DecorationSpriteFolder" :data="packageData" :decorationName="selection.decorationName!" @selectPart="(partID: string) => OnSelectDecorationPart(selection.decorationName!, partID)" />
                <SubstratePanel v-else-if="selection.nodeType === EMTreeNodeType.SubstrateItem" :data="packageData" :substrateName="selection.substrateName!" />
                <GlassPanel v-else-if="selection.nodeType === EMTreeNodeType.GlassItem" :data="packageData" :styleName="selection.glassName!" />
                <div v-else class="wR_HCVC placeholderPanel">
                    <span class="sumiStudio_font_body-large" style="color: var(--sumiStudioCore-color-surface-on-20);">请在左侧选择一个节点进行编辑</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import PackageTree from './Common/Component/PackageTree.vue';
import PackageInfoPanel from './Common/Component/PackageInfoPanel.vue';
import SpeciesDescPanel from './CreatureFolder/Component/SpeciesDescPanel.vue';
import StrainPanel from './CreatureFolder/Component/StrainPanel.vue';
import CreatureItemPanel from './CreatureFolder/Component/CreatureItemPanel.vue';
import SpritePanel from './CreatureFolder/Component/SpritePanel.vue';
import LanguagePanel from './Language/Component/LanguagePanel.vue';
import DecorationPreviewPanel from './DecorationFolder/Component/DecorationPreviewPanel.vue';
import DecorationItemPanel from './DecorationFolder/Component/DecorationItemPanel.vue';
import DecorationSpritePanel from './DecorationFolder/Component/DecorationSpritePanel.vue';
import SubstratePanel from './Substrate/Component/SubstratePanel.vue';
import GlassPanel from './Glass/Component/GlassPanel.vue';
import ResourcePackageData from './ResourcePackageData';
import { EMTreeNodeType, EMResourceType, DECORATION_FOLDER, type IEditorSelection } from './Types';

const props = defineProps<{
    packageId: string
}>();

const emit = defineEmits<{
    back: []
}>();

const packageData = ref(new ResourcePackageData(props.packageId));
const importInputRef = ref<HTMLInputElement | null>(null);
const selection = ref<IEditorSelection>({
    nodeType: EMTreeNodeType.PackageInfo,
    nodeID: 'info',
    resourceType: null
});

onMounted(async () =>
{
    await packageData.value.Load();
});

function OnSelectNode(sel: IEditorSelection): void
{
    selection.value = sel;
}

function OnAddSpecies(): void
{
    const name = prompt('请输入物种文件夹名称（拉丁学名，如 PoeciliaReticulata）：');
    if (name === null || name.trim() === '') return;

    const categoryText = prompt('请选择物种类型：\n1. 鱼 (Fish)\n2. 虾 (Shrimp)\n3. 蟹 (Crab)\n4. 螺 (Snail)\n5. 贝类 (Bivalve)\n\n请输入序号：', '1');
    if (categoryText === null) return;

    const categoryMap: Record<string, 'Fish' | 'Shrimp' | 'Crab' | 'Snail' | 'Bivalve'> = {
        '1': 'Fish',
        '2': 'Shrimp',
        '3': 'Crab',
        '4': 'Snail',
        '5': 'Bivalve'
    };
    const category = categoryMap[categoryText.trim()];
    if (category === undefined)
    {
        alert('无效的类型序号。');
        return;
    }

    packageData.value.AddSpecies(category, name.trim());
}

async function OnRemoveSpecies(speciesName: string): Promise<void>
{
    if (confirm(`确定要删除物种 "${speciesName}" 吗？此操作不可撤销。`) === false) return;
    await packageData.value.RemoveSpecies(speciesName);
}

function OnAddStrain(speciesName: string): void
{
    const name = prompt('请输入新品系名称（如 Albino）：');
    if (name === null || name.trim() === '') return;

    packageData.value.AddStrain(speciesName, name.trim());
}

async function OnRemoveStrain(speciesName: string, strainName: string): Promise<void>
{
    if (confirm(`确定要删除品系 "${strainName}" 吗？`) === false) return;
    await packageData.value.RemoveStrain(speciesName, strainName);
}

function OnAddDecoration(): void
{
    const name = prompt('请输入装饰物文件夹名称：');
    if (name === null || name.trim() === '') return;

    packageData.value.AddDecoration(name.trim());
}

async function OnRemoveDecoration(decorationName: string): Promise<void>
{
    if (confirm(`确定要删除装饰物 "${decorationName}" 吗？`) === false) return;
    await packageData.value.RemoveDecoration(decorationName);
}

function OnRemoveDecorationPart(decorationName: string, partID: string): void
{
    const part = packageData.value.GetDecorationPart(decorationName, partID);
    if (confirm(`确定要删除子部件 "${part?.name ?? partID}" 吗？`) === false) return;
    packageData.value.RemoveDecorationPart(decorationName, partID);
    if (selection.value.nodeType === EMTreeNodeType.DecorationPart && selection.value.partID === partID)
    {
        selection.value = {
            nodeType: EMTreeNodeType.DecorationItem,
            nodeID: `${DECORATION_FOLDER}/${decorationName}`,
            resourceType: EMResourceType.Decoration,
            decorationName
        };
    }
}

function OnAddSubstrate(): void
{
    const name = prompt('请输入基底文件夹名称：');
    if (name === null || name.trim() === '') return;

    packageData.value.AddSubstrate(name.trim());
}

async function OnRemoveSubstrate(substrateName: string): Promise<void>
{
    if (confirm(`确定要删除基底 "${substrateName}" 吗？`) === false) return;
    await packageData.value.RemoveSubstrate(substrateName);
}

function OnAddGlass(): void
{
    const name = prompt('请输入玻璃样式文件夹名称：');
    if (name === null || name.trim() === '') return;

    packageData.value.AddGlass(name.trim());
}

async function OnRemoveGlass(styleName: string): Promise<void>
{
    if (confirm(`确定要删除玻璃样式 "${styleName}" 吗？`) === false) return;
    await packageData.value.RemoveGlass(styleName);
}

function OnAddLanguage(langTag?: string): void
{
    if (langTag === undefined || langTag === '') return;

    if (packageData.value.GetLanguageTagList().includes(langTag))
    {
        alert('该语言标签已存在。');
        return;
    }
    packageData.value.AddLanguage(langTag);
}

async function OnRemoveLanguage(langTag: string): Promise<void>
{
    if (confirm(`确定要删除语言文件 "${langTag}.json" 吗？`) === false) return;
    await packageData.value.RemoveLanguage(langTag);
}

function OnSelectDecorationPart(decorationName: string, partID: string): void
{
    selection.value = {
        nodeType: EMTreeNodeType.DecorationPart,
        nodeID: `${DECORATION_FOLDER}/${decorationName}/part/${partID}`,
        resourceType: EMResourceType.Decoration,
        decorationName,
        partID
    };
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

    await packageData.value.ImportFromFolder(files);
    input.value = '';
}

async function OnExport(): Promise<void>
{
    const blob = await packageData.value.ExportToZip();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (packageData.value.packageInfo.name || 'resourcePackage') + '.zip';
    a.click();
    URL.revokeObjectURL(url);
}

async function OnSave(): Promise<void>
{
    await packageData.value.Save();
}

function OnBack(): void
{
    emit('back');
}
</script>

<style scoped>
.resourcePackageEditor {
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
    align-items: center;
}

.rightTools {
    padding-right: 8px;
    gap: 8px;
    align-items: center;
    box-sizing: border-box;
}

.editorBody {
    flex: 1;
    overflow: hidden;
}

.panelContainer {
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.placeholderPanel {
    flex: 1;
}
</style>
