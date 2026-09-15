<template>
    <CreatureBaseFields :item="item" />
    <SnailExtraFields :item="item" />
</template>

<script setup lang="ts">
import CreatureBaseFields from './CreatureBaseFields.vue';
import SnailExtraFields from './SnailExtraFields.vue';
import { type ISnailItem } from '../../../Types';

defineProps<{
    item: ISnailItem;
}>();
</script>
