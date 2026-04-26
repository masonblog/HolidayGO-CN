import { z } from "zod";

export const LEAVE_KEYS = [
  "annual",
  "marriage",
  "maternity",
  "paternity",
  "parental",
  "familyVisit",
  "sick",
] as const;

export type LeaveKey = (typeof LEAVE_KEYS)[number];

export const LEAVE_LABELS: Record<LeaveKey, string> = {
  annual: "年休假",
  marriage: "婚假",
  maternity: "产假",
  paternity: "陪产/护理假",
  parental: "育儿假",
  familyVisit: "探亲假",
  sick: "病假",
};

export const SourceEnum = z.enum([
  "flk",
  "local-pc",
  "local-gov",
  "mohrss",
  "other",
]);

export type SourceKind = z.infer<typeof SourceEnum>;

export const SOURCE_LABELS: Record<SourceKind, string> = {
  flk: "国家法律法规库",
  "local-pc": "地方人大",
  "local-gov": "地方政府",
  mohrss: "人力资源和社会保障部",
  other: "其他",
};

export const CitationSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  source: SourceEnum,
  article: z.string().optional(),
});

export const DaysRowSchema = z.object({
  condition: z.string().min(1),
  days: z.union([z.number().nonnegative(), z.string().min(1)]),
  paid: z.enum(["full", "partial", "unpaid"]).optional(),
});

export const LeaveTypeSchema = z.object({
  rule: z.string().min(1),
  eligibility: z.string().optional(),
  daysTable: z.array(DaysRowSchema).optional(),
  notes: z.string().optional(),
  citations: z.array(CitationSchema).min(1),
  lastVerified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "lastVerified 必须是 YYYY-MM-DD 格式"),
});

export type LeaveType = z.infer<typeof LeaveTypeSchema>;

const LeaveTypesShape = Object.fromEntries(
  LEAVE_KEYS.map((k) => [k, LeaveTypeSchema.optional()]),
) as Record<LeaveKey, z.ZodOptional<typeof LeaveTypeSchema>>;

export const LeaveTypesSchema = z.object(LeaveTypesShape);
export type LeaveTypes = z.infer<typeof LeaveTypesSchema>;

export const CentralPolicySchema = z.object({
  leaveTypes: z.object(
    Object.fromEntries(LEAVE_KEYS.map((k) => [k, LeaveTypeSchema])) as Record<
      LeaveKey,
      typeof LeaveTypeSchema
    >,
  ),
});

export type CentralPolicy = z.infer<typeof CentralPolicySchema>;

export const RegionPolicySchema = z.object({
  code: z.string().regex(/^\d{2}$/),
  name: z.string().min(1),
  leaveTypes: LeaveTypesSchema,
});

export type RegionPolicy = z.infer<typeof RegionPolicySchema>;
