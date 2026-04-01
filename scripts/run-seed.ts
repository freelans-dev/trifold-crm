import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ORG_ID = "00000000-0000-0000-0000-000000000001"

async function seed() {
  console.log("Seeding organization...")
  const { error: orgError } = await supabase.from("organizations").upsert(
    {
      id: ORG_ID,
      name: "Trifold Engenharia",
      slug: "trifold",
      settings: { city: "Maringa", state: "PR" },
    },
    { onConflict: "slug" }
  )
  if (orgError) console.error("Org error:", orgError.message)
  else console.log("  OK")

  console.log("Seeding kanban stages...")
  const stages = [
    { id: "00000000-0000-0000-0001-000000000001", name: "Novo",             slug: "novo",            type: "novo",        position: 1, color: "#3B82F6", is_default: true },
    { id: "00000000-0000-0000-0001-000000000002", name: "Em Qualificacao",  slug: "em-qualificacao", type: "qualificado", position: 2, color: "#F59E0B", is_default: false },
    { id: "00000000-0000-0000-0001-000000000003", name: "Qualificado",      slug: "qualificado",     type: "qualificado", position: 3, color: "#10B981", is_default: false },
    { id: "00000000-0000-0000-0001-000000000004", name: "Visita Agendada",  slug: "visita-agendada", type: "agendado",    position: 4, color: "#8B5CF6", is_default: false },
    { id: "00000000-0000-0000-0001-000000000005", name: "Visitou",          slug: "visitou",         type: "visitou",     position: 5, color: "#06B6D4", is_default: false },
    { id: "00000000-0000-0000-0001-000000000006", name: "Negociando",       slug: "negociando",      type: "proposta",    position: 6, color: "#F97316", is_default: false },
    { id: "00000000-0000-0000-0001-000000000007", name: "Fechou",           slug: "fechou",          type: "fechado",     position: 7, color: "#22C55E", is_default: false },
    { id: "00000000-0000-0000-0001-000000000008", name: "Perdido",          slug: "perdido",         type: "perdido",     position: 8, color: "#EF4444", is_default: false },
  ]
  for (const stage of stages) {
    const { error } = await supabase.from("kanban_stages").upsert(
      { ...stage, org_id: ORG_ID },
      { onConflict: "org_id,slug" }
    )
    if (error) console.error(`  Stage ${stage.name}: ${error.message}`)
    else console.log(`  ${stage.name} OK`)
  }

  console.log("Seeding agent config...")
  const { error: configError } = await supabase.from("agent_config").upsert({
    id: "00000000-0000-0000-0002-000000000001",
    org_id: ORG_ID,
    personality_prompt: "Voce e a Nicole, assistente virtual da Trifold Engenharia. Simpatica, natural e boa praca.",
    greeting_message: "Oi! Eu sou a Nicole, da Trifold Engenharia! Como posso te ajudar hoje?",
    out_of_hours_message: "Oi! No momento estamos fora do horario de atendimento. Vou anotar seus dados e retorno no proximo dia util!",
    business_hours: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "08:00", end: "12:00" },
    },
    model_primary: "claude-sonnet-4-5-20250514",
    model_secondary: "claude-haiku-4-5-20251001",
    temperature: 0.7,
    max_tokens: 1024,
  })
  if (configError) console.error("Config error:", configError.message)
  else console.log("  OK")

  console.log("Seeding agent prompts...")
  const prompts = [
    { slug: "system-personality",    name: "Personalidade Nicole",            type: "system",        content: "[placeholder — Story 3.1]" },
    { slug: "qualification-flow",    name: "Fluxo de Qualificacao",           type: "qualification", content: "[placeholder — Story 3.4]" },
    { slug: "property-presentation", name: "Apresentacao de Empreendimentos", type: "system",        content: "[placeholder — Story 3.3]" },
    { slug: "visit-scheduling",      name: "Agendamento de Visitas",          type: "system",        content: "[placeholder — Story 3.8]" },
    { slug: "handoff-summary",       name: "Resumo para Corretor",            type: "handoff",       content: "[placeholder — Story 3.10]" },
    { slug: "guardrails",            name: "Guardrails da IA",                type: "guardrail",     content: "[placeholder — Story 3.6]" },
    { slug: "off-hours",             name: "Mensagem Fora do Horario",        type: "system",        content: "[placeholder — Story 3.8]" },
  ]
  for (const prompt of prompts) {
    const { error } = await supabase.from("agent_prompts").upsert(
      { ...prompt, org_id: ORG_ID },
      { onConflict: "org_id,slug" }
    )
    if (error) console.error(`  Prompt ${prompt.slug}: ${error.message}`)
    else console.log(`  ${prompt.name} OK`)
  }

  // Create auth users
  console.log("\nSeeding users...")
  const usersToCreate = [
    { email: "alexandre@trifold.com.br", name: "Alexandre Guimaraes Nicolau", role: "admin" },
    { email: "lucas@trifold.com.br",     name: "Lucas Supervisor",            role: "supervisor" },
    { email: "corretor@trifold.com.br",  name: "Corretor Demo",              role: "broker" },
  ]

  for (const user of usersToCreate) {
    console.log(`  Creating ${user.email}...`)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: "395Trifold@",
      email_confirm: true,
    })

    let authId: string

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log(`    Already exists in auth`)
        const { data: { users: allUsers } } = await supabase.auth.admin.listUsers()
        const existing = allUsers?.find((u) => u.email === user.email)
        if (!existing) { console.error("    Could not find existing user"); continue }
        authId = existing.id
      } else {
        console.error(`    Auth error: ${authError.message}`)
        continue
      }
    } else {
      authId = authData.user.id
    }

    const { error: userError } = await supabase.from("users").upsert(
      {
        org_id: ORG_ID,
        auth_id: authId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { onConflict: "auth_id" }
    )

    if (userError) console.error(`    DB error: ${userError.message}`)
    else console.log(`    ${user.name} (${user.role}) OK`)
  }

  console.log("\nSeed complete!")
}

seed().catch(console.error)
