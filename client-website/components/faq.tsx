"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "What areas do you serve?",
    answer:
      "We serve the greater San Francisco Bay Area and throughout Northern California. Our team is fully licensed and insured to work in all local jurisdictions, ensuring your project meets all building codes and requirements.",
  },
  {
    question: "How long does a typical roof installation take?",
    answer:
      "Most residential roof replacements are completed within 2-5 days, depending on the size and complexity. We work efficiently while maintaining our high standards of quality, and we always clean up thoroughly at the end of each day.",
  },
  {
    question: "What roofing materials do you offer?",
    answer:
      "We install a wide range of premium roofing materials including asphalt shingles, architectural shingles, clay and concrete tiles, metal roofing, slate, and flat roof systems. We help you choose the best option for your home's style and climate.",
  },
  {
    question: "Do you offer warranties on your work?",
    answer:
      "Yes, we provide comprehensive warranties on both materials and labor. Our workmanship warranty covers installation for 10 years, and material warranties vary by manufacturer, often ranging from 25 years to lifetime coverage.",
  },
  {
    question: "Can you help with insurance claims?",
    answer:
      "Absolutely. We have extensive experience working with insurance companies on storm damage and other covered repairs. We document all damage thoroughly and work directly with your adjuster to ensure fair coverage.",
  },
  {
    question: "How do I get started with a quote?",
    answer:
      "Simply contact us to schedule a free inspection and estimate. We'll assess your roof's condition, discuss your options, and provide a detailed written quote with no obligation. Most inspections can be scheduled within 48 hours.",
  },
]

export function FAQ({ firstQuestion }: { firstQuestion?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const displayFaqs = faqs.map((faq, i) =>
    i === 0 && firstQuestion ? { ...faq, question: firstQuestion } : faq
  )

  return (
    <section id="faq" className="py-20 md:py-29">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6">FAQ</p>
          <h2 className="text-6xl font-medium leading-[1.15] tracking-tight mb-6 text-balance lg:text-7xl">
            Questions & Answers
          </h2>
        </div>

        <div>
          {displayFaqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg font-medium text-foreground transition-colors group-hover:text-foreground/70">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-foreground flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : "rotate-0"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-muted-foreground leading-relaxed pb-6 pr-12">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
