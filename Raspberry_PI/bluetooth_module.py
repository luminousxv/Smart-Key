from bluetooth import *  # 블루투스 모듈
import RPi.GPIO as GPIO  # 라즈베리파이 GPIO 관련 모듈
import time                     # time 제어를 위한 라이브러리
import json                     # 서버 통신을 위한 json 라이브러리
import requests                 # 서버 요청 라이브러리
import os
import drivers                  # lcd 조작을 위한 라이브러리
import serial, close_state, open_state   #시리얼 번호와 키 잠금 상태 전송하기 위한 .py파일
from time import sleep

servo_pin = 18                        # servo모터 18번 핀 사용
GPIO.setmode(GPIO.BCM)          # GPIO 핀들의 번호 지정 규칙
GPIO.setup(servo_pin, GPIO.OUT)       # 서보핀을 출력으로 지정
servo = GPIO.PWM(servo_pin, 50)       # 50 Hz
servo.start(0)                  # 서보모터 초기값 0
open_angle = 3.5                  # 열림
close_angle = 7                # 닫힘
state = ''
GPIO_TRIGGER = 24               # 초음파 거리 센서 트리거
GPIO_ECHO = 23                  # 초음파 거리 센서 에코
GPIO.setup(GPIO_TRIGGER, GPIO.OUT)  # 트리거는 초음파를 내보내므로 출력 모드
GPIO.setup(GPIO_ECHO, GPIO.IN)       # 에코는 초음파를 수신하므로 입력 모드
startTime = time.time()               # 초음파 센서의 시작시간과 도착시간 체크
serialNum = b'001001'                 # 앱에 시리얼 넘버 전송하기 위한 숫자
receive_Num = b'100'
open_Num = b'200'
close_Num = b'300'
def doAngle(angle):
    GPIO.setup(servo_pin, GPIO.OUT)      # 서보핀을 출력으로 설정
    servo.ChangeDutyCycle(angle)
    sleep(0.3)                          # 0.3 기다림
    GPIO.setup(servo_pin, GPIO.IN)      # 서보핀을 입력으로 설정 (더이상 움직이지 않음)


display = drivers.Lcd()         # Lcd

def receiveMsg():

    uuid = "00001101-0000-1000-8000-00805F9B34FB"
    server_sock=BluetoothSocket( RFCOMM )       # RFCOMM 포트를 통해 데이터 통신을 하기 위한 준비
    server_sock.bind(('',PORT_ANY))
    server_sock.listen(1)

    port = server_sock.getsockname()[1]         # 연결된 소켓을 찾음
    advertise_service( server_sock, "BtChat",
            service_id = uuid,
            service_classes = [ uuid, SERIAL_PORT_CLASS ],
            profiles = [ SERIAL_PORT_PROFILE ] )                # 블루투스 서비스를 Advertise
    print("Waiting for connection : channel %d" % port)         # 클라이언트가 연결될 때까지 대기
    client_sock, client_info = server_sock.accept()
    print('accepted')
    client_sock.send(serialNum)                                 # 블루투스가 연결되면 시리얼 번호를 먼저 보냄
    while True:
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
        display.lcd_backlight(1)
        try:
            data = client_sock.recv(1024)                           # 앱을 통해 정보를 수신
            print("received [%s]" % data)
            if data == open_Num:                                    # 열림 상태를 수신하였을 때
                doAngle(open_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: open", 1)
                print("send [%s]" % data)
                client_sock.send(data)
            elif data == close_Num:                                 # 닫힘 상태를 수신하였을 때 
                doAngle(close_angle)
                display.lcd_clear()
                display.lcd_display_string("Key_state: close", 1)
                print("send [%s]" % data)
                client_sock.send(data)
            else :
                continue
        except IOError:
            print("disconnected")
            client_sock.close()
            server_sock.close()
            print("all done")

        except KeyboardInterrupt:
            print("disconnected")
            client_sock.close()
            server_sock.close()
            print("all done")
            break
receiveMsg()


