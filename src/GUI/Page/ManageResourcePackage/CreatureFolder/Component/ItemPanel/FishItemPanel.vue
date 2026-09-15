<template>
    <CreatureBaseFields :item="item" />
    <FishExtraFields :item="item" />
</template>

<script setup lang="ts">
import CreatureBaseFields from './CreatureBaseFields.vue';
import FishExtraFields from './FishExtraFields.vue';
import { type IFishItem } from '../../../Types';

defineProps<{
    item: IFishItem;
}>();
</script>
