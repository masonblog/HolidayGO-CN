import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SOURCE_LABELS, type SourceKind } from "@/lib/schema";

type Props = {
  title: string;
  url: string;
  source: SourceKind;
  article?: string;
};

export function CitationLink({ title, url, source, article }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-start gap-2 rounded-md border bg-background px-3 py-2 text-xs hover:border-primary/50 hover:bg-accent transition-colors"
    >
      <Badge variant="secondary" className="shrink-0">
        {SOURCE_LABELS[source]}
      </Badge>
      <span className="flex-1 leading-relaxed">
        <span className="font-medium text-foreground">{title}</span>
        {article && (
          <span className="ml-1 text-muted-foreground">· {article}</span>
        )}
      </span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
    </a>
  );
}
