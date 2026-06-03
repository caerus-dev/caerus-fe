"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Box, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Resource name must be at least 2 characters.",
  }).regex(/^[a-z0-9_]+$/, {
    message: "Name can only contain lowercase letters, numbers, and underscores.",
  }),
  description: z.string().optional(),
  mode: z.enum(["unit", "multiple"]),
  ttl: z.coerce.number().min(1, { message: "TTL must be at least 1 minute." }),
  saveMetadata: z.boolean().default(false),
  conflictStrategy: z.enum(["fail", "retry", "queue"]),
  retryInterval: z.coerce.number().min(100).optional(),
  maxRetries: z.coerce.number().min(1).optional(),
  idempotency: z.boolean().default(false),
})

export type ResourceFormValues = z.infer<typeof formSchema>

interface ResourceFormProps {
  applicationId: string
  initialData?: ResourceFormValues
  isEditing?: boolean
}

export function ResourceForm({ applicationId, initialData, isEditing = false }: ResourceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      mode: "unit",
      ttl: 15,
      saveMetadata: false,
      conflictStrategy: "fail",
      retryInterval: 500,
      maxRetries: 3,
      idempotency: false,
    },
  })

  const conflictStrategy = form.watch("conflictStrategy")

  function onSubmit(values: ResourceFormValues) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Submitted:", values)
      setIsSubmitting(false)
      router.push(`/dashboard/applications/${applicationId}`)
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Resource Template" : "New Resource Template"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Modify the configuration of an existing shared resource."
              : "Define a new shared resource to be managed by the SRE engine."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Basic Configuration
              </CardTitle>
              <CardDescription>
                Define the identity and lifecycle of this resource.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Name (Namespace)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. seat, trip_capacity" {...field} disabled={isEditing} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this resource type.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Unitary (Single Instance)</SelectItem>
                          <SelectItem value="multiple">Multiple (Stock / Capacity)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines if it's a unique object or a pool of items.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What is this resource used for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ttl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default TTL (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum time a reservation stays active before auto-release.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="saveMetadata"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm h-[76px] mt-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Save Metadata</FormLabel>
                        <FormDescription>
                          Allow storing contextual JSON data with reservations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Concurrency & Reliability</CardTitle>
              <CardDescription>
                Configure how the engine handles concurrent requests and network issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="conflictStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conflict Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fail">Fail (Immediate Error)</SelectItem>
                          <SelectItem value="retry">Retry (Auto-retry)</SelectItem>
                          <SelectItem value="queue">Queue (Wait list)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Behavior when the resource is currently unavailable.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="idempotency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm h-[76px] mt-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Idempotency</FormLabel>
                        <FormDescription>
                          Prevent duplicate side-effects on network retries.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {conflictStrategy === "retry" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <FormField
                    control={form.control}
                    name="retryInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retry Interval (ms)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxRetries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Retries</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            {isEditing ? (
              <Button type="button" variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Template
              </Button>
            ) : (
              <div /> // Spacer
            )}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? "Save Changes" : "Create Resource"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
