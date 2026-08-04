import type { Bilingual } from "./bilingual";
import { BADGE_PASS_SCORE } from "./keys";

export const NETWORK_GUARDIAN_CHALLENGE_KEY = "network_defense_build_the_shield" as const;
export const NETWORK_GUARDIAN_MAX_SCORE = 100;

/**
 * CTF 2.0 Phase 1 rebuild (2026-08-04), puzzle revision (2026-08-04).
 *
 * Network Guardian is a three-mission arc under one existing challenge
 * key / badge (see the original rebuild note below). This revision
 * fixes the core design flaw from the first pass: with every control
 * placeable and no cost, "place everything" was always the optimal
 * move, so there was no actual decision to make.
 *
 * Each mission now has a `controlBudget` — strictly fewer control
 * slots than there are available controls. Every mission's topology
 * has exactly two independent routes from the internet to the
 * database (the crown jewel). The puzzle is: figure out both routes
 * (by tapping nodes and hovering controls), then spend your limited
 * slots covering *both* routes rather than stacking redundant
 * controls on just one. Placing a control as early as possible on a
 * route also protects the node at that point too, not just the
 * database further down — so two solutions can both "secure the
 * database" while scoring differently based on how clean the defense
 * was. That is graded by computeMissionScore below.
 *
 * Original rebuild note (2026-08-04): all three missions still live
 * under the one existing challenge key / badge
 * (network_defense_build_the_shield -> network_guardian) rather than
 * three separate challenge keys, so no new rows are needed in the
 * `challenges` / `badges` tables and the existing claim/persistence
 * pipeline (anon-session.ts, lib/actions/challenge.ts, keys.ts) keeps
 * working unmodified. The three missions play in a fixed sequence
 * inside one component; "progressive unlock" is therefore just the
 * natural result of the linear flow, with no separate unlock-state to
 * track. The final badge/XP result is the aggregate across all three
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
      en: "Hosts your public website. One of two independent routes into the network — must stay reachable by design.",
      ar: "يستضيف موقعك العام. أحد مسارين مستقلين إلى الشبكة — يجب أن يبقى متاحًا وفقًا للتصميم.",
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
      en: "Holds sensitive customer records. The one node every route in this mission is ultimately trying to reach.",
      ar: "تحتوي على سجلات العملاء الحساسة. النقطة التي يحاول كل مسار في هذه المهمة الوصول إليها في النهاية.",
    },
  },
  {
    id: "workstations",
    label: { en: "Employee Workstations", ar: "أجهزة الموظفين" },
    description: {
      en: "Everyday laptops and desktops used by staff. The other independent route in — usually via phishing.",
      ar: "أجهزة الكمبيوتر المحمولة والمكتبية اليومية التي يستخدمها الموظفون. المسار المستقل الآخر — عادةً عبر التصيد.",
    },
  },
  {
    id: "file_server",
    label: { en: "Shared File Server", ar: "خادم الملفات المشترك" },
    description: {
      en: "Stores internal documents. Not on the route to the database, but still worth protecting if you have the slot.",
      ar: "يخزّن المستندات الداخلية. ليس على مسار قاعدة البيانات، لكنه لا يزال يستحق الحماية إن توفرت الفتحة.",
    },
  },
  {
    id: "identity_server",
    label: { en: "Identity Server (AD / IAM)", ar: "خادم الهوية (AD / IAM)" },
    description: {
      en: "Manages logins and permissions across the company. Sits directly on the workstation route to the database.",
      ar: "يدير عمليات تسجيل الدخول والصلاحيات في الشركة. يقع مباشرة على مسار أجهزة الموظفين إلى قاعدة البيانات.",
    },
  },
  {
    id: "vpn_gateway",
    label: { en: "VPN Gateway", ar: "بوابة VPN" },
    description: {
      en: "Lets remote employees connect into the internal network from anywhere. A checkpoint on the remote-access route.",
      ar: "تتيح للموظفين عن بُعد الاتصال بالشبكة الداخلية من أي مكان. نقطة تفتيش على مسار الوصول عن بُعد.",
    },
  },
  {
    id: "remote_users",
    label: { en: "Remote Employees", ar: "الموظفون عن بُعد" },
    description: {
      en: "Staff working from home or on the road. Reachable from the internet the same as anyone — that part can't be blocked.",
      ar: "موظفون يعملون من المنزل أو أثناء التنقل. يمكن الوصول إليهم من الإنترنت مثل أي شخص — هذا الجزء لا يمكن حظره.",
    },
  },
  {
    id: "cloud_workload",
    label: { en: "Cloud Workload", ar: "حِمل العمل السحابي" },
    description: {
      en: "An application and database hosted in the cloud, writing back to the same customer database. The other route in.",
      ar: "تطبيق وقاعدة بيانات مستضافان في السحابة، يكتبان إلى نفس قاعدة بيانات العملاء. المسار الآخر إلى الداخل.",
    },
  },
];

export function getNode(id: NodeId): NetworkNode {
  const node = NETWORK_GUARDIAN_NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown Network Guardian node: ${id}`);
  return node;
}

// ---------------------------------------------------------------------------
// Control catalog (shared across missions; each mission offers a subset)
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
      en: "Inspects and filters HTTP traffic to the public web server, blocking common web exploits before they land.",
      ar: "يفحص ويُصفّي حركة HTTP إلى خادم الويب العام، ويحظر ثغرات الويب الشائعة قبل وقوعها.",
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
   * Omitted for the one edge (internet -> remote_users in Mission 3)
   * that represents an inherent exposure no placeable control removes
   * — an attacker can always reach a remote worker out on the open
   * internet the same way they can reach anyone else there. That edge
   * is always traversable, and the node it leads to is excluded from
   * the "clean defense" scoring bonus below since the player has no
   * way to prevent it being reachable.
   */
  blockedBy?: ControlId;
}

export interface MissionDefinition {
  id: MissionId;
  order: number;
  title: Bilingual;
  briefing: Bilingual;
  nodeIds: NodeId[];
  edges: MissionEdge[];
  availableControls: ControlId[];
  /**
   * Strictly fewer slots than availableControls.length. Every mission's
   * topology has exactly two independent routes from "internet" to the
   * crownJewel; the minimum to secure the database is always one
   * control per route, and the budget is set to just barely cover
   * that (plus a little slack in missions 2-3) — never enough to place
   * everything, so the player must actually reason about the graph.
   */
  controlBudget: number;
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
      en: "A red-team penetration test begins in ten minutes. Your public web server and employee workstations are both reachable from the open internet, and both lead to the customer database. You only have two control slots — not enough to place every option below. Study the network, then decide which two controls actually close both routes in.",
      ar: "يبدأ اختبار اختراق من فريق أحمر خلال عشر دقائق. خادم الويب العام وأجهزة الموظفين كلاهما متاح من الإنترنت المفتوح، وكلاهما يقود إلى قاعدة بيانات العملاء. لديك فتحتا ضوابط فقط — لا تكفيان لوضع كل الخيارات أدناه. ادرس الشبكة، ثم قرّر أي ضابطين يُغلقان المسارين فعليًا.",
    },
    nodeIds: ["internet", "web_server", "workstations", "database_server"],
    edges: [
      { id: "m1_internet_web", from: "internet", to: "web_server", blockedBy: "waf" },
      { id: "m1_internet_workstations", from: "internet", to: "workstations", blockedBy: "firewall" },
      { id: "m1_web_db", from: "web_server", to: "database_server", blockedBy: "dmz" },
      { id: "m1_workstations_db", from: "workstations", to: "database_server", blockedBy: "vlan_segmentation" },
    ],
    availableControls: ["firewall", "waf", "dmz", "vlan_segmentation"],
    controlBudget: 2,
    crownJewel: "database_server",
    hint1: {
      en: "This network has two separate ways in: through the public website, and through an employee's workstation. Each route needs its own control — one from each.",
      ar: "لهذه الشبكة طريقان منفصلان للدخول: عبر الموقع العام، وعبر جهاز أحد الموظفين. كل مسار يحتاج ضابطه الخاص — واحد من كل مسار.",
    },
    hint2: {
      en: "You only have two slots and there are two routes — so you cannot afford to place two controls on the same route. Placing a control at the very first hop of a route protects more than placing it right before the database.",
      ar: "لديك فتحتان فقط وهناك مساران — فلا يمكنك تحمّل وضع ضابطين على نفس المسار. وضع الضابط عند أول نقطة في المسار يحمي أكثر من وضعه مباشرة قبل قاعدة البيانات.",
    },
  },
  {
    id: "internal_segmentation",
    order: 2,
    title: { en: "Mission 2: Segment the Internal Network", ar: "المهمة 2: تقسيم الشبكة الداخلية" },
    briefing: {
      en: "The perimeter held, but the network behind it has two more independent routes to the same database: one through the web application tier, and one through employee workstations and the identity server that controls every login. A phishing email is about to land. You have three control slots for six available controls — trace both routes before you commit them.",
      ar: "صمد المحيط، لكن الشبكة خلفه فيها مساران مستقلان آخران إلى نفس قاعدة البيانات: أحدهما عبر طبقة تطبيق الويب، والآخر عبر أجهزة الموظفين وخادم الهوية الذي يتحكم بكل تسجيل دخول. رسالة تصيد على وشك الوصول. لديك ثلاث فتحات ضوابط من أصل ستة خيارات متاحة — تتبّع المسارين قبل أن تلتزم بها.",
    },
    nodeIds: ["internet", "web_server", "app_server", "database_server", "workstations", "file_server", "identity_server"],
    edges: [
      { id: "m2_internet_web", from: "internet", to: "web_server", blockedBy: "waf" },
      { id: "m2_internet_workstations", from: "internet", to: "workstations", blockedBy: "firewall" },
      { id: "m2_web_app", from: "web_server", to: "app_server", blockedBy: "dmz" },
      { id: "m2_app_db", from: "app_server", to: "database_server", blockedBy: "vlan_segmentation" },
      { id: "m2_workstations_file", from: "workstations", to: "file_server", blockedBy: "ids_ips" },
      { id: "m2_workstations_identity", from: "workstations", to: "identity_server", blockedBy: "mfa_identity" },
      { id: "m2_identity_db", from: "identity_server", to: "database_server", blockedBy: "ids_ips" },
    ],
    availableControls: ["firewall", "waf", "dmz", "vlan_segmentation", "ids_ips", "mfa_identity"],
    controlBudget: 3,
    crownJewel: "database_server",
    hint1: {
      en: "This network has two independent routes to the database: through the web application (web server → app server → database), and through employee workstations (workstations → identity server → database). Trace each one separately.",
      ar: "لهذه الشبكة مساران مستقلان إلى قاعدة البيانات: عبر تطبيق الويب (خادم الويب ← خادم التطبيقات ← قاعدة البيانات)، وعبر أجهزة الموظفين (الأجهزة ← خادم الهوية ← قاعدة البيانات). تتبّع كلًّا منهما على حدة.",
    },
    hint2: {
      en: "The shared file server is not on either route to the database — it's a real system worth protecting if you have a spare slot, but never spend your only coverage for a route on it.",
      ar: "خادم الملفات المشترك ليس على أي من المسارين إلى قاعدة البيانات — إنه نظام حقيقي يستحق الحماية إن توفرت فتحة إضافية، لكن لا تُنفق تغطيتك الوحيدة لأحد المسارين عليه أبدًا.",
    },
  },
  {
    id: "hybrid_cloud",
    order: 3,
    title: { en: "Mission 3: Hybrid Cloud & Remote Access", ar: "المهمة 3: السحابة الهجينة والوصول عن بُعد" },
    briefing: {
      en: "Half the company now works remotely, and a new customer-facing app runs entirely in the cloud, writing back to the same database. That gives the network two more independent routes in: the remote-access chain, and the cloud workload's own connection. You have three slots for five available controls. Neither route can borrow the other's protection.",
      ar: "نصف الشركة يعمل الآن عن بُعد، وتطبيق جديد يواجه العملاء يعمل بالكامل في السحابة، ويكتب إلى نفس قاعدة البيانات. هذا يمنح الشبكة مسارين مستقلين إضافيين للدخول: سلسلة الوصول عن بُعد، واتصال حِمل العمل السحابي الخاص به. لديك ثلاث فتحات من أصل خمسة خيارات متاحة. لا يمكن لأي مسار استعارة حماية الآخر.",
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
    controlBudget: 3,
    crownJewel: "database_server",
    hint1: {
      en: "Remote workers and the cloud workload are two separate routes into the database. Securing the VPN chain does nothing to protect the cloud connection, and vice versa.",
      ar: "الموظفون عن بُعد وحِمل العمل السحابي مساران منفصلان إلى قاعدة البيانات. تأمين سلسلة VPN لا يحمي الاتصال السحابي إطلاقًا، والعكس صحيح.",
    },
    hint2: {
      en: "The remote-access route has three points where a control could sit before the database. Blocking the earliest one — right where the remote worker's connection first arrives — protects the most.",
      ar: "لمسار الوصول عن بُعد ثلاث نقاط يمكن أن يقف فيها ضابط قبل قاعدة البيانات. حظر أقربها — عند وصول اتصال الموظف عن بُعد لأول مرة — يحمي أكثر ما يمكن.",
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

/**
 * Nodes that stay reachable from the internet even with every available
 * control for a mission placed at once (e.g. remote_users in Mission 3,
 * which has no blockedBy edge at all). These are excluded from the
 * "clean defense" scoring bonus and from the partial-credit denominator
 * below, since the player has no way to prevent them being reachable.
 */
function computeUnavoidableNodes(mission: MissionDefinition): Set<NodeId> {
  const maxDefense = simulateMissionAttack(mission, mission.availableControls);
  return new Set(maxDefense.compromisedNodes);
}

// ---------------------------------------------------------------------------
// Scoring — per mission, then aggregated across all three
// ---------------------------------------------------------------------------

export interface MissionSubmission {
  missionId: MissionId;
  placedControls: ControlId[];
  hintsUsed: number;
}

export type MissionOutcome = "secured" | "breached";

export interface MissionResult {
  missionId: MissionId;
  score: number;
  xp: number;
  simulation: AttackSimulationResult;
  outcome: MissionOutcome;
  passed: boolean;
}

const HINT_PENALTY = 10;

/**
 * Binary puzzle scoring: securing the crown jewel is what matters, and
 * a mission is only ever "passed" by doing so (score >= BADGE_PASS_SCORE
 * is only reachable when crownJewelProtected). Within a secured result,
 * the score (80-100) rewards a clean solve — no other node left
 * reachable either — over one that merely kept the database itself
 * safe while leaving other nodes exposed. Within an unsecured result,
 * the score (0-79) gives partial credit for how much of the rest of
 * the network stayed out of reach, so a near-miss still reads as
 * meaningfully better than doing nothing.
 */
export function computeMissionScore(submission: MissionSubmission): MissionResult {
  const mission = getMission(submission.missionId);
  const simulation = simulateMissionAttack(mission, submission.placedControls);
  const unavoidable = computeUnavoidableNodes(mission);
  const hintPenalty = submission.hintsUsed * HINT_PENALTY;

  let score: number;
  if (simulation.crownJewelProtected) {
    const penalizableCompromised = simulation.compromisedNodes.filter((id) => !unavoidable.has(id));
    score = Math.min(100, Math.max(80, 100 - penalizableCompromised.length * 10 - hintPenalty));
  } else {
    const protectableNodes = mission.nodeIds.filter((id) => id !== "internet" && !unavoidable.has(id));
    const protectedProtectable = simulation.protectedNodes.filter((id) => protectableNodes.includes(id));
    const fraction = protectableNodes.length > 0 ? protectedProtectable.length / protectableNodes.length : 0;
    score = Math.min(79, Math.max(0, Math.round(fraction * 40) - hintPenalty));
  }

  const xp = Math.round(score * 1.5);
  const outcome: MissionOutcome = simulation.crownJewelProtected ? "secured" : "breached";

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
  const outcome: MissionOutcome = missionResults.every((r) => r.outcome === "secured") ? "secured" : "breached";
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
  breached: { en: "Full breach", ar: "اختراق كامل" },
};

const MISSION_CONSEQUENCE_COPY: Record<MissionId, Record<MissionOutcome, Omit<NetworkConsequenceCopy, "outcomeLabel">>> = {
  basic_perimeter: {
    secured: {
      headline: { en: "The pentest found nothing.", ar: "لم يجد اختبار الاختراق شيئًا." },
      whatHappened: {
        en: "The red team tried both routes in — through the public website, and through an employee's workstation. Your two controls closed both, so neither route ever reached the database.",
        ar: "جرّب الفريق الأحمر كلا المسارين — عبر الموقع العام، وعبر جهاز أحد الموظفين. أغلق ضابطاك كليهما، فلم يصل أي مسار إلى قاعدة البيانات.",
      },
      whyItMattered: {
        en: "You didn't have enough slots to defend everything — only enough to make two good choices. Covering both routes into the database, instead of reinforcing just one, is what kept it safe. Where you placed each control mattered too: blocking a route at its very first hop protects the node there as well, not just the database further down — that's part of why a clean solve scores higher than one that merely kept the database safe.",
        ar: "لم يكن لديك فتحات كافية للدفاع عن كل شيء — فقط ما يكفي لاتخاذ قرارين جيدين. تغطية كلا المسارين إلى قاعدة البيانات، بدل تعزيز مسار واحد فقط، هي ما حافظ على أمانها. مكان وضع كل ضابط كان مهمًا أيضًا: حظر المسار عند أول نقطة فيه يحمي تلك النقطة أيضًا، لا قاعدة البيانات فقط في الأسفل — لهذا يحصل الحل النظيف على نتيجة أعلى من حل اكتفى بحماية قاعدة البيانات فقط.",
      },
      keyDecision: {
        en: "Two slots, two independent routes in: one control per route beats two controls stacked on the same route, every time.",
        ar: "فتحتان، ومساران مستقلان للدخول: ضابط واحد لكل مسار أفضل دائمًا من ضابطين على نفس المسار.",
      },
    },
    breached: {
      headline: { en: "Full breach. The database is gone.", ar: "اختراق كامل. قاعدة البيانات ضاعت." },
      whatHappened: {
        en: "At least one full route into the database was left completely uncovered. The red team found it, and once they were past that point, nothing else stood between them and the database.",
        ar: "بقي مسار كامل واحد على الأقل إلى قاعدة البيانات دون أي تغطية. وجده الفريق الأحمر، وبمجرد تجاوزه لم يقف شيء آخر بينهم وبين قاعدة البيانات.",
      },
      whyItMattered: {
        en: "A budget of two slots for two routes means each route needs exactly one control. Leaving a whole route unguarded — even while stacking both controls on the other — leaves the database exposed.",
        ar: "ميزانية فتحتين لمسارين تعني أن كل مسار يحتاج ضابطًا واحدًا بالضبط. ترك مسار كامل بلا حماية — حتى مع وضع كلا الضابطين على المسار الآخر — يترك قاعدة البيانات مكشوفة.",
      },
      keyDecision: {
        en: "Check both routes into the database before you commit your two slots: the public website's route, and the employee workstation's route.",
        ar: "افحص كلا المسارين إلى قاعدة البيانات قبل أن تلتزم بفتحتيك: مسار الموقع العام، ومسار جهاز الموظف.",
      },
    },
  },
  internal_segmentation: {
    secured: {
      headline: { en: "The phishing email landed — and went nowhere.", ar: "وصلت رسالة التصيد — ولم تذهب لأي مكان." },
      whatHappened: {
        en: "An employee clicked the link, exactly as planned — but every route from that click to the database was already closed. The web-tier route was covered, and so was the workstation-and-identity-server route.",
        ar: "ضغط أحد الموظفين على الرابط، تمامًا كما هو مخطط — لكن كل مسار من تلك الضغطة إلى قاعدة البيانات كان مغلقًا بالفعل. مسار طبقة الويب كان مُغطّى، وكذلك مسار الأجهزة وخادم الهوية.",
      },
      whyItMattered: {
        en: "This network has two independent routes to the database — through the web application, and through employee logins. Three slots was enough to cover both, with one to spare for extra depth.",
        ar: "لهذه الشبكة مساران مستقلان إلى قاعدة البيانات — عبر تطبيق الويب، وعبر تسجيلات دخول الموظفين. كانت الفتحات الثلاث كافية لتغطية كليهما، مع فتحة إضافية لعمق أكبر.",
      },
      keyDecision: {
        en: "Covering both routes into the database mattered more than exactly which control you used on each — several combinations work, as long as neither route is left open.",
        ar: "تغطية كلا المسارين إلى قاعدة البيانات كانت أهم من الضابط المحدد المستخدم على كل منهما — عدة تركيبات تنجح، طالما لم يُترك أي مسار مفتوحًا.",
      },
    },
    breached: {
      headline: { en: "A route to the database was left wide open.", ar: "بقي مسار إلى قاعدة البيانات مفتوحًا على مصراعيه." },
      whatHappened: {
        en: "One of the two routes into the database — either through the web application, or through the phished workstation and the identity server — was never covered. Nothing stopped the attacker once they were on it.",
        ar: "أحد المسارين إلى قاعدة البيانات — إما عبر تطبيق الويب، أو عبر الجهاز المصاب بالتصيد وخادم الهوية — لم يُغطَّ أبدًا. لم يوقف شيء المهاجم بمجرد دخوله فيه.",
      },
      whyItMattered: {
        en: "With three slots for two independent routes, spending all of them reinforcing one route while leaving the other completely open is the fastest way to lose the database.",
        ar: "بوجود ثلاث فتحات لمسارين مستقلين، إنفاقها جميعًا على تعزيز مسار واحد مع ترك الآخر مفتوحًا تمامًا هو أسرع طريقة لخسارة قاعدة البيانات.",
      },
      keyDecision: {
        en: "Trace both routes into the database before deciding where your slots go: the web-tier route, and the workstation-to-identity-server route.",
        ar: "تتبّع كلا المسارين إلى قاعدة البيانات قبل أن تقرر أين تضع فتحاتك: مسار طبقة الويب، ومسار الأجهزة إلى خادم الهوية.",
      },
    },
  },
  hybrid_cloud: {
    secured: {
      headline: { en: "No perimeter — and still no breach.", ar: "لا محيط — ومع ذلك لا اختراق." },
      whatHappened: {
        en: "Both routes stayed closed: the remote-access chain through the VPN, and the cloud workload's connection back to the database. Neither offered a way through.",
        ar: "بقي المساران مغلقين: سلسلة الوصول عن بُعد عبر VPN، واتصال حِمل العمل السحابي إلى قاعدة البيانات. لم يوفّر أي منهما طريقًا للعبور.",
      },
      whyItMattered: {
        en: "A hybrid network still has the same shape as any other in this arc: independent routes in that each need their own coverage. Remote access and cloud traffic don't get to share a control — each is its own route.",
        ar: "الشبكة الهجينة لا تزال بنفس شكل أي شبكة أخرى في هذه السلسلة: مسارات مستقلة للدخول يحتاج كل منها تغطيته الخاصة. لا يمكن للوصول عن بُعد وحركة السحابة مشاركة ضابط واحد — كل منهما مساره الخاص.",
      },
      keyDecision: {
        en: "Treating VPN access and cloud traffic as two separate routes — not one — is what closed the network completely.",
        ar: "التعامل مع الوصول عبر VPN وحركة السحابة كمسارين منفصلين — لا مسار واحد — هو ما أغلق الشبكة بالكامل.",
      },
    },
    breached: {
      headline: { en: "The database was reachable from outside the office entirely.", ar: "قاعدة البيانات كانت متاحة بالكامل من خارج المكتب." },
      whatHappened: {
        en: "One of the two routes — the remote-access chain, or the cloud workload's path back to the database — was left completely open. Whichever one it was, it led straight through to the database.",
        ar: "أحد المسارين — سلسلة الوصول عن بُعد، أو مسار حِمل العمل السحابي إلى قاعدة البيانات — بقي مفتوحًا تمامًا. أيًّا كان، قاد مباشرة إلى قاعدة البيانات.",
      },
      whyItMattered: {
        en: "Remote workers and cloud workloads look like separate problems, but they behave the same way here: each is an independent route to the database that needs its own dedicated control.",
        ar: "الموظفون عن بُعد والأحمال السحابية يبدوان مشكلتين منفصلتين، لكنهما يتصرفان بنفس الطريقة هنا: كل منهما مسار مستقل إلى قاعدة البيانات يحتاج ضابطه المخصص.",
      },
      keyDecision: {
        en: "Check the VPN chain and the cloud connection separately — securing one gives you no protection on the other.",
        ar: "افحص سلسلة VPN والاتصال السحابي بشكل منفصل — تأمين أحدهما لا يمنحك أي حماية على الآخر.",
      },
    },
  },
};

export function getNetworkConsequenceCopy(missionId: MissionId, result: MissionResult): NetworkConsequenceCopy {
  const copy = MISSION_CONSEQUENCE_COPY[missionId][result.outcome];
  return { outcomeLabel: OUTCOME_LABEL[result.outcome], ...copy };
}
