"use strict";
const Delete = {
    select: "select OwnerID from Key_Authority where SerialNum = ?",
    update: "update KeyInfo set KeyState = ? where SerialNum = ?",
};
const Join = {
    select: "SELECT * FROM Users WHERE UserEmail = ?",
    insert: "INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)",
};
const KeyControl = {
    select_Authority: "select * from Key_Authority where SerialNum = ?",
    select_Info: "select * from KeyInfo where SerialNum = ?",
    select_State: "select KeyState from KeyInfo where SerialNum = ?",
    update_Info: "update KeyInfo set KeyState = ? where SerialNum = ?",
    insert_Record: "insert into KeyRecord (SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email) values (?, ?, ?, ?, ? ,?, ?)",
};
const Mode = {
    select: "select KeyState, Mode from KeyInfo where SerialNum = ?",
    update: "update KeyInfo set Mode = ? where SerialNum = ?",
};
const List = {
    select: "select SerialNum, KeyName, KeyState, UserID, Shared, Mode from KeyInfo where UserID = ? or SharedID = ?",
};
const KeyPw = {
    select: "select SmartPwd, Salt from KeyInfo where SerialNum = ?",
};
const KeyRecord = {
    select_Record: "select SerialNum, Time, KeyState, GPSLat, GPSLong, Method, Email from KeyRecord where serialNum = ?",
    select_Authority: "select OwnerID from Key_Authority where SerialNum = ?",
    select_Image: "select Image from KeyRecord where SerialNum = ? and Time = ?",
};
const KeyShare = {
    select_Authority: "select * from Key_Authority where SerialNum = ?",
    update_KeyInfo: "update KeyInfo set Shared = ?, SharedID = ? where SerialNum = ?",
    update_Authority: "update Key_Authority set ShareID = ? where SerialNum = ?",
    select_User: "select * from Users where UserEmail = ?",
    insert_Record: "insert into KeyRecord (SerialNum, Time, Method, Email) values (?, ?, ?, ?)",
};
const Register = {
    select_KeyInfo: "select KeyState from KeyInfo where SerialNum = ?",
    insert_KeyInfo: "insert into KeyInfo (SerialNum, KeyName, KeyState, UserID, SmartPwd, Salt, Shared, Mode) values (?, ?, ?, ?, ?, ?, ?, ?)",
    insert_Record: "insert into KeyRecord (SerialNum, Time, KeyState, Method, Email) values (?, ?, ?, ?, ?)",
    insert_Authority: "insert into Key_Authority(SerialNum, OwnerID) values (?, ?)",
};
const PWReset = {
    select: "select * from Users where UserEmail = ? and UserName = ? and UserBirth = ?",
    update: "update Users set UserPwd = ?, Salt = ? where UserEmail = ?",
};
const RPIControl = {
    select: "select KeyState, Mode from KeyInfo where SerialNum = ?",
    delete_KeyInfo: "delete from KeyInfo where SerialNum = ?",
    delete_Record: "delete from KeyRecord where SerialNum = ?",
    delete_Authority: "delete from Key_Authority where SerialNum = ?",
    update_KeyInfo: "update KeyInfo set KeyState = ? where SerialNum = ?",
    insert_Record: "insert into KeyRecord (SerialNum, Time, KeyState, Method) values (?, ?, ?, ?)",
};
const Image = {
    insert: "insert into KeyRecord (SerialNum, Time, KeyState, Method, Image) values (?, ?, ?, ?, ?)",
};
module.exports = {
    Delete,
    Join,
    KeyControl,
    Mode,
    List,
    KeyPw,
    KeyRecord,
    KeyShare,
    Register,
    PWReset,
    RPIControl,
    Image,
};
