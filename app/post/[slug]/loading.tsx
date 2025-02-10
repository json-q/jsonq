export default function Loading() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center space-y-2">
      <div className="inline-block size-12 animate-spin rounded-full border-[3px] border-t-slate-400"></div>
      <span>Loading...</span>
    </div>
  );
}
