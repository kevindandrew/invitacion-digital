import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Countdown ───────────────────────────────────────────────
const WEDDING_DATE = new Date('2026-05-23T17:30:00')

function pad(n) { return String(n).padStart(2, '0') }

function updateCountdown() {
  const diff = WEDDING_DATE - new Date()
  if (diff <= 0) {
    ;['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'].forEach(
      id => (document.getElementById(id).textContent = '00')
    )
    return
  }
  document.getElementById('cd-days').textContent    = pad(Math.floor(diff / 86400000))
  document.getElementById('cd-hours').textContent   = pad(Math.floor((diff % 86400000) / 3600000))
  document.getElementById('cd-minutes').textContent = pad(Math.floor((diff % 3600000) / 60000))
  document.getElementById('cd-seconds').textContent = pad(Math.floor((diff % 60000) / 1000))
}

updateCountdown()
setInterval(updateCountdown, 1000)

// ══════════════════════════════════════════════════════════
// YOUTUBE AUDIO — carga al inicio de la página
// ══════════════════════════════════════════════════════════
;(function initMusic() {
  const tag = document.createElement('script')
  tag.src   = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)

  window.onYouTubeIframeAPIReady = function () {
    window._ytPlayer = new YT.Player('yt-iframe', {
      videoId: 'KZh60U1PqSE',
      playerVars: {
        autoplay:    1,
        controls:    0,
        rel:         0,
        loop:        1,
        playlist:    'KZh60U1PqSE',
        enablejsapi: 1,
      },
      events: {
        onReady(e) {
          e.target.setVolume(55)
          e.target.playVideo()   // intenta autoplay en carga
        },
        onStateChange(e) {
          setMusicIcon(e.data === YT.PlayerState.PLAYING)
        },
      },
    })
  }
})()

// Muestra el botón de música 1.5 s tras cargar (antes de abrir el sobre)
gsap.set('#music-btn', { scale: 0.7, opacity: 0 })
gsap.to('#music-btn', { opacity: 1, scale: 1, duration: 0.5, delay: 1.5, ease: 'back.out(1.7)' })

document.getElementById('music-btn').addEventListener('click', toggleMusic)

function toggleMusic() {
  const p = window._ytPlayer
  if (!p || typeof p.getPlayerState !== 'function') return
  try {
    p.getPlayerState() === YT.PlayerState.PLAYING
      ? p.pauseVideo()
      : p.playVideo()
  } catch (_) {}
}

function setMusicIcon(playing) {
  document.getElementById('music-btn').classList.toggle('paused', !playing)
}

// Intenta reanudar si el autoplay fue bloqueado (se llama en primer click del usuario)
function tryStartMusic() {
  const p = window._ytPlayer
  if (!p || typeof p.getPlayerState !== 'function') return
  try {
    if (p.getPlayerState() !== YT.PlayerState.PLAYING) p.playVideo()
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════
// ENVELOPE
// ══════════════════════════════════════════════════════════
const overlay = document.getElementById('env-overlay')
const envBox  = document.getElementById('env-box')
let opened = false

const floatTween = gsap.to('#env-box', {
  y: -10, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
})

gsap.to('#env-hint', {
  opacity: 0.45, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut',
})

gsap.fromTo(
  ['#env-box', '#env-hint'],
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.25 }
)

function openEnvelope() {
  if (opened) return
  opened = true

  // Primera interacción del usuario → música arranca si estaba bloqueada
  tryStartMusic()

  floatTween.kill()

  gsap.timeline({ onComplete: launchInvitation })
    .to('#env-hint',     { opacity: 0, y: 10, duration: 0.25, ease: 'power2.in' }, 0)
    .to('#env-box',      { y: 0, duration: 0.2, ease: 'power2.out' }, 0)
    .to('#env-flap',     { scaleY: 0, duration: 0.65, ease: 'power2.in', transformOrigin: '50% 0%' }, 0.15)
    .to('#env-card',     { y: '-130%', duration: 0.9, ease: 'power2.out' }, 0.5)
    .to('#env-body-svg', { opacity: 0, duration: 0.4 }, 0.75)
    .to('#env-card',     { opacity: 0, y: '-200%', duration: 0.45, ease: 'power2.in' }, 0.95)
    .to('#env-overlay',  { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 1.1)
}

function launchInvitation() {
  overlay.style.display = 'none'
  startHeroAnimation()
  initScrollReveals()
  initGallery()
  initPetals()
}

envBox.addEventListener('click', openEnvelope)
envBox.setAttribute('role', 'button')
envBox.setAttribute('tabindex', '0')
envBox.setAttribute('aria-label', 'Abrir invitación')
envBox.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') openEnvelope()
})

// ══════════════════════════════════════════════════════════
// HERO ENTRANCE
// ══════════════════════════════════════════════════════════
function startHeroAnimation() {
  gsap.set('#h-carlos', { x: -45 })
  gsap.set('#h-gladis', { x: 45 })
  gsap.set('#h-amp',    { scale: 0.5 })
  gsap.set('#h-temple', { scale: 0.72, y: 14 })
  gsap.set('#h-date',   { y: 18 })

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl
    .to('.watercolor',  { opacity: 1, duration: 1.8 }, 0)
    .to('#h-eyebrow',   { opacity: 1, y: 0, duration: 0.9 }, 0.25)
    .to('#h-carlos',    { opacity: 1, x: 0, duration: 0.9 }, 0.55)
    .to('#h-amp',       { opacity: 1, scale: 1, duration: 0.6 }, 0.85)
    .to('#h-gladis',    { opacity: 1, x: 0, duration: 0.9 }, 0.95)
    .to('#h-temple',    { opacity: 1, scale: 1, y: 0, duration: 0.9 }, 1.15)
    .to('#h-date',      { opacity: 1, y: 0, duration: 0.7 }, 1.4)
    .to('#h-cta',       { opacity: 1, duration: 0.6 }, 1.65)
    .add(() => {
      gsap.to('.scroll-arrow', {
        y: 7, duration: 0.75, repeat: -1, yoyo: true, ease: 'power1.inOut',
      })
    }, 2)
}

// ══════════════════════════════════════════════════════════
// SCROLL REVEALS
// ══════════════════════════════════════════════════════════
function initScrollReveals() {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.85, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    })
  })

  gsap.utils.toArray('.reveal-photo').forEach(el => {
    gsap.to(el, {
      opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    })
  })
}

// ══════════════════════════════════════════════════════════
// PHOTO GALLERY
// ══════════════════════════════════════════════════════════
function initGallery() {
  const slides = Array.from(document.querySelectorAll('.gallery-slide'))
  const dots   = Array.from(document.querySelectorAll('.gallery-dot'))
  let current  = 0
  let timer

  function goTo(index) {
    if (index === current) return
    gsap.to(slides[current], { opacity: 0, duration: 0.7, ease: 'power2.inOut' })
    dots[current].classList.remove('active')
    current = index
    gsap.to(slides[current], { opacity: 1, duration: 0.7, ease: 'power2.inOut' })
    dots[current].classList.add('active')
  }

  function next() { goTo((current + 1) % slides.length) }

  timer = setInterval(next, 4500)

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer)
      goTo(i)
      timer = setInterval(next, 4500)
    })
  })
}

// ══════════════════════════════════════════════════════════
// FALLING PETALS
// ══════════════════════════════════════════════════════════
const PETAL_COLORS = ['#D4C5A9', '#C8B99A', '#BFA882', '#D6C9B2', '#CABC9E', '#DDD0B8']
const PETAL_PATHS  = [
  'M10,1 C16,5 19,12 16,20 C13,26 7,26 4,20 C1,12 4,5 10,1 Z',
  'M10,2 C18,3 20,9 18,16 C16,24 5,26 3,18 C1,10 4,2 10,2 Z',
]

function spawnPetal() {
  const container = document.getElementById('petals')
  const ns  = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '0 0 20 28')
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', PETAL_PATHS[Math.floor(Math.random() * PETAL_PATHS.length)])
  path.setAttribute('fill', PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)])
  svg.appendChild(path)

  const size     = 12 + Math.random() * 16
  const startX   = Math.random() * window.innerWidth
  const duration = 9 + Math.random() * 10
  const driftX   = (Math.random() - 0.5) * 260
  const startRot = Math.random() * 360

  Object.assign(svg.style, {
    position:      'fixed',
    width:         size + 'px',
    height:        size * 1.4 + 'px',
    left:          startX + 'px',
    top:           '-30px',
    pointerEvents: 'none',
    opacity:       0.35 + Math.random() * 0.45,
    transform:     `rotate(${startRot}deg)`,
  })

  container.appendChild(svg)
  gsap.to(svg, {
    y: window.innerHeight + 60,
    x: driftX,
    rotation: startRot + (Math.random() - 0.5) * 600,
    duration,
    ease: 'none',
    onComplete: () => { svg.remove(); spawnPetal() },
  })
}

function initPetals() {
  for (let i = 0; i < 16; i++) {
    gsap.delayedCall(Math.random() * 8, spawnPetal)
  }
}
