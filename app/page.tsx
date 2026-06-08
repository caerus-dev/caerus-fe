import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CodeExamplesSection } from "@/components/landing/code-examples-section"
import { UseCasesSection } from "@/components/landing/use-cases-section"
import { Footer } from "@/components/landing/footer"
import { auth0 } from "@/lib/auth0"

export default async function HomePage() {
  const session = await auth0.getSession();

  return (
    <div className="min-h-screen">
      <Navbar user={session?.user} />
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
