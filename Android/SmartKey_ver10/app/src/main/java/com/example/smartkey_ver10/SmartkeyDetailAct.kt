package com.example.smartkey_ver10

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyDetailAct : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_detail)

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")

        findViewById<TextView>(R.id.nameSmartkey).text = keyname

        val btn_lock = findViewById<Button>(R.id.btn_Lock)
        val btn_unlock = findViewById<Button>(R.id.btn_Unlock)
        val btn_log = findViewById<Button>(R.id.btn_Log)
        //val btn_sharing = findViewById<Button>(R.id.btn_Sharing)
        val btn_Delete = findViewById<Button>(R.id.btn_Delete)

        //쿠키세팅
        var cookie = CookieHandler().setCookie()
        val service = Retrofit_service.service


        //잠금 해제
        btn_lock.setOnClickListener {
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", "8")
            Keyinput.put("GPSLat", "5")

            service.postClose(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    if(response.isSuccessful()){
                        var rescode = response.raw().code
                        if(rescode == 200){
                            Log.d("Test","클로즈 성공")
                            Log.d("response", response.raw().toString())
                        }
                        else Log.d("Test","이미닫혀있음")
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("postTest실패","t"+t.message)
                }
            })
        }

        //열림
        btn_unlock.setOnClickListener {
            var Keyinput = HashMap<String, String>()
            Keyinput.put("serialNum", keynum!!)
            Keyinput.put("GPSLong", "8")
            Keyinput.put("GPSLat", "5")

            service.postOpen(cookieid = cookie, Keyinput).enqueue(object : Callback<P_op_cl> {
                override fun onResponse(call: Call<P_op_cl>, response: Response<P_op_cl>) {
                    if(response.isSuccessful()){
                        var rescode = response.raw().code
                        if(rescode == 200){
                            Log.d("Test","오픈 성공")
                            Log.d("response", response.raw().toString())
                        }
                        else Log.d("Test","이미열려있음")
                    }
                }
                override fun onFailure(call: Call<P_op_cl>, t: Throwable) {
                    Log.d("postTest실패","t"+t.message)
                }
            })
        }

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
        //삭제하기
        btn_Delete.setOnClickListener {
            var builder = AlertDialog.Builder(this)
            builder.setTitle("사용자 비밀번호를 입력해주세요")

            var dialview = layoutInflater.inflate(R.layout.delete_dialog, null)
            builder.setView(dialview)

            var listener = DialogInterface.OnCancelListener { p0 ->
                var alert = p0 as AlertDialog
                var edit: EditText? = alert.findViewById(R.id.edit_delpw)
            }
            //builder.setPositiveButton("확인", listener)
            builder.setNegativeButton("취소",null)

            builder.show()
        }
    }
}