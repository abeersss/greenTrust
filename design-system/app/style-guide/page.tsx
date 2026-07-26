"use client";

import * as React from "react";
import { useBrand } from "@/components/shared/brand-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/shared/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { RiskIndicator } from "@/components/ui/risk-indicator";
import { useToast } from "@/components/ui/use-toast";
import { ExecutiveCard } from "@/components/greentrust/executive-card";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { AgentCard } from "@/components/greentrust/agent-card";
import { RiskAssessmentCard } from "@/components/greentrust/risk-assessment-card";
import { XPBar } from "@/components/labs/xp-bar";
import { LevelBadge } from "@/components/labs/level-badge";
import { StreakIndicator } from "@/components/labs/streak-indicator";
import { LabCard } from "@/components/labs/lab-card";
import { ChallengeCard } from "@/components/labs/challenge-card";
import { LeaderboardRow } from "@/components/labs/leaderboard-row";
import { AchievementBadge } from "@/components/labs/achievement-badge";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentQuestion } from "@/components/assessment/assessment-question";
import { AssessmentResultCard } from "@/components/assessment/assessment-result-card";
import { ScoreTrendChart } from "@/components/charts/score-trend-chart";
import type { Brand } from "@/lib/utils";

/**
 * Style Guide - NOT an application page. This is the design system's
 * own QA surface: every component in one place so a brand + dark-mode
 * + RTL combination can be visually verified before any real
 * GreenTrust/Labs/CyberAbeer page is built on top of this library.
 */
export default function StyleGuidePage() {
  const { brand, setBrand } = useBrand();
  const { toast } = useToast();
  const [singleAnswer, setSingleAnswer] = React.useState("");
  const [multiAnswer, setMultiAnswer] = React.useState<string[]>([]);
  const [locale, setLocale] = React.useState<"en" | "ar">("en");

  return (
    <div className="min-h-screen bg-bg">
      <Navbar
        logo="CyberAbeer"
        items={[
          { label: "GreenTrust", href: "#", active: brand === "greentrust" },
          { label: "Labs", href: "#", active: brand === "labs" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} onLocaleChange={setLocale} />
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex">
        <Sidebar
          className="hidden desktop:flex"
          sections={[
            {
              label: "Brand preview",
              items: (["cyberabeer", "greentrust", "labs"] as Brand[]).map((b) => ({
                label: b,
                href: "#",
                active: brand === b,
              })),
            },
          ]}
          renderLink={(item) => (
            <button
              onClick={() => setBrand(item.label as Brand)}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-start text-sm font-medium text-text-secondary hover:bg-neutral-100 hover:text-text-primary capitalize aria-[current=page]:bg-primary-50 aria-[current=page]:text-primary-700"
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </button>
          )}
        />

        <main className="flex-1 space-y-16 p-6 tablet:p-10">
          <section>
            <h1 className="font-display text-4xl font-bold text-text-primary">Design System - Style Guide</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Current brand: <Badge variant="primary" className="capitalize">{brand}</Badge> - switch brands from
              the sidebar, toggle dark mode from the navbar. Every component below reads the same tokens.
            </p>
          </section>

          {/* Buttons */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Buttons</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link button</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          {/* Badges / status / risk */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Badges, status & risk indicators</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Neutral</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <StatusIndicator label="Active" tone="positive" />
              <StatusIndicator label="Revoked" tone="negative" />
              <StatusIndicator label="Scanning" tone="pending" pulse />
              <RiskIndicator level="low" />
              <RiskIndicator level="medium" />
              <RiskIndicator level="high" />
              <RiskIndicator level="critical" />
            </div>
          </section>

          {/* Forms */}
          <section className="max-w-lg space-y-4">
            <h2 className="font-display text-xl font-semibold">Forms & inputs</h2>
            <FormField id="agent-name" label="Agent name" required hint="Shown to your team, not to end users.">
              <Input placeholder="e.g. Support Copilot" />
            </FormField>
            <FormField id="agent-desc" label="Description" error="Description is required">
              <Textarea placeholder="What does this agent do?" />
            </FormField>
            <div className="flex items-center gap-2.5">
              <Checkbox id="consent" />
              <Label htmlFor="consent" className="font-normal">I agree to the terms</Label>
            </div>
            <RadioGroup defaultValue="prod">
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="prod" id="env-prod" />
                <Label htmlFor="env-prod" className="font-normal">Production</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="staging" id="env-staging" />
                <Label htmlFor="env-staging" className="font-normal">Staging</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-2.5">
              <Switch id="notify" />
              <Label htmlFor="notify" className="font-normal">Email me weekly digests</Label>
            </div>
          </section>

          {/* Cards */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Cards</h2>
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Supporting description text.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Card body content goes here.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
                <Button size="sm" variant="ghost">Cancel</Button>
              </CardFooter>
            </Card>
          </section>

          {/* Table */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Table</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Support Copilot</TableCell>
                  <TableCell><StatusIndicator label="Active" tone="positive" /></TableCell>
                  <TableCell><RiskIndicator level="low" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Data Sync Agent</TableCell>
                  <TableCell><StatusIndicator label="Shadow" tone="pending" /></TableCell>
                  <TableCell><RiskIndicator level="critical" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* Tabs */}
          <section className="max-w-md space-y-3">
            <h2 className="font-display text-xl font-semibold">Tabs</h2>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">Overview panel content.</TabsContent>
              <TabsContent value="controls">Controls panel content.</TabsContent>
              <TabsContent value="history">History panel content.</TabsContent>
            </Tabs>
          </section>

          {/* Modal / Drawer / Tooltip / Toast */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Modal, drawer, tooltip, notifications</h2>
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm action</DialogTitle>
                    <DialogDescription>This cannot be undone.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="secondary">Open drawer</Button>
                </DrawerTrigger>
                <DrawerContent side="end">
                  <DrawerHeader>
                    <DrawerTitle>Agent details</DrawerTitle>
                  </DrawerHeader>
                  <p className="text-sm text-text-secondary">Slides from the trailing edge - the opposite physical side in RTL.</p>
                </DrawerContent>
              </Drawer>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>

              <Button
                variant="secondary"
                onClick={() => toast({ title: "Saved", description: "Your changes were saved.", variant: "success" })}
              >
                Trigger toast
              </Button>
            </div>
          </section>

          {/* Empty / error / loading */}
          <section className="grid gap-4 tablet:grid-cols-3">
            <EmptyState title="No agents yet" description="Add your first AI agent to start tracking governance." />
            <ErrorState onRetry={() => {}} />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </section>

          {/* Breadcrumb + progress */}
          <section className="space-y-4">
            <Breadcrumb items={[{ label: "GreenTrust", href: "#" }, { label: "Agents", href: "#" }, { label: "Support Copilot" }]} />
            <Progress value={62} className="max-w-sm" aria-label="Example progress" />
          </section>

          {/* GreenTrust components */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold">GreenTrust components</h2>
            <div className="grid gap-4 tablet:grid-cols-4">
              <ExecutiveCard label="Agents governed" value={128} trend={{ value: 12, direction: "up" }} />
              <ExecutiveCard label="Open exceptions" value={4} trend={{ value: 8, direction: "down", goodDirection: "down" }} />
              <ExecutiveCard label="GreenTrust Score" value="82" trend={{ value: 3, direction: "up" }} />
              <ExecutiveCard label="Quantum readiness" value="61" trend={{ value: 0, direction: "flat" }} />
            </div>
            <div className="flex flex-wrap gap-6">
              <ScoreGauge score={82} label="GreenTrust Score" />
              <ScoreGauge score={45} label="Quantum Readiness" />
            </div>
            <div className="grid gap-4 tablet:grid-cols-2">
              <AgentCard name="Support Copilot" agentType="copilot" status="active" environment="production" riskLevel="low" ownerName="Sara A." />
              <AgentCard name="Legacy ETL Bot" agentType="automation" status="shadow" environment="production" riskLevel="critical" />
            </div>
            <RiskAssessmentCard
              agentName="Legacy ETL Bot"
              overallScore={78}
              overallLevel="high"
              assessedAt="Jul 20, 2026"
              status="final"
              factors={[
                { name: "Excessive permissions", score: 85 },
                { name: "No periodic review", score: 60 },
                { name: "Sensitive data access", score: 70 },
              ]}
            />
            <ScoreTrendChart
              ariaLabel="GreenTrust Score trend over the last 6 months"
              data={[
                { date: "Feb", score: 58 },
                { date: "Mar", score: 63 },
                { date: "Apr", score: 67 },
                { date: "May", score: 74 },
                { date: "Jun", score: 79 },
                { date: "Jul", score: 82 },
              ]}
            />
          </section>

          {/* Labs components */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold">CyberAbeer Labs components</h2>
            <div className="flex flex-wrap items-center gap-4">
              <LevelBadge level={7} />
              <StreakIndicator days={12} />
              <StreakIndicator days={3} atRisk />
            </div>
            <XPBar currentXP={2450} levelFloorXP={2000} nextLevelXP={2800} levelNumber={7} className="max-w-sm" />
            <div className="grid gap-4 tablet:grid-cols-3">
              <LabCard title="Phishing Triage" description="Investigate a suspicious email and decide the right response." labType="scenario" difficulty="beginner" xpReward={50} progressPercent={40} />
              <LabCard title="Capture the Flag: Web" description="Find and submit the hidden flag in a vulnerable web app." labType="flag" difficulty="advanced" xpReward={150} />
              <LabCard title="SOC Fundamentals Quiz" description="Test your knowledge of core SOC analyst concepts." labType="quiz" difficulty="intermediate" xpReward={30} />
            </div>
            <ChallengeCard
              title="Spot the Social Engineering Attempt"
              description="A new scenario every week - no sandbox setup required."
              xpReward={75}
              endsAt="Ends in 3 days"
              onStart={() => {}}
            />
            <div className="flex flex-wrap gap-4">
              <AchievementBadge name="First Blood" description="Complete your first challenge" unlocked />
              <AchievementBadge name="Week Warrior" description="Maintain a 7-day streak" unlocked={false} />
            </div>
            <Card className="max-w-sm divide-y divide-border p-0">
              <LeaderboardRow rank={1} name="Noura Al-Fahad" level={12} xp={9800} />
              <LeaderboardRow rank={2} name="Yusuf Khan" level={11} xp={9450} isCurrentUser />
              <LeaderboardRow rank={3} name="Amina Rahman" level={10} xp={9010} />
            </Card>
          </section>

          {/* Assessment components */}
          <section className="max-w-lg space-y-4">
            <h2 className="font-display text-xl font-semibold">Assessment components</h2>
            <AssessmentProgress currentStep={3} totalSteps={8} label="Question 3 of 8" />
            <AssessmentQuestion
              id="q1"
              prompt="Does your organization maintain an inventory of AI agents in production?"
              mode="single"
              value={singleAnswer}
              onChange={(v) => setSingleAnswer(v as string)}
              options={[
                { id: "yes", label: "Yes, fully maintained" },
                { id: "partial", label: "Partially - some agents are untracked" },
                { id: "no", label: "No" },
              ]}
            />
            <AssessmentQuestion
              id="q2"
              prompt="Which systems do your AI agents currently access?"
              mode="multiple"
              value={multiAnswer}
              onChange={(v) => setMultiAnswer(v as string[])}
              options={[
                { id: "crm", label: "CRM" },
                { id: "db", label: "Internal databases" },
                { id: "email", label: "Email / communications" },
              ]}
            />
            <AssessmentResultCard
              title="Your GreenTrust Quick Assessment"
              score={68}
              scoreLabel="Governance Score"
              summary="Your AI agent governance is developing - a few gaps need attention."
              emailCaptured={false}
              onRequestReport={() => {}}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
