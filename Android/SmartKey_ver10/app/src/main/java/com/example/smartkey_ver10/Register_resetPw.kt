package com.example.smartkey_ver10

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class Register_resetPw : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_reset_pw)

        //쿠키세팅
        var cookie = CookieHandler().setCookie()
        val PostService = Retrofit_service.service

        val authNum = findViewById<EditText>(R.id.edt_authNum)
        val btn_postAuthNum = findViewById<Button>(R.id.btn_authCheck)
        val btn_postInfo = findViewById<Button>(R.id.btn_postInfo)

        var visible = 1

        if(visible == 1){ //공유 스마트키로 접근 시 버튼 없애기
            authNum.visibility = View.INVISIBLE
            btn_postAuthNum.visibility = View.INVISIBLE
        } else{authNum.visibility = View.VISIBLE
            btn_postAuthNum.visibility = View.VISIBLE}



        btn_postInfo.setOnClickListener {

            val userEmail = findViewById<EditText>(R.id.edt_useremail).text.toString()
            val userName = findViewById<EditText>(R.id.edt_username).text.toString()
            val userBirth = findViewById<EditText>(R.id.edt_userbirth).text.toString()

            var InputInfo = HashMap<String,String>()

            InputInfo.put("userEmail", userEmail)
            InputInfo.put("userName", userName)
            InputInfo.put("userBirth", userBirth)

            PostService.postForResetUserinfo(cookieid = cookie, InputInfo).enqueue(object : Callback<PostForResetInfo> {
                override fun onResponse(call: Call<PostForResetInfo>, response: Response<PostForResetInfo>) {
                    if(response.isSuccessful()){
                        var L_code =response.raw()
                        if(L_code.code == 200){

                        }
                    }
                }
                override fun onFailure(call: Call<PostForResetInfo>, t: Throwable) {
                    Log.d("로그인","t"+t.message)
                    //dialog("fail")
                }
            })
        }//버튼 끝





        }
    }
}