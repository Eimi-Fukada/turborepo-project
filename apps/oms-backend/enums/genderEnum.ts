export enum Gender {
  UN_KNOW = 0,
  MALE,
  FEMALE,
}

export function mapGenderName(entryType: Gender) {
  switch (entryType) {
    case Gender.UN_KNOW:
      return "未知";
    case Gender.MALE:
      return "男";
    case Gender.FEMALE:
      return "女";
  }
}
