from bluetooth import *  # 블루투스 모듈
import RPi.GPIO as GPIO  # 라즈베리파이 GPIO 관련 모듈
import time  # time 제어를 위한 라이브러리
import json  # 서버 통신을 위한 json 라이브러리
import requests  # 서버 요청 라이브러리
import os
import drivers  # lcd 조작을 위한 라이브러리
import serial, close_state, open_state  # 시리얼 번호와 키 잠금 상태 전송하기 위한 .py파일
from time import sleep

servo_pin = 18  # servo모터 18번 핀 사용
button_pin = 22
GPIO.setmode(GPIO.BCM)  # GPIO 핀들의 번호 지정 규칙
GPIO.setup(servo_pin, GPIO.OUT)  # 서보핀을 출력으로 지정
GPIO.setup(button_pin, GPIO.IN)
servo = GPIO.PWM(servo_pin, 50)  # 50 Hz
servo.start(0)  # 서보모터 초기값 0
open_angle = 3.5  # 열림
close_angle = 7  # 닫힘
state = ''
GPIO_TRIGGER = 24  # 초음파 거리 센서 트리거
GPIO_ECHO = 23  # 초음파 거리 센서 에코
GPIO.setup(GPIO_TRIGGER, GPIO.OUT)  # 트리거는 초음파를 내보내므로 출력 모드
GPIO.setup(GPIO_ECHO, GPIO.IN)  # 에코는 초음파를 수신하므로 입력 모드
startTime = time.time()  # 초음파 센서의 시작시간과 도착시간 체크
serialNum = b'0000001'  # 앱에 시리얼 넘버 전송하기 위한 숫자
receive_Num = b'100'    # 처음 기기등록
open_Num = b'200'       # 열린 상태
close_Num = b'300'      # 닫힌 상태
exit_Num = b'400'       # 블루투스 해지


def doAngle(angle):
    GPIO.setup(servo_pin, GPIO.OUT)  # 서보핀을 출력으로 설정
    servo.ChangeDutyCycle(angle)
    sleep(0.3)  # 0.3 기다림
    GPIO.setup(servo_pin, GPIO.IN)  # 서보핀을 입력으로 설정 (더이상 움직이지 않음)


display = drivers.Lcd()  # Lcd

uuid = "00001101-0000-1000-8000-00805F9B34FB"
server_sock = BluetoothSocket(RFCOMM)  # RFCOMM 포트를 통해 데이터 통신을 하기 위한 준비
server_sock.bind(('', PORT_ANY))
server_sock.listen(1)

port = server_sock.getsockname()[1]  # 연결된 소켓을 찾음
advertise_service(server_sock, "BtChat",
                  service_id=uuid,
                  service_classes=[uuid, SERIAL_PORT_CLASS],
                  profiles=[SERIAL_PORT_PROFILE])  # 블루투스 서비스를 Advertise
print("Waiting for connection : channel %d" % port)  # 클라이언트가 연결될 때까지 대기
client_sock, client_info = server_sock.accept()
print("accepted")
display
while True:                          # 초기 기기등록때 100을 수신하여 다음 동작으로 이동
    data = client_sock.recv(1024)
    print(data)
    if data == receive_Num:
        client_sock.send(serialNum)
        break

while True:
    a = serial.msg  # serial.py에 저장된 시리얼넘버 불러옴
    r = requests.get('http://3.35.57.189:80/Smart-Key/rpi/remote/', json=a)  # 서버 주소
    res = r.json()
    res_code = res["code"]  # 서버에 저장되어 있는 code
    res_message = res["message"]  # 서버에 저장되어 있는 rpi 상태
    GPIO.output(GPIO_TRIGGER, False)
    sleep(0.5)
    GPIO.output(GPIO_TRIGGER, True)
    sleep(0.00001)
    GPIO.output(GPIO_TRIGGER, False)

    while GPIO.input(GPIO_ECHO) == GPIO.LOW:  # 시작시간
        startTime = time.time()

    while GPIO.input(GPIO_ECHO) == GPIO.HIGH:  # 도착시간
        endTime = time.time()

    period = endTime - startTime
    distance = round(period * 17241, 2)  # 속도 = 거리/시간, 속도 = 340m/s, 거리 = distance, 시간 = period/2
    display.lcd_backlight(0)
    button_IO = GPIO.input(22)
    if res_code == 200:
        if res_message == state:  # 현재 키 상태 비교
            if distance <= 100:
                display.lcd_backlight(1)
            else:
                display.lcd_backlight(0)
            if button_IO == False:                          # 블루투스 사용 버튼 누를시
                display.lcd_clear()
                display.lcd_display_string("Bluetooth", 1)
                display.lcd_display_string("mode", 2)
                while True:
                    data1 = client_sock.recv(1024)          # 블루투스로 데이터를 수신한다.
                    print(data1)
                    if data1 == open_Num:                   # 200 즉 open을 수신하였을 경우
                        doAngle(open_angle)
                        display.lcd_clear()
                        display.lcd_display_string("Key_state: open", 1)
                        print("send [%s]" % open_Num)
                        client_sock.send(open_Num)
                        b = open_state.msg
                        r1 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/bluetooth/', json=b)
                        continue
                    elif data1 == close_Num:                # 300 즉 close를 수신하였을 경우
                        doAngle(close_angle)
                        display.lcd_clear()
                        display.lcd_display_string("Key_state: close", 1)
                        print("send [%s]" % close_Num)
                        client_sock.send(close_Num)
                        c = close_state.msg
                        r2 = requests.post('http://3.35.57.189:80/Smart-Key/rpi/bluetooth/', json=c)
                        continue
                    elif data1 == receive_Num:              # 100을 수신하면 위와 동일하게 시리얼 넘버를 전송
                        client_sock.send(serialNum)
                        continue
                    elif data1 == exit_Num:                 # 400을 수신하면 while문 탈출
                        break
            sleep(1.5)
            continue  # 동일하면 if문 탈출

        elif res_message == 'open':  # 현재 키 상태가 open 일때
            state = res_message
            if distance <= 100:
                display.lcd_backlight(1)
            else:
                display.lcd_backlight(0)
            doAngle(open_angle)
            display.lcd_clear()
            display.lcd_display_string("Key_state: open", 1)
            sleep(1.5)
        elif res_message == 'close':  # 현재 키 상태가 close 일때
            state = res_message
            if distance <= 100:
                display.lcd_backlight(1)
            else:
                display.lcd_backlight(0)
            doAngle(close_angle)
            display.lcd_clear()
            display.lcd_display_string("Key_state: close", 1)
            sleep(1.5)
    elif res_code == 400:  # 존재하지 않는 키일 경우
        print("존재하지 않는 스마트키입니다.")
        if distance <= 100:
            display.lcd_backlight(1)
        else:
            display.lcd_backlight(0)
        doAngle(close_angle)
        display.lcd_display_string("This is a non-", 1)
        display.lcd_display_string("existent key", 2)
        sleep(1.5)
    elif res_code == 500:  # DB 오류가 발생하였을 경우
        print("DB 오류가 발생했습니다.")
        if distance <= 100:
            display.lcd_backlight(1)
        else:
            display.lcd_backlight(0)
        doAngle(close_angle)
        display.lcd_display_string("DB error", 1)
        display.lcd_display_string("occurred", 2)
        sleep(1.5)
    else:  # 서버와 연결이 되지 않을 경우
        print("서버와 연결이 되지 않았습니다.")
        if distance <= 100:
            display.lcd_backlight(1)
        else:
            display.lcd_backlight(0)
        doAngle(close_angle)
        display.lcd_display_string("No connection", 1)
        display.lcd_display_string("to server", 2)
        sleep(1.5)
    print(res_code)
    if button_IO == False:
        display.lcd_display_string("Bluetooth", 1)
        display.lcd_display_string("mode", 2)
        while True:
            data1 = client_sock.recv(1024)
            print(data1)
            if data2 == open_Num:
                doAngle(open_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: open", 1)
                print("send [%s]" % open_Num)
                client_sock.send(open_Num)
                continue
            elif data2 == close_Num:
                doAngle(close_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: close", 1)
                print("send [%s]" % close_Num)
                client_sock.send(close_Num)
                continue
            elif data2 == exit_Num:
                break
            sleep(1.5)
GPIO.cleanup()

