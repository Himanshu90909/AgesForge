import { CommandRiskAnalysis, SandboxConfig } from '../types';

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  cpuLimitPercent: 80,
  ramLimitMb: 512,
  timeoutSeconds: 15,
  processLimit: 32,
  syscallIsolation: 'strict_seccomp',
  networkPolicy: 'deny_all',
  readOnlyBaseFs: true,
  tmpWorkspaceOverlay: true,
  autoCleanup: true,
  riskPolicyThreshold: 'auto_quarantine'
};

export function evaluateCommandRisk(command: string): CommandRiskAnalysis {
  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  // 1. BLOCK: Extremely dangerous destruction or escape attempts
  if (
    lower.includes('rm -rf /') ||
    lower.includes('rm -rf /*') ||
    lower.includes(':(){ :|:& };:') ||
    lower.includes('mkfs') ||
    lower.includes('dd if=/dev/zero') ||
    lower.includes('chmod -r 777 /') ||
    lower.includes('> /dev/sda') ||
    lower.includes('/etc/shadow')
  ) {
    return {
      command: trimmed,
      riskLevel: 'BLOCK',
      action: 'BLOCK',
      reason: 'Critical destructive or host filesystem destruction payload detected.',
      syscallRiskVector: ['SYS_unlinkat (root)', 'SYS_mount', 'SYS_reboot', 'SYS_kill'],
      suggestedAction: 'Immediate container isolation and security telemetry alert triggered.'
    };
  }

  // 2. HIGH RISK: Network egress, arbitrary socket connect, download & pipe, raw syscalls
  if (
    lower.startsWith('curl') ||
    lower.startsWith('wget') ||
    lower.includes('| sh') ||
    lower.includes('| bash') ||
    lower.includes('nc -e') ||
    lower.includes('ncat') ||
    lower.includes('socat') ||
    lower.startsWith('ssh') ||
    lower.includes('sudo') ||
    lower.includes('chroot')
  ) {
    return {
      command: trimmed,
      riskLevel: 'HIGH',
      action: 'REQUIRE_APPROVAL',
      reason: 'Network egress or unverified external binary execution detected.',
      syscallRiskVector: ['SYS_socket', 'SYS_connect', 'SYS_execve (external)'],
      suggestedAction: 'Require explicit security policy grant or proxy through sandboxed egress filter.'
    };
  }

  // 3. MEDIUM RISK: Package installations, build tools modifying environment
  if (
    lower.startsWith('pip install') ||
    lower.startsWith('npm install') ||
    lower.startsWith('cargo install') ||
    lower.startsWith('apt-get') ||
    lower.startsWith('yum') ||
    lower.startsWith('export ') ||
    lower.startsWith('git clone')
  ) {
    return {
      command: trimmed,
      riskLevel: 'MEDIUM',
      action: 'RESTRICT',
      reason: 'Environment mutation or external dependency installation.',
      syscallRiskVector: ['SYS_write (lib/modules)', 'SYS_execve', 'SYS_mprotect'],
      suggestedAction: 'Execute in ephemeral tmpfs workspace with copy-on-write overlay.'
    };
  }

  // 4. LOW RISK: Standard build, test, compilation, and file inspection
  return {
    command: trimmed,
    riskLevel: 'LOW',
    action: 'ALLOW',
    reason: 'Standard read/test/compile operation within sandboxed directory.',
    syscallRiskVector: ['SYS_read', 'SYS_write (local)', 'SYS_stat', 'SYS_futex'],
    suggestedAction: 'Execute safely with standard cgroups resource caps.'
  };
}
