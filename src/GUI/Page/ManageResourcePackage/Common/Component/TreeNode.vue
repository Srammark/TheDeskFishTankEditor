<template>
    <div class="treeNode">
        <div
            :class="['nodeRow', selectedId === node.id ? 'nodeRow-select' : '']"
            :style="indentStyle"
            @click="OnSelect"
        >
            <span class="nodeIcon">{{ nodeIcon }}</span>
            <span class="nodeLabel">{{ node.label }}</span>
            <div style="display: flex; align-items: center; margin-left: auto; gap: 2px;">
                <Button
                    v-if="showAddChild"
                    variant="text"
                    icon-path="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                    style="width: 20px; height: 20px;"
                    icon-size="16"
                    @click.stop="OnAddChild"
                />
                <Button
                    v-if="showRemove"
                    variant="text"
                    icon-path="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                    style="width: 20px; height: 20px;"
                    icon-size="16"
                    @click.stop="OnRemove"
                />
            </div>
        </div>
        <div v-if="isExpanded && node.children" class="treeChildren">
            <TreeNode
                v-for="child in node.children"
                :key="child.id"
                :node="child"
                :selected-id="selectedId"
                :expanded-set="expandedSet"
                :level="level + 1"
                @select="emit('select', $event)"
                @remove="emit('remove', $event)"
                @add-child="emit('addChild', $event)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import { EMTreeNodeType, type ITreeNode } from '../../Types';

const props = defineProps<{
    node: ITreeNode;
    selectedId: string;
    expandedSet: Set<string>;
    level: number;
}>();

const emit = defineEmits<{
    (e: 'select', node: ITreeNode): void;
    (e: 'remove', node: ITreeNode): void;
    (e: 'addChild', node: ITreeNode): void;
}>();

const indentStyle = computed(() =>
{
    const paddingLeft = 16 + props.level * 16;
    return { paddingLeft: `${paddingLeft}px` };
});

const isExpanded = computed(() => props.expandedSet.has(props.node.id));

const nodeIcon = computed(() =>
{
    switch (props.node.type)
    {
        case EMTreeNodeType.CreatureFolder: return '🐠';
        case EMTreeNodeType.Species: return '🐟';
        case EMTreeNodeType.SpeciesDesc: return '📝';
        case EMTreeNodeType.Strain: return '🧬';
        case EMTreeNodeType.Sex:
            return props.node.sexName === 'Male' ? '♂' : props.node.sexName === 'Female' ? '♀' : '🐣';
        case EMTreeNodeType.ItemJson: return '📋';
        case EMTreeNodeType.SpriteFolder: return '🎨';
        case EMTreeNodeType.DecorationFolder: return '🖼️';
        case EMTreeNodeType.DecorationItem: return '🏺';
        case EMTreeNodeType.DecorationSpriteFolder: return '🎨';
        case EMTreeNodeType.SubstrateFolder: return '🏖️';
        case EMTreeNodeType.SubstrateItem: return '🧱';
        case EMTreeNodeType.GlassFolder: return '🪟';
        case EMTreeNodeType.GlassItem: return '🪟';
        default: return '📁';
    }
});

const showRemove = computed(() =>
{
    switch (props.node.type)
    {
        case EMTreeNodeType.Species:
        case EMTreeNodeType.DecorationItem:
        case EMTreeNodeType.DecorationPart:
        case EMTreeNodeType.SubstrateItem:
        case EMTreeNodeType.GlassItem:
        case EMTreeNodeType.LanguageFile:
            return true;
        case EMTreeNodeType.Strain:
            return props.node.strainName !== 'Normal';
        default:
            return false;
    }
});

const showAddChild = computed(() =>
    props.node.type === EMTreeNodeType.Species || props.node.type === EMTreeNodeType.DecorationItem);

function OnSelect(): void
{
    emit('select', props.node);
}

function OnRemove(): void
{
    emit('remove', props.node);
}

function OnAddChild(): void
{
    emit('addChild', props.node);
}
</script>

<style scoped>
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

.nodeIcon {
    font-size: 14px;
    line-height: 1;
}

.nodeLabel {
    font-size: var(--sumiStudio-font-body-medium-size);
    line-height: 1.4;
}
</style>
