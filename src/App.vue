<template>
  <n-config-provider :theme="naiveTheme">
    <n-message-provider>
      <n-loading-bar-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <div id="app">
              <router-view />
            </div>
          </n-dialog-provider>
        </n-notification-provider>
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { darkTheme } from "naive-ui";
import { useTheme } from "@/composables/useTheme";

const { isDark, initTheme, setupSystemThemeListener, updateReactiveState } =
  useTheme();

// Naive UI 主题
const naiveTheme = computed(() => {
  return isDark.value ? darkTheme : null;
});

// 监听主题变化事件
const handleThemeChange = () => {
  // 确保响应式状态同步
  updateReactiveState();
  // 强制重新渲染
  setTimeout(() => {
    updateReactiveState();
  }, 50);
};

onMounted(() => {
  initTheme();
  setupSystemThemeListener();

  // 监听自定义主题变化事件
  window.addEventListener("theme-change", handleThemeChange);

  // 初始化时更新状态
  updateReactiveState();
});

onUnmounted(() => {
  window.removeEventListener("theme-change", handleThemeChange);
});
</script>

<style>
/* 主题变量 */
:root {
  --app-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --text-color: #333;
  --text-secondary: #666;
  --text-tertiary: #999;
  --bg-color: #ffffff;
  --border-color: #e0e0e0;
  /* 组件级颜色变量 */
  --card-bg: #ffffff;
  --card-bg-secondary: #f8f9fa;
  --card-bg-tertiary: #fafafa;
  --card-border: #e9ecef;
  --divider-color: #e8e8e8;
  --chip-bg: #ffffff;
  --chip-border: #ddd;
  --input-bg: #ffffff;
}

/* 深色主题变量 */
.dark {
  --app-background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  --text-color: #e5e7eb;
  --text-secondary: #cbd5e1;
  --text-tertiary: #9ca3af;
  --bg-color: #1f2a37;
  --border-color: #374151;
  /* 组件级颜色变量 - 深色 */
  --card-bg: #1f2a37;
  --card-bg-secondary: #111827;
  --card-bg-tertiary: #1a1f2e;
  --card-border: #374151;
  --divider-color: #374151;
  --chip-bg: #1f2a37;
  --chip-border: #374151;
  --input-bg: #1f2a37;
}

/* 深色主题样式优化 - 针对Naive UI组件 */
html.dark,
html[data-theme="dark"] {
  color-scheme: dark;
}

/* 纯文本/段落/标签在深色模式下的可读性 */
html.dark body,
html[data-theme="dark"] body {
  color: var(--text-color);
}

/* Naive UI 表单组件 - 调整 label 颜色以适应深色 */
html.dark .n-form-item-label,
html.dark .n-form-item-label__text,
html[data-theme="dark"] .n-form-item-label,
html[data-theme="dark"] .n-form-item-label__text {
  color: var(--text-color);
}

/* Naive UI 输入组件 - 调整背景色以适应深色 */
html.dark .n-input,
html.dark .n-input__input,
html.dark .n-input__textarea,
html[data-theme="dark"] .n-input,
html[data-theme="dark"] .n-input__input,
html[data-theme="dark"] .n-input__textarea {
  color: var(--text-color);
  background-color: rgba(255, 255, 255, 0.05);
}

/* 占位符文字颜色 */
html.dark .n-input__placeholder,
html.dark ::placeholder,
html[data-theme="dark"] .n-input__placeholder,
html[data-theme="dark"] ::placeholder {
  color: rgba(229, 231, 235, 0.6);
}

#app {
  min-height: 100vh;
  background: var(--app-background);
  color: var(--text-color);
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family:
    "SF Pro Display",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "Helvetica Neue",
    Helvetica,
    Arial,
    sans-serif;
  color: var(--text-color);
  transition: color 0.3s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
