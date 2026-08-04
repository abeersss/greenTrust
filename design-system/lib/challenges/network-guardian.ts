import type { Bilingual } from "./bilingual";
import { BADGE_PASS_SCORE } from "./keys";

export const NETWORK_GUARDIAN_CHALLENGE_KEY = "network_defense_build_the_shield" as const;
export const NETWORK_GUARDIAN_MAX_SCORE = 100;

/**
 * CTF 2.0 Phase 1 rebuild (2026-08-04).
 *
 * Network Guardian is now a three-mission arc rather than a single
 * four-node scenario. All three missions still live under the one
 * existing challenge key / badge (network_defense_build_the_shield ->
 * network_guardian) rather than three separate challenge keys, so no
 * new rows are needed in the `challenges` / `badges` tables and the
 * existing claim/persistence pipeline (anon-session.ts,
 * lib/actions/challenge.ts, keys.ts) keeps working unmodified. The
 * three missions play in a fixed sequence inside one component;
 * "progressive unlock" is therefore just the natural result of the
 * linear flow (you cannot reach mission 2 without finishing mission
 * 1), with no separate unlock-state to track.
 *
 * The final badge/XP result is the aggregate across all three
 * missions (see computeOverallResult): the average score must clear
 * BADGE_PASS_SCORE for the badge, matching the existing "strict
 * evaluation" rule already used everywhere else in Decision Labs.
 */

// ---------------------------------------------------------------------------
// Node catalog (shared across missions; each mission uses a subset)
// ---------------------------------------------------------------------------

export type NodeId =
  | "internet"
  | "router"
  | "web_server"
  | "app_server"
  | "database_server"
  | "workstations"
  | "file_server"
  | "identity_server"
  | "vpn_gateway"
  | "remote_users"
  | "cloud_workload";

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
    isOrigin: true,
    label: { en: "Internet", ar: "الإنترنت" },
    description: {
      en: "The public internet. Anyone, anywhere — including attackers — starts here.",
      ar: "الإنترنت العام. أي شخص، من أي مكان — بما في ذلك المهاجمون — يبدأ من هنا.",
    },
  },
  {
    id: "router",
    label: { en: "Border Router", ar: "الموجّه الحدودي" },
    description: {
      en: "The entry point where your network connects to the internet.",
      ar: "نقطة الدخول التي تربط شبكتك بالإنترنت.",
    },
  },
  {
    id: "web_server",
    label: { en: "Public Web Server", ar: "خادم الويب العام" },
    description: {
      en: "Hosts your public website. Must be reachable from the internet by design.",
      ar: "يستضيف موقعك العام. يجب أن يكون متاحًا من الإنترنت وفقًا للتصميم.",
    },
  },
  {
    id: "app_server",
    label: { en: "Application Server", ar: "خادم التطبيقات" },
    description: {
      en: "Runs your internal business logic. Should only ever be reached through the web tier, never directly.",
      ar: "يشغّل منطق الأعمال الداخلي. يجب ألا يُصل إليه إلا عبر طبقة الويب، أبدًا بشكل مباشر.",
    },
  },
  {
    id: "database_server",
    isCrownJewel: true,
    label: { en: "Customer Database", ar: "قاعدة بيانات العملاء" },
    description: {
      en: "Holds sensitive customer records. The attacker's real target in every mission.",
      ar: "تحتوي على سجلات العملاء الحساسة. الهدف الحقيقي للمهاجم في كل مهمة.",
    },
  },
  {
    id: "workstations",
    label: { en: "Employee Workstations", ar: "أجهزة الموظفين" },
    description: {
      en: "Everyday laptops and desktops used by staff. A common entry point via phishing.",
      ar: "أجهزة الكمبيوتر المحمولة والمكتبية اليومية التي يستخدمها الموظفون. نقطة دخول شائعة عبر التصيد.",
    },
  },
  {
    id: "file_server",
    label: { en: "Shared File Server", ar: "خادم الملفات المشترك" },
    description: {
      en: "Stores internal documents. An easy lateral-movement target once an attacker is already inside.",
      ar: "يخزّن المستندات الداخلية. هدف سهل للحركة الجانبية بمجرد دخول المهاجم.",
    },
  },
  {
    id: "identity_server",
    label: { en: "Identity Server (AD / IAM)", ar: "خادم الهوية (AD / IAM)" },
    description: {
      en: "Manages logins and permissions across the company. Compromise here compromises everything downstream.",
      ar: "يدير عمليات تسجيل الدخول والصلاحيات في الشركة. اختراقه يعني اختراق كل ما بعده.",
    },
  },
  {
    id: "vpn_gateway",
    label: { en: "VPN Gateway", ar: "بوابة VPN" },
    description: {
      en: "Lets remote employees connect into the internal network from anywhere.",
      ar: "تتيح للموظفين عن بُعد الاتصال بالشبكة الداخلية من أي مكان.",
    },
  },
  {
    id: "remote_users",
    label: { en: "Remote Employees", ar: "الموظفون عن بُعد" },
    description: {
      en: "Staff working from home or on the road, connecting in over the internet.",
      ar: "موظفون يعملون من المنزل أو أثناء التنقل، ويتصلون عبر الإنترنت.",
    },
  },
  {
    id: "cloud_workload",
    label: { en: "Cloud Workload", ar: "حِمل العمل السحابي" },
    description: {
      en: "An application and database hosted in the cloud, extending your network beyond your own walls.",
      ar: "تطبيق وقاعدة بيانات مستضافان في السحابة، يمتدان بشبكتك إلى ما وراء جدرانك الخاصة.",
    },
  },
];

export function getNode(id: NodeId): NetworkNode {
  const node = NETWORK_GUARDIAN_NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown Network Guardian node: ${id}`);
  return node;
}

// ---------------------------------------------------------------------------
// Control catalog (shared across missions; each mission offers a subset,
// with a mission-specific weight reflecting how critical that control is
// to *that* mission's topology)
// ---------------------------------------------------------------------------

export type ControlId =
  | "firewall"
  | "waf"
  | "dmz"
  | "vlan_segmentation"
  | "ids_ips"
  | "mfa_identity"
  | "vpn_encryption"
  | "cloud_security_groups";

export interface ControlDefinition {
  id: ControlId;
  name: Bilingual;
  description: Bilingual;
  principle: Bilingual;
}

export const NETWORK_GUARDIAN_CONTROLS: ControlDefinition[] = [
  {
    id: "firewall",
    name: { en: "Perimeter Firewall", ar: "جدار حماية محيطي" },
    description: {
      en: "Blocks unsolicited inbound connections from the internet to internal systems.",
      ar: "يحظر الاتصالات الواردة غير المرغوبة من الإنترنت إلى الأنظمة الداخلية.",
    },
    principle: { en: "Default deny at the network boundary.", ar: "الرفض الافتراضي عند حدود الشبكة." },
  },
  {
    id: "waf",
    name: { en: "Web Application Firewall", ar: "جدار حماية تطبيقات الويب" },
    description: {
      en: "Inspects and filters HTTP traffic to the public web server, blocking common web exploits.",
      ar: "يفحص ويُصفّي حركة HTTP إلى خادم الويب العام، ويحظر ثغرات الويب الشائعة.",
    },
    principle: { en: "Inspect at the application layer, not just the port.", ar: "الفحص على طبقة التطبيق، لا المنفذ فقط." },
  },
  {
    id: "dmz",
    name: { en: "DMZ Segmentation", ar: "تقسيم المنطقة منزوعة السلاح (DMZ)" },
    description: {
      en: "Isolates public-facing servers in their own zone so a compromised server can't reach internal systems directly.",
      ar: "يعزل الخوادم المواجهة للإنترنت في منطقتها الخاصة حتى لا يصل خادم مخترق إلى الأنظمة الداخلية مباشرة.",
    },
    principle: { en: "Contain the blast radius of internet-facing systems.", ar: "احتواء نطاق الضرر للأنظمة المواجهة للإنترنت." },
  },
  {
    id: "vlan_segmentation",
    name: { en: "Internal VLAN Segmentation", ar: "تقسيم الشبكة الداخلية (VLAN)" },
    description: {
      en: "Separates internal network segments so a compromised device can't freely reach sensitive systems.",
      ar: "يفصل أجزاء الشبكة الداخلية حتى لا يصل جهاز مخترق بحرية إلى الأنظمة الحساسة.",
    },
    principle: { en: "A flat network lets one compromised device reach everything.", ar: "الشبكة المسطّحة تتيح لجهاز واحد مخترق الوصول لكل شيء." },
  },
  {
    id: "ids_ips",
    name: { en: "Intrusion Detection / Prevention", ar: "كشف / منع التسلل (IDS/IPS)" },
    description: {
      en: "Monitors internal traffic for known attack patterns and blocks lateral movement between systems.",
      ar: "يراقب حركة البيانات الداخلية بحثًا عن أنماط هجوم معروفة ويمنع الحركة الجانبية بين الأنظمة.",
    },
    principle: { en: "Detect and stop movement after the perimeter is already crossed.", ar: "اكتشاف الحركة وإيقافها بعد تجاوز المحيط بالفعل." },
  },
  {
    id: "mfa_identity",
    name: { en: "Multi-Factor Authentication", ar: "المصادقة متعددة العوامل" },
    description: {
      en: "Requires a second verification factor, so stolen credentials alone aren't enough to reach sensitive systems.",
      ar: "تتطلب عامل تحقق ثانٍ، بحيث لا تكفي بيانات الاعتماد المسروقة وحدها للوصول إلى الأنظمة الحساسة.",
    },
    principle: { en: "A password alone is not proof of identity.", ar: "كلمة المرور وحدها ليست إثباتًا للهوية." },
  },
  {
    id: "vpn_encryption",
    name: { en: "Encrypted VPN Gateway", ar: "بوابة VPN مشفّرة" },
    description: {
      en: "Encrypts and authenticates remote-access connections before they reach the internal network.",
      ar: "تُشفّر وتُوثّق اتصالات الوصول عن بُعد قبل وصولها إلى الشبكة الداخلية.",
    },
    principle: { en: "Remote access must be as controlled as access from the office.", ar: "الوصول عن بُعد يجب أن يكون مضبوطًا كالوصول من المكتب." },
  },
  {
    id: "cloud_security_groups",
    name: { en: "Cloud Security Groups", ar: "مجموعات الأمان السحابية" },
    description: {
      en: "Restricts which sources can reach cloud-hosted workloads, mirroring firewall rules in the cloud.",
      ar: "تقيّد الجهات التي يمكنها الوصول إلى الأحمال السحابية، بما يعادل قواعد جدار الحماية في السحابة.",
    },
    principle: { en: "Cloud resources need the same default-deny posture as on-prem.", ar: "الموارد السحابية تحتاج نفس وضعية الرفض الافتراضي المحلية." },
  },
];

export function getControl(id: ControlId): ControlDefinition {
  const control = NETWORK_GUARDIAN_CONTROLS.find((c) => c.id === id);
  if (!control) throw new Error(`Unknown Network Guardian control: ${id}`);
  return control;
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export type MissionId = "basic_perimeter" | "internal_segmentation" | "hybrid_cloud";

export interface MissionEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  /**
   * Omitted for a small number of edges (e.g. internet -> remote_users)
   * that represent an inherent exposure no placeable control removes —
   * an attacker can always reach a remote worker out on the open
   * internet the same way they can reach anyone else there. Those
   * edges are always traversable; the real decision is which control
   * protects what's *behind* them.
   */
  blockedBy?: ControlId;
}

export interface MissionControlWeight {
  controlId: ControlId;
  weight: number;
}

export interface MissionDefinition {
  id: MissionId;
  order: number;
  title: Bilingual;
  briefing: Bilingual;
  nodeIds: NodeId[];
  edges: MissionEdge[];
  availableControls: ControlId[];
  controlWeights: MissionControlWeight[]; // sums to 90; +10 crown-jewel bonus = 100
  crownJewel: NodeId;
  hint1: Bilingual;
  hint2: Bilingual;
}

export const NETWORK_GUARDIAN_MISSIONS: MissionDefinition[] = [
  {
    id: "basic_perimeter",
    order: 1,
    title: { en: "Mission 1: Basic Perimeter Defense", ar: "المهمة 1: الدفاع الأساسي عن المحيط" },
    briefing: {
      en: "A red-team penetration test begins in ten minutes. Your public web server, customer database, and employee workstations all currently sit reachable from the open internet. Decide which security controls to place before the test starts — you will not get a second chance once it begins.",
      ar: "يبدأ اختبار اختراق من فريق أحمر خلال عشر دقائق. خادم الويب العام وقاعدة بيانات العملاء وأجهزة الموظفين جميعها متاحة حاليًا من الإنترنت المفتوح. قرّر أي ضوابط أمنية ستضعها قبل بدء الاختبار — لن تحصل على فرصة ثانية بعد بدئه.",
    },
    nodeIds: ["internet", "router", "web_server", "database_server", "workstations"],
    edges: [
      { id: "m1_internet_router", from: "internet", to: "router", blockedBy: "firewall" },
      { id: "m1_router_web", from: "router", to: "web_server", blockedBy: "waf" },
      { id: "m1_router_workstations", from: "router", to: "workstations", blockedBy: "firewall" },
      { id: "m1_web_db", from: "web_server", to: "database_server", blockedBy: "dmz" },
      { id: "m1_workstations_db", from: "workstations", to: "database_server", blockedBy: "vlan_segmentation" },
    ],
    availableControls: ["firewall", "waf", "dmz", "vlan_segmentation"],
    controlWeights: [
      { controlId: "firewall", weight: 35 },
      { controlId: "waf", weight: 20 },
      { controlId: "dmz", weight: 20 },
      { controlId: "vlan_segmentation", weight: 15 },
    ],
    crownJewel: "database_server",
    hint1: {
      en: "Nothing reaches an internal system without first crossing the boundary between your network and the internet.",
      ar: "لا شيء يصل إلى نظام داخلي دون أن يعبر أولاً الحد الفاصل بين شبكتك والإنترنت.",
    },
    hint2: {
      en: "The public web server can never be fully cut off from the internet — but what it is allowed to reach afterward is still your decision.",
      ar: "لا يمكن عزل خادم الويب العام عن الإنترنت بالكامل أبدًا — لكن ما يُسمح له بالوصول إليه لاحقًا لا يزال قرارك.",
    },
  },
  {
    id: "internal_segmentation",
    order: 2,
    title: { en: "Mission 2: Segment the Internal Network", ar: "المهمة 2: تقسيم الشبكة الداخلية" },
    briefing: {
      en: "The perimeter test passed, but the network behind it is flat: the web tier, the internal file server, and the identity server that controls every login all sit on the same segment as the database. A phishing email is about to land in an employee's inbox. Decide how the internal network gets segmented before it does.",
      ar: "اجتاز اختبار المحيط بنجاح، لكن الشبكة خلفه مسطّحة: طبقة الويب وخادم الملفات الداخلي وخادم الهوية الذي يتحكم بكل تسجيل دخول، جميعها على نفس الجزء مع قاعدة البيانات. رسالة تصيد على وشك الوصول إلى صندوق بريد أحد الموظفين. قرّر كيف يتم تقسيم الشبكة الداخلية قبل ذلك.",
    },
    nodeIds: ["internet", "web_server", "app_server", "database_server", "workstations", "file_server", "identity_server"],
    edges: [
      { id: "m2_internet_web", from: "internet", to: "web_server", blockedBy: "waf" },
      { id: "m2_internet_workstations", from: "internet", to: "workstations", blockedBy: "firewall" },
      { id: "m2_web_app", from: "web_server", to: "app_server", blockedBy: "dmz" },
      { id: "m2_app_db", from: "app_server", to: "database_server", blockedBy: "vlan_segmentation" },
      { id: "m2_workstations_file", from: "workstations", to: "file_server", blockedBy: "ids_ips" },
      { id: "m2_workstations_identity", from: "workstations", to: "identity_server", blockedBy: "mfa_identity" },
      { id: "m2_identity_db", from: "identity_server", to: "database_server", blockedBy: "vlan_segmentation" },
    ],
    availableControls: ["firewall", "waf", "dmz", "vlan_segmentation", "ids_ips", "mfa_identity"],
    controlWeights: [
      { controlId: "firewall", weight: 10 },
      { controlId: "waf", weight: 15 },
      { controlId: "dmz", weight: 15 },
      { controlId: "vlan_segmentation", weight: 15 },
      { controlId: "ids_ips", weight: 15 },
      { controlId: "mfa_identity", weight: 20 },
    ],
    crownJewel: "database_server",
    hint1: {
      en: "The identity server controls logins for everything else. Whatever protects it is worth more than it looks.",
      ar: "خادم الهوية يتحكم بتسجيل الدخول لكل شيء آخر. ما يحميه يستحق أكثر مما يبدو.",
    },
    hint2: {
      en: "A compromised workstation can move sideways to the file server just as easily as it can go looking for the database — lateral movement needs its own control.",
      ar: "الجهاز المخترق يمكنه التحرك جانبيًا نحو خادم الملفات بنفس سهولة بحثه عن قاعدة البيانات — الحركة الجانبية تحتاج ضابطها الخاص.",
    },
  },
  {
    id: "hybrid_cloud",
    order: 3,
    title: { en: "Mission 3: Hybrid Cloud & Remote Access", ar: "المهمة 3: السحابة الهجينة والوصول عن بُعد" },
    briefing: {
      en: "Half the company now works remotely, and a new customer-facing app runs entirely in the cloud, replicating data back to the same database. Remote logins and cloud traffic both bypass your office network entirely. Decide how to defend a network that no longer has a single perimeter.",
      ar: "نصف الشركة يعمل الآن عن بُعد، وتطبيق جديد يواجه العملاء يعمل بالكامل في السحابة، وينسخ البيانات إلى نفس قاعدة البيانات. تسجيلات الدخول عن بُعد وحركة السحابة كلاهما يتجاوز شبكة المكتب تمامًا. قرّر كيف تدافع عن شبكة لم يعد لها محيط واحد.",
    },
    nodeIds: ["internet", "remote_users", "vpn_gateway", "workstations", "cloud_workload", "database_server"],
    edges: [
      { id: "m3_internet_remote", from: "internet", to: "remote_users" },
      { id: "m3_remote_vpn", from: "remote_users", to: "vpn_gateway", blockedBy: "vpn_encryption" },
      { id: "m3_vpn_workstations", from: "vpn_gateway", to: "workstations", blockedBy: "mfa_identity" },
      { id: "m3_workstations_db", from: "workstations", to: "database_server", blockedBy: "vlan_segmentation" },
      { id: "m3_internet_cloud", from: "internet", to: "cloud_workload", blockedBy: "cloud_security_groups" },
      { id: "m3_cloud_db", from: "cloud_workload", to: "database_server", blockedBy: "firewall" },
    ],
    availableControls: ["vpn_encryption", "mfa_identity", "vlan_segmentation", "cloud_security_groups", "firewall"],
    controlWeights: [
      { controlId: "vpn_encryption", weight: 20 },
      { controlId: "mfa_identity", weight: 20 },
      { controlId: "vlan_segmentation", weight: 20 },
      { controlId: "cloud_security_groups", weight: 20 },
      { controlId: "firewall", weight: 10 },
    ],
    crownJewel: "database_server",
    hint1: {
      en: "An unencrypted remote connection is just as dangerous as an open door in your office — the VPN gateway is not optional.",
      ar: "الاتصال عن بُعد غير المشفّر خطير مثل باب مفتوح في مكتبك — بوابة VPN ليست اختيارية.",
    },
    hint2: {
      en: "The cloud workload writes back to the same database as everything else. It needs the same discipline as any other path into it.",
      ar: "حِمل العمل السحابي يكتب إلى نفس قاعدة البيانات مثل كل شيء آخر. يحتاج نفس الانضباط مثل أي مسار آخر إليها.",
    },
  },
];

export function getMission(id: MissionId): MissionDefinition {
  const mission = NETWORK_GUARDIAN_MISSIONS.find((m) => m.id === id);
  if (!mission) throw new Error(`Unknown Network Guardian mission: ${id}`);
  return mission;
}

// ---------------------------------------------------------------------------
// Attack simulation (generalized BFS over a mission's edge list)
// ---------------------------------------------------------------------------

export interface AttackSimulationResult {
  compromisedNodes: NodeId[];
  protectedNodes: NodeId[];
  attackPath: NodeId[] | null;
  crownJewelProtected: boolean;
  activeEdges: string[];
}

export function simulateMissionAttack(mission: MissionDefinition, placedControls: ControlId[]): AttackSimulationResult {
  const activeEdges = mission.edges.filter((e) => !e.blockedBy || !placedControls.includes(e.blockedBy));
  const activeEdgeIds = activeEdges.map((e) => e.id);

  const adjacency = new Map<NodeId, NodeId[]>();
  for (const id of mission.nodeIds) adjacency.set(id, []);
  for (const edge of activeEdges) {
    adjacency.get(edge.from)?.push(edge.to);
    adjacency.get(edge.to)?.push(edge.from);
  }

  const origin: NodeId = "internet";
  const visited = new Set<NodeId>([origin]);
  const parent = new Map<NodeId, NodeId>();
  const queue: NodeId[] = [origin];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      parent.set(neighbor, current);
      queue.push(neighbor);
    }
  }

  const compromisedNodes = mission.nodeIds.filter((id) => id !== origin && visited.has(id));
  const protectedNodes = mission.nodeIds.filter((id) => id !== origin && !visited.has(id));
  const crownJewelProtected = !visited.has(mission.crownJewel);

  let attackPath: NodeId[] | null = null;
  if (visited.has(mission.crownJewel)) {
    const path: NodeId[] = [mission.crownJewel];
    let cursor: NodeId | undefined = mission.crownJewel;
    while (cursor && parent.has(cursor)) {
      cursor = parent.get(cursor);
      if (cursor) path.unshift(cursor);
    }
    attackPath = path;
  }

  return { compromisedNodes, protectedNodes, attackPath, crownJewelProtected, activeEdges: activeEdgeIds };
}

// ---------------------------------------------------------------------------
// Scoring — per mission, then aggregated across all three
// ---------------------------------------------------------------------------

export interface MissionSubmission {
  missionId: MissionId;
  placedControls: ControlId[];
  hintsUsed: number;
}

export type MissionOutcome = "secured" | "partial" | "breached";

export interface MissionResult {
  missionId: MissionId;
  score: number;
  xp: number;
  simulation: AttackSimulationResult;
  outcome: MissionOutcome;
  passed: boolean;
}

const HINT_PENALTY = 5;

export function computeMissionScore(submission: MissionSubmission): MissionResult {
  const mission = getMission(submission.missionId);
  const simulation = simulateMissionAttack(mission, submission.placedControls);
  const baseline = simulateMissionAttack(mission, []);

  const controlScore = mission.controlWeights
    .filter((cw) => submission.placedControls.includes(cw.controlId))
    .reduce((sum, cw) => sum + cw.weight, 0);
  const targetBonus = simulation.crownJewelProtected ? 10 : 0;
  const hintPenalty = submission.hintsUsed * HINT_PENALTY;
  const score = Math.max(0, Math.min(100, controlScore + targetBonus - hintPenalty));
  const xp = Math.round(score * 1.5);

  const outcome: MissionOutcome = simulation.crownJewelProtected
    ? "secured"
    : simulation.compromisedNodes.length < baseline.compromisedNodes.length
      ? "partial"
      : "breached";

  return { missionId: mission.id, score, xp, simulation, outcome, passed: score >= BADGE_PASS_SCORE };
}

export interface OverallResult {
  score: number;
  xp: number;
  missionResults: MissionResult[];
  allPassed: boolean;
  outcome: MissionOutcome;
}

export function computeOverallResult(missionResults: MissionResult[]): OverallResult {
  const score = missionResults.length
    ? Math.round(missionResults.reduce((sum, r) => sum + r.score, 0) / missionResults.length)
    : 0;
  const xp = missionResults.reduce((sum, r) => sum + r.xp, 0);
  const allPassed = missionResults.length > 0 && missionResults.every((r) => r.passed);
  const outcome: MissionOutcome = missionResults.every((r) => r.outcome === "secured")
    ? "secured"
    : missionResults.some((r) => r.outcome === "breached")
      ? "breached"
      : "partial";
  return { score, xp, missionResults, allPassed, outcome };
}

// ---------------------------------------------------------------------------
// Consequence narrative copy
// ---------------------------------------------------------------------------

export interface NetworkConsequenceCopy {
  outcomeLabel: Bilingual;
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
  keyDecision: Bilingual;
}

const OUTCOME_LABEL: Record<MissionOutcome, Bilingual> = {
  secured: { en: "Database secured", ar: "تم تأمين قاعدة البيانات" },
  partial: { en: "Attack partially contained", ar: "تم احتواء الهجمة جزئيًا" },
  breached: { en: "Full breach", ar: "اختراق كامل" },
};

const MISSION_CONSEQUENCE_COPY: Record<MissionId, Record<MissionOutcome, Omit<NetworkConsequenceCopy, "outcomeLabel">>> = {
  basic_perimeter: {
    secured: {
      headline: { en: "The pentest found nothing.", ar: "لم يجد اختبار الاختراق شيئًا." },
      whatHappened: {
        en: "The red team probed every open port they could find. The firewall stopped direct paths to the database, the WAF caught their web exploits, and the DMZ meant that even a compromised web server couldn't reach anything sensitive.",
        ar: "فحص الفريق الأحمر كل منفذ مفتوح استطاعوا إيجاده. أوقف جدار الحماية المسارات المباشرة إلى قاعدة البيانات، وأمسك جدار حماية تطبيقات الويب ثغراتهم، وعنى وجود المنطقة منزوعة السلاح أن خادم الويب المخترق لا يمكنه الوصول لأي شيء حساس.",
      },
      whyItMattered: {
        en: "Layered controls mean no single failure exposes the crown jewel. Even if one control had been missing, the others still stood between the internet and the database.",
        ar: "الضوابط المتعددة الطبقات تعني أن فشل ضابط واحد لا يعرّض الجوهرة الحقيقية. حتى لو غاب ضابط واحد، بقيت البقية بين الإنترنت وقاعدة البيانات.",
      },
      keyDecision: {
        en: "Placing the firewall, WAF, and DMZ together closed every path the red team tried.",
        ar: "وضع جدار الحماية وجدار حماية تطبيقات الويب والمنطقة منزوعة السلاح معًا أغلق كل مسار جرّبه الفريق الأحمر.",
      },
    },
    partial: {
      headline: { en: "They got in — but not all the way.", ar: "دخلوا — لكن ليس بالكامل." },
      whatHappened: {
        en: "The red team compromised at least one internal system, but the database itself stayed out of reach. Whatever controls were missing let them through the perimeter, but the remaining controls held the inner line.",
        ar: "اخترق الفريق الأحمر نظامًا داخليًا واحدًا على الأقل، لكن قاعدة البيانات بقيت بعيدة عن متناولهم. الضوابط الناقصة سمحت لهم بعبور المحيط، لكن الضوابط المتبقية صمدت في الخط الداخلي.",
      },
      whyItMattered: {
        en: "This is what defense in depth looks like when it's incomplete: a breach happened, but it was contained rather than total.",
        ar: "هذا هو شكل الدفاع المتعدد الطبقات عندما يكون غير مكتمل: حدث اختراق، لكنه احتُوي ولم يكن كاملاً.",
      },
      keyDecision: {
        en: "The controls you skipped are the exact paths the red team used to get in.",
        ar: "الضوابط التي تخطّيتها هي بالضبط المسارات التي استخدمها الفريق الأحمر للدخول.",
      },
    },
    breached: {
      headline: { en: "Full breach. The database is gone.", ar: "اختراق كامل. قاعدة البيانات ضاعت." },
      whatHappened: {
        en: "With too few controls in place, the red team walked a direct or near-direct path from the open internet straight to the customer database.",
        ar: "مع وجود ضوابط قليلة جدًا، سلك الفريق الأحمر مسارًا مباشرًا أو شبه مباشر من الإنترنت المفتوح إلى قاعدة بيانات العملاء مباشرة.",
      },
      whyItMattered: {
        en: "An unsegmented, unfiltered network turns any single opening into a straight line to your most sensitive data.",
        ar: "الشبكة غير المقسّمة وغير المُصفّاة تحوّل أي فتحة واحدة إلى خط مباشر نحو أكثر بياناتك حساسية.",
      },
      keyDecision: {
        en: "Start with the firewall — it is the single control that removes the most direct paths in this topology.",
        ar: "ابدأ بجدار الحماية — إنه الضابط الوحيد الذي يزيل أكبر عدد من المسارات المباشرة في هذه البنية.",
      },
    },
  },
  internal_segmentation: {
    secured: {
      headline: { en: "The phishing email landed — and went nowhere.", ar: "وصلت رسالة التصيد — ولم تذهب لأي مكان." },
      whatHappened: {
        en: "An employee clicked the link. Their workstation was compromised, exactly as planned. But segmentation kept that compromise from spreading: the file server, the identity server, and the database all sat behind their own boundaries.",
        ar: "ضغط أحد الموظفين على الرابط. اخترق جهازه، تمامًا كما هو مخطط. لكن التقسيم منع انتشار الاختراق: خادم الملفات وخادم الهوية وقاعدة البيانات جميعها كانت خلف حدودها الخاصة.",
      },
      whyItMattered: {
        en: "You cannot prevent every phishing click. What you control is what a compromised workstation can reach afterward — and here, the answer was almost nothing.",
        ar: "لا يمكنك منع كل ضغطة تصيد. ما تتحكم فيه هو ما يستطيع الجهاز المخترق الوصول إليه بعد ذلك — وهنا كانت الإجابة تقريبًا لا شيء.",
      },
      keyDecision: {
        en: "Protecting the identity server mattered most: it controls every login downstream of it.",
        ar: "حماية خادم الهوية كانت الأهم: فهو يتحكم بكل تسجيل دخول يقع بعده.",
      },
    },
    partial: {
      headline: { en: "One compromised workstation reached further than it should have.", ar: "جهاز مخترق واحد وصل إلى أبعد مما يجب." },
      whatHappened: {
        en: "The phishing attack succeeded, and the compromised workstation moved laterally into at least one internal system — but the database itself was not reached.",
        ar: "نجح هجوم التصيد، وتحرّك الجهاز المخترق جانبيًا إلى نظام داخلي واحد على الأقل — لكن قاعدة البيانات نفسها لم تُخترق.",
      },
      whyItMattered: {
        en: "A flat internal network turns one careless click into access to systems that click never should have touched.",
        ar: "الشبكة الداخلية المسطّحة تحوّل ضغطة واحدة غير حذرة إلى وصول لأنظمة لم يكن يجب أن تصلها تلك الضغطة أبدًا.",
      },
      keyDecision: {
        en: "IDS/IPS and identity protection are what stop lateral movement after the initial click — both are worth revisiting.",
        ar: "كشف/منع التسلل وحماية الهوية هما ما يوقف الحركة الجانبية بعد الضغطة الأولى — كلاهما يستحق إعادة النظر.",
      },
    },
    breached: {
      headline: { en: "The identity server fell — and everything followed.", ar: "سقط خادم الهوية — وتبعه كل شيء." },
      whatHappened: {
        en: "The compromised workstation walked straight into the identity server and, from there, into the database. Without MFA and segmentation, one set of stolen credentials was enough for all of it.",
        ar: "دخل الجهاز المخترق مباشرة إلى خادم الهوية، ومنه إلى قاعدة البيانات. بدون المصادقة متعددة العوامل والتقسيم، كانت مجموعة واحدة من بيانات الاعتماد المسروقة كافية لكل ذلك.",
      },
      whyItMattered: {
        en: "An identity server without MFA is a single point of failure for the entire internal network, not just one account.",
        ar: "خادم الهوية بلا مصادقة متعددة العوامل هو نقطة فشل وحيدة لكامل الشبكة الداخلية، وليس لحساب واحد فقط.",
      },
      keyDecision: {
        en: "MFA on the identity server would have stopped this breach at its first step.",
        ar: "المصادقة متعددة العوامل على خادم الهوية كانت ستوقف هذا الاختراق منذ خطوته الأولى.",
      },
    },
  },
  hybrid_cloud: {
    secured: {
      headline: { en: "No perimeter — and still no breach.", ar: "لا محيط — ومع ذلك لا اختراق." },
      whatHappened: {
        en: "Remote logins came in over an encrypted, MFA-protected path. The cloud workload's traffic was restricted by security groups. Neither route reached the database.",
        ar: "وصلت تسجيلات الدخول عن بُعد عبر مسار مشفّر ومحمي بالمصادقة متعددة العوامل. حركة حِمل العمل السحابي قُيّدت بمجموعات الأمان. لم يصل أي من المسارين إلى قاعدة البيانات.",
      },
      whyItMattered: {
        en: "Zero Trust doesn't mean no access — it means every path, remote or cloud, is verified and restricted on its own terms, with no path implicitly trusted just because it's 'inside'.",
        ar: "الثقة الصفرية لا تعني عدم الوصول — بل تعني أن كل مسار، عن بُعد أو سحابي، يُتحقق منه ويُقيَّد بشروطه الخاصة، دون ثقة ضمنية لمجرد أنه 'داخلي'.",
      },
      keyDecision: {
        en: "Treating the VPN and the cloud workload as equally untrusted paths — and controlling both — closed the whole attack surface.",
        ar: "التعامل مع VPN وحِمل العمل السحابي كمسارين غير موثوقين بالتساوي — والتحكم بكليهما — أغلق كامل سطح الهجوم.",
      },
    },
    partial: {
      headline: { en: "One path in got through — the database held.", ar: "مسار واحد نجح في الاختراق — قاعدة البيانات صمدت." },
      whatHappened: {
        en: "Either the remote-access path or the cloud path let an attacker in, but the internal segmentation around the database stopped them from going further.",
        ar: "إما مسار الوصول عن بُعد أو المسار السحابي سمح لمهاجم بالدخول، لكن التقسيم الداخلي حول قاعدة البيانات أوقفهم عن التقدم أكثر.",
      },
      whyItMattered: {
        en: "A hybrid network has more than one front door. Securing only one of them still leaves the other wide open.",
        ar: "الشبكة الهجينة لديها أكثر من باب أمامي. تأمين واحد منها فقط يترك الآخر مفتوحًا على مصراعيه.",
      },
      keyDecision: {
        en: "Remote access and cloud workloads both need their own dedicated controls — neither can borrow the other's protection.",
        ar: "الوصول عن بُعد والأحمال السحابية كلاهما يحتاج ضوابط مخصصة له — لا يمكن لأحدهما استعارة حماية الآخر.",
      },
    },
    breached: {
      headline: { en: "The database was reachable from outside the office entirely.", ar: "قاعدة البيانات كانت متاحة بالكامل من خارج المكتب." },
      whatHappened: {
        en: "With remote access and cloud traffic both left uncontrolled, an attacker never needed to go near your office network at all — they walked straight in through the paths meant for legitimate remote work.",
        ar: "مع ترك الوصول عن بُعد وحركة السحابة دون ضبط، لم يحتج المهاجم للاقتراب من شبكة مكتبك إطلاقًا — دخل مباشرة عبر المسارات المخصصة للعمل عن بُعد المشروع.",
      },
      whyItMattered: {
        en: "In a hybrid network, 'the perimeter' isn't a place anymore — every remote connection and every cloud link is its own perimeter that needs its own defense.",
        ar: "في الشبكة الهجينة، 'المحيط' لم يعد مكانًا — كل اتصال عن بُعد وكل رابط سحابي هو محيطه الخاص الذي يحتاج دفاعه الخاص.",
      },
      keyDecision: {
        en: "Start with VPN encryption and cloud security groups — they close the two doors this attack actually used.",
        ar: "ابدأ بتشفير VPN ومجموعات الأمان السحابية — فهما يغلقان البابين اللذين استخدمهما هذا الهجوم فعليًا.",
      },
    },
  },
};

export function getNetworkConsequenceCopy(missionId: MissionId, result: MissionResult): NetworkConsequenceCopy {
  const copy = MISSION_CONSEQUENCE_COPY[missionId][result.outcome];
  return { outcomeLabel: OUTCOME_LABEL[result.outcome], ...copy };
}
