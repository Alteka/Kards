<template>
  <div id="Deghost">
    <info-circle :config="config" :info="info" class="info" />
    <div id="particles-js"></div>
  </div>
</template>

<script>
import InfoCircle from './InfoCircle'
import 'particles.js'

export default {
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
            value: 10,
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
    }
  },
  mounted: function() {
    window.particlesJS('particles-js', this.particlesConfig);
  },
  watch: {
      config: {
        handler: function (val, oldVal) { 
          if (val.deghost != oldVal.deghost) {
            
            window.particlesJS('particles-js', this.particlesConfig);
            
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
		background: #f00;
	}
	33% {
		background: #0f0;
	}
  66% {
		background: #00f;
	}
	100% {
		background: #f00;
	}
}

</style>
