export interface LeaveData {
  _id: string;
  user: string;
  username: string;
  dates: (string | Date)[];
  reason: string;
  status: string;
  leaveType: string;
  leaveDay: string[];
  leaveTime: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LeaveBalances {
  sickLeave: number;
  casualLeave: number;
  burnout: number;
  mensuralLeaves: number;
  unpaidLeave: number;
  internshipLeave: number;
  wfhLeave: number;
  bereavementLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  restrictedHoliday: number;
}

export interface UserData {
  _id: string;
  username: string;
  slackId: string;
  currentBalances: LeaveBalances;
  remainingLeaves: LeaveBalances;
  totalLeaves: LeaveBalances;
  usedLeaves: LeaveBalances;
}
