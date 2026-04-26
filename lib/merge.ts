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
    if (local) return { key, origin: "regional", data: local };
    return { key, origin: "central", data: central.leaveTypes[key] };
  });
}
