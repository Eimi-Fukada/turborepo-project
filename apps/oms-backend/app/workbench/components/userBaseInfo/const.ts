export interface RuleForm {
  avatar: any;
  userName: string;
  gender: number;
  birthday: string;
  idCard: string;
  phoneNumber: string;
  phoneRelation: number;
  city: string;
  address: string;
  street: string;
  committeePhone: string;
  liveAlone: number;
}

export const genderOptions = [
  {
    label: "未知",
    value: 0,
  },
  {
    label: "男",
    value: 1,
  },
  {
    label: "女",
    value: 2,
  },
];

export const phoneRelationOptions = [
  {
    label: "本人",
    value: 0,
  },
  {
    label: "配偶",
    value: 1,
  },
  {
    label: "子女",
    value: 2,
  },
  {
    label: "亲戚",
    value: 3,
  },
  {
    label: "其他",
    value: 4,
  },
];
export const relationOptions = [
  {
    label: "配偶",
    value: 1,
  },
  {
    label: "子女",
    value: 2,
  },
  {
    label: "亲戚",
    value: 3,
  },
  {
    label: "其他",
    value: 4,
  },
];
