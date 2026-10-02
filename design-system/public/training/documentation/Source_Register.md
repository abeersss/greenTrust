# Source Register — ISO 20022 & SWIFT MX Practitioner Program

Retrieval date: 2026-10-02. Every factual SWIFT/ISO/CBPR+ claim in course content must trace to an entry here.

## Core entries

1. CBPR+ MT/MX coexistence end date — Coexistence between MT and ISO 20022 for cross-border payments (CBPR+) ended 22 November 2025. From that date, FI-to-FI payment instructions must be sent exclusively in ISO 20022 (MX). MT 1xx/2xx/9xx message families used for cross-border payments no longer meet CBPR+ requirements; MT103 and MT202(COV) in particular are retired for this traffic. Sources: Payment Expert (paymentexpert.com), dps.de, ACI Worldwide.

2. 2. MT to MX equivalence (core payment messages) — MT103 -> pacs.008 (FIToFICustomerCreditTransfer); MT202 / MT202 COV -> pacs.009 (FinancialInstitutionCreditTransfer, COV variant for cover payments); MT199/MT299 free-format -> camt equivalents case-by-case; MT900/910 (debit/credit confirmation) -> camt.054; MT940/950 (statement) -> camt.053/camt.052. Sources: Payment Expert, Mambu.
  
   3. 3. CBPR+ usage guidelines scope — CBPR+ comprises a defined set of usage guidelines (message-specific implementation rules narrower than the base ISO 20022 schema) published and versioned on SWIFT's MyStandards platform. Guidelines are updated on an annual Standards Release cycle (most recently referenced here: SR2026). Sources: SWIFT CBPR+ roadmap, IBM SWIFT Standards Release 2026.
     
      4. 4. SR2026 structural change — unstructured postal addresses — Unstructured postal addresses are being retired and forbidden across CBPR+ messages as of the November 2026 release, pushing the market toward fully structured address components. This is a live curriculum point for Day 4/5 (data quality, structured addressing). Source: SWIFT CBPR+ roadmap.
        
         5. 5. camt.054 (Bank-to-Customer Debit/Credit Notification) — Version referenced: camt.054.001.08, with CBPR+ usage-guideline updates carried into the 2026 release. Source: IBM SWIFT Standards Release 2026.
           
            6. ## Tracked research gaps (to close before the relevant module ships)
           
            7. - Exact SR2026 field-level changes for pacs.002 (Payment Status Report) reason-code list — needed for Day 6 (exceptions/investigations).
               - - Current MyStandards licence tiers and what a training cohort can access without a paid SWIFT subscription — needed for Day 9 lab guide (MyStandards_Lab_Guide.md).
                 - - ABK-specific routing/compliance configuration — not available, will not be fabricated; every ABK-specific claim in course material will be labeled "ABK configuration to be confirmed with client" per the brief.
                   - - Confirmation of which exact SWIFT Standards Release / CBPR+ book version the live cohort trains against (SR2025 vs SR2026) — flagged to Dr. Abeer; until confirmed, course material is dated "current as researched, Oct 2026" rather than tied to a contractual release.
                     - - pain.001/pain.008 (customer-initiated payment/direct debit) CBPR+ applicability — most CBPR+ scope is FI-to-FI (pacs/camt); pain.* relevance to be confirmed scope-wise before Day 2 content is finalized.
                      
                       - ## Reframing note
                      
                       - Per the 22 Nov 2025 coexistence end date, this course is not "preparing for a future migration" — it trains practitioners on a standard that is already the mandatory, live operating standard for cross-border payments. All module framing (decks, exercises, portal copy) must reflect this as present-tense operational mastery, not forward-looking readiness.
                       - 
