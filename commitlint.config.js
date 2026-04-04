# ═══════════════════════════════════════════════════════════════
# Commitlint Configuration
# Conventional Commits
# ═══════════════════════════════════════════════════════════════

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação, ponto e vírgula, etc
        'refactor', // Refatoração
        'perf',     // Performance
        'test',     // Testes
        'build',    // Build, dependências
        'ci',       // CI/CD
        'chore',    // Tarefas de manutenção
        'revert',   // Reverter commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};