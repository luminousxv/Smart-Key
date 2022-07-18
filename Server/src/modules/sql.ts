const Delete = {
  select: "select OwnerID from Key_Authority where SerialNum = ?",
  update: "update KeyInfo set KeyState = ? where SerialNum = ?",
};

const Join = {
  select: "SELECT * FROM Users WHERE UserEmail = ?",
  insert:
    "INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)",
};

const KeyControl = {
  select_Authority: "select * from Key_Authority where SerialNum = ?",
  select_Info: "select * from KeyInfo where SerialNum = ?",
  select_State: "select KeyState from KeyInfo where SerialNum = ?",
  update_Info: "update KeyInfo set KeyState = ? where SerialNum = ?",
  insert_Record:
    "insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email) values (?, ?, ?, ?, ? ,?, ?)",
};

const Mode = {
  select: "select KeyState, Mode from KeyInfo where SerialNum = ?",
  update: "update KeyInfo set Mode = ? where SerialNum = ?",
};

const List = {
  select:
    "select SerialNum, KeyName, KeyState, UserID, Shared, Mode from KeyInfo where UserID = ? or SharedID = ?",
};

const KeyPw = {
  select: "select SmartPwd, Salt from KeyInfo where SerialNum = ?",
};

export = { Delete, Join, KeyControl, Mode, List, KeyPw };
