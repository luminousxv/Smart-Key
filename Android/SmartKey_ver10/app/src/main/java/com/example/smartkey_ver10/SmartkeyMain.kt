package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyMain : AppCompatActivity() {

    //쿠키세팅
    val GetService = Retrofit_service.service
    val cookie = CookieHandler().setCookie()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_main)

        val userEmail = intent.getStringExtra("userEmail") //공유키 구분

        val addkey_intent = Intent(this, SmartkeyAddKey::class.java)
        val btn_addKey = findViewById<Button>(R.id.btn_addkey)


        //기기이동 버튼
        btn_addKey.setOnClickListener { startActivity(addkey_intent)}

        //리사이클러뷰
        val registered_list = ArrayList<ViewItem>()
        val shared_list = ArrayList<ViewItem>()

        lateinit var keyList : List<KeyInfo>
        var listSize: Int = 0


        //키 받아오기
        GetService.GetKeyList(cookieid = cookie).enqueue(object : Callback<GetKeyInfo> {
            override fun onResponse(call: Call<GetKeyInfo>, response: Response<GetKeyInfo>) {
                if(response.code()==200){
                    keyList = response.body()!!.message
                    listSize = keyList.size-1
                    Log.d("SmartkeyGet","Get 성공" + response.raw().toString())
                    Log.d("sss",response.body().toString())
                    Log.d("id",userEmail.toString())

                    //리사이클러뷰 아이템 생성
                    for(i in 0..listSize){
                        if(keyList[i].UserID == userEmail.toString()){ //직접 등록한 스마트키
                            var keynum = keyList[i].SerialNum
                            var keyname = keyList[i].KeyName
                            registered_list.add(ViewItem("","$keynum" , "$keyname"))
                        } else{                             //공유받은 스마트키
                            var keynum = keyList[i].SerialNum
                            var keyname = keyList[i].KeyName
                            shared_list.add(ViewItem("","$keynum" , "$keyname"))
                        }
                    }
                }
                else Log.d("SmartkeyGet", "Get 실패")
            }
            override fun onFailure(call: Call<GetKeyInfo>, t: Throwable) {
                Log.d("SmartkeyGet","t"+t.message)
            }
        }) //키받아오기 끝

        val reg_adapter = RecyclerUserAdapter(registered_list,
            {data->adapterOnClick(data,"0")})
        findViewById<RecyclerView>(R.id.registered_recycleView).adapter = reg_adapter

        val shared_adapter = RecyclerUserAdapter(shared_list,
            {data->adapterOnClick(data,"1")})
        findViewById<RecyclerView>(R.id.shared_recycleView).adapter = shared_adapter
    }

    //클릭 이벤트
    private fun adapterOnClick(data: ViewItem, shared: String){

        val nexintent = Intent(this, SmartkeyDetailAct::class.java)

        //다이얼로그 띄우기
        val dialog = SmartkeyPwDialog(this)
        dialog.Checkdialog_smpw()

        //다이얼로그 입력후 클릭 시
        dialog.setOnClickListener(object : SmartkeyPwDialog.OnDialogClickListener{
            override fun onClicked(smartpw: String) {

                var inputkey = HashMap<String, String>()
                inputkey.put("smartPwd", smartpw)
                inputkey.put("serialNum", data.id)

                //삭제 전 smartpw 인증
                GetService.postSmartPw(cookieid = cookie, inputkey).enqueue(object : Callback<PostSmartPw> {
                    override fun onResponse(call: Call<PostSmartPw>, response: Response<PostSmartPw>) {
                        var rescode = response.raw().code
                        if (rescode == 200) {
                            Log.d("SmartPwd인증", "인증 성공")
                            Log.d("response", response.raw().toString())
                            nexintent.putExtra("shared", shared)
                            nexintent.putExtra("serialnum", data.id)
                            nexintent.putExtra("keyname", data.name)
                            startActivity(nexintent)
                        }
                        else {
                            Log.d("response", response.raw().toString())
                            Toast.makeText(this@SmartkeyMain, "비밀번호가 틀렸습니다.",Toast.LENGTH_SHORT).show()}
                    }
                    override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                        Log.d("SmartPwd인증","t"+t.message)
                    }
                })//postSmartPw 끝
            }
        })//다이얼로그 클릭이벤트 끝
    }
}