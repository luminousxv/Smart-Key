package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyDetailAct : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_detail)

        val keynum = intent.getStringExtra("serialnum") //선택한 key의 serialnum
        val keyname = intent.getStringExtra("keyname") // 선택한 key의 이름

        findViewById<TextView>(R.id.nameSmartkey).text = keyname

        val btn_lock = findViewById<Button>(R.id.btn_Lock)
        val btn_unlock = findViewById<Button>(R.id.btn_Unlock)
        val btn_log = findViewById<Button>(R.id.btn_Log)
        //val btn_sharing = findViewById<Button>(R.id.btn_Sharing)
        val btn_Delete = findViewById<Button>(R.id.btn_Delete)

        //쿠키세팅
        var cookie = CookieHandler().setCookie()
        val service = Retrofit_service.service


        //잠금
        btn_lock.setOnClickListener {
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", "8")
            Keyinput.put("GPSLat", "5")

            service.postClose(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("LockPost","클로즈 성공")
                        Log.d("response", response.raw().toString())
                    } else {
                        Log.d("LockPost","이미닫혀있음")
                        Toast.makeText(this@SmartkeyDetailAct, "이미 닫혀있습니다.",Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("LockPost","t"+t.message)
                }
            })
        }//잠금 끝

        //열림
        btn_unlock.setOnClickListener {
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", "8")
            Keyinput.put("GPSLat", "5")

            service.postOpen(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("UnlockPost","오픈 성공")
                        Log.d("response", response.raw().toString())
                    } else {Toast.makeText(this@SmartkeyDetailAct, "이미 열려있습니다.",Toast.LENGTH_SHORT).show()
                        Log.d("UnlockPost","이미열려있음")
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("UnlockPost","t"+t.message)
                }
            })
        }//열림 끝

        //이력
        btn_log.setOnClickListener {
            val log_intent = Intent(this, SmartkeyLogAct::class.java)
            log_intent.putExtra("serialnum", keynum)
            log_intent.putExtra("keyname", keyname)
            startActivity(log_intent)
        }

        /*//공유하기
        btn_sharing.setOnClickListener {
            val sharing_intent = Intent(this, SharingAct::class.java)
            startActivity(sharing_intent)
        }*/

        //키 삭제하기
        btn_Delete.setOnClickListener {
            //다이얼로그 띄우기
            val main_intent = Intent(this, SmartkeyMain::class.java)
            val dialog = SmartkeyPwDialog(this)
            dialog.Checkdialog()

            //다이얼로그 입력후 클릭 시
            dialog.setOnClickListener(object : SmartkeyPwDialog.OnDialogClickListener{
                override fun onClicked(smartpw: String) {

                    var inputkey = HashMap<String, String>()
                    inputkey.put("smartPwd", smartpw)
                    inputkey.put("serialNum", keynum!!)

                    //삭제 전 smartpw 인증
                    service.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                        override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {
                            var rescode = response.raw().code
                            if(rescode == 200){
                                Log.d("SmartPwd인증","인증 성공")
                                Log.d("response", response.raw().toString())

                                //인증 성공 시, 삭제 포스트
                                var inputserNum = HashMap<String, String>()
                                inputserNum.put("serialNum", keynum!!)

                                service.postDelserialNum(cookieid = cookie, inputserNum).enqueue(object :
                                    Callback<PostserialNum> {
                                    override fun onResponse(call: Call<PostserialNum>, response: Response<PostserialNum>) {
                                        var rescode = response.raw().code
                                        if(rescode == 200) {
                                            Log.d("Delete키", "삭제 성공")
                                            Log.d("response", response.raw().toString())
                                            startActivity(main_intent)
                                            Toast.makeText(this@SmartkeyDetailAct, "$keyname 가 삭제되었습니다.",Toast.LENGTH_SHORT).show()
                                            finish()
                                        }
                                        else Log.d("Delete키","삭제 실패")
                                    }

                                    override fun onFailure(call: Call<PostserialNum>, t: Throwable) {
                                        Log.d("Delete 키 실패","t"+t.message)
                                    }
                                })//postDelKey 끝

                            }
                            else {Log.d("SmartPwd","인증실패")
                                Toast.makeText(this@SmartkeyDetailAct, "비밀번호가 틀렸습니다.",Toast.LENGTH_SHORT).show()}
                        }

                        override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                            Log.d("SmartPwd실패","t"+t.message)
                        }
                    })//postSmartPw 끝
                }
            })//다이얼로그 클릭이벤트 끝
        }//키 삭제버튼 끝
    }
}