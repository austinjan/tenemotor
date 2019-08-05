// @flow

/**
 * Flow type defined of roller general settings
 */
type tRollerGeneral = {
  ip: string,
  mac: string,
  name: ?string,
  subnet: ?string,
  gateway: ?string,
  host?: string
};

type tRollerSettings = {
  upperIP: ?string,
  lowerIP: ?string,
  forceNeighborIP: ?number, //none=0 yse=1
  eeyeTCPEvent: ?number, //disable=0 enable=1
  hostIP: ?string,
  eoz: number,
  pe: number, //clear=1, block-0
  halfSpeed: number, //disable
  speed: number,
  currentSpeed: number,
  jamExprTime: number, //JAM timer expiration time
  rumExprTime: number, // run timer expiration time
  mode: number //Mode selection {Singulate, Slug, LongBox,...}
};

type tRoller = {
  ...tRollerGeneral,
  rollerSettings: ?tRollerSettings
};

export type { tRollerGeneral, tRollerSettings, tRoller };
