import DownloadButtons from "@/components/DownloadButtons";

export default function CTASection() {
  return (
    <section className="w-full max-w-4xl mt-24 mb-16 flex flex-col items-center px-6">
      <h3 className="inline text-[20px] leading-tight font-medium -tracking-[0.04em] text-foreground sm:block sm:text-[28px] md:text-[24px] lg:text-[28px]">
        Meeting AI that helps during the call, not after.
      </h3>
      <p className="inline  text-[20px] leading-tight font-medium -tracking-[0.04em] sm:block sm:text-[28px] md:text-[24px] lg:text-[28px]">
        Try Primer on your next meeting today.
      </p>
      <div className="mt-4">
        <DownloadButtons />
      </div>
    </section>
  );
}
