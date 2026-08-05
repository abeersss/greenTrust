"use client";

import { useState, type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp } from "lucide-react";

export interface FreeToolDownloadItem {
  icon: ReactNode;
  title: string;
  body: string;
  format: string;
  file: string;
  why: string;
  who: string;
  ease: string;
  signal: string;
  steps: string[];
}

interface FreeToolsDownloadsLabels {
  why: string;
  who: string;
  ease: string;
  signal: string;
  quickStart: string;
  expand: string;
  collapse: string;
  download: string;
}

interface FreeToolsDownloadsProps {
  items: FreeToolDownloadItem[];
  labels: FreeToolsDownloadsLabels;
}

export function FreeToolsDownloads({ items, labels }: FreeToolsDownloadsProps) {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  return (
    <div className="mt-8 grid gap-6 tablet:grid-cols-2">
      {items.map((item) => {
        const isOpen = expandedFile === item.file;
        const panelId = `free-tool-details-${item.file}`;
        return (
          <Card key={item.file} data-brand="greentrust" className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                {item.icon}
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>

            {isOpen && (
              <CardContent id={panelId} className="flex flex-col gap-4 border-t border-border pt-4 text-sm">
                <div>
                  <p className="font-semibold text-text-primary">{labels.why}</p>
                  <p className="mt-1 text-text-secondary">{item.why}</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{labels.who}</p>
                  <p className="mt-1 text-text-secondary">{item.who}</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{labels.ease}</p>
                  <p className="mt-1 text-text-secondary">{item.ease}</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{labels.signal}</p>
                  <p className="mt-1 text-text-secondary">{item.signal}</p>
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{labels.quickStart}</p>
                  <ol className="mt-2 list-decimal space-y-1 ps-5 text-text-secondary">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            )}

            <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-text-muted">{item.format}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setExpandedFile(isOpen ? null : item.file)}
                >
                  {isOpen ? labels.collapse : labels.expand}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
                <Button asChild size="sm">
                  <a href={`/downloads/${item.file}`} download>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {labels.download}
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
