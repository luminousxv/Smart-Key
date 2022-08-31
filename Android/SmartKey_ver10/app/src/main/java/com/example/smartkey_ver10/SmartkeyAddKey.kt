package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.os.Message
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.UnsupportedEncodingException

class SmartkeyAddKey : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_add_key)

        val btn_findDivice = findViewById<Button>(R.id.btn_findDvice)
        val btn_post = findViewById<Button>(R.id.btn_addCheck)
        val btn_addCancel = findViewById<Button>(R.id.btn_addCancel)
        var text_serialNum = findViewById<TextView>(R.id.text_serialnum)
        var serial_Num : String? = null

        //작업 후 메인으로 이동
        val goMain = Intent(this, SmartkeyMain::class.java)


        //블루투스 다룰 객체 생성
        val bluetoothService = SmartkeyBluetoothSetting(this@SmartkeyAddKey)
        //http 통신
        val postService = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        //블루투스 세팅(페어링 된 기기만 표시 -> 연결할 기기 선택 -> 연결과 동시에 기기에 연결코드 '100' 전송)
        btn_findDivice.setOnClickListener {
            bluetoothService.bluetoothOn()
        }

        btn_post.setOnClickListener {

            Toast.makeText(this@SmartkeyAddKey,
                "serialNum $serial_Num", Toast.LENGTH_SHORT).show()

            var Smartkeyname = findViewById<EditText>(R.id.edit_keyName).text.toString()
            var SmartkeyPw = findViewById<EditText>(R.id.edit_smartPw).text.toString()
            var SmartkeyPwRe = findViewById<EditText>(R.id.edit_smartPwRe).text.toString()

            if(SmartkeyPw == SmartkeyPwRe){
                var keyInfoInput = HashMap<String, String>()
                keyInfoInput.put("serialNum", serial_Num!!)
                keyInfoInput.put("keyName",Smartkeyname)
                keyInfoInput.put("smartPwd",SmartkeyPw)

                postService.postKeyInfo(cookieid = cookie, keyInfoInput).enqueue(object : Callback<RegisterKeyInfo> {
                    override fun onResponse(call: Call<RegisterKeyInfo>, response: Response<RegisterKeyInfo>) {
                        if (response.code() == 200) {
                            Log.d("키등록", "등록 성공")
                            Toast.makeText(this@SmartkeyAddKey,
                                "키 등록을 완료하였습니다.", Toast.LENGTH_SHORT).show()
                            bluetoothService.registSuccess()
                            bluetoothService.bluetoothOff()
                            startActivity(goMain)
                            finish()
                        } else {
                            Log.d("키등록", "실패"+response.raw().toString())
                            Toast.makeText(this@SmartkeyAddKey,
                                "키 등록 정보를 다시 확인하세요 ${response.message()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<RegisterKeyInfo>, t: Throwable) {
                        Log.d("LockPost", "t" + t.message)
                    }
                })
            }
            else Toast.makeText(this@SmartkeyAddKey,
                "비밀번호를 확인하세요", Toast.LENGTH_SHORT).show()
        }

        btn_addCancel.setOnClickListener {
            bluetoothService.bluetoothOff()
            finish()
        }

        if(serial_Num == null){
            if(bluetoothService.mBluetoothAdapter != null){
                bluetoothService.mBluetoothHandler = object : Handler() {
                    override fun handleMessage(msg: Message) {
                        if (msg.what == SmartkeyBluetoothSetting.BT_MESSAGE_READ) {
                            var readMessage: String? = null
                            try {
                                readMessage = String(msg.obj as ByteArray)
                            } catch (e: UnsupportedEncodingException) {
                                e.printStackTrace()
                            }
                            var serial_num_temp = readMessage.toString().chunked(6)
                            serial_Num = serial_num_temp[0]

                            text_serialNum!!.text = readMessage
                            if(serial_Num != null){
                                SmartkeyBluetoothSetting.IsRunning = false //메시지 읽기 쓰레드 일시 정지
                            }
                        }
                    }
                }
            }
        }

    }
}