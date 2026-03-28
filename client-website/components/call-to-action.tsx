"use client"

import { ArrowRight } from "lucide-react"
import { HighlightedText } from "./highlighted-text"

export function CallToAction() {
  return (
    <section id="contact" className="py-32 md:py-29 bg-secondary text-foreground">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-8">Get Started Today</p>

          <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-8 text-balance">
            Ready for a roof
            <br />
            that <HighlightedText>lasts</HighlightedText>?
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Get your free inspection and estimate. No pressure, no obligation — just honest advice from roofing experts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@hously.com"
              className="inline-flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-sm tracking-wide hover:bg-accent/80 transition-colors duration-300 group"
            >
              Get Your Free Quote
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center gap-2 border border-border px-8 py-4 text-sm tracking-wide hover:bg-muted transition-colors duration-300"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
