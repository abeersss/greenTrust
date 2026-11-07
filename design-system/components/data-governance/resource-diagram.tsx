"use client";

import * as React from "react";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Interactive diagrams for Data Governance resources. One per discipline:
 * classification (tier explorer), governance (escalation walkthrough),
 * quality (live calculator) and MDM (golden record stepper). All copy is
 * bilingual, layout uses logical properties for RTL, and motion respects
 * prefers-reduced-motion.
 */

type Props = { category: string; locale: AppLocale };

const shell =
  "mt-14 rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-[#0a2342] to-[#06121f] p-5 tablet:p-8";
const btnBase =
  "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";

function Heading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{hint}</p>
    </div>
  );
}

/* ------------------------------ Classification ------------------------------ */

const TIER_STYLE = [
  { on: "border-cyan-400 bg-cyan-400/15 text-white", bar: "bg-cyan-400" },
  { on: "border-emerald-400 bg-emerald-400/15 text-white", bar: "bg-emerald-400" },
  { on: "border-amber-400 bg-amber-400/15 text-white", bar: "bg-amber-400" },
  { on: "border-rose-400 bg-rose-400/15 text-white", bar: "bg-rose-400" },
] as const;

const TIER_COPY = {
  en: {
    title: "Interactive: tier explorer",
    hint: "Select a tier to see the minimum controls it carries. Higher tiers add to the ones below.",
    strength: "Protection level",
    controls: ["Access", "Encryption", "Sharing", "Retention", "Monitoring"],
    tiers: [
      { name: "Public", v: ["Open to anyone", "Not required", "Allowed after approval", "Per publishing policy", "None needed"] },
      { name: "Internal", v: ["Staff only", "In transit", "Internal links only", "Standard schedule", "Basic logs"] },
      { name: "Confidential", v: ["Need-to-know groups", "At rest and in transit", "Approved recipients only", "Defined period, yearly review", "Access logs reviewed"] },
      { name: "Restricted", v: ["Named people, strong authentication", "At rest and in transit, managed keys", "Blocked externally, DLP enforced", "Minimum necessary, audited disposal", "Full audit trail and alerts"] },
    ],
  },
  ar: {
    title: "تفاعلي: مستكشف المستويات",
    hint: "اختر مستوى لترى الحد الأدنى من الضوابط التي يحملها. تضيف المستويات الأعلى إلى ما تحتها.",
    strength: "مستوى الحماية",
    controls: ["الوصول", "التشفير", "المشاركة", "الاحتفاظ", "المراقبة"],
    tiers: [
      { name: "عام", v: ["مفتوح للجميع", "غير مطلوب", "مسموح بعد الموافقة", "وفق سياسة النشر", "غير مطلوبة"] },
      { name: "داخلي", v: ["للموظفين فقط", "أثناء النقل", "روابط داخلية فقط", "جدول قياسي", "سجلات أساسية"] },
      { name: "سري", v: ["مجموعات بحسب الحاجة", "أثناء التخزين والنقل", "مستلمون معتمدون فقط", "مدة محددة ومراجعة سنوية", "مراجعة سجلات الوصول"] },
      { name: "مقيَّد", v: ["أشخاص بأسمائهم ومصادقة قوية", "أثناء التخزين والنقل بمفاتيح مُدارة", "محظور خارجياً مع منع التسرب", "الحد الأدنى اللازم وإتلاف مدقَّق", "تدقيق كامل وتنبيهات"] },
    ],
  },
};

function TierExplorer({ locale }: { locale: AppLocale }) {
  const c = TIER_COPY[locale];
  const [idx, setIdx] = React.useState(2);
  const tier = c.tiers[idx];
  const style = TIER_STYLE[idx];
  if (!tier || !style) return null;
  return (
    <div className={shell}>
      <Heading title={c.title} hint={c.hint} />
      <div role="tablist" aria-label={c.title} className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
        {c.tiers.map((t, i) => (
          <button
            key={t.name}
            type="button"
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={`${btnBase} ${i === idx ? TIER_STYLE[i]?.on ?? "" : "border-white/15 text-slate-300 hover:border-white/40"}`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="mt-6" aria-live="polite">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{c.strength}</span>
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-2 w-8 rounded-full transition-colors motion-reduce:transition-none ${n <= idx ? style.bar : "bg-white/10"}`}
              />
            ))}
          </span>
        </div>
        <dl className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
          {c.controls.map((label, i) => (
            <div key={label} className="grid gap-1 px-4 py-3 tablet:grid-cols-[10rem_1fr] tablet:gap-4">
              <dt className="text-sm font-semibold text-cyan-200">{label}</dt>
              <dd className="text-sm text-slate-200">{tier.v[i]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* -------------------------------- Governance -------------------------------- */

const GOV_COPY = {
  en: {
    title: "Interactive: escalation walkthrough",
    hint: "Step through how a data issue travels from the people who find it to the people who decide it.",
    layers: ["Data Governance Council", "Data Owners", "Data Stewards"],
    steps: [
      { layer: 2, text: "A steward notices that two reports count active customers differently." },
      { layer: 2, text: "The steward checks both definitions and proposes one clear definition." },
      { layer: 1, text: "The customer data owner reviews the proposal and approves it for the domain." },
      { layer: 0, text: "If the issue crosses domains, the council settles it and records the decision as policy." },
    ],
    next: "Next step",
    back: "Back",
    reset: "Restart",
    stepOf: (n: number, t: number) => `Step ${n} of ${t}`,
  },
  ar: {
    title: "تفاعلي: جولة في مسار التصعيد",
    hint: "تابع خطوة بخطوة كيف تنتقل قضية البيانات من من يكتشفها إلى من يقرر فيها.",
    layers: ["مجلس حوكمة البيانات", "ملاك البيانات", "مشرفو البيانات"],
    steps: [
      { layer: 2, text: "يلاحظ المشرف أن تقريرين يحسبان العملاء النشطين بطريقتين مختلفتين." },
      { layer: 2, text: "يراجع المشرف التعريفين ويقترح تعريفاً واحداً واضحاً." },
      { layer: 1, text: "يراجع مالك بيانات العملاء الاقتراح ويعتمده للمجال." },
      { layer: 0, text: "إن تجاوزت القضية المجال، يحسمها المجلس ويسجّل القرار سياسةً." },
    ],
    next: "الخطوة التالية",
    back: "رجوع",
    reset: "إعادة",
    stepOf: (n: number, t: number) => `الخطوة ${n} من ${t}`,
  },
};

function GovernanceWalkthrough({ locale }: { locale: AppLocale }) {
  const c = GOV_COPY[locale];
  const [step, setStep] = React.useState(0);
  const cur = c.steps[step];
  if (!cur) return null;
  const last = step === c.steps.length - 1;
  return (
    <div className={shell}>
      <Heading title={c.title} hint={c.hint} />
      <ol className="space-y-3">
        {c.layers.map((name, i) => {
          const active = cur.layer === i;
          return (
            <li
              key={name}
              className={`rounded-xl border px-4 py-4 text-base font-semibold transition-all motion-reduce:transition-none ${
                active
                  ? "border-emerald-400 bg-emerald-400/15 text-white shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                  : "border-white/10 bg-white/[0.03] text-slate-400"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {name}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{c.stepOf(step + 1, c.steps.length)}</p>
        <p className="mt-2 text-base leading-relaxed text-slate-100">{cur.text}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={`${btnBase} border-white/20 text-slate-200 disabled:opacity-40`}>
          {c.back}
        </button>
        {last ? (
          <button type="button" onClick={() => setStep(0)} className={`${btnBase} border-cyan-400 bg-cyan-400/15 text-white`}>
            {c.reset}
          </button>
        ) : (
          <button type="button" onClick={() => setStep((s) => s + 1)} className={`${btnBase} border-emerald-400 bg-emerald-400 text-[#06121f] hover:bg-emerald-300`}>
            {c.next}
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Quality ---------------------------------- */

const Q_COPY = {
  en: {
    title: "Interactive: data quality calculator",
    hint: "Change the numbers to see how completeness and uniqueness are measured against agreed thresholds.",
    total: "Total records",
    valid: "Records with a valid email",
    dup: "Duplicate records",
    completeness: "Email completeness",
    duplicates: "Duplicate rate",
    target: "Target",
    atLeast: "at least",
    atMost: "at most",
    pass: "Meets threshold",
    fail: "Below threshold",
  },
  ar: {
    title: "تفاعلي: حاسبة جودة البيانات",
    hint: "غيّر الأرقام لترى كيف يُقاس الاكتمال والتفرّد مقابل الحدود المتفق عليها.",
    total: "إجمالي السجلات",
    valid: "سجلات ببريد إلكتروني صالح",
    dup: "السجلات المكررة",
    completeness: "اكتمال البريد الإلكتروني",
    duplicates: "معدل التكرار",
    target: "الهدف",
    atLeast: "لا يقل عن",
    atMost: "لا يزيد على",
    pass: "يحقق الحد المطلوب",
    fail: "دون الحد المطلوب",
  },
};

function clampInt(raw: string, max: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

function Metric({ label, value, pass, target, ok, bad }: { label: string; value: number; pass: boolean; target: string; ok: string; bad: string }) {
  return (
    <div className={`rounded-xl border p-4 ${pass ? "border-emerald-400/50 bg-emerald-400/10" : "border-rose-400/50 bg-rose-400/10"}`}>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value.toFixed(1)}%</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className={`h-full transition-all motion-reduce:transition-none ${pass ? "bg-emerald-400" : "bg-rose-400"}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-slate-300">{target}</p>
      <p className={`mt-1 text-sm font-semibold ${pass ? "text-emerald-300" : "text-rose-300"}`}>{pass ? ok : bad}</p>
    </div>
  );
}

function QualityCalculator({ locale }: { locale: AppLocale }) {
  const c = Q_COPY[locale];
  const [total, setTotal] = React.useState(12400);
  const [valid, setValid] = React.useState(11780);
  const [dup, setDup] = React.useState(372);
  const t = Math.max(total, 1);
  const completeness = (Math.min(valid, t) / t) * 100;
  const dupRate = (Math.min(dup, t) / t) * 100;
  const field = "mt-1 w-full rounded-lg border border-white/20 bg-[#06121f] px-3 py-2 text-base text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300";
  return (
    <div className={shell}>
      <Heading title={c.title} hint={c.hint} />
      <div className="grid gap-4 tablet:grid-cols-3">
        <label className="block text-sm text-slate-300">
          {c.total}
          <input type="number" inputMode="numeric" min={1} max={10000000} value={total} onChange={(e) => setTotal(clampInt(e.target.value, 10000000))} className={field} />
        </label>
        <label className="block text-sm text-slate-300">
          {c.valid}
          <input type="number" inputMode="numeric" min={0} max={total} value={valid} onChange={(e) => setValid(clampInt(e.target.value, total))} className={field} />
        </label>
        <label className="block text-sm text-slate-300">
          {c.dup}
          <input type="number" inputMode="numeric" min={0} max={total} value={dup} onChange={(e) => setDup(clampInt(e.target.value, total))} className={field} />
        </label>
      </div>
      <div className="mt-6 grid gap-4 tablet:grid-cols-2" aria-live="polite">
        <Metric label={c.completeness} value={completeness} pass={completeness >= 98} target={`${c.target}: ${c.atLeast} 98%`} ok={c.pass} bad={c.fail} />
        <Metric label={c.duplicates} value={dupRate} pass={dupRate <= 1} target={`${c.target}: ${c.atMost} 1%`} ok={c.pass} bad={c.fail} />
      </div>
    </div>
  );
}

/* ----------------------------------- MDM ------------------------------------ */

type Rec = { src: string; name: string; address: string; email: string };

const MDM_COPY = {
  en: {
    title: "Interactive: from three records to a golden record",
    hint: "Step through standardizing, matching, and merging. Names and addresses are fictional.",
    steps: [
      "Source records as received. They look different but may describe one person.",
      "Standardize: abbreviations such as St are expanded so records can be compared fairly.",
      "Match: name, address, and email evidence scores the records as the same person.",
      "Merge: survivorship rules pick the best value for each field. The result is the golden record.",
    ],
    sources: ["Source A", "Source B", "Source C"],
    records: [
      { name: "Ahmed Ali", address: "12 Palm St", email: "" },
      { name: "A. Ali", address: "12 Palm Street", email: "" },
      { name: "Ahmed Ali", address: "", email: "ahmed@example.com" },
    ],
    stdAddr: "12 Palm Street",
    fields: ["Name", "Address", "Email"],
    score: "Match score 0.94: same person",
    golden: "Golden record",
    prov: ["from Source A: most complete", "from Source B: verified format", "from Source C: only value"],
    goldenVals: { name: "Ahmed Ali", address: "12 Palm Street", email: "ahmed@example.com" },
    next: "Next step",
    back: "Back",
    reset: "Restart",
    stepOf: (n: number, t: number) => `Step ${n} of ${t}`,
  },
  ar: {
    title: "تفاعلي: من ثلاثة سجلات إلى سجل ذهبي",
    hint: "تابع خطوات التوحيد والمطابقة والدمج. الأسماء والعناوين خيالية.",
    steps: [
      "السجلات المصدرية كما وردت. تبدو مختلفة لكنها قد تصف شخصاً واحداً.",
      "التوحيد: تُوسَّع الاختصارات مثل ش. حتى يمكن مقارنة السجلات بإنصاف.",
      "المطابقة: تقدّر أدلة الاسم والعنوان والبريد أن السجلات تعود لشخص واحد.",
      "الدمج: تختار قواعد الأفضلية أفضل قيمة لكل حقل. الناتج هو السجل الذهبي.",
    ],
    sources: ["المصدر أ", "المصدر ب", "المصدر ج"],
    records: [
      { name: "أحمد علي", address: "12 شارع النخيل", email: "" },
      { name: "أ. علي", address: "12 ش. النخيل", email: "" },
      { name: "أحمد علي", address: "", email: "ahmed@example.com" },
    ],
    stdAddr: "12 شارع النخيل",
    fields: ["الاسم", "العنوان", "البريد"],
    score: "درجة المطابقة 0.94: الشخص نفسه",
    golden: "السجل الذهبي",
    prov: ["من المصدر أ: الأكثر اكتمالاً", "من المصدر ب: صيغة موثقة", "من المصدر ج: القيمة الوحيدة"],
    goldenVals: { name: "أحمد علي", address: "12 شارع النخيل", email: "ahmed@example.com" },
    next: "الخطوة التالية",
    back: "رجوع",
    reset: "إعادة",
    stepOf: (n: number, t: number) => `الخطوة ${n} من ${t}`,
  },
};

function GoldenRecordStepper({ locale }: { locale: AppLocale }) {
  const c = MDM_COPY[locale];
  const [step, setStep] = React.useState(0);
  const last = step === c.steps.length - 1;
  const recs: Rec[] = c.records.map((r, i) => ({
    src: c.sources[i] ?? "",
    name: r.name,
    address: step >= 1 && r.address ? c.stdAddr : r.address,
    email: r.email,
  }));
  const matched = step >= 2;
  const dash = "-";
  return (
    <div className={shell}>
      <Heading title={c.title} hint={c.hint} />
      <div className="grid gap-3 tablet:grid-cols-3">
        {recs.map((r) => (
          <div
            key={r.src}
            className={`rounded-xl border p-4 text-sm transition-all motion-reduce:transition-none ${
              matched ? "border-emerald-400/70 bg-emerald-400/10" : "border-white/10 bg-white/[0.04]"
            } ${step === 3 ? "opacity-60" : ""}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{r.src}</p>
            <p className="mt-2 text-slate-100">{r.name || dash}</p>
            <p className="mt-1 text-slate-200">{r.address || dash}</p>
            <p className="mt-1 text-slate-200">{r.email || dash}</p>
          </div>
        ))}
      </div>
      {matched && (
        <p className="mt-4 inline-block rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          {c.score}
        </p>
      )}
      {step === 3 && (
        <div className="mt-4 rounded-xl border-2 border-emerald-400 bg-emerald-400/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">{c.golden}</p>
          <dl className="mt-3 space-y-2 text-sm">
            {[c.goldenVals.name, c.goldenVals.address, c.goldenVals.email].map((v, i) => (
              <div key={i} className="grid gap-1 tablet:grid-cols-[6rem_1fr_auto] tablet:gap-4">
                <dt className="text-slate-400">{c.fields[i]}</dt>
                <dd className="font-semibold text-white">{v}</dd>
                <dd className="text-xs text-emerald-200">{c.prov[i]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-4" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{c.stepOf(step + 1, c.steps.length)}</p>
        <p className="mt-2 text-base leading-relaxed text-slate-100">{c.steps[step]}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={`${btnBase} border-white/20 text-slate-200 disabled:opacity-40`}>
          {c.back}
        </button>
        {last ? (
          <button type="button" onClick={() => setStep(0)} className={`${btnBase} border-cyan-400 bg-cyan-400/15 text-white`}>
            {c.reset}
          </button>
        ) : (
          <button type="button" onClick={() => setStep((s) => s + 1)} className={`${btnBase} border-emerald-400 bg-emerald-400 text-[#06121f] hover:bg-emerald-300`}>
            {c.next}
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Switch ----------------------------------- */

export function ResourceDiagram({ category, locale }: Props) {
  switch (category) {
    case "classification":
      return <TierExplorer locale={locale} />;
    case "governance":
      return <GovernanceWalkthrough locale={locale} />;
    case "quality":
      return <QualityCalculator locale={locale} />;
    case "mdm":
      return <GoldenRecordStepper locale={locale} />;
    default:
      return null;
  }
}
