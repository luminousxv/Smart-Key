export interface Form {
  pw: string;
  email: string;
  name: string;
  birth: string;
}

export interface RequestJoin {
  userEmail: string;
  userPwd: string;
  userName: string;
  userBirth: string;
  inputAuth: string;
}

export interface RequestLogin {
  userEmail: string;
  userPwd: string;
}

export interface RequestSerial {
  serialNum: string;
}

export interface RequestKey extends RequestSerial {
  smartPwd: string;
}
export interface RequestGPS extends RequestSerial {
  GPSLong: string;
  GPSLat: string;
}

export interface Response {
  code: number;
  message: string;
}
export interface KeyAuthority {
  KeyID: string;
  SerialNum: string;
  OwnerID: string;
  ShareID: string;
}

export interface KeyRecord {
  RecordID: number;
  SerialNum: string;
  Time: string;
  KeyState: string;
  GPSLat: number;
  GPSLong: number;
  Method: string;
  Email: string;
  Image: string;
}

export interface Users {
  UserID: number;
  UserEmail: string;
  UserPwd: string;
  UserName: string;
  UserBirth: string;
  Salt: string;
}

export interface KeyInfo {
  KeyID: string;
  SerialNum: string;
  KeyName: string;
  KeyState: string;
  UserID: string;
  SmartPwd: string;
  Salt: string;
  Shared: number;
  SharedID: string;
  Mode: number;
}

export type OwnerId = Pick<KeyAuthority, "OwnerID">;
export type KeyList = Omit<KeyInfo, "KeyID" | "SmartPwd" | "Salt" | "SharedID">;
export type KeyPwd = Pick<KeyInfo, "SmartPwd" | "Salt">;
export type EmailVerification = Omit<RequestJoin, "inputAuth">;
