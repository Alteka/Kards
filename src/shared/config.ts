import { z } from 'zod'

export const NotFilledCardSchema = z.object({
  width: z.number(),
  height: z.number(),
  top: z.number(),
  left: z.number(),
  bounds: z.boolean(),
  rotate: z.number()
})

export type NotFilledCard = z.infer<typeof NotFilledCardSchema>

const WindowSchema = z.object({
  width: z.number(),
  height: z.number()
})
export type Window = z.infer<typeof WindowSchema>

export const MaskSchema = z.object({
  enabled: z.boolean(),
  applyBounds: z.boolean(),
  image: z.string(),
  imageSource: z.string().optional()
})

export type Mask = z.infer<typeof MaskSchema>

export const PlaceholderSchema = z.object({
  bg: z.string(),
  fg: z.string(),
  gradient: z.boolean(),
  icon: z.string(),
  custom: z.string()
})

export type Placeholder = z.infer<typeof PlaceholderSchema>

export const BarTypeSchema = z.enum(['simple', 'smpte', 'arib', 'hdr', 'sdi', 'single'])

export type BarType = z.infer<typeof BarTypeSchema>

export const BarsSchema = z.object({
  type: BarTypeSchema,
  overlay: z.boolean(),
  level: z.string(),
  color: z.string()
})

export type Bars = z.infer<typeof BarsSchema>

export const GridSchema = z.object({
  bg: z.string(),
  crosshair: z.string(),
  lines: z.string(),
  size: z.number(),
  circles: z.boolean()
})

export type Grid = z.infer<typeof GridSchema>

export const LEDSchema = z.object({
  width: z.number(),
  height: z.number(),
  rows: z.number(),
  columns: z.number(),
  border: z.boolean(),
  position: z.boolean() // todo not sure about this one
})

export type LED = z.infer<typeof LEDSchema>

export const AudioSyncSchema = z.object({
  deviceId: z.string(),
  rate: z.number()
})

export type AudioSync = z.infer<typeof AudioSyncSchema>

export const AltekaSchema = z.object({
  logo: z.string(),
  showLogo: z.boolean(),
  bg: z.string(),
  fg: z.string(),
  textColour: z.string(),
  gradient: z.boolean()
})

export type Alteka = z.infer<typeof AltekaSchema>

export const RampSchema = z.object({
  direction: z.enum(['Horizontal', 'Vertical', 'Diagonal', 'Radial']),
  reverse: z.boolean(),
  stepped: z.boolean(),
  double: z.boolean(),
  overlay: z.boolean() // TODO not sure about this one
})

export type Ramp = z.infer<typeof RampSchema>

export const DeghostSchema = z.object({
  density: z.number(),
  speed: z.number()
})

export type Deghost = z.infer<typeof DeghostSchema>

export const ExportSchema = z.object({
  imageSource: z.enum(['card', 'canvas']),
  target: z.enum(['file', 'wallpaper'])
})

export type Export = z.infer<typeof ExportSchema>

export const AudioSchema = z.object({
  deviceId: z.string(),
  enabled: z.boolean(),
  options: z.array(
    z.enum(['voice', 'text', 'tone', 'pink', 'white', 'stereo', 'phase', 'sweep', 'file'])
  ),
  prependText: z.string(),
  voiceData: z.string(),
  text: z.string(),
  textData: z.string(),
  fileData: z.string(),
  fileName: z.string()
})

export type Audio = z.infer<typeof AudioSchema>

export const CardTypeSchema = z.enum([
  'alteka',
  'bars',
  'grid',
  'ramp',
  'placeholder',
  'audioSync',
  'deghost',
  'led'
])

export type CardType = z.infer<typeof CardTypeSchema>

export const ConfigSchema = z.object({
  visible: z.boolean(),
  name: z.string(),
  cardType: CardTypeSchema,
  animated: z.boolean(),
  showInfo: z.boolean(),
  windowed: z.boolean(),
  fullsize: z.boolean(),
  screen: z.number(),
  raster: z.boolean(),
  showClock: z.boolean(),
  infoCircleAnimated: z.boolean(),
  notFilledCard: NotFilledCardSchema,
  window: WindowSchema,
  mask: MaskSchema,
  placeholder: PlaceholderSchema,
  bars: BarsSchema,
  grid: GridSchema,
  led: LEDSchema,
  audioSync: AudioSyncSchema,
  alteka: AltekaSchema,
  ramp: RampSchema,
  deghost: DeghostSchema,
  export: ExportSchema,
  audio: AudioSchema,
  predefineColors: z.array(z.string())
})

export type Config = z.infer<typeof ConfigSchema>

export const ExportedConfigSchema = ConfigSchema.extend({
  createdBy: z.string(),
  exportedVersion: z.string()
})

export type ExportedConfig = z.infer<typeof ExportedConfigSchema>
