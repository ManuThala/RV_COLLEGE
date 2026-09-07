/**
 * Comprehensive validation script for CyberShield requirements
 * Run with: npx ts-node validate-requirements.ts
 */

import { level1Questions } from './src/data/level1Questions'
import { level2Questions } from './src/data/level2Questions'
import { level3Rounds } from './src/data/level3Rounds'
import { level4Rounds } from './src/data/level4Rounds'
import { level5Scenarios } from './src/data/level5Scenarios'
import { quizSets } from './src/data/quizSets'
import { LEVEL_DEFINITIONS } from './src/services/gameService'

console.log('='.repeat(80))
console.log('CyberShield: Automated Requirement Validation')
console.log('='.repeat(80))

// ===== Test 1: Level structure and timers =====
console.log('\n[1] LEVEL STRUCTURE AND TIMERS')
const levelTimers = [30, 45, 45, 30, 60]
LEVEL_DEFINITIONS.forEach((def, index) => {
  const expected = levelTimers[index]
  const pass = def.timer === expected
  console.log(`  Level ${def.id} Timer: ${def.timer}s (expected ${expected}s) [${pass ? 'PASS' : 'FAIL'}]`)
})

// ===== Test 2: Level 1 - 30 questions, 5 options each =====
console.log('\n[2] LEVEL 1 - QUESTION COUNT & OPTIONS')
console.log(`  Total questions: ${level1Questions.length} (expected 30) [${level1Questions.length === 30 ? 'PASS' : 'FAIL'}]`)
const l1InvalidOptions = level1Questions.filter((q) => q.options.length !== 5)
console.log(`  Questions with 5 options: ${level1Questions.length - l1InvalidOptions.length}/${level1Questions.length} [${l1InvalidOptions.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l1InvalidOptions.length > 0) {
  console.log(`    Issues: ${l1InvalidOptions.map((q) => `${q.id} has ${q.options.length} options`).join(', ')}`)
}

// ===== Test 3: Level 2 - 50 questions, 5 options each =====
console.log('\n[3] LEVEL 2 - QUESTION COUNT & OPTIONS')
console.log(`  Total questions: ${level2Questions.length} (expected 50) [${level2Questions.length === 50 ? 'PASS' : 'FAIL'}]`)
const l2InvalidOptions = level2Questions.filter((q) => q.options.length !== 5)
console.log(`  Questions with 5 options: ${level2Questions.length - l2InvalidOptions.length}/${level2Questions.length} [${l2InvalidOptions.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l2InvalidOptions.length > 0) {
  console.log(`    Issues: ${l2InvalidOptions.map((q) => `${q.id} has ${q.options.length} options`).join(', ')}`)
}

// ===== Test 4: Level 3 - 30 rounds, 5 emails per round =====
console.log('\n[4] LEVEL 3 - ROUND COUNT & EMAILS PER ROUND')
console.log(`  Total rounds: ${level3Rounds.length} (expected 30) [${level3Rounds.length === 30 ? 'PASS' : 'FAIL'}]`)
const l3InvalidEmails = level3Rounds.filter((r) => r.emails.length !== 5)
console.log(`  Rounds with 5 emails: ${level3Rounds.length - l3InvalidEmails.length}/${level3Rounds.length} [${l3InvalidEmails.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l3InvalidEmails.length > 0) {
  console.log(`    Issues: ${l3InvalidEmails.map((r) => `${r.id} has ${r.emails.length} emails`).join(', ')}`)
}

// ===== Test 5: Level 4 - 30 rounds, 5 files per round =====
console.log('\n[5] LEVEL 4 - ROUND COUNT & FILES PER ROUND')
console.log(`  Total rounds: ${level4Rounds.length} (expected 30) [${level4Rounds.length === 30 ? 'PASS' : 'FAIL'}]`)
const l4InvalidFiles = level4Rounds.filter((r) => r.files.length !== 5)
console.log(`  Rounds with 5 files: ${level4Rounds.length - l4InvalidFiles.length}/${level4Rounds.length} [${l4InvalidFiles.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l4InvalidFiles.length > 0) {
  console.log(`    Issues: ${l4InvalidFiles.map((r) => `${r.id} has ${r.files.length} files`).join(', ')}`)
}

// ===== Test 6: Level 5 - 40 scenarios =====
console.log('\n[6] LEVEL 5 - SCENARIO COUNT')
console.log(`  Total scenarios: ${level5Scenarios.length} (expected 40) [${level5Scenarios.length === 40 ? 'PASS' : 'FAIL'}]`)

// ===== Test 7: Level 5 - Action counts (6-10 per scenario) =====
console.log('\n[7] LEVEL 5 - ACTIONS PER SCENARIO (6-10 required)')
const l5ActionIssues = level5Scenarios.filter((s) => s.actions.length < 6 || s.actions.length > 10)
console.log(`  Scenarios with 6-10 actions: ${level5Scenarios.length - l5ActionIssues.length}/${level5Scenarios.length} [${l5ActionIssues.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l5ActionIssues.length > 0) {
  console.log(`    Issues: ${l5ActionIssues.map((s) => `${s.id} has ${s.actions.length} actions`).join(', ')}`)
}

// ===== Test 8: Level 5 - Correct action counts (4-6 per scenario) =====
console.log('\n[8] LEVEL 5 - CORRECT ACTIONS PER SCENARIO (4-6 required)')
const l5CorrectIssues = level5Scenarios.filter(
  (s) => s.correctActionIds.length < 4 || s.correctActionIds.length > 6,
)
console.log(
  `  Scenarios with 4-6 correct actions: ${level5Scenarios.length - l5CorrectIssues.length}/${level5Scenarios.length} [${l5CorrectIssues.length === 0 ? 'PASS' : 'FAIL'}]`,
)
if (l5CorrectIssues.length > 0) {
  console.log(`    Issues: ${l5CorrectIssues.map((s) => `${s.id} has ${s.correctActionIds.length} correct`).join(', ')}`)
}

// ===== Test 9: Level 5 - Category distribution =====
console.log('\n[9] LEVEL 5 - CATEGORY DISTRIBUTION (8,8,6,6,5,3,2,2 expected)')
const categoryMap: Record<string, number> = {}
level5Scenarios.forEach((s) => {
  categoryMap[s.category] = (categoryMap[s.category] ?? 0) + 1
})
const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
console.log(`  Category breakdown:`)
categories.forEach(([cat, count]) => {
  console.log(`    ${cat}: ${count}`)
})
const expectedDist = [8, 8, 6, 6, 5, 3, 2, 2]
const actualDist = categories.map(([, count]) => count).sort((a, b) => b - a)
const distMatch = JSON.stringify(expectedDist) === JSON.stringify(actualDist)
console.log(`  Distribution match: [${actualDist.join(', ')}] [${distMatch ? 'PASS' : 'FAIL'}]`)

// ===== Test 10: Quiz Sets Count =====
console.log('\n[10] QUIZ SETS COUNT')
console.log(`  Total sets: ${quizSets.length} (expected 10) [${quizSets.length === 10 ? 'PASS' : 'FAIL'}]`)

// ===== Test 11: Quiz Sets - Reference Resolution =====
console.log('\n[11] QUIZ SETS - REFERENCE RESOLUTION')
const l1Ids = new Set(level1Questions.map((q) => q.id))
const l2Ids = new Set(level2Questions.map((q) => q.id))
const l3Ids = new Set(level3Rounds.map((r) => r.id))
const l4Ids = new Set(level4Rounds.map((r) => r.id))
const l5Ids = new Set(level5Scenarios.map((s) => s.id))

let refIssues = 0
quizSets.forEach((set) => {
  const issues: string[] = []
  if (!l1Ids.has(set.level1QuestionId)) issues.push(`L1 ${set.level1QuestionId} not found`)
  if (!l2Ids.has(set.level2QuestionId)) issues.push(`L2 ${set.level2QuestionId} not found`)
  if (!l3Ids.has(set.level3RoundId)) issues.push(`L3 ${set.level3RoundId} not found`)
  if (!l4Ids.has(set.level4RoundId)) issues.push(`L4 ${set.level4RoundId} not found`)
  if (!l5Ids.has(set.level5ScenarioId)) issues.push(`L5 ${set.level5ScenarioId} not found`)
  if (issues.length > 0) {
    console.log(`  ${set.id}: ${issues.join(', ')}`)
    refIssues += issues.length
  }
})
console.log(`  All references valid: ${quizSets.length} sets checked [${refIssues === 0 ? 'PASS' : 'FAIL'}]`)
if (refIssues > 0) console.log(`    ${refIssues} reference issues found`)

// ===== Test 12: Data ID validation (critical correctness checks) =====
console.log('\n[12] CRITICAL DATA VALIDATION')

// Level 3 - correctEmailId validity
const l3EmailIssues = level3Rounds.filter((r) => !r.emails.some((e) => e.id === r.correctEmailId))
console.log(`  Level 3 correctEmailId valid: ${level3Rounds.length - l3EmailIssues.length}/${level3Rounds.length} [${l3EmailIssues.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l3EmailIssues.length > 0) {
  console.log(`    Issues: ${l3EmailIssues.map((r) => r.id).join(', ')}`)
}

// Level 4 - correctFileId validity
const l4FileIssues = level4Rounds.filter((r) => !r.files.some((f) => f.id === r.correctFileId))
console.log(`  Level 4 correctFileId valid: ${level4Rounds.length - l4FileIssues.length}/${level4Rounds.length} [${l4FileIssues.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l4FileIssues.length > 0) {
  console.log(`    Issues: ${l4FileIssues.map((r) => r.id).join(', ')}`)
}

// Level 5 - correctSequence and correctActionIds validity
const l5SeqIssues = level5Scenarios.filter((s) => {
  const actionIds = new Set(s.actions.map((a) => a.id))
  const seqValid = s.correctSequence.every((id) => actionIds.has(id))
  const correctValid = s.correctActionIds.every((id) => actionIds.has(id))
  return !seqValid || !correctValid
})
console.log(`  Level 5 action references valid: ${level5Scenarios.length - l5SeqIssues.length}/${level5Scenarios.length} [${l5SeqIssues.length === 0 ? 'PASS' : 'FAIL'}]`)
if (l5SeqIssues.length > 0) {
  console.log(`    Issues: ${l5SeqIssues.map((s) => s.id).join(', ')}`)
}

console.log('\n' + '='.repeat(80))
console.log('Validation complete')
console.log('='.repeat(80))
