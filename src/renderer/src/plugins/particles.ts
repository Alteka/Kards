import Particles from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'
import type { App } from 'vue'

export default (app: App) => {
  app.use(Particles, {
    init: async (engine) => {
      await loadFull(engine)
    }
  })
}
