export interface EvaluateQueryDetailResponse {
  createUserName: string;
  reportCreateTime: string;
  evaluateTime: string;
  houseType: number;
  userNum: number;
  privilegeType: number;
  userName: string;
  mobile: string;
  status: number;
  userReports: UserReportResponse[];
}

export interface UserReportResponse {
  userInfo: ReportDetailUserInfoResponse;
  physicalFunction: ReportDetailPhysicalFunction[];
  overallRisk: ReportOverAllRiskResponse;
}

export interface ReportDetailUserInfoResponse {
  name: string;
  gender: number;
  relation: number;
  mobile: string;
}

export interface ReportDetailPhysicalFunction {
  name: string;
  code: string;
  score: number;
  rawScore: number;
}

export interface ReportOverAllRiskResponse {
  score: number;
  riskLevel: number;
}
