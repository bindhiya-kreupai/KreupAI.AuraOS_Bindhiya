/**
 * @reference docs/aura-master-instructions.md
 */
import { redirect } from "next/navigation";

const verticalMap: Record<string, string> = {
  collaboration: "/dashboard/collaboration",
  manufacturing: "/dashboard/manufacturing",
  healthcare: "/dashboard/healthcare",
  retail: "/dashboard/retail",
  education: "/dashboard/education",
  government: "/dashboard/government",
  agriculture: "/dashboard/agriculture",
  mining: "/dashboard/mining",
  hospitality: "/dashboard/hospitality",
  automotive: "/dashboard/automotive",
  aviation: "/dashboard/aviation",
  maritime: "/dashboard/maritime",
  nonprofit: "/dashboard/nonprofit",
  logistics: "/dashboard/logistics",
};

type Props = {
  params: { vertical: string };
};

export default function IndustryRedirectPage({ params }: Props) {
  const target = verticalMap[params.vertical];

  if (target) {
    redirect(target);
  }

  redirect("/dashboard/industry-solutions");
}
