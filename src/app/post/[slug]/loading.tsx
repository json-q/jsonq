export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-16">
      <div className="inline-block size-12 animate-spin rounded-full border-[3px] border-t-slate-400"></div>
      <span>Loading...</span>
    </div>
  );
}
