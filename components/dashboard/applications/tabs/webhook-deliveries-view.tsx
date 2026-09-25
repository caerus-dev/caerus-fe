"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  RotateCw,
  Search,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Send,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Shield,
  Key,
  Calendar,
  Layers,
  Terminal,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn, getEnvColors } from "@/lib/utils";

export interface WebhookDeliveryItem {
  id: string;
  endpointId: string;
  url: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING";
  httpStatusCode?: number | null;
  statusMessage?: string | null;
  eventId?: string | null;
  eventType?: string | null;
  attempts: number;
  payload: string;
  responseBody?: string | null;
  nextRetryAt?: string | null;
  createdAt: string;
  lastDeliveredAt?: string | null;
}

interface WebhookDeliveriesViewProps {
  webhook: any;
  selectedEnv: string;
  currentEnvDetails?: any;
  myRole?: string;
  onBack: () => void;
  onEditWebhook: (webhook: any) => void;
  onRotateSecret: (webhookId: string) => Promise<void>;
}

export function WebhookDeliveriesView({
  webhook,
  selectedEnv,
  currentEnvDetails,
  myRole,
  onBack,
  onEditWebhook,
  onRotateSecret,
}: WebhookDeliveriesViewProps) {
  const isViewer = myRole === "VIEWER";
  const envColors = getEnvColors(selectedEnv, currentEnvDetails?.color, currentEnvDetails?.id);

  // Estado de sub-pestaña: 'deliveries' o 'overview'
  const [activeSubTab, setActiveSubTab] = useState<string>("deliveries");

  // Estado de entregas
  const [deliveries, setDeliveries] = useState<WebhookDeliveryItem[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Paginación basada en cursor
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const limit = 20;

  // Estado de copiado
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copiado al portapapeles`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Carga de entregas (página inicial)
  const fetchDeliveries = useCallback(
    async (silent = false) => {
      if (!currentEnvDetails?.id || !webhook?.id) return;
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const res = await fetch(
          `/api/environments/${currentEnvDetails.id}/webhooks/${webhook.id}/deliveries?limit=${limit}`
        );
        if (res.ok) {
          const data = await res.json();
          const items: WebhookDeliveryItem[] = data.content || [];

          if (silent) {
            setDeliveries((prev) => {
              if (prev.length === 0) return items;
              const incomingMap = new Map(items.map((it) => [it.id, it]));
              const updated = prev.map((old) => incomingMap.get(old.id) || old);
              const existingIds = new Set(prev.map((it) => it.id));
              const brandNew = items.filter((it) => !existingIds.has(it.id));
              return [...brandNew, ...updated];
            });
          } else {
            setDeliveries(items);
            setHasNext(Boolean(data.hasNext));
            setNextCursor(data.nextCursor || null);
          }

          // Si hay entregas y no hay una seleccionada (o la seleccionada ya no existe), seleccionamos la primera
          setSelectedDelivery((prev) => {
            if (!prev && items.length > 0) return items[0];
            if (prev) {
              const updated = items.find((d) => d.id === prev.id);
              return updated || prev;
            }
            return null;
          });
        } else {
          toast.error("No se pudieron cargar las entregas del webhook");
        }
      } catch (error) {
        console.error("Error al cargar entregas:", error);
        toast.error("Error de red al consultar entregas");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentEnvDetails?.id, webhook?.id]
  );

  useEffect(() => {
    fetchDeliveries(false);
  }, [fetchDeliveries]);

  // Cargar más entregas usando cursor
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore || !hasNext || !currentEnvDetails?.id || !webhook?.id) return;

    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/environments/${currentEnvDetails.id}/webhooks/${webhook.id}/deliveries?limit=${limit}&cursor=${encodeURIComponent(nextCursor)}`
      );
      if (res.ok) {
        const data = await res.json();
        const newItems: WebhookDeliveryItem[] = data.content || [];
        setDeliveries((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const uniqueNew = newItems.filter((d) => !existingIds.has(d.id));
          return [...prev, ...uniqueNew];
        });
        setHasNext(Boolean(data.hasNext));
        setNextCursor(data.nextCursor || null);
      } else {
        toast.error("Error al cargar más entregas");
      }
    } catch (error) {
      console.error("Error al cargar más entregas:", error);
      toast.error("No se pudieron cargar más entregas");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Polling reactivo: si alguna entrega está en PROCESSING, re-consultamos cada 1.5s hasta que termine
  const hasProcessingDeliveries = useMemo(() => {
    return deliveries.some((d) => d.status === "PROCESSING") || selectedDelivery?.status === "PROCESSING";
  }, [deliveries, selectedDelivery]);

  useEffect(() => {
    if (!hasProcessingDeliveries) return;

    const interval = setInterval(() => {
      fetchDeliveries(true);
    }, 1500);

    return () => clearInterval(interval);
  }, [hasProcessingDeliveries, fetchDeliveries]);

  // Manejador de Reenvío manual (Stripe Standard)
  const handleResend = async () => {
    if (!selectedDelivery || isResending || isViewer) return;
    setIsResending(true);

    try {
      const res = await fetch(
        `/api/environments/${currentEnvDetails.id}/webhooks/${webhook.id}/deliveries/${selectedDelivery.id}/resend`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        const newDelivery: WebhookDeliveryItem = await res.json();
        toast.success("Reenvío de webhook iniciado");

        // Colocamos inmediatamente la nueva entrega en la lista y seleccionada
        setDeliveries((prev) => [newDelivery, ...prev.filter((d) => d.id !== newDelivery.id)]);
        setSelectedDelivery(newDelivery);

        // Consultamos a los 600ms para capturar la transición de estado post-envío
        setTimeout(() => {
          fetchDeliveries(true);
        }, 600);
      } else {
        const err = await res.json();
        toast.error(err.error || "No se pudo reenviar la entrega");
      }
    } catch (error: any) {
      console.error("Error al reenviar webhook:", error);
      toast.error(error.message || "Error al conectar con el servidor");
    } finally {
      setIsResending(false);
    }
  };

  // Filtrado en el cliente para búsqueda rápida
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (statusFilter !== "ALL" && d.status !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchType = d.eventType?.toLowerCase().includes(q);
      const matchId = d.id.toLowerCase().includes(q);
      const matchEventId = d.eventId?.toLowerCase().includes(q);
      return matchType || matchId || matchEventId;
    });
  }, [deliveries, statusFilter, searchQuery]);

  // Parseo y formateo del payload JSON
  const formattedPayload = useMemo(() => {
    if (!selectedDelivery?.payload) return "{}";
    try {
      const parsed = typeof selectedDelivery.payload === "string"
        ? JSON.parse(selectedDelivery.payload)
        : selectedDelivery.payload;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(selectedDelivery.payload);
    }
  }, [selectedDelivery?.payload]);

  // Renderizado del badge de status HTTP / estado
  const renderStatusBadge = (delivery: WebhookDeliveryItem) => {
    if (delivery.status === "SUCCESS") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
          <CheckCircle2 className="h-3 w-3" />
          {delivery.httpStatusCode ? `${delivery.httpStatusCode} OK` : "200 OK"}
        </span>
      );
    }
    if (delivery.status === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/25">
          <AlertCircle className="h-3 w-3" />
          {delivery.httpStatusCode ? `HTTP ${delivery.httpStatusCode}` : "Fallido"}
        </span>
      );
    }
    if (delivery.status === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/25">
          <Loader2 className="h-3 w-3 animate-spin" />
          Procesando
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/25">
        <Clock className="h-3 w-3" />
        Pendiente
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Botón de retorno y encabezado principal */}
      <div className="flex flex-col gap-3 pb-2 border-b border-border">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-xs text-muted-foreground hover:text-foreground -ml-2 mb-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Webhooks
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight font-mono truncate max-w-[320px] sm:max-w-[500px]">
                {webhook.description || webhook.url}
              </h2>
              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                  webhook.isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-secondary text-muted-foreground border-border"
                )}
              >
                {webhook.isActive ? "Activo" : "Pausado"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="truncate max-w-[300px] sm:max-w-[600px]">{webhook.url}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={() => copyToClipboard(webhook.url, "URL")}
                title="Copiar URL"
              >
                {copiedField === "URL" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {!isViewer && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs cursor-pointer"
                onClick={() => onEditWebhook(webhook)}
              >
                Editar endpoint
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs cursor-pointer"
                onClick={() => onRotateSecret(webhook.id)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Rotar secreto
              </Button>
            </div>
          )}
        </div>

        {/* Subtabs de navegación */}
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="pt-2">
          <TabsList className="bg-secondary w-fit h-9">
            <TabsTrigger value="deliveries" className="gap-1.5 text-xs px-3">
              <Send className="h-3.5 w-3.5" />
              <span>Event deliveries</span>
              {deliveries.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-mono">
                  {deliveries.length}{hasNext ? "+" : ""}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5 text-xs px-3">
              <Shield className="h-3.5 w-3.5" />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenido de pestaña: Event Deliveries (Stripe Split View) */}
      {activeSubTab === "deliveries" && (
        <div className="space-y-3">
          {/* Barra de herramientas: Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Event ID o tipo (ej: sre.resource)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs min-w-[170px] w-auto">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="SUCCESS">200 OK (Exitosos)</SelectItem>
                  <SelectItem value="FAILED">Errores / Fallidos</SelectItem>
                  <SelectItem value="PROCESSING">En procesamiento</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDeliveries(false)}
                disabled={isRefreshing || isLoading}
                className="h-9 px-2.5 gap-1.5 text-xs cursor-pointer"
                title="Actualizar entregas"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                <span className="hidden sm:inline">Refrescar</span>
              </Button>
            </div>
          </div>

          {/* Vista principal: Split-View Stripe */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 xl:col-span-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
              <div className="lg:col-span-7 xl:col-span-8">
                <Skeleton className="h-[420px] w-full rounded-lg" />
              </div>
            </div>
          ) : deliveries.length === 0 ? (
            <Card className="bg-card/50 border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Send className="h-10 w-10 text-muted-foreground mb-3 opacity-60" />
                <h3 className="text-base font-semibold mb-1">Aún no hay entregas registradas</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Las notificaciones de eventos asociados a este webhook aparecerán aquí en tiempo real a medida que ocurran en el entorno.
                </p>
              </CardContent>
            </Card>
          ) : filteredDeliveries.length === 0 ? (
            <Card className="bg-card/50 border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No se encontraron entregas que coincidan con los filtros aplicados.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-2 text-xs"
                >
                  Restablecer filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Columna Izquierda: Historial de Entregas */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col rounded-xl border border-border/70 bg-card/60 overflow-hidden shadow-sm">
                <div className="p-3 border-b border-border/70 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Mostrando <strong className="text-foreground">{filteredDeliveries.length}</strong> entregas
                  </span>
                  {hasNext && (
                    <span className="font-mono text-[11px] text-muted-foreground/80">Más disponibles</span>
                  )}
                </div>

                <div className="divide-y divide-border/60 max-h-[580px] overflow-y-auto [scrollbar-width:thin]">
                  {filteredDeliveries.map((delivery) => {
                    const isSelected = selectedDelivery?.id === delivery.id;
                    const dateObj = new Date(delivery.createdAt);
                    const formattedTime = !isNaN(dateObj.getTime())
                      ? format(dateObj, "HH:mm:ss")
                      : "--:--";

                    return (
                      <div
                        key={delivery.id}
                        onClick={() => setSelectedDelivery(delivery)}
                        className={cn(
                          "p-3 flex items-center justify-between gap-3 cursor-pointer transition-all text-left group",
                          isSelected
                            ? "bg-primary/10 border-l-4 border-l-primary shadow-inner"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {renderStatusBadge(delivery)}
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-xs font-mono font-medium truncate",
                                isSelected ? "text-primary font-semibold" : "text-foreground"
                              )}
                              title={delivery.eventType || "evento"}
                            >
                              {delivery.eventType || "evento"}
                            </p>
                            {delivery.eventId && (
                              <p className="text-[10px] text-muted-foreground font-mono truncate">
                                Evento: {delivery.eventId.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono text-muted-foreground">
                            {formattedTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Botón Cargar Más Entregas */}
                  {hasNext && nextCursor ? (
                    <div className="p-3 text-center bg-muted/10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="w-full text-xs gap-1.5 border-border/70 hover:border-primary transition-all cursor-pointer"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Cargando más...</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            <span>Cargar más entregas</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : deliveries.length > 0 ? (
                    <div className="p-2.5 text-center text-[11px] text-muted-foreground/60 bg-muted/5">
                      Fin de las entregas
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Columna Derecha: Inspector del Intento Seleccionado */}
              <div className="lg:col-span-7 xl:col-span-8">
                {selectedDelivery ? (
                  <Card className="bg-card/70 border-border/80 shadow-md">
                    {/* Header del detalle con Botón de Reenviar (Stripe Resend) */}
                    <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/70 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Intento de entrega
                          </span>
                          {renderStatusBadge(selectedDelivery)}
                        </div>
                        <h3 className="text-lg font-bold font-mono tracking-tight text-foreground truncate">
                          {selectedDelivery.eventType || "sre.resource.taken"}
                        </h3>
                      </div>

                      {!isViewer && (
                        <Button
                          onClick={handleResend}
                          disabled={isResending}
                          className="gap-2 h-9 text-xs font-semibold cursor-pointer shrink-0"
                          variant="default"
                        >
                          <RotateCw className={cn("h-3.5 w-3.5", isResending && "animate-spin")} />
                          {isResending ? "Reenviando..." : "Reenviar (Resend)"}
                        </Button>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 space-y-5">
                      {/* Metadatos de la entrega */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Estado de entrega:</span>
                          <p className="font-semibold capitalize text-foreground">
                            {selectedDelivery.status === "SUCCESS"
                              ? "Entregado con éxito"
                              : selectedDelivery.status === "FAILED"
                              ? "Fallido"
                              : selectedDelivery.status === "PROCESSING"
                              ? "En proceso de entrega"
                              : "Pendiente"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-muted-foreground">Fecha del intento:</span>
                          <p className="font-mono text-foreground">
                            {format(new Date(selectedDelivery.createdAt), "dd MMM yyyy, HH:mm:ss", {
                              locale: es,
                            })}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-muted-foreground">ID del Evento:</span>
                          <div className="flex items-center gap-1.5 font-mono text-foreground">
                            <span className="truncate max-w-[200px] sm:max-w-[280px]">
                              {selectedDelivery.eventId || "—"}
                            </span>
                            {selectedDelivery.eventId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(selectedDelivery.eventId!, "Event ID")}
                              >
                                {copiedField === "Event ID" ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-muted-foreground">Intentos ejecutados:</span>
                          <p className="font-mono text-foreground">
                            {selectedDelivery.attempts} {selectedDelivery.attempts === 1 ? "intento" : "intentos"}
                          </p>
                        </div>

                        {selectedDelivery.nextRetryAt && (
                          <div className="space-y-1">
                            <span className="text-muted-foreground">Próximo reintento programado:</span>
                            <p className="font-mono text-amber-400">
                              {format(new Date(selectedDelivery.nextRetryAt), "HH:mm:ss (dd/MM)")}
                            </p>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-border/60" />

                      {/* Sección Response */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5" />
                            Respuesta (Response)
                          </h4>
                          {selectedDelivery.httpStatusCode && (
                            <span className="text-xs font-mono font-medium text-foreground">
                              Código HTTP: <strong>{selectedDelivery.httpStatusCode}</strong>
                            </span>
                          )}
                        </div>

                        <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs font-mono">
                          {selectedDelivery.responseBody ? (
                            <pre className="whitespace-pre-wrap break-all text-muted-foreground max-h-48 overflow-y-auto [scrollbar-width:thin]">
                              {selectedDelivery.responseBody}
                            </pre>
                          ) : (
                            <span className="text-muted-foreground/70 italic">
                              {selectedDelivery.status === "SUCCESS"
                                ? "Respuesta vacía (HTTP 200 OK)"
                                : "Sin respuesta recibida del servidor destino"}
                            </span>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-border/60" />

                      {/* Sección Request: Payload JSON completo */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Send className="h-3.5 w-3.5" />
                            Petición enviada (Request Payload)
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 gap-1 text-xs cursor-pointer"
                            onClick={() => copyToClipboard(formattedPayload, "Payload JSON")}
                          >
                            {copiedField === "Payload JSON" ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copiar JSON</span>
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="rounded-lg border border-border/70 bg-zinc-950 p-3.5 text-xs font-mono text-zinc-100 shadow-inner">
                          <pre className="whitespace-pre-wrap break-all max-h-72 overflow-y-auto [scrollbar-width:thin] leading-relaxed">
                            {formattedPayload}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-xs">
                    Selecciona una entrega en la columna izquierda para ver su detalle completo.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenido de pestaña: Overview / Configuración */}
      {activeSubTab === "overview" && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-base font-semibold">Configuración del Endpoint</CardTitle>
            <CardDescription className="text-xs">
              Detalles técnicos y tipos de eventos a los que este webhook envía notificaciones firmadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">URL Destino:</span>
                <p className="font-mono text-foreground font-medium break-all">{webhook.url}</p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground">Estado:</span>
                <p className="font-medium text-foreground">
                  {webhook.isActive ? "Activo (Recibiendo eventos)" : "Pausado (Envíos suspendidos)"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground">Entorno:</span>
                <p className="font-mono uppercase text-foreground font-semibold">{selectedEnv}</p>
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Eventos suscritos:</span>
              <div className="flex flex-wrap gap-1.5">
                {webhook.eventTypes && webhook.eventTypes.length > 0 ? (
                  webhook.eventTypes.map((et: string) => (
                    <Badge key={et} variant="secondary" className="font-mono text-xs font-normal">
                      {et}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Sin eventos configurados</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
