<template>
  <MyCard :statusClass="statusClass">
    <template #title>
      <h3 class="title-row"><span class="icon-bar orange-bar" />福利活动</h3>
    </template>
    <template #badge>
      <span>{{ enabledCount > 0 ? `${enabledCount} 项` : '未启用' }}</span>
    </template>
    <template #default>
      <!-- 珍宝阁免费奖励 -->
      <div class="setting-item">
        <div class="setting-label">
          <span>珍宝阁免费奖励</span>
          <span class="setting-desc">开启后每天自动领取珍宝阁的免费奖励</span>
        </div>
        <n-switch v-model:value="localSettings.collectionFreeReward" />
      </div>

      <!-- 免费扭蛋 -->
      <div class="setting-item">
        <div class="setting-label">
          <span>免费扭蛋</span>
          <span class="setting-desc">每周二四六进行一次免费扭蛋</span>
        </div>
        <n-switch v-model:value="localSettings.freeGacha" />
      </div>

      <!-- 确认/取消（仅修改后显示） -->
      <div v-if="hasUnsavedChanges" class="confirm-bar">
        <span class="unsaved-hint">设置已修改</span>
        <div class="confirm-buttons">
          <n-button size="small" @click="cancelSettings">取消</n-button>
          <n-button size="small" type="primary" :loading="saving" @click="handleSave">确认</n-button>
        </div>
      </div>
    </template>
  </MyCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { isSettingsDirty } from '@utils/settingsDirtyCheck';
import { useMessage } from 'naive-ui';
import MyCard from '@/components/Common/MyCard.vue';
import { getExclusionSettings, updateExclusionSettings } from '@/utils/dailyFunctionApi';

const props = defineProps({
  tokenId: { type: String, required: true },
});

const emit = defineEmits(['refresh']);

const message = useMessage();
const saving = ref(false);

const defaultSettings = {
  collectionFreeReward: false,
  freeGacha: false,
};

const localSettings = ref({ ...defaultSettings });
const savedSettings = ref({ ...defaultSettings });

const hasUnsavedChanges = computed(() => {
  return isSettingsDirty(localSettings, savedSettings);
});

const enabledCount = computed(() => {
  let count = 0;
  if (localSettings.value.collectionFreeReward) count++;
  if (localSettings.value.freeGacha) count++;
  return count;
});

const statusClass = computed(() => {
  return {};
});

async function loadSettings() {
  try {
    const result = await getExclusionSettings(props.tokenId);
    const s = result?.settings || {};
    const welfare = {
      collectionFreeReward: s.collectionFreeReward || false,
      freeGacha: s.freeGacha || false,
    };
    localSettings.value = { ...welfare };
    savedSettings.value = { ...welfare };
  } catch {
    // 使用默认值
  }
}

watch(() => props.tokenId, () => {
  loadSettings();
}, { immediate: true });

function cancelSettings() {
  localSettings.value = { ...savedSettings.value };
}

async function handleSave() {
  saving.value = true;
  try {
    const result = await getExclusionSettings(props.tokenId);
    const fullSettings = result?.settings || {};
    fullSettings.collectionFreeReward = localSettings.value.collectionFreeReward;
    fullSettings.freeGacha = localSettings.value.freeGacha;
    await updateExclusionSettings(props.tokenId, fullSettings);
    savedSettings.value = { ...localSettings.value };
    message.success('福利设置已保存');
    emit('refresh');
  } catch (err) {
    message.error(`保存失败: ${err.message}`);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
:deep(.status-icon) {
  display: none;
}
.title-row {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}
.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.setting-desc {
  font-size: 11px;
  color: var(--text-tertiary, #999);
}
.icon-bar {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  flex-shrink: 0;
}
.orange-bar {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}
.confirm-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-light, #eee);
}
.unsaved-hint {
  font-size: 12px;
  color: var(--warning-color, #faad14);
}
.confirm-buttons {
  display: flex;
  gap: 6px;
}
</style>
