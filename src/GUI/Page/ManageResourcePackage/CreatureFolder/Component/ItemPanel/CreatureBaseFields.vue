<template>
    <div class="wR_HC fieldRow">
        <span class="label">最高速度</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.speedLimit" :precision="0" :min="0" />
            <span class="unit">mm/s</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">感知半径</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.visualRadius" :precision="0" :min="0" />
            <span class="unit">mm</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">体型大小</span>
        <div class="wR_HCB fieldGroup">
            <span class="subLabel">大</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[0][0]" :precision="0" :min="0" />
            <span class="subLabel">×</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[0][1]" :precision="0" :min="0" />
            <span class="subLabel" style="margin: 0 5px;">|</span>
            <span class="subLabel">中</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[1][0]" :precision="0" :min="0" />
            <span class="subLabel">×</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[1][1]" :precision="0" :min="0" />
            <span class="subLabel" style="margin: 0 5px;">|</span>
            <span class="subLabel">小</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[2][0]" :precision="0" :min="0" />
            <span class="subLabel">×</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[2][1]" :precision="0" :min="0" />
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">活动水层</span>
        <div class="wR_HCB fieldGroup">
            <span class="subLabel">浅</span>
            <NumericInlineInput v-model="item.swimmingLevel[0]" :precision="2" :min="0" :max="1" />
            <span class="subLabel">深</span>
            <NumericInlineInput v-model="item.swimmingLevel[1]" :precision="2" :min="0" :max="1" />
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">群居性</span>
        <SelectBox v-model:value="item.gregariousness" width="120px" :list="GregariousnessOptionList" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">理想群数</span>
        <NumericInlineInput v-model="item.idealGroupSize" :precision="0" :min="1" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">攻击性</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.aggression" class="slider" />
            <span class="valueText">{{ item.aggression.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">领地意识</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.territoriality" class="slider" />
            <span class="valueText">{{ item.territoriality.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">食性</span>
        <SelectBox v-model:value="item.diet" width="160px" :list="DietOptionList" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">代谢量</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.metabolism" :precision="2" :min="0" />
            <span class="unit">mg/日</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">压力敏感</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.stressSensitivity" class="slider" />
            <span class="valueText">{{ item.stressSensitivity.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">警惕性</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.alertness" class="slider" />
            <span class="valueText">{{ item.alertness.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">繁殖方式</span>
        <SelectBox v-model:value="item.reproduction" width="120px" :list="ReproductionOptionList" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">适宜温度</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.temperature[0]" :precision="0" />
            <span class="subLabel">~</span>
            <NumericInlineInput v-model="item.temperature[1]" :precision="0" />
            <span class="unit">°C</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">寿命</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="lifespanYear" :precision="1" :min="0" />
            <span class="unit">年</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">成熟期</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="matureAgeMonth" :precision="0" :min="0" />
            <span class="unit">月</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">每窝数量</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.litterSize[0]" :precision="0" :min="1" />
            <span class="subLabel">~</span>
            <NumericInlineInput v-model="item.litterSize[1]" :precision="0" :min="1" />
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">孵化时间</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="hatchTimeDay" :precision="1" :min="0" />
            <span class="unit">天</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">怀孕时长</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="gestationTimeDay" :precision="1" :min="0" />
            <span class="unit">天</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">昼夜习性</span>
        <SelectBox v-model:value="item.dayNightHabit" width="120px" :list="DayNightHabitOptionList" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import {
    type ICreatureItemBase,
    DayNightHabitOptionList, DietOptionList, GregariousnessOptionList,
    MS_PER_DAY, MS_PER_MONTH, MS_PER_YEAR, ReproductionOptionList
} from '../../../Types';
import './itemPanel.css';

const props = defineProps<{
    item: ICreatureItemBase;
}>();

/** 寿命（界面按年显示，数据按毫秒存储） */
const lifespanYear = computed({
    get: () => props.item.lifespan / MS_PER_YEAR,
    set: (value) => { props.item.lifespan = value * MS_PER_YEAR; }
});

/** 成熟期（界面按月显示，数据按毫秒存储） */
const matureAgeMonth = computed({
    get: () => props.item.matureAge / MS_PER_MONTH,
    set: (value) => { props.item.matureAge = value * MS_PER_MONTH; }
});

/** 孵化时间（界面按天显示，数据按毫秒存储） */
const hatchTimeDay = computed({
    get: () => props.item.hatchTime / MS_PER_DAY,
    set: (value) => { props.item.hatchTime = value * MS_PER_DAY; }
});

/** 怀孕时长（界面按天显示，数据按毫秒存储） */
const gestationTimeDay = computed({
    get: () => props.item.gestationTime / MS_PER_DAY,
    set: (value) => { props.item.gestationTime = value * MS_PER_DAY; }
});
</script>
