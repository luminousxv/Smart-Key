package com.example.smartkey_ver10

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object Retrofit_service {

    private const val baseUrl = "http://3.35.57.189:80/Smart-Key/"
    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val service = retrofit.create(Retrofit_Interface::class.java)

}