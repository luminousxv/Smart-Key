package com.example.smartkey_ver10

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class SharedPrefApp: Application() {
    companion object{
        lateinit var storj: PreferenceUtil
    }

    override fun onCreate() {
        storj = PreferenceUtil(applicationContext)
        super.onCreate()
    }
}


class PreferenceUtil(context: Context){
    private val prefs: SharedPreferences =
        context.getSharedPreferences("shared", Context.MODE_PRIVATE)

    fun getString(key:String, defValue:String):String{
        return prefs.getString(key, defValue).toString()
    }

    fun setString(key:String, str:String){
        prefs.edit().putString(key, str).apply()
    }
}