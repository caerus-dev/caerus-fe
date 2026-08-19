import { AppEnvironmentsData, EnvData } from '@/types'

export const appEnvironmentsMock: Record<string, AppEnvironmentsData> = {
  "reserva-engine": {
    dev: {
      resources: [
        { id: "1-dev", name: "seat_reservation_dev", mode: "multiple", status: "active", activeReservations: 12 },
        { id: "2-dev", name: "test_lounge_dev", mode: "unit", status: "active", activeReservations: 0 },
      ],
      locks: [
        { id: "1-dev", name: "payment_mock_lock", type: "exclusive", status: "active", activeLocks: 1 },
      ],
      apiKeys: [
        { id: "1-dev", name: "Clave Desarrollo", prefix: "ck_test_", createdAt: "2024-01-15", lastUsed: "Hace 5m" },
      ],
    },
    staging: {
      resources: [
        { id: "1-stage", name: "seat_reservation_staging", mode: "multiple", status: "active", activeReservations: 5 },
      ],
      locks: [
        { id: "1-stage", name: "payment_stage_lock", type: "exclusive", status: "paused", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "1-stage", name: "Clave Staging", prefix: "ck_stage_", createdAt: "2024-01-15", lastUsed: "Hace 2h" },
      ],
    },
    prod: {
      resources: [
        { id: "1-prod", name: "seat_reservation", mode: "multiple", status: "active", activeReservations: 45 },
        { id: "2-prod", name: "vip_lounge", mode: "unit", status: "active", activeReservations: 2 },
      ],
      locks: [
        { id: "1-prod", name: "payment_processor", type: "exclusive", status: "active", activeLocks: 3 },
      ],
      apiKeys: [
        { id: "1-prod", name: "Production Key", prefix: "ck_live_", createdAt: "2024-01-15", lastUsed: "Hace 2m" },
      ],
    },
  },
  "lock-service": {
    dev: {
      resources: [],
      locks: [
        { id: "1-dev", name: "order_processing_dev", type: "exclusive", status: "active", activeLocks: 1 },
        { id: "2-dev", name: "inventory_sync_dev", type: "read-write", status: "active", activeLocks: 2 },
      ],
      apiKeys: [
        { id: "1-dev", name: "Development Key", prefix: "ck_test_", createdAt: "2024-02-20", lastUsed: "Hace 5m" },
      ],
    },
    staging: {
      resources: [],
      locks: [
        { id: "1-stage", name: "inventory_sync_staging", type: "read-write", status: "active", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "1-stage", name: "Staging Key", prefix: "ck_stage_", createdAt: "2024-02-20", lastUsed: "Hace 1d" },
      ],
    },
    prod: {
      resources: [],
      locks: [
        { id: "1-prod", name: "order_processing", type: "exclusive", status: "active", activeLocks: 1 },
        { id: "2-prod", name: "inventory_sync", type: "read-write", status: "active", activeLocks: 5 },
      ],
      apiKeys: [
        { id: "1-prod", name: "Production Key", prefix: "ck_live_", createdAt: "2024-02-20", lastUsed: "Hace 10m" },
      ],
    },
  },
  "payment-sync": {
    dev: {
      resources: [
        { id: "1-dev", name: "transaction_slot_dev", mode: "unit", status: "active", activeReservations: 1 },
      ],
      locks: [
        { id: "1-dev", name: "payment_gateway_dev", type: "exclusive", status: "active", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "1-dev", name: "Dev Key", prefix: "ck_test_", createdAt: "2024-03-10", lastUsed: "Hace 1h" },
      ],
    },
    staging: {
      resources: [
        { id: "1-stage", name: "transaction_slot_staging", mode: "unit", status: "active", activeReservations: 2 },
      ],
      locks: [
        { id: "1-stage", name: "payment_gateway_staging", type: "exclusive", status: "active", activeLocks: 1 },
      ],
      apiKeys: [
        { id: "1-stage", name: "Staging Key", prefix: "ck_stage_", createdAt: "2024-03-10", lastUsed: "Hace 30m" },
      ],
    },
    prod: {
      resources: [
        { id: "1-prod", name: "transaction_slot", mode: "unit", status: "active", activeReservations: 12 },
      ],
      locks: [
        { id: "1-prod", name: "payment_gateway", type: "exclusive", status: "active", activeLocks: 8 },
      ],
      apiKeys: [
        { id: "1-prod", name: "Production Key", prefix: "ck_live_", createdAt: "2024-03-10", lastUsed: "Hace 30s" },
      ],
    },
  },
}

export const generateMockDataForApp = (name: string): AppEnvironmentsData => {
  return {
    dev: {
      resources: [
        { id: "custom-1-dev", name: `${name}_resource_dev`, mode: "multiple", status: "active", activeReservations: 1 },
      ],
      locks: [
        { id: "custom-lock-1-dev", name: `${name}_lock_dev`, type: "exclusive", status: "active", activeLocks: 0 },
      ],
      apiKeys: [
        { id: "custom-key-1-dev", name: "Development Key", prefix: "ck_test_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 10m" },
      ],
    },
    staging: {
      resources: [
        { id: "custom-1-stage", name: `${name}_resource_staging`, mode: "multiple", status: "active", activeReservations: 2 },
      ],
      locks: [
        { id: "custom-lock-1-stage", name: `${name}_lock_staging`, type: "exclusive", status: "active", activeLocks: 1 },
      ],
      apiKeys: [
        { id: "custom-key-1-stage", name: "Staging Key", prefix: "ck_stage_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 1d" },
      ],
    },
    prod: {
      resources: [
        { id: "custom-1-prod", name: `${name}_resource`, mode: "multiple", status: "active", activeReservations: 5 },
      ],
      locks: [
        { id: "custom-lock-1-prod", name: `${name}_lock`, type: "exclusive", status: "active", activeLocks: 2 },
      ],
      apiKeys: [
        { id: "custom-key-1-prod", name: "Production Key", prefix: "ck_live_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 30s" },
      ],
    },
  }
}

export const getMockDataForEnv = (appName: string, envName: string): EnvData => {
  const predefined = appEnvironmentsMock[appName]
  if (predefined) {
    if (envName === "dev" || envName === "development") return predefined.dev
    if (envName === "stage" || envName === "staging") return predefined.staging
    if (envName === "prod" || envName === "production") return predefined.prod
  }

  return {
    resources: [
      { id: `${envName}-res-1`, name: `${appName}_res_${envName}`, mode: "multiple", status: "active", activeReservations: 3 },
    ],
    locks: [
      { id: `${envName}-lock-1`, name: `${appName}_lock_${envName}`, type: "exclusive", status: "active", activeLocks: 1 },
    ],
    apiKeys: [
      { id: `${envName}-key-1`, name: `Key ${envName}`, prefix: "ck_live_", createdAt: new Date().toISOString().split('T')[0], lastUsed: "Hace 5m" },
    ],
  }
}

