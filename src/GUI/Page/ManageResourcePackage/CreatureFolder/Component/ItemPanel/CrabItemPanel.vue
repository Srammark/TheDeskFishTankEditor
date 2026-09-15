<template>
    <CreatureBaseFields :item="item" />
    <CrabExtraFields :item="item" />
</template>

<script setup lang="ts">
import CreatureBaseFields from './CreatureBaseFields.vue';
import CrabExtraFields from './CrabExtraFields.vue';
import { type ICrabItem } from '../../../Types';

defineProps<{
    item: ICrabItem;
}>();
</script>
