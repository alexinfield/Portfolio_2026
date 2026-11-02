import { ArrowLeft, ArrowRight } from "lucide-react";
import { withBasePath } from "@/lib/base-path";
import { Button } from "./compass";

const work = ["molekule-go", "ping", "hyphae", "luma"];
const personal = ["mode", "niche"];

// Native anchors work before JavaScript and on deep links. The small static
// runtime resolves explicit collection origin and a proven history return.
export default function CaseNavigation({slug}: {slug: string}) {
  const collection = personal.includes(slug) ? "personal" : "work";
  const sequence = collection === "personal" ? personal : work;
  const index = sequence.indexOf(slug);
  const target = (name: string) => withBasePath(`/projects/${name}/?from=${collection}`);
  return <nav className="portfolio-case-navigation" aria-label="Case navigation" data-natural-collection={collection}>
    {index > 0 && <Button asChild variant="secondary" data-plain=""><a href={target(sequence[index - 1])} rel="prev"><ArrowLeft aria-hidden="true" />Previous</a></Button>}
    <Button asChild variant="secondary"><a href={withBasePath(collection === "personal" ? "/personal/" : "/")} data-case-back>Back</a></Button>
    {index < sequence.length - 1 && <Button asChild variant="secondary" data-plain=""><a href={target(sequence[index + 1])} rel="next">Next<ArrowRight aria-hidden="true" /></a></Button>}
  </nav>;
}
