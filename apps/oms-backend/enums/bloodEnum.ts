export enum HealthStatus {
  NORMAL = 1,
  LOW,
  HIGH,
}

export function mapBloodPressureStatus(status: HealthStatus): string {
  switch (status) {
    case HealthStatus.NORMAL:
      return "正常";
    case HealthStatus.LOW:
      return "低压";
    case HealthStatus.HIGH:
      return "高压";
  }
}

export function mapBloodFatStatus(status: HealthStatus): string {
  switch (status) {
    case HealthStatus.NORMAL:
      return "正常";
    case HealthStatus.LOW:
      return "低血脂";
    case HealthStatus.HIGH:
      return "高血脂";
  }
}

export function mapBloodSugarStatus(status: HealthStatus): string {
  switch (status) {
    case HealthStatus.NORMAL:
      return "正常";
    case HealthStatus.LOW:
      return "低血糖";
    case HealthStatus.HIGH:
      return "高血糖";
  }
}

export enum BloodType {
  A = 1,
  B = 2,
  AB = 3,
  O = 4,
  OTHER = 5,
}


export function mapBloodType(bloodType: BloodType): string {
  switch (bloodType) {
    case BloodType.A:
      return "A型";
    case BloodType.B:
      return "B型";
    case BloodType.AB:
      return "AB型";
    case BloodType.O:
      return "O型";
    case BloodType.OTHER:
      return "其他";
  }
}
