export enum SelfCareAbility {
  SELF_CARE = 1,
  SEMI_INCAPABLE = 2,
  INCAPABLE = 3,
  DEMENTIA = 4
}
export function mapSelfCareAbility(ability: SelfCareAbility): string {
  switch (ability) {
    case SelfCareAbility.SELF_CARE:
      return '自理'
    case SelfCareAbility.SEMI_INCAPABLE:
      return '半失能'
    case SelfCareAbility.INCAPABLE:
      return '失能'
    case SelfCareAbility.DEMENTIA:
      return '失智'
  }
}