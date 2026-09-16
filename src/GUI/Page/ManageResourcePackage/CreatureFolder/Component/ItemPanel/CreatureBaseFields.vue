<template>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.speedLimit') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.speedLimit" :precision="0" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.mmPerSecond') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.visualRadius') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.visualRadius" :precision="0" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.mm') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.stature') }}</span>
        <div class="wR_HCB fieldGroup">
            <span class="subLabel">{{ T('page.manageResourcePackage.item.base.sizeLarge') }}</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[0][0]" :precision="0" :min="0" />
            <span class="subLabel">×</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[0][1]" :precision="0" :min="0" />
            <span class="subLabel" style="margin: 0 5px;">|</span>
            <span class="subLabel">{{ T('page.manageResourcePackage.item.base.sizeMedium') }}</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[1][0]" :precision="0" :min="0" />
            <span class="subLabel">×</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[1][1]" :precision="0" :min="0" />
            <span class="subLabel" style="margin: 0 5px;">|</span>
            <span class="subLabel">{{ T('page.manageResourcePackage.item.base.sizeSmall') }}</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[2][0]" :precision="0" :min="0" />
            <span class="subLabel">×</span>
            <NumericInlineInput :width="'32px'" v-model="item.stature[2][1]" :precision="0" :min="0" />
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.swimmingLevel') }}</span>
        <div class="wR_HCB fieldGroup">
            <span class="subLabel">{{ T('page.manageResourcePackage.item.base.levelShallow') }}</span>
            <NumericInlineInput v-model="item.swimmingLevel[0]" :precision="2" :min="0" :max="1" />
            <span class="subLabel">{{ T('page.manageResourcePackage.item.base.levelDeep') }}</span>
            <NumericInlineInput v-model="item.swimmingLevel[1]" :precision="2" :min="0" :max="1" />
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.gregariousness') }}</span>
        <SelectBox v-model:value="item.gregariousness" width="120px" :list="GetGregariousnessOptionList()" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.idealGroupSize') }}</span>
        <NumericInlineInput v-model="item.idealGroupSize" :precision="0" :min="1" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.aggression') }}</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.aggression" class="slider" />
            <span class="valueText">{{ item.aggression.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.territoriality') }}</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.territoriality" class="slider" />
            <span class="valueText">{{ item.territoriality.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.diet') }}</span>
        <SelectBox v-model:value="item.diet" width="160px" :list="GetDietOptionList()" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.metabolism') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.metabolism" :precision="2" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.mgPerDay') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.stressSensitivity') }}</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.stressSensitivity" class="slider" />
            <span class="valueText">{{ item.stressSensitivity.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.alertness') }}</span>
        <div class="wR_HCB fieldGroup">
            <input type="range" min="0" max="1" step="0.05" v-model.number="item.alertness" class="slider" />
            <span class="valueText">{{ item.alertness.toFixed(2) }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.reproduction') }}</span>
        <SelectBox v-model:value="item.reproduction" width="120px" :list="GetReproductionOptionList()" />
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.temperature') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.temperature[0]" :precision="0" />
            <span class="subLabel">~</span>
            <NumericInlineInput v-model="item.temperature[1]" :precision="0" />
            <span class="unit">°C</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.lifespan') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="lifespanYear" :precision="1" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.year') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.matureAge') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="matureAgeMonth" :precision="0" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.month') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.litterSize') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="item.litterSize[0]" :precision="0" :min="1" />
            <span class="subLabel">~</span>
            <NumericInlineInput v-model="item.litterSize[1]" :precision="0" :min="1" />
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.hatchTime') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="hatchTimeDay" :precision="1" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.day') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.gestationTime') }}</span>
        <div class="wR_HCB fieldGroup">
            <NumericInlineInput v-model="gestationTimeDay" :precision="1" :min="0" />
            <span class="unit">{{ T('page.manageResourcePackage.item.unit.day') }}</span>
        </div>
    </div>
    <div class="wR_HC fieldRow">
        <span class="label">{{ T('page.manageResourcePackage.item.base.dayNightHabit') }}</span>
        <SelectBox v-model:value="item.dayNightHabit" width="120px" :list="GetDayNightHabitOptionList()" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IOC from '@/Core/IOC_DLL/IOC';
import type IServiceLanguage from '@/Core/IOC_DLL/Interface/I18N/IServiceLanguage';
import Sym from '@/Core/IOC_DLL/Sym';
import SelectBox from '@/Core/Module/GUI/Control_DLL/SelectBox/SelectBox.vue';
import NumericInlineInput from '@/Core/Module/GUI/Control_DLL/NumericInlineInput/NumericInlineInput.vue';
import {
    type ICreatureItemBase,
    GetDayNightHabitOptionList, GetDietOptionList, GetGregariousnessOptionList,
    MS_PER_DAY, MS_PER_MONTH, MS_PER_YEAR, GetReproductionOptionList
} from '../../../Types';
import './itemPanel.css';

const props = defineProps<{
    item: ICreatureItemBase;
}>();

const sLanguage = IOC.Get<IServiceLanguage>(Sym.ServiceLanguage);
const T = (key: string, args?: Record<string, unknown>) => sLanguage.T(key, args);

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
