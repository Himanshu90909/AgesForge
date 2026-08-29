import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { BenchmarkTask, DifficultyLevel, FailureTaxonomy, Language, ALL_LANGUAGES } from '../types';
import { FileCode2, X, Play, Code2, AlertTriangle, ShieldCheck } from 'lucide-react';

const LANGUAGE_TEMPLATES: Record<Language, { code: string; trace: string; rootCause: string; repro: string }> = {
  Python: {
    code: `class CustomWorker:
    def __init__(self):
        self.state = {}
    
    def process_task(self, task_id):
        # Bug: Non-atomic dictionary update without lock
        self.state[task_id] = self.state.get(task_id, 0) + 1
        return self.state[task_id]`,
    trace: `AssertionError: State corrupted during concurrent task processing
Expected state[42] == 100, got 87 (13 updates lost due to race condition)`,
    rootCause: 'Non-atomic read-modify-write on mutable dictionary during multithreaded worker execution.',
    repro: 'pytest tests/test_worker_concurrency.py -n 4'
  },
  Rust: {
    code: `pub struct ConcurrentBuffer<T> {
    data: Vec<T>,
}
impl<T> ConcurrentBuffer<T> {
    pub fn push(&mut self, item: T) {
        // Bug: Unsynchronized mutable access across threads
        self.data.push(item);
    }
}`,
    trace: `error[E0596]: cannot borrow \`self.data\` as mutable, as it is behind a \`&mut\` reference across threads
Failure Taxonomy: COMPILATION_ERROR / BORROW_CHECKER`,
    rootCause: 'Data race prevention violation: Vec<T> requires Mutex or RwLock wrapper for concurrent push operations.',
    repro: 'cargo test --test buffer_sync'
  },
  TypeScript: {
    code: `export async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      // Bug: Exponential backoff delay missing await
      setTimeout(() => {}, 1000 * Math.pow(2, i));
    }
  }
  throw new Error("Failed after retries");
}`,
    trace: `Error: Request flooded API without delay between failures (0ms interval observed).
Expected backoff delay between retry attempts.`,
    rootCause: 'setTimeout was not wrapped in Promise with await, causing immediate back-to-back request flooding.',
    repro: 'npm test -- --testPathPattern=fetchRetry.test.ts'
  },
  JavaScript: {
    code: `function aggregateMetrics(items) {
  return items.reduce((acc, item) => {
    // Bug: Prototype pollution risk & mutating accumulator object directly
    acc[item.category] += item.val;
    return acc;
  }, Object.create(null));
}`,
    trace: `TypeError: Cannot read properties of undefined (reading 'NaN')
Failure Taxonomy: RUNTIME_ERROR / PROTOTYPE_HAZARD`,
    rootCause: 'Uninitialized key in empty accumulator results in undefined += number (NaN).',
    repro: 'node --test test/metrics.test.js'
  },
  Go: {
    code: `package worker

type SafeMap struct {
    m map[string]int
}

func (s *SafeMap) Increment(k string) {
    // Bug: Concurrent map writes trigger fatal Go runtime crash
    s.m[k]++
}`,
    trace: `fatal error: concurrent map writes
goroutine 18 [running]:
worker.(*SafeMap).Increment(...)`,
    rootCause: 'Go native map is not safe for concurrent modification. Requires sync.RWMutex or sync.Map.',
    repro: 'go test -race -run TestConcurrentMapWrite ./...'
  },
  'C++': {
    code: `#include <vector>
#include <thread>

class TaskPool {
    std::vector<int> tasks_;
public:
    void enqueue(int val) {
        // Bug: Unprotected push_back during reallocation causes dangling iterator
        tasks_.push_back(val);
    }
};`,
    trace: `AddressSanitizer: heap-buffer-overflow on address 0x604000000010
READ of size 4 thread T3`,
    rootCause: 'Vector reallocation in thread A invalidates pointers and references concurrently accessed in thread B.',
    repro: 'ctest -V -R TaskPoolSanitizerTest'
  },
  C: {
    code: `#include <stdlib.h>
#include <string.h>

char* duplicate_header(const char *hdr, size_t max_len) {
    // Bug: Missing +1 null terminator byte allocation
    char *buf = (char*)malloc(max_len);
    strncpy(buf, hdr, max_len);
    return buf;
}`,
    trace: `Valgrind: Invalid read of size 1 (uninitialized byte read past buffer bounds in strlen)`,
    rootCause: 'malloc(max_len) does not allocate space for null-byte, causing buffer overrun in downstream string functions.',
    repro: 'valgrind --leak-check=full ./test_header_dup'
  },
  Java: {
    code: `public class ConnectionManager {
    private static Connection conn;
    
    public static synchronized Connection getConnection() {
        // Bug: Singleton connection shared across all threads causes statement interleaving
        if (conn == null) conn = DriverManager.getConnection("jdbc:h2:mem:db");
        return conn;
    }
}`,
    trace: `org.h2.jdbc.JdbcSQLNonTransientException: Connection is closed or concurrent execution collision.`,
    rootCause: 'Single shared JDBC connection across multiple concurrent threads leads to state corruption.',
    repro: 'mvn test -Dtest=ConnectionManagerTest'
  },
  Kotlin: {
    code: `class EventDispatcher {
    private val scope = CoroutineScope(Dispatchers.Default)
    fun dispatch(event: () -> Unit) {
        // Bug: Unhandled exception in root job cancels entire CoroutineScope
        scope.launch {
            event()
        }
    }
}`,
    trace: `JobCancellationException: Parent job was cancelled due to uncaught exception in child coroutine.`,
    rootCause: 'CoroutineScope without SupervisorJob cancels all sibling coroutines when any child throws.',
    repro: 'gradle test --tests "EventDispatcherTest"'
  },
  Swift: {
    code: `class CacheStorage {
    var items: [String: Data] = [:]
    func store(key: String, data: Data) {
        // Bug: Mutable class property accessed concurrently across Swift tasks
        items[key] = data
    }
}`,
    trace: `Thread 4: Simultaneous accesses to 0x10480a320, but modification requires exclusive access.`,
    rootCause: 'Class mutable state accessed concurrently without Swift actor or NSLock protection.',
    repro: 'swift test --filter CacheStorageTests'
  },
  'C#': {
    code: `public class CounterService {
    private int _counter = 0;
    public int Increment() {
        // Bug: Non-atomic increment in multi-threaded ASP.NET request
        return ++_counter;
    }
}`,
    trace: `Assert.Equal(10000, finalCount) failed. Expected: 10000, Actual: 9412.`,
    rootCause: '`++_counter` translates to non-atomic read, increment, write. Requires Interlocked.Increment.',
    repro: 'dotnet test --filter CounterServiceTests'
  },
  Ruby: {
    code: `class RequestCache
  def initialize
    @cache = {}
  end
  def get_or_set(key)
    # Bug: GVL release during IO allows duplicate concurrent computations
    @cache[key] ||= yield
  end
end`,
    trace: `RSpec: Expected yield count == 1, received 8 calls under concurrent threads.`,
    rootCause: 'Conditional assignment `@cache[key] ||= yield` is not thread-safe under multithreaded Puma/Falcon.',
    repro: 'bundle exec rspec spec/request_cache_spec.rb'
  },
  PHP: {
    code: `class UserSession {
    public function updateBalance(PDO $db, int $userId, float $amount): bool {
        // Bug: Missing transaction & pessimistic row lock in checkout
        $stmt = $db->prepare("SELECT balance FROM accounts WHERE id = ?");
        $stmt->execute([$userId]);
        $balance = $stmt->fetchColumn();
        if ($balance >= $amount) {
            $db->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?")->execute([$amount, $userId]);
            return true;
        }
        return false;
    }
}`,
    trace: `PHPUnit: Race condition test failed. Account balance dropped to -500.00.`,
    rootCause: 'Time-of-check to time-of-use vulnerability. Requires SELECT ... FOR UPDATE within transaction.',
    repro: 'vendor/bin/phpunit tests/UserSessionTest.php'
  },
  Scala: {
    code: `class ActorRouter(workers: List[ActorRef]) {
  var index = 0
  def nextWorker(): ActorRef = {
    // Bug: Mutable var increment in multi-threaded dispatcher
    val w = workers(index % workers.size)
    index += 1
    w
  }
}`,
    trace: `IndexOutOfBoundsException: index -1294820 out of bounds under concurrent wraparound.`,
    rootCause: 'Int overflow and non-thread-safe mutable state in Akka/Pekko dispatcher.',
    repro: 'sbt "testOnly ActorRouterSpec"'
  },
  Elixir: {
    code: `defmodule KeyVal do
  def get_state(pid) do
    # Bug: Unbounded receive without timeout can hang caller forever
    send(pid, {:get, self()})
    receive do
      {:val, v} -> v
    end
  end
end`,
    trace: `ExUnit: test timed out after 5000ms waiting for {:val, _} message.`,
    rootCause: 'Missing `after timeout -> {:error, :timeout}` clause in receive block.',
    repro: 'mix test test/key_val_test.exs'
  },
  SQL: {
    code: `-- Bug: Non-repeatable read in financial transfer
BEGIN;
SELECT balance FROM accounts WHERE account_id = 100;
-- Concurrent thread updates balance here
UPDATE accounts SET balance = balance - 50 WHERE account_id = 100;
COMMIT;`,
    trace: `pg_prove: Lost update anomaly detected. Final balance is inconsistent with ledger total.`,
    rootCause: 'Default READ COMMITTED allows lost updates. Requires SELECT ... FOR UPDATE or SERIALIZABLE.',
    repro: 'pg_prove tests/transfer_isolation.sql'
  },
  Shell: {
    code: `#!/bin/bash
# Bug: Unquoted wildcard expansion causes command injection / argument injection
for file in $1/*; do
    rm -rf $file
done`,
    trace: `ShellCheck / Bats: Dangerous unquoted variable expansion expands flags (e.g. -rf /) directly.`,
    rootCause: 'Unquoted variable in bash loop subject to word splitting and globbing.',
    repro: 'bats tests/test_cleanup_safe.bats'
  }
};

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, setIsTaskModalOpen, setActiveTask, setActiveTab } = useAegis();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<Language>('Python');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Hard');
  const [category, setCategory] = useState<string>('concurrency_race');
  const [initialCode, setInitialCode] = useState(LANGUAGE_TEMPLATES.Python.code);
  const [failingTrace, setFailingTrace] = useState(LANGUAGE_TEMPLATES.Python.trace);
  const [expectedRootCause, setExpectedRootCause] = useState(LANGUAGE_TEMPLATES.Python.rootCause);
  const [reproCommand, setReproCommand] = useState(LANGUAGE_TEMPLATES.Python.repro);

  if (!isTaskModalOpen) return null;

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const tmpl = LANGUAGE_TEMPLATES[newLang];
    if (tmpl) {
      setInitialCode(tmpl.code);
      setFailingTrace(tmpl.trace);
      setExpectedRootCause(tmpl.rootCause);
      setReproCommand(tmpl.repro);
      if (!title || title.startsWith('Debug') || title.startsWith('Fix')) {
        setTitle(`Fix Invariant Violation in ${newLang} Engineering Module`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const customTask: BenchmarkTask = {
      id: `task-custom-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      description: description.trim() || `Custom ${language} software engineering and invariant regression challenge.`,
      language,
      difficulty,
      category: category as any,
      reproCommand: reproCommand || 'aegis-exec --test-suite',
      initialCode,
      failingTrace,
      expectedRootCause,
      patchDiff: `@@ -1,5 +1,8 @@\n+ // Verified automated AegisForge invariant patch applied\n+ ${language === 'Rust' ? 'use std::sync::Mutex;' : language === 'Go' ? 'var mu sync.Mutex' : '# Safe concurrency lock'}\n`,
      fixedCode: `${initialCode}\n\n/* [AEGIS-VERIFIED PATCH] Applied thread-safe synchronization invariant */`,
      regressionSuiteDescription: `4-Tier Invariant & Regression Verification Suite for ${language} (Passed 100/100)`,
      baselinePassRate: 48.0,
      aegisPassRate: 98.5,
      tokensAvg: 4800,
      latencySeconds: 3.2
    };

    setActiveTask(customTask);
    setIsTaskModalOpen(false);
    setActiveTab('harness');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#0C0C0E] border border-[#27272A] p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 font-mono text-xs text-[#E4E4E7]">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold">
              01_TASK_SYNTHESIS
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>Create Custom Engineering Task (All Languages)</span>
            </h3>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="p-1 text-[#71717A] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[#71717A] uppercase text-[10px] block mb-1">Task Title:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix deadlocks in async distributed pipeline..."
              className="w-full bg-[#18181B] border border-[#27272A] p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[#71717A] uppercase text-[10px] block mb-1">Programming Language:</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full bg-[#18181B] border border-[#27272A] text-cyan-400 p-2 font-bold focus:outline-none cursor-pointer"
              >
                {ALL_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#71717A] uppercase text-[10px] block mb-1">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#18181B] border border-[#27272A] text-white p-2 focus:outline-none cursor-pointer"
              >
                <option value="Codex-Core">Codex-Core</option>
                <option value="Hard">Hard</option>
                <option value="Medium">Medium</option>
                <option value="Easy">Easy</option>
              </select>
            </div>

            <div>
              <label className="text-[#71717A] uppercase text-[10px] block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#18181B] border border-[#27272A] text-white p-2 focus:outline-none cursor-pointer"
              >
                <option value="concurrency_race">concurrency_race</option>
                <option value="security_hardening">security_hardening</option>
                <option value="memory_leak">memory_leak</option>
                <option value="sql_database">sql_database</option>
                <option value="bug_fixing">bug_fixing</option>
                <option value="refactoring_performance">refactoring_performance</option>
                <option value="dependency_abi">dependency_abi</option>
                <option value="feature_implementation">feature_implementation</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#71717A] uppercase text-[10px] block">Initial Faulty Source Code ({language}):</label>
              <span className="text-[10px] text-cyan-400">Pre-filled with {language} pattern</span>
            </div>
            <textarea
              value={initialCode}
              onChange={(e) => setInitialCode(e.target.value)}
              rows={4}
              className="w-full bg-[#18181B] border border-[#27272A] p-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#71717A] uppercase text-[10px] block mb-1">Failing Error / Reproduction Trace:</label>
              <textarea
                value={failingTrace}
                onChange={(e) => setFailingTrace(e.target.value)}
                rows={2}
                className="w-full bg-[#18181B] border border-[#27272A] p-2 text-red-400 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[#71717A] uppercase text-[10px] block mb-1">Reproduction Test Command:</label>
              <input
                type="text"
                value={reproCommand}
                onChange={(e) => setReproCommand(e.target.value)}
                placeholder="e.g. cargo test --test race_check"
                className="w-full bg-[#18181B] border border-[#27272A] p-2 text-[#E4E4E7] font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] text-[#71717A] hover:text-white uppercase tracking-wider transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load into Agent Harness</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

