<template>
    <CreatureBaseFields :item="item" />
    <BivalveExtraFields :item="item" />
</template>

<script setup lang="ts">
import CreatureBaseFields from './CreatureBaseFields.vue';
import BivalveExtraFields from './BivalveExtraFields.vue';
import { type IBivalveItem } from '../../../Types';

defineProps<{
    item: IBivalveItem;
}>();
</script>
