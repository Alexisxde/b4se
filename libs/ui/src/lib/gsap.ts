import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { Flip } from "gsap/Flip"

/* Only dependency: GSAP. Flip and CustomEase are free as of 3.13. */

/* Registered lazily, not at import time. Flip's core init needs document.body
   to exist — registering during module evaluation (or during SSR) leaves it
   half-built and every getState throws. */
let registered = false
function ensurePlugins() {
  if (registered) return
  gsap.registerPlugin(Flip, CustomEase)
  registered = true
}

/* Built on first use, for the same reason. EASE_IN is a quick lunge then a long
   decelerating settle. EASE_OUT is deliberately NOT its mirror: a mirrored curve
   idles at full size and then collapses, as unreadable as the front-loaded
   version is leaving. Even motion is what lets you watch the dialog become a
   button. */
type Ease = (progress: number) => number
let EASE_IN: Ease | undefined
let EASE_BLUR: Ease | undefined
const EASE_OUT = "power2.inOut"
function ensureEases() {
  EASE_IN ||= CustomEase.create("essentialMorphIn", "M0,0 C0.305,0.206 0.116,0.567 0.3,0.8 0.394,0.921 0.491,1 1,1")
  EASE_BLUR ||= CustomEase.create("essentialMorphBlur", "M0,0 C0.56,0.27 0,1 1,1")
}

gsap.registerPlugin(useGSAP)
gsap.registerPlugin(Flip, CustomEase)

export { CustomEase, EASE_BLUR, EASE_IN, EASE_OUT, ensureEases, ensurePlugins, Flip, gsap, useGSAP }
