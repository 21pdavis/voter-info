import type { NewLegislator } from "../db/schema";

/**
 * Placeholder data so the app shows something before a real data source is
 * connected. These are NOT real officeholders — replace before shipping.
 * Good real sources later: Google Civic Information API, OpenStates API,
 * unitedstates/congress-legislators on GitHub.
 */
export const SAMPLE_LEGISLATORS: NewLegislator[] = [
  {
    fullName: "Jordan Rivera",
    role: "us_senator",
    party: "Democratic",
    state: "CA",
    district: null,
    phone: "202-224-0001",
    website: "https://example.gov/rivera",
  },
  {
    fullName: "Alex Chen",
    role: "us_senator",
    party: "Republican",
    state: "CA",
    district: null,
    phone: "202-224-0002",
    website: "https://example.gov/chen",
  },
  {
    fullName: "Sam Okafor",
    role: "state_senator",
    party: "Democratic",
    state: "CA",
    district: "11",
    phone: "916-651-0011",
    website: "https://example.ca.gov/okafor",
  },
  {
    fullName: "Priya Nair",
    role: "state_senator",
    party: "Republican",
    state: "CA",
    district: "4",
    phone: "916-651-0004",
    website: "https://example.ca.gov/nair",
  },
  {
    fullName: "Taylor Brooks",
    role: "state_representative",
    party: "Democratic",
    state: "CA",
    district: "19",
    phone: "916-319-0019",
    website: "https://example.ca.gov/brooks",
  },
  {
    fullName: "Morgan Ellis",
    role: "state_representative",
    party: "Republican",
    state: "CA",
    district: "7",
    phone: "916-319-0007",
    website: "https://example.ca.gov/ellis",
  },
];
