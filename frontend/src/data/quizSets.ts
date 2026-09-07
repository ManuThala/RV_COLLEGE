export type QuizSet = {
  id: string
  level1QuestionId: string
  level2QuestionId: string
  level3RoundId: string
  level4RoundId: string
  level5ScenarioId: string
}

export const quizSets: QuizSet[] = [
  { id: 'SET-01', level1QuestionId: 'L1-Q07', level2QuestionId: 'L2-Q23', level3RoundId: 'L3-R04', level4RoundId: 'L4-R19', level5ScenarioId: 'L5-S12' },
  { id: 'SET-02', level1QuestionId: 'L1-Q12', level2QuestionId: 'L2-Q09', level3RoundId: 'L3-R08', level4RoundId: 'L4-R05', level5ScenarioId: 'L5-S18' },
  { id: 'SET-03', level1QuestionId: 'L1-Q19', level2QuestionId: 'L2-Q30', level3RoundId: 'L3-R11', level4RoundId: 'L4-R13', level5ScenarioId: 'L5-S27' },
  { id: 'SET-04', level1QuestionId: 'L1-Q24', level2QuestionId: 'L2-Q17', level3RoundId: 'L3-R17', level4RoundId: 'L4-R20', level5ScenarioId: 'L5-S05' },
  { id: 'SET-05', level1QuestionId: 'L1-Q02', level2QuestionId: 'L2-Q31', level3RoundId: 'L3-R21', level4RoundId: 'L4-R27', level5ScenarioId: 'L5-S34' },
  { id: 'SET-06', level1QuestionId: 'L1-Q16', level2QuestionId: 'L2-Q35', level3RoundId: 'L3-R25', level4RoundId: 'L4-R09', level5ScenarioId: 'L5-S09' },
  { id: 'SET-07', level1QuestionId: 'L1-Q29', level2QuestionId: 'L2-Q42', level3RoundId: 'L3-R30', level4RoundId: 'L4-R28', level5ScenarioId: 'L5-S21' },
  { id: 'SET-08', level1QuestionId: 'L1-Q05', level2QuestionId: 'L2-Q47', level3RoundId: 'L3-R15', level4RoundId: 'L4-R11', level5ScenarioId: 'L5-S35' },
  { id: 'SET-09', level1QuestionId: 'L1-Q22', level2QuestionId: 'L2-Q13', level3RoundId: 'L3-R27', level4RoundId: 'L4-R23', level5ScenarioId: 'L5-S40' },
  { id: 'SET-10', level1QuestionId: 'L1-Q28', level2QuestionId: 'L2-Q50', level3RoundId: 'L3-R24', level4RoundId: 'L4-R30', level5ScenarioId: 'L5-S16' },
]
