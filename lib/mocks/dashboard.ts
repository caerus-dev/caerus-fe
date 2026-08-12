import { Layers, Activity, Lock, Gauge } from "lucide-react"

export const dashboardStatsMock = [
  {
    name: "Aplicaciones",
    value: "3",
    icon: Layers,
  },
  {
    name: "Llamadas de API (30d)",
    value: "84.2k",
    icon: Activity,
  },
  {
    name: "Bloqueos activos",
    value: "12",
    icon: Lock,
  },
  {
    name: "Uso del plan",
    value: "68%",
    icon: Gauge,
  },
]

export const recentActivityMock = [
  {
    id: 1,
    event: "lock.acquired",
    application: "payment-sync",
    environment: "prod",
    time: "Hace 2s",
  },
  {
    id: 2,
    event: "reserve.confirmed",
    application: "reserva-engine",
    environment: "prod",
    time: "Hace 15s",
  },
  {
    id: 3,
    event: "lock.released",
    application: "lock-service",
    environment: "dev",
    time: "Hace 32s",
  },
  {
    id: 4,
    event: "reserve.expired",
    application: "reserva-engine",
    environment: "prod",
    time: "Hace 1m",
  },
  {
    id: 5,
    event: "api_key.created",
    application: "payment-sync",
    environment: "prod",
    time: "Hace 5m",
  },
]
