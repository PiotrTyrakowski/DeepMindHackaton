"use client"

import { usePolling } from "@/lib/usePolling"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Philosophy } from "@/components/philosophy"
import { Projects } from "@/components/projects"
import { Expertise } from "@/components/expertise"
import { FAQ } from "@/components/faq"
import { CallToAction } from "@/components/call-to-action"
import { Footer } from "@/components/footer"

export default function Home() {
  const state = usePolling(2000)
  const themeClass = state.themeVariant === "slate" ? "theme-slate" : ""

  return (
    <main className={`min-h-screen transition-all duration-700 ${themeClass}`}>
      <Header />
      <Hero />
      <Philosophy roofPhotoFixed={state.roofPhotoFixed} />
      <Projects />
      <Expertise />
      <FAQ firstQuestion={state.faqFirstQuestion} />
      <CallToAction />
      <Footer />
    </main>
  )
}
