
export type AccountStatus = 'Warming' | 'Ready' | 'Assigned' | 'Banned';

export interface Account {
  id: string;
  accountName: string;
  vaOwner: string;
  weekStarted: string;
  currentKarma: number;
  status: AccountStatus;
  campaignAssigned: string;
  notes: string;
}

export interface ForecastInputs {
  weeksUntilDeadline: number;
  numVAs: number;
  accountsPerVA: number;
  failureRate: number;
  bufferTarget: number;
  startingSpareInventory: number;
  targetNewCampaigns: number;
}

export interface WeeklyData {
  weekNum: number;
  date: string;
  newAccounts: number;
  readyInventory: number;
  campaignsRunning: number;
  spareAccounts: number;
  health: 'Green' | 'Yellow' | 'Red';
}
