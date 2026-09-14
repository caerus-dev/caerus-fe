"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  SlidersHorizontal,
  Box,
  Lock,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
  Key,
  Database,
  Layers,
  FileJson,
  Eye,
  Trash2,
  PlusCircle,
  ExternalLink,
  Ban,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn, getEnvColors } from "@/lib/utils";
import {
  RemoteProductType,
  SreMethodType,
  DlsMethodType,
  ManualControlPreselect,
  LiveResourceResponse,
  LiveResourcesPageResponse,
  LiveHolderResponse,
  LiveHoldersPageResponse,
  LiveLockStatusResponse,
  LiveTransactionStatusResponse,
} from "@/types/telemetry";
import { format, formatDistanceToNow } from "date-fns";

interface ManualControlTabProps {
  appId: string;
  selectedEnv: string;
  currentEnvDetails?: any;
  myRole?: string;
  locks?: any[];
  templates?: any[];
  initialPreselect?: ManualControlPreselect | null;
  onClearPreselect?: () => void;
}

export function ManualControlTab({
  appId,
  selectedEnv,
  currentEnvDetails,
  myRole,
  locks = [],
  templates = [],
  initialPreselect,
  onClearPreselect,
}: ManualControlTabProps) {
  const envId = currentEnvDetails?.id;
  const isViewer = myRole === "VIEWER";
  const envColors = getEnvColors(selectedEnv, null, envId);

  // Helpers seguros para formatear fechas
  const formatDateSafe = (timestamp: any, pattern = "dd/MM HH:mm:ss") => {
    if (!timestamp) return "-";
    try {
      const num = Number(timestamp);
      const d = !isNaN(num) && num > 0 ? new Date(num) : new Date(timestamp);
      if (isNaN(d.getTime())) return "-";
      return format(d, pattern);
    } catch {
      return "-";
    }
  };

  const formatDistanceSafe = (timestamp: any) => {
    if (!timestamp) return "-";
    try {
      const num = Number(timestamp);
      const d = !isNaN(num) && num > 0 ? new Date(num) : new Date(timestamp);
      if (isNaN(d.getTime())) return "-";
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return "-";
    }
  };

  // Helper para verificar si un holder está en un estado final
  const isHolderFinalStatus = (status?: string, expiresAt?: number) => {
    const s = (status || "").toUpperCase();
    if (s === "CONFIRMED" || s === "RELEASED" || s === "EXPIRED") return true;
    if (expiresAt && expiresAt > 0) {
      const expMs = expiresAt > 1e11 ? expiresAt : expiresAt * 1000;
      if (expMs < Date.now()) return true;
    }
    return false;
  };

  // Producto activo: SRE o DLS inicializado desde initialPreselect si existe
  const [product, setProduct] = useState<RemoteProductType>(
    initialPreselect?.product || "SRE"
  );

  // Método activo por producto
  const [sreMethod, setSreMethod] = useState<SreMethodType>(
    initialPreselect?.product === "SRE" && initialPreselect?.method
      ? (initialPreselect.method as SreMethodType)
      : "GET_RESOURCES_BY_GROUP"
  );
  const [dlsMethod, setDlsMethod] = useState<DlsMethodType>(
    initialPreselect?.product === "DLS" && initialPreselect?.method
      ? (initialPreselect.method as DlsMethodType)
      : "GET_TRANSACTION_STATUS"
  );

  // Parámetros de formulario
  // SRE
  const [groupKey, setGroupKey] = useState<string>(
    initialPreselect?.params?.groupKey || ""
  );
  const [resourceKey, setResourceKey] = useState<string>(
    initialPreselect?.params?.resourceKey || ""
  );
  const [holderId, setHolderId] = useState<string>(
    initialPreselect?.params?.holderId || ""
  );
  const [srePage, setSrePage] = useState<number>(
    typeof initialPreselect?.params?.page === "number" ? initialPreselect.params.page : 0
  );
  const [srePageSize, setSrePageSize] = useState<number>(
    typeof initialPreselect?.params?.pageSize === "number" ? initialPreselect.params.pageSize : 10
  );
  const [sreSortDirection, setSreSortDirection] = useState<string>("");
  const [sreStatusFilter, setSreStatusFilter] = useState<string>("ALL");
  const [deltaAmount, setDeltaAmount] = useState<string>("");
  const [metadata, setMetadata] = useState<string>("");
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // DLS
  const [namespace, setNamespace] = useState<string>(
    initialPreselect?.params?.namespace || ""
  );
  const [lockKey, setLockKey] = useState<string>(
    initialPreselect?.params?.lockKey || ""
  );
  const [transactionId, setTransactionId] = useState<string>(
    initialPreselect?.params?.transactionId || ""
  );

  // Estado de ejecución
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [lastExecutedAt, setLastExecutedAt] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Modal de confirmación para acciones destructivas
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [pendingDangerousAction, setPendingDangerousAction] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  // Referencia para no re-ejecutar la misma preselección si el componente o su padre se re-renderiza
  const executedSignatureRef = useRef<string | null>(null);

  // Sincronizar o ejecutar preselección cuando se recibe o cambia initialPreselect
  useEffect(() => {
    if (!initialPreselect) return;

    const signature = `${initialPreselect.product}-${initialPreselect.method}-${JSON.stringify(initialPreselect.params || {})}-${initialPreselect.autoExecute}`;
    if (executedSignatureRef.current === signature) return;

    const currentProd = initialPreselect.product;
    setProduct(currentProd);

    if (currentProd === "SRE") {
      const m = initialPreselect.method as SreMethodType;
      if (m) setSreMethod(m);
      if (initialPreselect.params.groupKey !== undefined) setGroupKey(initialPreselect.params.groupKey);
      if (initialPreselect.params.resourceKey !== undefined) setResourceKey(initialPreselect.params.resourceKey);
      if (initialPreselect.params.holderId !== undefined) setHolderId(initialPreselect.params.holderId);
      if (typeof initialPreselect.params.page === "number") setSrePage(initialPreselect.params.page);
      if (typeof initialPreselect.params.pageSize === "number") setSrePageSize(initialPreselect.params.pageSize);
    } else {
      const m = initialPreselect.method as DlsMethodType;
      if (m) setDlsMethod(m);
      if (initialPreselect.params.namespace !== undefined) setNamespace(initialPreselect.params.namespace);
      if (initialPreselect.params.lockKey !== undefined) setLockKey(initialPreselect.params.lockKey);
      if (initialPreselect.params.transactionId !== undefined) setTransactionId(initialPreselect.params.transactionId);
    }

    if (initialPreselect.autoExecute) {
      if (envId) {
        executedSignatureRef.current = signature;
        executeCall({
          overrideProduct: initialPreselect.product,
          overrideMethod: initialPreselect.method,
          overrideParams: initialPreselect.params,
        });
      }
    } else {
      executedSignatureRef.current = signature;
    }
  }, [initialPreselect, envId]);

  // Ejecutor centralizado de llamadas
  const executeCall = async (options?: {
    overrideProduct?: RemoteProductType;
    overrideMethod?: string;
    overrideParams?: Record<string, any>;
    pageOverride?: number;
  }) => {
    if (!envId) {
      toast.error("No se encontró el identificador del entorno.");
      return;
    }

    const currentProduct = options?.overrideProduct || product;
    const currentMethod =
      options?.overrideMethod || (currentProduct === "SRE" ? sreMethod : dlsMethod);

    // Sincronizar inmediatamente el estado visual con el método y parámetros llamados
    if (options?.overrideProduct && options.overrideProduct !== product) {
      setProduct(options.overrideProduct);
    }
    if (currentProduct === "SRE" && options?.overrideMethod) {
      setSreMethod(options.overrideMethod as SreMethodType);
    } else if (currentProduct === "DLS" && options?.overrideMethod) {
      setDlsMethod(options.overrideMethod as DlsMethodType);
    }
    if (options?.overrideParams) {
      if (options.overrideParams.resourceKey !== undefined) setResourceKey(options.overrideParams.resourceKey);
      if (options.overrideParams.groupKey !== undefined) setGroupKey(options.overrideParams.groupKey);
      if (options.overrideParams.holderId !== undefined) setHolderId(options.overrideParams.holderId);
      if (options.overrideParams.namespace !== undefined) setNamespace(options.overrideParams.namespace);
      if (options.overrideParams.lockKey !== undefined) setLockKey(options.overrideParams.lockKey);
      if (options.overrideParams.transactionId !== undefined) setTransactionId(options.overrideParams.transactionId);
    }

    const currentPage =
      typeof options?.pageOverride === "number" ? options.pageOverride : srePage;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setStatusCode(null);
    setExecutionTimeMs(null);

    const startTime = performance.now();

    try {
      let url = "";
      let fetchOptions: RequestInit = { method: "GET" };

      if (currentProduct === "SRE") {
        const curResourceKey = options?.overrideParams?.resourceKey || resourceKey;
        const curGroupKey = options?.overrideParams?.groupKey || groupKey;
        const curHolderId = options?.overrideParams?.holderId || holderId;

        switch (currentMethod) {
          case "GET_RESOURCES_BY_GROUP": {
            if (!curGroupKey.trim()) {
              throw new Error("El campo 'Group Key' es obligatorio.");
            }
            const q = new URLSearchParams({
              groupKey: curGroupKey.trim(),
              page: String(currentPage),
              pageSize: String(srePageSize || 10),
            });
            url = `/api/environments/${envId}/sre/resources?${q.toString()}`;
            break;
          }
          case "GET_RESOURCE": {
            if (!curResourceKey.trim()) {
              throw new Error("El campo 'Resource Key' es obligatorio.");
            }
            url = `/api/environments/${envId}/sre/resources/${encodeURIComponent(curResourceKey.trim())}`;
            break;
          }
          case "GET_RESOURCE_HOLDERS": {
            if (!curResourceKey.trim()) {
              throw new Error("El campo 'Resource Key' es obligatorio.");
            }
            const q = new URLSearchParams({
              page: String(currentPage),
              pageSize: String(srePageSize || 10),
            });
            if (sreSortDirection) q.set("sortDirection", sreSortDirection);
            if (sreStatusFilter && sreStatusFilter !== "ALL") q.set("statusFilter", sreStatusFilter);
            url = `/api/environments/${envId}/sre/resources/${encodeURIComponent(curResourceKey.trim())}/holders?${q.toString()}`;
            break;
          }
          case "GET_HOLDER": {
            if (!curHolderId.trim()) {
              throw new Error("El campo 'Holder ID' es obligatorio.");
            }
            url = `/api/environments/${envId}/sre/holders/${encodeURIComponent(curHolderId.trim())}`;
            break;
          }
          case "RELEASE_HOLDER": {
            if (!curHolderId.trim()) {
              throw new Error("El campo 'Holder ID' es obligatorio.");
            }
            url = `/api/environments/${envId}/sre/holders/${encodeURIComponent(curHolderId.trim())}/release`;
            fetchOptions = { method: "POST" };
            break;
          }
          case "UPDATE_RESOURCE": {
            if (!curResourceKey.trim()) {
              throw new Error("El campo 'Resource Key' es obligatorio.");
            }
            const deltaNum = Number(deltaAmount);
            if (isNaN(deltaNum) || deltaNum === 0) {
              throw new Error("El campo 'Delta Amount' debe ser un número entero distinto de cero (+ o -).");
            }
            url = `/api/environments/${envId}/sre/resources/${encodeURIComponent(curResourceKey.trim())}`;
            fetchOptions = {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                deltaAmount: deltaNum,
                groupKey: curGroupKey.trim() || undefined,
                metadata: metadata.trim() || undefined,
                idempotencyKey: idempotencyKey.trim() || undefined,
              }),
            };
            break;
          }
        }
      } else {
        // DLS
        const curNamespace = options?.overrideParams?.namespace || namespace;
        const curLockKey = options?.overrideParams?.lockKey || lockKey;
        const curTxId = options?.overrideParams?.transactionId || transactionId;

        switch (currentMethod) {
          case "GET_LOCK_STATUS": {
            if (!curNamespace.trim()) {
              throw new Error("El campo 'Namespace' es obligatorio.");
            }
            if (!curLockKey.trim()) {
              throw new Error("El campo 'Lock Key' es obligatorio.");
            }
            url = `/api/environments/${envId}/dls/namespaces/${encodeURIComponent(curNamespace.trim())}/locks/${encodeURIComponent(curLockKey.trim())}`;
            break;
          }
          case "GET_TRANSACTION_STATUS": {
            if (!curTxId.trim()) {
              throw new Error("El campo 'Transaction ID' es obligatorio.");
            }
            url = `/api/environments/${envId}/dls/transactions/${encodeURIComponent(curTxId.trim())}`;
            break;
          }
          case "ABORT_TRANSACTION": {
            if (!curTxId.trim()) {
              throw new Error("El campo 'Transaction ID' es obligatorio.");
            }
            url = `/api/environments/${envId}/dls/transactions/${encodeURIComponent(curTxId.trim())}/abort`;
            fetchOptions = { method: "POST" };
            break;
          }
        }
      }

      const res = await fetch(url, fetchOptions);
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setExecutionTimeMs(elapsed);
      setStatusCode(res.status);
      setLastExecutedAt(new Date());

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        let errText = errJson.error || errJson.message || `Error HTTP ${res.status}`;
        if (typeof errText === "string" && errText.includes("fieldErrors")) {
          try {
            const parsed = JSON.parse(errText);
            if (parsed.fieldErrors?.length) {
              errText = parsed.fieldErrors.map((f: any) => f.message).join(". ");
            }
          } catch {}
        }
        setErrorMessage(errText);
        toast.error(`Error en la llamada: ${errText}`);
      } else {
        if (res.status === 204) {
          setResult({ success: true, message: "Operación ejecutada con éxito (204 No Content)" });
          toast.success("Operación ejecutada exitosamente.");
        } else {
          const data = await res.json();
          setResult(data);
          toast.success("Consulta completada.");
        }
      }
    } catch (err: any) {
      const endTime = performance.now();
      setExecutionTimeMs(Math.round(endTime - startTime));
      setErrorMessage(err.message || "Error al ejecutar la petición");
      toast.error(err.message || "Error de red o conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // Acciones con confirmación modal
  const handleRequestDangerousAction = (
    title: string,
    description: string,
    action: () => Promise<void>
  ) => {
    setPendingDangerousAction({ title, description, action });
    setConfirmModalOpen(true);
  };

  const confirmAndExecute = async () => {
    if (pendingDangerousAction) {
      const act = pendingDangerousAction.action;
      setConfirmModalOpen(false);
      setPendingDangerousAction(null);
      await act();
    }
  };

  // Atajos interactivos desde tablas de resultados
  const handleInspectHoldersForResource = (resKey: string) => {
    setResourceKey(resKey);
    setSreMethod("GET_RESOURCE_HOLDERS");
    setSrePage(0);
    executeCall({
      overrideProduct: "SRE",
      overrideMethod: "GET_RESOURCE_HOLDERS",
      overrideParams: { resourceKey: resKey },
      pageOverride: 0,
    });
  };

  const handlePrepareStockUpdate = (res: LiveResourceResponse | string, currentGroupKey?: string) => {
    let targetRes: any = null;
    let targetKey = "";
    let targetGroupKey = currentGroupKey;

    if (typeof res === "string") {
      targetKey = res;
      if (result?.resources && Array.isArray(result.resources)) {
        targetRes = result.resources.find((r: any) => r.key === res) || null;
      } else if (result?.key === res) {
        targetRes = result;
      }
    } else if (res && typeof res === "object") {
      targetRes = res;
      targetKey = res.key;
      targetGroupKey = res.groupKey || currentGroupKey;
    }

    setResourceKey(targetKey);
    if (targetGroupKey) {
      setGroupKey(targetGroupKey);
    }
    if (targetRes) {
      setResult(targetRes);
      if (targetRes.metadata) {
        setMetadata(targetRes.metadata);
      }
    }
    setSreMethod("UPDATE_RESOURCE");
  };

  const handleForceReleaseHolder = (hId: string) => {
    handleRequestDangerousAction(
      "Liberar Holder Forzosamente",
      `¿Estás seguro de que deseas forzar la liberación del holder '${hId}'? Esta acción liberará la porción del recurso retenido de forma inmediata en el motor SRE.`,
      async () => {
        setHolderId(hId);
        setSreMethod("RELEASE_HOLDER");
        await executeCall({
          overrideProduct: "SRE",
          overrideMethod: "RELEASE_HOLDER",
          overrideParams: { holderId: hId },
        });
      }
    );
  };

  const handleForceAbortTransaction = (txId: string) => {
    handleRequestDangerousAction(
      "Abortar Transacción Distribuida",
      `¿Estás seguro de abortar la transacción '${txId}'? Todos los locks distribuidos adquiridos en esta transacción serán liberados de inmediato en el motor DLS.`,
      async () => {
        setTransactionId(txId);
        setDlsMethod("ABORT_TRANSACTION");
        await executeCall({
          overrideProduct: "DLS",
          overrideMethod: "ABORT_TRANSACTION",
          overrideParams: { transactionId: txId },
        });
        // Si estábamos visualizando el status, refrescar status
        if (dlsMethod === "GET_TRANSACTION_STATUS") {
          setTimeout(() => {
            executeCall({
              overrideProduct: "DLS",
              overrideMethod: "GET_TRANSACTION_STATUS",
              overrideParams: { transactionId: txId },
            });
          }, 800);
        }
      }
    );
  };

  // Copiar JSON
  const copyResultJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    toast.success("JSON copiado al portapapeles");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const isCurrentActionDangerous = useMemo(() => {
    if (product === "SRE") {
      return sreMethod === "RELEASE_HOLDER" || sreMethod === "UPDATE_RESOURCE";
    }
    return dlsMethod === "ABORT_TRANSACTION";
  }, [product, sreMethod, dlsMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentActionDangerous) {
      if (product === "SRE" && sreMethod === "RELEASE_HOLDER") {
        handleRequestDangerousAction(
          "Liberar Holder Forzosamente",
          `¿Estás seguro de forzar la liberación del holder '${holderId}'?`,
          () => executeCall()
        );
      } else if (product === "SRE" && sreMethod === "UPDATE_RESOURCE") {
        handleRequestDangerousAction(
          "Actualizar Capacidad / Metadatos de Recurso",
          `¿Estás seguro de modificar el recurso '${resourceKey}' con delta ${deltaAmount}? Esta modificación impactará la capacidad en vivo.`,
          () => executeCall()
        );
      } else if (product === "DLS" && dlsMethod === "ABORT_TRANSACTION") {
        handleRequestDangerousAction(
          "Abortar Transacción Distribuida",
          `¿Estás seguro de abortar la transacción '${transactionId}'? Se liberarán todos sus bloqueos.`,
          () => executeCall()
        );
      }
    } else {
      executeCall();
    }
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full py-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Control Manual y Telemetría en Vivo
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ejecuta operaciones directamente en el motor de concurrencia en{" "}
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

        {/* Selector de Producto */}
        <div className="flex items-center p-1 bg-secondary/80 rounded-lg border border-border/60 self-start sm:self-auto">
          <Button
            type="button"
            variant={product === "SRE" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs font-semibold gap-1.5 px-3 transition-all",
              product === "SRE" ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              setProduct("SRE");
              setResult(null);
              setErrorMessage(null);
            }}
          >
            <Box className="h-3.5 w-3.5" />
            <span>SRE (Recursos)</span>
          </Button>

          <Button
            type="button"
            variant={product === "DLS" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs font-semibold gap-1.5 px-3 transition-all",
              product === "DLS" ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              setProduct("DLS");
              setResult(null);
              setErrorMessage(null);
            }}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>DLS (Locks)</span>
          </Button>
        </div>
      </div>

      {/* Grid: Formulario de Control a la izquierda / Resultados a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Panel Izquierdo: Configuración y Ejecución (5 cols) */}
        <Card className="lg:col-span-5 bg-card/60 border-border shadow-xs overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Configuración de Operación</span>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {product}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Selecciona la operación y define los parámetros requeridos.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Selector de Método / Endpoint */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  Operación
                </label>
                {product === "SRE" ? (
                  <Select
                    value={sreMethod}
                    onValueChange={(val) => {
                      setSreMethod(val as SreMethodType);
                      setResult(null);
                      setErrorMessage(null);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs w-full">
                      <SelectValue placeholder="Selecciona una operación SRE" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET_RESOURCES_BY_GROUP">
                        Listar recursos por Group Key
                      </SelectItem>
                      <SelectItem value="GET_RESOURCE">
                        Consultar recurso individual
                      </SelectItem>
                      <SelectItem value="GET_RESOURCE_HOLDERS">
                        Consultar holders de recurso
                      </SelectItem>
                      <SelectItem value="GET_HOLDER">
                        Consultar detalle de holder
                      </SelectItem>
                      <SelectItem value="RELEASE_HOLDER" className="text-destructive focus:text-destructive">
                        Forzar liberación de holder 🚨
                      </SelectItem>
                      <SelectItem value="UPDATE_RESOURCE" className="text-amber-500 focus:text-amber-500">
                        Modificar stock / metadatos ⚠️
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={dlsMethod}
                    onValueChange={(val) => {
                      setDlsMethod(val as DlsMethodType);
                      setResult(null);
                      setErrorMessage(null);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs w-full">
                      <SelectValue placeholder="Selecciona una operación DLS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET_TRANSACTION_STATUS">
                        Estado en vivo de transacción
                      </SelectItem>
                      <SelectItem value="GET_LOCK_STATUS">
                        Estado en vivo de lock
                      </SelectItem>
                      <SelectItem value="ABORT_TRANSACTION" className="text-destructive focus:text-destructive">
                        Abortar transacción distribuida 🚨
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Formulario Dinámico según producto y método */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                {product === "SRE" && (
                  <>
                    {(sreMethod === "GET_RESOURCES_BY_GROUP" || sreMethod === "UPDATE_RESOURCE") && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                          <span>Group Key {sreMethod === "GET_RESOURCES_BY_GROUP" && <span className="text-destructive">*</span>}</span>
                          <span className="text-[10px] text-muted-foreground/60">Agrupador de recursos</span>
                        </label>
                        <Input
                          placeholder="ej. payment-gateways, database-pool"
                          value={groupKey}
                          onChange={(e) => setGroupKey(e.target.value)}
                          className="h-8 text-xs font-mono"
                          required={sreMethod === "GET_RESOURCES_BY_GROUP"}
                        />
                      </div>
                    )}

                    {(sreMethod === "GET_RESOURCE" ||
                      sreMethod === "GET_RESOURCE_HOLDERS" ||
                      sreMethod === "UPDATE_RESOURCE") && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                          <span>Resource Key <span className="text-destructive">*</span></span>
                          <span className="text-[10px] text-muted-foreground/60">Clave única del recurso</span>
                        </label>
                        <Input
                          placeholder="ej. stripe-payments, seat-vip-12"
                          value={resourceKey}
                          onChange={(e) => setResourceKey(e.target.value)}
                          className="h-8 text-xs font-mono"
                          required
                        />
                      </div>
                    )}

                    {(sreMethod === "GET_HOLDER" || sreMethod === "RELEASE_HOLDER") && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                          <span>Resource Holder ID <span className="text-destructive">*</span></span>
                          <span className="text-[10px] text-muted-foreground/60">Identificador del proceso/holder</span>
                        </label>
                        <Input
                          placeholder="ej. 550e8400-e29b-41d4-a716-446655440000"
                          value={holderId}
                          onChange={(e) => setHolderId(e.target.value)}
                          className="h-8 text-xs font-mono"
                          required
                        />
                      </div>
                    )}

                    {sreMethod === "UPDATE_RESOURCE" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                            <span>Delta Amount (Incremento / Decremento) <span className="text-destructive">*</span></span>
                            <span className="text-[10px] text-amber-400 font-mono">ej. +5 o -3</span>
                          </label>
                          <Input
                            type="number"
                            placeholder="ej. 10 para sumar cupos, -5 para restar"
                            value={deltaAmount}
                            onChange={(e) => setDeltaAmount(e.target.value)}
                            className="h-8 text-xs font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Metadatos JSON (Opcional)
                          </label>
                          <Input
                            placeholder='ej. {"region": "us-east"}'
                            value={metadata}
                            onChange={(e) => setMetadata(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Idempotency Key (Opcional)
                          </label>
                          <Input
                            placeholder="ej. update-token-12345"
                            value={idempotencyKey}
                            onChange={(e) => setIdempotencyKey(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </>
                    )}

                    {/* Parámetros de paginación y filtros para endpoints paginados */}
                    {(sreMethod === "GET_RESOURCES_BY_GROUP" || sreMethod === "GET_RESOURCE_HOLDERS") && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">
                            Página (0-indexed)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={srePage}
                            onChange={(e) => setSrePage(Math.max(0, parseInt(e.target.value) || 0))}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">
                            Límite por Página
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={srePageSize}
                            onChange={(e) => setSrePageSize(Math.max(1, parseInt(e.target.value) || 10))}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {sreMethod === "GET_RESOURCE_HOLDERS" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">
                            Filtro por Estado
                          </label>
                          <Select value={sreStatusFilter} onValueChange={setSreStatusFilter}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Todos los estados</SelectItem>
                              <SelectItem value="CONFIRMED">CONFIRMED (Tomado)</SelectItem>
                              <SelectItem value="PENDING">PENDING (En cola)</SelectItem>
                              <SelectItem value="RELEASED">RELEASED (Liberado)</SelectItem>
                              <SelectItem value="EXPIRED">EXPIRED (Expirado)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">
                            Orden (Fecha)
                          </label>
                          <Select value={sreSortDirection} onValueChange={setSreSortDirection}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Por defecto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DEFAULT">Por defecto</SelectItem>
                              <SelectItem value="ASC">Más antiguos primero</SelectItem>
                              <SelectItem value="DESC">Más recientes primero</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {product === "DLS" && (
                  <>
                    {(dlsMethod === "GET_TRANSACTION_STATUS" || dlsMethod === "ABORT_TRANSACTION") && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                          <span>Transaction ID <span className="text-destructive">*</span></span>
                          <span className="text-[10px] text-muted-foreground/60">ID de transacción distribuida</span>
                        </label>
                        <Input
                          placeholder="ej. tx-4d89fa31-89ec-4b92-9a74"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="h-8 text-xs font-mono"
                          required
                        />
                      </div>
                    )}

                    {dlsMethod === "GET_LOCK_STATUS" && (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Namespace <span className="text-destructive">*</span>
                            </label>
                            {locks.length > 0 && (
                              <span className="text-[10px] text-primary">
                                {locks.length} namespaces configurados
                              </span>
                            )}
                          </div>
                          {locks.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={locks.some((l) => l.namespace === namespace) ? namespace : "CUSTOM"}
                                onValueChange={(val) => {
                                  if (val !== "CUSTOM") setNamespace(val);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs font-mono">
                                  <SelectValue placeholder="Selecciona namespace..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {locks.map((l: any) => (
                                    <SelectItem key={l.id} value={l.namespace}>
                                      <span className="font-mono">{l.namespace}</span>
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="CUSTOM">Otro / Personalizado...</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="o escribe namespace..."
                                value={namespace}
                                onChange={(e) => setNamespace(e.target.value)}
                                className="h-8 text-xs font-mono"
                                required
                              />
                            </div>
                          ) : (
                            <Input
                              placeholder="ej. orders-checkout, billing-locks"
                              value={namespace}
                              onChange={(e) => setNamespace(e.target.value)}
                              className="h-8 text-xs font-mono"
                              required
                            />
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                            <span>Lock Key <span className="text-destructive">*</span></span>
                            <span className="text-[10px] text-muted-foreground/60">Clave del recurso bloqueado</span>
                          </label>
                          <Input
                            placeholder="ej. order-99214, user-wallet-881"
                            value={lockKey}
                            onChange={(e) => setLockKey(e.target.value)}
                            className="h-8 text-xs font-mono"
                            required
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Botón de Ejecución */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || isViewer}
                  variant={isCurrentActionDangerous ? "destructive" : "default"}
                  className="w-full h-9 gap-2 text-xs font-semibold"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Ejecutando operación...</span>
                    </>
                  ) : isCurrentActionDangerous ? (
                    <>
                      <ShieldAlert className="h-4 w-4" />
                      <span>Ejecutar Acción Crítica</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Ejecutar Consulta</span>
                    </>
                  )}
                </Button>
                {isViewer && (
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                    Modo solo lectura: Tu rol de VIEWER no permite ejecutar acciones de control.
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Panel Derecho: Visualizador de Resultados (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Barra de Estado y Metadatos de la Petición */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 bg-card/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-muted-foreground font-medium">Estado:</span>
              {isLoading ? (
                <Badge variant="outline" className="border-primary/40 text-primary gap-1 py-0 px-2 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>En progreso...</span>
                </Badge>
              ) : statusCode !== null ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[11px] font-semibold py-0 px-2",
                    statusCode >= 200 && statusCode < 300
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-destructive/40 text-destructive bg-destructive/10"
                  )}
                >
                  {statusCode >= 200 && statusCode < 300 ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1 inline" />
                  )}
                  {statusCode} {statusCode === 200 ? "OK" : statusCode === 204 ? "NO CONTENT" : statusCode === 404 ? "NOT FOUND" : ""}
                </Badge>
              ) : (
                <span className="text-muted-foreground/60 italic">Listo para ejecutar</span>
              )}

              {executionTimeMs !== null && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  • {executionTimeMs}ms
                </span>
              )}

              {lastExecutedAt && (
                <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                  • {formatDateSafe(lastExecutedAt, "HH:mm:ss")}
                </span>
              )}
            </div>

            {/* Toggle Vista Visual / JSON */}
            {result && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant={viewMode === "visual" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 text-[11px] px-2 py-0"
                  onClick={() => setViewMode("visual")}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Visual
                </Button>
                <Button
                  variant={viewMode === "json" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 text-[11px] px-2 py-0"
                  onClick={() => setViewMode("json")}
                >
                  <FileJson className="h-3 w-3 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] px-2 py-0 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={copyResultJson}
                >
                  {copiedJson ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedJson ? "Copiado" : "Copiar"}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Contenedor del Resultado */}
          {errorMessage && (
            <Card className="bg-destructive/5 border-destructive/30 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-semibold text-destructive">
                    La petición retornó un error
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed break-words font-mono bg-background/50 p-2 rounded border border-destructive/20">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!isLoading && !result && !errorMessage && (
            <Card className="bg-card/40 border-dashed border-border py-12 text-center">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <div className="p-3 rounded-full bg-muted/50 mb-3">
                  <Radio className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  Consola de Telemetría Lista
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm px-4">
                  Completa los parámetros en el panel izquierdo y pulsa &quot;Ejecutar Consulta&quot; para inspeccionar el estado en tiempo real.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Renderizado de Resultados: Modo JSON */}
          {result && viewMode === "json" && (
            <div className="rounded-xl border border-border/80 bg-zinc-950 dark:bg-black p-4 font-mono text-xs overflow-x-auto max-h-[600px] shadow-xs">
              <pre className="text-emerald-400 leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Renderizado de Resultados: Modo Visual */}
          {result && viewMode === "visual" && (
            <div className="space-y-3">
              {/* CASO 1: SRE - Lista de Recursos por Group Key */}
              {product === "SRE" && (sreMethod === "GET_RESOURCES_BY_GROUP" || (result && Array.isArray(result.resources))) && (
                <Card className="bg-card/60 border-border overflow-hidden">
                  <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-semibold text-foreground">
                        Recursos en Group Key: <span className="font-mono text-primary">{groupKey || result?.resources?.[0]?.groupKey || "-"}</span>
                      </CardTitle>
                      <CardDescription className="text-[11px] text-muted-foreground">
                        {result.resources?.length || 0} recursos encontrados en esta página
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {result.resources && result.resources.length > 0 ? (
                      <div className="divide-y divide-border/40">
                        {result.resources.map((res: LiveResourceResponse) => (
                          <div
                            key={res.resourceId || res.key}
                            className="p-3.5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-foreground text-xs">
                                  {res.key}
                                </span>
                                {res.groupKey && (
                                  <Badge variant="secondary" className="font-mono text-[10px] py-0">
                                    {res.groupKey}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground text-[11px] flex-wrap">
                                <span>
                                  Disponible:{" "}
                                  <span className="font-bold text-emerald-400 font-mono">
                                    {res.availableAmount}
                                  </span>
                                </span>
                                <span>•</span>
                                <span>
                                  En cola:{" "}
                                  <span className={cn("font-bold font-mono", res.pendingCount > 0 ? "text-amber-400" : "text-muted-foreground")}>
                                    {res.pendingCount}
                                  </span>
                                </span>
                                {res.updatedAtMs > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Act: {formatDistanceSafe(res.updatedAtMs)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleInspectHoldersForResource(res.key)}
                              >
                                <Eye className="h-3 w-3" />
                                <span>Ver Holders</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 text-primary hover:text-primary"
                                onClick={() => handlePrepareStockUpdate(res)}
                              >
                                <PlusCircle className="h-3 w-3" />
                                <span>Modificar Stock</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground text-xs">
                        No se encontraron recursos para el groupKey especificado.
                      </div>
                    )}

                    {/* Barra de Paginación gRPC */}
                    <div className="p-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">
                        Página actual: <strong className="text-foreground">{srePage + 1}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          disabled={srePage === 0 || isLoading}
                          onClick={() => {
                            const prev = Math.max(0, srePage - 1);
                            setSrePage(prev);
                            executeCall({ pageOverride: prev });
                          }}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Anterior</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          disabled={!result.hasNextPage || isLoading}
                          onClick={() => {
                            const next = srePage + 1;
                            setSrePage(next);
                            executeCall({ pageOverride: next });
                          }}
                        >
                          <span>Siguiente</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CASO 2: SRE - Detalle de Recurso Individual */}
              {product === "SRE" && (sreMethod === "GET_RESOURCE" || sreMethod === "UPDATE_RESOURCE" || (result && typeof result.availableAmount === "number" && !Array.isArray(result.resources))) && (
                <Card className="bg-card/60 border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border/50 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        {sreMethod === "UPDATE_RESOURCE" ? "Modificar Recurso Compartido" : "Recurso Compartido"}
                      </span>
                      <h3 className="font-mono text-base font-bold text-foreground">
                        {result.key || resourceKey}
                      </h3>
                      {result.groupKey && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Group Key: <span className="font-mono text-primary">{result.groupKey}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleInspectHoldersForResource(result.key || resourceKey)}
                      >
                        <Eye className="h-3 w-3" />
                        <span>Ver Holders</span>
                      </Button>
                      {sreMethod === "GET_RESOURCE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-primary hover:text-primary"
                          onClick={() => handlePrepareStockUpdate(result)}
                        >
                          <PlusCircle className="h-3 w-3" />
                          <span>Modificar Stock</span>
                        </Button>
                      )}
                      {sreMethod === "UPDATE_RESOURCE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setSreMethod("GET_RESOURCE");
                            executeCall({
                              overrideProduct: "SRE",
                              overrideMethod: "GET_RESOURCE",
                              overrideParams: { resourceKey: result.key || resourceKey },
                            });
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Consultar en Vivo</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Stock Disponible
                      </span>
                      <p className="text-xl font-bold font-mono text-emerald-400">
                        {result.availableAmount ?? "-"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Peticiones en Cola
                      </span>
                      <p className={cn("text-xl font-bold font-mono", result.pendingCount > 0 ? "text-amber-400" : "text-foreground")}>
                        {result.pendingCount ?? 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Template ID
                      </span>
                      <p className="font-mono text-xs text-muted-foreground truncate" title={result.templateId}>
                        {result.templateId || "Dinámico"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Última Actualización
                      </span>
                      <p className="text-xs text-foreground font-mono">
                        {formatDateSafe(result.updatedAtMs)}
                      </p>
                    </div>
                  </div>

                  {result.metadata && (
                    <div className="p-3 rounded-lg border border-border/60 bg-background/40 text-xs">
                      <span className="font-semibold text-muted-foreground block mb-1">
                        Metadatos:
                      </span>
                      <pre className="font-mono text-[11px] text-foreground/90 whitespace-pre-wrap break-all">
                        {result.metadata}
                      </pre>
                    </div>
                  )}
                </Card>
              )}

              {/* CASO 3: SRE - Holders de un Recurso */}
              {product === "SRE" && (sreMethod === "GET_RESOURCE_HOLDERS" || (result && Array.isArray(result.holders))) && (
                <Card className="bg-card/60 border-border overflow-hidden">
                  <CardHeader className="p-3.5 pb-2 border-b border-border/40 flex flex-row items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xs font-semibold text-foreground">
                        Holders Activos para: <span className="font-mono text-primary">{resourceKey}</span>
                      </CardTitle>
                      <CardDescription className="text-[11px] text-muted-foreground">
                        {result.holders?.length || 0} holders en esta página
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setSreMethod("GET_RESOURCE");
                          executeCall({
                            overrideProduct: "SRE",
                            overrideMethod: "GET_RESOURCE",
                            overrideParams: { resourceKey },
                          });
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        <span>Ver Recurso</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 text-primary hover:text-primary"
                        onClick={() => handlePrepareStockUpdate(resourceKey)}
                      >
                        <PlusCircle className="h-3 w-3" />
                        <span>Modificar Stock</span>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {result.holders && result.holders.length > 0 ? (
                      <div className="divide-y divide-border/40">
                        {result.holders.map((h: LiveHolderResponse) => {
                          const isConfirmed = h.status === "CONFIRMED";
                          const isPending = h.status === "PENDING";
                          const expMs = h.expiresAt > 0 ? (h.expiresAt > 1e11 ? h.expiresAt : h.expiresAt * 1000) : null;
                          const isExpired = expMs ? expMs < Date.now() : false;

                          return (
                            <div
                              key={h.holderId}
                              className="p-3.5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "font-mono text-[10px] font-semibold py-0",
                                      isConfirmed
                                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                        : isPending
                                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                        : "border-muted-foreground/40 text-muted-foreground"
                                    )}
                                  >
                                    {h.status}
                                  </Badge>
                                  <span className="font-mono text-xs font-bold text-foreground">
                                    Cantidad: {h.amount}
                                  </span>
                                  {expMs && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {isExpired
                                        ? "Expirado"
                                        : `Expira ${formatDistanceSafe(expMs)}`}
                                    </span>
                                  )}
                                </div>
                                <p className="font-mono text-[11px] text-muted-foreground truncate max-w-md" title={h.holderId}>
                                  ID: {h.holderId}
                                </p>
                              </div>

                              {!isHolderFinalStatus(h.status, h.expiresAt) && (
                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                    disabled={isViewer}
                                    onClick={() => handleForceReleaseHolder(h.holderId)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Liberar Holder</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground text-xs">
                        No hay holders activos para este recurso.
                      </div>
                    )}

                    {/* Barra de Paginación */}
                    <div className="p-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">
                        Página actual: <strong className="text-foreground">{srePage + 1}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          disabled={srePage === 0 || isLoading}
                          onClick={() => {
                            const prev = Math.max(0, srePage - 1);
                            setSrePage(prev);
                            executeCall({ pageOverride: prev });
                          }}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Anterior</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          disabled={!result.hasNextPage || isLoading}
                          onClick={() => {
                            const next = srePage + 1;
                            setSrePage(next);
                            executeCall({ pageOverride: next });
                          }}
                        >
                          <span>Siguiente</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CASO 4: SRE - Detalle de Holder Individual */}
              {product === "SRE" && (sreMethod === "GET_HOLDER" || (result && result.holderId && typeof result.amount === "number" && !Array.isArray(result.holders))) && (
                <Card className="bg-card/60 border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border/50 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Detalle de Resource Holder
                      </span>
                      <h3 className="font-mono text-sm font-bold text-foreground break-all">
                        {result.holderId || holderId}
                      </h3>
                      {result.resourceId && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Resource ID: <span className="font-mono text-foreground">{result.resourceId}</span>
                        </p>
                      )}
                    </div>

                    {!isHolderFinalStatus(result.status, result.expiresAt) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        disabled={isViewer}
                        onClick={() => handleForceReleaseHolder(result.holderId || holderId)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Liberar este Holder</span>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Estado
                      </span>
                      <div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-xs font-semibold py-0.5",
                            result.status === "CONFIRMED"
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : result.status === "PENDING"
                              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                              : "border-muted-foreground/40 text-muted-foreground"
                          )}
                        >
                          {result.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Cantidad Asignada
                      </span>
                      <p className="text-lg font-bold font-mono text-foreground">
                        {result.amount}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Expiración
                      </span>
                      <p className="text-xs text-foreground font-mono">
                        {result.expiresAt > 0
                          ? formatDateSafe(result.expiresAt > 1e11 ? result.expiresAt : result.expiresAt * 1000)
                          : "Sin expiración"}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* CASO 5: DLS - Estado de un Lock */}
              {product === "DLS" && (dlsMethod === "GET_LOCK_STATUS" || (result && typeof result.isHeld === "boolean" && Array.isArray(result.activeHolders))) && (
                <Card className="bg-card/60 border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border/50 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Estado del Lock Distribuido
                      </span>
                      <h3 className="font-mono text-base font-bold text-foreground">
                        {namespace} / {lockKey}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-xs font-bold px-2.5 py-1",
                          result.isHeld
                            ? "border-destructive/50 text-destructive bg-destructive/10"
                            : "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                        )}
                      >
                        {result.isHeld ? "BLOQUEO ACTIVO (TOMADO)" : "LIBRE (SIN BLOQUEO)"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Modo Actual
                      </span>
                      <p className="font-mono text-xs font-bold text-foreground">
                        {result.currentMode || "NONE"}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Holders Activos
                      </span>
                      <p className="font-mono text-lg font-bold text-foreground">
                        {result.activeHolders?.length || 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Cola de Espera
                      </span>
                      <p className={cn("font-mono text-lg font-bold", result.pendingQueueSize > 0 ? "text-amber-400" : "text-muted-foreground")}>
                        {result.pendingQueueSize} en espera
                      </p>
                    </div>
                  </div>

                  {result.activeHolders && result.activeHolders.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Holders Actuales del Bloqueo:
                      </span>
                      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden bg-background/40">
                        {result.activeHolders.map((h: any, idx: number) => {
                          const expMs = h.expiresAt > 0 ? (h.expiresAt > 1e11 ? h.expiresAt : h.expiresAt * 1000) : null;
                          return (
                            <div key={idx} className="p-2.5 flex items-center justify-between gap-2 text-xs font-mono">
                              <span className="truncate max-w-[200px] text-foreground">
                                Lock ID: {h.lockId}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>Fencing Token: <strong>{h.fencingToken}</strong></span>
                                {expMs && (
                                  <span>• Expira: {formatDistanceSafe(expMs)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* CASO 6: DLS - Estado de Transacción Distribuida */}
              {product === "DLS" && (dlsMethod === "GET_TRANSACTION_STATUS" || (result && result.status && Array.isArray(result.locks))) && (
                <Card className="bg-card/60 border-border p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border/50 pb-3">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Transacción Distribuida
                      </span>
                      <h3 className="font-mono text-sm font-bold text-foreground break-all">
                        {transactionId}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-xs font-bold px-2.5 py-1",
                          result.status === "ACTIVE"
                            ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/15 animate-pulse"
                            : result.status === "COMMITTED"
                            ? "border-blue-500/60 text-blue-400 bg-blue-500/10"
                            : result.status === "ABORTED"
                            ? "border-destructive/60 text-destructive bg-destructive/10"
                            : "border-amber-500/60 text-amber-400 bg-amber-500/10"
                        )}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Botón Rojo Grande para Abortar si la transacción está ACTIVA */}
                  {result.status === "ACTIVE" && (
                    <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          Transacción Activa en el Motor
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          La transacción retiene recursos actualmente. Si está bloqueada o en interbloqueo, puedes abortarla.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isViewer || isLoading}
                        className="h-8 px-4 text-xs font-bold gap-1.5 shrink-0 shadow-sm"
                        onClick={() => handleForceAbortTransaction(transactionId)}
                      >
                        <Ban className="h-4 w-4" />
                        <span>Abortar Transacción</span>
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" />
                        Expiración (TTL)
                      </span>
                      <p className="font-mono text-xs text-foreground font-semibold">
                        {result.expiresAt > 0
                          ? `${formatDateSafe(result.expiresAt > 1e11 ? result.expiresAt : result.expiresAt * 1000, "dd/MM/yyyy HH:mm:ss")} (${formatDistanceSafe(
                              result.expiresAt > 1e11 ? result.expiresAt : result.expiresAt * 1000
                            )})`
                          : "Sin límite establecido"}
                      </p>
                    </div>

                    {result.abortReason && (
                      <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-destructive">
                          Razón de Aborto
                        </span>
                        <p className="font-mono text-xs text-foreground">
                          {result.abortReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Locks involucrados en la transacción formateados con texto y flechas */}
                  {result.locks && result.locks.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Bloqueos Asociados a la Transacción ({result.locks.length}):
                      </span>
                      <div className="rounded-xl border border-border/60 bg-background/50 divide-y divide-border/40 overflow-hidden font-mono text-xs">
                        {result.locks.map((l: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 flex flex-wrap items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-primary font-bold">[{l.namespace}]</span>
                              <span className="text-foreground font-semibold">{l.lockKey}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                              <span className="text-[11px] text-muted-foreground">Modo: {l.requestedMode}</span>
                            </div>

                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-mono py-0",
                                l.status === "ACQUIRED"
                                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                  : l.status === "WAITING"
                                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                  : "border-muted-foreground/40 text-muted-foreground"
                              )}
                            >
                              {l.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No hay bloqueos registrados en esta transacción.
                    </p>
                  )}
                </Card>
              )}

              {/* CASO 7: Resultado Genérico / Confirmación 204 */}
              {(sreMethod === "RELEASE_HOLDER" || dlsMethod === "ABORT_TRANSACTION" || result?.success === true || (result?.message && !result?.key && !result?.status)) && (
                <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Operación ejecutada con éxito
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.message || "La orden de liberación o aborto fue procesada por el motor."}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* FALLBACK: Si hay un resultado recibido pero ninguna tarjeta especializada coincidió */}
              {!(
                (product === "SRE" && (sreMethod === "GET_RESOURCES_BY_GROUP" || (result && Array.isArray(result.resources)))) ||
                (product === "SRE" && (sreMethod === "GET_RESOURCE" || sreMethod === "UPDATE_RESOURCE" || (result && typeof result.availableAmount === "number" && !Array.isArray(result.resources)))) ||
                (product === "SRE" && (sreMethod === "GET_RESOURCE_HOLDERS" || (result && Array.isArray(result.holders)))) ||
                (product === "SRE" && (sreMethod === "GET_HOLDER" || (result && result.holderId && typeof result.amount === "number" && !Array.isArray(result.holders)))) ||
                (product === "DLS" && (dlsMethod === "GET_LOCK_STATUS" || (result && typeof result.isHeld === "boolean" && Array.isArray(result.activeHolders)))) ||
                (product === "DLS" && (dlsMethod === "GET_TRANSACTION_STATUS" || (result && result.status && Array.isArray(result.locks)))) ||
                (sreMethod === "RELEASE_HOLDER" || dlsMethod === "ABORT_TRANSACTION" || result?.success === true || (result?.message && !result?.key && !result?.status))
              ) && (
                <Card className="bg-card/60 border-border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Resultado de la Operación</span>
                  </div>
                  <div className="rounded-lg bg-zinc-950 dark:bg-black p-3 font-mono text-xs overflow-x-auto text-emerald-400">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de Confirmación para Acciones Destructivas */}
      <AlertDialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <ShieldAlert className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-bold">
                {pendingDangerousAction?.title || "Confirmar Acción Crítica"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {pendingDangerousAction?.description ||
                "Esta acción modificará directamente el estado en vivo del motor de concurrencia y no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAndExecute}
              className="text-xs h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              Confirmar y Ejecutar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
