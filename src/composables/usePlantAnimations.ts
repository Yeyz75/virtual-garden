import { gsap } from 'gsap'
import { ref, onUnmounted } from 'vue'

export interface PlantAnimationConfig {
  duration?: number
  ease?: string
  delay?: number
}

export function usePlantAnimations() {
  const isAnimating = ref(false)
  const particlesContainer = ref<HTMLElement | null>(null)

  // Animación de plantado (cavar y sembrar)
  const animatePlanting = (element: HTMLElement, _config: PlantAnimationConfig = {}) => {
    isAnimating.value = true
    const tl = gsap.timeline()
    tl.to(element, {
      scale: 0.8,
      y: 10,
      duration: 0.3,
      ease: "power2.in"
    })
    .to(element, {
      scale: 1.1,
      y: -5,
      duration: 0.4,
      ease: "bounce.out"
    })
    .to(element, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    })
    .to(element, {
      scale: 0,
      rotation: 360,
      duration: 0.2,
      ease: "power2.in"
    })
    .to(element, {
      scale: 1.2,
      rotation: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .to(element, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    })
    .add(() => createSoilParticles(element), "-=0.5")
    .to(element, {
      boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)",
      duration: 0.3,
      ease: "power2.out"
    })
    .to(element, {
      boxShadow: "none",
      duration: 0.3,
      ease: "power2.in"
    })
    tl.eventCallback("onComplete", () => {
      isAnimating.value = false
    })
    return tl
  }

  // Animación de crecimiento por etapas
  const animateGrowth = (element: HTMLElement, stage: number, totalStages: number, config: PlantAnimationConfig = {}) => {
    const { duration = 0.8, ease = "power2.out" } = config
    const progress = stage / totalStages
    const scale = 0.3 + (progress * 0.7)
    return gsap.to(element, {
      scale,
      duration,
      ease,
      onStart: () => {
        createGrowthParticles(element)
      }
    })
  }

  // Animación de riego
  const animateWatering = (element: HTMLElement, _config: PlantAnimationConfig = {}) => {
    createWaterDrops(element)
    const tl = gsap.timeline()
    tl.to(element, {
      filter: "brightness(1.2) saturate(1.3)",
      duration: 0.5,
      ease: "power2.out"
    })
    .to(element, {
      filter: "brightness(1) saturate(1)",
      duration: 1,
      ease: "power2.in"
    })
    return tl
  }

  // Crear partículas de tierra
  const createSoilParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const container = particlesContainer.value || document.body
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div')
      particle.className = 'soil-particle'
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: #8B4513;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
      `
      container.appendChild(particle)
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        opacity: 0,
        scale: 0,
        duration: 1.5,
        ease: "power2.out",
        onComplete: () => particle.remove()
      })
    }
  }

  // Crear partículas de crecimiento
  const createGrowthParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const container = particlesContainer.value || document.body
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div')
      particle.className = 'growth-particle'
      particle.innerHTML = '✨'
      particle.style.cssText = `
        position: fixed;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
      `
      container.appendChild(particle)
      gsap.to(particle, {
        y: -50 - Math.random() * 30,
        x: (Math.random() - 0.5) * 40,
        opacity: 0,
        scale: 0,
        duration: 2,
        ease: "power2.out",
        delay: Math.random() * 0.5,
        onComplete: () => particle.remove()
      })
    }
  }

  // Crear gotas de agua
  const createWaterDrops = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const container = particlesContainer.value || document.body
    for (let i = 0; i < 6; i++) {
      const drop = document.createElement('div')
      drop.className = 'water-drop'
      drop.innerHTML = '💧'
      drop.style.cssText = `
        position: fixed;
        font-size: 16px;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + Math.random() * rect.width}px;
        top: ${rect.top - 20}px;
        opacity: 0;
      `
      container.appendChild(drop)
      // Animar: aparecer, caer y desaparecer
      gsap.fromTo(drop,
        { opacity: 0, scale: 0.5, y: 0 },
        {
          opacity: 1,
          scale: 1,
          y: rect.height + 20,
          duration: 1.2,
          ease: "power2.out",
          delay: Math.random() * 0.8,
          onComplete: () => drop.remove()
        }
      )
    }
  }

  // Animación de hover para plantas
  const animateHover = (element: HTMLElement, isHovering: boolean) => {
    if (isHovering) {
      gsap.to(element, {
        scale: 1.1,
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      })
    } else {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  // Animación de cosecha
  const animateHarvest = (element: HTMLElement, _config: PlantAnimationConfig = {}) => {
    const tl = gsap.timeline()
    tl.to(element, {
      scale: 1.3,
      rotation: 15,
      duration: 0.3,
      ease: "power2.out"
    })
    .to(element, {
      scale: 0,
      rotation: -15,
      duration: 0.7,
      ease: "power2.in"
    })
    .add(() => createHarvestParticles(element), "-=0.5")
    return tl
  }

  // Partículas de cosecha
  const createHarvestParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const container = particlesContainer.value || document.body
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div')
      particle.className = 'harvest-particle'
      particle.innerHTML = ['🪙', '✨', '🌟'][Math.floor(Math.random() * 3)]
      particle.style.cssText = `
        position: fixed;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
      `
      container.appendChild(particle)
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 150,
        y: -100 - Math.random() * 100,
        opacity: 0,
        scale: 0,
        rotation: Math.random() * 360,
        duration: 2,
        ease: "power2.out",
        delay: Math.random() * 0.3,
        onComplete: () => particle.remove()
      })
    }
  }

  // Efectos de ambiente (luz del sol, brisa)
  const createAmbientEffects = (container: HTMLElement) => {
    const sunRay = document.createElement('div')
    sunRay.className = 'sun-ray'
    sunRay.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 20% 20%, rgba(255, 255, 0, 0.1) 0%, transparent 50%);
      pointer-events: none;
      z-index: 1;
    `
    container.appendChild(sunRay)
    // Usar timeline para animar la opacidad
    const sunTl = gsap.timeline({ repeat: -1, yoyo: true })
    sunTl.to(sunRay, { opacity: 0.3, duration: 2, ease: "power2.inOut" })
    sunTl.to(sunRay, { opacity: 0.6, duration: 2, ease: "power2.inOut" })
    sunTl.to(sunRay, { opacity: 0.3, duration: 2, ease: "power2.inOut" })
  }

  onUnmounted(() => {
    const particles = document.querySelectorAll('.soil-particle, .growth-particle, .water-drop, .harvest-particle')
    particles.forEach(particle => particle.remove())
  })

  return {
    isAnimating,
    particlesContainer,
    animatePlanting,
    animateGrowth,
    animateWatering,
    animateHover,
    animateHarvest,
    createAmbientEffects
  }
} 