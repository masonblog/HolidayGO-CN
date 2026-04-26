import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CitationLink } from "@/components/citation-link";
import { LEAVE_LABELS, type LeaveType, type LeaveKey } from "@/lib/schema";
import type { LeaveOrigin } from "@/lib/merge";

type Props = {
  leaveKey: LeaveKey;
  origin: LeaveOrigin;
  data: LeaveType;
  regionName?: string;
};

const paidLabel: Record<NonNullable<LeaveType["daysTable"]>[number]["paid"] & string, string> = {
  full: "全额",
  partial: "部分",
  unpaid: "无薪",
};

export function LeaveCard({ leaveKey, origin, data, regionName }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{LEAVE_LABELS[leaveKey]}</CardTitle>
          <Badge variant={origin === "regional" ? "default" : "secondary"}>
            {origin === "regional" ? `${regionName ?? "本地"}特别规定` : "中央规定"}
          </Badge>
        </div>
        <CardDescription className="text-sm leading-relaxed text-foreground/80 pt-1">
          {data.rule}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.daysTable && data.daysTable.length > 0 && (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">情形</th>
                  <th className="px-3 py-2 text-left font-medium w-24">天数</th>
                  <th className="px-3 py-2 text-left font-medium w-20">薪资</th>
                </tr>
              </thead>
              <tbody>
                {data.daysTable.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{row.condition}</td>
                    <td className="px-3 py-2 font-medium tabular-nums">
                      {row.days}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {row.paid ? paidLabel[row.paid] : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Accordion type="multiple" className="w-full">
          {data.eligibility && (
            <AccordionItem value="eligibility">
              <AccordionTrigger>适用条件</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {data.eligibility}
              </AccordionContent>
            </AccordionItem>
          )}
          {data.notes && (
            <AccordionItem value="notes">
              <AccordionTrigger>说明与例外</AccordionTrigger>
              <AccordionContent className="text-muted-foreground whitespace-pre-line">
                {data.notes}
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="citations">
            <AccordionTrigger>
              法规原文（{data.citations.length}）
            </AccordionTrigger>
            <AccordionContent>
              <ul className="grid gap-2">
                {data.citations.map((c, i) => (
                  <li key={i}>
                    <CitationLink {...c} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">
                最后核对日期：{data.lastVerified}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
