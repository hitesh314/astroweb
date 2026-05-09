import MarketingHeader from "@/components/marketing-header";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      {children}
    </>
  );
}
