"use client"

import { useEffect, useRef, useState } from "react"
import { HighlightedText } from "./highlighted-text"

const philosophyItems = [
  {
    title: "Quality materials first",
    description:
      "We source only the finest roofing materials from trusted manufacturers. Premium products that stand the test of time.",
  },
  {
    title: "Expert craftsmanship",
    description:
      "Our certified installers bring decades of combined experience. Every shingle, tile, and seam placed with precision.",
  },
  {
    title: "Weather-tested protection",
    description:
      "Engineered to withstand the elements. From scorching summers to heavy rains, your roof performs when it matters most.",
  },
  {
    title: "Lasting warranties",
    description: "We stand behind our work with comprehensive warranties. Peace of mind that extends for years to come.",
  },
]

export function Philosophy({ roofPhotoFixed = false }: { roofPhotoFixed?: boolean }) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.3 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-32 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left column - Title and image */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">Why Choose Us</p>
            <h2 className="text-6xl md:text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-8xl">
              Built with
              <br />
              <HighlightedText>integrity</HighlightedText>
            </h2>

            <div className="relative hidden lg:block">
              <img
                src={roofPhotoFixed ? "/images/roof-detail-fixed.jpg" : "/images/roof-detail.jpg"}
                alt={roofPhotoFixed ? "Pitched tile roof installation" : "Expert roofer installing premium slate tiles"}
                className="opacity-90 relative z-10 w-auto transition-all duration-700"
              />
            </div>
          </div>

          {/* Right column - Description and Philosophy items */}
          <div className="space-y-6 lg:pt-48">
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-12">
              Your roof is more than protection — it&apos;s the crown of your home. We deliver roofing solutions that
              combine beauty, durability, and expert installation.
            </p>

            {philosophyItems.map((item, index) => (
              <div
                key={item.title}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                data-index={index}
                className={`transition-all duration-700 ${
                  visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <span className="text-muted-foreground/50 text-sm font-medium">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
