package com.example.smartkey_ver10

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeySharingAct : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_sharing)

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")
        val postservice = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        val btn_cancel = findViewById<Button>(R.id.btn_sharingCancel)
        val btn_OK = findViewById<Button>(R.id.btn_sharingOK)

        //취소 닫기
        btn_cancel.setOnClickListener { finish() }

        //ok시
        btn_OK.setOnClickListener {
            var edit_email = findViewById<EditText>(R.id.edit_toshareEmail).text.toString()

            var input = HashMap<String,String>()
            input.put("serialNum", keynum!!)
            input.put("shareEmail", edit_email)

            postservice.postSharedinfo(cookieid = cookie, input).enqueue(object : Callback<PostSharedInfo> {
                override fun onResponse(call: Call<PostSharedInfo>, response: Response<PostSharedInfo>) {
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("sharePost","공유 성공")
                        Log.d("response", response.raw().toString())
                        Toast.makeText(this@SmartkeySharingAct, "$keyname 의 공유가 완료되었습니다.",
                            Toast.LENGTH_SHORT).show()
                        finish()

                    } else {
                        Log.d("sharePost","공유 실패")
                        Log.d("response", response.raw().toString())
                        Toast.makeText(this@SmartkeySharingAct, "이미 공유가 되어있거나 이메일이 올바르지 않습니다.",
                            Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<PostSharedInfo>, t: Throwable) {
                    Log.d("LockPost","t"+t.message)
                }
            })
        }
    }
}