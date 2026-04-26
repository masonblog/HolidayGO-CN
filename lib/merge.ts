import { LEAVE_KEYS, type LeaveKey, type LeaveType } from "./schema";
import type { CentralPolicy, RegionPolicy } from "./schema";

export type LeaveOrigin = "central" | "regional";

export type MergedLeave = {
  key: LeaveKey;
  origin: LeaveOrigin;
  data: LeaveType;
};

export function mergePolicy(
  central: CentralPolicy,
  region: RegionPolicy | null,
): MergedLeave[] {
  return LEAVE_KEYS.map<MergedLeave>((key) => {
    const local = region?.leaveTypes?.[key];
    if (local) {
      // 婚假为3天属于沿用中央规定，不视为地方特别规定
      if (key === "marriage" && local.daysTable?.some(row => row.days === 3)) {
        return { key, origin: "central", data: central.leaveTypes[key] };
      }
      return { key, origin: "regional", data: local };
    }
    return { key, origin: "central", data: central.leaveTypes[key] };
  });
}
