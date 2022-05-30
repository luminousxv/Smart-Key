package com.example.smartkey_ver10

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class Register_resetPw : AppCompatActivity() {
    val PostService = Retrofit_service.service

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_reset_pw)

        val btn_postAuthNum = findViewById<Button>(R.id.btn_authCheck)
        val btn_postInfo = findViewById<Button>(R.id.btn_postInfo)

        btn_postInfo.setOnClickListener {

            var userEmail = findViewById<EditText>(R.id.edt_useremail).text.toString()
            var userName = findViewById<EditText>(R.id.edt_username).text.toString()
            var userBirth = findViewById<EditText>(R.id.edt_userbirth).text.toString()

            var InputInfo = HashMap<String,String>()

            InputInfo.put("userEmail", userEmail)
            InputInfo.put("userName", userName)
            InputInfo.put("userBirth", userBirth)

            PostService.postForResetUserinfo(InputInfo).enqueue(object : Callback<PostForResetInfo> {
                override fun onResponse(call: Call<PostForResetInfo>, response: Response<PostForResetInfo>) {

                    if(response.code() == 200){
                        CookieHandler().getCookie(response.headers().toMap()) //쿠키 받기
                        Log.d("유저정보","전송성공"+response.raw())
                        findViewById<EditText>(R.id.edt_authNum).visibility = View.VISIBLE
                        btn_postAuthNum.visibility = View.VISIBLE
                        btn_postAuthNum.setOnClickListener {
                            var cookie = CookieHandler().setCookie()

                            var authNum = findViewById<EditText>(R.id.edt_authNum).text.toString()
                            Log.d("인증번호",authNum)

                            var InputAuthNum = HashMap<String,String>()
                            InputAuthNum.put("inputAuth", authNum)
                            postAuthNum(cookie, InputAuthNum) //인증번호 전송, 전송 후 비밀번호 변경 다이얼로그까지
                        }//버튼끝
                            Log.d("유저정보","전송완료")
                    }

                    else Log.d("유저정보","전송실패"+response.raw())
                }
                override fun onFailure(call: Call<PostForResetInfo>, t: Throwable) {
                    Log.d("로그인","t"+t.message)
                    //dialog("fail")
                }
            })
        }//버튼 끝
    }


//*****다이얼로그 pw, pw_re 다르게 써도 똑같이 되는데 이거 고치기 필요함 ********
    fun postAuthNum(cookie : String, Input : HashMap<String, String>){

        PostService.postForResetCheckAuth(cookieid = cookie, Input).enqueue(object : Callback<CheckAuth> {
            override fun onResponse(call: Call<CheckAuth>, response: Response<CheckAuth>) {
                if(response.code() == 200){
                    Log.d("인증번호","전송성공"+response.raw())
                    resetPw(cookie) //비밀번호 변경, 포스트 다이얼로그
                }
                else Log.d("인증번호","전송실패"+response.raw())
            }
            override fun onFailure(call: Call<CheckAuth>, t: Throwable) {
                Log.d("인증번호","t"+t.message)
            }
        })
    }//fun postAuthNum 끝


    fun resetPw(cookie : String){

        //다이얼로그 띄우기
        val dialog = SmartkeyDialog(this)
        dialog.Checkdialog_userpw()

        //다이얼로그 입력후 클릭 시
        dialog.setOnClickListener_re(object : SmartkeyDialog.OnDialogClickListener_repw{
            override fun onClicked_repw(reset_pw: String, reset_pw_re: String) {

                if(reset_pw == reset_pw_re && reset_pw.length>8){ //비밀번호 9자, 비번 같을때
                    Toast.makeText(this@Register_resetPw, "비밀번호 변경이 완료되었습니다."
                        , Toast.LENGTH_SHORT).show()

                    var inputkey = HashMap<String, String>()
                    inputkey.put("userPwd", reset_pw)

                    //resetpw 보내기
                    PostService.postResetPw(cookie, inputkey).enqueue(object : Callback<PostResetPW> {
                        override fun onResponse(call: Call<PostResetPW>, response: Response<PostResetPW>) {

                            if(response.code() == 200){
                                Log.d("resetpw","리셋 성공")
                                Toast.makeText(this@Register_resetPw, "비밀번호 변경이 완료되었습니다."
                                    , Toast.LENGTH_SHORT).show()
                                finish() //액티비티 끝내기
                            }
                            else {Log.d("resetpw","리셋 실패")
                                Toast.makeText(this@Register_resetPw, "비밀번호 변경실패."
                                    , Toast.LENGTH_SHORT).show()}
                        }

                        override fun onFailure(call: Call<PostResetPW>, t: Throwable) {
                            Log.d("resetpw","t"+t.message)
                        }
                    })//postSmartPw 끝
                }
                else if(reset_pw.length<9)Toast.makeText(this@Register_resetPw, "비밀번호는 9자 이상이어야 합니다."
                    , Toast.LENGTH_SHORT).show()
                else if(reset_pw != reset_pw_re)Toast.makeText(this@Register_resetPw, "비밀번호가 다릅니다.",
                Toast.LENGTH_SHORT).show()
            }
        })//다이얼로그 클릭이벤트 끝
    }//fun resetPw 끝


}
