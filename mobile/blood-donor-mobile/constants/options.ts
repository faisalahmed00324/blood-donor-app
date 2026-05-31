export const bloodGroupOptions = [
  { label: "A-", value: 1 },
  { label: "A+", value: 2 },
  { label: "B-", value: 3 },
  { label: "B+", value: 4 },
  { label: "AB-", value: 5 },
  { label: "AB+", value: 6 },
  { label: "O-", value: 7 },
  { label: "O+", value: 8 },
];

export const availabilityOptions = [
  { label: "Available", value: 1 },
  { label: "Temporarily Unavailable", value: 2 },
];

export const roleOptions = [
  { label: "Donor", value: 1 },
  { label: "Seeker", value: 2 },
  { label: "Hospital", value: 3 },
];

export const requestStatusLabels: Record<number, string> = {
  1: "Open",
  2: "Partially Fulfilled",
  3: "Fulfilled",
  4: "Expired",
  5: "Cancelled",
};

export const urgencyLabels: Record<number, string> = {
  1: "Critical",
  2: "Urgent",
  3: "Normal",
};

export const availabilityLabels: Record<number, string> = {
  1: "Available",
  2: "Temporarily Unavailable",
  3: "Cooldown",
};
