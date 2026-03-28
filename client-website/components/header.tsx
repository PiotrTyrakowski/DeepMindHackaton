"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <header
      className={cn(
        "fixed z-50 transition-all duration-500 my-0 py-0 rounded-none",
        scrolled || mobileMenuOpen
          ? "bg-primary text-primary-foreground backdrop-blur-md py-4 top-4 left-4 right-4 rounded-2xl border border-border"
          : "bg-transparent py-4 top-0 left-0 right-0",
      )}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between md:px-[24]">
        <Link href="/" className="flex items-center gap-2 group" onClick={scrollToTop}>
          <svg width="65" height="16" viewBox="0 0 65 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-auto h-6 transition-colors duration-300">
            <path d="M11.5 13.75V7C11.5 6.927 11.484 6.855 11.453 6.789C11.423 6.723 11.378 6.665 11.322 6.618C11.294 6.594 11.267 6.568 11.241 6.541L7.047 2.1C6.985 2.053 6.914 2.021 6.838 2.008L6.75 2C6.642 2 6.538 2.036 6.452 2.1L2.259 6.541C2.233 6.568 2.206 6.594 2.178 6.618C2.122 6.665 2.077 6.723 2.047 6.789C2.016 6.855 2 6.927 2 7V13.75C2 14.302 1.552 14.75 1 14.75C.448 14.75 0 14.302 0 13.75V7C0 6.637.079 6.277.232 5.947C.37 5.652.566 5.389.805 5.168L5.055.668C5.08.641 5.108.615 5.137.591C5.588.21 6.159 0 6.75 0L6.971.01C7.482.055 7.969.257 8.363.591C8.392.615 8.42.641 8.445.668L12.695 5.168C12.934 5.389 13.13 5.652 13.268 5.947C13.421 6.277 13.5 6.637 13.5 7V13.75C13.5 14.302 13.052 14.75 12.5 14.75C11.948 14.75 11.5 14.302 11.5 13.75Z" fill="currentColor"/>
            <path d="M60.102 15.133C59.477 15.133 59.102 14.75 59.102 14.086V10.555L55.578 5.188C55.438 4.961 55.375 4.742 55.375 4.516C55.375 3.984 55.805 3.594 56.375 3.594C56.797 3.594 57.039 3.742 57.297 4.18L60.094 8.633H60.141L62.945 4.18C63.195 3.758 63.445 3.594 63.844 3.594C64.406 3.594 64.836 3.984 64.836 4.508C64.836 4.742 64.773 4.953 64.625 5.188L61.109 10.555V14.086C61.109 14.75 60.734 15.133 60.102 15.133Z" fill="currentColor"/>
            <path d="M50.078 15C49.453 15 49.07 14.609 49.07 13.953V4.641C49.07 3.977 49.453 3.594 50.078 3.594C50.711 3.594 51.086 3.977 51.086 4.641V13.297H55.406C55.953 13.297 56.328 13.625 56.328 14.148C56.328 14.672 55.961 15 55.406 15H50.078Z" fill="currentColor"/>
            <path d="M43.148 15.188C40.898 15.188 39.398 14.25 38.961 12.969C38.891 12.781 38.852 12.578 38.852 12.391C38.852 11.828 39.211 11.469 39.742 11.469C40.188 11.469 40.469 11.648 40.688 12.102C41.039 13.078 42.008 13.516 43.211 13.516C44.57 13.516 45.523 12.844 45.523 11.906C45.523 11.094 44.961 10.594 43.492 10.289L42.281 10.039C40.023 9.578 38.969 8.516 38.969 6.867C38.969 4.883 40.711 3.539 43.156 3.539C45.148 3.539 46.695 4.43 47.156 5.922C47.203 6.047 47.227 6.195 47.227 6.383C47.227 6.875 46.875 7.211 46.352 7.211C45.883 7.211 45.594 7.008 45.383 6.57C45 5.617 44.195 5.211 43.141 5.211C41.891 5.211 41 5.805 41 6.75C41 7.516 41.563 8.008 42.969 8.305L44.18 8.555C46.555 9.047 47.555 10 47.555 11.672C47.555 13.828 45.859 15.188 43.148 15.188Z" fill="currentColor"/>
            <path d="M32.547 15.188C29.695 15.188 27.914 13.484 27.914 11.023V4.641C27.914 3.977 28.297 3.594 28.922 3.594C29.555 3.594 29.93 3.977 29.93 4.641V10.844C29.93 12.383 30.875 13.43 32.547 13.43C34.219 13.43 35.172 12.383 35.172 10.844V4.641C35.172 3.977 35.547 3.594 36.18 3.594C36.805 3.594 37.18 3.977 37.18 4.641V11.023C37.18 13.484 35.406 15.188 32.547 15.188Z" fill="currentColor"/>
            <path d="M20.961 15.188C17.672 15.188 15.609 12.953 15.609 9.367C15.609 5.781 17.672 3.539 20.961 3.539C24.242 3.539 26.305 5.781 26.305 9.367C26.305 12.953 24.242 15.188 20.961 15.188ZM20.961 13.469C22.969 13.469 24.25 11.875 24.25 9.367C24.25 6.852 22.969 5.258 20.961 5.258C18.945 5.258 17.672 6.852 17.672 9.367C17.672 11.875 18.945 13.469 20.961 13.469Z" fill="currentColor"/>
          </svg>
        </Link>

        <ul className={cn("hidden md:flex items-center gap-10 text-sm tracking-wide", scrolled ? "text-primary-foreground" : "text-foreground")}>
          {[
            { label: "Home", href: "#hero" },
            { label: "Why Us", href: "#about" },
            { label: "Our Work", href: "#projects" },
            { label: "Services", href: "#services" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="hover:text-accent transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 hover:after:w-full after:bg-accent after:transition-all after:duration-300"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#contact"
          className={cn(
            "hidden md:inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-all duration-300",
            scrolled
              ? "bg-accent text-accent-foreground border border-accent/20 hover:bg-accent/80"
              : "bg-accent text-accent-foreground border border-accent/20 hover:bg-accent/80",
          )}
        >
          Free Quote
        </Link>

        <button
          className={cn("md:hidden z-50 transition-colors duration-300", scrolled ? "text-primary-foreground" : "text-foreground")}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          )}
        </button>
      </nav>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[600px] opacity-100 mt-8" : "max-h-0 opacity-0",
        )}
      >
        <div className="container mx-auto px-6">
          <ul className="flex flex-col gap-6 mb-8">
            {[
              { label: "Home", href: "#hero" },
              { label: "Why Us", href: "#about" },
              { label: "Our Work", href: "#projects" },
              { label: "Services", href: "#services" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="hover:text-accent transition-colors duration-300 text-foreground text-4xl font-light block"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="#contact"
            className="inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5 bg-accent text-accent-foreground border border-accent/20 hover:bg-accent/80 transition-all duration-300 mb-4"
            onClick={closeMobileMenu}
          >
            Free Quote
          </Link>
        </div>
      </div>
    </header>
  )
}
