import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-zinc-800/90 to-zinc-950 text-white border border-primary/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_4px_rgba(0,0,0,0.5)] hover:border-primary/85 hover:from-zinc-800 hover:to-zinc-900 hover:shadow-[0_0_20px_oklch(0.65_0.18_325_/_0.3),inset_0_1px_0_rgba(255,255,255,0.22)] [&_svg]:text-primary",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/40 hover:bg-destructive/25 hover:border-destructive/70 shadow-xs focus-visible:ring-destructive/20",
        outline:
          "border border-border/80 bg-secondary/30 text-foreground shadow-xs hover:bg-secondary/70 hover:text-foreground hover:border-primary/40 dark:bg-secondary/30 dark:border-border/80 dark:hover:bg-secondary/60 dark:hover:border-primary/50 transition-all duration-150",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/80",
        ghost:
          "hover:bg-accent/70 hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-lg px-5 has-[>svg]:px-4 text-sm font-semibold",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export { Button, buttonVariants }
