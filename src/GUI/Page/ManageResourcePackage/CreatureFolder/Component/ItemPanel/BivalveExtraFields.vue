<template>
    <span class="sectionTitle">贝类专属</span>
    <div class="wR_HC fieldRow">
        <span class="label">滤水速率</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.filterRate" :precision="1" :min="0" />
            <span class="unit">毫升/秒</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import { type IBivalveItem } from '../../../Types';
import './itemPanel.css';

defineProps<{
    item: IBivalveItem;
}>();
</script>
