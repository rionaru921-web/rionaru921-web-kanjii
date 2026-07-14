export interface AttendanceRate {
  rate: number | null;
  attending: number;
  total: number;
}

// Rate is null (render "-") when there are no members yet, since 0/0 has no
// meaningful percentage. Otherwise floors so the displayed rate never
// overstates actual attendance (e.g. 2/3 shows 66%, not 67%).
export function calculateAttendanceRate(attending: number, total: number): AttendanceRate {
  if (total <= 0) return { rate: null, attending, total };
  return { rate: Math.floor((attending / total) * 100), attending, total };
}
