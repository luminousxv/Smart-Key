package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val Register_intent = Intent(this, Register_login::class.java)
        val goMain = Intent(this, SmartkeyMain::class.java)
        //val Mainpage_intent = Intent(this, Mainpage::class.java)

        val PostLogin = Retrofit_service.service

        //로그인 버튼
        val btn_login = findViewById<Button>(R.id.btn_login)
        val btn_register = findViewById<Button>(R.id.btn_register)


        btn_login.setOnClickListener{
            //edit text로부터 입력된 값 받아온다.
            var id = findViewById<EditText>(R.id.edit_id).text.toString()
            var pw = findViewById<EditText>(R.id.edit_pw).text.toString()

            var loginInput = HashMap<String, String>()
            loginInput.put("userEmail", id)
            loginInput.put("userPwd", pw)

            PostLogin.postLogin(loginInput).enqueue(object : Callback<LoginInfo> {
                override fun onResponse(call: Call<LoginInfo>, response: Response<LoginInfo>) {

                    if(response.isSuccessful()){
                        var L_code =response.raw()
                        if(L_code.code == 200){
                            goMain.putExtra("userEmail", id) //공유키 구분위함
                            Log.d("로그인","로그인 post 성공")
                            CookieHandler().getCookie(response.headers().toMap())
                            startActivity(goMain)
                            finish()
                        }
                    }
                }

                override fun onFailure(call: Call<LoginInfo>, t: Throwable) {
                    Log.d("로그인","t"+t.message)
                    //dialog("fail")
                }
            })
        }


        btn_register.setOnClickListener{
            startActivity(Register_intent)
        }
    }
}