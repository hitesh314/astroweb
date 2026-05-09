export default function AdminPromptsPage() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8">
      <h1 className="text-lg font-semibold text-white">AI prompt versions</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Table{" "}
        <code className="rounded bg-neutral-950 px-1 py-0.5 text-xs text-amber-200">
          ai_prompt_versions
        </code>{" "}
        stores lineage; wire an editor backed by typed server actions.
      </p>
    </div>
  );
}
