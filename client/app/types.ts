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
