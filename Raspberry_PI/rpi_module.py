
import RPi.GPIO as GPIO  # 라즈베리파이 GPIO 관련 모듈
import time                     # time 제어를 위한 라이브러리
import json                     # 서버 통신을 위한 json 라이브러리
import requests                 # 서버 요청 라이브러리
import os
import drivers  # lcd 조작을 위한 라이브러리
from time import sleep

pin = 18                        # servo모터 18번 핀 사용
GPIO.setmode(GPIO.BCM)          # GPIO 핀들의 번호 지정 규칙
GPIO.setup(pin, GPIO.OUT)       # 서보핀을 출력으로 지정
servo = GPIO.PWM(pin, 50)       # 50 Hz
servo.start(0)                  # 서보모터 초기값 0
open_angle = 9                  # 열림
close_angle = 6                 # 닫힘
state = ''
def doAngle(angle):
    GPIO.setup(pin, GPIO.OUT)   # 서보핀을 출력으로 설정
    servo.ChangeDutyCycle(angle)
    sleep(0.3)                  # 0.3 기다림
    GPIO.setup(pin, GPIO.IN)    # 서보핀을 입력으로 설정 (더이상 움직이지 않음)


display = drivers.Lcd()         # Lcd
try:

    while True:
        msg = '{"serialNum": "0000001"}'        # json에 저장되어 있는 rpi 시리얼 넘버
        j = json.loads(msg)                     # msg를 불러옴
        r = requests.get('http://20.194.28.30:80/Smart-Key/rpi/remote/', json=j)    # 서버 주소
        res = r.json()
        res_code = res["code"]                  # 서버에 저장되어 있는 code
        res_message = res["message"]            # 서버에 저장되어 있는 rpi 상태

        if res_code == 200:
            print("정상적으로 연결되었습니다.")
            if res_message == state:            # 현재 키 상태 비교
                continue                        # 동일하면 if문 탈출
            elif res_message == 'open':         # 현재 키 상태가 open 일때
                state = res_message
                doAngle(open_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: open", 1)
                sleep(1.5)
            elif res_message == 'close':        # 현재 키 상태가 close 일때
                state = res_message
                doAngle(close_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: close", 1)
                sleep(1.5)
        elif res_code == 400:                   # 존재하지 않는 키일 경우
            print("존재하지 않는 스마트키입니다.")
            doAngle(close_angle)
            display.lcd_display_string("This is a non-", 1)
            display.lcd_display_string("existent key", 2)
            sleep(1.5)
        elif res_code == 500:                   # DB 오류가 발생하였을 경우
            print("DB 오류가 발생했습니다.")
            doAngle(close_angle)
            display.lcd_display_string("DB error", 1)
            display.lcd_display_string("occurred", 2)
            sleep(1.5)
        else:                                   # 서버와 연결이 되지 않을 경우
            print("서버와 연결이 되지 않았습니다.")
            doAngle(close_angle)
            display.lcd_display_string("No connection", 1)
            display.lcd_display_string("to server", 2)
            sleep(1.5)
except KeyboardInterrupt:
    servo.stop()
GPIO.cleanup()                                  # GPIO 핀 초기화
