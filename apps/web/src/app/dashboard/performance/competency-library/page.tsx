/**
 * @reference docs/aura-master-instructions.md
 */
import { redirect } from "next/navigation";

export default function CompetencyLibraryRedirectPage() {
  redirect("/dashboard/performance/competency-assessment");
}
