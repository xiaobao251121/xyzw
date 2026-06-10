<template>
  <div class="hangup-collect-page">
    <!-- 页面头部 -->
    <div class="page-header-wrapper">
      <!-- 第一行：标题 -->
      <div class="header-top">
        <div class="title-row">
          <h2 class="page-title">批量功能</h2>
        </div>
      </div>
      
      <!-- 第二行：所有操作按钮和活动日历 -->
      <div class="header-actions">
        <!-- 活动日历 -->
        <div class="activity-section">
          <div class="activity-cards">
            <div class="activity-card">
              <span class="card-badge">当前周</span>
              <span class="week-name">{{ currentWeek }}</span>
              <span class="next-label">下一周</span>
              <span class="next-value">{{ nextWeekData.name }} <span class="countdown">{{ nextWeekCountdown }}</span></span>
            </div>
            <div class="activity-card">
              <span class="card-badge paid">氪金活动</span>
              <template v-if="festival.paid">
                <span class="festival-name">{{ festival.paid.name }}</span>
                <span v-if="getWeekLabel(festival.paid.date)" class="week-label">{{ getWeekLabel(festival.paid.date) }}</span>
                <span class="festival-date">{{ formatDate(festival.paid.date) }}</span>
                <span class="countdown-large" :class="{ active: festival.paid.daysLeft <= 3 }">
                  {{ festival.paid.daysLeft === 0 ? '今天' : festival.paid.daysLeft + '天后' }}
                </span>
              </template>
              <template v-else>
                <span class="festival-name">暂无</span>
              </template>
            </div>
            <div class="activity-card">
              <span class="card-badge free">白嫖活动</span>
              <template v-if="festival.free">
                <span class="festival-name">{{ festival.free.name }}</span>
                <span v-if="getWeekLabel(festival.free.date)" class="week-label">{{ getWeekLabel(festival.free.date) }}</span>
                <span class="festival-date">{{ formatDate(festival.free.date) }}</span>
                <span class="countdown-large" :class="{ active: festival.free.daysLeft <= 3 }">
                  {{ festival.free.daysLeft === 0 ? '今天' : festival.free.daysLeft + '天后' }}
                </span>
              </template>
              <template v-else>
                <span class="festival-name">暂无</span>
              </template>
            </div>
          </div>
        </div>
        
        <!-- 主要操作按钮 -->
        <div class="action-buttons">
          <n-button
            type="primary"
            @click="startCollect"
            :disabled="isRunning || selectedTokens.length === 0"
            size="medium"
          >
            {{ isRunning ? "执行中..." : "开始执行" }}
          </n-button>
          <n-button
            @click="stopCollect"
            :disabled="!isRunning"
            type="error"
            size="medium"
          >
            停止执行
          </n-button>
        </div>
      </div>
    </div>

    <div class="main-layout">
      <div class="left-column">

        <n-card title="账号列表" class="token-list-card">
          <div style="margin-bottom: 16px">
            <n-space>
              <n-button size="small" @click="selectAll">全选</n-button>
              <n-button size="small" @click="clearAll">清除</n-button>
              <n-button size="small" @click="reverseSelect">反选</n-button>
              <n-space>
                <span style="font-size: 12px">每行显示:</span>
                <n-select
                  v-model:value="columnsPerRow"
                  :options="columnOptions"
                  size="small"
                  style="width: 80px"
                />
              </n-space>
            </n-space>
          </div>
          <n-checkbox-group v-model:value="selectedTokens">
            <div class="token-grid" :style="{ gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)` }">
              <div
                v-for="token in tokens"
                :key="token.id"
                class="token-item"
                :class="{
                  selected: selectedTokens.includes(token.id),
                  [tokenStatus[token.id]]: true,
                }"
                @click="toggleToken(token.id)"
              >
                <n-checkbox :value="token.id" @click.stop />
                <div class="token-info">
                  <div class="token-name">{{ token.name }}</div>
                  <div class="token-server">{{ token.server }}</div>
                </div>
                <div class="token-status">
                  <n-tag v-if="tokenStatus[token.id] === 'running'" type="info" size="small">
                    执行中
                  </n-tag>
                  <n-tag v-else-if="tokenStatus[token.id] === 'completed'" type="success" size="small">
                    完成
                  </n-tag>
                  <n-tag v-else-if="tokenStatus[token.id] === 'failed'" type="error" size="small">
                    失败
                  </n-tag>
                </div>
              </div>
            </div>
          </n-checkbox-group>
        </n-card>

        <n-card title="操作设置" class="settings-card">
          <n-space vertical>
            <n-space>
              <n-checkbox v-model:checked="enableClaimHangup">领取挂机</n-checkbox>
              <n-checkbox v-model:checked="enableResetBottles">重置罐子</n-checkbox>
              <n-checkbox v-model:checked="enableStudy">一键答题</n-checkbox>
              <n-checkbox v-model:checked="enableLegacyClaim">功法残卷领取</n-checkbox>
              <n-checkbox v-model:checked="enableClimbWeirdTower">爬怪异塔</n-checkbox>
              <n-checkbox v-model:checked="enableClaimFreeEnergy">领取怪异塔免费道具</n-checkbox>
              <n-checkbox v-model:checked="enableFishTopUp">钓鱼补齐</n-checkbox>
              <n-checkbox v-model:checked="enableArenaTopUp">竞技场补齐</n-checkbox>
            </n-space>
            <n-space align="center">
              <span>操作间隔:</span>
              <n-input-number
                v-model:value="operationDelay"
                :min="500"
                :max="5000"
                :step="100"
                size="small"
                style="width: 120px"
              />
              <span>毫秒</span>
            </n-space>
          </n-space>
        </n-card>
      </div>

      <div class="right-column">
        <n-card class="log-card">
          <div class="custom-card-header">
            <div class="card-title-row">
              <span class="card-title">执行日志</span>
            </div>
            <div class="log-header-controls">
              <n-checkbox v-model:checked="autoScrollLog" size="small">
                自动滚动
              </n-checkbox>
              <n-checkbox v-model:checked="filterErrorsOnly" size="small">
                只看错误
              </n-checkbox>
              <n-tag v-if="errorCount > 0" type="error" size="small">
                {{ errorCount }} 个错误
              </n-tag>
              <n-button size="tiny" @click="clearLogs">清空日志</n-button>
            </div>
          </div>
          <div class="log-container" ref="logContainer">
            <div
              v-for="(log, index) in filteredLogs"
              :key="index"
              class="log-item"
              :class="log.type"
            >
              <span class="time">{{ log.time }}</span>
              <span class="message">{{ log.message }}</span>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
import { useMessage } from "naive-ui";
import { useTokenStore } from "@/stores/tokenStore";
import { getCurrentActivityWeek as getActivityWeekUtil, getNextActivityWeek, getNextFestivalCountdown, getActivityWeekForDate } from "@/utils/commonUtils";

const message = useMessage();
const tokenStore = useTokenStore();

const selectedTokens = ref([]);
const tokenStatus = ref({});
const isRunning = ref(false);
const shouldStop = ref(false);
const logs = ref([]);
const logContainer = ref(null);

const columnsPerRow = ref(7);
const columnOptions = [
  { label: '3列', value: 3 },
  { label: '4列', value: 4 },
  { label: '5列', value: 5 },
  { label: '6列', value: 6 },
  { label: '7列', value: 7 },
];

const FISH_TARGET = 320;
const ARENA_TARGET = 240;

const enableClaimHangup = ref(true);
const enableResetBottles = ref(true);
const enableStudy = ref(false);
const enableLegacyClaim = ref(false);
const enableClimbWeirdTower = ref(false);
const enableClaimFreeEnergy = ref(false);
const enableFishTopUp = ref(false);
const enableArenaTopUp = ref(false);
const operationDelay = ref(600);

const getTodayStartSec = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
};

const isTodayAvailable = (lastTimeSec) => {
  if (!lastTimeSec) return true;
  return lastTimeSec < getTodayStartSec();
};

const calculateMonthProgress = () => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  return dayOfMonth / daysInMonth;
};

const pickArenaTargetId = (targets) => {
  const candidate =
    targets?.rankList?.[0] ||
    targets?.roleList?.[0] ||
    targets?.targets?.[0] ||
    targets?.targetList?.[0] ||
    targets?.list?.[0];

  if (candidate?.roleId) return candidate.roleId;
  if (candidate?.id) return candidate.id;
  return targets?.roleId || targets?.id;
};

const autoScrollLog = ref(true);
const filterErrorsOnly = ref(false);

const errorCount = computed(() => {
  return logs.value.filter((log) => log.type === "error").length;
});

const filteredLogs = computed(() => {
  if (filterErrorsOnly.value) {
    return logs.value.filter((log) => log.type === "error");
  }
  return logs.value;
});

watch(autoScrollLog, () => {
  localStorage.setItem("batchHangupAutoScroll", autoScrollLog.value);
});

watch(filterErrorsOnly, () => {
  localStorage.setItem("batchHangupFilterErrors", filterErrorsOnly.value);
});

// ===== 活动日历相关 =====
const currentWeek = computed(() => {
  return getActivityWeekUtil() || "未知";
});

const nextWeekCountdown = ref("");
const nextWeekData = ref({ name: "未知", daysLeft: 0, msLeft: 0 });

const formatCountdown = (ms) => {
  if (ms <= 0) return "0天 00:00:00";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  return `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

let countdownTimer = null;

const updateCountdown = () => {
  const data = getNextActivityWeek() || { name: "未知", daysLeft: 0, msLeft: 0 };
  nextWeekData.value = data;
  nextWeekCountdown.value = formatCountdown(data.msLeft);
};

const festival = ref({
  paid: null,
  free: null,
});

onMounted(() => {
  const savedAutoScroll = localStorage.getItem("batchHangupAutoScroll");
  if (savedAutoScroll !== null) {
    autoScrollLog.value = savedAutoScroll === "true";
  }
  const savedFilterErrors = localStorage.getItem("batchHangupFilterErrors");
  if (savedFilterErrors !== null) {
    filterErrorsOnly.value = savedFilterErrors === "true";
  }
  
  const festivalData = getNextFestivalCountdown();
  festival.value = festivalData;

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});

const getWeekLabel = (date) => {
  if (!date) return "";
  return getActivityWeekForDate(date);
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const tokens = computed(() => tokenStore.gameTokens || []);

const addLog = (log) => {
  logs.value.push(log);
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(-500);
  }
  try {
    if (logContainer.value && autoScrollLog.value) {
      nextTick(() => {
        if (logContainer.value) {
          logContainer.value.scrollTop = logContainer.value.scrollHeight - logContainer.value.clientHeight;
        }
      });
    }
  } catch (e) {
    // 忽略DOM操作错误
  }
};

const clearLogs = () => {
  logs.value = [];
};

const toggleToken = (tokenId) => {
  const index = selectedTokens.value.indexOf(tokenId);
  if (index === -1) {
    selectedTokens.value.push(tokenId);
  } else {
    selectedTokens.value.splice(index, 1);
  }
};

const selectAll = () => {
  selectedTokens.value = tokens.value.map((t) => t.id);
};

const clearAll = () => {
  selectedTokens.value = [];
};

const reverseSelect = () => {
  const allIds = tokens.value.map((t) => t.id);
  selectedTokens.value = allIds.filter((id) => !selectedTokens.value.includes(id));
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const ensureConnection = async (tokenId) => {
  const token = tokens.value.find((t) => t.id === tokenId);
  if (!token) {
    throw new Error(`Token not found: ${tokenId}`);
  }

  let status = tokenStore.getWebSocketStatus(tokenId);
  let connected = status === "connected";

  if (!connected) {
    addLog({
      time: new Date().toLocaleTimeString(),
      message: `正在连接...`,
      type: "info",
    });

    tokenStore.createWebSocketConnection(tokenId, token.token, token.wsUrl);
    connected = await waitForConnection(tokenId);

    if (!connected) {
      addLog({
        time: new Date().toLocaleTimeString(),
        message: `连接超时，尝试重连...`,
        type: "warning",
      });

      tokenStore.closeWebSocketConnection(tokenId);
      await delay(2000);

      addLog({
        time: new Date().toLocaleTimeString(),
        message: `正在重连...`,
        type: "info",
      });

      const refreshedToken = tokens.value.find((t) => t.id === tokenId);
      tokenStore.createWebSocketConnection(tokenId, refreshedToken.token, refreshedToken.wsUrl);
      connected = await waitForConnection(tokenId);
    }

    if (!connected) {
      throw new Error("连接失败 (重试后仍超时)");
    }
  }

  return true;
};

const waitForConnection = (tokenId) => {
  return new Promise((resolve) => {
    let retries = 0;
    const maxRetries = 20;
    const checkConnection = () => {
      const status = tokenStore.getWebSocketStatus(tokenId);
      if (status === "connected") {
        resolve(true);
        return;
      }
      retries++;
      if (retries >= maxRetries) {
        resolve(false);
        return;
      }
      setTimeout(checkConnection, 500);
    };
    checkConnection();
  });
};

const executeOperation = async (tokenId, operation) => {
  const token = tokens.value.find((t) => t.id === tokenId);

  try {
    await ensureConnection(tokenId);

    switch (operation) {
      case "claimHangup": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 领取挂机奖励...`,
          type: "info",
        });
        await tokenStore.sendMessageWithPromise(tokenId, "system_claimhangupreward", {}, 5000);
        await delay(operationDelay.value);

        for (let i = 0; i < 4; i++) {
          if (shouldStop.value) return;
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 挂机加钟 ${i + 1}/4...`,
            type: "info",
          });
          await tokenStore.sendMessageWithPromise(
            tokenId,
            "system_mysharecallback",
            { isSkipShareCard: true, type: 2 },
            5000
          );
          await delay(operationDelay.value);
        }
        break;
      }
      case "fishTopUp": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 获取月度任务进度...`,
          type: "info",
        });
        const result = await tokenStore.sendMessageWithPromise(
          tokenId,
          "activity_get",
          {},
          10000,
        );
        const act = result?.activity || result?.body?.activity || result;

        if (!act) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 获取月度任务进度失败`,
            type: "error",
          });
          break;
        }
        const myMonthInfo = act.myMonthInfo || {};
        const fishNum = Number(myMonthInfo?.["2"]?.num || 0);

        const monthProgress = calculateMonthProgress();
        const now = new Date();
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();
        const dayOfMonth = now.getDate();
        const remainingDays = Math.max(0, daysInMonth - dayOfMonth);
        const shouldBe =
          remainingDays === 0
            ? FISH_TARGET
            : Math.min(FISH_TARGET, Math.ceil(monthProgress * FISH_TARGET));
        const need = Math.max(0, shouldBe - fishNum);
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 当前进度: ${fishNum}/${FISH_TARGET}，需要补齐: ${need}次`,
          type: "info",
        });
        if (need <= 0) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `当前进度已达标，无需补齐`,
            type: "success",
          });
          break;
        }

        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始执行钓鱼补齐...`,
          type: "info",
        });

        let role = tokenStore.gameData?.roleInfo?.role;
        if (!role) {
          try {
            const roleInfo = await tokenStore.sendGetRoleInfo(tokenId);
            role = roleInfo?.role;
          } catch {}
        }
        let freeUsed = 0;
        const lastFreeTime = Number(
          role?.statisticsTime?.["artifact:normal:lottery:time"] || 0,
        );
        if (isTodayAvailable(lastFreeTime)) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 检测到今日免费钓鱼次数，开始消耗 3 次`,
            type: "info",
          });
          for (let i = 0; i < 3 && need > freeUsed && !shouldStop.value; i++) {
            try {
              await tokenStore.sendMessageWithPromise(
                tokenId,
                "artifact_lottery",
                { lotteryNumber: 1, newFree: true, type: 1 },
                8000,
              );
              freeUsed++;
              await delay(operationDelay.value);
            } catch (e) {
              addLog({
                time: new Date().toLocaleTimeString(),
                message: `${token.name} 免费钓鱼失败: ${e.message}`,
                type: "error",
              });
              break;
            }
          }
        }

        const updatedResult = await tokenStore.sendMessageWithPromise(
          tokenId,
          "activity_get",
          {},
          10000,
        );
        const updatedAct =
          updatedResult?.activity ||
          updatedResult?.body?.activity ||
          updatedResult;
        const updatedMyMonthInfo = updatedAct.myMonthInfo || {};
        const updatedFishNum = Number(updatedMyMonthInfo?.["2"]?.num || 0);
        let remaining = Math.max(0, shouldBe - updatedFishNum);
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 免费次数后进度: ${updatedFishNum}/${FISH_TARGET}，还需补齐: ${remaining}次`,
          type: "info",
        });
        if (remaining <= 0) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `已通过免费次数完成目标`,
            type: "success",
          });
          break;
        }

        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始付费钓鱼补齐: 共需 ${remaining} 次（每次最多10）`,
          type: "info",
        });

        const rodCount = role?.items?.[1011]?.quantity || 0;
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 当前普通鱼竿: ${rodCount}`,
          type: "info",
        });

        if (rodCount < remaining) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 普通鱼竿不足 (${rodCount} < ${remaining})，将仅使用现有鱼竿`,
            type: "warning",
          });
          remaining = rodCount;
        }

        while (remaining > 0 && !shouldStop.value) {
          const batch = Math.min(10, remaining);
          try {
            await tokenStore.sendMessageWithPromise(
              tokenId,
              "artifact_lottery",
              { lotteryNumber: batch, newFree: true, type: 1 },
              12000,
            );
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 完成 ${batch} 次付费钓鱼`,
              type: "info",
            });
            remaining -= batch;
            await delay(operationDelay.value);
          } catch (e) {
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 付费钓鱼失败: ${e.message}`,
              type: "error",
            });
            break;
          }
        }

        const finalResult = await tokenStore.sendMessageWithPromise(
          tokenId,
          "activity_get",
          {},
          10000,
        );
        const finalAct =
          finalResult?.activity || finalResult?.body?.activity || finalResult;
        const finalMyMonthInfo = finalAct.myMonthInfo || {};
        const finalFishNum = Number(finalMyMonthInfo?.["2"]?.num || 0);
        if (finalFishNum >= shouldBe || finalFishNum >= FISH_TARGET) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 钓鱼补齐完成，最终进度: ${finalFishNum}/${FISH_TARGET}`,
            type: "success",
          });
        } else {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 钓鱼补齐已停止，未达到目标，最终进度: ${finalFishNum}/${FISH_TARGET}`,
            type: "warning",
          });
        }
        break;
      }
      case "arenaTopUp": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 获取月度任务进度...`,
          type: "info",
        });
        const arenaResult = await tokenStore.sendMessageWithPromise(
          tokenId,
          "activity_get",
          {},
          10000,
        );
        const arenaAct = arenaResult?.activity || arenaResult?.body?.activity || arenaResult;

        if (!arenaAct) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 获取月度任务进度失败`,
            type: "error",
          });
          break;
        }
        const myArenaInfo = arenaAct.myArenaInfo || {};
        const arenaNum = Number(myArenaInfo?.num || 0);

        const monthProgressArena = calculateMonthProgress();
        const nowArena = new Date();
        const daysInMonthArena = new Date(
          nowArena.getFullYear(),
          nowArena.getMonth() + 1,
          0,
        ).getDate();
        const dayOfMonthArena = nowArena.getDate();
        const remainingDaysArena = Math.max(0, daysInMonthArena - dayOfMonthArena);
        const shouldBeArena =
          remainingDaysArena === 0
            ? ARENA_TARGET
            : Math.min(ARENA_TARGET, Math.ceil(monthProgressArena * ARENA_TARGET));
        const needArena = Math.max(0, shouldBeArena - arenaNum);
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 当前进度: ${arenaNum}/${ARENA_TARGET}，需要补齐: ${needArena}次`,
          type: "info",
        });
        if (needArena <= 0) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 当前进度已达标，无需补齐`,
            type: "success",
          });
          break;
        }

        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始执行竞技场补齐...`,
          type: "info",
        });

        let roleArena = tokenStore.gameData?.roleInfo?.role;
        if (!roleArena) {
          try {
            const roleInfo = await tokenStore.sendGetRoleInfo(tokenId);
            roleArena = roleInfo?.role;
          } catch {}
        }
        const ticketCount = roleArena?.items?.[1007]?.quantity || 0;
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 当前咸神门票: ${ticketCount}`,
          type: "info",
        });

        if (ticketCount < needArena) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 咸神门票不足 (${ticketCount} < ${needArena})，将仅使用现有门票`,
            type: "warning",
          });
        }

        let ticketsLeft = ticketCount;
        let remainingArena = Math.min(needArena, ticketsLeft);

        if (remainingArena <= 0) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 没有可用的咸神门票`,
            type: "warning",
          });
          break;
        }

        try {
          await tokenStore.sendMessageWithPromise(
            tokenId,
            "arena_startarea",
            {},
            6000,
          );
        } catch (error) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 开始竞技场失败: ${error.message}`,
            type: "warning",
          });
        }

        while (remainingArena > 0 && ticketsLeft > 0 && !shouldStop.value) {
          try {
            const targets = await tokenStore.sendMessageWithPromise(
              tokenId,
              "arena_getareatarget",
              {},
              8000,
            );
            const targetId = pickArenaTargetId(targets);
            if (!targetId) {
              addLog({
                time: new Date().toLocaleTimeString(),
                message: `${token.name} 未找到可用的竞技场目标，尝试刷新...`,
                type: "warning",
              });
              try {
                await tokenStore.sendMessageWithPromise(
                  tokenId,
                  "arena_startarea",
                  {},
                  6000,
                );
                await delay(500);
                continue;
              } catch (refreshError) {
                addLog({
                  time: new Date().toLocaleTimeString(),
                  message: `${token.name} 刷新竞技场也失败，已停止`,
                  type: "error",
                });
                break;
              }
            }
            await tokenStore.sendMessageWithPromise(
              tokenId,
              "fight_startareaarena",
              { targetId },
              15000,
            );
            remainingArena--;
            ticketsLeft--;
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 竞技场战斗完成，剩余: ${remainingArena}`,
              type: "info",
            });
            await delay(operationDelay.value);
          } catch (e) {
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 竞技场对决失败: ${e.message}`,
              type: "error",
            });
            break;
          }
        }

        const finalArenaResult = await tokenStore.sendMessageWithPromise(
          tokenId,
          "activity_get",
          {},
          10000,
        );
        const finalArenaAct =
          finalArenaResult?.activity || finalArenaResult?.body?.activity || finalArenaResult;
        const finalMyArenaInfo = finalArenaAct.myArenaInfo || {};
        const finalArenaNum = Number(finalMyArenaInfo?.num || 0);
        if (finalArenaNum >= shouldBeArena || finalArenaNum >= ARENA_TARGET) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 竞技场补齐完成，最终进度: ${finalArenaNum}/${ARENA_TARGET}`,
            type: "success",
          });
        } else {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 竞技场补齐已停止，未达到目标，最终进度: ${finalArenaNum}/${ARENA_TARGET}`,
            type: "warning",
          });
        }
        break;
      }
      case "resetBottles": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 停止计时...`,
          type: "info",
        });
        await tokenStore.sendMessageWithPromise(tokenId, "bottlehelper_stop", {}, 5000);
        await delay(operationDelay.value);

        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始计时...`,
          type: "info",
        });
        await tokenStore.sendMessageWithPromise(tokenId, "bottlehelper_start", {}, 5000);
        await delay(operationDelay.value);
        break;
      }
      case "study": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始答题...`,
          type: "info",
        });

        tokenStore.gameData.studyStatus = {
          isAnswering: false,
          questionCount: 0,
          answeredCount: 0,
          status: "",
          timestamp: null,
        };

        const { preloadQuestions } = await import("@/utils/studyQuestionsFromJSON.js");
        await preloadQuestions();

        await tokenStore.sendMessageWithPromise(tokenId, "study_startgame", {}, 5000);

        let maxWait = 90;
        let completed = false;
        let lastStatus = "";

        while (maxWait > 0 && !shouldStop.value) {
          const status = tokenStore.gameData.studyStatus;

          if (status.status !== lastStatus) {
            lastStatus = status.status;
            if (status.status === "answering") {
              addLog({
                time: new Date().toLocaleTimeString(),
                message: `${token.name} 答题中...`,
                type: "info",
              });
            } else if (status.status === "claiming_rewards") {
              addLog({
                time: new Date().toLocaleTimeString(),
                message: `${token.name} 领取奖励...`,
                type: "info",
              });
            }
          }

          if (status.status === "completed") {
            completed = true;
            break;
          }

          await delay(1000);
          maxWait--;
        }

        if (completed) {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 答题完成`,
            type: "success",
          });
        } else {
          if (shouldStop.value) {
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 答题已停止`,
              type: "warning",
            });
          } else {
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 答题超时或未开始`,
              type: "error",
            });
          }
        }
        break;
      }
      case "legacyClaim": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 领取功法残卷...`,
          type: "info",
        });
        await tokenStore.sendMessageWithPromise(tokenId, "legacy_claimhangup", {}, 5000);
        await delay(operationDelay.value);
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 功法残卷领取完成`,
          type: "success",
        });
        break;
      }
      case "climbWeirdTower": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始爬怪异塔...`,
          type: "info",
        });
        
        const teamInfo = await tokenStore.sendMessageWithPromise(
          tokenId,
          "presetteam_getinfo",
          {},
          5000
        );
        
        const currentFormation = teamInfo?.presetTeamInfo?.useTeamId;
        let isSwitching = false;
        
        // 获取怪异塔信息
        const evotowerinfo1 = await tokenStore.sendMessageWithPromise(
          tokenId,
          "evotower_getinfo",
          {},
          5000
        );
        
        let currentEnergy = evotowerinfo1?.evoTower?.energy || 0;
        
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 初始能量: ${currentEnergy}`,
          type: "info",
        });
        
        let count = 0;
        const MAX_CLIMB = 100;
        let consecutiveFailures = 0;
        
        while (currentEnergy > 0 && count < MAX_CLIMB && !shouldStop.value) {
          try {
            await tokenStore.sendMessageWithPromise(
              tokenId,
              "evotower_readyfight",
              {},
              5000
            );
            
            const fightResult = await tokenStore.sendMessageWithPromise(
              tokenId,
              "evotower_fight",
              {
                battleNum: 1,
                winNum: 1,
              },
              10000
            );
            
            count++;
            consecutiveFailures = 0;
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `${token.name} 爬怪异塔第 ${count} 次`,
              type: "info",
            });
            
            await delay(1500);
            
            const evotowerinfo2 = await tokenStore.sendMessageWithPromise(
              tokenId,
              "evotower_getinfo",
              {},
              5000
            );
            
            // 检查并领取每日任务奖励
            if (evotowerinfo2 && evotowerinfo2.evoTower && evotowerinfo2.evoTower.taskClaimMap) {
              const now = new Date();
              const year = now.getFullYear().toString().slice(2);
              const month = (now.getMonth() + 1).toString().padStart(2, '0');
              const day = now.getDate().toString().padStart(2, '0');
              const dateKey = `${year}${month}${day}`;
              
              const dailyTasks = evotowerinfo2.evoTower.taskClaimMap[dateKey] || {};
              const taskIds = [1, 2, 3];
              
              for (const taskId of taskIds) {
                if (!dailyTasks[taskId]) {
                  await tokenStore.sendMessageWithPromise(
                    tokenId,
                    "evotower_claimtask",
                    { taskId: taskId },
                    2000
                  ).then(() => {
                    addLog({
                      time: new Date().toLocaleTimeString(),
                      message: `${token.name} 领取每日任务奖励 ${taskId} 成功`,
                      type: "success",
                    });
                  }).catch(() => {});
                  await delay(200);
                }
              }
            }
            
            // 检查是否刚通关10层
            const towerId = evotowerinfo2?.evoTower?.towerId || 0;
            const floor = (towerId % 10) + 1;
            if (
              fightResult &&
              fightResult.winList &&
              fightResult.winList[0] === true &&
              floor === 1
            ) {
              await tokenStore.sendMessageWithPromise(
                tokenId,
                "evotower_claimreward",
                {},
                5000
              );
              addLog({
                time: new Date().toLocaleTimeString(),
                message: `${token.name} 成功领取第${Math.floor(towerId / 10)}章通关奖励！`,
                type: "success",
              });
              await delay(1500);
            }
            
            // 刷新能量
            try {
              const evotowerinfoRefresh1 = await tokenStore.sendMessageWithPromise(
                tokenId,
                "evotower_getinfo",
                {},
                5000
              );
              currentEnergy = evotowerinfoRefresh1?.evoTower?.energy || 0;
            } catch (e) {
              // 忽略刷新失败
            }
          } catch (err) {
            consecutiveFailures++;
            addLog({
              time: new Date().toLocaleTimeString(),
              message: `战斗出错: ${err.message} (重试 ${consecutiveFailures}/3)`,
              type: "warning",
            });
            
            if (consecutiveFailures >= 3) {
              addLog({
                time: new Date().toLocaleTimeString(),
                message: `${token.name} 连续失败次数过多，停止爬怪异塔`,
                type: "error",
              });
              break;
            }
            
            await delay(1500);
            
            try {
              const evotowerinfoRefresh2 = await tokenStore.sendMessageWithPromise(
                tokenId,
                "evotower_getinfo",
                {},
                5000
              );
              currentEnergy = evotowerinfoRefresh2?.evoTower?.energy || 0;
            } catch (e) {
              // 忽略刷新失败
            }
          }
        }
        
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 爬怪异塔结束，共 ${count} 次`,
          type: "success",
        });
        break;
      }
      case "claimFreeEnergy": {
        addLog({
          time: new Date().toLocaleTimeString(),
          message: `${token.name} 开始领取怪异塔免费道具...`,
          type: "info",
        });
        
        const freeEnergyResult = await tokenStore.sendMessageWithPromise(
          tokenId,
          "mergebox_getinfo",
          {
            actType: 1,
          },
          5000
        );
        
        if (freeEnergyResult && freeEnergyResult.mergeBox.freeEnergy > 0) {
          await tokenStore.sendMessageWithPromise(
            tokenId,
            "mergebox_claimfreeenergy",
            {
              actType: 1,
            },
            5000
          );
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 成功领取免费道具${freeEnergyResult.mergeBox.freeEnergy}个`,
            type: "success",
          });
        } else {
          addLog({
            time: new Date().toLocaleTimeString(),
            message: `${token.name} 暂无免费道具可领取`,
            type: "success",
          });
        }
        break;
      }
    }

    tokenStatus.value[tokenId] = "completed";
    const opNames = {
      claimHangup: "领取挂机",
      resetBottles: "重置罐子",
      study: "答题",
      legacyClaim: "功法残卷",
      climbWeirdTower: "爬怪异塔",
      claimFreeEnergy: "领取怪异塔免费道具",
      fishTopUp: "钓鱼补齐",
      arenaTopUp: "竞技场补齐"
    };
    addLog({
      time: new Date().toLocaleTimeString(),
      message: `${token.name} ${opNames[operation] || operation} 完成`,
      type: "success",
    });
  } catch (error) {
    console.error(error);
    tokenStatus.value[tokenId] = "failed";
    addLog({
      time: new Date().toLocaleTimeString(),
      message: `${token.name} 操作失败: ${error.message}`,
      type: "error",
    });
  } finally {
    tokenStore.closeWebSocketConnection(tokenId);
  }
};

const startCollect = async () => {
  if (selectedTokens.value.length === 0) {
    message.warning("请先选择要执行的账号");
    return;
  }

  if (!enableClaimHangup.value && !enableResetBottles.value && !enableStudy.value && !enableLegacyClaim.value && !enableClimbWeirdTower.value && !enableClaimFreeEnergy.value && !enableFishTopUp.value && !enableArenaTopUp.value) {
    message.warning("请至少选择一个操作");
    return;
  }

  isRunning.value = true;
  shouldStop.value = false;

  selectedTokens.value.forEach((id) => {
    tokenStatus.value[id] = "waiting";
  });

  const operations = [];
  if (enableClaimHangup.value) operations.push("claimHangup");
  if (enableResetBottles.value) operations.push("resetBottles");
  if (enableStudy.value) operations.push("study");
  if (enableLegacyClaim.value) operations.push("legacyClaim");
  if (enableClimbWeirdTower.value) operations.push("climbWeirdTower");
  if (enableClaimFreeEnergy.value) operations.push("claimFreeEnergy");
  if (enableFishTopUp.value) operations.push("fishTopUp");
  if (enableArenaTopUp.value) operations.push("arenaTopUp");

  const opNames = {
    claimHangup: "领取挂机",
    resetBottles: "重置罐子",
    study: "一键答题",
    legacyClaim: "功法残卷",
    climbWeirdTower: "爬怪异塔",
    claimFreeEnergy: "领取怪异塔免费道具",
    fishTopUp: "钓鱼补齐",
    arenaTopUp: "竞技场补齐"
  };

  addLog({
    time: new Date().toLocaleTimeString(),
    message: `=== 开始批量功能任务 ===`,
    type: "info",
  });
  addLog({
    time: new Date().toLocaleTimeString(),
    message: `选择账号: ${selectedTokens.value.length} 个`,
    type: "info",
  });
  addLog({
    time: new Date().toLocaleTimeString(),
    message: `操作: ${operations.map(o => opNames[o]).join(", ")}`,
    type: "info",
  });

  for (const tokenId of selectedTokens.value) {
    if (shouldStop.value) {
      addLog({
        time: new Date().toLocaleTimeString(),
        message: `任务已停止`,
        type: "warning",
      });
      break;
    }

    tokenStatus.value[tokenId] = "running";
    const token = tokens.value.find((t) => t.id === tokenId);
    addLog({
      time: new Date().toLocaleTimeString(),
      message: `=== 开始处理: ${token.name} ===`,
      type: "info",
    });

    for (const operation of operations) {
      if (shouldStop.value) break;
      await executeOperation(tokenId, operation);
      if (operation !== operations[operations.length - 1]) {
        await delay(operationDelay.value);
      }
    }

    if (tokenStatus.value[tokenId] !== "failed") {
      tokenStatus.value[tokenId] = "completed";
    }

    addLog({
      time: new Date().toLocaleTimeString(),
      message: `${token.name} 处理完成`,
      type: "success",
    });

    if (tokenId !== selectedTokens.value[selectedTokens.value.length - 1]) {
      await delay(operationDelay.value);
    }
  }

  isRunning.value = false;
  addLog({
    time: new Date().toLocaleTimeString(),
    message: `=== 批量功能任务结束 ===`,
    type: "success",
  });
  message.success("批量功能任务已结束");
};

const stopCollect = () => {
  shouldStop.value = true;
  message.info("正在停止任务...");
};
</script>

<style scoped>
.hangup-collect-page {
  height: 100%;
  padding: 16px;
}

.main-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.right-column {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--n-card-color);
  border-radius: 8px;
}

.page-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.token-list-card,
.settings-card {
  flex-shrink: 0;
}

.token-grid {
  display: grid;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.token-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
}

.token-item:hover {
  background-color: var(--n-color-hover);
}

.token-item.selected {
  border-color: var(--n-primary-color);
  background-color: var(--n-primary-color-hover);
}

.token-item.running {
  border-color: var(--n-info-color);
}

.token-item.completed {
  border-color: var(--n-success-color);
}

.token-item.failed {
  border-color: var(--n-error-color);
}

.token-info {
  flex: 1;
  overflow: hidden;
}

.token-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.token-server {
  font-size: 10px;
  color: var(--n-text-color-3);
}

.token-status {
  flex-shrink: 0;
}

.log-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===== 日志卡片 ===== */
.log-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  max-height: 655px;
}

.custom-card-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-card :deep(.n-card__header) {
  display: none;
}

.custom-card-header {
  width: 100%;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.card-title-row {
  margin-bottom: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.log-header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.log-card :deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
  min-height: 250px;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.5;
  background: var(--card-bg-secondary);
  height: 100%;
  min-height: 200px;
  max-height: 499px;
}

.time {
  margin-right: 8px;
  color: var(--text-tertiary);
}

.log-item {
  margin-bottom: 4px;
}

.log-item.info  { color: var(--text-secondary); }
.log-item.success { color: #18a058; }
.log-item.error   { color: #d03050; }
.log-item.warning { color: #f0a020; }

/* ========== 响应式布局 ========== */

@media (max-width: 1200px) {
  .right-column {
    width: 350px;
  }
  .left-column {
    width: calc(100% - 366px);
  }
}

@media (max-width: 992px) {
  .hangup-collect-page {
    height: auto;
    overflow: visible;
  }

  .main-layout {
    flex-direction: column;
    height: auto;
  }

  .left-column {
    width: 100%;
    overflow-y: visible;
  }

  .right-column {
    width: 100%;
    margin-top: 16px;
  }

  .log-container {
    height: 300px;
    max-height: 300px;
  }

  /* 顶部卡片响应式 */
  .page-header-wrapper {
    padding: 14px;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 10px;
  }

  /* 活动日历响应式 */
  .activity-section {
    margin-right: 0;
    padding-right: 0;
    border-right: none;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e9ecef;
  }

  .activity-cards {
    flex-wrap: wrap;
  }

  .activity-card {
    min-width: 220px;
    flex: 1;
  }
}

@media (max-width: 768px) {
  .hangup-collect-page {
    padding: 12px;
  }

  .page-header-wrapper {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .n-button {
    width: 100%;
  }

  .token-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    max-height: 280px;
  }

  .log-card {
    max-height: 350px;
  }

  .log-header-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .log-container {
    height: 250px;
    max-height: 250px;
  }

  /* 活动日历响应式 */
  .activity-cards {
    flex-direction: column;
  }

  .activity-card {
    width: 100%;
    min-width: auto;
    padding: 12px 16px;
    gap: 12px;
  }

  .card-badge {
    font-size: 15px;
    padding: 4px 10px;
  }

  .week-name, .festival-name {
    font-size: 16px;
  }
}

@media (max-width: 600px) {
  .page-header-wrapper {
    padding: 12px;
  }

  .page-title {
    font-size: 18px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .action-buttons .n-button {
    width: 100%;
  }

  .token-grid {
    grid-template-columns: 1fr !important;
  }

  .token-item {
    flex-direction: row;
    align-items: center;
  }

  .token-name {
    font-size: 14px;
  }

  .token-server {
    font-size: 11px;
  }

  /* 活动日历响应式 */
  .activity-card {
    flex-wrap: wrap;
    justify-content: flex-start;
    row-gap: 8px;
  }

  .card-badge {
    font-size: 14px;
    padding: 3px 8px;
  }

  .week-name, .festival-name {
    font-size: 15px;
  }

  .next-label {
    font-size: 12px;
  }

  .next-value {
    font-size: 14px;
  }

  .countdown {
    font-size: 13px;
  }
}

/* ===== 活动日历样式 ===== */
.page-header-wrapper {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 12px;
  border-top: 1px solid var(--divider-color);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 20px;
}

.scheduled-actions-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--divider-color);
}

.scheduled-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions-row {
  display: flex;
  gap: 8px;
}

.actions-row .n-button {
  flex: 1;
  min-width: 100px;
  height: 32px;
  width: 100px;
}

.activity-section {
  flex: 1;
}

.activity-cards {
  display: flex;
  gap: 12px;
}

.activity-card {
  flex: 1;
  background: var(--card-bg-secondary);
  border-radius: 8px;
  padding: 14px 18px;
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #007bff;
  color: #fff;
  font-size: 17px;
  border-radius: 4px;
}

.card-badge.paid {
  background: #dc3545;
}

.card-badge.free {
  background: #28a745;
}

.week-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.festival-name {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
}

.week-label {
  font-size: 17px;
  color: var(--text-secondary);
  padding: 5px 10px;
  background: var(--card-border);
  border-radius: 4px;
}

.next-label {
  font-size: 17px;
  color: var(--text-secondary);
  margin-left: 14px;
}

.next-value {
  font-size: 18px;
  color: var(--text-color);
  font-weight: 500;
}

.countdown {
  color: #007bff;
  margin-left: 8px;
}

.countdown-large {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
}

.countdown-large.active {
  color: #dc3545;
  animation: pulse 1s infinite;
}

.festival-date {
  font-size: 18px;
  color: var(--text-secondary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== 深色模式适配 ===== */
</style>
