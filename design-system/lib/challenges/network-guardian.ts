import type { Bilingual } from "./bilingual";

export const NETWORK_GUARDIAN_CHALLENGE_KEY = "network_defense_build_the_shield" as const;
export const NETWORK_GUARDIAN_MAX_SCORE = 100;

export type NodeId = "internet" | "web_server" | "database_server" | "workstations";

export interface NetworkNode {
  id: NodeId;
  label: Bilingual;
  description: Bilingual;
  isOrigin?: boolean;
  isCrownJewel?: boolean;
}

export const NETWORK_GUARDIAN_NODES: NetworkNode[] = [
  {
    id: "internet",
    label: { en: "Internet (attacker)", ar: "الإنترنت (المهاجم)" },
    description: { en: "The untrusted network the attack originates from.", ar: "الشبكة غير الموثوقة التي تنطلق منها الهجمة." },
    isOrigin: true,
  },
  {
    id: "web_server",
    label: { en: "Public web server", ar: "خادم الويب العام" },
    description: {
      en: "Faces the internet directly today. Must stay reachable by customers, so it can never be fully cut off, only defended.",
      ar: "يواجه الإنترنت مباشرة حاليًا. يجب أن يبقى قابلًا للوصول من قبل العملاء، لذا لا يمكن عزله بالكامل، بل حمايته فقط.",
    },
  },
  {
    id: "database_server",
    label: { en: "Customer database", ar: "قاعدة بيانات العملاء" },
    description: {
      en: "Holds every customer record. This is the asset the whole exercise is defending.",
      ar: "تحتوي على جميع سجلات العملاء. هذا هو الأصل الذي يهدف التمرين بأكمله إلى حمايته.",
    },
    isCrownJewel: true,
  },
  {
    id: "workstations",
    label: { en: "Employee workstations", ar: "أجهزة الموظفين" },
    description: {
      en: "Ordinary employee laptops. They should never need a direct line to the customer database.",
      ar: "أجهزة كمبيوتر محمولة عادية للموظفين. لا ينبغي أن تحتاج أبدًا إلى اتصال مباشر بقاعدة بيانات العملاء.",
    },
  },
];

export type ControlId = "firewall" | "waf" | "dmz" | "vlan_segmentation";

export interface ControlDefinition {
  id: ControlId;
  name: Bilingual;
  description: Bilingual;
  weight: number;
  principle: Bilingual;
}

export const NETWORK_GUARDIAN_CONTROLS: ControlDefinition[] = [
  {
    id: "firewall",
    name: { en: "Perimeter firewall", ar: "جدار حماية محيطي (Firewall)" },
    description: {
      en: "Blocks all direct internet access to internal systems except the one server that must stay public.",
      ar: "يحظر أي وصول مباشر من الإنترنت إلى الأنظمة الداخلية باستثناء الخادم الوحيد الذي يجب أن يبقى عامًا.",
    },
    weight: 35,
    principle: {
      en: "A perimeter firewall enforces that only what truly needs to be public is reachable from the internet at all.",
      ar: "يفرض جدار الحماية المحيطي ألا يكون متاحًا من الإنترنت إلا ما يحتاج فعلًا إلى أن يكون عامًا.",
    },
  },
  {
    id: "waf",
    name: { en: "Web Application Firewall (WAF)", ar: "جدار حماية تطبيقات الويب (WAF)" },
    description: {
      en: "Filters malicious requests aimed at the public web server itself, before they can exploit it.",
      ar: "يقوم بتصفية الطلبات الضارة الموجهة إلى خادم الويب العام نفسه قبل أن تتمكن من استغلاله.",
    },
    weight: 20,
    principle: {
      en: "A WAF protects the one system that has no choice but to face the internet directly.",
      ar: "يحمي WAF النظام الوحيد الذي لا خيار أمامه سوى مواجهة الإنترنت مباشرة.",
    },
  },
  {
    id: "dmz",
    name: { en: "DMZ segmentation", ar: "تقسيم منطقة DMZ" },
    description: {
      en: "Isolates the public web server into its own zone, so even if it is compromised it cannot reach the database directly.",
      ar: "يعزل خادم الويب العام في منطقته الخاصة، بحيث لا يمكنه الوصول إلى قاعدة البيانات مباشرة حتى لو تم اختراقه.",
    },
    weight: 20,
    principle: {
      en: "Segmentation limits how far an attacker can move after the first system falls; the public server should never be able to reach the database directly.",
      ar: "يحدّ التقسيم من مدى قدرة المهاجم على التحرك بعد اختراق النظام الأول؛ يجب ألا يتمكن الخادم العام من الوصول إلى قاعدة البيانات مباشرة أبدًا.",
    },
  },
  {
    id: "vlan_segmentation",
    name: { en: "VLAN segmentation", ar: "تقسيم VLAN" },
    description: {
      en: "Separates employee workstations from the database network, so a single compromised laptop cannot reach customer records.",
      ar: "يفصل أجهزة الموظفين عن شبكة قاعدة البيانات، بحيث لا يمكن لجهاز محمول واحد تم اختراقه الوصول إلى سجلات العملاء.",
    },
    weight: 15,
    principle: {
      en: "Ordinary user devices and sensitive data stores belong on different network segments, regardless of what the perimeter firewall already blocks.",
      ar: "يجب أن توضع أجهزة المستخدمين العادية ومستودعات البيانات الحساسة في قطاعات شبكة مختلفة، بغض النظر عما يحظره جدار الحماية المحيطي أصلًا.",
    },
  },
];

interface TopologyEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  blockedBy: ControlId;
}

const TOPOLOGY_EDGES: TopologyEdge[] = [
  { id: "internet_to_database", from: "internet", to: "database_server", blockedBy: "firewall" },
  { id: "internet_to_workstations", from: "internet", to: "workstations", blockedBy: "firewall" },
  { id: "internet_to_web", from: "internet", to: "web_server", blockedBy: "waf" },
  { id: "web_to_database", from: "web_server", to: "database_server", blockedBy: "dmz" },
  { id: "workstations_to_database", from: "workstations", to: "database_server", blockedBy: "vlan_segmentation" },
];

export interface AttackSimulationResult {
  compromisedNodes: NodeId[];
  protectedNodes: NodeId[];
  attackPath: NodeId[] | null;
  databaseProtected: boolean;
  activeEdges: string[];
}

export function simulateAttack(placedControls: ControlId[]): AttackSimulationResult {
  const activeEdges = TOPOLOGY_EDGES.filter((edge) => !placedControls.includes(edge.blockedBy));

  const adjacency = new Map<NodeId, NodeId[]>();
  for (const edge of activeEdges) {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
  }

  const visited = new Set<NodeId>(["internet"]);
  const parent = new Map<NodeId, NodeId>();
  const queue: NodeId[] = ["internet"];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      parent.set(next, current);
      queue.push(next);
    }
  }

  const databaseProtected = !visited.has("database_server");
  let attackPath: NodeId[] | null = null;
  if (!databaseProtected) {
    const path: NodeId[] = ["database_server"];
    let node: NodeId = "database_server";
    while (parent.has(node)) {
      node = parent.get(node)!;
      path.unshift(node);
    }
    attackPath = path;
  }

  const allNodes = NETWORK_GUARDIAN_NODES.map((n) => n.id);
  const compromisedNodes = allNodes.filter((id) => visited.has(id));
  const protectedNodes = allNodes.filter((id) => !visited.has(id) && id !== "internet");

  return {
    compromisedNodes,
    protectedNodes,
    attackPath,
    databaseProtected,
    activeEdges: activeEdges.map((e) => e.id),
  };
}

export interface NetworkGuardianSubmission {
  placedControls: ControlId[];
  hintsUsed: number;
}

export interface NetworkGuardianResult {
  score: number;
  xp: number;
  simulation: AttackSimulationResult;
  outcome: "secured" | "partial" | "breached";
}

const HINT_PENALTY = 5;

export function computeNetworkGuardianScore(submission: NetworkGuardianSubmission): NetworkGuardianResult {
  const simulation = simulateAttack(submission.placedControls);

  const controlScore = NETWORK_GUARDIAN_CONTROLS.reduce(
    (sum, control) => sum + (submission.placedControls.includes(control.id) ? control.weight : 0),
    0
  );
  const targetBonus = simulation.databaseProtected ? 10 : 0;
  const hintPenalty = submission.hintsUsed * HINT_PENALTY;

  const score = Math.min(NETWORK_GUARDIAN_MAX_SCORE, Math.max(0, Math.round(controlScore + targetBonus - hintPenalty)));
  const xp = Math.round(score * 1.5);

  const baseline = simulateAttack([]);
  const outcome: "secured" | "partial" | "breached" = simulation.databaseProtected
    ? "secured"
    : simulation.compromisedNodes.length < baseline.compromisedNodes.length
      ? "partial"
      : "breached";

  return { score, xp, simulation, outcome };
}

export interface NetworkConsequenceCopy {
  outcomeLabel: Bilingual;
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
  keyDecision: Bilingual;
}

export function getNetworkConsequenceCopy(result: NetworkGuardianResult, submission: NetworkGuardianSubmission): NetworkConsequenceCopy {
  const hasFirewall = submission.placedControls.includes("firewall");
  const hasWafOrDmz = submission.placedControls.includes("waf") || submission.placedControls.includes("dmz");

  if (result.outcome === "secured") {
    return {
      outcomeLabel: { en: "Database secured", ar: "تم تأمين قاعدة البيانات" },
      headline: {
        en: "The simulated attack never reached the customer database.",
        ar: "لم تصل الهجمة المحاكاة إلى قاعدة بيانات العملاء إطلاقًا.",
      },
      whatHappened: {
        en: "The firewall closed off every direct path from the internet, and the remaining route through the web server was cut before it could reach the database.",
        ar: "أغلق جدار الحماية كل مسار مباشر من الإنترنت، وتم قطع المسار المتبقي عبر خادم الويب قبل أن يصل إلى قاعدة البيانات.",
      },
      whyItMattered: {
        en: "A public-facing server will always be a target; the goal is never letting a compromise there become a compromise everywhere.",
        ar: "سيكون الخادم المواجه للإنترنت هدفًا دائمًا؛ الهدف هو ألا يتحول اختراقه إلى اختراق شامل.",
      },
      keyDecision: {
        en: "Placing the firewall to remove direct internet access, then either the WAF or DMZ to cut the remaining pivot through the web server, is what closed every path.",
        ar: "وضع جدار الحماية لإزالة الوصول المباشر من الإنترنت، ثم إما WAF أو DMZ لقطع المسار المتبقي عبر خادم الويب، هو ما أغلق كل المسارات.",
      },
    };
  }
  if (result.outcome === "partial") {
    return {
      outcomeLabel: { en: "Attack partially contained", ar: "تم احتواء الهجمة جزئيًا" },
      headline: {
        en: "Some systems were protected, but the attacker still reached the customer database.",
        ar: "تمت حماية بعض الأنظمة، لكن المهاجم وصل مع ذلك إلى قاعدة بيانات العملاء.",
      },
      whatHappened: hasFirewall
        ? {
            en: "The firewall blocked direct internet access, but nothing stopped the web server from being used to pivot straight through to the database.",
            ar: "منع جدار الحماية الوصول المباشر من الإنترنت، لكن لا شيء أوقف استخدام خادم الويب للتنقل مباشرة إلى قاعدة البيانات.",
          }
        : {
            en: "Without a perimeter firewall, at least one direct path from the internet stayed open the whole time.",
            ar: "بدون جدار حماية محيطي، بقي مسار مباشر واحد على الأقل من الإنترنت مفتوحًا طوال الوقت.",
          },
      whyItMattered: {
        en: "Partial defenses still reduce blast radius, but the crown-jewel asset is either protected or it is not; there is no partial credit in a real incident.",
        ar: "الدفاعات الجزئية تقلل نطاق الضرر، لكن الأصل الأهم إما محمي أو غير محمي؛ لا توجد درجة جزئية في حادثة حقيقية.",
      },
      keyDecision: hasFirewall
        ? {
            en: "Adding a WAF or DMZ segmentation between the web server and the database was the missing decision.",
            ar: "إضافة WAF أو تقسيم DMZ بين خادم الويب وقاعدة البيانات كان القرار الناقص.",
          }
        : {
            en: "Placing the perimeter firewall first is what every other control here depends on.",
            ar: "وضع جدار الحماية المحيطي أولًا هو ما يعتمد عليه كل ضابط آخر هنا.",
          },
    };
  }
  return {
    outcomeLabel: { en: "Full breach", ar: "اختراق كامل" },
    headline: {
      en: "Every system, including the customer database, was reachable from the open internet.",
      ar: "كانت جميع الأنظمة، بما فيها قاعدة بيانات العملاء، قابلة للوصول من الإنترنت المفتوح.",
    },
    whatHappened: {
      en: "With no perimeter control in place, the attacker walked straight in through whichever node was easiest, then on to the database.",
      ar: "بدون أي ضابط محيطي، دخل المهاجم مباشرة عبر أسهل عقدة متاحة، ثم إلى قاعدة البيانات.",
    },
    whyItMattered: {
      en: hasWafOrDmz
        ? "Web-layer defenses only matter once the perimeter itself is closed; they cannot compensate for an open front door."
        : "An unsegmented, unfiltered network turns the compromise of any single system into the compromise of everything.",
      ar: hasWafOrDmz
        ? "دفاعات طبقة الويب لا تفيد إلا بعد إغلاق المحيط نفسه؛ فهي لا تعوّض عن باب أمامي مفتوح."
        : "الشبكة غير المقسّمة وغير المصفّاة تحوّل اختراق أي نظام واحد إلى اختراق كل شيء.",
    },
    keyDecision: {
      en: "Start with the perimeter firewall: nothing else here can help while every internal system is still directly reachable from the internet.",
      ar: "ابدأ بجدار الحماية المحيطي: لا شيء آخر هنا سيفيد طالما أن كل نظام داخلي لا يزال قابلًا للوصول مباشرة من الإنترنت.",
    },
  };
}
