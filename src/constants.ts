
import { ForecastInputs } from './types';

export const DEFAULT_INPUTS: ForecastInputs = {
  weeksUntilDeadline: 8, // Approx from March 3 to May 1
  numVAs: 2,
  accountsPerVA: 2,
  failureRate: 0.15,
  bufferTarget: 5,
  startingSpareInventory: 0,
  targetNewCampaigns: 20,
};

export const SOP_CONTENT = {
  vaChecklist: [
    { time: 'Morning', task: 'Check account notifications & reply to 2-3 low-stakes comments.' },
    { time: 'Midday', task: 'Find 1 relevant subreddit, post 1 helpful comment (no links).' },
    { time: 'End of Day', task: 'Update Karma count in tracker & log any "shadowban" suspicions.' },
  ],
  postingRules: [
    "Never post in the same subreddit twice in 24 hours.",
    "Use unique IP/Browser profiles for each account (AdsPower/Dolphin).",
    "80/20 Rule: 80% genuine engagement, 20% 'warming' posts.",
    "Avoid controversial subreddits (politics/crypto) during warming.",
  ],
  opsReview: {
    agenda: [
      "Review Ban Rate: If >20%, audit VA browser profiles.",
      "Capacity Check: Are we on track for the May 1 deadline?",
      "Client Pipeline: Match 'Ready' accounts to upcoming campaigns.",
    ],
    thresholds: [
      "Red Flag: 0 spare accounts for 2 consecutive weeks.",
      "Yellow Flag: Ban rate spikes above 25%.",
    ]
  },
  leadershipKPIs: [
    "Cost per Warmed Account (VA Hours / Accounts Produced)",
    "Average Warming Time (Days from Start to 100 Karma)",
    "Campaign Retention Rate (Account longevity post-assignment)",
  ]
};

export const CLIENT_SCRIPT = {
  title: "Client Response: $10k/mo Expansion",
  body: `Hi [Client Name],

Excited to scale this. To ensure maximum account longevity and campaign quality, we'll follow a phased rollout:

1. We're launching the first 2 campaigns immediately using our current 'Ready' inventory.
2. We'll ramp up to the full 5 campaigns over the next 3–4 weeks as our next batch of high-karma accounts clears our internal quality checks.

This 'quality-first' approach prevents platform flags and ensures your campaigns stay live and effective long-term.

Best,
[Your Name]`
};
