export const PIPELINE_STAGES = [
  "novo",
  "qualificado",
  "agendado",
  "visitou",
  "proposta",
  "fechado",
  "perdido",
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]
