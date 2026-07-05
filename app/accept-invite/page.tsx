"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = use(searchParams)
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Falta el token de invitación.")
      return
    }

    const acceptInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}/accept`, {
          method: "POST",
        })

        if (response.ok) {
          setStatus("success")
        } else {
          setStatus("error")
          setErrorMessage("Esta invitación ya expiró, fue aceptada o pertenece a otro usuario.")
        }
      } catch (error: any) {
        console.error("Error accepting invitation:", error)
        setStatus("error")
        setErrorMessage("Hubo un problema al procesar la invitación. Por favor intenta de nuevo.")
      }
    }

    acceptInvitation()
  }, [token])

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-chart-4/10 rounded-full blur-3xl pointer-events-none" />

        {status === "loading" && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">Procesando invitación</CardTitle>
              <CardDescription>Estamos vinculando tu cuenta con el nuevo proyecto en Caerus...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-8 min-h-[120px]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/20">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>Validando credenciales seguras...</span>
              </div>
            </CardContent>
          </>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                ¡Invitación Aceptada!
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1.5">
                Te has unido con éxito como colaborador de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-sm text-muted-foreground">
                Ya tienes acceso a los ambientes, recursos compartidos y configuraciones correspondientes a tu rol.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                onClick={() => router.push("/dashboard/applications")}
                className="w-full gap-2 glow-primary font-semibold py-6 text-base cursor-pointer"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive mb-4">
                <XCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                No se pudo aceptar la invitación
              </CardTitle>
              <CardDescription className="text-destructive/80 mt-1.5 font-medium px-4">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-sm text-muted-foreground">
                Si consideras que esto es un error, por favor solicita al propietario que te envíe una nueva invitación.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full py-6 text-base font-semibold cursor-pointer"
              >
                Volver al Inicio
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
