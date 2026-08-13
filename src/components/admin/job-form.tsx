"use client";

import { useState } from "react";
import { createJob, updateJob } from "@/lib/admin-actions";

type JobData = {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
};

export function JobForm({ job }: { job?: JobData }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = job ? await updateJob(job.id, formData) : await createJob(formData);
    // redirect terjadi di server kalau sukses; kalau sampai sini berarti error
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-white/30";
  const labelCls = "mb-1 block text-sm text-muted-foreground";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelCls}>Judul posisi</label>
        <input id="title" name="title" required minLength={3} defaultValue={job?.title} className={inputCls} placeholder="Senior Graphic Designer" />
      </div>

      <div>
        <label htmlFor="slug" className={labelCls}>
          Slug URL <span className="text-neutral-500">(kosongkan untuk auto-generate dari judul)</span>
        </label>
        <input id="slug" name="slug" defaultValue={job?.slug} className={inputCls} placeholder="senior-graphic-designer" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className={labelCls}>Kategori</label>
          <input id="category" name="category" required defaultValue={job?.category} className={inputCls} placeholder="Design" />
        </div>
        <div>
          <label htmlFor="location" className={labelCls}>Lokasi</label>
          <input id="location" name="location" required defaultValue={job?.location} className={inputCls} placeholder="Yogyakarta (Hybrid)" />
        </div>
        <div>
          <label htmlFor="type" className={labelCls}>Tipe</label>
          <select id="type" name="type" required defaultValue={job?.type ?? "fulltime"} className={`${inputCls} bg-card`}>
            <option value="fulltime">Full-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelCls}>Deskripsi</label>
        <textarea id="description" name="description" required minLength={10} rows={5} defaultValue={job?.description} className={inputCls} />
      </div>

      <div>
        <label htmlFor="requirements" className={labelCls}>Kualifikasi</label>
        <textarea id="requirements" name="requirements" required minLength={10} rows={5} defaultValue={job?.requirements} className={inputCls} />
      </div>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-btn-gradient rounded-md px-6 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Menyimpan…" : job ? "Simpan Perubahan" : "Buat Lowongan"}
      </button>
    </form>
  );
}
