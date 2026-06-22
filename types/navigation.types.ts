export type AuthStackParamList = {
  login: undefined;
};

export type InspectorTabsParamList = {
  index: undefined;
  demands: undefined;
  receipts: undefined;
  profile: undefined;
};

export type InspectorStackParamList = {
  "(inspector)": undefined;
  "demands/[id]": { id: string };
  "collect/[demandId]": { demandId: string };
};

export type AccountsTabsParamList = {
  index: undefined;
  verified: undefined;
  register: undefined;
  profile: undefined;
};

export type AccountsStackParamList = {
  "collection/[id]": { id: string };
};

export type AdminTabsParamList = {
  index: undefined;
  inspectors: undefined;
  demands: undefined;
  users: undefined;
  more: undefined;
};

export type AdminStackParamList = {
  "inspectors/[id]": { id: string };
  "demands/create": undefined;
  "users/create": undefined;
  audit: undefined;
};

export type ChairmanTabsParamList = {
  index: undefined;
  reports: undefined;
  analytics: undefined;
  profile: undefined;
};
