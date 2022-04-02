<template>
  <div id="Deghost" :style="deghostStyle">
    <info-circle :config="config" :info="info" class="info" />
    <div id="particles-js"></div>
  </div>
</template>

<script>
import InfoCircle from './InfoCircle'
import '../../../public/particles.js'

export default {
  name: "DeghostTestCard",
  components: { InfoCircle },
  props: {
    config: Object,
    info: Object
  },
  computed: {
      particlesConfig: function() {
        return {
          particles: {
          number: {
            value: this.config.deghost.density,
            density: {
              enable: true,
              value_area: 1000
            }
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "circle",
            stroke: {
              width: 5,
              color: "#000000"
            }
          },
          opacity: {
            value: 1.0,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 8,
            random: false,
            anim: {
              enable: false,
              speed: 80,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 200,
            color: "#000",
            opacity: 1.0,
            width: 2
          },
          move: {
            enable: true,
            speed: this.config.deghost.speed,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onclick: {
              enable: false,
              mode: "push"
            },
            onhover: {
              enable: false
            },
            resize: true
          }
        },
        retina_detect: true
      }
    },
    deghostStyle: function() {
      return {
        animationDuration: Math.abs(15 - this.config.deghost.speed) + 's'
      }
    }
  },
  mounted: function() {
    window.particlesJS('particles-js', this.particlesConfig);
  },
  watch: {
      config: {
        handler: function (val, oldVal) { 
          if (val.deghost != oldVal.deghost) {
            
            // window.particlesJS.apply('particles-js', this.particlesConfig);
            location.reload()
            
          }
         },
        deep: true
      },
    },
}
</script>

<style scoped>

.info {
  /* position: relative; */
  animation: circle 20s linear infinite;
}

@keyframes circle{
  0%{
    transform:rotate(0deg)
              translate(calc(-100%))
              rotate(0deg);
  
  }
  100%{
    transform:rotate(360deg)
              translate(calc(-100%))
              rotate(-360deg);
  }
}

#Deghost {
  overflow: hidden;
  background: #000;
  height: 100%;
  width: 100%;
  color: white;
  animation-name: backgroundColorPalette;
	animation-duration: 5s;
	animation-iteration-count: infinite;
	animation-direction:normal;
	animation-timing-function: linear; 
}

#particles-js {
  height: 100%;
  width: 100%;
}

@keyframes backgroundColorPalette {
	0% {
		background: hsl(0deg, 100%, 50%);
	}
	8.333% {
		background: hsl(30deg, 100%, 50%);
	}
  16.667% {
		background: hsl(60deg, 100%, 50%);
	}
	25% {
		background: hsl(90deg, 100%, 50%);
	}
  33.333% {
		background: hsl(120deg, 100%, 50%);
	}
  41.667% {
		background: hsl(150deg, 100%, 50%);
	}
  50% {
		background: hsl(180deg, 100%, 50%);
	}
  58.333% {
		background: hsl(210deg, 100%, 50%);
	}
  66.667% {
		background: hsl(240deg, 100%, 50%);
	}
  75% {
		background: hsl(270deg, 100%, 50%);
	}
  83.333% {
		background: hsl(300deg, 100%, 50%);
	}
  91.667% {
		background: hsl(330deg, 100%, 50%);
	}
  100% {
		background: hsl(360deg, 100%, 50%);
	}
}

</style>
