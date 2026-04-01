/**
 * Yarden Gate flow.
 * Blocks leads without down payment from proceeding with Yarden
 * and empathetically suggests the Vind property instead.
 */

interface YardenGateResult {
  blocked: boolean
  reason?: string
  suggestion?: string
}

/**
 * Checks if a lead should be blocked from Yarden due to lack of down payment.
 * When blocked, provides an empathetic suggestion to consider Vind instead.
 *
 * @param propertySlug - The slug of the property being discussed
 * @param collectedData - Current collected data from the conversation
 * @returns Gate result indicating whether the lead is blocked
 */
export function checkYardenGate(
  propertySlug: string,
  collectedData: Record<string, unknown>
): YardenGateResult {
  const isYarden = propertySlug.toLowerCase() === "yarden"
  const hasNoDownPayment = collectedData.has_down_payment === false

  if (isYarden && hasNoDownPayment) {
    return {
      blocked: true,
      reason:
        "Lead demonstrou interesse no Yarden mas indicou que nao possui valor de entrada disponivel.",
      suggestion:
        "Direcione a conversa com empatia para o Vind, que pode ter condicoes de pagamento mais flexiveis. " +
        "Exemplo: 'Entendo! Para quem busca mais flexibilidade na entrada, o Vind pode ser uma otima opcao. " +
        "Ele tem apartamentos de 67m2 com uma localizacao incrivel. Posso te contar mais sobre ele?'",
    }
  }

  return { blocked: false }
}
