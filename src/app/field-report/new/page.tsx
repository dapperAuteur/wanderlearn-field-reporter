"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LLM_PROVIDER_LABELS } from "@/agent/schemas";

/** The MUCHO Museo del Chocolate fixture, for the "Load sample" shortcut. */
const MUCHO_SAMPLE = {
  locationName: "MUCHO Museo del Chocolate",
  lat: "19.4264",
  lng: "-99.1618",
  capturedAt: "2026-03-14T17:30",
  transcript:
    "Welcome to MUCHO, the Museo del Chocolate, housed in a restored early " +
    "twentieth-century mansion in Mexico City's Colonia Juarez neighborhood. " +
    "The museum traces the story of chocolate from the cacao tree to the " +
    "finished bar. Cacao originated in the tropical forests of Mesoamerica, " +
    "where the Olmec, Maya, and Mexica peoples cultivated it more than three " +
    "thousand years ago. For these civilizations cacao was sacred: it was used " +
    "in ritual, offered to the gods, and traded as currency. The Maya prepared " +
    "a frothy, bitter drink by grinding roasted cacao beans on a stone metate. " +
    "When Spanish colonizers carried cacao across the Atlantic, Europeans " +
    "sweetened the drink with cane sugar and spices. The museum's galleries " +
    "display antique molds, tin packaging, and vintage advertising. In the " +
    "courtyard, a working kitchen offers daily demonstrations of roasting, " +
    "winnowing, and grinding. A tasting room invites guests to compare " +
    "single-origin chocolate from Tabasco, Chiapas, and Oaxaca.",
  imageRefs:
    "wanderlearn/mucho/courtyard-kitchen\nwanderlearn/mucho/antique-molds\nwanderlearn/mucho/tasting-room",
  operatorNotes: "Sample capture loaded from the MUCHO fixture.",
  targetAudience: "curious_learner",
  llmProvider: "anthropic",
};

const EMPTY_FORM = {
  locationName: "",
  lat: "",
  lng: "",
  capturedAt: "",
  transcript: "",
  imageRefs: "",
  operatorNotes: "",
  targetAudience: "curious_learner",
  llmProvider: "anthropic",
};

const labelClass =
  "block text-sm font-medium text-slate-900 dark:text-slate-100";
const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm " +
  "text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 " +
  "focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

/** /field-report/new — submit a raw capture and run the agent. */
export default function NewCapturePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/field-report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            name: form.locationName,
            gps: { lat: Number(form.lat), lng: Number(form.lng) },
            capturedAt: new Date(form.capturedAt).toISOString(),
          },
          rawInput: {
            transcript: form.transcript,
            imageRefs: form.imageRefs
              .split("\n")
              .map((ref) => ref.trim())
              .filter((ref) => ref.length > 0),
            operatorNotes: form.operatorNotes || undefined,
          },
          targetAudience: form.targetAudience,
          llmProvider: form.llmProvider,
        }),
      });
      const data: { ok?: boolean; reportId?: string; error?: string } =
        await response.json();
      if (!response.ok || !data.ok || !data.reportId) {
        setError(data.error ?? "Generation failed.");
        setSubmitting(false);
        return;
      }
      router.push(`/field-report/${data.reportId}`);
    } catch {
      setError("Could not reach the server.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/field-report"
        className="text-sm text-sky-700 hover:underline dark:text-sky-400"
      >
        ← All reports
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">New capture</h1>
        <button
          type="button"
          onClick={() => setForm(MUCHO_SAMPLE)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
        >
          Load MUCHO sample
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Submitting runs the agent end to end — research, write, and the
        self-critique loop. It can take a few minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className={labelClass}>
            Location name
            <input
              required
              className={inputClass}
              value={form.locationName}
              onChange={(e) => update("locationName", e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className={labelClass}>
            Latitude
            <input
              required
              type="number"
              step="any"
              className={inputClass}
              value={form.lat}
              onChange={(e) => update("lat", e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Longitude
            <input
              required
              type="number"
              step="any"
              className={inputClass}
              value={form.lng}
              onChange={(e) => update("lng", e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Captured at
            <input
              required
              type="datetime-local"
              className={inputClass}
              value={form.capturedAt}
              onChange={(e) => update("capturedAt", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClass}>
            Transcript
            <textarea
              required
              rows={8}
              className={inputClass}
              value={form.transcript}
              onChange={(e) => update("transcript", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClass}>
            Image references (Cloudinary public IDs, one per line)
            <textarea
              rows={3}
              className={inputClass}
              value={form.imageRefs}
              onChange={(e) => update("imageRefs", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClass}>
            Operator notes (optional)
            <textarea
              rows={2}
              className={inputClass}
              value={form.operatorNotes}
              onChange={(e) => update("operatorNotes", e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>
            Target audience
            <select
              className={inputClass}
              value={form.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
            >
              <option value="general">General</option>
              <option value="curious_learner">Curious learner</option>
              <option value="practitioner">Practitioner</option>
            </select>
          </label>
          <label className={labelClass}>
            LLM provider
            <select
              className={inputClass}
              value={form.llmProvider}
              onChange={(e) => update("llmProvider", e.target.value)}
            >
              {Object.entries(LLM_PROVIDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Running the agent…" : "Generate lesson draft"}
        </button>
      </form>
    </main>
  );
}
