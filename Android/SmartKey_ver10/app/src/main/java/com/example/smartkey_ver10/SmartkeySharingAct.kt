package com.example.smartkey_ver10

import android.content.Intent
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

    //쿠키, 레트로핏 세팅
    val postservice = Retrofit_service.service
    var cookie = CookieHandler().setCookie()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_sharing)

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")

        val btn_cancel = findViewById<Button>(R.id.btn_sharingCancel)
        val btn_OK = findViewById<Button>(R.id.btn_sharingOK)

        val go_main = Intent(this, SmartkeyMain::class.java)

        //취소 닫기
        btn_cancel.setOnClickListener { finish() }

        //ok시
        btn_OK.setOnClickListener {

            //다이얼로그 띄우기
            val dialog = SmartkeyDialog(this)
            dialog.Checkdialog_smpw()

            //다이얼로그 입력후 클릭 시
            dialog.setOnClickListener(object : SmartkeyDialog.OnDialogClickListener{
                override fun onClicked(smartpw: String) {

                    var inputkey = HashMap<String, String>()
                    inputkey.put("smartPwd", smartpw)
                    inputkey.put("serialNum", keynum!!)

                    //공유 전 smartpw 인증
                    postservice.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                        override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {

                            if(response.raw().code == 200){
                                Log.d("SmartPwd인증(공유)","인증 성공")
                                Log.d("response", response.raw().toString())

                                var edit_email = findViewById<EditText>(R.id.edit_toshareEmail).text.toString()

                                var input = HashMap<String,String>()
                                input.put("serialNum", keynum!!)
                                input.put("shareEmail", edit_email)

                                //공유정보 포스트
                                postservice.postSharedinfo(cookieid = cookie, input).enqueue(object : Callback<PostSharedInfo> {
                                    override fun onResponse(call: Call<PostSharedInfo>, response: Response<PostSharedInfo>) {

                                        if(response.raw().code == 200){
                                            Log.d("sharePost","공유 성공")
                                            Log.d("response", response.raw().toString())
                                            Toast.makeText(this@SmartkeySharingAct,
                                                "$keyname 이 $edit_email 에게 공유 되었습니다.", Toast.LENGTH_SHORT).show()
                                            startActivity(go_main)
                                            finish()

                                        } else {
                                            Log.d("sharePost","공유 실패")
                                            Log.d("response", response.raw().toString())
                                            Toast.makeText(this@SmartkeySharingAct,
                                                "이메일을 다시 확인하세요", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                    override fun onFailure(call: Call<PostSharedInfo>, t: Throwable) {
                                        Log.d("LockPost","t"+t.message)
                                    }
                                })//공유 포스트 끝

                            }
                            else {Log.d("SmartPwd인증(공유)","인증실패")
                                Toast.makeText(this@SmartkeySharingAct,
                                    "비밀번호를 확인하세요.", Toast.LENGTH_SHORT).show()}
                        }

                        override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                            Log.d("SmartPwd실패","t"+t.message)
                        }
                    })//postSmartPw 끝
                }
            })//다이얼로그 클릭이벤트 끝

        }
    }
}



