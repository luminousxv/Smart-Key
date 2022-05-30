package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val Register_intent = Intent(this, Register_login::class.java)
        val goMain = Intent(this, SmartkeyMain::class.java)
        val goResetpage = Intent(this, Register_resetPw::class.java)

        val PostLogin = Retrofit_service.service

        //로그인 버튼
        val btn_login = findViewById<Button>(R.id.btn_login)
        val btn_register = findViewById<Button>(R.id.btn_register)
        val txt_resetPw = findViewById<TextView>(R.id.txt_resetPw)

        btn_login.setOnClickListener{
            //edit text로부터 입력된 값 받아온다.
            var id = findViewById<EditText>(R.id.edit_id).text.toString()
            var pw = findViewById<EditText>(R.id.edit_pw).text.toString()

            var idEnco = Base64.encodeToString(id.toByteArray(), Base64.NO_WRAP)
            var pwEnco = Base64.encodeToString(pw.toByteArray(), Base64.NO_WRAP)

            var loginInput = HashMap<String, String>()
            loginInput.put("userEmail", idEnco)
            loginInput.put("userPwd", pwEnco)

            PostLogin.postLogin(loginInput).enqueue(object : Callback<LoginInfo> {
                override fun onResponse(call: Call<LoginInfo>, response: Response<LoginInfo>) {
                    if(response.code() == 200){
                        CookieHandler().putUserEmail(id) //공유키 구분위함
                        Log.d("로그인","로그인 post 성공")
                        CookieHandler().getCookie(response.headers().toMap())
                        startActivity(goMain)
                        finish()
                    }
                }
                override fun onFailure(call: Call<LoginInfo>, t: Throwable) {
                    Log.d("로그인","t"+t.message)
                    //dialog("fail")
                }
            })
        }

        txt_resetPw.setOnClickListener{
            startActivity(goResetpage)
        }

        btn_register.setOnClickListener{
            startActivity(Register_intent)
        }
    }
}