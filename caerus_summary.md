# Project Context: Caerus (Distributed Concurrency Backend-as-a-Service)

> **Status:** Active Development / In Progress
> **Target Audience:** AI Engineering Agents & Developers

---

## 1. Executive Summary & Product Vision

**Caerus** is a specialized **Backend-as-a-Service (BaaS)** platform designed for engineering teams and applications that manage concurrent operations over shared resources. Modern architectures (e.g., e-commerce platforms, ticketing systems, fintech platforms, collaborative tools) frequently face critical concurrency issues such as race conditions, double booking, overselling, and lost updates.

Instead of requiring individual development teams to build, manage, and maintain complex distributed infrastructure (such as ZooKeeper clusters, custom Redis Lua scripts, or complex SQL transaction locks), Caerus abstracts this complexity behind simple, declarative APIs and lightweight integrations.

### Core Value Proposition

* **Reduced Time-to-Market:** Offloads low-level distributed concurrency logic to a dedicated cloud infrastructure.


* **Incident Prevention:** Eliminates high-impact transactional errors (e.g., double charging, overbooking).


* **Cost Efficiency:** Shifts fixed infrastructure overhead (cluster setup, maintenance) to a usage-based (*Pay-as-you-go*) cloud model.


* **Developer Abstraction:** Enables developers to declare resource behaviors via a web dashboard and control execution flow via clean API calls.



---

## 2. Technical Architecture & Component Overview

Caerus uses a microservices-based architecture built around a **hybrid state management model**:

1. **In-Memory (Hot Path):** High-throughput, low-latency operations execute directly in **Redis** using atomic operations and custom Lua scripts.


2. **Persistent Storage (Cold Path):** Utilizing the **Write-Back (Write-Behind)** pattern, transactional states are synchronized from Redis to **PostgreSQL** via background workers, decoupling transaction throughput from disk latency and avoiding row-level lock contention.



```text
[ Client App / Backend ] ---> (gRPC) ---> [ Gateway / Proxy (Ingress) ]
                                                            |
      +-----------------------------------------------------+-----------------------------------------------------+
      | (HTTPS/REST)                                                                                              | (gRPC / Events via RabbitMQ)
      v                                                                                                           v
[ API Management (Spring Boot) ]                                                                  [ Concurrency Engine (Spring Boot) ]
      |                                                                                                           |
      +---> [ DB Management (PostgreSQL) ]                                                                          +---> [ DB Concurrency Engine (PostgreSQL) ]
                                                                                                                  +---> [ Redis Stack (In-Memory Hot Path) ]
                                                                                                                  +---> [ ZooKeeper Cluster (Consensus/Fencing) ]

```

### Primary Components

#### 1. Front-End & Entry Tier

* **Developer Portal (WebApp):** Built with **Next.js**; serves as the web management dashboard where engineers configure applications, environments, resource templates, namespaces, and API Keys.


* **API Routing / Ingress:** Managed dynamically by the Docker Swarm orchestration layer via **Traefik**, handling incoming traffic, SSL termination, and routing requests to internal containers.


* **Identity Provider:** Delegated to **Auth0** (OAuth2/OpenID Connect) for user authentication on the management control plane.



#### 2. Core Service Tier

* **API Management Service (Spring Boot):** Handles administrative workflows (organization CRUD, application management, environment isolation, API Key generation, and subscription tracking).


* **Concurrency Engine (Spring Boot):** The core execution engine. Handles low-latency mutual exclusion, resource locks, TTL expirations, and state transitions.


* **Message Queue (RabbitMQ):** Asynchronous event bus connecting management services to the concurrency engine, utilizing the **Transactional Outbox Pattern** with `SKIP LOCKED` database workers to ensure *at-least-once* event delivery without database bottlenecks.



#### 3. Data & Coordination Tier

* **Management Database (PostgreSQL):** Stores user accounts, tenant metadata, environments, and application configurations.


* **Concurrency Engine Database (PostgreSQL):** Stores persistent resource pool baselines, active/historical reservation records, and audit logs.


* **Redis Stack:** Acts as the high-speed in-memory state engine for immediate lock acquisition, TTL expirations, and atomic counters. Configured with AOF (Append-Only File) for persistence.


* **ZooKeeper Cluster:** Provides strong consensus guarantees, coordination, and strictly monotonic sequencing used for Fencing Token generation in low-level distributed locks.


#### 4. Environment & Template Isolation Model
Caerus employs a hierarchical multi-tenant data model to ensure safe and scalable resource management. At the top level, Environments (e.g., Dev, Staging, Prod) provide strict logical isolation for a client's data, expiration queues, and API traffic, preventing cross-contamination between deployment stages. Within an environment, users define Templates, which act as structural blueprints that dictate the default behavior, conflict strategies, and properties for a family of assets. Individual Resources (such as a specific concert seat or a product SKU) are then instantiated as children of a specific template. This allows developers to manage, query, and update thousands of related items through a single centralized configuration policy.

---

## 3. Core Engine Components & Features

Caerus provides two primary engines serving different levels of abstraction:

### A. Shared Resource Engine (SRE) — Business-Level Engine

Designed for domain-level stateful reservations (e.g., event seat holds, appointment slots, inventory stock allocations).

* **The Balance Model:** Instead of tracking infinite historical counters, the SRE maintains a live balance of `available_amount` and `pending_count`.


* **Core Transational Operations:** Clients interact via the gRPC endpoints: `Take`, `Confirm`, `Release`, and `Extend`.


* **Resource Configuration Operations:** Real-time inventory adjustments are supported via `CreateResource`, `UpdateResource` (allowing incremental/decremental `delta_amount` mutations), and `DeleteResource`.


* **Key Capabilities:**
* **Robust TTL Expiration Sweeper:** To prevent blocking the single-threaded Redis instance, expirations are handled using the **"Atomic Pop + Batches" (Visibility Timeout)** pattern. Spring Boot background workers fetch expired handlers in small batches, temporarily extend their scores to hide them from other workers, and then process stock restoration and the final index deletion (`ZREM`) via a pipelined Lua script.
* **Asynchronous Webhooks:** Triggers external HTTP callbacks upon lifecycle events (e.g., a timeout) to allow client frontends to update UI states in real-time.


* **Conflict Strategies:** The engine utilizes the Strategy Pattern, allowing users to configure behaviors such as `FailStrategy`, `RetryStrategy`, or `QueueStrategy`.


* **Built-in Idempotency:** Accepts client-provided idempotency keys in payload settings to prevent duplicate executions from network retries.





#### SRE Lifecycle Flow

$$\text{Available} \xrightarrow{\text{Take()}} \text{PENDING} \begin{cases} \xrightarrow{\text{Confirm()}} \text{CONFIRMED} \\ \xrightarrow{\text{Release()}} \text{RELEASED} \\ \xrightarrow{\text{TTL Timeout}} \text{EXPIRED} \end{cases}$$

---

### B. Distributed Locking Service (DLS) — System-Level Engine

Designed for low-level process synchronization, preventing race conditions across microservices (e.g., ensuring a scheduled billing worker only charges a customer once).

* **Lock Types:** Exclusive or Read/Write locks.


* **Fencing Tokens:** Generates monotonically increasing integer tokens (via ZooKeeper consensus) alongside each successful lock acquisition. Clients pass this token to downstream storage to reject stale writes caused by Garbage Collection (GC) pauses or network delays.


* **Deadlock Resolution:** Detects circular dependency chains, fires webhook alerts, and can automatically execute configured resolution strategies (e.g., terminating the lowest-priority process).


* **Operations:** `acquire()`, `renew()` (extends TTL during long-running tasks), and `release()`.



---

## 4. API Integration Model

Client applications integrate with Caerus through a dedicated **SDK** that abstracts the complexity of the underlying architecture.

* **Communication Protocol:** The SDK utilizes **gRPC** over HTTP/2 to communicate with the API Gateway and Concurrency Engine, ensuring ultra-fast binary serialization via Protocol Buffers.


* **Facade Pattern:** The SDK acts as a clean, unified facade for developers. It hides low-level details such as gRPC channel management, network retries, and manual lock tracking, allowing developers to execute operations in a single line of native code.


* *(Note: The exact structure and method signatures of the SDK are currently under active development).*

---

## 5. Non-Functional Requirements (NFR) Summary

The following attributes align with the architectural design to guarantee enterprise-grade reliability:

| Attribute | Target Metric & Tactical Implementation |
| --- | --- |
| **Performance** | **< 20 ms latency for 95% of successful lock requests**. Guaranteed by gRPC communication, in-memory execution in Redis via Lua scripts, and bypassing DB writes on the hot path.
| **Availability** | **99.9% uptime** (max 43.8 minutes downtime/month). Achieved via ZooKeeper consensus (leader election), load balancing, and asynchronous decoupling with RabbitMQ.
| **Security** | **100% of unauthorized requests blocked**. Uses dual-plane authorization: the Control plane (WebApp) uses **Auth0 JWTs**; the Data plane (Concurrency Engine via SDK) uses **API Key validation**.
| **Usability** | **< 30 minutes onboarding** for a new developer to complete a basic integration (lock and release) by reading the documentation. Achieved via the simplified SDK and automated self-service portal.


---

## 6. System Deployment Architecture

Caerus is packaged as a collection of Docker images and orchestrated in production on a **VPS** using **Docker Swarm** (managed via **Dokploy**):

```text
+-----------------------------------------------------------------------------------+
| VPS Instance (Docker Swarm Cluster Node / Dokploy Host)                           |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Swarm Ingress / Routing Mesh (Traefik Reverse Proxy)                        |  |
|  +-----------------------------------------------------------------------------+  |
|                                        |                                          |
|  +-----------------------------------------------------------------------------+  |
|  | Docker Swarm Managed Services                                               |  |
|  |  * WebApp Service (Next.js Node server)                                     |  |
|  |  * API Management Service (Spring Boot)                                     |  |
|  |  * Concurrency Engine Service (Spring Boot)                                 |  |
|  |  * RabbitMQ Broker Service                                                  |  |
|  |  * PostgreSQL Services (Management & Concurrency DBs)                       |  |
|  |  * Redis Stack Service                                                      |  |
|  |  * ZooKeeper Cluster Service                                                |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+

```

Note: A strict Backup & Disaster Recovery policy is enforced, dumping PostgreSQL states to an off-site Object Storage bucket (e.g., AWS S3, Cloudflare R2) with a 4-hour RTO and 12-hour RPO.

---

## 7. Project Roadmap Overview

```text
[Phase 0: Foundations] --> [Release 1: SRE Core (MVP)] --> [Release 2: DLS & Integrations] --> [Release 3: B2B & Observability]

```

1. **Phase 0 (Foundations):** Architecture design, WBS definition, database schema modeling, and initial backlog setup.


2. **Release 1 (SRE Core & Portal Base) - MVP:** WebApp onboarding, Auth0 authentication, and the Shared Resource Engine (SRE) MVP with Redis lock handlers and conflict strategies.


3. **Release 2 (DLS & Integrations):** Distributed Locking Service (DLS) + SDKs


4. **Release 3 (B2B Maturity & Observability):** Fencing Token support, Deadlock detection, Metric dashboards, alerts via Webhooks, and subscription monitoring.