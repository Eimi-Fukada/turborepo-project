export enum Combo {
  Premium_Edition = 1,
  Extreme_Edition,
  TAICANG_EDITION, // 太仓套餐
}

export function mapComboName(entryType: Combo) {
  switch (entryType) {
    case Combo.Premium_Edition:
      return "尊享版";
    case Combo.Extreme_Edition:
      return "至尊版";
    case Combo.TAICANG_EDITION:
      return "金仓湖专享";
  }
}

export function mapComboDecr(entryType: Combo) {
  switch (entryType) {
    case Combo.Premium_Edition:
      return "智能音箱*1";
    case Combo.Extreme_Edition:
      return "智能音箱*1+拉绳报警器*1";
    case Combo.TAICANG_EDITION:
      return "智能音箱*1+防跌倒激光雷达*1+睡眠检测带*1";
  }
}
