package com.example.smartkey_ver10

import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.widget.Button
import android.widget.TableLayout
import android.widget.TableRow
import android.widget.TextView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

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

        findViewById<TextView>(R.id.tabletitle).text = keyname


        getservice.GetKeyLog(cookieid = cookie, sernum = keynum!!).enqueue(object : Callback<GetKeyrecord> {
            override fun onResponse(call: Call<GetKeyrecord>, response: Response<GetKeyrecord>) {
                if(response.isSuccessful()){
                    var rescode = response.raw().code
                    if(rescode == 200){
                        Log.d("SmartkeyLog","테이블 갯 성공")
                        logtable = response.body()!!.message
                        tablesize = logtable.size-1
                        for(i in 0..tablesize){
                            var time_text = TextView(this@SmartkeyLogAct)
                            time_text.gravity = Gravity.LEFT
                            var state_text = TextView(this@SmartkeyLogAct)
                            state_text.gravity = Gravity.LEFT
                            var method_text = TextView(this@SmartkeyLogAct)
                            state_text.gravity = Gravity.LEFT


                            time_text.text = logtable[i].Time
                            state_text.text = logtable[i].KeyState
                            method_text.text = logtable[i].Method


                            var tableLayout = findViewById<TableLayout>(R.id.table_layout)
                            var tableRow = TableRow(this@SmartkeyLogAct)

                            tableRow.addView(time_text)
                            tableRow.addView(state_text)
                            tableRow.addView(method_text)

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