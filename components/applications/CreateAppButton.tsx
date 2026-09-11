"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Lock } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { SetupPaymentMethodModal } from "@/components/billing/SetupPaymentMethodModal";

export interface CreateAppButtonProps extends ButtonProps {
  hasValidPaymentMethod?: boolean;
  href?: string;
  tooltipText?: string;
  showLockIcon?: boolean;
}

export function CreateAppButton({
  hasValidPaymentMethod: propHasValidPayment,
  href = "/dashboard/applications/new",
  tooltipText = "Debes registrar un método de pago para crear aplicaciones propias ($0/mes en Plan Developer).",
  showLockIcon = true,
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  ...props
}: CreateAppButtonProps) {
  const router = useRouter();
  const { hasValidPaymentMethod: hookHasValidPayment, isLoading } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  // If passed as prop, prioritize prop; otherwise fall back to hook
  const hasPaymentMethod =
    propHasValidPayment !== undefined ? propHasValidPayment : hookHasValidPayment;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasPaymentMethod) {
      e.preventDefault();
      e.stopPropagation();
      setModalOpen(true);
      return;
    }

    if (onClick) {
      onClick(e);
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  const buttonContent = children || (
    <>
      {!hasPaymentMethod && showLockIcon ? (
        <Lock className="w-4 h-4 mr-2" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Nueva Aplicación
    </>
  );

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleClick}
                aria-label={!hasPaymentMethod ? "Creación bloqueada: Requiere método de pago" : "Crear nueva aplicación"}
                {...props}
              >
                {buttonContent}
              </Button>
            </span>
          </TooltipTrigger>
          {!hasPaymentMethod && (
            <TooltipContent
              side="bottom"
              className="max-w-xs text-center text-xs bg-popover text-popover-foreground border border-border"
            >
              {tooltipText}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <SetupPaymentMethodModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Método de pago requerido para crear aplicaciones"
        description="Para crear tus propias aplicaciones e infraestructura en Caerus, añade una tarjeta de crédito o débito. Tu plan continuará siendo Developer ($0/mes) sin cobro inicial."
        onSuccess={() => {
          setModalOpen(false);
          if (href) {
            router.push(href);
          }
        }}
      />
    </>
  );
}
