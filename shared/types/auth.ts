export type IcamRole =
  | "student"
  | "faculty"
  | "custodian"
  | "coordinator"
  | "admin";

export interface AuthenticatedIcamUser {
  id: string;
  email: string;
  fullName: string;
  role: IcamRole;
  schoolDepartment: string;
  studentOrEmployeeId: string;
  isActive: boolean;
}
