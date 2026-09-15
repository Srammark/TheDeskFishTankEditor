<template>
	<svg :width="sizeValue" :height="sizeValue" :viewBox="viewboxValue" :style="styles">
		<path :d="path" />
	</svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 默认配置
const types = {
	mdi: {
		size: 24,
		viewbox: '0 0 24 24',
	},
	'simple-icons': {
		size: 24,
		viewbox: '0 0 24 24',
	},
	default: {
		size: 0,
		viewbox: '0 0 0 0',
	},
} as const

type IconType = 'mdi' | 'simple-icons' | string
type FlipType = 'horizontal' | 'vertical' | 'both' | 'none' | undefined

const props = withDefaults(defineProps<{
	type?: IconType
	path: string
	size?: string | number
	viewbox?: string
	flip?: FlipType
	rotate?: number
}>(), {
	size: 24,
	rotate: 0,
});

// 取默认类型数据
const defaults = computed(() =>
{
	return types[props.type as keyof typeof types] || types.default;
});

// 尺寸值
const sizeValue = computed(() =>
{
	return props.size ?? defaults.value.size;
});

// viewbox
const viewboxValue = computed(() =>
{
	return props.viewbox ?? defaults.value.viewbox;
});

// 样式变量
const styles = computed(() => (
{
	'--sx': props.flip === 'horizontal' || props.flip === 'both' ? '-1' : '1',
	'--sy': props.flip === 'vertical' || props.flip === 'both' ? '-1' : '1',
	'--r': isNaN(props.rotate!) ? String(props.rotate) : `${props.rotate}deg`,
}));
</script>

<style scoped>
svg {
	transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
    transform-origin: center;
}

path {
	fill: currentColor;
}
</style>
