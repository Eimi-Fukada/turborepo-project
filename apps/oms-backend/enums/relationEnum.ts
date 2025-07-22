export enum Relationship {
  SELF,
  SPOUSE,
  CHILD,
  RELATIVE,
  OTHER,
}

export function mapRelationName(entryType: Relationship) {
  switch (entryType) {
    case Relationship.SELF:
      return "本人";
    case Relationship.SPOUSE:
      return "配偶";
    case Relationship.CHILD:
      return "子女";
    case Relationship.RELATIVE:
      return "亲戚";
    case Relationship.OTHER:
      return "其他";
  }
}
