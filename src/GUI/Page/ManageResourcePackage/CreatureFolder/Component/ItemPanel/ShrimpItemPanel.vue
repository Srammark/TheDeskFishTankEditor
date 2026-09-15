<template>
    <CreatureBaseFields :item="item" />
    <ShrimpExtraFields :item="item" />
</template>

<script setup lang="ts">
import CreatureBaseFields from './CreatureBaseFields.vue';
import ShrimpExtraFields from './ShrimpExtraFields.vue';
import { type IShrimpItem } from '../../../Types';

defineProps<{
    item: IShrimpItem;
}>();
</script>
