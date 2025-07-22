export enum HouseTypeEnum {
  /** 楼梯房-室内复式 */
  StaircaseLoft = 1,
  /** 楼梯房-室内平层 */
  Staircase,
  /** 电梯房-室内复式 */
  ElevatorLoft,
  /** 电梯房-室内平层 */
  Elevator,
}

/**
 * 状态描述
 */
export const HouseTypeEnumDesc = {
  [HouseTypeEnum.StaircaseLoft]: "楼梯房-室内复式",
  [HouseTypeEnum.Staircase]: "楼梯房-室内平层",
  [HouseTypeEnum.ElevatorLoft]: "电梯房-室内复式",
  [HouseTypeEnum.Elevator]: "电梯房-室内平层",
};
