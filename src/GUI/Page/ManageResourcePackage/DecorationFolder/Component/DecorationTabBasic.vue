<template>
    <div class="wC_HSB tabContent">
        <div class="propRow">
            <label>{{ T('page.manageResourcePackage.decoration.partName') }}</label>
            <input v-model="part.name" type="text" @change="emit('update')" />
        </div>
        <div class="propRow">
            <label>{{ T('page.manageResourcePackage.decoration.partZIndex') }}</label>
            <input v-model.number="part.zIndex" type="number" @change="emit('update')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import type { IDecorationPart } from '../../Types';

defineProps<{
    part: IDecorationPart;
}>();

const emit = defineEmits<{
    (e: 'update'): void;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);
</script>

<style scoped>
.tabContent {
    flex: 1;
    overflow-y: auto;
    gap: 12px;
    padding-top: 8px;
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
</style>
