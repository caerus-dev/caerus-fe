import { auth0 } from "@/lib/auth0"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { DocsContent } from "@/components/docs/docs-content"

export default async function DocsPage() {
  const session = await auth0.getSession()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={session?.user} />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <DocsContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
