import { AegisBenchTask } from '../types';

export const AEGIS_BENCH_TASKS: AegisBenchTask[] = [
  {
    id: 'aegis-001',
    title: 'Fix Race Condition in Async Redis Token-Bucket Rate Limiter',
    category: 'concurrency_race',
    difficulty: 'Codex-Core',
    language: 'Python',
    description: 'Under high concurrent burst load (500 req/s), the rate limiter allows burst allowances to exceed the bucket capacity due to non-atomic read-modify-write on Redis keys.',
    reproCommand: 'pytest tests/test_rate_limiter.py -k "test_concurrent_burst_burstiness" -n 8',
    initialCode: `class AsyncTokenBucketLimiter:
    def __init__(self, redis_client, rate_per_sec: float, capacity: int):
        self.redis = redis_client
        self.rate = rate_per_sec
        self.capacity = capacity

    async def allow_request(self, key: str, cost: int = 1) -> bool:
        # BUG: Non-atomic get-check-update allows concurrent race conditions
        data = await self.redis.hgetall(f"bucket:{key}")
        now = time.time()
        
        if not data:
            tokens = self.capacity
            last_updated = now
        else:
            tokens = float(data.get(b"tokens", self.capacity))
            last_updated = float(data.get(b"last_updated", now))
            
        elapsed = now - last_updated
        tokens = min(float(self.capacity), tokens + elapsed * self.rate)
        
        if tokens >= cost:
            tokens -= cost
            await self.redis.hset(f"bucket:{key}", mapping={
                "tokens": str(tokens),
                "last_updated": str(now)
            })
            return True
        return False`,
    failingTrace: `AssertionError: Bucket exceeded capacity: expected max 50 tokens allowed in 100ms, but allowed 89 tokens.
    File "/workspace/src/rate_limiter.py", line 26, in allow_request
    Traceback (most recent call last):
      File "tests/test_rate_limiter.py", line 48, in test_concurrent_burst_burstiness
        assert total_allowed <= max_allowed, f"Burst violation: {total_allowed} > {max_allowed}"
    Failure Taxonomy: CONCURRENCY_RACE / LOGIC_FLAW (Severity: CRITICAL)`,
    expectedRootCause: 'Race condition: Multiple concurrent coroutines concurrently read the same stale token count before writing back, bypassing the capacity ceiling. Fix requires a single atomic Lua script or Redis transaction with MULTI/EXEC.',
    fixedCode: `class AsyncTokenBucketLimiter:
    LUA_SCRIPT = """
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local rate = tonumber(ARGV[2])
    local capacity = tonumber(ARGV[3])
    local cost = tonumber(ARGV[4])
    
    local data = redis.call('HMGET', key, 'tokens', 'last_updated')
    local tokens = tonumber(data[1])
    local last_updated = tonumber(data[2])
    
    if not tokens or not last_updated then
        tokens = capacity
        last_updated = now
    else
        local elapsed = math.max(0, now - last_updated)
        tokens = math.min(capacity, tokens + (elapsed * rate))
        last_updated = now
    end
    
    if tokens >= cost then
        tokens = tokens - cost
        redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
        redis.call('EXPIRE', key, 3600)
        return 1
    else
        return 0
    end
    """

    def __init__(self, redis_client, rate_per_sec: float, capacity: int):
        self.redis = redis_client
        self.rate = rate_per_sec
        self.capacity = capacity
        self._script = self.redis.register_script(self.LUA_SCRIPT)

    async def allow_request(self, key: str, cost: int = 1) -> bool:
        now = time.time()
        res = await self._script(
            keys=[f"bucket:{key}"],
            args=[now, self.rate, self.capacity, cost]
        )
        return res == 1`,
    patchDiff: `@@ -10,18 +10,32 @@
-    async def allow_request(self, key: str, cost: int = 1) -> bool:
-        data = await self.redis.hgetall(f"bucket:{key}")
-        now = time.time()
-        if not data:
-            tokens = self.capacity
-        ...
+    # Atomic Lua evaluation script executing inside Redis engine
+    LUA_SCRIPT = """..."""
+    async def allow_request(self, key: str, cost: int = 1) -> bool:
+        now = time.time()
+        res = await self._script(keys=[f"bucket:{key}"], args=[now, self.rate, self.capacity, cost])
+        return res == 1`,
    regressionSuiteDescription: 'Verifies 1,000 concurrent worker coroutines across 4 Redis mock threads; boundary test for zero capacity, negative costs, and sub-millisecond clock drift.',
    baselinePassRate: 34,
    aegisPassRate: 98,
    tokensAvg: 6200,
    latencySeconds: 4.8
  },
  {
    id: 'aegis-002',
    title: 'Mitigate SSRF Vulnerability in Webhook Dispatcher with DNS Pinning',
    category: 'security_hardening',
    difficulty: 'Hard',
    language: 'Python',
    description: 'Webhook dispatcher is vulnerable to Server-Side Request Forgery (SSRF) and DNS rebinding attacks targeting cloud metadata endpoints (169.254.169.254, localhost, 10.0.0.0/8).',
    reproCommand: 'pytest tests/test_security_webhook.py -k "test_block_internal_metadata_and_dns_rebinding"',
    initialCode: `import urllib.request
import urllib.parse

class WebhookDispatcher:
    def dispatch(self, webhook_url: str, payload: dict) -> bool:
        # VULNERABLE: Direct URL open allows 127.0.0.1, 169.254.169.254, 0.0.0.0, and DNS Rebinding
        parsed = urllib.parse.urlparse(webhook_url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("Invalid scheme")
            
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200`,
    failingTrace: `SecurityViolationError: SSRF check failed! Target resolved to AWS EC2 Metadata IP: 169.254.169.254.
    File "/workspace/src/webhook.py", line 14, in dispatch
    Captured Syscall: socket.connect("169.254.169.254:80") -> Prohibited private subnet access
    Sandbox Policy Trigger: HIGH_RISK_NETWORK_VIOLATION`,
    expectedRootCause: 'Absence of IP address resolution validation, CIDR filtering for RFC1918/link-local/loopback ranges, and vulnerability to Time-of-Check to Time-of-Use (TOCTOU) DNS rebinding.',
    fixedCode: `import socket
import ipaddress
import urllib.parse
import http.client

BLOCKED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

class WebhookDispatcher:
    def _validate_and_pin_ip(self, hostname: str) -> str:
        addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        if not addr_info:
            raise SecurityViolationError("Unable to resolve host")
        resolved_ip_str = addr_info[0][4][0]
        ip_obj = ipaddress.ip_address(resolved_ip_str)
        for net in BLOCKED_NETWORKS:
            if ip_obj in net:
                raise SecurityViolationError(f"Prohibited IP address: {ip_obj}")
        return resolved_ip_str

    def dispatch(self, webhook_url: str, payload: dict) -> bool:
        parsed = urllib.parse.urlparse(webhook_url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("Only HTTP/HTTPS schemes allowed")
        
        pinned_ip = self._validate_and_pin_ip(parsed.hostname)
        # Connect directly to pinned IP to prevent DNS rebinding attacks
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        conn_cls = http.client.HTTPSConnection if parsed.scheme == "https" else http.client.HTTPConnection
        conn = conn_cls(pinned_ip, port=port, timeout=5)
        headers = {"Host": parsed.hostname, "Content-Type": "application/json"}
        conn.request("POST", parsed.path or "/", body=json.dumps(payload), headers=headers)
        res = conn.getresponse()
        return 200 <= res.status < 300`,
    patchDiff: `@@ -1,15 +1,38 @@
-class WebhookDispatcher:
-    def dispatch(self, webhook_url: str, payload: dict) -> bool:
-        parsed = urllib.parse.urlparse(webhook_url)
-        with urllib.request.urlopen(req, timeout=5) as response:
+BLOCKED_NETWORKS = [ipaddress.ip_network("127.0.0.0/8"), ipaddress.ip_network("169.254.0.0/16"), ...]
+class WebhookDispatcher:
+    def _validate_and_pin_ip(self, hostname: str) -> str:
+        # Resolves and validates against private/reserved CIDRs
+        ...
+    def dispatch(self, webhook_url: str, payload: dict) -> bool:
+        pinned_ip = self._validate_and_pin_ip(parsed.hostname)
+        # Direct pinned IP connection prevents TOCTOU rebinding`,
    regressionSuiteDescription: 'Adversarial tests against hex IPs (0x7f.1), octal notation, IPv6 mapped IPv4, dual homed DNS records, and fast TTL rebinding servers.',
    baselinePassRate: 41,
    aegisPassRate: 100,
    tokensAvg: 5100,
    latencySeconds: 3.9
  },
  {
    id: 'aegis-003',
    title: 'Fix Zero-Copy Circular RingBuffer Overflow in Rust Audio Processing',
    category: 'memory_leak',
    difficulty: 'Codex-Core',
    language: 'Rust',
    description: 'Under heavy multi-threaded audio rendering, atomic write cursor wraps past capacity without wrapping read buffer index, triggering memory corruption panic.',
    reproCommand: 'cargo test --test ring_buffer_stress -- --nocapture',
    initialCode: `pub struct LockFreeRingBuffer<T: Copy> {
    buffer: Vec<T>,
    capacity: usize,
    head: std::sync::atomic::AtomicUsize,
    tail: std::sync::atomic::AtomicUsize,
}

impl<T: Copy> LockFreeRingBuffer<T> {
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: vec![unsafe { std::mem::zeroed() }; capacity],
            capacity,
            head: std::sync::atomic::AtomicUsize::new(0),
            tail: std::sync::atomic::AtomicUsize::new(0),
        }
    }

    pub fn push(&self, item: T) -> Result<(), &'static str> {
        let head = self.head.load(std::sync::atomic::Ordering::Relaxed);
        let tail = self.tail.load(std::sync::atomic::Ordering::Acquire);
        
        // BUG: Incomplete bounds check under concurrent wraparound causes index out of bounds
        if head - tail >= self.capacity {
            return Err("Buffer full");
        }
        
        unsafe {
            let ptr = self.buffer.as_ptr() as *mut T;
            ptr.add(head % self.capacity).write(item);
        }
        self.head.store(head + 1, std::sync::atomic::Ordering::Release);
        Ok(())
    }
}`,
    failingTrace: `thread 'ring_buffer_stress' panicked at 'index out of bounds: the len is 1024 but the index is 1024'
stack backtrace:
   0: rust_begin_unwind
   1: core::panicking::panic_fmt
   2: aegis_core::ring_buffer::LockFreeRingBuffer::push
   3: ring_buffer_stress::concurrent_audio_producer_consumer
Failure Taxonomy: RUNTIME_ERROR / MEMORY_SAFETY (Rust panic)`,
    expectedRootCause: 'Relaxed atomic ordering combined with non-power-of-two modulo wrap and lack of atomic compare-and-swap (CAS) under multiple producers allows buffer overrun and pointer corruption.',
    fixedCode: `use std::sync::atomic::{AtomicUsize, Ordering};
use std::cell::UnsafeCell;

pub struct LockFreeRingBuffer<T: Copy> {
    buffer: Box<[UnsafeCell<T>]>,
    capacity: usize,
    mask: usize,
    head: AtomicUsize,
    tail: AtomicUsize,
}

unsafe impl<T: Copy + Send> Sync for LockFreeRingBuffer<T> {}

impl<T: Copy + Default> LockFreeRingBuffer<T> {
    pub fn new(min_capacity: usize) -> Self {
        let capacity = min_capacity.next_power_of_two();
        let mut vec = Vec::with_capacity(capacity);
        for _ in 0..capacity {
            vec.push(UnsafeCell::new(T::default()));
        }
        Self {
            buffer: vec.into_boxed_slice(),
            capacity,
            mask: capacity - 1,
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
        }
    }

    pub fn push(&self, item: T) -> Result<(), &'static str> {
        let mut head = self.head.load(Ordering::Relaxed);
        loop {
            let tail = self.tail.load(Ordering::Acquire);
            if head.wrapping_sub(tail) >= self.capacity {
                return Err("Buffer is saturated");
            }
            match self.head.compare_exchange_weak(
                head,
                head.wrapping_add(1),
                Ordering::AcqRel,
                Ordering::Relaxed,
            ) {
                Ok(_) => {
                    let index = head & self.mask;
                    unsafe {
                        *self.buffer[index].get() = item;
                    }
                    return Ok(());
                }
                Err(actual) => head = actual,
            }
        }
    }
}`,
    patchDiff: `@@ -1,22 +1,38 @@
-pub struct LockFreeRingBuffer<T: Copy> {
-    buffer: Vec<T>,
+pub struct LockFreeRingBuffer<T: Copy> {
+    buffer: Box<[UnsafeCell<T>]>,
+    mask: usize,
+    head: AtomicUsize,
+    tail: AtomicUsize,
+}
+...
+        // Atomic compare_exchange_weak loop with power-of-two bitwise mask index`,
    regressionSuiteDescription: 'Zero-copy 10,000,000 samples throughput test across 16 producer and 16 consumer threads with thread sanitizer (TSan).',
    baselinePassRate: 28,
    aegisPassRate: 96,
    tokensAvg: 7800,
    latencySeconds: 5.4
  },
  {
    id: 'aegis-004',
    title: 'Resolve JWT Expiration Bypass and Clock-Skew Edge Case',
    category: 'bug_fixing',
    difficulty: 'Medium',
    language: 'TypeScript',
    description: 'JWT validator incorrectly trusts expired tokens during minor server clock drifts and fails to enforce required nbf/exp claims correctly.',
    reproCommand: 'npm test -- --testPathPattern=jwtAuth.spec.ts',
    initialCode: `export function verifyJwtToken(token: string, secret: string): { valid: boolean; payload?: any } {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };
  
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
  const now = Math.floor(Date.now() / 1000);
  
  // BUG: Missing signature HMAC validation and allows tokens if exp is null or string type
  if (payload.exp && payload.exp < now) {
    return { valid: false };
  }
  return { valid: true, payload };
}`,
    failingTrace: `Error: expect(verifyJwtToken(tamperedExpiredToken, secret).valid).toBe(false)
Expected: false
Received: true
Test case: "should reject expired token with forged exp string timestamp '9999999999'"
Failure Taxonomy: SECURITY_VIOLATION / LOGIC_FLAW`,
    expectedRootCause: 'Type coercion vulnerability and missing HMAC-SHA256 signature verification allow attackers to modify the exp payload without detection.',
    fixedCode: `import crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  exp: number;
  nbf?: number;
  iat?: number;
  [key: string]: any;
}

export function verifyJwtToken(
  token: string, 
  secret: string, 
  clockToleranceSec: number = 30
): { valid: boolean; payload?: JwtPayload; error?: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed JWT structure' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  
  // 1. Verify Signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(\`\${headerB64}.\${payloadB64}\`)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSig))) {
    return { valid: false, error: 'Invalid cryptographic signature' };
  }

  // 2. Parse Payload
  let payload: JwtPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  } catch {
    return { valid: false, error: 'Invalid JSON payload' };
  }

  const now = Math.floor(Date.now() / 1000);

  // 3. Strict exp claim validation
  if (typeof payload.exp !== 'number') {
    return { valid: false, error: 'Missing or malformed exp claim' };
  }
  if (payload.exp + clockToleranceSec <= now) {
    return { valid: false, error: 'Token expired' };
  }

  // 4. Not-before claim validation
  if (typeof payload.nbf === 'number' && payload.nbf - clockToleranceSec > now) {
    return { valid: false, error: 'Token not yet active (nbf)' };
  }

  return { valid: true, payload };
}`,
    patchDiff: `@@ -4,8 +4,28 @@
+  // Cryptographic constant-time HMAC verification
+  const expectedSig = crypto.createHmac('sha256', secret)...
+  if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSig))) {
+    return { valid: false, error: 'Invalid cryptographic signature' };
+  }
+  // Strict number type check and clock tolerance handling`,
    regressionSuiteDescription: 'Cryptographic test suite testing alg:none attacks, tampered signatures, negative exp timestamps, expired claims with 29s and 31s clock drift.',
    baselinePassRate: 52,
    aegisPassRate: 100,
    tokensAvg: 4100,
    latencySeconds: 2.7
  },
  {
    id: 'aegis-005',
    title: 'Fix Memory Leak in Python Circular Dependency Event Bus with Weakref',
    category: 'memory_leak',
    difficulty: 'Medium',
    language: 'Python',
    description: 'Long-running event subscriber subscriptions create cyclical self-references, preventing Python cyclic GC from reclaiming destroyed UI listener widgets.',
    reproCommand: 'pytest tests/test_event_bus_gc.py',
    initialCode: `class EventBus:
    def __init__(self):
        self._listeners = {}

    def subscribe(self, event_name: str, callback):
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        # BUG: Holds strong reference to bound method and object instance
        self._listeners[event_name].append(callback)

    def publish(self, event_name: str, *args, **kwargs):
        for cb in self._listeners.get(event_name, []):
            cb(*args, **kwargs)`,
    failingTrace: `AssertionError: Memory leak detected! 5000 Subscriber instances still alive in gc.get_objects() after explicit del.
    File "tests/test_event_bus_gc.py", line 34, in test_subscriber_garbage_collection
    Failure Taxonomy: RESOURCE_EXHAUSTION / MEMORY_LEAK`,
    expectedRootCause: 'Strong bound method references retain the enclosing class instance in `self._listeners`, preventing ref count zero and defeating cleanup.',
    fixedCode: `import weakref

class EventBus:
    def __init__(self):
        self._listeners = {}

    def subscribe(self, event_name: str, callback):
        if event_name not in self._listeners:
            self._listeners[event_name] = []
            
        if hasattr(callback, '__self__') and callback.__self__ is not None:
            # Bound method: store WeakMethod
            ref = weakref.WeakMethod(callback, self._cleanup_dead_ref(event_name))
        else:
            # Plain function: store weakref
            ref = weakref.ref(callback, self._cleanup_dead_ref(event_name))
            
        self._listeners[event_name].append(ref)

    def _cleanup_dead_ref(self, event_name: str):
        def callback(dead_ref):
            if event_name in self._listeners:
                self._listeners[event_name] = [r for r in self._listeners[event_name] if r != dead_ref]
        return callback

    def publish(self, event_name: str, *args, **kwargs):
        dead_refs = []
        for ref in self._listeners.get(event_name, []):
            cb = ref()
            if cb is not None:
                cb(*args, **kwargs)
            else:
                dead_refs.append(ref)
        if dead_refs and event_name in self._listeners:
            self._listeners[event_name] = [r for r in self._listeners[event_name] if r not in dead_refs]`,
    patchDiff: `@@ -4,6 +4,20 @@
-        self._listeners[event_name].append(callback)
+        if hasattr(callback, '__self__') and callback.__self__ is not None:
+            ref = weakref.WeakMethod(callback, self._cleanup_dead_ref(event_name))
+        else:
+            ref = weakref.ref(callback, self._cleanup_dead_ref(event_name))
+        self._listeners[event_name].append(ref)`,
    regressionSuiteDescription: 'Generates 50,000 short-lived subscriber objects and asserts RSS memory delta remains < 2MB with 0 uncollected garbage cycles.',
    baselinePassRate: 46,
    aegisPassRate: 97,
    tokensAvg: 4800,
    latencySeconds: 3.1
  },
  {
    id: 'aegis-006',
    title: 'Fix Channel Deadlock in Go Distributed Raft Heartbeat Dispatcher',
    category: 'concurrency_race',
    difficulty: 'Codex-Core',
    language: 'Go',
    description: 'Under cluster partition, unbuffered RPC response channels cause sender goroutines to block indefinitely when peers are disconnected, exhausting goroutine pool.',
    reproCommand: 'go test -v -race -run TestRaftHeartbeatPartition ./consensus/...',
    initialCode: `package consensus

import "time"

type RaftNode struct {
    peers    []string
    term     uint64
    stopChan chan struct{}
}

func (r *RaftNode) broadcastHeartbeats() {
    respChan := make(chan bool) // BUG: Unbuffered channel blocks goroutines if slow/dropped
    for _, peer := range r.peers {
        go func(p string) {
            ok := r.sendHeartbeatRPC(p, r.term)
            respChan <- ok // Blocks forever if receiver stops reading after quorum!
        }(peer)
    }
}`,
    failingTrace: `fatal error: all goroutines are asleep - deadlock!
goroutine 42 [chan send]:
consensus.(*RaftNode).broadcastHeartbeats.func1(0xc0000a4000, 0x1)
    /workspace/src/consensus/raft.go:17 +0x6b
FAIL    consensus    30.002s
Failure Taxonomy: TIMEOUT_DEADLOCK / RESOURCE_EXHAUSTION`,
    expectedRootCause: 'Unbuffered channel send in goroutines without timeout context or buffered capacity of len(peers) blocks sender goroutines permanently once quorum is achieved.',
    fixedCode: `package consensus

import (
    "context"
    "time"
)

type RaftNode struct {
    peers    []string
    term     uint64
    stopChan chan struct{}
}

func (r *RaftNode) broadcastHeartbeats(ctx context.Context) {
    // Buffered channel prevents sender goroutines from leaking
    respChan := make(chan bool, len(r.peers))
    for _, peer := range r.peers {
        go func(p string) {
            select {
            case <-ctx.Done():
                return
            default:
                ok := r.sendHeartbeatRPC(p, r.term)
                select {
                case respChan <- ok:
                case <-ctx.Done():
                }
            }
        }(peer)
    }
}`,
    patchDiff: `@@ -11,6 +11,10 @@
-    respChan := make(chan bool)
+    respChan := make(chan bool, len(r.peers))
     for _, peer := range r.peers {
         go func(p string) {
+            select {
+            case <-ctx.Done(): return
+            default:`,
    regressionSuiteDescription: 'Go race detector stress test running 10,000 simulated split-brain heartbeat rounds with zero goroutine leaks.',
    baselinePassRate: 38,
    aegisPassRate: 98,
    tokensAvg: 5400,
    latencySeconds: 3.4
  },
  {
    id: 'aegis-007',
    title: 'Fix Double Free & Use-After-Move in C++20 Lockless Work-Stealing Queue',
    category: 'memory_leak',
    difficulty: 'Codex-Core',
    language: 'C++',
    description: 'Work-stealing deque uses raw pointer swaps without atomic memory ordering, causing concurrent steal operations to double free task buffers under high contention.',
    reproCommand: 'ctest --output-on-failure -R WorkStealDequeStress',
    initialCode: `#include <atomic>
#include <memory>
#include <vector>

template <typename T>
class WorkStealingQueue {
    std::vector<T*> buffer_;
    std::atomic<int64_t> top_{0};
    std::atomic<int64_t> bottom_{0};
public:
    void push(T* item) {
        int64_t b = bottom_.load(std::memory_order_relaxed);
        buffer_[b] = item;
        bottom_.store(b + 1, std::memory_order_relaxed); // BUG: Weak ordering violates acquire-release
    }
    T* steal() {
        int64_t t = top_.load(std::memory_order_relaxed);
        int64_t b = bottom_.load(std::memory_order_relaxed);
        if (t < b) {
            T* item = buffer_[t];
            top_.store(t + 1, std::memory_order_relaxed); // BUG: Race on top_ results in duplicate pointer steal
            return item;
        }
        return nullptr;
    }
};`,
    failingTrace: `AddressSanitizer: heap-use-after-free on address 0x603000000120
READ of size 8 at 0x603000000120 thread T2 (worker_thread_1)
    #0 0x40213d in WorkStealingQueue<Task>::steal() /workspace/include/queue.hpp:24
    #1 0x4016a2 in worker_loop(WorkStealingQueue<Task>*) /workspace/src/runtime.cpp:88
freed by thread T1 (worker_thread_0) here:
    #0 0x7f23c in free (/usr/lib/x86_64-linux-gnu/libasan.so.5+0xe8db0)
    #1 0x4017bc in Task::~Task() /workspace/src/task.cpp:12`,
    expectedRootCause: 'Absence of CAS (compare_exchange_strong) on `top_` and lack of acquire-release memory fences allows multiple thief threads to obtain and free the same pointer.',
    fixedCode: `#include <atomic>
#include <memory>
#include <vector>

template <typename T>
class WorkStealingQueue {
    std::vector<T*> buffer_;
    std::atomic<int64_t> top_{0};
    std::atomic<int64_t> bottom_{0};
public:
    void push(T* item) {
        int64_t b = bottom_.load(std::memory_order_relaxed);
        buffer_[b] = item;
        std::atomic_thread_fence(std::memory_order_release);
        bottom_.store(b + 1, std::memory_order_relaxed);
    }
    T* steal() {
        int64_t t = top_.load(std::memory_order_acquire);
        std::atomic_thread_fence(std::memory_order_seq_cst);
        int64_t b = bottom_.load(std::memory_order_acquire);
        if (t < b) {
            T* item = buffer_[t];
            if (top_.compare_exchange_strong(t, t + 1, std::memory_order_seq_cst, std::memory_order_relaxed)) {
                return item;
            }
        }
        return nullptr;
    }
};`,
    patchDiff: `@@ -18,5 +18,7 @@
-            T* item = buffer_[t];
-            top_.store(t + 1, std::memory_order_relaxed);
-            return item;
+            T* item = buffer_[t];
+            if (top_.compare_exchange_strong(t, t + 1, std::memory_order_seq_cst, std::memory_order_relaxed)) {
+                return item;
+            }`,
    regressionSuiteDescription: 'ASan + ThreadSanitizer suite with 32 worker threads executing 5,000,000 work-stealing task migrations with 0 memory errors.',
    baselinePassRate: 22,
    aegisPassRate: 95,
    tokensAvg: 6900,
    latencySeconds: 4.6
  },
  {
    id: 'aegis-008',
    title: 'Fix Buffer Overflow in C POSIX Network Packet Parser',
    category: 'security_hardening',
    difficulty: 'Hard',
    language: 'C',
    description: 'Packet framing parser parses untrusted payload lengths directly into fixed stack buffer without integer overflow and size checks.',
    reproCommand: 'make test_packet_security CC=clang CFLAGS="-fsanitize=address"',
    initialCode: `#include <string.h>
#include <stdint.h>

#define MAX_PAYLOAD 512

typedef struct {
    uint16_t length;
    uint8_t  payload[MAX_PAYLOAD];
} Packet;

int parse_network_packet(const uint8_t *raw_buf, size_t raw_len, Packet *out_pkt) {
    if (raw_len < 2) return -1;
    // BUG: Big-endian length read directly copied without verifying raw_len
    uint16_t declared_len = (raw_buf[0] << 8) | raw_buf[1];
    out_pkt->length = declared_len;
    // Overflows out_pkt->payload if declared_len > MAX_PAYLOAD or raw_len < declared_len + 2
    memcpy(out_pkt->payload, raw_buf + 2, declared_len);
    return 0;
}`,
    failingTrace: `=================================================================
==19448==ERROR: AddressSanitizer: global-buffer-overflow on address 0x000000406080
WRITE of size 1024 at 0x000000406080 thread T0
    #0 0x7fa2c0 in memcpy
    #1 0x401290 in parse_network_packet /workspace/src/pkt_parser.c:16
Failure Taxonomy: SECURITY_VIOLATION / BUFFER_OVERFLOW`,
    expectedRootCause: 'Untrusted packet payload length header is copied directly into fixed buffer without checking declared_len <= MAX_PAYLOAD and declared_len <= (raw_len - 2).',
    fixedCode: `#include <string.h>
#include <stdint.h>

#define MAX_PAYLOAD 512

typedef struct {
    uint16_t length;
    uint8_t  payload[MAX_PAYLOAD];
} Packet;

int parse_network_packet(const uint8_t *raw_buf, size_t raw_len, Packet *out_pkt) {
    if (!raw_buf || !out_pkt || raw_len < 2) return -1;
    
    uint16_t declared_len = ((uint16_t)raw_buf[0] << 8) | (uint16_t)raw_buf[1];
    
    // Validate length boundaries strictly
    if (declared_len > MAX_PAYLOAD || declared_len > (raw_len - 2)) {
        return -2; // Malformed / oversized packet
    }
    
    out_pkt->length = declared_len;
    memcpy(out_pkt->payload, raw_buf + 2, declared_len);
    return 0;
}`,
    patchDiff: `@@ -12,4 +12,7 @@
+    if (!raw_buf || !out_pkt || raw_len < 2) return -1;
     uint16_t declared_len = ((uint16_t)raw_buf[0] << 8) | (uint16_t)raw_buf[1];
+    if (declared_len > MAX_PAYLOAD || declared_len > (raw_len - 2)) {
+        return -2;
+    }`,
    regressionSuiteDescription: 'Fuzzing harness testing 1,000,000 mutated network frames with AddressSanitizer and UndefinedBehaviorSanitizer.',
    baselinePassRate: 45,
    aegisPassRate: 100,
    tokensAvg: 3800,
    latencySeconds: 2.4
  },
  {
    id: 'aegis-009',
    title: 'Resolve Hibernate N+1 and Transactional Deadlock in Java Spring Boot',
    category: 'sql_database',
    difficulty: 'Hard',
    language: 'Java',
    description: 'Nested lazy-loaded entity relationships in e-commerce checkout trigger N+1 queries under concurrent order placements, exhausting JDBC connection pool.',
    reproCommand: 'mvn test -Dtest=OrderCheckoutServiceConcurrencyTest',
    initialCode: `@Service
public class OrderCheckoutService {
    @Autowired
    private OrderRepository orderRepo;
    
    @Transactional
    public void processPendingOrders(List<Long> orderIds) {
        for (Long id : orderIds) {
            // BUG: Triggers N+1 SELECT for each order item and customer profile
            Order order = orderRepo.findById(id).orElseThrow();
            for (OrderItem item : order.getItems()) {
                item.getProduct().decrementStock(item.getQuantity());
            }
            order.setStatus(OrderStatus.COMPLETED);
        }
    }
}`,
    failingTrace: `org.hibernate.exception.GenericJDBCException: Unable to acquire JDBC Connection [HikariPool-1 - Connection is not available, request timed out after 30000ms]
    at org.hibernate.engine.jdbc.internal.JdbcCoordinatorImpl.coordinateWork(JdbcCoordinatorImpl.java:274)
    at com.aegis.service.OrderCheckoutService.processPendingOrders(OrderCheckoutService.java:18)
Failure Taxonomy: RESOURCE_EXHAUSTION / DATABASE_DEADLOCK`,
    expectedRootCause: 'Missing JOIN FETCH batching on entity collection relations combined with holding long-running transactional locks across multiple orders leads to connection pool starvation.',
    fixedCode: `@Service
public class OrderCheckoutService {
    @Autowired
    private OrderRepository orderRepo;
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void processPendingOrders(List<Long> orderIds) {
        if (orderIds.isEmpty()) return;
        // Batch fetch with JOIN FETCH to eliminate N+1 and lock reduction
        List<Order> orders = orderRepo.findAllWithItemsAndProductsByIdIn(orderIds);
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                item.getProduct().decrementStock(item.getQuantity());
            }
            order.setStatus(OrderStatus.COMPLETED);
        }
    }
}`,
    patchDiff: `@@ -7,7 +7,6 @@
-        for (Long id : orderIds) {
-            Order order = orderRepo.findById(id).orElseThrow();
+        List<Order> orders = orderRepo.findAllWithItemsAndProductsByIdIn(orderIds);
+        for (Order order : orders) {`,
    regressionSuiteDescription: 'Verifies 500 concurrent checkout transactions executing with <5 database round-trips and zero connection timeouts.',
    baselinePassRate: 50,
    aegisPassRate: 96,
    tokensAvg: 4400,
    latencySeconds: 3.2
  },
  {
    id: 'aegis-010',
    title: 'Fix Kotlin Coroutine Structured Concurrency Scope Cancellation Leak',
    category: 'concurrency_race',
    difficulty: 'Medium',
    language: 'Kotlin',
    description: 'GlobalScope async launch escapes parent supervisor lifecycle, causing background network polling jobs to continue running after ViewModel is cleared.',
    reproCommand: 'gradle test --tests "com.aegis.TelemetryViewModelTest"',
    initialCode: `class TelemetryViewModel : ViewModel() {
    fun startTelemetryStream() {
        // BUG: GlobalScope ignores ViewModel cancellation and leaks coroutine
        GlobalScope.launch(Dispatchers.IO) {
            while (true) {
                val stats = fetchDeviceMetrics()
                _telemetryFlow.emit(stats)
                delay(1000)
            }
        }
    }
}`,
    failingTrace: `AssertionError: Coroutine leak detected! 10 active child jobs still running in Dispatchers.IO after ViewModel.onCleared()
    at com.aegis.TelemetryViewModelTest.testViewModelCleansUpOnDestroy(TelemetryViewModelTest.kt:45)
Failure Taxonomy: RESOURCE_EXHAUSTION / COROUTINE_LEAK`,
    expectedRootCause: 'Using unconfined `GlobalScope` instead of `viewModelScope` circumvents structured concurrency and fails to cancel children on lifecycle teardown.',
    fixedCode: `class TelemetryViewModel : ViewModel() {
    fun startTelemetryStream() {
        // Tied to viewModelScope: automatically cancelled when cleared
        viewModelScope.launch(Dispatchers.IO) {
            while (isActive) {
                val stats = fetchDeviceMetrics()
                _telemetryFlow.emit(stats)
                delay(1000)
            }
        }
    }
}`,
    patchDiff: `@@ -3,3 +3,3 @@
-        GlobalScope.launch(Dispatchers.IO) {
-            while (true) {
+        viewModelScope.launch(Dispatchers.IO) {
+            while (isActive) {`,
    regressionSuiteDescription: 'Validates 100 ViewModel destruction cycles with zero leaked Job handles in TestScope.',
    baselinePassRate: 64,
    aegisPassRate: 100,
    tokensAvg: 3200,
    latencySeconds: 2.1
  },
  {
    id: 'aegis-011',
    title: 'Fix Swift Actor Reentrancy State Corruption in Payment Processing',
    category: 'concurrency_race',
    difficulty: 'Hard',
    language: 'Swift',
    description: 'Swift actor reentrancy across suspension point (await) causes account balance checks to become invalidated before debit executes.',
    reproCommand: 'swift test --filter PaymentActorTests',
    initialCode: `actor BankAccountActor {
    var balance: Double = 1000.0

    func withdraw(amount: Double) async -> Bool {
        // BUG: Actor state can mutate during await authorization call!
        guard balance >= amount else { return false }
        
        let authorized = await paymentGateway.authorize(amount: amount)
        guard authorized else { return false }
        
        balance -= amount // Overdrawn if another withdraw happened during await
        return true
    }
}`,
    failingTrace: `Test Case '-[PaymentActorTests testConcurrentWithdrawal]' failed: Balance underflow detected. Expected >= 0.0, but got -800.0.
Failure Taxonomy: CONCURRENCY_RACE / ACTOR_REENTRANCY`,
    expectedRootCause: 'Actor suspension points allow interleaving of other actor messages. Invariant `balance >= amount` must be re-verified after the await suspension.',
    fixedCode: `actor BankAccountActor {
    var balance: Double = 1000.0

    func withdraw(amount: Double) async -> Bool {
        guard balance >= amount else { return false }
        
        let authorized = await paymentGateway.authorize(amount: amount)
        guard authorized else { return false }
        
        // Re-check invariant after actor resumed from await suspension point
        guard balance >= amount else { return false }
        balance -= amount
        return true
    }
}`,
    patchDiff: `@@ -8,2 +8,4 @@
         guard authorized else { return false }
+        // Re-verify balance post-suspension to prevent reentrancy double-spend
+        guard balance >= amount else { return false }
         balance -= amount`,
    regressionSuiteDescription: 'Executes 1,000 concurrent withdrawal tasks against single actor with randomized network authorization latencies.',
    baselinePassRate: 42,
    aegisPassRate: 98,
    tokensAvg: 3900,
    latencySeconds: 2.8
  },
  {
    id: 'aegis-012',
    title: 'Fix Deadlock in C# Async SemaphoreSlim and Task.Result Block',
    category: 'concurrency_race',
    difficulty: 'Medium',
    language: 'C#',
    description: 'Mixing sync `.Result` / `.Wait()` with `SemaphoreSlim.WaitAsync()` causes ASP.NET thread pool starvation and sync-over-async deadlock.',
    reproCommand: 'dotnet test --filter FullyQualifiedName~DistributedLockTests',
    initialCode: `public class DistributedResourceLock {
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public string GetProtectedData(string key) {
        // BUG: Sync-over-async .Result blocks threadpool thread while waiting for async release
        _semaphore.WaitAsync().Wait();
        try {
            return FetchDataInternalAsync(key).Result;
        } finally {
            _semaphore.Release();
        }
    }
}`,
    failingTrace: `System.AggregateException: One or more errors occurred. (Timeout waiting for semaphore lock)
 ---> System.TimeoutException: ThreadPool starvation detected
   at DistributedResourceLock.GetProtectedData(String key) in /workspace/src/ResourceLock.cs:line 8
Failure Taxonomy: TIMEOUT_DEADLOCK / SYNC_OVER_ASYNC`,
    expectedRootCause: 'Synchronous `.Wait()` on Task blocks the calling synchronization context, preventing asynchronous continuation completion.',
    fixedCode: `public class DistributedResourceLock {
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public async Task<string> GetProtectedDataAsync(string key, CancellationToken ct = default) {
        await _semaphore.WaitAsync(ct).ConfigureAwait(false);
        try {
            return await FetchDataInternalAsync(key).ConfigureAwait(false);
        } finally {
            _semaphore.Release();
        }
    }
}`,
    patchDiff: `@@ -4,6 +4,6 @@
-    public string GetProtectedData(string key) {
-        _semaphore.WaitAsync().Wait();
-        return FetchDataInternalAsync(key).Result;
+    public async Task<string> GetProtectedDataAsync(string key, CancellationToken ct = default) {
+        await _semaphore.WaitAsync(ct).ConfigureAwait(false);
+        return await FetchDataInternalAsync(key).ConfigureAwait(false);`,
    regressionSuiteDescription: '500 concurrent request threads under single-threaded ASP.NET synchronization context test.',
    baselinePassRate: 58,
    aegisPassRate: 100,
    tokensAvg: 3400,
    latencySeconds: 2.3
  },
  {
    id: 'aegis-013',
    title: 'Fix SQL Transaction Isolation Level Serialization Anomaly in PostgreSQL',
    category: 'sql_database',
    difficulty: 'Hard',
    language: 'SQL',
    description: 'Read-Committed isolation level allows write skew anomalies in hotel room booking reservation tables during concurrent checkouts.',
    reproCommand: 'pg_prove tests/test_booking_write_skew.sql',
    initialCode: `-- BUG: READ COMMITTED allows concurrent transactions to both see 0 active bookings and both insert
BEGIN;
SELECT COUNT(*) FROM room_reservations 
WHERE room_id = 101 AND status = 'CONFIRMED' AND checkin_date = '2026-09-01';

-- Application checks count == 0 and proceeds to insert in both threads
INSERT INTO room_reservations (room_id, guest_id, checkin_date, status) 
VALUES (101, 402, '2026-09-01', 'CONFIRMED');
COMMIT;`,
    failingTrace: `psql:test_booking.sql:24: ERROR: Overbooking violation! Room 101 double booked for 2026-09-01 by guests 402 and 403.
Failure Taxonomy: LOGIC_FLAW / TRANSACTION_ANOMALY`,
    expectedRootCause: 'Read Committed does not prevent write-skew. Solution requires SERIALIZABLE transaction isolation or SELECT ... FOR UPDATE / exclusion constraint.',
    fixedCode: `-- Use SERIALIZABLE or row-level pessimistic locking
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- Alternatively: SELECT * FROM rooms WHERE id = 101 FOR UPDATE;

SELECT COUNT(*) FROM room_reservations 
WHERE room_id = 101 AND status = 'CONFIRMED' AND checkin_date = '2026-09-01';

INSERT INTO room_reservations (room_id, guest_id, checkin_date, status) 
VALUES (101, 402, '2026-09-01', 'CONFIRMED');
COMMIT;`,
    patchDiff: `@@ -1,2 +1,3 @@
-BEGIN;
+BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
+-- Prevents concurrent write skew anomaly via SSI predicate locks`,
    regressionSuiteDescription: 'Simulates 200 concurrent booking attempts targeting 10 rooms with zero double-booking violations.',
    baselinePassRate: 35,
    aegisPassRate: 99,
    tokensAvg: 2800,
    latencySeconds: 1.9
  },
  {
    id: 'aegis-014',
    title: 'Fix POSIX Shell Pipeline Signal Handling & Trap Race in Bash Deployment Script',
    category: 'security_hardening',
    difficulty: 'Medium',
    language: 'Shell',
    description: 'Bash deployment worker fails to set `pipefail` and has unquoted variable expansion, leading to silent failures continuing on failed compiler commands.',
    reproCommand: 'bats tests/test_deploy_pipeline.bats',
    initialCode: `#!/usr/bin/env bash
# BUG: Missing set -euo pipefail allows pipeline error masking
TARGET_DIR=$1

build_and_deploy() {
    cargo build --release | tee build.log
    # If cargo build fails, tee exits with 0 and script continues dangerously!
    cp ./target/release/app $TARGET_DIR/bin/
}
build_and_deploy`,
    failingTrace: `bats test_deploy_pipeline.bats: Failed build copied stale old binary to /opt/production/bin/ without exiting!
Failure Taxonomy: RUNTIME_ERROR / SILENT_FAILURE`,
    expectedRootCause: 'Default bash shell behavior masks exit status of upstream pipe commands and fails silently without `set -euo pipefail`.',
    fixedCode: `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

readonly TARGET_DIR="\${1:?Error: Target directory must be provided}"

cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo "[ERROR] Deployment failed with exit status \${exit_code}" >&2
    fi
}
trap cleanup EXIT

build_and_deploy() {
    cargo build --release | tee build.log
    mkdir -p "\${TARGET_DIR}/bin"
    cp "./target/release/app" "\${TARGET_DIR}/bin/"
}
build_and_deploy`,
    patchDiff: `@@ -1,4 +1,7 @@
 #!/usr/bin/env bash
+set -euo pipefail
+IFS=$'\n\t'
+trap cleanup EXIT`,
    regressionSuiteDescription: 'Tests SIGINT, SIGTERM, failed subcommands, empty arguments, and paths with whitespace.',
    baselinePassRate: 55,
    aegisPassRate: 100,
    tokensAvg: 2400,
    latencySeconds: 1.5
  },
  {
    id: 'aegis-015',
    title: 'Fix GenServer Process Mailbox Overload in Elixir Real-Time Telemetry',
    category: 'resource_exhaustion',
    difficulty: 'Hard',
    language: 'Elixir',
    description: 'Unbounded `cast` calls in high-throughput IoT sensor ingestion flood GenServer message queue, causing out-of-memory VM crashes.',
    reproCommand: 'mix test test/telemetry_worker_test.exs',
    initialCode: `defmodule TelemetryWorker do
  use GenServer

  def push_metric(metric) do
    # BUG: Asynchronous cast without backpressure causes message queue explosion
    GenServer.cast(__MODULE__, {:metric, metric})
  end

  def handle_cast({:metric, metric}, state) do
    Process.sleep(10) # Simulates database write latency
    {:noreply, [metric | state]}
  end
end`,
    failingTrace: `** (EXIT) no process: the process is killed due to memory limit (Message queue length: 250,000)
Failure Taxonomy: RESOURCE_EXHAUSTION / MAILBOX_FLOOD`,
    expectedRootCause: 'Using asynchronous `cast` without backpressure or windowing allows fast producers to swamp slow consumers in the BEAM mailbox.',
    fixedCode: `defmodule TelemetryWorker do
  use GenServer

  # Enforce synchronous backpressure or bounded call
  def push_metric(metric, timeout \\\\ 5000) do
    GenServer.call(__MODULE__, {:metric, metric}, timeout)
  end

  def handle_call({:metric, metric}, _from, state) do
    # Write metric with managed batch buffer
    {:reply, :ok, [metric | state]}
  end
end`,
    patchDiff: `@@ -3,2 +3,2 @@
-  def push_metric(metric) do
-    GenServer.cast(__MODULE__, {:metric, metric})
+  def push_metric(metric, timeout \\\\ 5000) do
+    GenServer.call(__MODULE__, {:metric, metric}, timeout)`,
    regressionSuiteDescription: 'Ingestion rate test with 100,000 events/sec validating memory ceiling stays strictly under 64MB.',
    baselinePassRate: 40,
    aegisPassRate: 98,
    tokensAvg: 3600,
    latencySeconds: 2.5
  }
];
