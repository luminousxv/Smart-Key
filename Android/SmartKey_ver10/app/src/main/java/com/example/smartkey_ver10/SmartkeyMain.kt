package com.example.smartkey_ver10

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import androidx.recyclerview.widget.RecyclerView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SmartkeyMain : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_main)

        //쿠키세팅
        var cookie = CookieHandler().setCookie()
        //리사이클러뷰
        val vlist = ArrayList<ViewItem>()

        val GetService = Retrofit_service.service

        lateinit var keyList : List<KeyInfo>
        var listSize: Int = 0


        //키 받아오기
        GetService.GetKeyList(cookieid = cookie).enqueue(object : Callback<GetKeyInfo> {
            override fun onResponse(call: Call<GetKeyInfo>, response: Response<GetKeyInfo>) {
                if(response.isSuccessful()){
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
        startActivity(nexintent)
    }
}