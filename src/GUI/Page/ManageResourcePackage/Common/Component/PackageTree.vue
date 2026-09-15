<template>
    <div class="wC_HSVS packageTree">
        <div class="wR_HC treeHeader">
            <span class="sumiStudio_font_title-small" style="color: var(--sumiStudioCore-color-surface-on);">扩展包结构</span>
        </div>
        <div class="treeContent">
            <!-- 包信息 -->
            <div class="treeNode" @click="OnSelectNode(infoNode)">
                <div :class="['nodeRow', selectedId === infoNode.id ? 'nodeRow-select' : '']">
                    <span class="nodeIcon">📦</span>
                    <span class="nodeLabel">包信息</span>
                </div>
            </div>

            <!-- 国际化 -->
            <div class="treeNode">
                <div :class="['nodeRow', selectedId === languageNode.id ? 'nodeRow-select' : '']" @click="OnSelectNode(languageNode)">
                    <span class="nodeIcon">🌐</span>
                    <span class="nodeLabel">国际化</span>
                </div>
                <div v-if="expandedSet.has(languageNode.id)" class="treeChildren">
                    <TreeNode
                        v-for="langTag in data.GetLanguageTagList()"
                        :key="langTag"
                        :node="CreateLanguageNode(langTag)"
                        :selected-id="selectedId"
                        :expanded-set="expandedSet"
                        :level="1"
                        @select="OnSelectNode"
                        @remove="OnRemoveLanguageNode"
                    />
                    <div v-if="isAddingLanguage === false" class="nodeRow childRow" @click="OnAddLanguage">
                        <span class="nodeIcon">+</span>
                        <span class="nodeLabel">添加语言</span>
                    </div>
                    <div v-else class="nodeRow childRow" style="gap: 4px;">
                        <SelectBox v-model:value="newLangTag" width="160px" placeholder="选择语言" :list="availableLangList" />
                        <Button variant="text" icon-path="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style="width: 20px; height: 20px; margin-left: auto;" icon-size="16" @click="OnCancelAddLanguage" />
                    </div>
                </div>
            </div>

            <!-- 资源文件夹 -->
            <div v-for="handler in data.GetResourceHandlers()" :key="handler.FolderName" class="treeNode">
                <div
                    :class="['nodeRow', selectedId === handler.FolderName ? 'nodeRow-select' : '']"
                    @click="OnSelectResourceFolder(handler)"
                >
                    <span class="nodeIcon">{{ GetResourceFolderIcon(handler.ResourceType) }}</span>
                    <span class="nodeLabel">{{ handler.DisplayName }}</span>
                </div>
                <div v-if="expandedSet.has(handler.FolderName)" class="treeChildren">
                    <TreeNode
                        v-for="child in handler.GetTreeNodes()[0]?.children ?? []"
                        :key="child.id"
                        :node="child"
                        :selected-id="selectedId"
                        :expanded-set="expandedSet"
                        :level="1"
                        @select="OnSelectNode"
                        @remove="OnRemoveResourceNode"
                        @add-child="OnAddResourceChild"
                    />
                    <div class="nodeRow childRow" @click="OnAddResourceItem(handler)">
                        <span class="nodeIcon">+</span>
                        <span class="nodeLabel">{{ GetAddResourceLabel(handler.ResourceType) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import {
    EMTreeNodeType, EMResourceType, LANGUAGE_FOLDER,
    type IEditorSelection, type ITreeNode, type IResourceHandler,
    type IDecorationPart,
    LanguageTagOptionList
} from '../../Types';
import type { IResourcePackageData } from '../../ResourcePackageData';
import TreeNode from './TreeNode.vue';

const props = defineProps<{
    data: IResourcePackageData;
}>();

const emit = defineEmits<{
    (e: 'select', selection: IEditorSelection): void;
    (e: 'addSpecies'): void;
    (e: 'removeSpecies', speciesName: string): void;
    (e: 'addStrain', speciesName: string): void;
    (e: 'removeStrain', speciesName: string, strainName: string): void;
    (e: 'addDecoration'): void;
    (e: 'removeDecoration', decorationName: string): void;
    (e: 'removeDecorationPart', decorationName: string, partID: string): void;
    (e: 'addSubstrate'): void;
    (e: 'removeSubstrate', substrateName: string): void;
    (e: 'addGlass'): void;
    (e: 'removeGlass', styleName: string): void;
    (e: 'addLanguage', langTag: string): void;
    (e: 'removeLanguage', langTag: string): void;
}>();

const selectedId = ref('info');
const expandedSet = ref(new Set<string>());
const isAddingLanguage = ref(false);
const newLangTag = ref('');

const infoNode: ITreeNode = {
    id: 'info',
    type: EMTreeNodeType.PackageInfo,
    resourceType: null,
    label: '包信息',
    path: 'info'
};

const languageNode: ITreeNode = {
    id: LANGUAGE_FOLDER,
    type: EMTreeNodeType.LanguageFolder,
    resourceType: null,
    label: '国际化',
    path: LANGUAGE_FOLDER
};

const availableLangList = computed(() =>
{
    const existing = new Set(props.data.GetLanguageTagList());
    return LanguageTagOptionList.filter(opt => existing.has(opt.value) === false);
});

function CreateLanguageNode(langTag: string): ITreeNode
{
    return {
        id: `${LANGUAGE_FOLDER}/${langTag}`,
        type: EMTreeNodeType.LanguageFile,
        resourceType: null,
        label: langTag,
        path: `${LANGUAGE_FOLDER}/${langTag}`,
        langTag
    };
}

function ToggleExpand(nodeId: string): void
{
    if (expandedSet.value.has(nodeId))
    {
        expandedSet.value.delete(nodeId);
    }
    else
    {
        expandedSet.value.add(nodeId);
    }
    expandedSet.value = new Set(expandedSet.value);
}

function OnSelectNode(node: ITreeNode): void
{
    selectedId.value = node.id;
    ToggleExpand(node.id);

    const selection: IEditorSelection = {
        nodeType: node.type,
        nodeID: node.id,
        resourceType: node.resourceType,
        speciesName: node.speciesName,
        strainName: node.strainName,
        sexName: node.sexName,
        langTag: node.langTag,
        decorationName: node.decorationName,
        partID: node.partID,
        substrateName: node.substrateName,
        glassName: node.glassName
    };
    emit('select', selection);
}

function OnSelectResourceFolder(handler: IResourceHandler): void
{
    const folderNode = handler.GetTreeNodes()[0];
    if (folderNode === undefined) return;
    OnSelectNode(folderNode);
}

function GetResourceFolderIcon(type: EMResourceType): string
{
    switch (type)
    {
        case EMResourceType.Creature: return '🐟';
        case EMResourceType.Decoration: return '🪸';
        case EMResourceType.Substrate: return '🪨';
        case EMResourceType.Glass: return '🪟';
        default: return '📁';
    }
}

function GetAddResourceLabel(type: EMResourceType): string
{
    switch (type)
    {
        case EMResourceType.Creature: return '添加物种';
        case EMResourceType.Decoration: return '添加装饰物';
        case EMResourceType.Substrate: return '添加基底';
        case EMResourceType.Glass: return '添加玻璃样式';
        default: return '添加资源';
    }
}

function OnAddResourceItem(handler: IResourceHandler): void
{
    if (handler.ResourceType === EMResourceType.Creature)
    {
        emit('addSpecies');
    }
    else if (handler.ResourceType === EMResourceType.Decoration)
    {
        emit('addDecoration');
    }
    else if (handler.ResourceType === EMResourceType.Substrate)
    {
        emit('addSubstrate');
    }
    else if (handler.ResourceType === EMResourceType.Glass)
    {
        emit('addGlass');
    }
}

function OnRemoveResourceNode(node: ITreeNode): void
{
    if (node.resourceType === EMResourceType.Creature)
    {
        if (node.type === EMTreeNodeType.Species && node.speciesName !== undefined)
        {
            emit('removeSpecies', node.speciesName);
        }
        else if (node.type === EMTreeNodeType.Strain && node.speciesName !== undefined && node.strainName !== undefined)
        {
            emit('removeStrain', node.speciesName, node.strainName);
        }
    }
    else if (node.resourceType === EMResourceType.Decoration && node.decorationName !== undefined)
    {
        if (node.type === EMTreeNodeType.DecorationPart && node.partID !== undefined)
        {
            emit('removeDecorationPart', node.decorationName, node.partID);
        }
        else
        {
            emit('removeDecoration', node.decorationName);
        }
    }
    else if (node.resourceType === EMResourceType.Substrate && node.substrateName !== undefined)
    {
        emit('removeSubstrate', node.substrateName);
    }
    else if (node.resourceType === EMResourceType.Glass && node.glassName !== undefined)
    {
        emit('removeGlass', node.glassName);
    }
}

function OnRemoveLanguageNode(node: ITreeNode): void
{
    if (node.langTag !== undefined)
    {
        emit('removeLanguage', node.langTag);
    }
}

function OnAddResourceChild(node: ITreeNode): void
{
    if (node.type === EMTreeNodeType.Species && node.speciesName !== undefined)
    {
        emit('addStrain', node.speciesName);
    }
    else if (node.type === EMTreeNodeType.DecorationItem && node.decorationName !== undefined)
    {
        const item = props.data.GetDecorationItem(node.decorationName);
        if (item === undefined) return;

        const newPart: IDecorationPart = {
            id: GenerateID(),
            name: `部件 ${item.partList.length + 1}`,
            zIndex: item.partList.length,
            areaList: []
        };
        props.data.AddDecorationPart(node.decorationName, newPart);

        const selection: IEditorSelection = {
            nodeType: EMTreeNodeType.DecorationPart,
            nodeID: `${node.path}/part/${newPart.id}`,
            resourceType: EMResourceType.Decoration,
            decorationName: node.decorationName,
            partID: newPart.id
        };
        selectedId.value = selection.nodeID;
        emit('select', selection);
    }
}

function GenerateID(): string
{
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function OnAddLanguage(): void
{
    isAddingLanguage.value = true;
    newLangTag.value = '';
}

function OnCancelAddLanguage(): void
{
    isAddingLanguage.value = false;
    newLangTag.value = '';
}

watch(newLangTag, (tag) =>
{
    if (tag !== '' && tag !== undefined && tag !== null)
    {
        emit('addLanguage', tag);
        isAddingLanguage.value = false;
        newLangTag.value = '';
    }
});

// 默认展开根节点
expandedSet.value.add(LANGUAGE_FOLDER);
</script>

<style scoped>
.packageTree {
    width: 260px;
    min-width: 260px;
    border-right: 1px solid var(--sumiStudioCore-color-surface-variant-on);
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.treeHeader {
    padding: 12px 16px;
    border-bottom: 1px solid var(--sumiStudioCore-color-surface-variant-on);
}

.treeContent {
    padding: 8px 0;
    width: 100%;
    flex: 1;
    overflow-y: auto;
}

.treeNode {
    display: flex;
    flex-direction: column;
}

.treeChildren {
    display: flex;
    flex-direction: column;
}

.nodeRow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    cursor: pointer;
    transition: background-color 0.15s;
    color: var(--sumiStudioCore-color-surface-on);
}

.nodeRow:hover {
    background-color: var(--sumiStudioCore-color-primary-container);
}

.nodeRow-select {
    background-color: var(--sumiStudioCore-color-primary-container);
}

.childRow {
    padding-left: 32px;
}

.nodeIcon {
    font-size: 14px;
    line-height: 1;
}

.nodeLabel {
    font-size: var(--sumiStudio-font-body-medium-size);
    line-height: 1.4;
}
</style>
