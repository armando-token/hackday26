# THT02_User_Manual

> Source PDF: `THT02 user's manual v1.1.pdf`
> Converted for agent/API Markdown consumption. Prefer this file over PDF parsing.

---

TZ THT-02 Temperature and humidity Sensor User's Manual V1.0         Mach 18th, 2021




                        TZ THT-02
               Temperature and humidity Sensor
                       User's Manual
                                                         V1.1




                                                               -1-
TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                              Mach 18th, 2021


1 Overview
 The THT-02 temperature and humidity sensor is designed based on the RS-485 communication interface,
 compatible with the standard Modbus-RTU protocol, and can be connected to the Modbus network to
 achieve temperature and humidity measurement and monitoring.

 The THT-02 sensitive element uses SHT30, a newly designed CMOSens chip, an improved capacitive
 humidity sensor element and a standard energy gap temperature sensor element. Its performance has been
 greatly improved or even exceeds the previous generation of sensors (SHT1x and SHT7x). ) Reliability
 level to make its performance in high humidity environments more stable.

 THT-02 adopts the DIP switch to set the address, which avoids the need to set the address with the upper
 computer in advance. It is simple and convenient to maintain and replace.

 THT-02 has excellent long-term stability, low latency, low power consumption, strong resistance to
 chemical pollution and excellent repeatability. It is used for accurate temperature and humidity relative
 measurement in HVAC, communication equipment rooms, warehouse buildings, and automatic control
 applications. The ideal solution for humidity.


2 Features
 ■ Low power consumption
 ■ Fully calibrated
 ■ High precision and good consistency
 ■ Long-term stability, low drift
 ■ Humidity full range temperature compensation
 ■ Standard Modbus-RTU protocol
 ■ Strong interface defense capability and stable communication


3 Application areas
 Generally used in indoor clean environment, such as：
 ■ HVAC
 ■ Building automation
 ■ Laboratory, hospital, library
 ■ Storage and production facilities in the pharmaceutical, paper, food and electronics industries




                                                               -2-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                    Mach 18th, 2021


4 Technical Data

4.1 Power supply

Supply voltage                       DC 5～24V
Current                              5mA



4.2 RS-485 interface
Transmission rate                    Optional 4800bps / 9600bps / 19200bps



4.3 Transmission distance
The standard maximum transmission distance is about 1200 meters depending on the use environment,
transmission material and transmission rate

Number of theoretical nodes 32



4.4 Temperature parameter
 Sensing element                     SHT30
 Measuring range                     -40～125℃
 Resolution                          0.1℃
 Measurement accuracy                ±0.3℃(0~60℃); ±0.5°C for other range



4.5 Humidity parameters
 Sensing element                     SHT3X
 Working range                       5～95%RH
 Resolution                          0.1%RH
 Measurement Accuracy                ±2%(10%~90%RH); ±5% for other range
 Hysteresis                          < ±0.8%RH
 Response time                       About 8s (from 33%RH to 75%RH, in flowing
                                     air)
 Long-term stability                 <±0.25%RH/year (under no pollution）




                                                                -3-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                               Mach 18th, 2021

4.6 Environmental conditions

working environment                                               -40～85℃/ 5～95%RH(Non-condensing）
Storage environment                                               -40～85℃/ 5～95%RH(Non-condensing）



4.7 Lead description

    Lead         Label       Function description
   Green            B-       RS485 interface B-
   Yellow           A+       RS485interface A+
   Black          GND        Public ground (connect to the negative end of the power supply when DC
                             power is supplied)

     Red            V+       Power supply positive (connect to the positive end of the power supply when
                             DC power is supplied)



4.8 Schematic diagram of connection with PC




  Note:
  When setting up a RS485 network, pay attention to the RS485 grounding treatment to eliminate the
  common mode voltage. Suggest to connect the common ground of each sensor together, and then connect
  it to the ground wire of the RS-232/RS-485 transverter.
  To connect, you can use the shielding layer of the shielded wire as the ground wire.




                                                                -4-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                              Mach 18th, 2021


5 DIP switch and address code




  Note: The above picture is a schematic diagram of the DIP switch. The DIP switch has 8 DIP positions.
  The corresponding numbers from 1 to 8 are 128, 64, 32, 16, 8, 4, 2, 1, and these values are added together
  as the address code. As shown in the figure above, bits 1, 3, and 4 are in the ON position, so the address
  code is 128+32+16=176, that is, the address code is 176




  The above figure is a schematic diagram of the correct steps to open the DIP switch, please follow the
  above steps to open the DIP switch to set the address

  Note:
  You can specify when ordering, we will preset it for you.


6 Protocol
  For the Modbus-RTU protocol, please refer to the relevant information, here is only a brief introduction.


6.1 Data frame format

           Start bit                   Data bit                   Parity bit    Stop bit
              1                           8                           0            1

  Note:
  The above is the default format of the sensor. If you need other formats, please specify when ordering.


6.2 RTU message frame format

   THT-02 follows the RTU information frame protocol. In order to ensure the integrity of the information

                                                                -5-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                               Mach 18th, 2021
   frame, a pause time of 3.5 characters or more is required at the beginning and end of each information
   frame (T1-T2-T3-T4, this time can be based on the wave Calculated by special rate), each byte of the
   information frame needs to be transmitted continuously. If there is a pause time greater than 1.5
   characters, the sensor will treat it as invalid information and will not respond.


6.3 Information frame format

     Start               address         function code            Data area   CRC check        end
 T1-T2-T3-T4              1byte              1byte                 N byte       2byte      T1-T2-T3-T4



6.4 Register definition


 Register      Meaning                   Description                                  Read and write
 Address
 0             Temperature               The unit is 0.1 degree, MSB First, Read only
                                         complement format, 7FFF H means the
                                         sensor is abnormal
 1             Relative humidity         The unit is 0.1%, MSB First,complement Read only
                                         format, 7FFF H means the sensor is abnormal
 2             Reserved 1                                                            Read only
 3             Reserved 2                                                            Read only
 4             Address code              Set by DIP switch                           Read only
 5             Baud rate                 Support 4800、9600、19200                     Can read and write
 6             Hardware version                                                       Read only
 7             Software version                                                       Read only

6.5 Address setting
  You can specify when ordering, we will preset it for you, or you can modify it by yourself through the
  dial switch

6.6 Baud rate setting
  You can specify when ordering, we will preset it for you, or you can modify it by yourself through the
  serial port assistant.




                                                                -6-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                                      Mach 18th, 2021




6.7 Host reads sensor information (function code 03)
  The sensor allows the host to use the function code 03 to read the temperature and humidity measurement
  value of the sensor and other information. The information frame format of the 03 code is as follows：

Host request information frame                                    Sensor response information frame

      Field Description                   Example                             Field Description         Example
Slave address                               01                        Slave address                       01
Function code                               03                        Function code                       03
Register address high byte                  00                        Return the number of bytes          10
Register address low byte                   00                        Temperature data high byte          00
High byte of query quantity                 00                        Temperature data low byte           FA
Low byte of query quantity                  08                        Humidity data high byte             02
CRC check code low byte                     44                        Low byte of humidity data           58
CRC check code high byte                    0C                        1 high byte reserved                00
                                                                      1 low byte reserved                 00
                                                                      2 high byte reserved                00
                                                                      2 low byte reserved                 00
                                                                      Address code high byte              00
                                                                      Address code low byte               01
                                                                      Baud rate high byte                 25
                                                                -7-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                                      Mach 18th, 2021
                                                                      Baud rate low byte                   80
                                                                      Hardware version high byte           06
                                                                      Hardware version low byte            00
                                                                      Software version high byte           00
                                                                      Software version low byte            0A
                                                                      CRC check code low byte              D4
  Data analysis
                                                                      CRC check code high byte             64

  Temperature = 00FAH = 250 / 10 = 25.0℃；
  Humidity = 0258H = 600 / 10 = 60.0%RH；
  Reserved 1 = 0000H;
  Reserved 2 = 0000H;
  Address code = 0001H = 1;
  Baud rate = 2580H = 9600;
  Hardware version = 0600H;
  Software version = 000AH = 10 = V1.0;

  Note! If users only want to read the temperature and humidity or other registers, they only need to read
  the corresponding registers.

6.8 Host setting sensor information (function code 06)
  This machine can currently set the baud rate (register address is 0005H), and the message frame format is
  as follows:


   Host request information frame                               Sensor response information frame
      Field description                  Example                             Field description         Example
 Slave address                             01                         Slave address                      01
 Function code                             06                         Function code                      06
 Register address high byte                00                         Register address high byte         00
 Register address low byte                 05                         Register address low byte          05
 Set value high byte                       25                         Set value high byte                25
 Set value low byte                        80                         Set value low byte                 80
 CRC check code low byte                   82                         CRC check code low byte            82
 CRC check code high byte                  FB                         CRC check code high byte           FB




 Data analysis: Set the baud rate to 9600

6.9 Abnormal response
   When the host sends request information to the sensor, various errors may occur. At this time, the sensor
   sets the highest position of the function code to 1, and then returns an error code. The host can determine
   whether an error has occurred by detecting whether the highest bit of the function code is 1.


                                                                -8-
 TZ THT-02 Temperature and humidity Sensor User's Manual V1.0                                  Mach 18th, 2021

 Return format

     Slave address               Function code              error code    CRC check
        1 byte                      1 byte                    1 byte        2 byte



Error code

  01：Illegal function code
  02：Illegal data address
  03: Illegal data value

6.10 CRC check code
  RTU mode uses CRC-16 check, the check code occupies 2 bytes, if the check code is wrong, the sensor
  will ignore the host's request and not respond.

  The calculation method of CRC-16 check code is as follows:
  ① Preset a 16-bit register as hexadecimal FFFF, call this register CRC register;
  ② XOR the first 8-bit binary data (the first byte of the information frame) with the lower 8 bits of the
  16-bit CRC register, and place the result in the CRC register;
  ③ Shift the content of the CRC register one bit to the right (toward the low bit) and fill the highest bit

  with 0, check the right shift out position after shift;
  ④ If the shifted out bit is 0, repeat step ③ (shift one bit to the right again), if the shifted out bit is 1, the
  CRC register is XORed with the polynomial A001 (1010 0000 0000 0001);
  ⑤ Repeat steps ③ and ④ until the right shift is 8 times, so that the entire 8-bit data has been processed;
  ⑥ Repeat steps ② to step ⑤ to process the next byte of the message frame;
  ⑦ After calculating all the bytes of the information frame according to the above steps, the content of the
  CRC register obtained is: 16-bit CRC check code.




7 Dimensions (unit: mm)




                                                                -9-
