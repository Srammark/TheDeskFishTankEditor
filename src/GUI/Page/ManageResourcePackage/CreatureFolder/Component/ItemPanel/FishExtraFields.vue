<template>
    <span class="sectionTitle">鱼类专属</span>
    <div class="wR_HC fieldRow">
        <span class="label">游动模式</span>
        <SelectBox v-model:value="item.swimMode" width="220px" :list="SwimModeOptionList" />
    </div>
</template>

<script setup lang="ts">
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import { SwimModeOptionList, type IFishItem } from '../../../Types';
import './itemPanel.css';

defineProps<{
    item: IFishItem;
}>();
</script>
