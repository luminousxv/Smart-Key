package com.example.smartkey_ver10

import android.content.Context
import android.content.Intent
import android.location.Address
import android.location.Geocoder
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.webkit.WebSettings
import android.widget.Button
import android.widget.TableLayout
import android.widget.TableRow
import android.widget.TextView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException

class SmartkeyLogAct : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smartkey_log)

        val btn_finish = findViewById<Button>(R.id.btn_finish)
        val getservice = Retrofit_service.service
        var cookie = CookieHandler().setCookie()

        val keynum = intent.getStringExtra("serialnum")
        val keyname = intent.getStringExtra("keyname")
        Log.d("keynum",keynum!!)

        lateinit var logtable : List<KeyLog>
        var tablesize: Int = 0

        val geocoder = Geocoder(this)
        var addrlist : List<Address>? = null

        findViewById<TextView>(R.id.tabletitle).text = keyname

        getservice.GetKeyLog(cookieid = cookie, sernum = keynum!!).enqueue(object : Callback<GetKeyrecord> {
            override fun onResponse(call: Call<GetKeyrecord>, response: Response<GetKeyrecord>) {
                if(response.isSuccessful()){
                    var rescode = response.raw().code
                    if(rescode == 200){

                        //Get 성공 시 테이블 레이아웃 생성

                        Log.d("SmartkeyLog","테이블 갯 성공")
                        logtable = response.body()!!.message

                        tablesize = logtable.size-1

                        //테이블에 들어갈 내용 기록(최근순)
                        for(i in tablesize..0){

                            var d1 = 0.0
                            var d2 = 0.0

                            var time_text = TextView(this@SmartkeyLogAct)
                            time_text.gravity = Gravity.CENTER
                            var state_text = TextView(this@SmartkeyLogAct)
                            state_text.gravity = Gravity.CENTER
                            var method_text = TextView(this@SmartkeyLogAct)
                            method_text.gravity = Gravity.CENTER
                            var gps_text = TextView(this@SmartkeyLogAct)
                            gps_text.gravity = Gravity.CENTER

                            //타임스탬프를 두줄에 나누어서 표현
                            var temp_time_0 = logtable[i].Time.chunked(11)
                            var temp_time_1 = temp_time_0[0].chunked(10) //.지우기
                            var timeT = temp_time_1[0]+"\n"+temp_time_0[1]

                            time_text.text = timeT
                            state_text.text = logtable[i].KeyState

                            if(logtable[i].Method.length > 10){
                                var temp_method = logtable[i].Method.chunked(10)
                                var methodM = temp_method[0]+"\n"+temp_method[1]+"\n"+temp_method[2]
                                method_text.text = methodM
                            }
                            else method_text.text = logtable[i].Method

                            //위치정보 테이블에 기록

                            d1 = logtable[i].GPSLat // 위도
                            d2 = logtable[i].GPSLong // 경도
                            Log.d("gps", "$d1, $d2")

                            if(d1 == 0.0 && d2 == 0.0){
                                gps_text.text = " "
                            }
                            else {
                                addrlist = geocoder.getFromLocation(d1, d2, 5)
                                if (addrlist != null) {
                                    if (addrlist?.size == 0) {
                                        gps_text.text = "해당 주소 없음"
                                    } else gps_text.text = addrlist!!.get(0).locality.toString()
                                }
                            }

                            var tableLayout = findViewById<TableLayout>(R.id.table_layout)
                            var tableRow = TableRow(this@SmartkeyLogAct)

                            tableRow.addView(time_text)
                            tableRow.addView(state_text)
                            tableRow.addView(method_text)
                            tableRow.addView(gps_text)

                            tableLayout.addView(tableRow)
                        }
                    }
                }
            }
            override fun onFailure(call: Call<GetKeyrecord>, t: Throwable) {
                Log.d("SmartkeyLog","t"+t.message)
            }
        })

        btn_finish.setOnClickListener {
            finish()
        }
    }
}