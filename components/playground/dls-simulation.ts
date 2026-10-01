import type { LockMode } from '@caerus-dev/sdk'
import { SdkCallLog } from './types'

export type DlsScenario = 'shared_read' | 'exclusive' | 'deadlock'

export interface WorkerState {
  id: string
  name: string
  color: string
  status: 'IDLE' | 'HOLDING' | 'WAITING' | 'ABORTED' | 'COMPLETED'
  heldLocks: string[]
  waitingFor?: string
}

export interface ResourceLockState {
  id: string
  name: string
  type: 'FILE' | 'NETWORK'
  heldBy: string[]
  mode?: LockMode
  queue: string[]
  fencingToken?: number
}

export interface ScenarioStepMeta {
  stepIndex: number
  title: string
  description: string
  actionLabel: string
}

export class DlsSimulation {
  private workers: Map<string, WorkerState>
  private resources: Map<string, ResourceLockState>
  private tokenCounter = 1040

  constructor() {
    this.workers = new Map()
    this.resources = new Map()
    this.reset()
  }

  reset() {
    // Solo dos workers: Alfa y Beta (Worker Gamma removido)
    this.workers = new Map([
      [
        'alfa',
        {
          id: 'alfa',
          name: 'Worker Alfa',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          status: 'IDLE',
          heldLocks: [],
        },
      ],
      [
        'beta',
        {
          id: 'beta',
          name: 'Worker Beta',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          status: 'IDLE',
          heldLocks: [],
        },
      ],
    ])

    this.resources = new Map([
      [
        'file:reports_export',
        {
          id: 'file:reports_export',
          name: 'file:reports_export.csv',
          type: 'FILE',
          heldBy: [],
          queue: [],
        },
      ],
      [
        'network:cloud_uploader',
        {
          id: 'network:cloud_uploader',
          name: 'network:cloud_uploader',
          type: 'NETWORK',
          heldBy: [],
          queue: [],
        },
      ],
    ])
  }

  getWorkers(): WorkerState[] {
    return Array.from(this.workers.values())
  }

  getResources(): ResourceLockState[] {
    return Array.from(this.resources.values())
  }

  getScenarioSteps(scenario: DlsScenario): ScenarioStepMeta[] {
    switch (scenario) {
      case 'shared_read':
        return [
          {
            stepIndex: 0,
            title: '1. Worker Alfa inicia withTransaction y adquiere SHARED_READ',
            description: 'Worker Alfa solicita lectura compartida en el archivo de reportes dentro de una transacción gestionada.',
            actionLabel: 'Ejecutar: Alfa adquiere SHARED_READ',
          },
          {
            stepIndex: 1,
            title: '2. Worker Beta adquiere SHARED_READ simultáneamente',
            description: 'Worker Beta solicita el mismo lock. Al ser SHARED_READ, no es bloqueado y ambos leen en paralelo sin esperas.',
            actionLabel: 'Ejecutar: Beta adquiere SHARED_READ',
          },
          {
            stepIndex: 2,
            title: '3. Finalización automática al salir de withTransaction',
            description: 'Ambos callbacks completan su trabajo y withTransaction libera todos los locks automáticamente.',
            actionLabel: 'Ejecutar: Finalizar transacciones y liberar',
          },
        ]

      case 'exclusive':
        return [
          {
            stepIndex: 0,
            title: '1. Worker Alfa adquiere EXCLUSIVE con withTransaction',
            description: 'Worker Alfa adquiere un lock exclusivo sobre el archivo para modificarlo dentro de su transacción.',
            actionLabel: 'Ejecutar: Alfa adquiere lock EXCLUSIVE',
          },
          {
            stepIndex: 1,
            title: '2. Worker Beta solicita EXCLUSIVE y queda en espera',
            description: 'Worker Beta intenta adquirir el mismo archivo. El lock está ocupado, por lo que queda en cola streaming gRPC esperando disponibilidad.',
            actionLabel: 'Ejecutar: Beta solicita lock y espera',
          },
          {
            stepIndex: 2,
            title: '3. Alfa completa y Caerus despierta a Beta',
            description: 'Worker Alfa termina su bloque withTransaction. Caerus libera el lock y despierta a Beta otorgándole el recurso.',
            actionLabel: 'Ejecutar: Alfa libera y Beta adquiere',
          },
          {
            stepIndex: 3,
            title: '4. Worker Beta completa su transacción',
            description: 'Worker Beta termina su escritura y withTransaction libera el recurso automáticamente.',
            actionLabel: 'Ejecutar: Beta completa y libera',
          },
        ]

      case 'deadlock':
        return [
          {
            stepIndex: 0,
            title: '1. Worker Alfa adquiere Archivo (EXCLUSIVE)',
            description: 'Alfa inicia withTransaction y toma posesión exclusiva de file:reports_export.',
            actionLabel: 'Ejecutar: Alfa adquiere Archivo',
          },
          {
            stepIndex: 1,
            title: '2. Worker Beta adquiere Red (EXCLUSIVE)',
            description: 'Beta inicia withTransaction concurrente y toma posesión exclusiva de network:cloud_uploader.',
            actionLabel: 'Ejecutar: Beta adquiere Red',
          },
          {
            stepIndex: 2,
            title: '3. Solicitud cruzada: Detección de Deadlock',
            description: 'Alfa solicita el canal de red (retenido por Beta) y Beta solicita el archivo (retenido por Alfa). Se produce un ciclo de espera mutua.',
            actionLabel: 'Ejecutar: Provocar contención cruzada',
          },
          {
            stepIndex: 3,
            title: '4. Detector de Deadlocks aborta la transacción víctima',
            description: 'El Detector de Deadlocks de Caerus identifica la espera circular y aborta la transacción de Beta. withTransaction libera los locks de Beta y Alfa obtiene la Red.',
            actionLabel: 'Ejecutar: Caerus resuelve Deadlock',
          },
          {
            stepIndex: 4,
            title: '5. Alfa completa con éxito y Beta reintenta',
            description: 'Alfa concluye su subida y libera ambos recursos. Beta reintenta su bloque withTransaction y finaliza sin colisiones.',
            actionLabel: 'Ejecutar: Concluir transacciones',
          },
        ]
    }
  }

  executeStep(scenario: DlsScenario, stepIndex: number): SdkCallLog {
    const now = Date.now()

    if (scenario === 'shared_read') {
      const fileRes = this.resources.get('file:reports_export')!
      const alfa = this.workers.get('alfa')!
      const beta = this.workers.get('beta')!

      if (stepIndex === 0) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        fileRes.heldBy = [alfa.name]
        fileRes.mode = 'SHARED_READ'
        fileRes.fencingToken = token
        alfa.status = 'HOLDING'
        alfa.heldLocks = [fileRes.name]

        return {
          id: `dls_sr_${now}_0`,
          timestamp: now,
          method: `// [Worker Alfa] Transacción gestionada\nawait dls.withTransaction(async (tx) => {\n  const lock = await tx.acquireLock(\n    'task_processing',\n    'file:reports_export',\n    'SHARED_READ',\n    { leaseMs: 15000 }\n  )\n  // Lectura concurrente...\n}, { owner: 'Worker Alfa' })`,
          argsString: `mode: SHARED_READ`,
          action: 'withTransaction',
          status: 'SUCCESS',
          resultSummary: `ACQUIRED · fencingToken: #${token} · Lectura compartida otorgada a Worker Alfa`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'lock.acquired',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Alfa',
              mode: 'SHARED_READ',
              fencingToken: token,
            },
          },
        }
      }

      if (stepIndex === 1) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        fileRes.heldBy.push(beta.name)
        beta.status = 'HOLDING'
        beta.heldLocks = [fileRes.name]

        return {
          id: `dls_sr_${now}_1`,
          timestamp: now,
          method: `// [Worker Beta] Transacción concurrente simultánea\nawait dls.withTransaction(async (tx) => {\n  const lock = await tx.acquireLock(\n    'task_processing',\n    'file:reports_export',\n    'SHARED_READ',\n    { leaseMs: 15000 }\n  )\n  // Lectura simultánea sin bloqueo...\n}, { owner: 'Worker Beta' })`,
          argsString: `mode: SHARED_READ`,
          action: 'withTransaction',
          status: 'SUCCESS',
          resultSummary: `ACQUIRED · fencingToken: #${token} · Worker Beta lee en paralelo sin bloqueo`,
          durationMs: 1,
          generatedWebhookEvent: {
            type: 'lock.acquired',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Beta',
              mode: 'SHARED_READ',
              fencingToken: token,
            },
          },
        }
      }

      if (stepIndex === 2) {
        fileRes.heldBy = []
        fileRes.mode = undefined
        alfa.status = 'COMPLETED'
        alfa.heldLocks = []
        beta.status = 'COMPLETED'
        beta.heldLocks = []

        return {
          id: `dls_sr_${now}_2`,
          timestamp: now,
          method: `// Salida de withTransaction de ambos workers:\n// Caerus libera automáticamente los locks asociados a las transacciones`,
          argsString: '',
          action: 'auto-release',
          status: 'RELEASED',
          resultSummary: 'RELEASED · Transacciones finalizadas. Locks liberados automáticamente.',
          durationMs: 1,
          generatedWebhookEvent: {
            type: 'lock.released',
            payload: {
              lockKey: 'file:reports_export',
              releasedBy: ['Worker Alfa', 'Worker Beta'],
            },
          },
        }
      }
    }

    if (scenario === 'exclusive') {
      const fileRes = this.resources.get('file:reports_export')!
      const alfa = this.workers.get('alfa')!
      const beta = this.workers.get('beta')!

      if (stepIndex === 0) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        fileRes.heldBy = [alfa.name]
        fileRes.mode = 'EXCLUSIVE'
        fileRes.fencingToken = token
        alfa.status = 'HOLDING'
        alfa.heldLocks = [fileRes.name]

        return {
          id: `dls_ex_${now}_0`,
          timestamp: now,
          method: `// [Worker Alfa] Escritura exclusiva\nawait dls.withTransaction(async (tx) => {\n  const lock = await tx.acquireLock(\n    'task_processing',\n    'file:reports_export',\n    'EXCLUSIVE',\n    { leaseMs: 30000 }\n  )\n  // Modificando archivo...\n}, { owner: 'Worker Alfa' })`,
          argsString: `mode: EXCLUSIVE`,
          action: 'withTransaction',
          status: 'SUCCESS',
          resultSummary: `ACQUIRED · fencingToken: #${token} · Acceso exclusivo garantizado a Worker Alfa`,
          durationMs: 3,
          generatedWebhookEvent: {
            type: 'lock.acquired',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Alfa',
              mode: 'EXCLUSIVE',
              fencingToken: token,
            },
          },
        }
      }

      if (stepIndex === 1) {
        fileRes.queue = [beta.name]
        beta.status = 'WAITING'
        beta.waitingFor = fileRes.name

        return {
          id: `dls_ex_${now}_1`,
          timestamp: now,
          method: `// [Worker Beta] Intento de acceso a recurso exclusivo:\nawait dls.withTransaction(async (tx) => {\n  // Bloqueado en cola gRPC streaming hasta que Alfa libere\n  const lock = await tx.acquireLock(\n    'task_processing',\n    'file:reports_export',\n    'EXCLUSIVE'\n  )\n}, { owner: 'Worker Beta' })`,
          argsString: `mode: EXCLUSIVE`,
          action: 'contención',
          status: 'PENDING',
          resultSummary: `WAITING · Lock ocupado por Worker Alfa. Worker Beta retenido en cola streaming`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'lock.queued',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Beta',
              state: 'BLOCKED_BY_EXCLUSIVE_HOLDER',
            },
          },
        }
      }

      if (stepIndex === 2) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        fileRes.heldBy = [beta.name]
        fileRes.queue = []
        fileRes.fencingToken = token
        alfa.status = 'COMPLETED'
        alfa.heldLocks = []
        beta.status = 'HOLDING'
        beta.waitingFor = undefined
        beta.heldLocks = [fileRes.name]

        return {
          id: `dls_ex_${now}_2`,
          timestamp: now,
          method: `// Worker Alfa completa su bloque withTransaction -> Libera lock\n// Caerus despierta al worker en espera (Worker Beta) y le entrega el lock`,
          argsString: `promotion`,
          action: 'promoción',
          status: 'SUCCESS',
          resultSummary: `ACQUIRED · fencingToken: #${token} · Lock transferido automáticamente a Worker Beta`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'lock.acquired',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Beta',
              mode: 'EXCLUSIVE',
              fencingToken: token,
            },
          },
        }
      }

      if (stepIndex === 3) {
        fileRes.heldBy = []
        fileRes.mode = undefined
        beta.status = 'COMPLETED'
        beta.heldLocks = []

        return {
          id: `dls_ex_${now}_3`,
          timestamp: now,
          method: `// Worker Beta concluye su bloque withTransaction\n// Recurso liberado automáticamente`,
          argsString: '',
          action: 'auto-release',
          status: 'RELEASED',
          resultSummary: 'RELEASED · Worker Beta completó exitosamente. Recurso totalmente libre.',
          durationMs: 1,
          generatedWebhookEvent: {
            type: 'lock.released',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Beta',
            },
          },
        }
      }
    }

    if (scenario === 'deadlock') {
      const fileRes = this.resources.get('file:reports_export')!
      const netRes = this.resources.get('network:cloud_uploader')!
      const alfa = this.workers.get('alfa')!
      const beta = this.workers.get('beta')!

      if (stepIndex === 0) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        fileRes.heldBy = [alfa.name]
        fileRes.mode = 'EXCLUSIVE'
        fileRes.fencingToken = token
        alfa.status = 'HOLDING'
        alfa.heldLocks = [fileRes.name]

        return {
          id: `dls_dl_${now}_0`,
          timestamp: now,
          method: `// [Worker Alfa] Inicia transacción y adquiere Archivo\nawait dls.withTransaction(async (tx) => {\n  await tx.acquireLock('task_processing', 'file:reports_export', 'EXCLUSIVE')\n  // Procesando archivo antes de subir a la nube...\n}, { owner: 'Worker Alfa' })`,
          argsString: `mode: EXCLUSIVE`,
          action: 'withTransaction',
          status: 'SUCCESS',
          resultSummary: `ACQUIRED · fencingToken: #${token} · Worker Alfa retiene Archivo`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'lock.acquired',
            payload: {
              lockKey: 'file:reports_export',
              worker: 'Worker Alfa',
              mode: 'EXCLUSIVE',
              fencingToken: token,
            },
          },
        }
      }

      if (stepIndex === 1) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        netRes.heldBy = [beta.name]
        netRes.mode = 'EXCLUSIVE'
        netRes.fencingToken = token
        beta.status = 'HOLDING'
        beta.heldLocks = [netRes.name]

        return {
          id: `dls_dl_${now}_1`,
          timestamp: now,
          method: `// [Worker Beta] Inicia transacción concurrente y adquiere Red\nawait dls.withTransaction(async (tx) => {\n  await tx.acquireLock('task_processing', 'network:cloud_uploader', 'EXCLUSIVE')\n  // Canal de red reservado...\n}, { owner: 'Worker Beta' })`,
          argsString: `mode: EXCLUSIVE`,
          action: 'withTransaction',
          status: 'SUCCESS',
          resultSummary: `ACQUIRED · fencingToken: #${token} · Worker Beta retiene Canal de Red`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'lock.acquired',
            payload: {
              lockKey: 'network:cloud_uploader',
              worker: 'Worker Beta',
              mode: 'EXCLUSIVE',
              fencingToken: token,
            },
          },
        }
      }

      if (stepIndex === 2) {
        alfa.status = 'WAITING'
        alfa.waitingFor = netRes.name
        beta.status = 'WAITING'
        beta.waitingFor = fileRes.name
        fileRes.queue = [beta.name]
        netRes.queue = [alfa.name]

        return {
          id: `dls_dl_${now}_2`,
          timestamp: now,
          method: `// Contención cruzada en simultáneo:\n// Alfa (posee Archivo) -> solicita Canal de Red\n// Beta (posee Canal de Red) -> solicita Archivo\n// Ambos quedan en espera mutua circular`,
          argsString: `Alfa <-> Beta`,
          action: 'deadlock cycle',
          status: 'CONFLICT',
          resultSummary: `DEADLOCK DETECTADO · Espera circular: Alfa espera Red (Beta) y Beta espera Archivo (Alfa)`,
          durationMs: 4,
          generatedWebhookEvent: {
            type: 'deadlock.detected',
            payload: {
              cycle: ['Worker Alfa', 'Worker Beta'],
              resources: ['file:reports_export', 'network:cloud_uploader'],
            },
          },
        }
      }

      if (stepIndex === 3) {
        this.tokenCounter += 1
        const token = this.tokenCounter
        beta.status = 'ABORTED'
        beta.heldLocks = []
        beta.waitingFor = undefined
        fileRes.queue = []

        // Canal de red liberado de Beta y otorgado a Alfa
        netRes.heldBy = [alfa.name]
        netRes.fencingToken = token
        netRes.queue = []
        alfa.status = 'HOLDING'
        alfa.heldLocks = [fileRes.name, netRes.name]
        alfa.waitingFor = undefined

        return {
          id: `dls_dl_${now}_3`,
          timestamp: now,
          method: `// [Detector de Deadlocks de Caerus]\n// Detecta el interbloqueo y aborta proactivamente la transacción de Beta\n// withTransaction de Beta captura DeadlockAbortedError y libera sus recursos\n// Alfa recibe el canal de red liberado con nuevo fencingToken`,
          argsString: `victim: Worker Beta`,
          action: 'deadlock resolve',
          status: 'RELEASED',
          errorSummary: 'DeadlockAbortedError: Transacción de Worker Beta abortada automáticamente para resolver el ciclo',
          resultSummary: `RESOLVED · Locks de Beta liberados forzosamente. Red otorgada a Alfa (Token #${token}).`,
          durationMs: 2,
          generatedWebhookEvent: {
            type: 'transaction.aborted',
            payload: {
              transactionId: 'tx-beta-8812',
              reason: 'DEADLOCK_VICTIM_SELECTED',
            },
          },
        }
      }

      if (stepIndex === 4) {
        fileRes.heldBy = []
        fileRes.mode = undefined
        netRes.heldBy = []
        netRes.mode = undefined
        alfa.status = 'COMPLETED'
        alfa.heldLocks = []
        beta.status = 'COMPLETED'
        beta.heldLocks = []

        return {
          id: `dls_dl_${now}_4`,
          timestamp: now,
          method: `// Worker Alfa completa su exportación y subida\n// withTransaction de Alfa finaliza y libera ambos recursos\n// Worker Beta reintenta su bloque withTransaction exitosamente`,
          argsString: `completed`,
          action: 'auto-release',
          status: 'RELEASED',
          resultSummary: 'COMPLETED · Worker Alfa finalizó. Beta reintentó y concluyó. Todos los locks liberados.',
          durationMs: 1,
          generatedWebhookEvent: {
            type: 'lock.released',
            payload: {
              releasedBy: ['Worker Alfa', 'Worker Beta'],
              resources: ['file:reports_export', 'network:cloud_uploader'],
            },
          },
        }
      }
    }

    return {
      id: `dls_noop_${now}`,
      timestamp: now,
      method: `// Paso ${stepIndex}`,
      argsString: '',
      action: 'noop',
      status: 'SUCCESS',
      durationMs: 0,
    }
  }

  runScenario(scenario: DlsScenario): { logs: SdkCallLog[] } {
    this.reset()
    const steps = this.getScenarioSteps(scenario)
    const logs: SdkCallLog[] = []
    for (const step of steps) {
      logs.push(this.executeStep(scenario, step.stepIndex))
    }
    return { logs }
  }
}
