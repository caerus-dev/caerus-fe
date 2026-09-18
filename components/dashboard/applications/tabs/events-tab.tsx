"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format, formatDistanceToNow, subDays, subHours } from "date-fns";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
  Loader2,
  Eye,
  X,
  History,
  AlertCircle,
  Key,
  User,
  Server,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getEnvColors } from "@/lib/utils";
import {
  EventResponse,
  EventTypeCatalogItem,
  CursorPagedEventsResponse,
} from "@/types/events";
import { EventDetailSheet } from "./event-detail-sheet";

interface EventsTabProps {
  appId: string;
  selectedEnv: string;
  currentEnvDetails?: any;
  myRole?: string;
  onNavigateToManualControl?: (preselect: {
    product: "SRE" | "DLS";
    method: string;
    params: Record<string, any>;
    autoExecute?: boolean;
  }) => void;
}

// Caché a nivel de módulo para cargar el catálogo de tipos de evento una sola vez en la aplicación
let cachedEventCatalog: EventTypeCatalogItem[] | null = null;
let isFetchingCatalog = false;
const catalogListeners: Array<(catalog: EventTypeCatalogItem[]) => void> = [];

export function EventsTab({
  appId,
  selectedEnv,
  currentEnvDetails,
  onNavigateToManualControl,
}: EventsTabProps) {
  const envId = currentEnvDetails?.id;
  const envColors = getEnvColors(selectedEnv, currentEnvDetails?.color, envId);

  // Catálogo de tipos de eventos
  const [catalog, setCatalog] = useState<EventTypeCatalogItem[]>(
    cachedEventCatalog || []
  );

  // Filtros
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");
  const [objectTypeFilter, setObjectTypeFilter] = useState<string>("ALL");
  const [objectIdFilter, setObjectIdFilter] = useState<string>("");
  const [datePreset, setDatePreset] = useState<string>("ALL");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);

  // Datos y paginación
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Detalle del evento seleccionado
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  // 1. Cargar catálogo de tipos de evento una sola vez usando el proxy existente /api/events/types
  useEffect(() => {
    if (cachedEventCatalog) {
      setCatalog(cachedEventCatalog);
      return;
    }

    if (isFetchingCatalog) {
      const listener = (data: EventTypeCatalogItem[]) => setCatalog(data);
      catalogListeners.push(listener);
      return;
    }

    isFetchingCatalog = true;
    fetch("/api/events/types")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar catálogo de eventos");
        return res.json();
      })
      .then((data: EventTypeCatalogItem[]) => {
        const items = Array.isArray(data) ? data : [];
        cachedEventCatalog = items;
        setCatalog(items);
        catalogListeners.forEach((fn) => fn(items));
        catalogListeners.length = 0;
      })
      .catch((err) => {
        console.error("Error fetching event types catalog:", err);
      })
      .finally(() => {
        isFetchingCatalog = false;
      });
  }, []);

  // Calcular fechas según el preset seleccionado
  const computedDateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === "24H") {
      return { from: subHours(now, 24).toISOString(), to: now.toISOString() };
    }
    if (datePreset === "7D") {
      return { from: subDays(now, 7).toISOString(), to: now.toISOString() };
    }
    if (datePreset === "30D") {
      return { from: subDays(now, 30).toISOString(), to: now.toISOString() };
    }
    if (datePreset === "CUSTOM") {
      return {
        from: customFrom ? customFrom.toISOString() : undefined,
        to: customTo ? customTo.toISOString() : undefined,
      };
    }
    return { from: undefined, to: undefined };
  }, [datePreset, customFrom, customTo]);

  // Filtrar tipos de eventos según el producto seleccionado
  const availableEventTypes = useMemo(() => {
    if (productFilter === "ALL") return catalog;
    return catalog.filter(
      (item) => item.product.toUpperCase() === productFilter.toUpperCase()
    );
  }, [catalog, productFilter]);

  // Construir query params para el backend
  const buildQueryParams = useCallback(
    (cursorToken?: string | null) => {
      if (!envId) return null;
      const params = new URLSearchParams();
      params.set("environmentId", envId);
      params.set("limit", "20");

      if (productFilter !== "ALL") params.set("product", productFilter);
      if (eventTypeFilter !== "ALL") params.set("eventType", eventTypeFilter);
      if (objectTypeFilter !== "ALL") params.set("objectType", objectTypeFilter);
      if (objectIdFilter.trim()) params.set("objectId", objectIdFilter.trim());
      if (computedDateRange.from) params.set("from", computedDateRange.from);
      if (computedDateRange.to) params.set("to", computedDateRange.to);
      if (cursorToken) params.set("cursor", cursorToken);

      return params.toString();
    },
    [
      envId,
      productFilter,
      eventTypeFilter,
      objectTypeFilter,
      objectIdFilter,
      computedDateRange,
    ]
  );

  // 2. Cargar eventos iniciales (página 1)
  const fetchInitialEvents = useCallback(async () => {
    if (!envId) return;

    setIsLoading(true);
    setError(null);

    const queryString = buildQueryParams(null);
    if (!queryString) return;

    try {
      const res = await fetch(`/api/events?${queryString}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "No se pudieron obtener los eventos");
      }

      const data: CursorPagedEventsResponse = await res.json();
      setEvents(data.content || []);
      setHasNext(Boolean(data.hasNext));
      setNextCursor(data.nextCursor || null);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "Error al conectar con el servidor");
      setEvents([]);
      setHasNext(false);
      setNextCursor(null);
    } finally {
      setIsLoading(false);
    }
  }, [envId, buildQueryParams]);

  // Cargar cuando cambia el ambiente o los filtros principales
  useEffect(() => {
    fetchInitialEvents();
  }, [fetchInitialEvents]);

  // 3. Cargar más eventos (disparado manualmente por el usuario mediante botón)
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore || !hasNext) return;

    setIsLoadingMore(true);
    const queryString = buildQueryParams(nextCursor);
    if (!queryString) {
      setIsLoadingMore(false);
      return;
    }

    try {
      const res = await fetch(`/api/events?${queryString}`);
      if (!res.ok) {
        throw new Error("Error al cargar más eventos");
      }

      const data: CursorPagedEventsResponse = await res.json();
      setEvents((prev) => [...prev, ...(data.content || [])]);
      setHasNext(Boolean(data.hasNext));
      setNextCursor(data.nextCursor || null);
    } catch (err: any) {
      console.error("Error loading more events:", err);
      setError("No se pudieron cargar más eventos. Intenta nuevamente.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setProductFilter("ALL");
    setEventTypeFilter("ALL");
    setObjectTypeFilter("ALL");
    setObjectIdFilter("");
    setDatePreset("ALL");
    setCustomFrom(undefined);
    setCustomTo(undefined);
  };

  const hasActiveFilters =
    productFilter !== "ALL" ||
    eventTypeFilter !== "ALL" ||
    objectTypeFilter !== "ALL" ||
    objectIdFilter.trim() !== "" ||
    datePreset !== "ALL";

  // Abrir detalle del evento
  const handleOpenDetail = (event: EventResponse) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const selectedCatalogItem = useMemo(() => {
    if (!selectedEvent) return null;
    return (
      catalog.find((item) => item.eventType === selectedEvent.eventType) || null
    );
  }, [selectedEvent, catalog]);

  return (
    <div className="space-y-4">
      {/* Encabezado y resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Registro de Eventos y Auditoría
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitorea en tiempo real e histórico todas las operaciones en{" "}
            <span
              className={cn(
                "font-mono font-semibold px-2 py-0.5 rounded text-xs border inline-flex items-center gap-1.5",
                envColors.badge
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", envColors.dot)} />
              {selectedEnv}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => fetchInitialEvents()}
            disabled={isLoading || !envId}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            />
            <span>Refrescar</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <Card className="bg-card/50 border-border p-3.5 shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Filtro Producto */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Producto
              </label>
              <Select
                value={productFilter}
                onValueChange={(val) => {
                  setProductFilter(val);
                  setEventTypeFilter("ALL"); // reset tipo si cambia producto
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos los productos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los productos</SelectItem>
                  <SelectItem value="SRE">SRE (Shared Resources)</SelectItem>
                  <SelectItem value="DLS">DLS (Distributed Locks)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Tipo de Evento */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Tipo de Evento
              </label>
              <Select
                value={eventTypeFilter}
                onValueChange={(val) => setEventTypeFilter(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="ALL">Todos los tipos ({availableEventTypes.length})</SelectItem>
                  {availableEventTypes.map((item) => (
                    <SelectItem key={item.eventType} value={item.eventType}>
                      <span className="font-mono text-xs">{item.eventType}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Rango de Fechas */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Rango Temporal
              </label>
              <Select
                value={datePreset}
                onValueChange={(val) => setDatePreset(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Cualquier fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Histórico completo</SelectItem>
                  <SelectItem value="24H">Últimas 24 horas</SelectItem>
                  <SelectItem value="7D">Últimos 7 días</SelectItem>
                  <SelectItem value="30D">Últimos 30 días</SelectItem>
                  <SelectItem value="CUSTOM">Personalizado...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda por Object ID */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                ID u Objeto Afectado
              </label>
              <div className="flex items-center w-full rounded-md border border-border bg-input/60 h-8 px-3 shadow-xs transition-all focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
                <input
                  type="text"
                  placeholder="Buscar clave o ID..."
                  value={objectIdFilter}
                  onChange={(e) => setObjectIdFilter(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none p-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                />
                {objectIdFilter && (
                  <button
                    type="button"
                    onClick={() => setObjectIdFilter("")}
                    className="text-muted-foreground hover:text-foreground shrink-0 ml-1 p-0.5 rounded hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rango de Fechas Personalizado (si está activo) */}
          {datePreset === "CUSTOM" && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Desde:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs justify-start font-normal"
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {customFrom ? format(customFrom, "PPP") : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customFrom}
                      onSelect={setCustomFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Hasta:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs justify-start font-normal"
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {customTo ? format(customTo, "PPP") : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customTo}
                      onSelect={setCustomTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Barra de Filtros Activos & Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-muted-foreground">
                Filtros activos aplicados
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                onClick={handleClearFilters}
              >
                <X className="h-3 w-3" />
                <span>Limpiar filtros</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Tabla de Eventos */}
      {isLoading ? (
        <div className="space-y-2 border border-border/70 rounded-xl p-4 bg-card/40">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 py-3 px-2 border-b border-border/40 last:border-0 animate-pulse"
            >
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-destructive/5 border-destructive/30 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-sm text-foreground mb-1">
            Error al consultar los eventos
          </h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInitialEvents()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </Card>
      ) : events.length === 0 ? (
        <Card className="bg-card/50 border-border py-12 sm:py-16">
          <CardContent className="flex flex-col items-center justify-center text-center p-0 pb-8 sm:pb-10">
            <div className="p-3.5 rounded-full bg-muted/60 mb-4">
              <History className="h-10 w-10 text-muted-foreground/70" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-1.5">
              No se encontraron eventos
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm px-4 leading-relaxed">
              {hasActiveFilters
                ? "No hay registros que coincidan con los filtros aplicados en este entorno."
                : "Aún no se han registrado eventos de auditoría en este entorno."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs mt-4"
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-semibold">
                    Fecha y Hora
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Tipo de Evento
                  </TableHead>
                  <TableHead className="w-[90px] text-xs font-semibold">
                    Producto
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Origen / Actor
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Objeto
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold">
                    Facturación
                  </TableHead>
                  <TableHead className="w-[80px] text-right text-xs font-semibold pr-4">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {events.map((event) => {
                  const isDeadlock = event.eventType === "lock.deadlock_detected";
                  const isFailure =
                    event.eventType.includes("fail") ||
                    event.eventType.includes("abort") ||
                    event.eventType.includes("expired") ||
                    isDeadlock;

                  const dateObj = new Date(event.occurredAt);

                  return (
                    <TableRow
                      key={event.id || event.eventId}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => handleOpenDetail(event)}
                    >
                      {/* Fecha y Hora */}
                      <TableCell className="font-mono text-xs py-2.5">
                        <div className="font-medium text-foreground">
                          {format(dateObj, "dd/MM/yyyy HH:mm:ss")}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(dateObj, { addSuffix: true })}
                        </div>
                      </TableCell>

                      {/* Tipo de Evento */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[11px] font-medium",
                              isDeadlock
                                ? "border-destructive text-destructive bg-destructive/10"
                                : isFailure
                                ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                                : event.product === "DLS"
                                ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
                                : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            )}
                          >
                            {event.eventType}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Producto */}
                      <TableCell className="py-2.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] uppercase font-semibold"
                        >
                          {event.product}
                        </Badge>
                      </TableCell>

                      {/* Origen / Actor */}
                      <TableCell className="py-2.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          {event.source === "SDK" ? (
                            <>
                              <Key className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[130px]">
                                {event.apiKeyPrefix || "SDK"}
                              </span>
                            </>
                          ) : event.source === "DASHBOARD" ? (
                            <>
                              <User className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                              <span className="text-[11px] text-foreground truncate max-w-[140px]">
                                {event.actorEmail || "Usuario"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Server className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-[11px] text-muted-foreground">
                                Sistema
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* Objeto Afectado */}
                      <TableCell className="py-2.5">
                        <span
                          className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted/60 text-foreground truncate inline-block max-w-[150px] sm:max-w-[180px]"
                          title={event.objectId || "-"}
                        >
                          {event.objectId || "-"}
                        </span>
                      </TableCell>

                      {/* Facturación */}
                      <TableCell className="py-2.5 text-xs">
                        {event.isBillable ? (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            +{event.billingUnits}u
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">
                            -
                          </span>
                        )}
                      </TableCell>

                      {/* Acción */}
                      <TableCell className="py-2.5 text-right pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(event);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación Manual: Botón "Cargar más eventos" */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            {hasNext && nextCursor ? (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="gap-2 px-6 h-9 text-xs font-medium border-border/80 hover:border-primary transition-all"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Cargando más eventos...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Cargar más eventos</span>
                  </>
                )}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground/60 py-2">
                Fin de los registros de auditoría ({events.length} eventos mostrados)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Drawer lateral de Detalle del Evento */}
      <EventDetailSheet
        event={selectedEvent}
        catalogItem={selectedCatalogItem}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onNavigateToManualControl={onNavigateToManualControl}
      />
    </div>
  );
}
