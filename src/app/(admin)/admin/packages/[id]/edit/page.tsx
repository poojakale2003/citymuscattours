import EditPackageClient from "./EditPackageClient";

type Props = {
  params: Promise<{ id: string }>;
};

// Required for static export - return placeholder since package IDs are in localStorage
// The actual ID will be handled client-side
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function AdminEditPackagePage({ params }: Props) {
  const { id } = await params;
  return <EditPackageClient packageId={id} />;
}
