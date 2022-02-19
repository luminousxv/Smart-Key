package com.example.smartkey_ver10


//회원가입 정보
data class RegisterUserInfo(
    var userEmail: String = "",
    var userPwd: String = "",
    var userName: String = "",
    var userBirth: String ="",
)
//로그인
data class LoginInfo(
    val userEmail: String,
    val userPwd: String,
)

//인증번호
data class CheckAuth(
    var inputAuth: String = "",
)

//키get
data class GetKeyInfo(
    var code: String,
    var message: List<KeyInfo>
)
data class KeyInfo(
    var KeyID: String = "",
    var SerialNum: String ="",
    var KeyName: String="",
    var KeyState: String="",
    var UserID: String=""
)

//키 post
data class RegiserKeyInfo(
    var serialNum: String = "",
    var keyName: String = "",
    var smartPwd: String = "",
)

//키 open, close
data class P_op_cl(
    var serialNum: String,
    var GPSLong:String,
    var GPSLat:String
)

//키 삭제
data class PostSmartPw(
    var serialNum: String,
    var smartPwd: String
)
data class PostserialNum(
    var serialNum: String
)

//키 이력관리 갯
data class GetKeyrecord(
    var code: String,
    var message: List<KeyLog>
)
data class KeyLog(
    var SerialNum: String,
    var Time: String,
    var KeyState: String,
    var GPSLat: String,
    var GPSLong: String,
    var Method: String
)

//리사이클러뷰 아이템
data class ViewItem(
    var img : String,
    var id : String,
    val name : String
)
