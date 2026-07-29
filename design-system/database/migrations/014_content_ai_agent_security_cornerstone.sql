-- =====================================================================
-- 014_content_ai_agent_security_cornerstone.sql
-- Cornerstone article #13: "AI Agent Security: Identity, Permissions,
-- Autonomy and the Governance Problem" -- seeded as status =
-- 'founder_review' (not 'draft'): this is queued for Dr. Abeer's
-- explicit review/approval, not an unreviewed first draft. The
-- 'founder_review' enum value was added in 012_content_engine_expansion.sql,
-- a prior, already-committed migration, so using it here does not hit
-- the "new enum value in same transaction" restriction documented in
-- that file.
--
-- reviewed_at / reviewed_by are left NULL: those columns record when a
-- platform admin (the founder) actually reviews the piece, and no
-- human has done that yet -- this migration only queues it for her.
--
-- RLS unaffected: articles_public_read only exposes status='published'
-- rows, so this article remains completely invisible to anon/authenticated
-- site visitors until a platform admin moves it to 'published' by hand.
--
-- Sourcing: every external claim below is grounded in a real, named,
-- currently-live source (NIST, NIST/NCCoE, CISA + Five Eyes partners,
-- OWASP GenAI Security Project, MITRE ATLAS, Cloud Security Alliance,
-- Microsoft Learn, Google Cloud, AWS Prescriptive Guidance, ENISA),
-- listed in article_sources below with real URLs. The "Level 0-4"
-- autonomy model and the GRCL/ GreenTrust framing are explicitly
-- labeled in-body as CyberAbeer's own educational/proprietary
-- constructs, not external standards. No statistics are invented; the
-- only figures used (e.g. CSA's 68%/73% survey figures) are attributed
-- to the survey that produced them, in-body, not stated as fact
-- without attribution.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Article
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'founder_review', 'Article', 'advanced',
  array['professionals','executives','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance'
  and not exists (
    select 1 from articles art2
    join article_translations t2 on t2.article_id = art2.id
    where t2.locale = 'en' and t2.slug = 'ai-agent-security-identity-permissions-governance'
  );

-- ---------------------------------------------------------------------
-- English translation
-- ---------------------------------------------------------------------
insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'AI Agent Security: Identity, Permissions, Autonomy and the Governance Problem',
  'ai-agent-security-identity-permissions-governance',
  'Traditional software executes instructions. Chatbots mostly respond. AI agents act, on real systems, under someone''s authority. That shift is a governance problem before it is a technical one.',
  $en13$
<p>Traditional software executes predefined instructions. A chatbot mostly responds: you ask, it answers, nothing changes in your systems as a result. An AI agent is different by design. It can observe a situation, decide on a course of action, call tools, access systems, modify records, communicate on your behalf, and trigger workflows, without a human approving each individual step. That single change turns a security question that used to be simple into one that is not.</p>

<p>The old question was: <em>is the AI model secure?</em> The question that actually matters once software can act is: <em>who or what is acting, under whose authority, with which permissions, on which systems, and who is accountable when it gets it wrong?</em> Every section below is really an attempt to answer some piece of that one question, for the people who have to answer for it: CISOs, CIOs, AI governance leads, IAM and GRC teams, risk managers, internal auditors, security architects, and the board.</p>

<h2>AI agent vs. chatbot: not a difference of degree</h2>
<p>It is tempting to treat an "agent" as just a more capable chatbot. The comparison below is why that framing under-states the risk. Several of the differences in the identity, permissions, and accountability rows are exactly the gap that NIST's AI Agent Standards Initiative, CISA's agentic AI guidance, and the OWASP Top 10 for Agentic Applications were each stood up in 2025-2026 to address.</p>

<table class="content-comparison-table">
  <thead>
    <tr><th>Dimension</th><th>Chatbot</th><th>AI agent</th></tr>
  </thead>
  <tbody>
    <tr><td>Purpose</td><td>Answer questions, generate content</td><td>Complete tasks by taking real actions</td></tr>
    <tr><td>Autonomy</td><td>None beyond the current reply</td><td>Can plan multi-step actions with limited or no per-step approval</td></tr>
    <tr><td>Tool use</td><td>Rare, narrowly scoped if present</td><td>Routine: calls APIs, runs code, queries databases</td></tr>
    <tr><td>System access</td><td>Read-mostly, sandboxed</td><td>Can read and write across production systems</td></tr>
    <tr><td>Memory / context</td><td>Single conversation, often stateless</td><td>Can persist context and state across sessions and tasks</td></tr>
    <tr><td>Ability to change state</td><td>Effectively none</td><td>Yes -- records, transactions, communications, workflows</td></tr>
    <tr><td>Identity requirements</td><td>Usually inherits the calling user's session</td><td>Needs its own distinguishable, auditable identity</td></tr>
    <tr><td>Permissions</td><td>Whatever the host application already has</td><td>Should be scoped independently, to the task, not inherited</td></tr>
    <tr><td>Human approval</td><td>Implicit in reading the reply</td><td>Must be deliberately designed in, or explicitly waived</td></tr>
    <tr><td>Security risk</td><td>Mostly output quality / hallucination</td><td>Real-world consequences: data loss, unauthorized transactions</td></tr>
    <tr><td>Accountability</td><td>Rests entirely with the human reading the output</td><td>Must be traceable to a named business and technical owner</td></tr>
  </tbody>
</table>

<h2>The core problem: from information tool to digital actor</h2>
<p>The shift that matters is from AI as an information tool to AI as a digital actor. An information tool tells you something and you decide what to do. A digital actor does something, and the decision about whether it should have been allowed to do that has to be made before the fact, in the design of its identity and permissions, not after the fact when someone reviews the log.</p>

<svg viewBox="0 0 300 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trust chain: user leads to AI agent, which requires identity, then permissions, then tools, APIs and data, which leads to a business action">
  <defs>
    <marker id="arrow-en1" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#3f4b57" />
    </marker>
  </defs>
  <g font-family="sans-serif" font-size="16" text-anchor="middle">
    <rect x="20" y="10" width="260" height="64" rx="10" fill="#eef0f2" stroke="#3f4b57" stroke-width="1.5" />
    <text x="150" y="48" fill="#1a2027" font-weight="600">USER</text>
    <line x1="150" y1="74" x2="150" y2="104" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en1)" />

    <rect x="20" y="104" width="260" height="64" rx="10" fill="#eaf2f3" stroke="#0f4c5c" stroke-width="1.5" />
    <text x="150" y="142" fill="#0a323c" font-weight="700">AI AGENT</text>
    <line x1="150" y1="168" x2="150" y2="198" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en1)" />

    <rect x="20" y="198" width="260" height="64" rx="10" fill="#eaf3fb" stroke="#2673c9" stroke-width="1.5" />
    <text x="150" y="236" fill="#1c5aa0" font-weight="600">IDENTITY</text>
    <line x1="150" y1="262" x2="150" y2="292" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en1)" />

    <rect x="20" y="292" width="260" height="64" rx="10" fill="#fff8e6" stroke="#d99a1b" stroke-width="1.5" />
    <text x="150" y="330" fill="#b17c0f" font-weight="600">PERMISSIONS</text>
    <line x1="150" y1="356" x2="150" y2="386" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en1)" />

    <rect x="20" y="386" width="260" height="64" rx="10" fill="#f7f8f9" stroke="#3f4b57" stroke-width="1.5" />
    <text x="150" y="416" fill="#1a2027" font-weight="600" font-size="14">TOOLS / APIs / DATA</text>
    <line x1="150" y1="450" x2="150" y2="480" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en1)" />

    <rect x="20" y="480" width="260" height="64" rx="10" fill="#0a323c" stroke="#0a323c" stroke-width="1.5" />
    <text x="150" y="518" fill="#ffffff" font-weight="700" font-size="14">BUSINESS ACTION</text>
  </g>
  <text x="150" y="600" text-anchor="middle" font-family="sans-serif" font-size="13" font-style="italic" fill="#3f4b57">Every step in this chain is a trust decision.</text>
</svg>

<h2>Agent identity: why "just use my login" fails</h2>
<p>An agent needs an identity distinguishable from the human who configured it. When an agent runs under a shared human credential or a generic service account, three things break at once: attribution (you cannot tell whether a human or the agent performed an action), auditability (logs show a login, not an intent), and revocation (disabling the agent means disabling the person, or vice versa). NIST's AI Agent Standards Initiative and the related NCCoE concept paper on software and AI agent identity frame this as treating each agent as its own non-human identity, with a defined owner, a documented credential type, a rotation schedule, and an authorized scope, applying existing patterns such as OAuth 2.0, OpenID Connect, and workload-identity standards like SPIFFE/SPIRE rather than inventing something new. Microsoft's Entra Agent ID and comparable platform features from other identity providers implement this same idea in production: agents get their own principal, not a borrowed one. This is not a claim that one specific protocol is mandatory everywhere; it is a claim that <em>some</em> distinct, governed identity is required, and that skipping it is what breaks attribution and least privilege downstream.</p>

<h2>Ownership and accountability</h2>
<p>An agent without a named owner is not ownerless, it is unaccountable, which is worse. Before an agent goes live, these questions should have specific, named answers, not "the AI team" as a catch-all:</p>

<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ownership map: AI agent at the center, connected to business owner, technical owner, risk owner, data owner, security approval, and executive accountability">
  <g font-family="sans-serif" font-size="14" text-anchor="middle">
    <circle cx="300" cy="300" r="72" fill="#0a323c" />
    <text x="300" y="296" fill="#ffffff" font-weight="700" font-size="15">AI</text>
    <text x="300" y="315" fill="#ffffff" font-weight="700" font-size="15">AGENT</text>

    <line x1="300" y1="228" x2="300" y2="110" stroke="#c2c9d1" stroke-width="2" />
    <rect x="200" y="60" width="200" height="56" rx="10" fill="#eaf2f3" stroke="#0f4c5c" />
    <text x="300" y="93" fill="#0a323c">Business Owner</text>

    <line x1="356" y1="248" x2="470" y2="170" stroke="#c2c9d1" stroke-width="2" />
    <rect x="410" y="130" width="200" height="56" rx="10" fill="#eaf2f3" stroke="#0f4c5c" />
    <text x="510" y="163" fill="#0a323c">Technical Owner</text>

    <line x1="372" y1="300" x2="480" y2="300" stroke="#c2c9d1" stroke-width="2" />
    <rect x="420" y="272" width="180" height="56" rx="10" fill="#fff8e6" stroke="#d99a1b" />
    <text x="510" y="305" fill="#b17c0f">Risk Owner</text>

    <line x1="356" y1="352" x2="470" y2="430" stroke="#c2c9d1" stroke-width="2" />
    <rect x="410" y="414" width="200" height="56" rx="10" fill="#eaf3fb" stroke="#2673c9" />
    <text x="510" y="447" fill="#1c5aa0">Data Owner</text>

    <line x1="300" y1="372" x2="300" y2="470" stroke="#c2c9d1" stroke-width="2" />
    <rect x="200" y="474" width="200" height="56" rx="10" fill="#fdecec" stroke="#d63c3c" />
    <text x="300" y="507" fill="#b32b2b">Security Approval</text>

    <line x1="244" y1="352" x2="130" y2="430" stroke="#c2c9d1" stroke-width="2" />
    <rect x="10" y="414" width="220" height="56" rx="10" fill="#f7f8f9" stroke="#3f4b57" />
    <text x="120" y="440" fill="#1a2027" font-size="13">Executive</text>
    <text x="120" y="458" fill="#1a2027" font-size="13">Accountability</text>
  </g>
</svg>

<p>Who owns the agent, who approved it, who owns the business process it touches, who owns the data it accesses, who owns the residual risk, who can suspend it on short notice, and who is accountable when it takes an inappropriate action -- these can be six different people, but every one of the six should be a name, not a department.</p>

<h2>Permissions: flexibility is not a reason for breadth</h2>
<p>"The agent needs broad access to be useful" is the single most common justification for over-provisioning, and it is the wrong conclusion from a true premise. AWS's own prescriptive guidance for agentic AI is blunt about the failure mode: teams reach for an existing broad IAM role "because it is only running automation," and that is exactly how intended boundaries get erased. The corrective pattern, consistent across AWS, Microsoft, and Google's public guidance, is task-scoped, time-limited, least-privilege access evaluated at runtime rather than a static role assumed once at deployment.</p>

<table class="content-decision-table">
  <thead>
    <tr><th>Permission dimension</th><th>Default position</th></tr>
  </thead>
  <tbody>
    <tr><td>Read vs. write</td><td>Grant read by default; write only where the task genuinely requires it</td></tr>
    <tr><td>Transaction authority</td><td>Cap at a defined threshold; anything above requires human sign-off</td></tr>
    <tr><td>Administrative privilege</td><td>Never by default; treat as an explicit, reviewed exception</td></tr>
    <tr><td>Delegation</td><td>Bounded in scope and duration; no open-ended re-delegation</td></tr>
    <tr><td>Duration</td><td>Time-limited, short-lived credentials over standing access</td></tr>
    <tr><td>Review cadence</td><td>Scheduled permission reviews, not "set once and forget"</td></tr>
    <tr><td>Privilege creep</td><td>Actively monitored; unused grants are revoked, not accumulated</td></tr>
    <tr><td>High-risk actions</td><td>Explicit human-in-the-loop checkpoint regardless of agent confidence</td></tr>
  </tbody>
</table>

<h2>Autonomy levels: a practical CyberAbeer model</h2>
<div class="content-callout">
  <p class="content-callout-title">This is a CyberAbeer educational classification, not an industry standard</p>
  <p>There is no single, universally adopted numeric autonomy scale for AI agents the way there is, for instance, SAE's levels for vehicle automation. The levels below are CyberAbeer's own practical framework for talking about autonomy and governance together. They are useful for structuring a conversation with the business; they are not a citation to an external standard.</p>
</div>

<table class="content-comparison-table">
  <thead>
    <tr><th>Level</th><th>Description</th><th>Governance expectation</th></tr>
  </thead>
  <tbody>
    <tr><td>Level 0</td><td>Recommendation only -- the agent suggests, a human decides and acts</td><td>Light-touch: monitor output quality</td></tr>
    <tr><td>Level 1</td><td>Action after human approval -- the agent prepares the action, a human authorizes it</td><td>Standard access review, clear approval log</td></tr>
    <tr><td>Level 2</td><td>Limited autonomous actions within a narrow, well-tested scope</td><td>Scoped permissions, active monitoring, periodic audit</td></tr>
    <tr><td>Level 3</td><td>Broad autonomous actions within a defined business scope</td><td>Formal risk sign-off, named owners, incident response plan</td></tr>
    <tr><td>Level 4</td><td>High-impact autonomous decisions or actions (financial, legal, safety-relevant)</td><td>Board/executive-level accountability, continuous review, kill-switch tested</td></tr>
  </tbody>
</table>

<p>The pattern to hold onto: governance requirements should scale with autonomy and impact together, not with autonomy alone. A Level 3 agent touching low-value internal data is a smaller governance problem than a Level 1 agent with standing access to payroll.</p>

<h2>Human approval: in the loop, on the loop, out of the loop</h2>
<p>Human-in-the-loop means a person approves before the action executes. Human-on-the-loop means a person can observe and intervene, but the agent proceeds by default. Human-out-of-the-loop means the agent acts with no real-time human checkpoint at all. Concrete example, same company, three tasks: an agent that summarizes supplier bids for a human buyer is low concern, it is not deciding anything. An agent that selects which supplier to recommend is a higher concern, its reasoning needs to be inspectable. An agent that signs a contract or initiates a payment is a very high concern, and belongs firmly in-the-loop regardless of how good its track record has been.</p>

<h2>Data access is a data-governance problem, not just an access-control one</h2>
<p>An agent's permissions should be a function of the classification of the data it touches, not the other way around. Public data, internal data, confidential data, highly sensitive data, customer data, employee data, credentials and secrets, source code, and financial records each carry different exposure if an agent mishandles them, and "the agent needs context to be useful" is not a reason to skip classification, it is the reason classification has to happen first. This is exactly the territory CyberAbeer's Data Guardian concept is built around: an agent should never receive a permission that outruns the sensitivity tier of the data behind it.</p>

<h2>Shadow AI and shadow agents</h2>
<p>Shadow AI is any AI use that exists outside approved governance: a personal AI account used for work, a department-built automation nobody registered, an unapproved browser extension with broad page access, an integration a developer wired up over a weekend. A shadow <em>agent</em> is the sharper version of the same problem, because it can act, not just generate text. Cloud Security Alliance research on this found that 73% of organizations surveyed expect AI agents to become vital within a year, while 68% could not clearly distinguish AI agent activity from human activity in their own systems -- which means most organizations cannot govern what they cannot first see. Discovery and inventory (which agents exist, who owns them, what they can access) has to come before any permission or autonomy conversation, because you cannot apply least privilege to something you do not know is running.</p>

<h2>Agent-to-agent risk</h2>
<p>As multi-agent systems become more common, a new question appears: if Agent A authorizes Agent B, and Agent B invokes Agent C, who owns the final action? This is not a hypothetical for the distant future so much as an architecture pattern already showing up in production multi-agent deployments, and it is exactly why delegation needs to be bounded rather than open-ended: each hop in a delegation chain should carry a shrinking, not identical, scope of authority, and the full chain should be reconstructable after the fact. Left unbounded, authority can propagate further than any single person intended, and unintended privilege inheritance becomes very hard to audit. This is a real, near-term governance question, not a dramatic one -- the fix is architectural discipline in how delegation is scoped, not alarm.</p>

<h2>Tool and API risk surface</h2>
<p>Most of the practical risk in an agent deployment lives in what the agent is allowed to invoke, not in the model itself. MITRE ATLAS, the AI-focused counterpart to the ATT&amp;CK framework, increasingly documents attack paths at exactly this orchestration and execution layer: not the model, but the identities and services adjacent to it that let an agent reach secrets, data, and actions.</p>

<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent risk surface: AI agent at the center surrounded by email, documents, ERP, CRM, cloud APIs, code repositories, databases, payments, and ticketing and security tools">
  <g font-family="sans-serif" font-size="13" text-anchor="middle">
    <circle cx="320" cy="320" r="66" fill="#0a323c" />
    <text x="320" y="316" fill="#ffffff" font-weight="700" font-size="14">AI</text>
    <text x="320" y="334" fill="#ffffff" font-weight="700" font-size="14">AGENT</text>

    <g stroke="#f3c8c8" stroke-width="2">
      <line x1="320" y1="254" x2="320" y2="70" />
      <line x1="374" y1="286" x2="560" y2="140" />
      <line x1="386" y1="320" x2="600" y2="320" />
      <line x1="374" y1="354" x2="560" y2="500" />
      <line x1="320" y1="386" x2="320" y2="570" />
      <line x1="266" y1="354" x2="80" y2="500" />
      <line x1="254" y1="320" x2="40" y2="320" />
      <line x1="266" y1="286" x2="80" y2="140" />
    </g>

    <rect x="240" y="30" width="160" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="320" y="59" fill="#b32b2b">Email</text>

    <rect x="480" y="106" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="565" y="135" fill="#b32b2b">Cloud APIs</text>

    <rect x="520" y="296" width="150" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="595" y="325" fill="#b32b2b" font-size="12">Databases</text>

    <rect x="480" y="476" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="565" y="505" fill="#b32b2b">Payments</text>

    <rect x="240" y="546" width="160" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="320" y="575" fill="#b32b2b" font-size="12">Ticketing / Security</text>

    <rect x="0" y="476" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="85" y="505" fill="#b32b2b">ERP</text>

    <rect x="-10" y="296" width="150" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" fill-opacity="1" transform="translate(10,0)" />
    <text x="65" y="325" fill="#b32b2b">CRM</text>

    <rect x="0" y="106" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="85" y="135" fill="#b32b2b" font-size="12">Code Repos</text>
  </g>
</svg>

<h2>Logging and non-repudiation</h2>
<p>After any agent action, an organization should be able to reconstruct, without guessing: which agent acted, under which identity, what instruction triggered it, which tools it invoked, which data it touched, what decision it reached, what actually changed, whether a human was involved, and whether the action can be attributed with confidence. If any one of those cannot be answered from logs alone, the logging design has a gap, independently of whether anything went wrong yet.</p>

<h2>The AI agent lifecycle</h2>
<p>Governance cannot stop at deployment. An agent that was safe to approve six months ago may not be safe today, because the data it touches, the tools it calls, or the business process around it has changed.</p>

<svg viewBox="0 0 300 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent lifecycle: register, assess, approve, deploy, monitor, review, suspend or revoke, retire">
  <defs>
    <marker id="arrow-en2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#3f4b57" />
    </marker>
  </defs>
  <g font-family="sans-serif" font-size="15" text-anchor="middle" font-weight="600">
    <rect x="20" y="10" width="260" height="60" rx="10" fill="#eaf2f3" stroke="#0f4c5c" /><text x="150" y="46" fill="#0a323c">REGISTER</text>
    <line x1="150" y1="70" x2="150" y2="98" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="98" width="260" height="60" rx="10" fill="#eaf3fb" stroke="#2673c9" /><text x="150" y="134" fill="#1c5aa0">ASSESS</text>
    <line x1="150" y1="158" x2="150" y2="186" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="186" width="260" height="60" rx="10" fill="#eafaf1" stroke="#1f9d55" /><text x="150" y="222" fill="#17803f">APPROVE</text>
    <line x1="150" y1="246" x2="150" y2="274" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="274" width="260" height="60" rx="10" fill="#0a323c" /><text x="150" y="310" fill="#ffffff">DEPLOY</text>
    <line x1="150" y1="334" x2="150" y2="362" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="362" width="260" height="60" rx="10" fill="#fff8e6" stroke="#d99a1b" /><text x="150" y="398" fill="#b17c0f">MONITOR</text>
    <line x1="150" y1="422" x2="150" y2="450" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="450" width="260" height="60" rx="10" fill="#eaf3fb" stroke="#2673c9" /><text x="150" y="486" fill="#1c5aa0">REVIEW</text>
    <line x1="150" y1="510" x2="150" y2="538" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="538" width="260" height="60" rx="10" fill="#fdecec" stroke="#d63c3c" /><text x="150" y="568" fill="#b32b2b" font-size="13">SUSPEND / REVOKE</text>
    <line x1="150" y1="598" x2="150" y2="626" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-en2)" />

    <rect x="20" y="626" width="260" height="60" rx="10" fill="#f7f8f9" stroke="#3f4b57" /><text x="150" y="662" fill="#1a2027">RETIRE</text>
  </g>
</svg>

<h2>Risk scenario: the procurement agent</h2>
<p>Consider a fictional mid-size company's Procurement Agent. It reads incoming vendor proposals, accesses the ERP system, drafts purchase orders, and has standing authority to submit transactions. It runs under a shared service account. It has no named business owner. It has no human-approval threshold for transaction value.</p>
<p><strong>What is wrong with this design?</strong> Walk it against the model above: identity is shared, not distinct, so attribution fails. Ownership is absent, so nobody is accountable if it drafts a bad order. Privilege is broad by default rather than task-scoped. Autonomy sits at Level 3 (broad autonomous action) with no Level-3-appropriate controls attached. Financial authority is unlimited in practice. Logging may show that a transaction happened, but not whether a human was ever meant to be involved. Human approval is entirely absent above whatever threshold should exist. Every one of these is fixable without removing the agent's usefulness -- which is the point: the fix is governance design, not rejection of the agent.</p>

<h2>Decision scenario: you are the AI governance officer</h2>
<div class="content-callout">
  <p class="content-callout-title">You are the AI Governance Officer</p>
  <p>An AI agent needs: ERP read/write, email access, supplier database access, purchase approval authority up to $50,000, and external communication ability. The business says: "We need full autonomy to make the system useful." Before reading further, decide: which permissions should remain, which require human approval, which should be prohibited outright, who should own the agent, and what must be logged.</p>
</div>
<p>A defensible governance decision looks something like this: ERP read stays with the agent; ERP write is scoped to draft-only, with submission requiring human approval above a low threshold. Email access is granted for drafting and internal notification, not for unsupervised external commitments. Supplier database read is fine; write access is restricted. The $50,000 approval authority is rejected outright at agent level -- that is a Level 4, board-relevant decision, not something delegated to an autonomous system by default; a much lower, reviewed threshold is set instead, with anything above it routed to a named human approver. External communication is limited to pre-approved templates, not open-ended messaging. The agent gets a named business owner, a named technical owner, and full action-level logging from day one. None of this rejects the "we need it to be useful" business need; it answers it with conditions instead of a blank check. This is exactly the kind of decision CyberAbeer's forthcoming <strong>Agent Zero&trade;</strong> simulation is designed to let you practice hands-on, coming soon to CyberAbeer Labs.</p>

<div class="content-callout">
  <p class="content-callout-title">Dr. Abeer's view</p>
  <p>Consistent with the layered thinking behind her own GRCL framework, Dr. Abeer Alshammari's position is that AI agent governance cannot be treated as a standalone discipline bolted onto an AI project. It is identity governance, data governance, risk governance, and security governance operating on the same object at the same time, with human accountability as the constant that ties all four together. Separate any one of those four from the others -- govern identity but not data classification, or permissions but not logging -- and the gap between them is exactly where an incident starts.</p>
</div>

<h2>Where this connects to GRCL</h2>
<p>An AI-agent project can be evaluated through the same three lenses GRCL applies to any governance decision: regulatory criticality, risk level, and business value. A high-value agent should not be automatically rejected because it introduces risk -- that would leave all the value on the table for no governance benefit. The point of running an agent through this lens is to determine what controls are necessary, what conditions apply, what approval level is required, and whether real-time human oversight is needed, not to produce a simple approve/reject verdict. The detailed mechanics of how GRCL scores a given project are Dr. Abeer's own doctoral work and are not reproduced here; what matters for this article is the principle: risk is a reason to add the right controls, not a reason to say no by default.</p>

<div class="content-callout">
  <p class="content-callout-title">Assess your AI agent governance readiness</p>
  <p>If you are not sure whether your organization could answer the ownership, permission, and logging questions in this article for every agent you already have running, that is exactly what the <a href="/en/free-tools/ai-governance-quick-check">GreenTrust Free Assessment</a> is built to surface, in about fifteen minutes, at no cost.</p>
</div>

<h2>Frequently asked questions</h2>

<h3>What is an AI agent?</h3>
<p>Software that can observe context, decide on an action, and carry it out, typically by calling tools or APIs, with limited or no per-step human approval -- as opposed to software that only executes a fixed sequence of instructions.</p>

<h3>Is an AI agent the same as a chatbot?</h3>
<p>No. A chatbot responds; it does not typically change anything in your systems. An agent can read and write across real systems and take actions with consequences, which is why it needs its own identity, permissions, and oversight model.</p>

<h3>Does an AI agent need its own identity?</h3>
<p>Generally, yes. Sharing a human's credentials or a generic service account with an agent breaks attribution, auditability, and clean revocation. NIST's AI Agent Standards Initiative and Microsoft's Entra Agent ID both treat agents as their own class of non-human identity for exactly this reason.</p>

<h3>What is a non-human identity?</h3>
<p>An identity issued to a piece of software (a service, workload, or agent) rather than to a person, so that its actions can be authenticated, scoped, and audited independently of any human's own login.</p>

<h3>What permissions should an AI agent have?</h3>
<p>The minimum needed for its specific task, granted for a limited time, reviewed on a schedule, and capped well below administrative or unlimited-transaction authority unless a specific, reviewed exception says otherwise.</p>

<h3>Who is responsible for an AI agent?</h3>
<p>A named business owner, a named technical owner, and a defined risk owner, at minimum -- not "the AI team" as a collective, undefined answer.</p>

<h3>What is Shadow AI?</h3>
<p>Any AI use, including agents, operating outside an organization's approved governance process: unregistered tools, personal accounts used for work, or department-built automations nobody centrally reviewed or inventoried.</p>

<h3>Should AI agents have access to confidential data?</h3>
<p>Only when the sensitivity tier of that data has been classified and the agent's permission has been deliberately scoped to match it -- access should follow classification, not the other way around.</p>

<h3>How should AI agents be audited?</h3>
<p>Through logs detailed enough to reconstruct which agent acted, under which identity, on what instruction, using which tools and data, what changed, and whether a human was involved -- reconstructable after the fact, not just monitored in the moment.</p>
$en13$,
  'AI Agent Security: Identity & Governance | CyberAbeer',
  'AI agents act, not just respond. Learn why agent identity, permissions, autonomy levels, and lifecycle governance are the security problem every enterprise now faces.',
  16
from articles art join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance'
  and not exists (
    select 1 from article_translations t
    where t.article_id = art.id and t.locale = 'en'
      and t.slug = 'ai-agent-security-identity-permissions-governance'
  )
  and not exists (
    select 1 from article_translations t3
    where t3.article_id = art.id and t3.locale = 'en'
  );

-- ---------------------------------------------------------------------
-- Arabic translation
-- ---------------------------------------------------------------------
insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'أمن وكلاء الذكاء الاصطناعي: الهوية والصلاحيات والاستقلالية وتحديات الحوكمة',
  'أمن-وكلاء-الذكاء-الاصطناعي-الهوية-والصلاحيات-والحوكمة',
  'البرمجيات التقليدية تنفّذ تعليمات محددة مسبقاً. روبوتات المحادثة تستجيب غالباً. أما وكلاء الذكاء الاصطناعي فيتصرفون فعلياً، على أنظمة حقيقية، بصلاحية من جهة ما. هذا التحول مشكلة حوكمة قبل أن يكون مشكلة تقنية.',
  $ar13$
<p>البرمجيات التقليدية تنفّذ تعليمات محددة سلفاً. أما روبوت المحادثة فيستجيب في الغالب: تسأل، فيجيب، دون أن يتغير شيء في أنظمتك نتيجة لذلك. وكيل الذكاء الاصطناعي مختلف من حيث التصميم؛ فهو قادر على ملاحظة موقف ما، واتخاذ قرار بشأن مسار عمل، واستدعاء أدوات، والوصول إلى أنظمة، وتعديل سجلات، والتواصل نيابة عنك، وتفعيل مهام عمل تلقائية، دون أن يوافق إنسان على كل خطوة على حدة. هذا التغيير وحده يحوّل سؤالاً أمنياً كان بسيطاً إلى سؤال لم يعد كذلك.</p>

<p>السؤال القديم كان: <em>هل نموذج الذكاء الاصطناعي آمن؟</em> أما السؤال الذي يهم فعلاً بعد أن أصبحت البرمجيات قادرة على التصرف فهو: <em>من أو ما الذي يتصرف، وبأي صلاحية، وبأي أذونات، وعلى أي أنظمة، ومن المسؤول عندما يخطئ؟</em> كل قسم أدناه هو في جوهره محاولة للإجابة عن جزء من هذا السؤال الواحد، لصالح من يتحملون مسؤولية الإجابة عنه: رؤساء أمن المعلومات، ورؤساء تقنية المعلومات، وقادة حوكمة الذكاء الاصطناعي، وفرق إدارة الهوية والوصول، وفرق الحوكمة والمخاطر والامتثال، ومدراء المخاطر، والمدققون الداخليون، ومهندسو الأمن، وأعضاء مجلس الإدارة.</p>

<h2>وكيل الذكاء الاصطناعي مقابل روبوت المحادثة: ليس فرقاً في الدرجة</h2>
<p>من المغري التعامل مع "الوكيل" على أنه مجرد روبوت محادثة أكثر قدرة. الجدول أدناه يوضح لماذا يقلل هذا التوصيف من حجم المخاطرة. عدة فروقات في صفوف الهوية والصلاحيات والمساءلة هي بالضبط الفجوة التي أُنشئت من أجلها مبادرة NIST لمعايير وكلاء الذكاء الاصطناعي، وإرشادات CISA لوكلاء الذكاء الاصطناعي، وقائمة OWASP لأعلى عشرة مخاطر للتطبيقات الوكيلية خلال 2025-2026.</p>

<table class="content-comparison-table">
  <thead>
    <tr><th>البُعد</th><th>روبوت المحادثة</th><th>وكيل الذكاء الاصطناعي</th></tr>
  </thead>
  <tbody>
    <tr><td>الغرض</td><td>الإجابة عن الأسئلة وتوليد المحتوى</td><td>إنجاز مهام عبر اتخاذ إجراءات فعلية</td></tr>
    <tr><td>الاستقلالية</td><td>لا استقلالية تتجاوز الرد الحالي</td><td>يمكنه التخطيط لإجراءات متعددة الخطوات بموافقة محدودة أو معدومة لكل خطوة</td></tr>
    <tr><td>استخدام الأدوات</td><td>نادر ومحدود النطاق إن وُجد</td><td>روتيني: يستدعي واجهات برمجية، وينفذ أكواداً، ويستعلم قواعد بيانات</td></tr>
    <tr><td>الوصول للأنظمة</td><td>قراءة غالباً، ضمن بيئة معزولة</td><td>قراءة وكتابة عبر أنظمة الإنتاج</td></tr>
    <tr><td>الذاكرة والسياق</td><td>محادثة واحدة، غالباً بلا حالة محفوظة</td><td>يمكنه الاحتفاظ بالسياق والحالة عبر الجلسات والمهام</td></tr>
    <tr><td>القدرة على تغيير الحالة</td><td>شبه معدومة</td><td>نعم — سجلات ومعاملات واتصالات ومهام عمل</td></tr>
    <tr><td>متطلبات الهوية</td><td>غالباً يرث جلسة المستخدم المستدعي</td><td>يحتاج هوية مستقلة وقابلة للتمييز والتدقيق</td></tr>
    <tr><td>الصلاحيات</td><td>أياً كانت صلاحيات التطبيق المضيف</td><td>ينبغي تحديدها بشكل مستقل حسب المهمة، لا موروثة</td></tr>
    <tr><td>الموافقة البشرية</td><td>ضمنية عند قراءة الرد</td><td>يجب تصميمها عمداً، أو التنازل عنها صراحة</td></tr>
    <tr><td>المخاطرة الأمنية</td><td>غالباً جودة المخرجات أو الهلوسة</td><td>عواقب واقعية: فقدان بيانات، معاملات غير مصرح بها</td></tr>
    <tr><td>المساءلة</td><td>تقع كلياً على الإنسان الذي يقرأ المخرج</td><td>يجب أن تكون قابلة للتتبع إلى مالك أعمال ومالك تقني محددين</td></tr>
  </tbody>
</table>

<h2>المشكلة الجوهرية: من أداة معلوماتية إلى فاعل رقمي</h2>
<p>التحول المهم هنا هو الانتقال من الذكاء الاصطناعي كأداة معلوماتية إلى الذكاء الاصطناعي كفاعل رقمي. الأداة المعلوماتية تخبرك بشيء وأنت تقرر ما تفعله. أما الفاعل الرقمي فيقوم بفعل ما، والقرار بشأن ما إذا كان ينبغي السماح له بذلك يجب أن يُتخذ قبل وقوع الفعل، في تصميم هويته وصلاحياته، لا بعد وقوعه حين يراجع أحدهم السجل.</p>

<svg viewBox="0 0 300 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="سلسلة الثقة: المستخدم يؤدي إلى وكيل الذكاء الاصطناعي، الذي يحتاج هوية، ثم صلاحيات، ثم أدوات وواجهات برمجية وبيانات، ثم إجراء عمل">
  <defs>
    <marker id="arrow-ar1" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#3f4b57" />
    </marker>
  </defs>
  <g font-family="sans-serif" font-size="16" text-anchor="middle">
    <rect x="20" y="10" width="260" height="64" rx="10" fill="#eef0f2" stroke="#3f4b57" stroke-width="1.5" />
    <text x="150" y="48" fill="#1a2027" font-weight="600">المستخدم</text>
    <line x1="150" y1="74" x2="150" y2="104" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar1)" />

    <rect x="20" y="104" width="260" height="64" rx="10" fill="#eaf2f3" stroke="#0f4c5c" stroke-width="1.5" />
    <text x="150" y="142" fill="#0a323c" font-weight="700">وكيل الذكاء الاصطناعي</text>
    <line x1="150" y1="168" x2="150" y2="198" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar1)" />

    <rect x="20" y="198" width="260" height="64" rx="10" fill="#eaf3fb" stroke="#2673c9" stroke-width="1.5" />
    <text x="150" y="236" fill="#1c5aa0" font-weight="600">الهوية</text>
    <line x1="150" y1="262" x2="150" y2="292" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar1)" />

    <rect x="20" y="292" width="260" height="64" rx="10" fill="#fff8e6" stroke="#d99a1b" stroke-width="1.5" />
    <text x="150" y="330" fill="#b17c0f" font-weight="600">الصلاحيات</text>
    <line x1="150" y1="356" x2="150" y2="386" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar1)" />

    <rect x="20" y="386" width="260" height="64" rx="10" fill="#f7f8f9" stroke="#3f4b57" stroke-width="1.5" />
    <text x="150" y="416" fill="#1a2027" font-weight="600" font-size="14">الأدوات / الواجهات / البيانات</text>
    <line x1="150" y1="450" x2="150" y2="480" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar1)" />

    <rect x="20" y="480" width="260" height="64" rx="10" fill="#0a323c" stroke="#0a323c" stroke-width="1.5" />
    <text x="150" y="518" fill="#ffffff" font-weight="700" font-size="14">إجراء العمل</text>
  </g>
  <text x="150" y="600" text-anchor="middle" font-family="sans-serif" font-size="13" font-style="italic" fill="#3f4b57">كل خطوة في هذه السلسلة قرار ثقة.</text>
</svg>

<h2>هوية الوكيل: لماذا يفشل "استخدم بياناتي فقط"</h2>
<p>يحتاج الوكيل إلى هوية قابلة للتمييز عن الإنسان الذي أعدّه. حين يعمل الوكيل تحت بيانات اعتماد بشرية مشتركة أو حساب خدمة عام، تنكسر ثلاثة أمور دفعة واحدة: الإسناد (لا يمكنك معرفة ما إذا كان إنسان أم الوكيل من نفّذ الإجراء)، وقابلية التدقيق (تُظهر السجلات تسجيل دخول، لا نية محددة)، والإلغاء (تعطيل الوكيل يعني تعطيل الشخص، أو العكس). تتعامل مبادرة NIST لمعايير وكلاء الذكاء الاصطناعي وورقة NCCoE المتعلقة بهوية وكلاء البرمجيات والذكاء الاصطناعي مع كل وكيل كهوية غير بشرية مستقلة، لها مالك محدد، ونوع اعتماد موثّق، وجدول تدوير، ونطاق صلاحية مصرّح به، مطبقةً أنماطاً قائمة مثل OAuth 2.0 وOpenID Connect ومعايير هوية أحمال العمل مثل SPIFFE/SPIRE بدلاً من ابتكار شيء جديد. وتطبق ميزة Entra Agent ID من مايكروسوفت، وميزات مماثلة من مزوّدي هوية آخرين، الفكرة نفسها في بيئات الإنتاج: يحصل الوكيل على هويته الخاصة، لا هوية مستعارة. هذا ليس ادعاءً بأن بروتوكولاً تقنياً واحداً بعينه إلزامي في كل مكان؛ بل ادعاء بأن هوية مستقلة ومحوكمة <em>ما</em> مطلوبة، وأن تجاوزها هو ما يكسر الإسناد ومبدأ أقل الصلاحيات لاحقاً.</p>

<h2>الملكية والمساءلة</h2>
<p>الوكيل بلا مالك محدد ليس بلا مالك فحسب، بل بلا مساءلة، وهذا أسوأ. قبل تشغيل أي وكيل، ينبغي أن تكون لهذه الأسئلة إجابات محددة بالاسم، لا "فريق الذكاء الاصطناعي" كإجابة عامة:</p>

<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="خريطة الملكية: وكيل الذكاء الاصطناعي في المركز، متصل بمالك الأعمال، والمالك التقني، ومالك المخاطر، ومالك البيانات، والموافقة الأمنية، والمساءلة التنفيذية">
  <g font-family="sans-serif" font-size="13" text-anchor="middle">
    <circle cx="300" cy="300" r="72" fill="#0a323c" />
    <text x="300" y="296" fill="#ffffff" font-weight="700" font-size="14">وكيل</text>
    <text x="300" y="315" fill="#ffffff" font-weight="700" font-size="14">الذكاء الاصطناعي</text>

    <line x1="300" y1="228" x2="300" y2="110" stroke="#c2c9d1" stroke-width="2" />
    <rect x="190" y="60" width="220" height="56" rx="10" fill="#eaf2f3" stroke="#0f4c5c" />
    <text x="300" y="93" fill="#0a323c">مالك الأعمال</text>

    <line x1="356" y1="248" x2="470" y2="170" stroke="#c2c9d1" stroke-width="2" />
    <rect x="400" y="130" width="220" height="56" rx="10" fill="#eaf2f3" stroke="#0f4c5c" />
    <text x="510" y="163" fill="#0a323c">المالك التقني</text>

    <line x1="372" y1="300" x2="480" y2="300" stroke="#c2c9d1" stroke-width="2" />
    <rect x="410" y="272" width="200" height="56" rx="10" fill="#fff8e6" stroke="#d99a1b" />
    <text x="510" y="305" fill="#b17c0f">مالك المخاطر</text>

    <line x1="356" y1="352" x2="470" y2="430" stroke="#c2c9d1" stroke-width="2" />
    <rect x="400" y="414" width="220" height="56" rx="10" fill="#eaf3fb" stroke="#2673c9" />
    <text x="510" y="447" fill="#1c5aa0">مالك البيانات</text>

    <line x1="300" y1="372" x2="300" y2="470" stroke="#c2c9d1" stroke-width="2" />
    <rect x="190" y="474" width="220" height="56" rx="10" fill="#fdecec" stroke="#d63c3c" />
    <text x="300" y="507" fill="#b32b2b">الموافقة الأمنية</text>

    <line x1="244" y1="352" x2="130" y2="430" stroke="#c2c9d1" stroke-width="2" />
    <rect x="0" y="414" width="230" height="56" rx="10" fill="#f7f8f9" stroke="#3f4b57" />
    <text x="115" y="440" fill="#1a2027" font-size="12">المساءلة</text>
    <text x="115" y="458" fill="#1a2027" font-size="12">التنفيذية</text>
  </g>
</svg>

<p>من يملك الوكيل، ومن وافق عليه، ومن يملك عملية الأعمال التي يمسّها، ومن يملك البيانات التي يصل إليها، ومن يملك المخاطرة المتبقية، ومن يستطيع إيقافه خلال مهلة قصيرة، ومن المسؤول عندما يتخذ إجراءً غير ملائم — قد تكون هذه ستة أشخاص مختلفين، لكن كل واحد من الستة ينبغي أن يكون اسماً محدداً، لا إدارة عامة.</p>

<h2>الصلاحيات: المرونة ليست سبباً للتوسّع</h2>
<p>"يحتاج الوكيل صلاحيات واسعة ليكون مفيداً" هو أكثر تبرير شائع للتوسع المفرط في الصلاحيات، وهو استنتاج خاطئ من مقدمة صحيحة. إرشادات AWS التوجيهية الخاصة بالذكاء الاصطناعي الوكيلي صريحة بشأن نمط الفشل: تلجأ الفرق إلى دور IAM واسع موجود مسبقاً "لأنه مجرد أتمتة"، وهذه بالضبط الطريقة التي تُمحى بها الحدود المقصودة. النمط التصحيحي، المتسق عبر إرشادات AWS ومايكروسوفت وجوجل العامة، هو صلاحيات محددة النطاق حسب المهمة، ومحدودة زمنياً، وبأقل الامتيازات، تُقيَّم وقت التنفيذ لا بافتراض دور ثابت عند النشر.</p>

<table class="content-decision-table">
  <thead>
    <tr><th>بُعد الصلاحية</th><th>الموقف الافتراضي</th></tr>
  </thead>
  <tbody>
    <tr><td>القراءة مقابل الكتابة</td><td>امنح القراءة افتراضياً؛ والكتابة فقط حين تتطلبها المهمة فعلياً</td></tr>
    <tr><td>صلاحية المعاملات</td><td>حدّها بسقف معيّن؛ وأي مبلغ أعلى يتطلب موافقة بشرية</td></tr>
    <tr><td>الامتياز الإداري</td><td>لا يُمنح افتراضياً أبداً؛ يُعامل كاستثناء صريح ومُراجَع</td></tr>
    <tr><td>التفويض</td><td>محدود النطاق والمدة؛ بلا إعادة تفويض مفتوحة</td></tr>
    <tr><td>المدة</td><td>بيانات اعتماد قصيرة الأجل ومحدودة زمنياً بدل الوصول الدائم</td></tr>
    <tr><td>وتيرة المراجعة</td><td>مراجعات صلاحيات مجدولة، لا "اضبطها مرة وانسها"</td></tr>
    <tr><td>تضخم الصلاحيات</td><td>يُراقَب فعلياً؛ تُلغى الصلاحيات غير المستخدمة بدل تراكمها</td></tr>
    <tr><td>الإجراءات عالية المخاطر</td><td>نقطة موافقة بشرية صريحة بغض النظر عن ثقة الوكيل</td></tr>
  </tbody>
</table>

<h2>مستويات الاستقلالية: نموذج عملي من CyberAbeer</h2>
<div class="content-callout">
  <p class="content-callout-title">هذا تصنيف تعليمي من CyberAbeer، وليس معياراً صناعياً</p>
  <p>لا يوجد مقياس رقمي واحد ومعتمد عالمياً لاستقلالية وكلاء الذكاء الاصطناعي، بالطريقة التي توجد بها مثلاً مستويات جمعية SAE لأتمتة المركبات. المستويات أدناه هي إطار CyberAbeer العملي الخاص للحديث عن الاستقلالية والحوكمة معاً. إنها مفيدة لتنظيم حوار مع جهة الأعمال؛ وليست استشهاداً بمعيار خارجي.</p>
</div>

<table class="content-comparison-table">
  <thead>
    <tr><th>المستوى</th><th>الوصف</th><th>توقّع الحوكمة</th></tr>
  </thead>
  <tbody>
    <tr><td>المستوى 0</td><td>توصية فقط — يقترح الوكيل، ويقرر الإنسان وينفّذ</td><td>رقابة خفيفة: مراقبة جودة المخرجات</td></tr>
    <tr><td>المستوى 1</td><td>إجراء بعد موافقة بشرية — يُعِدّ الوكيل الإجراء، ويصرّح به إنسان</td><td>مراجعة وصول قياسية، سجل موافقة واضح</td></tr>
    <tr><td>المستوى 2</td><td>إجراءات مستقلة محدودة ضمن نطاق ضيّق ومُختبر جيداً</td><td>صلاحيات محددة النطاق، مراقبة فعالة، تدقيق دوري</td></tr>
    <tr><td>المستوى 3</td><td>إجراءات مستقلة واسعة ضمن نطاق عمل معرَّف</td><td>موافقة مخاطر رسمية، مالكون محددون، خطة استجابة للحوادث</td></tr>
    <tr><td>المستوى 4</td><td>قرارات أو إجراءات مستقلة عالية الأثر (مالية أو قانونية أو تتعلق بالسلامة)</td><td>مساءلة على مستوى المجلس/التنفيذيين، مراجعة مستمرة، اختبار مفتاح إيقاف الطوارئ</td></tr>
  </tbody>
</table>

<p>النمط الذي يجب تذكره: ينبغي أن تتصاعد متطلبات الحوكمة مع الاستقلالية والأثر معاً، لا مع الاستقلالية وحدها. وكيل من المستوى 3 يلامس بيانات داخلية منخفضة القيمة مشكلة حوكمة أصغر من وكيل من المستوى 1 له وصول دائم لبيانات الرواتب.</p>

<h2>الموافقة البشرية: داخل الحلقة، على الحلقة، خارج الحلقة</h2>
<p>الإنسان داخل الحلقة يعني أن شخصاً يوافق قبل تنفيذ الإجراء. الإنسان على الحلقة يعني أن شخصاً يمكنه المراقبة والتدخل، لكن الوكيل يمضي افتراضياً. الإنسان خارج الحلقة يعني أن الوكيل يتصرف دون أي نقطة تحقق بشرية آنية على الإطلاق. مثال ملموس، الشركة نفسها، ثلاث مهام: وكيل يلخّص عروض الموردين لمشترٍ بشري مصدر قلق منخفض، فهو لا يقرر شيئاً. وكيل يختار أي مورّد يوصي به مصدر قلق أعلى، ويحتاج منطقه إلى إمكانية الفحص. وكيل يوقّع عقداً أو يبدأ عملية دفع مصدر قلق مرتفع جداً، وينتمي بوضوح إلى فئة "داخل الحلقة" بصرف النظر عن مدى جودة سجله السابق.</p>

<h2>الوصول إلى البيانات مشكلة حوكمة بيانات، لا مجرد ضبط وصول</h2>
<p>ينبغي أن تكون صلاحيات الوكيل دالّة على تصنيف البيانات التي يلامسها، لا العكس. البيانات العامة، والداخلية، والسرية، وشديدة الحساسية، وبيانات العملاء، وبيانات الموظفين، وبيانات الاعتماد والأسرار، والشيفرة المصدرية، والسجلات المالية — لكل منها درجة تعرض مختلفة إذا أساء الوكيل التعامل معها، و"يحتاج الوكيل سياقاً ليكون مفيداً" ليس سبباً لتجاوز التصنيف، بل هو بالضبط سبب وجوب حدوث التصنيف أولاً. هذا بالضبط المجال الذي يُبنى حوله مفهوم Data Guardian الخاص بـ CyberAbeer: لا ينبغي أن يحصل الوكيل أبداً على صلاحية تتجاوز مستوى حساسية البيانات التي وراءها.</p>

<h2>الذكاء الاصطناعي الخفي ووكلاء الظل</h2>
<p>الذكاء الاصطناعي الخفي هو أي استخدام للذكاء الاصطناعي يقع خارج الحوكمة المعتمدة: حساب شخصي للذكاء الاصطناعي يُستخدم للعمل، أو أتمتة بناها قسم ما دون تسجيلها، أو امتداد متصفح غير معتمد بصلاحيات وصول واسعة للصفحات، أو تكامل ربطه مطوّر خلال عطلة نهاية أسبوع. أما <em>وكيل الظل</em> فهو النسخة الأكثر حدّة من المشكلة نفسها، لأنه قادر على التصرف، لا على توليد نص فقط. وجدت أبحاث Cloud Security Alliance أن 73% من المؤسسات المستطلعة تتوقع أن تصبح وكلاء الذكاء الاصطناعي أساسية خلال عام، بينما لم تستطع 68% منها التمييز بوضوح بين نشاط وكيل الذكاء الاصطناعي والنشاط البشري داخل أنظمتها — ما يعني أن معظم المؤسسات لا تستطيع حوكمة ما لا تراه أولاً. الاكتشاف والجرد (أي الوكلاء الموجودون، ومن يملكها، وما تستطيع الوصول إليه) يجب أن يسبق أي حوار عن الصلاحيات أو الاستقلالية، لأنك لا تستطيع تطبيق مبدأ أقل الصلاحيات على شيء لا تعلم أنه يعمل أصلاً.</p>

<h2>مخاطر التفاعل بين الوكلاء</h2>
<p>مع تزايد انتشار الأنظمة متعددة الوكلاء، يظهر سؤال جديد: إذا فوّض الوكيل "أ" الوكيل "ب"، واستدعى الوكيل "ب" الوكيل "ج"، فمن يملك الإجراء النهائي؟ هذا ليس افتراضاً بعيد المدى بقدر ما هو نمط معماري بدأ بالفعل بالظهور في نشرات إنتاج متعددة الوكلاء، وهو بالضبط سبب وجوب أن يكون التفويض محدوداً لا مفتوحاً: كل حلقة في سلسلة التفويض ينبغي أن تحمل نطاق صلاحية متناقصاً لا مطابقاً، وينبغي أن تكون السلسلة الكاملة قابلة لإعادة البناء لاحقاً. وإن تُرك التفويض دون قيود، يمكن أن تنتشر الصلاحية أبعد مما قصده أي شخص، ويصبح وراثة الامتياز غير المقصودة صعبة التدقيق جداً. هذا سؤال حوكمي حقيقي وقريب الأجل، لا سؤال مثير — والحل هو انضباط معماري في كيفية تحديد نطاق التفويض، لا التهويل.</p>

<h2>مخاطر الأدوات وواجهات البرمجة</h2>
<p>يكمن معظم المخاطر العملية في نشر الوكيل فيما يُسمح له باستدعائه، لا في النموذج نفسه. إطار MITRE ATLAS، النظير المتخصص بالذكاء الاصطناعي لإطار ATT&amp;CK، يوثّق بشكل متزايد مسارات الهجوم عند طبقة التنسيق والتنفيذ هذه بالذات: ليس النموذج، بل الهويات والخدمات المجاورة له التي تتيح للوكيل الوصول إلى الأسرار والبيانات والإجراءات.</p>

<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="سطح مخاطر الوكيل: وكيل الذكاء الاصطناعي في المركز محاطاً بالبريد الإلكتروني، والمستندات، ونظام تخطيط الموارد، وإدارة علاقات العملاء، والواجهات السحابية، ومستودعات الشيفرة، وقواعد البيانات، والمدفوعات، وأدوات التذاكر والأمن">
  <g font-family="sans-serif" font-size="13" text-anchor="middle">
    <circle cx="320" cy="320" r="66" fill="#0a323c" />
    <text x="320" y="316" fill="#ffffff" font-weight="700" font-size="13">وكيل</text>
    <text x="320" y="334" fill="#ffffff" font-weight="700" font-size="13">الذكاء الاصطناعي</text>

    <g stroke="#f3c8c8" stroke-width="2">
      <line x1="320" y1="254" x2="320" y2="70" />
      <line x1="374" y1="286" x2="560" y2="140" />
      <line x1="386" y1="320" x2="600" y2="320" />
      <line x1="374" y1="354" x2="560" y2="500" />
      <line x1="320" y1="386" x2="320" y2="570" />
      <line x1="266" y1="354" x2="80" y2="500" />
      <line x1="254" y1="320" x2="40" y2="320" />
      <line x1="266" y1="286" x2="80" y2="140" />
    </g>

    <rect x="230" y="30" width="180" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="320" y="59" fill="#b32b2b">البريد الإلكتروني</text>

    <rect x="480" y="106" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="565" y="135" fill="#b32b2b" font-size="12">واجهات سحابية</text>

    <rect x="520" y="296" width="150" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="595" y="325" fill="#b32b2b" font-size="12">قواعد بيانات</text>

    <rect x="480" y="476" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="565" y="505" fill="#b32b2b">المدفوعات</text>

    <rect x="220" y="546" width="200" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="320" y="575" fill="#b32b2b" font-size="12">التذاكر / أدوات الأمن</text>

    <rect x="0" y="476" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="85" y="505" fill="#b32b2b" font-size="12">تخطيط الموارد</text>

    <rect x="0" y="296" width="150" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="75" y="325" fill="#b32b2b" font-size="12">إدارة العملاء</text>

    <rect x="0" y="106" width="170" height="48" rx="8" fill="#fdecec" stroke="#d63c3c" />
    <text x="85" y="135" fill="#b32b2b" font-size="12">مستودعات الشيفرة</text>
  </g>
</svg>

<h2>السجلات وعدم الإنكار</h2>
<p>بعد أي إجراء يقوم به وكيل، ينبغي أن تكون المؤسسة قادرة على إعادة بناء ما حدث دون تخمين: أي وكيل تصرّف، وبأي هوية، وما التعليمة التي أطلقته، وما الأدوات التي استدعاها، وما البيانات التي لامسها، وما القرار الذي اتخذه، وما الذي تغيّر فعلياً، وهل شارك إنسان في القرار، وهل يمكن إسناد الإجراء بثقة. إن تعذّرت الإجابة عن أي من هذه الأسئلة من السجلات وحدها، فتصميم السجلات يعاني ثغرة، بصرف النظر عمّا إذا وقع خطأ فعلاً أم لا.</p>

<h2>دورة حياة وكيل الذكاء الاصطناعي</h2>
<p>لا يمكن أن تتوقف الحوكمة عند نقطة النشر. الوكيل الذي كان آمناً للموافقة عليه قبل ستة أشهر قد لا يكون آمناً اليوم، لأن البيانات التي يلامسها، أو الأدوات التي يستدعيها، أو عملية الأعمال المحيطة به قد تغيّرت.</p>

<svg viewBox="0 0 300 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="دورة حياة الوكيل: التسجيل، التقييم، الموافقة، النشر، المراقبة، المراجعة، الإيقاف أو الإلغاء، التقاعد">
  <defs>
    <marker id="arrow-ar2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#3f4b57" />
    </marker>
  </defs>
  <g font-family="sans-serif" font-size="15" text-anchor="middle" font-weight="600">
    <rect x="20" y="10" width="260" height="60" rx="10" fill="#eaf2f3" stroke="#0f4c5c" /><text x="150" y="46" fill="#0a323c">التسجيل</text>
    <line x1="150" y1="70" x2="150" y2="98" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="98" width="260" height="60" rx="10" fill="#eaf3fb" stroke="#2673c9" /><text x="150" y="134" fill="#1c5aa0">التقييم</text>
    <line x1="150" y1="158" x2="150" y2="186" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="186" width="260" height="60" rx="10" fill="#eafaf1" stroke="#1f9d55" /><text x="150" y="222" fill="#17803f">الموافقة</text>
    <line x1="150" y1="246" x2="150" y2="274" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="274" width="260" height="60" rx="10" fill="#0a323c" /><text x="150" y="310" fill="#ffffff">النشر</text>
    <line x1="150" y1="334" x2="150" y2="362" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="362" width="260" height="60" rx="10" fill="#fff8e6" stroke="#d99a1b" /><text x="150" y="398" fill="#b17c0f">المراقبة</text>
    <line x1="150" y1="422" x2="150" y2="450" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="450" width="260" height="60" rx="10" fill="#eaf3fb" stroke="#2673c9" /><text x="150" y="486" fill="#1c5aa0">المراجعة</text>
    <line x1="150" y1="510" x2="150" y2="538" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="538" width="260" height="60" rx="10" fill="#fdecec" stroke="#d63c3c" /><text x="150" y="568" fill="#b32b2b" font-size="13">الإيقاف / الإلغاء</text>
    <line x1="150" y1="598" x2="150" y2="626" stroke="#3f4b57" stroke-width="2" marker-end="url(#arrow-ar2)" />

    <rect x="20" y="626" width="260" height="60" rx="10" fill="#f7f8f9" stroke="#3f4b57" /><text x="150" y="662" fill="#1a2027">التقاعد</text>
  </g>
</svg>

<h2>سيناريو مخاطرة: وكيل المشتريات</h2>
<p>لنتأمل وكيل مشتريات لدى شركة متوسطة الحجم افتراضية. يقرأ عروض الموردين الواردة، ويصل إلى نظام تخطيط الموارد، ويصيغ أوامر الشراء، وله صلاحية دائمة لتقديم المعاملات. يعمل تحت حساب خدمة مشترك. لا مالك أعمال محدد له. لا يوجد سقف موافقة بشرية لقيمة المعاملة.</p>
<p><strong>ما الخطأ في هذا التصميم؟</strong> قارنه بالنموذج أعلاه: الهوية مشتركة لا مستقلة، فيفشل الإسناد. الملكية غائبة، فلا أحد مسؤول إن صاغ أمر شراء خاطئاً. الامتياز واسع افتراضياً بدل أن يكون محدد النطاق حسب المهمة. الاستقلالية عند المستوى 3 (إجراء مستقل واسع) دون ضوابط مناسبة لهذا المستوى. الصلاحية المالية غير محدودة عملياً. قد تُظهر السجلات أن معاملة حدثت، لكن ليس ما إذا كان يُفترض إشراك إنسان فيها. الموافقة البشرية غائبة تماماً فوق أي سقف كان يجب أن يوجد. كل واحدة من هذه النقاط قابلة للإصلاح دون إلغاء فائدة الوكيل — وهذه هي الفكرة: الحل هو تصميم حوكمي، لا رفض الوكيل.</p>

<h2>سيناريو قرار: أنت مسؤول حوكمة الذكاء الاصطناعي</h2>
<div class="content-callout">
  <p class="content-callout-title">أنت مسؤول حوكمة الذكاء الاصطناعي</p>
  <p>يحتاج وكيل ذكاء اصطناعي إلى: قراءة وكتابة في نظام تخطيط الموارد، والوصول للبريد الإلكتروني، والوصول لقاعدة بيانات الموردين، وصلاحية موافقة على مشتريات حتى 50,000 دولار، والقدرة على التواصل الخارجي. وتقول جهة الأعمال: "نحتاج استقلالية كاملة كي يكون النظام مفيداً". قبل المتابعة، قرر: ما الصلاحيات التي ينبغي أن تبقى، وما الذي يتطلب موافقة بشرية، وما الذي يجب حظره تماماً، ومن ينبغي أن يملك الوكيل، وما الذي يجب تسجيله.</p>
</div>
<p>القرار الحوكمي المدافَع عنه يبدو كالتالي تقريباً: تبقى قراءة نظام تخطيط الموارد مع الوكيل؛ وتُقيَّد الكتابة على المسودة فقط، مع اشتراط موافقة بشرية للتقديم فوق سقف منخفض. يُمنح الوصول للبريد الإلكتروني للصياغة والإشعار الداخلي، لا للالتزامات الخارجية غير المراقبة. قراءة قاعدة بيانات الموردين مقبولة؛ وتُقيَّد صلاحية الكتابة. تُرفض صلاحية الموافقة بمبلغ 50,000 دولار تماماً على مستوى الوكيل — فهذا قرار من المستوى 4 يخص المجلس، لا شيء يُفوَّض افتراضياً لنظام مستقل؛ ويُحدَّد بدلاً منه سقف أقل بكثير وخاضع للمراجعة، مع توجيه أي مبلغ أعلى إلى معتمِد بشري محدد. يُقيَّد التواصل الخارجي بقوالب معتمدة مسبقاً، لا مراسلة مفتوحة. يحصل الوكيل على مالك أعمال محدد، ومالك تقني محدد، وتسجيل كامل على مستوى الإجراء منذ اليوم الأول. لا شيء من هذا يرفض حاجة العمل إلى أن يكون النظام مفيداً؛ بل يجيب عنها بشروط بدل شيك على بياض. هذا بالضبط نوع القرار الذي صُمم محاكي <strong>Agent Zero&trade;</strong> القادم من CyberAbeer لتتيح لك التدرب عليه عملياً، قريباً في CyberAbeer Labs.</p>

<div class="content-callout">
  <p class="content-callout-title">رؤية الدكتورة عبير</p>
  <p>انسجاماً مع التفكير الطبقي وراء إطارها الخاص GRCL، ترى الدكتورة عبير الشمري أن حوكمة وكلاء الذكاء الاصطناعي لا يمكن التعامل معها كتخصص منفصل يُضاف إلى مشروع الذكاء الاصطناعي. إنها حوكمة هوية، وحوكمة بيانات، وحوكمة مخاطر، وحوكمة أمنية، تعمل جميعها على الكائن نفسه في الوقت نفسه، والمساءلة البشرية هي الثابت الذي يربط هذه الأبعاد الأربعة ببعضها. افصل أياً من هذه الأربعة عن الأخرى — حوكم الهوية دون تصنيف البيانات، أو الصلاحيات دون السجلات — وستكون الفجوة بينهما بالضبط حيث تبدأ الحوادث.</p>
</div>

<h2>أين يتصل هذا بإطار GRCL</h2>
<p>يمكن تقييم أي مشروع وكيل ذكاء اصطناعي عبر العدسات الثلاث نفسها التي يطبقها إطار GRCL على أي قرار حوكمي: الحرجية التنظيمية، ومستوى المخاطرة، والقيمة التجارية. لا ينبغي رفض وكيل عالي القيمة تلقائياً لمجرد أنه يُدخل مخاطرة — فذلك يترك كل القيمة على الطاولة دون أي فائدة حوكمية. الهدف من تمرير الوكيل عبر هذه العدسة هو تحديد الضوابط اللازمة، والشروط المطبَّقة، ومستوى الموافقة المطلوب، وما إذا كانت الرقابة البشرية الآنية ضرورية، لا إصدار حكم بسيط بالموافقة أو الرفض. آلية عمل GRCL التفصيلية في تقييم مشروع معيّن هي بحث الدكتوراه الخاص بالدكتورة عبير ولا تُستنسخ هنا؛ وما يهم في هذا المقال هو المبدأ: المخاطرة سبب لإضافة الضوابط الصحيحة، لا سبب للرفض الافتراضي.</p>

<div class="content-callout">
  <p class="content-callout-title">قيّم جاهزية حوكمة وكلاء الذكاء الاصطناعي لديك</p>
  <p>إن لم تكن متأكداً من قدرة مؤسستك على الإجابة عن أسئلة الملكية والصلاحيات والتسجيل الواردة في هذا المقال لكل وكيل تشغّله بالفعل، فهذا بالضبط ما صُمم <a href="/ar/free-tools/ai-governance-quick-check">تقييم GreenTrust المجاني</a> لكشفه، خلال نحو خمس عشرة دقيقة، ودون أي تكلفة.</p>
</div>

<h2>أسئلة شائعة</h2>

<h3>ما هو وكيل الذكاء الاصطناعي؟</h3>
<p>برمجية قادرة على ملاحظة السياق، واتخاذ قرار بشأن إجراء، وتنفيذه، عادة عبر استدعاء أدوات أو واجهات برمجية، بموافقة بشرية محدودة أو معدومة لكل خطوة — بخلاف البرمجية التي تنفذ فقط تسلسلاً ثابتاً من التعليمات.</p>

<h3>هل وكيل الذكاء الاصطناعي هو نفسه روبوت المحادثة؟</h3>
<p>لا. روبوت المحادثة يستجيب؛ ولا يغيّر عادة أي شيء في أنظمتك. أما الوكيل فيمكنه القراءة والكتابة عبر أنظمة حقيقية واتخاذ إجراءات ذات عواقب، ولهذا يحتاج هويته الخاصة ونموذج صلاحياته ورقابته الخاص.</p>

<h3>هل يحتاج وكيل الذكاء الاصطناعي هوية خاصة به؟</h3>
<p>غالباً نعم. مشاركة بيانات اعتماد إنسان أو حساب خدمة عام مع الوكيل يكسر الإسناد وقابلية التدقيق والإلغاء النظيف. تتعامل مبادرة NIST لمعايير وكلاء الذكاء الاصطناعي وميزة Entra Agent ID من مايكروسوفت مع الوكلاء كفئة مستقلة من الهوية غير البشرية لهذا السبب بالذات.</p>

<h3>ما هي الهوية غير البشرية؟</h3>
<p>هوية تُمنح لقطعة برمجية (خدمة، أو حمل عمل، أو وكيل) لا لشخص، بحيث يمكن مصادقة إجراءاتها وتحديد نطاقها وتدقيقها بشكل مستقل عن تسجيل دخول أي إنسان.</p>

<h3>ما الصلاحيات التي ينبغي أن يمتلكها وكيل الذكاء الاصطناعي؟</h3>
<p>الحد الأدنى اللازم لمهمته المحددة، ممنوحاً لمدة محدودة، ومُراجَعاً وفق جدول، ومحدوداً بوضوح دون الامتياز الإداري أو صلاحية المعاملات غير المحدودة، ما لم يُنص على استثناء صريح ومُراجَع.</p>

<h3>من المسؤول عن وكيل الذكاء الاصطناعي؟</h3>
<p>مالك أعمال محدد، ومالك تقني محدد، ومالك مخاطر معرَّف، كحد أدنى — لا "فريق الذكاء الاصطناعي" كإجابة جماعية غير محددة.</p>

<h3>ما هو الذكاء الاصطناعي الخفي؟</h3>
<p>أي استخدام للذكاء الاصطناعي، بما في ذلك الوكلاء، يعمل خارج عملية الحوكمة المعتمدة للمؤسسة: أدوات غير مسجلة، أو حسابات شخصية تُستخدم للعمل، أو أتمتة بناها قسم ما دون مراجعة أو جرد مركزي.</p>

<h3>هل ينبغي أن يصل وكلاء الذكاء الاصطناعي إلى بيانات سرية؟</h3>
<p>فقط حين يكون مستوى حساسية تلك البيانات مصنَّفاً وتكون صلاحية الوكيل قد حُدِّدت عمداً لتطابقه — يجب أن يتبع الوصول التصنيف، لا العكس.</p>

<h3>كيف ينبغي تدقيق وكلاء الذكاء الاصطناعي؟</h3>
<p>عبر سجلات مفصّلة بما يكفي لإعادة بناء أي وكيل تصرّف، وبأي هوية، وبأي تعليمة، وباستخدام أي أدوات وبيانات، وما الذي تغيّر، وهل شارك إنسان في القرار — قابلة لإعادة البناء لاحقاً، لا مجرد مراقَبة في اللحظة نفسها.</p>
$ar13$,
  'أمن وكلاء الذكاء الاصطناعي | CyberAbeer',
  'وكلاء الذكاء الاصطناعي يتصرفون، لا يستجيبون فقط. تعرّف على أهمية هوية الوكيل وصلاحياته ومستويات استقلاليته وحوكمة دورة حياته.',
  16
from articles art join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance'
  and exists (
    select 1 from article_translations t
    where t.article_id = art.id and t.locale = 'en'
      and t.slug = 'ai-agent-security-identity-permissions-governance'
  )
  and not exists (
    select 1 from article_translations t4
    where t4.article_id = art.id and t4.locale = 'ar'
  );

-- ---------------------------------------------------------------------
-- Sources -- every one a real, currently-live, checkable URL.
-- ---------------------------------------------------------------------
insert into article_sources (article_id, title, publisher, url, published_date, accessed_date, sort_order)
select t.article_id, s.title, s.publisher, s.url, s.published_date::date, current_date, s.sort_order
from article_translations t
join (values
  ('NIST AI Agent Standards Initiative', 'NIST', 'https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative', '2026-02-17', 1),
  ('Accelerating the Adoption of Software and AI Agent Identity and Authorization (Concept Paper)', 'NIST National Cybersecurity Center of Excellence (NCCoE)', 'https://www.nccoe.nist.gov/publications/other/accelerating-adoption-software-and-ai-agent-identity-and-authorization-concept', '2026-02-05', 2),
  ('Careful Adoption of Agentic AI Services', 'CISA, with ACSC, NSA, CCCS, NCSC-NZ and NCSC-UK', 'https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-ai-services', null, 3),
  ('OWASP Top 10 for Agentic Applications for 2026', 'OWASP Gen AI Security Project', 'https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/', '2025-12-09', 4),
  ('MITRE ATLAS', 'MITRE', 'https://atlas.mitre.org/', null, 5),
  ('Agentic AI Identity Management: A New Approach', 'Cloud Security Alliance', 'https://cloudsecurityalliance.org/blog/2025/03/11/agentic-ai-identity-management-approach', '2025-03-11', 6),
  ('What is Microsoft Entra Agent ID?', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id', null, 7),
  ('Cloud CISO Perspectives: How Google secures AI agents', 'Google Cloud', 'https://cloud.google.com/blog/products/identity-security/cloud-ciso-perspectives-how-google-secures-ai-agents', null, 8),
  ('Security best practices for agentic AI systems on AWS', 'AWS Prescriptive Guidance', 'https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-security/best-practices.html', null, 9),
  ('ENISA Threat Landscape 2025', 'ENISA', 'https://www.enisa.europa.eu/sites/default/files/2026-01/ENISA%20Threat%20Landscape%202025_v1.2.pdf', '2025-10-01', 10)
) as s(title, publisher, url, published_date, sort_order)
  on true
where t.locale = 'en' and t.slug = 'ai-agent-security-identity-permissions-governance'
  and not exists (select 1 from article_sources ex where ex.article_id = t.article_id);

-- ---------------------------------------------------------------------
-- Tag: cross-cutting "Dr. Abeer Insights" (this article includes a
-- distinct founder-insight section, same pattern as Article 01).
-- ---------------------------------------------------------------------
insert into article_tags (article_id, tag_id)
select t.article_id, tg.id
from article_translations t, tags tg
where t.locale = 'en' and t.slug = 'ai-agent-security-identity-permissions-governance'
  and tg.key = 'dr-abeer-insights'
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Internal linking / topic clusters
-- ---------------------------------------------------------------------
insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('ai-agent-security-identity-permissions-governance', 'ai-agent-governance-why-autonomous-ai-needs-its-own-model', 1),
  ('ai-agent-security-identity-permissions-governance', 'what-is-the-grcl-framework', 2),
  ('ai-agent-security-identity-permissions-governance', 'data-classification-101-practical-framework', 3),
  ('ai-agent-security-identity-permissions-governance', 'cybersecurity-governance-vs-it-governance', 4),
  ('ai-agent-governance-why-autonomous-ai-needs-its-own-model', 'ai-agent-security-identity-permissions-governance', 1),
  ('data-classification-101-practical-framework', 'ai-agent-security-identity-permissions-governance', 2),
  ('what-is-the-grcl-framework', 'ai-agent-security-identity-permissions-governance', 3)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale = 'en' and src.slug = r.src_slug
join article_translations dst on dst.locale = 'en' and dst.slug = r.dst_slug
on conflict (article_id, related_article_id) do nothing;

-- ---------------------------------------------------------------------
-- Verification queries (run manually; nothing here auto-publishes --
-- articles_public_read RLS only exposes status = 'published')
-- ---------------------------------------------------------------------
-- select at.locale, at.title, at.slug, a.status, a.difficulty, a.audience
-- from articles a
-- join article_translations at on at.article_id = a.id
-- where at.slug like 'ai-agent-security-identity-permissions-governance%'
--    or at.slug like '%أمن-وكلاء-الذكاء-الاصطناعي%';
--
-- select count(*) from article_sources s
-- join article_translations t on t.article_id = s.article_id
-- where t.locale = 'en' and t.slug = 'ai-agent-security-identity-permissions-governance';
-- -- expect 10
