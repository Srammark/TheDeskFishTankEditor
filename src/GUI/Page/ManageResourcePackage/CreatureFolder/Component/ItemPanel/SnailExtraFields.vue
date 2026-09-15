<template>
    <!-- 螺类暂无专属属性 -->
</template>

<script setup lang="ts">
import { type ISnailItem } from '../../../Types';
import './itemPanel.css';

defineProps<{
    item: ISnailItem;
}>();
</script>
