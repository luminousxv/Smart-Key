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

class Register_login : AppCompatActivity() {

    var isExistBlank = false
    var isPWSame = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_login)

        val Login_intent = Intent(this, MainActivity::class.java)
        val PostRegister = Retrofit_service.service
        val btn_ForCheck = findViewById<Button>(R.id.btn_register)
        var btn_Check = findViewById<Button>(R.id.btn_check)


        //회원정보 입력 후 인증번호 받기위한 메서드
        btn_ForCheck.setOnClickListener {

            val id = findViewById<EditText>(R.id.edit_id).text.toString()
            val pw = findViewById<EditText>(R.id.edit_pw).text.toString()
            val pw_re = findViewById<EditText>(R.id.edit_pw_re).text.toString()
            val birth = findViewById<EditText>(R.id.edit_birth).text.toString()
            val naMe = findViewById<EditText>(R.id.edit_name).text.toString()

            //유저가 항목을 다 채우지 않았을 경우
            if(id.isEmpty() || pw.isEmpty() || pw_re.isEmpty()){
                isExistBlank = true
            }
            else{
                if(pw==pw_re){isPWSame=true}
            }
            if(!isExistBlank &&isPWSame){ //전부 맞춰서 보냈을 경우

                var input = HashMap<String,String>()
                input.put("userEmail", id)
                input.put("userPwd", pw)
                input.put("userName", naMe)
                input.put("userBirth", birth)

                PostRegister.postUserInfo(input).enqueue(object : Callback<RegisterUserInfo> {
                    override fun onResponse(call: Call<RegisterUserInfo>, response: Response<RegisterUserInfo>) {

                        if(response.code() == 200){
                            CookieHandler().getCookie(response.headers().toMap()) //쿠키 받기
                            //put log
                            Log.d("회원가입post","success")
                        }
                    }
                    override fun onFailure(call: Call<RegisterUserInfo>, t: Throwable) {
                        Log.d("회원가입post","t"+t.message)
                    }
                })
            }
        }//end of btn_forcheck

        //인증번호 확인하는 메서드
        btn_Check.setOnClickListener {

            var vernum = findViewById<EditText>(R.id.edit_AuthNum).text.toString()
            var AuthNumInput = HashMap<String, String>()
            AuthNumInput.put("inputAuth",vernum)

            var cookie = CookieHandler().setCookie()
            PostRegister.postCheckAuth(cookieid = cookie, AuthNumInput).enqueue(object:
                Callback<CheckAuth> {
                override fun onResponse(Call: Call<CheckAuth>, response: Response<CheckAuth>) { //통신성공시

                    if(response.code()==200){
                        Log.d("인증키post","success")
                        startActivity(Login_intent)
                        finish()
                    }
                    else Log.d("인증키post","fail")
                }
                override fun onFailure(call: Call<CheckAuth>, t: Throwable) {  //아예 통신도 안될 때
                    Log.d("EmailTest","t"+t.message)
                }
            })
        }//end of btn_check

    }
}