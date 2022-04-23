package com.example.smartkey_ver10

import android.util.Log

class CookieHandler {

    fun getCookie(header : Map<String, String>){

        if(header != null){
            var cookielist = header.get("Set-Cookie").toString()
            var cookstring: List<String> = cookielist.split(";")
            var sessionid: String = cookstring[0]

            SharedPrefApp.storj.setString("cookie",sessionid)
            Log.d("getCookie","getcookie성공")
        }
        else Log.d("getCookie","getcookie실패")
    }

    fun setCookie():String{
        var cookieid: String = SharedPrefApp.storj.getString("cookie","")
        Log.d("setCookie","setcookie성공"+cookieid)
        return cookieid
    }

    fun putUserEmail(Email: String){
        SharedPrefApp.storj.setString("UserEmail", Email)
    }

    fun setUserEmail():String{
        var email = SharedPrefApp.storj.getString("UserEmail","")
        return email
    }

}