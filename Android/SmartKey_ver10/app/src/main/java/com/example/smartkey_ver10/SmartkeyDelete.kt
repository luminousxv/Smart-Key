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

class SmartkeyDelete : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_delete)

        val Delservice = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        val keynum = intent.getStringExtra("serialnum")

        val btnDel = findViewById<Button>(R.id.btn_delok)
        val btnCancel = findViewById<Button>(R.id.btn_delcancel)

        btnDel.setOnClickListener {
            var smartpw = findViewById<EditText>(R.id.edit_delpw).text.toString()

            var inputkey = HashMap<String, String>()
            inputkey.put("serialNum", keynum!!)
            inputkey.put("smartPwd", smartpw)
            val main_intent = Intent(this, SmartkeyMain::class.java)

            //삭제 전 smartpw 인증
            Delservice.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("SmartPwd인증","인증 성공")
                        Log.d("response", response.raw().toString())

                        //인증 성공 시, 삭제 포스트
                        var inputserNum = HashMap<String, String>()
                        inputserNum.put("serialNum", keynum!!)

                        Delservice.postDelserialNum(cookieid = cookie, inputserNum).enqueue(object :
                            Callback<PostserialNum> {
                            override fun onResponse(call: Call<PostserialNum>, response: Response<PostserialNum>) {
                                var rescode = response.raw().code
                                if(rescode == 200) {
                                    Log.d("Delete키", "삭제 성공")
                                    Log.d("response", response.raw().toString())
                                    startActivity(main_intent)
                                    finish()
                                }
                                else Log.d("Delete키","삭제 실패")
                            }

                            override fun onFailure(call: Call<PostserialNum>, t: Throwable) {
                                Log.d("Delete 키 실패","t"+t.message)
                            }
                        })//postDelKey 끝

                    }
                    else Log.d("SmartPwd","인증실패")
                }

                override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                    Log.d("SmartPwd실패","t"+t.message)
                }
            })//postSmartPw 끝
        }
    }
}