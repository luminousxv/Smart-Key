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
    var inputAuth: String,
)

//키get
data class GetKeyInfo(
    var code: String,
    var message: List<KeyInfo>
)
data class KeyInfo(
    var SerialNum: String,
    var KeyName: String,
    var KeyState: String,
    var UserID: String,
    var Shared: String,
    var Mode: String
)

//등록키 post
data class RegisterKeyInfo(
    var serialNum: String,
    var keyName: String,
    var smartPwd: String,
)

//키 open, close
data class P_op_cl(
    var serialNum: String,
    var GPSLong: String,
    var GPSLat: String
)

//키 인증
data class PostSmartPw(
    var serialNum: String,
    var smartPwd: String
)
//키 삭제, 공유삭제, 보안모드
data class PostserialNum(
    var serialNum: String,
    var message: String
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
    var GPSLat: Double,
    var GPSLong: Double,
    var Method: String
)

//키 공유
data class PostSharedInfo(
    var serialNum: String,
    var shareEmail: String
)

//비밀번호 초기화
data class PostForResetInfo(
    var userEmail: String,
    var userName: String,
    var userBirth: String
)
data class PostResetPW(
    var userPwd: String
)

//보안모드사진
data class GetSecuImg(
    var code: String,
    var message: String
)

//리사이클러뷰 아이템
data class ViewItem(
    var img : String,
    var id : String,
    val name : String
)
