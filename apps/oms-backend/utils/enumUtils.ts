export function enum2SelectOptions(
  valueEnum: any[] | Record<string, any>,
  labelFunction: (entryType: any) => any
): selectOptions[] {
  let values = Array.isArray(valueEnum) ? valueEnum : Object.values(valueEnum);
  // 如果 enum 值为 number 类型，ts 生成的 js 对象会同时包含枚举的名称，针对该情形需提出枚举名称
  const hasNum = values.some((v) => typeof v === "number");
  if (hasNum) {
    values = values.filter((v) => typeof v === "number");
  }
  return values.map((item) => ({
    value: item,
    label: labelFunction(item),
  }));
}

export function enum2ValueEnum(
  valueEnum: any[] | Record<string, any>,
  labelFunction: (entryType: any) => any
): Record<string | number, { text: string }> {
  let values = Array.isArray(valueEnum) ? valueEnum : Object.values(valueEnum);
  // 如果 enum 值为 number 类型，ts 生成的 js 对象会同时包含枚举的名称，针对该情形需提出枚举名称
  const hasNum = values.some((v) => typeof v === "number");
  if (hasNum) {
    values = values.filter((v) => typeof v === "number");
  }
  return values.reduce((acc, item) => {
    acc[item] = { text: labelFunction(item) };
    return acc;
  }, {});
}

export function obj2SelectOptions(obj): selectOptions[] {
  const options: selectOptions[] = [];

  for (const [key, value] of Object.entries(obj)) {
    options.push({
      value: key,
      label: typeof value === "string" ? value : key, // 如果值不是字符串，则使用键作为标签
    });
  }

  return options;
}

export interface selectOptions {
  value: any;
  label: string;
}
