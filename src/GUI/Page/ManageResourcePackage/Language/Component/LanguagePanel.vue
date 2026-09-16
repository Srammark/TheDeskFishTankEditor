<template>
    <div class="wC_HSVS panel">
        <div class="wR_HSVC" style="justify-content: space-between; flex-shrink: 0;">
            <span class="sumiStudio_font_title-small panelTitle">🌐 {{ T('page.manageResourcePackage.language.title', { langTag }) }}</span>
            <Button :text="T('page.manageResourcePackage.language.importJson')" variant="outlined" @click="OnToggleImport" />
        </div>
        <div class="splitView">
            <div class="editorPane">
                <div class="hint sumiStudio_font_body-small">{{ T('page.manageResourcePackage.language.hintPrefix') }} <code>fish.name</code> {{ T('page.manageResourcePackage.language.hintSuffix') }} <code>{ "fish": { "name": "..." } }</code></div>
                <div v-if="isImportVisible" class="importArea">
                    <TextArea v-model:text="importJsonText" class="importText" :placeholder="T('page.manageResourcePackage.language.importPlaceholder')" />
                    <div class="wR_HEVC" style="gap: 8px;">
                        <Button :text="T('page.manageResourcePackage.language.cancel')" variant="text" @click="OnToggleImport" />
                        <Button :text="T('page.manageResourcePackage.language.merge')" @click="OnApplyImport" />
                    </div>
                </div>
                <div class="entryList">
                    <div v-for="(entry, index) in entryList" :key="index" class="wR_HSVS entryRow">
                        <InputBox v-model:text="entry.path" :placeholder="T('page.manageResourcePackage.language.keyPlaceholder')" width="320px" />
                        <TextArea v-model:text="entry.value" :placeholder="T('page.manageResourcePackage.language.valuePlaceholder')" width="280px" />
                        <Button variant="text" icon-path="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style="width: 28px; height: 28px;" icon-size="18" @click="OnRemoveEntry(index)" />
                    </div>
                </div>
                <div class="addRow" @click="OnAddEntry">
                    <span class="nodeIcon">+</span>
                    <span class="nodeLabel">{{ T('page.manageResourcePackage.language.addEntry') }}</span>
                </div>
            </div>
            <div class="previewPane">
                <span class="previewTitle sumiStudio_font_title-small">{{ T('page.manageResourcePackage.language.preview') }}</span>
                <pre class="jsonPreview">{{ jsonPreview }}</pre>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import Button from '@/Core/Module/GUI/Control_DLL/Button/Button.vue';
import InputBox from '@/Core/Module/GUI/Control_DLL/InputBox/InputBox.vue';
import type { IResourcePackageData } from '../../ResourcePackageData';
import TextArea from '@/Core/Module/GUI/Control_DLL/TextArea/TextArea.vue';

const props = defineProps<{
    data: IResourcePackageData;
    langTag: string;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

interface ILanguageEntry {
    path: string;
    value: string;
}

const entryList = ref<ILanguageEntry[]>([]);

function FlattenObject(obj: Record<string, unknown>, prefix = ''): ILanguageEntry[] {
    const result: ILanguageEntry[] = [];
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const childEntries = FlattenObject(value as Record<string, unknown>, path);
            if (childEntries.length === 0) {
                result.push({ path, value: '' });
            } else {
                result.push(...childEntries);
            }
        } else {
            result.push({ path, value: String(value ?? '') });
        }
    }
    return result;
}

function SetByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
}

function BuildObject(entries: ILanguageEntry[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const entry of entries) {
        const path = entry.path.trim();
        if (path === '') continue;
        SetByPath(result, path, entry.value);
    }
    return result;
}

function LoadLanguage(): void {
    const data = props.data.GetLanguage(props.langTag) ?? {};
    entryList.value = FlattenObject(data);
}

watch(() => props.langTag, LoadLanguage, { immediate: true });

watch(entryList, () => {
    const data = BuildObject(entryList.value);
    props.data.SetLanguage(props.langTag, data);
}, { deep: true });

const jsonPreview = computed(() => {
    const json = JSON.stringify(BuildObject(entryList.value), null, 4);
    return json.replace(/\\n/g, '\n');
});

const isImportVisible = ref(false);
const importJsonText = ref('');

function OnToggleImport(): void {
    isImportVisible.value = !isImportVisible.value;
    importJsonText.value = '';
}

function OnApplyImport(): void {
    let parsed: unknown;
    try {
        parsed = JSON.parse(importJsonText.value);
    } catch {
        alert(T('page.manageResourcePackage.language.alertParseFailed'));
        return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        alert(T('page.manageResourcePackage.language.alertNotObject'));
        return;
    }

    const importList = FlattenObject(parsed as Record<string, unknown>);
    const pathIndexMap = new Map(entryList.value.map((entry, index) => [entry.path, index]));
    for (const importEntry of importList) {
        const existingIndex = pathIndexMap.get(importEntry.path);
        if (existingIndex !== undefined) {
            entryList.value[existingIndex].value = importEntry.value;
        } else {
            pathIndexMap.set(importEntry.path, entryList.value.length);
            entryList.value.push(importEntry);
        }
    }
    OnToggleImport();
}

function OnAddEntry(): void {
    entryList.value.push({ path: '', value: '' });
}

function OnRemoveEntry(index: number): void {
    entryList.value.splice(index, 1);
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

.splitView {
    width: 100%;
    display: flex;
    flex: 1;
    gap: 16px;
    overflow: hidden;
    min-height: 0;
}

.editorPane {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 12px;
    overflow-y: auto;
    min-width: 0;
}

.previewPane {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 8px;
    overflow-y: auto;
    min-width: 0;
    border-left: 1px solid var(--sumiStudioCore-color-outline-variant);
    padding-left: 16px;
}

.hint {
    color: var(--sumiStudioCore-color-outline);
    line-height: 1.5;
}

.hint code {
    background: var(--sumiStudioCore-color-surface-container-highest);
    padding: 1px 4px;
    border-radius: 4px;
    font-family: monospace;
}

.importArea {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
}

.importText :deep(textarea) {
    min-height: 120px;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    font-size: 13px;
}

.entryList {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.entryRow {
    gap: 8px;
}

.addRow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    cursor: pointer;
    color: var(--sumiStudioCore-color-primary);
    opacity: 0.8;
}

.addRow:hover {
    opacity: 1;
}

.nodeIcon {
    font-size: 14px;
    line-height: 1;
}

.nodeLabel {
    font-size: var(--sumiStudio-font-body-medium-size);
    line-height: 1.4;
}

.previewTitle {
    color: var(--sumiStudioCore-color-surface-on);
    flex-shrink: 0;
}

.jsonPreview {
    margin: 0;
    padding: 12px 16px;
    background: var(--sumiStudioCore-color-surface-container-highest);
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--sumiStudioCore-color-surface-on);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    user-select: text;
}
</style>
