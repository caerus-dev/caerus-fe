import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CodeExamplesSection } from "@/components/landing/code-examples-section"
import { UseCasesSection } from "@/components/landing/use-cases-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CodeExamplesSection />
        <UseCasesSection />
      </main>
      <Footer />
    </div>
  )
}
