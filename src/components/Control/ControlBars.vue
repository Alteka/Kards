<template>
  <div>
    <el-row>
      <el-col :span="18">
        <el-form-item label="Bars Style" label-width="90px">
          <el-radio-group v-model="bars.type" size="mini">
            <el-radio-button label="simple">Simple</el-radio-button>
            <el-radio-button label="smpte">SMPTE</el-radio-button>
            <el-radio-button label="arib">ARIB</el-radio-button>
            <el-radio-button label="hdr">HDR</el-radio-button>
            <el-radio-button label="sdi">SDI</el-radio-button>
            <el-radio-button label="single">Single</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Details" label-width="90px">
          <el-switch v-model="bars.overlay"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12" v-if="bars.type == 'simple'">
        <el-form-item label="Level" label-width="90px">
          <el-radio-group v-model="bars.level" size="mini">
            <el-radio-button label="75" />
            <el-radio-button label="100" />
            <el-radio-button label="109" />
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="10" v-if="bars.type == 'single'">
        <el-form-item label="Color" label-width="90px">
          <!-- Solid R/B/G/C/M/Y/ White 100%/ White 109/Black 0/black - -->
          <el-select v-model="bars.color" placeholder="Color" size="small">
            <el-option v-for="color in simpleColors" :key="color" :label="color" :value="color"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="14" v-if="bars.type == 'single' && bars.color != 'Black'">
        <el-form-item label="Level" label-width="90px">
          <el-radio-group v-model="bars.level" size="mini">
            <el-radio-button label="-9" />
            <el-radio-button label="0" />
            <el-radio-button label="75" />
            <el-radio-button label="100" />
            <el-radio-button label="109" />
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/**
 * Which levels each bars type actually accepts.
 *
 * `bars.level` is a single config key, but its valid values depend on
 * `bars.type` — and nothing used to enforce that. Setting -9 on Single and
 * switching to Simple left Simple at -9, where all seven driven bars clamp to
 * code value 0 while the hardcoded eighth bar stays at IRE 0 (= 16). The result
 * is that the bar labelled Black renders brighter than the bar labelled White,
 * with nothing in the UI indicating why. That is finding F-036.
 *
 * Types not listed here (smpte, arib, hdr, sdi) hardcode their own IRE values
 * and ignore `bars.level` entirely, so they constrain nothing.
 *
 * This is the contained fix. The real answer is per-card-type valid domains in
 * the config schema, validated on load — plan task C6 — which will also cover
 * configs already persisted in the bad state. This cannot: it only corrects the
 * live config once the control window has it.
 */
const LEVELS_BY_TYPE = {
  simple: ['75', '100', '109'],
  single: ['-9', '0', '75', '100', '109']
}

/** Where an out-of-domain level lands. Also the defaultConfig.json value. */
const DEFAULT_LEVEL = '75'

export default {
  props: {
    modelValue: Object
  },
  computed: {
    bars: {
      get() {
        return this.modelValue // return v-model
      },
      set(value) {
        this.$emit('update:modelValue', value) // update the v-model object to parent component
      }
    }
  },
  data: function () {
    return {
      simpleColors: ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'White']
    }
  },
  watch: {
    // Both, not just the type. Switching Single -> Simple changes the type and
    // leaves a stale level; a saved config arriving already in the bad state
    // changes the level while the type stays put. Only watching one misses the
    // other, and the second is the case an existing install would hit.
    'bars.type': { immediate: true, handler: 'normaliseLevel' },
    'bars.level': { immediate: true, handler: 'normaliseLevel' }
  },
  methods: {
    normaliseLevel: function () {
      if (!this.bars || !this.bars.type) return
      const allowed = LEVELS_BY_TYPE[this.bars.type]
      if (!allowed) return // smpte/arib/hdr/sdi ignore bars.level
      if (!allowed.includes(String(this.bars.level))) {
        this.bars.level = DEFAULT_LEVEL
      }
    }
  }
}
</script>

<style scoped></style>
