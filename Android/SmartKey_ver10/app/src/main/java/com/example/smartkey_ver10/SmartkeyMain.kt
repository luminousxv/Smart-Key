package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyMain : AppCompatActivity() {

    val GetService = Retrofit_service.service
    val cookie = CookieHandler().setCookie()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_main)

        //쿠키세팅

        //리사이클러뷰
        val vlist = ArrayList<ViewItem>()

        lateinit var keyList : List<KeyInfo>
        var listSize: Int = 0


        //키 받아오기
        GetService.GetKeyList(cookieid = cookie).enqueue(object : Callback<GetKeyInfo> {
            override fun onResponse(call: Call<GetKeyInfo>, response: Response<GetKeyInfo>) {
                if(response.code()==200){
                    keyList = response.body()!!.message
                    listSize = keyList.size-1
                    Log.d("Test","Get 성공" + response.raw().toString())

                    //리사이클러뷰 아이템 생성
                    for(i in 0..listSize){
                        var keynum = keyList[i].SerialNum
                        var keyname = keyList[i].KeyName
                        vlist.add(ViewItem("","$keynum" , "$keyname"))
                    }
                    val adapter = RecyclerUserAdapter(vlist, {data->adapterOnClick(data)})
                    findViewById<RecyclerView>(R.id.recycleView).adapter = adapter
                }
                else Log.d("Test", "Get 실패")
            }
            override fun onFailure(call: Call<GetKeyInfo>, t: Throwable) {
                Log.d("getTest실패","t"+t.message)
            }
        })
    }

    //클릭 이벤트
    private fun adapterOnClick(data: ViewItem){
        val nexintent = Intent(this, SmartkeyDetailAct::class.java)
        nexintent.putExtra("serialnum", data.id)
        nexintent.putExtra("keyname", data.name)

        //다이얼로그 띄우기
        val dialog = SmartkeyPwDailog(this)
        dialog.Checkdialog()

        //다이얼로그 입력후 클릭 시
        dialog.setOnClickListener(object : SmartkeyPwDailog.OnDialogClickListener{
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
                            startActivity(nexintent)
                        }
                        else {
                            Log.d("response", response.raw().toString())
                            Toast.makeText(this@SmartkeyMain, "비밀번호가 틀렸습니다.",Toast.LENGTH_SHORT).show()}
                    }
                    override fun onFailure(call: Call<PostSmartPw>, t: Throwable) {
                        Log.d("SmartPwd실패","t"+t.message)
                    }
                })//postSmartPw 끝
            }
        })//다이얼로그 클릭이벤트 끝
    }
}