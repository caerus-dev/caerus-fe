"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Lock, Save, Trash2 } from "lucide-react"

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
  namespace: z.string().min(2, {
    message: "Namespace must be at least 2 characters.",
  }).regex(/^[a-z0-9_]+$/, {
    message: "Namespace can only contain lowercase letters, numbers, and underscores.",
  }),
  description: z.string().optional(),
  type: z.enum(["exclusive", "read-write"]),
  ttl: z.coerce.number().min(1, { message: "TTL must be at least 1 second." }),
  deadlockStrategy: z.enum(["alert", "kill"]),
  webhookUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  acquisitionStrategy: z.enum(["fail", "retry", "blocking"]),
  retryInterval: z.coerce.number().min(10).optional(),
  maxRetries: z.coerce.number().min(1).optional(),
  requireFencingToken: z.boolean().default(false),
})

export type LockFormValues = z.infer<typeof formSchema>

interface LockFormProps {
  applicationId: string
  initialData?: LockFormValues
  isEditing?: boolean
}

export function LockForm({ applicationId, initialData, isEditing = false }: LockFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      namespace: "",
      description: "",
      type: "exclusive",
      ttl: 30, // seconds
      deadlockStrategy: "alert",
      webhookUrl: "",
      acquisitionStrategy: "fail",
      retryInterval: 100,
      maxRetries: 5,
      requireFencingToken: false,
    },
  })

  const acquisitionStrategy = form.watch("acquisitionStrategy")
  const deadlockStrategy = form.watch("deadlockStrategy")

  function onSubmit(values: LockFormValues) {
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
            {isEditing ? "Edit Lock Template" : "New Lock Template"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Modify the configuration of an existing distributed lock."
              : "Define a new lock namespace for distributed synchronization."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-chart-2" />
                Lock Settings
              </CardTitle>
              <CardDescription>
                Define the behavior of this lock namespace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="namespace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Namespace (Key prefix)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. order_processing" {...field} disabled={isEditing} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for grouping these locks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="exclusive">Exclusive (Mutex)</SelectItem>
                          <SelectItem value="read-write">Read / Write</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines if multiple readers are allowed.
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
                      <Textarea placeholder="What is this lock used for?" {...field} />
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
                      <FormLabel>Default TTL (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Safety timeout to prevent infinite deadlocks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requireFencingToken"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm h-[76px] mt-2 bg-chart-2/5 border-chart-2/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-chart-2 font-semibold">Fencing Tokens</FormLabel>
                        <FormDescription>
                          Generate strictly incremental tokens to prevent split-brain.
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
              <CardTitle className="text-lg">Acquisition & Deadlock Resolution</CardTitle>
              <CardDescription>
                Configure how workers acquire locks and how deadlocks are resolved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="acquisitionStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquisition Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fail">Fail immediately</SelectItem>
                          <SelectItem value="retry">Retry automatically</SelectItem>
                          <SelectItem value="blocking">Blocking (wait)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deadlockStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadlock Resolution Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alert">Alert Webhook Only</SelectItem>
                          <SelectItem value="kill">Kill Process Automatically</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {acquisitionStrategy === "retry" && (
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

              {deadlockStrategy === "alert" && (
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadlock Alert Webhook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.yourdomain.com/webhooks/deadlocks" {...field} />
                      </FormControl>
                      <FormDescription>
                        We will POST to this URL if an unsolvable deadlock occurs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <Button type="submit" disabled={isSubmitting} className="gap-2 bg-chart-2 text-chart-2-foreground hover:bg-chart-2/90">
                <Save className="h-4 w-4" />
                {isEditing ? "Save Changes" : "Create Lock Config"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
