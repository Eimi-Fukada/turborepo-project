export enum YesNo {
  NO = 0,
  YES = 1,
}

export function mapYesNoName(value: YesNo) {
  switch (value) {
    case YesNo.YES:
      return "是";
    case YesNo.NO:
      return "否";
  }
}
