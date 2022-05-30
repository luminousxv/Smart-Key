package com.example.smartkey_ver10

import retrofit2.Call
import retrofit2.http.*

interface Retrofit_Interface {

    /*--------------------------------Post--------------------------------------*/
    @FormUrlEncoded
    @POST("user/login/")
    fun postLogin(@FieldMap fields: HashMap<String, String>): Call<LoginInfo>

    @FormUrlEncoded
    @POST("user/join/email-verification/")
    fun postUserInfo(@FieldMap fields: HashMap<String, String>): Call<RegisterUserInfo>

    @FormUrlEncoded
    @POST("user/join/join_success/")
    fun postCheckAuth(@Header("Cookie") cookieid: String,
                   @FieldMap fields: HashMap<String, String>): Call<CheckAuth>

    @FormUrlEncoded
    @POST("main/register_key")
    fun postKeyInfo(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<RegisterKeyInfo>

    @FormUrlEncoded
    @POST("main/open_key/")
    fun postOpen(@Header("Cookie") cookieid: String,
                 @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    @FormUrlEncoded
    @POST("main/close_key/")
    fun postClose(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<P_op_cl>

    @FormUrlEncoded
    @POST("main/mode/")
    fun postMode(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostserialNum>

    @FormUrlEncoded
    @POST("main/key_pw/")
    fun postSmartPw(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostSmartPw>

    @FormUrlEncoded
    @POST("main/delete_key/")
    fun postDelserialNum(@Header("Cookie") cookieid: String,
                  @FieldMap fields: HashMap<String, String>): Call<PostserialNum>

    @FormUrlEncoded
    @POST("main/share_key/register/")
    fun postSharedinfo(@Header("Cookie") cookieid: String,
                       @FieldMap fields: HashMap<String, String>): Call<PostSharedInfo>

    @FormUrlEncoded
    @POST("main/share_key/delete/")
    fun postDeleteShared(@Header("Cookie") cookieid: String,
                       @FieldMap fields: HashMap<String, String>): Call<PostserialNum>

    @FormUrlEncoded
    @POST("user/reset/email/")
    fun postForResetUserinfo(@FieldMap fields: HashMap<String, String>): Call<PostForResetInfo>

    @FormUrlEncoded
    @POST("user/reset/verification/")
    fun postForResetCheckAuth(@Header("Cookie") cookieid: String,
                      @FieldMap fields: HashMap<String, String>): Call<CheckAuth>

    @FormUrlEncoded
    @POST("user/reset/change_pw/")
    fun postResetPw(@Header("Cookie") cookieid: String,
                            @FieldMap fields: HashMap<String, String>): Call<PostResetPW>

    /*-----------------------------------Get------------------------------------*/
    @GET("main/view_keylist/")
    fun GetKeyList(@Header("Cookie") cookieid: String): Call<GetKeyInfo>

    @GET("main/view_keyrecord/")
    fun GetKeyLog(@Header("Cookie") cookieid: String,
                  @Query("serialNum", encoded = true) sernum:String): Call<GetKeyrecord>

    @GET("main/view_keyrecord/image/")
    fun GetSecurityImage(@Header("Cookie") cookieid: String,
                        @Query("serialNum") sernum: String,
                        @Query("time") time: String): Call<GetSecuImg>

}