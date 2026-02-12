<template>
  <div id="clock-card" :style="{ background: clockStyle.bg }">
    <div v-if="config.showInfo" class="clock-header" :style="{ color: clockStyle.fg }">
      {{ config.name }}
    </div>
    <div class="clock-center">
      <!-- Inner ring: 12 dots for hours (lit = current hour position) -->
      <svg class="dot-ring" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle
          v-for="(d, i) in hourRingDots"
          :key="'h-' + i"
          :cx="d.x"
          :cy="d.y"
          r="1.2"
          :class="{ lit: d.lit }"
          :fill="d.lit ? clockStyle.fg : clockStyle.unlit"
        />
        <!-- Outer ring: 60 dots for minutes (sweep from 0 to current minute) -->
        <circle
          v-for="(d, i) in minuteRingDots"
          :key="'m-' + i"
          :cx="d.x"
          :cy="d.y"
          r="1.2"
          :class="{ lit: d.lit }"
          :fill="d.lit ? clockStyle.fg : clockStyle.unlit"
        />
      </svg>
      <!-- Central digital: time (one line) + date below -->
      <div class="digital-wrap" :style="{ color: clockStyle.fg }">
        <div class="digital-inner">
          <div class="clock-time">
            {{ info.time }}
          </div>
          <div class="clock-date">{{ dateStr }}</div>
        </div>
      </div>
    </div>
    <div v-if="config.showInfo" class="clock-footer" :style="{ color: clockStyle.fg }">
      {{ info.cardSize }} <span v-if="info.displayFrequency">– {{ info.displayFrequency }}Hz</span>
    </div>
  </div>
</template>

<script>
const HOUR_RING_RADIUS = 38
const HOUR_DOTS = 12
const MINUTE_RING_RADIUS = 44
const MINUTE_DOTS = 60

export default {
  name: 'ClockTestCard',
  props: {
    config: Object,
    info: Object
  },
  computed: {
    clockStyle() {
      const c = this.config.clock || {}
      return {
        bg: c.bg || '#000000',
        fg: c.fg || '#00ff00',
        unlit: c.unlit != null ? c.unlit : 'rgba(255,255,255,0.12)'
      }
    },
    timeParts() {
      const t = (this.info && this.info.time) || '00:00:00'
      const parts = t.split(':').map(Number)
      return {
        hours: Math.min(23, Math.max(0, parts[0] || 0)),
        minutes: Math.min(59, Math.max(0, parts[1] || 0)),
        seconds: Math.min(59, Math.max(0, parts[2] || 0))
      }
    },
    dateStr() {
      if (!this.info || !this.info.time) return ''
      const d = new Date()
      const day = d.getDate()
      const month = d.toLocaleString('en-GB', { month: 'short' })
      const year = d.getFullYear()
      const weekday = d.toLocaleString('en-GB', { weekday: 'short' })
      return `${weekday} ${day} ${month} ${year}`
    },
    hourRingDots() {
      const hour = this.timeParts.hours % 12
      const dots = []
      for (let i = 0; i < HOUR_DOTS; i++) {
        const angleDeg = i * (360 / HOUR_DOTS) - 90
        const angleRad = (angleDeg * Math.PI) / 180
        dots.push({
          x: 50 + HOUR_RING_RADIUS * Math.cos(angleRad),
          y: 50 + HOUR_RING_RADIUS * Math.sin(angleRad),
          lit: i === hour
        })
      }
      return dots
    },
    minuteRingDots() {
      const minute = this.timeParts.minutes
      const dots = []
      for (let i = 0; i < MINUTE_DOTS; i++) {
        const angleDeg = i * (360 / MINUTE_DOTS) - 90
        const angleRad = (angleDeg * Math.PI) / 180
        dots.push({
          x: 50 + MINUTE_RING_RADIUS * Math.cos(angleRad),
          y: 50 + MINUTE_RING_RADIUS * Math.sin(angleRad),
          lit: i <= minute
        })
      }
      return dots
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'DejaVu LGCSans Mono';
  src: url('@/assets/DejaVuLGCSansMono.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

#clock-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'DejaVu LGCSans Mono', 'DejaVu Sans Mono', 'Consolas', monospace;
}

.clock-header {
  position: absolute;
  top: 1.5%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: clamp(12px, 2vw, 28px);
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.clock-center {
  position: relative;
  width: min(85vmin, 85vh);
  height: min(85vmin, 85vh);
  max-width: min(85vw, 85vmin);
  max-height: min(85vw, 85vmin);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.95;
}

.digital-wrap {
  position: absolute;
  z-index: 1;
  width: 76%;
  height: 76%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.digital-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15em;
}

.clock-time {
  width: 100%;
  line-height: 1;
  font-size: min(9vw, 9vh);
  white-space: nowrap;
}

.clock-date {
  font-size: min(4vw, 4vh);
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.clock-footer {
  position: absolute;
  bottom: 1.5%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: clamp(10px, 1.5vw, 20px);
  letter-spacing: 0.05em;
  opacity: 0.8;
}
</style>
