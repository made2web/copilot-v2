import { redirect } from "next/navigation";

export default function CopywritingPage({
  params,
}: {
  params: { organization: string; project: string };
}) {
  redirect(`/${params.organization}/${params.project}/copywriting/blog`);
}
