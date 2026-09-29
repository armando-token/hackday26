# N1200_User_Guide

> Source PDF: `Manual_N1200_EN.pdf`
> Converted for agent/API Markdown consumption. Prefer this file over PDF parsing.

---

N1200 CONTROLLER
USER GUIDE V2.0x Q
1   SAFETY ALERTS......................................................................................................................................................................................................4
2   INTRODUCTION .......................................................................................................................................................................................................5
3   CONFIGURATION / FEATURES ..............................................................................................................................................................................6
  3.1      INPUT TYPE SELECTION ..............................................................................................................................................................................6
  3.2      CONFIGURATION OF OUTPUTS, ALARMS AND DIGITAL INPUTS ...........................................................................................................6
  3.3      ALARM CONFIGURATION .............................................................................................................................................................................9
     3.3.1      ALARM TIMER MODES .........................................................................................................................................................................10
     3.3.2      ALARM INITIAL BLOCKING ..................................................................................................................................................................10
  3.4      EXTRACTION OF THE SQUARE ROOT .....................................................................................................................................................10
  3.5      ANALOG RETRANSMISSION OF PV AND SP............................................................................................................................................10
  3.6      SOFT START ................................................................................................................................................................................................10
  3.7      REMOTE SETPOINT ....................................................................................................................................................................................11
  3.8      CONTROL MODE .........................................................................................................................................................................................11
  3.9      PID AUTOMATIC MODE ..............................................................................................................................................................................11
  3.10       LBD − LOOP BREAK DETECTION ALARM .............................................................................................................................................11
  3.11       HBD − HEATER BREAK DETECTION......................................................................................................................................................11
  3.12       SAFE OUTPUT VALUE WITH SENSOR FAILURE ..................................................................................................................................12
  3.13       USB INTERFACE ......................................................................................................................................................................................12
4 INSTALLATION / CONNECTIONS .........................................................................................................................................................................14
  4.1      INSTALLATION RECOMMENDATIONS ......................................................................................................................................................14
  4.2      ELECTRICAL CONNECTIONS.....................................................................................................................................................................14
     4.2.1      POWER SUPPLY CONNECTIONS .......................................................................................................................................................14
     4.2.2      INPUT CONNECTIONS .........................................................................................................................................................................14
     4.2.3      REMOTE SETPOINT .............................................................................................................................................................................15
     4.2.4      DIGITAL INPUT CONNECTIONS ..........................................................................................................................................................15
     4.2.5      ALARMS AND OUTPUTS CONNECTIONS ..........................................................................................................................................15
5 OPERATION............................................................................................................................................................................................................16
6 DESCRIPTION OF THE PARAMETERS ................................................................................................................................................................17
  6.1      OPERATION CYCLE ....................................................................................................................................................................................17
  6.2      TUNING CYCLE ............................................................................................................................................................................................17
  6.3      PROGRAMS CYCLE ....................................................................................................................................................................................18
  6.4      ALARM CYCLE .............................................................................................................................................................................................19
  6.5      SCALE CYCLE ..............................................................................................................................................................................................19
  6.6      I/O (INPUTS AND OUTPUTS) CYCLE .........................................................................................................................................................20
  6.7      CALIBRATION CYCLE .................................................................................................................................................................................20
  6.8      ALL PARAMETERS ......................................................................................................................................................................................21
7 CONFIGURATION PROTECTION ..........................................................................................................................................................................22
  7.1      ACCESS PASSWORD..................................................................................................................................................................................22
  7.2      PROTECTION OF THE ACCESS CODE .....................................................................................................................................................22
  7.3      MASTER PASSWORD .................................................................................................................................................................................22
8 RAMPS AND SOAKS PROGRAMS ........................................................................................................................................................................23
  8.1      LINK OF PROGRAMS ..................................................................................................................................................................................23
  8.2      EVENT ALARM .............................................................................................................................................................................................23
9 PID PARAMETERS DEFINITION ...........................................................................................................................................................................24
  9.1      AUTOMATIC TUNING ..................................................................................................................................................................................24
  9.2      AUTO-ADAPTIVE TUNING...........................................................................................................................................................................24
10 MAINTENANCE ......................................................................................................................................................................................................26
  10.1        PROBLEMS WITH THE CONTROLLER ...................................................................................................................................................26
  10.2        INPUT CALIBRATION ...............................................................................................................................................................................26
  10.3        ANALOG OUTPUT CALIBRATION ...........................................................................................................................................................26
11 SERIAL COMMUNICATION....................................................................................................................................................................................27
  11.1       FEATURES ................................................................................................................................................................................................27
  11.2       CONFIGURATION OF PARAMETERS FOR SERIAL COMMUNICATION ..............................................................................................27
  11.3       COMMUNICATION PROTOCOL...............................................................................................................................................................27
  11.4       HOLDING REGISTERS TABLE ................................................................................................................................................................27
12 CONFIGURATION EXAMPLES ..............................................................................................................................................................................29
NOVUS AUTOMATION                                                                                                                                                                                                  2 / 63
13 SPECIFICATIONS ...................................................................................................................................................................................................30
14 IDENTIFICATION ....................................................................................................................................................................................................31
15 WARRANTY ............................................................................................................................................................................................................32
16 ATTACHMENT 1 – COMMUNICATION PROTOCOL ............................................................................................................................................33
  16.1     COMMUNICATION INTERFACE ..............................................................................................................................................................33
  16.2     RS485 INTERFACE...................................................................................................................................................................................33
  16.3     GENERAL FEATURES..............................................................................................................................................................................33
  16.4     COMMUNICATION PROTOCOL...............................................................................................................................................................33
    16.4.1    SETTING THE COMMUNICATION PARAMETERS ..........................................................................................................................33
    16.4.2    REGISTER MAP .................................................................................................................................................................................34
    16.4.3    STATUS WORDS ...............................................................................................................................................................................61
  16.5     EXCEPTION RESPONSES – ERROR CONDITIONS ..............................................................................................................................62
  16.6     CONFIGURING I/O PARAMETERS ..........................................................................................................................................................62
    16.6.1    N1200 ..................................................................................................................................................................................................62
    16.6.2    N1200-HC ...........................................................................................................................................................................................63




NOVUS AUTOMATION                                                                                                                                                                                                   3 / 63
1       SAFETY ALERTS
The symbols below are used in the device and throughout this manual to draw the user’s attention to valuable information related to device safety
and use.




                        CAUTION                                                                            ATTENTION
                                                            CAUTION OR HAZARD
            Read the manual fully before installing                                             Material sensitive to static charge.
                                                             Risk of electric shock.
                  and operating the device.                                                     Check precautions before handling.

All safety recommendations appearing in this manual must be followed to ensure personal safety and prevent damage to the instrument or system.
If the instrument is used in a manner other than that specified in this manual, the device’s safety protections may not be effective.




NOVUS AUTOMATION                                                                                                                            4 / 63
2       INTRODUCTION
N1200 is an extraordinarily versatile process controller. It accepts in a single model all the sensors and signals used in the industry and provides
the main output types required for the operation of diverse processes.
Configuration can be performed either directly on the controller or via the USB interface once QuickTune software has been installed on the
computer to be used. Once connected to USB, the device will be recognized as a serial communication (COM) port operating with Modbus RTU
protocol.
Through the USB interface, even if disconnected from the power supply, the configuration performed in a piece of equipment can be saved in a file
and repeated in other pieces of equipment that require the same configuration.
It is important that the users carefully read this manual before using the controller. Verify if the release of this manual matches the instrument
version (the firmware version is shown when the controller is energized).
Its main characteristics are:
•   Multi-sensor universal input
•   Protection for open sensor in any condition
•   Relay, 4-20 mA and logic pulse control outputs all available in the standard model
•   Self-tuning of PID parameters
•   Automatic / Manual function with Bumpless transfer
•   Four modes of independents alarms, with functions of minimum, maximum, differential (deviation), open sensor, and event
•   Timer functions that can be associated with the alarms
•   Retransmission of PV or SP in 0-20 mA or 4-20 mA
•   Input for remote Setpoint
•   Digital input with 5 functions
•   Programmable Soft Start
•   20 setpoint profile programs with 9 segments each, with the ability to be linked together for a total of 180 segments
•   Password for parameters protection
•   Universal power supply.




NOVUS AUTOMATION                                                                                                                               5 / 63
3        CONFIGURATION / FEATURES
3.1      INPUT TYPE SELECTION
During equipment configuration, you must set the input type to be used. The table below shows the available options:

                                     TYPE          CODE                        MEASUREMENT RANGE
                                       J            Tc j        Range: -110 to 950 °C (-166 to 1742 °F)
                                       K           Tc     k     Range: -150 to 1370 °C (-238 to 2498 °F)
                                       T            Tc t        Range: -160 to 400 °C (-256 to 752 °F)
                                       N            Tc n        Range: -270 to 1300 °C (-454 to 2372 °F)
                                       R            Tc r        Range: -50 to 1760 °C (-58 to 3200 °F)
                                       S            Tc s        Range: -50 to 1760 °C (-58 to 3200 °F)
                                       B            Tc b        Range: 400 to 1800 °C (752 to 3272 °F)
                                       E            Tc e        Range: -90 to 730 °C (-130 to 1346 °F)
                                     Pt100           Pt         Range: -200 to 850 °C (-328 to 1562 °F)
                                   0-20 mA         L0.20
                                   4-20 mA         L4.20
                                                                                  Linear Signals
                                   0-50 mV         L0.50
                                                                     Programmable indication from -1999 to 9999.
                                    0-5 Vdc         L0.5
                                   0-10 Vdc        L0.10
                                                    ln j
                                                   Ln     k
                                                    ln t
                                                    ln n
                                  4-20 mA                                     Non-Linear Analog Signals
                                                    ln r
                                NON-LINEAR                        Indication range depends on the selected sensor.
                                                    ln s
                                                    ln b
                                                    ln E
                                                   Ln.Pt
                                                                     Table 1
Note: All input types are factory calibrated.

3.2      CONFIGURATION OF OUTPUTS, ALARMS AND DIGITAL INPUTS
The controller has input and output channels (I/O) that can assume multiple functions: control output, digital input, digital output, alarm output, and
PV and SP retransmission. These channels are identified as I/O1, I/O2, I/O3, I/O4, and I/O5.
The basic controller model has the following features:
    I/O1     Relay Output SPST-NO
    I/O2     Relay Output SPST-NO
    I/O5     Current output, digital output, digital input
Optionally, other features can be added, as shown under the item IDENTIFICATION in this manual:
    3R       I/O3 with SPDT relay output
    DIO      I/O3 and I/O4 as digital input and output channels
    HBD Heater break detect
    485      Serial Communication




NOVUS AUTOMATION                                                                                                                                  6 / 63
The function to be used in each channel of I/O is defined in accordance with the options shown in the table below:

                                               I/O FUNCTION                              CODE            I/O TYPE
                            Without Function                                             OFF              Output
                            Alarm 1 Output                                                A1              Output
                            Alarm 2 Output                                                A2              Output
                            Alarm 3 Output                                                A3              Output
                            Alarm 4 Output                                                A4              Output
                            LBD (Loop Break Detection)                                   Lbd              Output
                            Control Output (Relay or Digital Pulse)                      CTRL             Output
                            Automatic / Manual mode selection                            mAN            Digital Input
                            Run / Stop mode selection                                    RVN            Digital Input
                            Remote SP selection                                          RSP            Digital Input
                            Setpoint profile program HOLD (Freezes program
                                                                                         KPRG           Digital Input
                            execution)
                            Setpoint Profile Program 1 selection                         PR 1           Digital Input
                            0 to 20 mA control output selection                          (.0.20      Analogical Output
                            4 to 20 mA control output selection                          (.4.20      Analogical Output
                            PV Retransmission (0 to 20 mA)                               P.0.20      Analogical Output
                            PV Retransmission (4 to 20 mA)                               P.4.20      Analogical Output
                            SP Retransmission (0 to 20 mA)                               S.0.20      Analogical Output
                            SP Retransmission (4 to 20 mA)                               S.4.20      Analogical Output
                                                                      Table 2
During channel configuration, only the valid options for each channel will be shown on the display. These functions are described below:

3.2.1      OFF − NO FUNCTION
The I/O channel programmed with code off will not be used by the controller. Although without function, this channel is available through the serial
communication as digital I/O (command 5 Modbus).

3.2.2      A1, A2, A3, A4 – ALARM OUTPUTS
The selected channel can be used as output to Alarms 1 to 4. Defines that the programmed I/O channel acts as alarm outputs.
Available to all I/O channels.

3.2.3      LBD – LOOP BREAK DETECTOR FUNCTION
Assigns the output of the Loop Break Detector alarm to an I/O channel.
Available to all I/O channels.

3.2.4      (TRL – PWM CONTROL OUTPUT
Defines the I/O channel to be used as the PWM control output (relay or digital pulse). The digital pulse is available on I/O5 (standard) or on I/O3
and I/O4 (when the DIO optional is installed). Check the specifications of each channel.
Available to all I/O channels.

3.2.5      MAN − DIGITAL INPUT WITH AUTO/MANUAL FUNCTION
Defines the I/O channel as Digital Input with the function of switching the control mode between Automatic and Manual.
        Closed     Manual control;
          Open     Automatic control

Available on I/O5 (standard) or on I/O3 and I/O4 (when the DIO optional is installed).

3.2.6      RVN − DIGITAL INPUT WITH RUN FUNCTION
Defines channel as Digital Input with the function of enabling/disabling the control and alarm outputs (RUN=YES/NO).
        Closed     Outputs enabled
          Open     Control and alarms output shut off

Available for I/O5 or I/O3 and I/O4 (when available).
NOVUS AUTOMATION                                                                                                                               7 / 63
3.2.7      RSP − DIGITAL INPUT WITH REMOTE SP FUNCTION
Defines channel as Digital Input with the function of selecting the remote SP as the control setpoint.
         Closed    Remote SP
          Open     Uses main SP

Available for I/O5 or I/O3 and I/O4 (when available).

3.2.8      KPRG − DIGITAL INPUT WITH HOLD PROGRAM FUNCTION
Defines channel as Digital Input with the function of commanding the execution of the selected setpoint profile program.
         Closed    Enables execution of the program
          Open     Interrupts (freezes) execution of the program

Available for I/O5 or I/O3 and I/O4 (when available).
Note: Even when the execution of the program is interrupted, the control output remains active and controlling the process at the point (Setpoint) of
interruption. The program will resume its normal execution starting from this same point when the digital input is closed.

3.2.9      PR 1 − DIGITAL INPUT WITH FUNCTION TO EXECUTE PROGRAM 1
Defines the IO channel as Digital Input with the function of commanding the execution of the Setpoint profile program 1.
Useful function for switching between the main Setpoint and a secondary one defined by the program 1.
         Closed    Selects program 1
          Open     Selects main Setpoint

Available for I/O5 or I/O3 and I/O4 (when available).

3.2.10     (.0.20 – 0-20 mA CONTROL OUTPUT
Defines the channel as a 0-20 mA control output.
Available for I/O 5 only.

3.2.11     (.4.20 − 4-20 mA CONTROL OUTPUT
Defines the channel as a 4-20 mA control output.

3.2.12     P.0.20 – 0-20 mA PV RETRANSMISSION
Configures the channel to retransmit the values of PV in 0-20 mA.
Available for I/O 5 only.

3.2.13     P.4.20 − 4-20 mA PV RETRANSMISSION
Configures the channel to retransmit the values of PV in 4-20 mA.
Available for I/O 5 only.

3.2.14     S.0.20 − 0-20 mA SP (SETPOINT) RETRANSMISSION
Configures the channel to retransmit the values of SP in 0-20 mA.
Available for I/O 5 only.

3.2.15     S.4.20 − 4-20 mA SP (SETPOINT) RETRANSMISSION
Configures the channel to retransmit the values of SP in 0-20 mA.
Available for I/O 5 only.




NOVUS AUTOMATION                                                                                                                                8 / 63
3.3       ALARM CONFIGURATION
The controller has 4 independent alarms. These alarms can be configured to operate with nine functions, as shown in the table below:
•     Off: Alarms turned off.
• Ierr: Open Sensor alarms (Loop Break)
The open sensor alarm acts whenever the input sensor is broken or badly connected.
• Rs: Program Event Alarm
Configures the alarm to act in (a) specific segment(s) of the programs of ramps and baselines to be created by the user.
• Rfai1: Burnt-out Resistance Alarm (Heat Break)
Signals that the heating element has broken up. This alarm function requires the accessory Current transformer CT1.
• Lo: Alarm of Absolute Minimum Value
Triggers when the value of measured PV is below the value defined for alarm Setpoint.
• Ki: Alarm of Absolute Maximum Value
Triggers when the value of measured PV is above the value defined for alarm Setpoint.
• Dif: Alarm of Differential Value
In this function the parameters SPA1, SPA2, SPA3 and SPA4 represent the Deviation of PV in relation to the SP.

Using the Alarm 1 as example: for Positive SPA1 values, the Differential alarm triggers when the value of PV is out of the range defined for:
                                                            (SP – SPA1) to (SP + SPA1)
For a negative SPA1 value, the Differential alarm triggers when the value of PV is within the range defined above:
• Difl: Alarm of Minimum Differential Value
It triggers when the value of PV is below the defined point by:
                                                                     (SP – SPA1)
Using the Alarm 1 as example.
• difk : Alarm of Maximum Differential Value
Triggers when the value of PV is above the defined point by:
                                                                     (SP + SPA1)
Using Alarm 1 as example.

      SCREEN                        TYPE                                                                         ACTION
       Off                       Inoperative              Output is not used as alarm.
       Ierr                      Open sensor              Activated when the input signal of PV is interrupted, out of the range limits or Pt100 in
                                 (input Error)            short-circuit.
        Rs                       Event
                                                          Activated in a specific segment of program.
                            (ramp and Soak)
      rfail               Resistance burnt out
                                                          Signals a failure in the heating element.
                            (resistance fail)
        Lo                      Minimum value                                                                             PV

                                    (Low)                                                                         SPAn


        Ki                      Maximum value                                                               PV

                                    (High)                                                                         SPAn


       Dif                        Differential                                     PV                                                                   PV

                                 (differential)                        SV - SPAn        SV   SV + SPAn                          SV + SPAn   SV    SV - SPAn


                                                                           Positive SPAn                                        Negative SPAn
       Difl               Minimum Differential                                                   PV                                                       PV

                           (differential Low)                                SV - SPAn            SV                                SV           SV - SPAn


                                                                           Positive SPAn                                        Negative SPAn
       Difk               Maximum differential                                                         PV                                                 PV
                           (differential High)                        SV     SV + SPAn                                         SV + SPAn         SV

                                                                        Positive SPAn                                          Negative SPAn
                                                                     Table 3

Where SPAn refers to Setpoints of Alarm SPA1, SPA2, SPA3 and SPA4.



NOVUS AUTOMATION                                                                                                                                               9 / 63
Important note: Alarms configured with the ki, dif, and difk functions also trigger their associated output when a sensor fault is identified and
signaled by the controller. A relay output, for example, configured to function as a High Alarm (ki), will operate when the SPAL value is exceeded
and when the sensor connected to the controller input is broken.

3.3.1   ALARM TIMER MODES
The controller alarms can be configured to perform 3 timer modes:
• One pulse with defined duration
• Delayed activation
• Repetitive pulses
The illustrations in the table below show the behavior of the alarm output for various combinations of times t1 and t2. The timer functions can be
configured in parameters A1t1, A1t2, A2t1, A2t2, A3t1, A3t2, A4t1, and A4t2.

                                OPERATION                    T1              T2                          ACTION
                                                                                             Alarm

                              Normal operation                0                  0           Output

                                                                                                  Alarm Event


                                                                                             Alarm

                        Activation for a defined time    1 to 6500 s             0           Output       T1

                                                                                                  Alarm Event

                                                                                             Alarm
                                                                                                          T2
                            Activation with delay             0          1 to 6500 s         Output

                                                                                                  Alarm Event


                                                                                             Alarm

                            Intermittent Activation      1 to 6500 s     1 to 6500 s         Output      T1     T2    T1

                                                                                                  Alarm Event


                                                                       Table 4
The LEDs associated with the alarms will light when the alarm condition is recognized, not following the actual state of the output, which may be
temporarily OFF because of the temporization.

3.3.2   ALARM INITIAL BLOCKING
The initial blocking option inhibits the alarm from being recognized if an alarm condition is present when the controller is first energized (or after a
transition from run YES NO). The alarm will be enabled only after the occurrence of a non-alarm condition followed by a new occurrence for the
alarm.
The initial blocking is useful, for instance, when one of the alarms is configured as a minimum value alarm, causing the activation of the alarm soon
upon the process start-up, an occurrence that may be undesirable.
The initial blocking is disabled for the sensor break alarm function.

3.4     EXTRACTION OF THE SQUARE ROOT
With this feature enabled the controller uses for display and control a value that corresponds to the square root of the applied input signal.
Available only for the inputs belonging to the group of linear analogic signals: 0-20 mA, 4-20 mA, 0-50 mV, 0-5 V, and 0-10 V.

3.5     ANALOG RETRANSMISSION OF PV AND SP
The analog output, when not used for control purposes, is available for retransmitting the PV and SP values in 0-20 or 4-20 mA. This analog output
is electrically isolated from other inputs and outputs.
The analog output signal is scalable, with the output range defined by the values programmed in the parameters rtLL and rtkL.
To obtain a voltage output, the user must install a resistor shunt (550 Ω max.) to the current output terminals (terminals 7 and 8). The actual
resistor value depends on the desired output voltage span.
There is no electrical isolation between serial communication (RS485) and channel I/O5.

3.6     SOFT START
The Soft Start feature avoids abrupt variations in the power delivered to the load regardless of the system power demand.
This is accomplished by defining a limiting ramp for the control output. The output is allowed to reach maximum value (100 %) only after the time
programmed in the Soft Start parameter has elapsed.
The Soft Start function is used in processes that require slowly start up, where the instantaneous application of 100 % of the available power to the
load may cause damages to parts of the system.
Notes:
1. This function is only valid when in PID control mode.
2. Setting 0 (zero) in the time interval, the function is disabled.




NOVUS AUTOMATION                                                                                                                                  10 / 63
3.7      REMOTE SETPOINT
The controller can have its Setpoint value defined by an analog, remotely generated signal. This feature is enabled through the channels I/O3, I/O4
or I/O5 when configured as digital inputs and configured with the function rsp (Remote SP selection) or through the parameter E.rsp. The remote
setpoint input accepts the signals 0-20 mA, 4-20 mA, 0-5 V, and 0-10 V.
For the signals of 0-20 and 4-20 mA, a shunt resistor of 100 Ω is required between terminals 9 and 10, as shown in Figure 7.

3.8      CONTROL MODE
The controller can operate in two different manners: 1) Automatic mode or 2) Manual mode.
In automatic mode the controller defines the amount of power to be applied in the process, based on defined parameters (SP, PID, etc.).
In the manual mode the user himself defines this amount of power. The parameter (trl defines the control mode to be adopted.

3.9      PID AUTOMATIC MODE
For the Automatic mode, there are two different strategies of control: PID control and ON/OFF control.
PID control has its action based on a control algorithm that considers the deviation of PV with respect to SP, the rate of change of PV and the
steady state error.
On the other hand, the ON/OFF control (obtained when Pb=0) operates with 0 % or 100 % of power, when PV deviates from SP.
The determination of the PID parameters (Pb, Ir and Dt) is described in the item PID PARAMETERS DEFINITION of this manual.

3.10 LBD − LOOP BREAK DETECTION ALARM
The parameter defines a time interval, in minutes, within which the PV is expected to react to a control output signal. If the PV does not react
properly within the time interval configured in lbd.t, the controller interprets this as a control loop break and signals this occurrence in the display.
An LBD event may be sent to any I/O channel. Simply configure the LDB function to the desired I/O channel: the selected output will be activated
when a LDB condition is detected. When the lbd.t parameter is programmed with 0 (zero), the LDB function is disabled.
The LDB is useful in system supervision and troubleshooting, allowing early detection of problems in the actuator, power source, or load.

3.11 HBD − HEATER BREAK DETECTION
Available in the products identified with the suffix HBD.
The HBD (Heater Break Detector) option provides means of detecting a mal function in the heater resistance, by monitoring the current that flows
through it. This option consists of a dedicated PCB connected internally to the N1200 and a current transformer (CT) mounted externally at the
load.

3.11.1     INSTALLATION
When the HBD model controller is ordered, the HBD accessory is already mounted in the N1200. The user must then connect the CT to terminals
14 and 15 at the instrument back panel (any polarity).




                                                                       Figure 1

The CT was designed such as to facilitate its insertion in the load circuit. The CT core can be opened to allow the load wire to be installed inside the
core, without opening the circuit. The CT wires may be stretched up to 3 meters long and must be kept away from other wires and cables of the
installation.

3.11.2     OPERATION
When the PWM control output is used, the controller monitors the load current when this output is turned ON and OFF, indicting on the kb.i
screen the current with higher value (usually, the current that is present when the output is ON.)
The minimum current alarm (Kb.L) takes this ON current measurement and compares it with the respective setpoint value. If this current is below
the alarm setpoint, the alarm is activated, indicating a faulty resistance.
The maximum current (Kb.k) alarm compares OFF current measurement with the setpoint for this alarm. If the current is above the alarm setpoint,
the alarm is activated to indicate problems in the actuator (short-circuited SSR, bad contactor , etc.).
The minimum/maximum current alarm (Kb.Lk) executes both operations described above simultaneously.




NOVUS AUTOMATION                                                                                                                                   11 / 63
3.11.3      CONTROLLER CONFIGURATION
The HBD parameters are:
  PARAMETER                                                       FUNCTION                                                        CYCLE
         kb.i        Current indication as measured by the CT (in amperes)                                                    Operation cycle
                     Maximum CT Span.
      kb.fs          For the CT accompanying the controller, this parameter must be defined as 60.0, an indication              Scale cycle
                     that the maximum measured current is 60 A
                                                                     Table 5

In the alarm Functions parameters, the parameters are:

  PARAMETER                                                       FUNCTION                                                        CYCLE
                     HBD alarm functions:
      Fua1
      Fua2                 Kb.L    Minimum current alarm.
                                                                                                                                Alarm cycle
      Fua3                 Kb.k    Maximum current alarm.
      Fua4
                         Kb.Lk     Minimum and maximum current alarm.
                                                                     Table 6

When the HBD alarm functions are used, its alarm setpoint is expressed in Amperes:

  PARAMETER                                                       FUNCTION                                                        CYCLE
      SP.A1          Electric current values in amperes (A).
      SP.A2
                                                                                                                                Tuning cycle
      SP.A3
      SP.A4
                                                                     Table 7
Notes:
1. For a perfect operation of the controller in monitoring the electric current, the PWM Cycle Time ([t) must be defined with a value above 2
   seconds.
2. The current measure accuracy is 3.3% (±2A).
3. For further information, visit the link: www.novusautomation.com/en/N1200HBD_appendix.

3.12 SAFE OUTPUT VALUE WITH SENSOR FAILURE
This function defines an output value (user defined) to be assigned to the control output in the event of a sensor failure.
When the input sensor is identified as broken, the controller forces MV to assume the user configured value in the 1E.ov parameter.
When the parameter 1E.ov is configured with 0.0 (zero) value, this function is disabled, and the control output is simply turned off upon input
sensor error.

3.13 USB INTERFACE
The USB interface is used to CONFIGURE, MONITOR or UPDATE the controller FIRMWARE. The user should use QuickTune software, which
offers features to create, view, save and open settings from the device or files on the computer. The tool for saving and opening configurations in
files allows the user to transfer settings between devices and perform backup copies.
For specific models, QuickTune allows you to update the firmware (internal software) of the controller via the USB interface.
For MONITORING purposes, the user can use any supervisory software (SCADA) or laboratory software that supports the MODBUS RTU
communication over a serial communication port. When connected to a computer's USB, the controller is recognized as a conventional serial port
(COM x).
The user must use QuickTune software or consult the DEVICE MANAGER on the Windows Control Panel to identify the COM port assigned to the
controller.
The user should consult the mapping of the MODBUS memory in the controller's communication manual and the documentation of the supervision
software to start the MONITORING process.
Follow the procedure below to use the USB communication of the device:
1. Download QuickTune software from our website and install it on the computer. The USB drivers necessary for operating the communication will
     be installed with the software.
2. Connect the USB cable between the device and the computer. The controller does not have to be connected to a power supply. The USB will
     provide enough power to operate the communication (other device functions may not operate).
3. Run the QuickTune software, configure the communication and start the recognition of the device.




NOVUS AUTOMATION                                                                                                                               12 / 63
                   The USB interface IS NOT SEPARATE from the signal input (PV) or the controller’s/indicator’s digital inputs and
                   outputs. It is intended for temporary use during CONFIGURATION and MONITORING periods.
                   For the safety of people and equipment, it must only be used when the piece of equipment is completely
                   disconnected from the input/output signals.
                   Using the USB in any other type of connection is possible but requires a careful analysis by the person responsible
                   for installing it.
                   When MONITORING for prolonged periods of time and with connected inputs and outputs, we recommend using the
                   RS485 interface, which is available or optional in most of our products.




NOVUS AUTOMATION                                                                                                                 13 / 63
4         INSTALLATION / CONNECTIONS
The controller must be fastened on a panel, following the sequence of steps described below:
•     Prepare a panel cut-out according to Specifications.
•     Remove the mounting clamps from the controller.
•     Insert the controller into the panel cut-out.
•     Slide the mounting clamp from the rear to a firm grip at the panel.

4.1       INSTALLATION RECOMMENDATIONS
•     All electrical connections are made to the screw terminals at the rear of the controller. They accept wire sizes from 0.5 to 1.5 mm2 (16 to 22
      AWG). The terminals should be tightened to a torque of 0.4 Nm (3.5 lb. in).
•     To minimize the pick-up of electrical noise, the low voltage DC connections and the sensor input wiring should be routed away from high-
      current power conductors. If this is impractical, use shielded cables. In general, keep cable lengths to a minimum.
•     All electronic instruments must be powered by a clean mains supply, proper for instrumentation.
•     It is strongly recommended to apply RC'S FILTERS (noise suppressor) to contactor coils, solenoids, etc.
•     In any application it is essential to consider what can happen when any part of the system fails. The controller features by themselves cannot
      assure total protection.

4.2       ELECTRICAL CONNECTIONS
The controller's internal circuits can be removed without undoing the connections on the back panel. The figure below shows the disposition of the
features placed on the back panel of the controller:




                                                                        Figure 2

4.2.1        POWER SUPPLY CONNECTIONS




                                              Observe required
                                               power supply




4.2.2        INPUT CONNECTIONS
THERMOCOUPLE (T/C) AND 0-50 mV



                                   The figure indicates the wiring for the thermocouple and 0-50 mV signals. If the thermocouple wires need to be
                                   extended, use appropriate compensation cables.

                   T/C, 0-50mV




NOVUS AUTOMATION                                                                                                                              14 / 63
RTD (Pt100)

                                 The figure shows the Pt100 wiring, for 3 conductors. For proper cable length compensation, use conductors of
                                 same gauge and length.
                                 For 4-wires Pt100, leave one conductor disconnected at the controller. For 2-wire Pt100, short-circuit terminals 11
                                 and 12.
                    Pt100




4-20 mA




                                 The connections for current signals 4-20 mA must be conducted according to the figure.

                       4-20mA




5 V AND 10 V



                                 Refer to the figure for connecting voltage signals.




4.2.3      REMOTE SETPOINT


                                 Feature available in terminals 9 and 10.
                                 When the Remote SP input signal is 0-20 mA or 4-20 mA, an external 100 Ω shunt resistor of must be connected
                                 to terminals 9 and 10 as indicated in this figure.



4.2.4      DIGITAL INPUT CONNECTIONS
To trigger I/O3, I/O4, and I/O5 channels as Digital Inputs, connect a key or similar (Dry Contact) to the terminals.

                                                        I/O3 as a Digital Input               I/O5 as a Digital Input




4.2.5      ALARMS AND OUTPUTS CONNECTIONS
When configured as outputs, the I/O channels must have their load limit capacities observed, according to the Specifications.

                                                  IO3 or I/O4 with output pulse for
                                                                                          I/O5 with output pulse for SSR
                                                                SSR




NOVUS AUTOMATION                                                                                                                               15 / 63
5       OPERATION
The front panel can be seen in the figure below:




                                                                         Figure 3

Display of PV / Programming: Displays the current value of PV (Process Variable). When in configuration mode, it shows the parameters names.
Display of SP / Parameters: Displays the value of SP (Setpoint). When in configuration mode, it shows the parameters values.
COM indicator: Flashes to indicate communication activity in the RS485 interface.
TUNE indicator: Stays ON while the controller is in tuning process.
MAN indicator: Signals that the controller is in the manual control mode.
RUN indicator: Indicates that the controller is active, with the control output and alarms enabled.
OUT indicator: For relay or pulse control output; it reflects the actual state of the output. If an analog output is assigned for control, the indicator
lights continuously.
A1, A2, A3, and A4 indicators: signalize the occurrence of alarm situation.
 P   P Key (Program key): Key used to walk through the menu parameters.
     Back Key: Key used to retrocede parameters.
     Increment key and       Decrement key: Keys used to alter the values of the parameters.
When the controller is powered on, its firmware version is presented for 3 seconds, after which the controller starts normal operation. The values of
PV and SP are displayed, and the outputs are enabled.
To operate appropriately, the controller needs a configuration that is the definition of each one of the several parameters presented by the
controller. The user must be aware of the importance of each parameter and for each one determines a valid condition or a valid value.

                                                                     Note:
                                            The Input Type must be the first parameter to be configured.

The parameters are grouped in levels according to their functionality and operation easiness. The 7 levels of parameters are:

                                                           LEVEL                            ACCESS
                                         1 − Operation                                     Free access
                                         2 − Tuning
                                         3 − R&S Programs
                                         4 − Alarms
                                                                                        Reserved access
                                         5 − Scale
                                         6 − I/O
                                         7 − Calibration
                                                                       Table 8

The parameters in the operation level have easy access through the key P . The access deeper levels use the combination of keys:
                                                     (BACK) and    P   (PROG) pressed simultaneously
Press P to advance or          to retrocede parameters within a level. At the end of each level, the controller returns to the operation level. Keep
pressing the P key to move fast forward in the level.
Alternatively, the controller returns to the operation level after pressing the key for 3 seconds
All configuration parameters are stored in protected memory. The values are saved when the keys P or          are pressed after changing a parameter
value. The value of SP is saved upon pressing the P key or every 25 seconds.
Note: It is recommended to disable/suspend the control (rvn = NO) whenever it is necessary to change the device settings.




NOVUS AUTOMATION                                                                                                                                  16 / 63
6           DESCRIPTION OF THE PARAMETERS
6.1         OPERATION CYCLE
       PV Indication    PV and SP indication.
       (Red Screen)
                        The upper display shows the current value of PV. The lower display shows the control SP value.
       SP Indication
      (Green Screen)


       (trl             Control Mode:
         Control            avto     Means automatic control mode.
                             Man     Means manual control mode.
                        Bumpless transfer between automatic and manual control modes.
       PV Indication    Manipulated Variable value (MV).
       (Red Screen)
                        The upper display shows PV value. The lower display shows the percentage of MV applied to the control output.
       MV Indication
      (Green Screen)    When in manual control, the MV value can be manually changed by the and keys. When in auto mode the MV value can
                        only be viewed.
                        To distinguish the MV display from the SP display, the MV is shown flashing intermittently.
       E pr             Program execution.
    Enable Program      Select the ramp and soak profile program to be executed.
                                 0   Does not execute program
                          1 to 20    Number of the program to be executed
                        With enabled outputs (RvN = YES), the program starts right after the program is selected.
       p.seg            Screen for indication only. When a ramp and soak program is active, this parameter shows the number of the segment under
                        execution, from 1 to 9.
       t.seg            Screen for indication only. When a ramp and soak program is in execution, it shows the remaining time to the end of the
                        current segment, in units of time configured in the Pr.tb parameter.
        Rvn             Enables control outputs and alarms.
          Run                YES     The outputs are enabled.
                               NO    The outputs are not enabled.

6.2         TUNING CYCLE
       Atvn             Defines the control strategy to be taken:
       Auto-tune             off     Turned off.
                            Fast     Fast automatic tuning.
                            Full     More accurate automatic tuning.
                            self     Precise + auto-adaptive tuning
                            Ralf     Forces one new precise automatic precise + auto-adaptive tuning.
                            T9kt     Forces one new precise automatic + auto-adaptive tuning when Rvn = YES or the controller is turned on.
          pb            Proportional band.
    Proportional Band   Value of the term P of the control mode PID, in percentage of the maximum span of the input type.
                        Adjust of between 0 and 500.0 %.
                        When set with 0.0, determines ON/OFF control mode.
          ir            Integral rate.
      Integral Rate     Value of the term I of the PID algorithm, in repetitions per minute (Reset).
                        Adjustable between 0 and 99.99.
                        Displayed only if proportional band ≠ 0.
          dt            Derivative time.
     Derivative Time    Value of the term D of the control mode PID, in seconds.
                        Adjustable between 0 and 300.0 seconds.
                        Displayed only if proportional band ≠ 0.
          (t            Pulse Width Modulation (PWM). Period in seconds.
       Cycle Time       Adjustable between 0.5 and 100.0 seconds.
                        Displayed only if proportional band ≠ 0.
       kyst             Control hysteresis. Hysteresis value for ON/OFF control.
       Hysteresis       Adjustable between 0 and the measurement input type span.




NOVUS AUTOMATION                                                                                                                              17 / 63
        ACt            Control action:
         Action            re     Control with reverse Action. Appropriate for heating. Turns control output on when PV is below SP.
                          dir     Control with direct Action. Appropriate for cooling. Turns control output on when PV is above SP.

       Lbd.t           Time interval for the LBD function. Defines the maximum interval of time for the PV to react to a control command. In minutes
Loop break detection
        time

       Bias            Bias function. Allows adding a percentage value between -100 % and +100 % to the MV control output
          Bias         The value 0 (zero) disables the function.
       ovll            Lower limit for the control output. Minimum percentage value assumed by the control output when in automatic mode and in
  Output Low Limit     PID.
                       Typically configured with 0 %.
       ovkl            Upper limit for the control output. Maximum percentage for the control output when in automatic mode and in PID.
  Output High Limit    Typically configured with 100 %.
       sfst            Soft Start function. Time in seconds during which the controller limits the MV value progressively from 0 to 100 %.
       Soft Start      It is enabled at power up or when the control output is activated. If in doubt set zero (zero value disables the Soft start
                       function).
       Sp.a1           Alarm Setpoint. Value that defines the point of activation for the programmed alarms with the functions Lo or ki.
       Sp.a2           For the alarms configured with Differential type functions, this parameter defines deviation (band).
       Sp.a3           Not used for the other alarm functions.
       Sp.a4
   Alarm Setpoint


6.3        PROGRAMS CYCLE
       Pr.tb           Defines the time base that will be used by all Ramp & Soak programs.
 Program time base         Se( Time basis in seconds.
                            Min Time basis in minutes.
       Pr n            Selects the ramp and soak profile program to be edited/viewed. The sequence of parameters that follows refers to this selected
  Program number       program.
                       Total of 20 programs possible.
       Ptol            Maximum admitted deviation of PV with respect to SP. If exceeded, the program execution is suspended (the internal timer
 Program Tolerance     freezes) until the deviation be returns within the defined tolerance.
                       The value 0 (zero) disables the function.
       Psp0            Program SP. 0 to 9.
       Psp9            Group of 10 values of SP that define the Ramp and Soak profile segments.
      Program SP

        Pt1            Segment duration. 1 to 9.
        Pt9            Defines the time of duration, in second or minutes, of the segments of the program being edited.
   Program Time

        Pe1            Event alarm. 1 to 9.
        Pe9            Parameters that define which alarms are to be activated during the execution of a certain program segment.
   Program event       The alarms chosen must have their function configured as rS.

         Lp            Link programs.
      Link Program     Number of the next profile program to be linked following the current program.
                                0 Do not link to any other program.




NOVUS AUTOMATION                                                                                                                                18 / 63
6.4        ALARM CYCLE
       Fva1           Alarm functions. Defines the functions for the alarms.
       Fva2
       Fva3
       Fva4
  Function Alarm

       bla1           Alarm initial blocking. Function used to initially block alarms 1 to 4.
       bla2                YES     Enables initial blocking.
       bla3                  NO    Inhibits initial blocking.
       bla4
  Blocking Alarm

       xya1           Alarm hysteresis. Defines the difference between the value of PV at which the alarm is triggered and the value at which it is
       xya2           turned off (in engineering units).
       xya3
       xya4
  Alarm Hysteresis

       A1t1           Defines the temporization time t1, in seconds, for the alarms. Defines the temporization time t1, in seconds, for the alarms
                      time functions.
       A2t1
                      The value 0 (zero) disables the function.
       A3t1
       A4t1
   Alarm Time t1

       A1t2           Alarm Time t2. Defines the temporization time t2, in seconds, for the alarms’ time functions.
       A2t2           The value 0 (zero) disables the function.

       A3t2
       A4t2
   Alarm Time t2

       flsh           Allows visual signalization of an alarm occurrence by flashing the indication of PV in the operation level.
         Flash        To enable, the user chooses which alarms are to be associated with this feature: 1, 2, 3, 4.

6.5        SCALE CYCLE
       Type           Input type. Selects the input signal type to be connected to the process variable input. Refer to Table 1.
          Type        The first parameter to be configured.
       fltr           Digital Input Filter.
          Filter      Used to improve the stability of the measured signal (PV).
                      Adjustable between 0 and 20. In 0 (zero) it means filter turned off and 20 means maximum filter. The higher the filter value,
                      the slower the response of the measured value is.
       Dppo           Decimal point. Allows you to define the display of the decimal point.
      Decimal Point   When configuring the input (TYPE) with temperature sensors (J, K, Pt100, etc), in addition to the integer part of the
                      measurement, the dppo parameter will only display decimal values (XXX.X).
                      When configuring the input (TYPE) with linear signals (mA, mV, V), the DPPO parameter determines the position of the
                      decimal point of the measured value (XXXX, XXX.X, XX.XX, X.XXX).
      vnI t           Allows you to define the temperature unit to be used: Celsius or Fahrenheit.
          Unit        When using a temperature sensor, this parameter will be shown.
       root           Square Root Function. Applies the quadratic function on the input signal, within the limits programmed in SPLl and spkL.
      Square Root
                           YES     Enables the function.
                             no    Does not enable the function.
                      The indication assumes the lower limit value when the input signal is below 1 % of programmed span.
                      Parameter available for lineal inputs only.
       0ffs           Offset value to be added to the PV reading to compensate sensor error.
         Offset       Default value: zero.
       e.rsp          Allows you to Enable remote SP.
 Enable Remote SP          YES     Enables the function.
                             no    Does not enable the function.
                      This parameter is not displayed when the remote SP selection is defined by a Digital Input.




NOVUS AUTOMATION                                                                                                                              19 / 63
        rsp               Defines the signal type for the remote SP.
    Remote SP type            0-20     Current of 0-20 mA.
                              4-20     Current of 4-20 mA.
                               0-5     Voltage of 0-5 V.
                              0-10     Voltage of 0-10 V.
                          Parameter displayed when remote SP is enabled.
       rsll               Remote setpoint low limit. Used in conjunction with the rSxL, scales the remote SP input defining the initial value in the
 Remote SP Low Limit      remote SP indication range.
                          Parameter displayed when remote SP is enabled.
       rskl               Remote Setpoint High Limit. defines the full-scale indication of the Remote Setpoint.
 Remote SP High Limit     Parameter displayed when remote SP is enabled.
       Spll               Defines the SP lower limit of SP.
   Setpoint Low Limit     For the linear analog input types available (0-20 mA, 4-20 mA, 0-50 mV, 0-5 V and 0-10 V), defines the minimum PV
                          indication range, besides limiting the SP adjustment.
       Spxl               Defines the upper limit for adjustment of SP.
   Setpoint High Limit    For the linear analog input types available (0-20 mA, 4-20 mA, 0-50 mV, 0-5 V and 0-10 V), defines the maximum PV
                          indication range, besides limiting the SP adjustment.
       rtll               In association with the rtxl parameter, it defines the analog retransmission scale for PV or SP. The rtll represents the.
Retransmission Low Limit minimum scale value for the analog output
                          This parameter is displayed only if the analog retransmission is selected in the I/O 5 parameter (I/O level).
       rtkl               Defines the full-scale value for the analog retransmission of PV or SP.
Retransmission High Limit This parameter is displayed only when the analog retransmission is selected in the I/O 5 parameter (I/O level).

       1eov               Percentage output value that will be transfer to MV when the SAFE output function is enabled. If 1eov = 0, the SAFE output
                          function is disabled, and the outputs are turned off in the occurrence of a sensor fail.

       bavd               Digital communication Baud Rate selection. In kbps.
       Baud Rate          1.2, 2.4, 4.8, 9.6, 19.2, 38.4, 57.6, and 115.2
       prty               Parity of the serial communication.
         Parity               none     Without parity.
                             Ewem      Even parity.
                               0dd     Odd parity.
       Addr               Slave address selection.
        Address           Identifies the controller in the network. The possible address numbers are from 1 to 247.

6.6        I/O (INPUTS AND OUTPUTS) CYCLE

      Io          1       I/O1 channel function.
                          Selection of the function used on channel I/O1.

      Io          2       I/O2 channel function.
                          Selection of the function used on channel I/O2.

      Io          3       I/O3 channel function.
                          Selection of the function used on channel I/O3.

      Io          4       I/O4 channel function.
                          Selection of the function used on channel I/O4.

      Io          5       I/O5 channel function.
                          Selection of the function used on channel I/O5.

6.7        CALIBRATION CYCLE
All the input and output types are calibrated in the factory. If a recalibration is required, this should be conducted by experienced
personnel.
If this cycle is accidentally accessed, pass through all the parameters without pressing the or keys.

       pass               Input of the Access Password.
       Password           This parameter is presented before the protected cycles.
                          See CONFIGURATION PROTECTION section.
       inL(               Enter the value corresponding to the low scale signal applied to the analog input.
  Input Low Calibration   See INPUT CALIBRATION section.
       ink(               Enter the value corresponding to the full-scale signal applied to the analog input.
 Input High Calibration   See INPUT CALIBRATION section.

NOVUS AUTOMATION                                                                                                                                20 / 63
       rsL(               Enter the value corresponding to the low scale signal applied to the remote SP input.
   Remote SP Low          See INPUT CALIBRATION section.
     Calibration

       rsk(               Enter the value corresponding to the full-scale signal applied to the remote SP input.
   Remote SP High         See INPUT CALIBRATION section.
     Calibration

       0vL(               Enter the analog low value as measured at the analog output.
Output Low Calibration    See ANALOG OUTPUT CALIBRATION section.
       0vk(               Enter the analog high value as measured at the analog output.
Output High Calibration   See ANALOG OUTPUT CALIBRATION section.
       Rstr               Restores the factory calibration for all inputs and outputs, disregarding modifications conducted by the user.
        Restore

          (j              Adjusts the of cold junction temperature value.
      Cold Junction

       ktyp               Parameter that informs the controller about the optional hardware installed. It should not be altered by the user, except when
   Hardware Type          an accessory is introduced or removed.
                                    0 Basic model. Without optional items
                                    1 485
                                    2 3R
                                    3 3R + 485
                                    4 DIO
                                    5 DIO + 485
                                    8 HBD
                                    9 HBD + 485
                          Note: The options 6 and 7 are not used.
       Pas.(              Allows defining a new access password, always different from zero.
       Password

       Prot               Sets up the Level of Protection. See Table 8.
       Protection

       Freq               Mains frequency. This parameter is important for proper noise filtering.
       Frequency


6.8        ALL PARAMETERS
      OPERATION                                                                                  CONFIGURATION              I/O            CALIBRATION
                              TUNING CYCLE          PROGRAM CYCLE            ALARM CYCLE
        CYCLE                                                                                       CYCLE                  CYCLE             CYCLE
        PV and SP                   atvn                   PR.tb               fva1 - fva4              type                 io1              pass
           (trl                      pb                    pr n                bla1 - bla4              fltr                 io2              Inl(
        PV and MV                    ir                    Ptol                kya1 - kya4              dppo                 io3              Ink(
            Epr                      dt               psp0 – psp9                     a1t1              vnit                 Io4              Rsl(
           p.seg                     (t                 pt1 – pt9                     a1t2              Root                 Io5              Rsk(
           t.seg                    Kyst                pe1 – pe9                     a2t1              Offs                                  0vl(
            Rvn                     a(t                     Lp                        a2t2              e.rsp                                 0vk(
                                   Lbd.t                                              flsh               Rsp                                  rstr
                                   bias                                                                 Rsll                                   (j
                                   ovll                                                                 Rskl                                  ktyp
                                    ovkl                                                                Spll                                  Pas.(
                                    sfst                                                                Spkl                                  prot
                               Spa1 - spa4                                                              Ieov                                  freq.
                                                                                                        Rtll
                                                                                                        rtkl
                                                                                                        Bavd
                                                                                                        Prty
                                                                                                        addr
                                                                            Table 9




NOVUS AUTOMATION                                                                                                                                      21 / 63
7       CONFIGURATION PROTECTION
The controller provides means for protecting the parameters’ configurations, not allowing modifications to the parameter values, avoiding tampering
or improper manipulation.
The parameter Protection (PROt), in the Calibration level, determines the protection strategy, limiting the access to certain levels, as shown by the
table below.

                 PROTECTION LEVEL                                              PROTECTED CYCLES
                            1                Only the Calibration level is protected.
                            2                I/O and Calibration levels.
                            3                Tuning, I/O, and Calibration levels.
                            4                Alarm, Tuning, I/O, and Calibration levels.
                            5                Programs, Alarm, Tuning, I/O, and Calibration levels.
                            6                Tuning, Programs, Alarm, Input, I/O, and Calibration levels.
                            7                Operation (except SP), Tuning, Programs, Alarm, input, I/O, and Calibration levels.
                            8                Operation, Tuning, Programs, Alarm, Input, I/O, and Calibration levels.
                                                                    Table 10

7.1     ACCESS PASSWORD
The protected levels, when accessed, request the user to provide the Access Password for granting permission to change the configuration of the
parameters on these cycles.
The prompt PASS precedes the parameters on the protected levels. If no password is entered, the parameters of the protected cycles can only be
visualized.
The Access Code is defined by the user in the parameter Password Change (PAS.(), present in the Calibration level. The factory default for the
password code is 1111.

7.2     PROTECTION OF THE ACCESS CODE
The protection system built into the controller blocks for 10 minutes the access to protected parameters after 5 consecutive frustrated attempts to
guess the correct password.

7.3     MASTER PASSWORD
The Master Password is intended for allowing the user to define a new password in the event of it being forgotten. The Master Password does not
grant access to all parameters, only to the Password Change parameter (PAS(). After defining the new password, the protected parameters may
be accessed (and modified) using this new password.
The master password is made up by the last three digits of the serial number of the controller added to the number 9000.
As an example, for the equipment with serial number 07154321, the master password is 9 3 2 1.
8       RAMPS AND SOAKS PROGRAMS
This feature allows the creation of Ramp and Soak Setpoint Profiles (Programs). Up to 20 different profiles with 9 segments each can be
programmed. Longer profiles of up to 180 segments can be created by linking 2 or more profiles together.
The figure below displays a profile model:




                                                                                 Figure 4

Once a profile is defined and selected for execution (parameter EPr in the operating level), the controller starts to generate the SP profile
automatically in accordance with the elaborated program.
To execute a profile with fewer segments just program 0 (zero) for the time intervals that follow the last segment to be executed.

                                                        SV                       SP2
                                                                     SP1
                                                                                                SP3
                                                               SP0
                                                                     T1          T2        T3    T4=0
                                                                                                             Time

                                                                                 Figure 5

The program tolerance defines the maximum deviation between PV and SP for the execution of the profile. If this deviation is exceeded, the
program will be halted until the deviation falls to within the tolerance band.
Programming 0 (zero) in the Ptol parameter disables the program tolerance and the profile execution will continue regardless of the PV value
(time priority as opposed to SP priority).
The configured time limit for each segment is 9999 and can be displayed in seconds or minutes, depending on the time base configured.

8.1     LINK OF PROGRAMS
It is possible to create a more complex program, with up to 180 segments, joining the 20 programs. This way, at the end of a program execution the
controller immediately starts to run the next one, as indicated in the LP.
To force the controller to run a given program or many programs continuously, it is only necessary to link a program to itself or the last program to
the first.
                                       SV               Program 1                               Program 2
                                                                                   SP5 / SP0             SP3
                                                                      SP4
                                                               SP3
                                                                                           SP1    SP2
                                                         SP2
                                                  SP1
                                                                                                                    SP4
                                            SP0
                                                  T1    T2     T3    T4     T5        T1         T2     T3     T4         Time


                                                                                 Figure 6


8.2     EVENT ALARM
The Event Alarm function associates the alarms with specific segments of a program. The information about which alarms are to be activated or
deactivated is given in parameters PE1 to PE9. Press the and keys until the desired alarm numbers are displayed.
The Event Alarm requires that the Alarm function be configured as rS .
Notes:
1. If PtoL is different than zero, the controller will wait for the PV to reach the first program set point SP0 to start the program execution.
    Otherwise, it will start promptly.
2. Should any power failure occur, the controller resumes the program execution at the beginning of the segment that was interrupted.




NOVUS AUTOMATION                                                                                                                               23 / 63
9         PID PARAMETERS DEFINITION
The determination (or tuning) of the PID control parameters in the controller can be conducted in an automatic way and auto-adaptive mode. The
Automatic Tuning is always initiated under request of the operator, while the Auto-Adaptive Tuning is initiated by the controller itself whenever
the control performance becomes poor.

9.1       AUTOMATIC TUNING
In the beginning of the Automatic Tuning the controller has the same behavior as an ON/OFF controller, applying minimum and maximum
performance to the process. Along the tuning process the controller's performance is refined until its conclusion, already under optimized PID
control.
It begins immediately after the selection of the options FAST, FULL, RSLF or TGHT, defined by the operator in the parameter ATUN.

9.2       AUTO-ADAPTIVE TUNING
It is initiated by the controller whenever the control performance is worse than the one found after the previous tuning.
To activate the performance supervision and Auto-Adaptive Tuning, the parameter ATUN must be adjusted for SELF, RSLF or TGHT.
The controller's behavior during the Auto-Adaptive Tuning will depend on the worsening of the present performance. If the maladjustment is small,
the tuning is almost imperceptible for the user. If the maladjustment is big, the Auto-Adaptive Tuning is like the method of Automatic Tuning,
applying minimum and maximum performance to the process in ON/OFF control.




                                                                       Figure 7




                                                                       Figure 8
The operator may select, through the ATvN parameter, the desired tuning type among the following options:
•     OFF: The controller does not carry through Automatic Tuning or Auto-Adaptive Tuning. The PID parameters will not be automatically
      determined nor optimized by the controller.
•     FAST: The controller will accomplish the process of Automatic Tuning one single time, returning to the OFF mode after finishing. The tuning
      in this mode is completed in less time, but not as precise as in the FULL mode.
•     FULL: The same as the FAST mode, but the tuning is more precise and slower, resulting in better performance of the P.I.D. control.
•     SELF: The performance of the process is monitored, and the Auto-Adaptive Tuning is automatically initiated by the controller whenever the
      performance becomes poorer.
      After a tuning cycle, the controller starts collecting data from the process for determining the performance benchmark that will allow evaluation
      of the need for future tunings. This phase is proportional to the process response time and is signaled by the flashing TUNE indication on the
      display. It is recommended not to turn the controller off or change the SP during this learning period.
•     rSLF: Accomplishes the Automatic Tuning and returns into the SELF mode. Typically used to force an immediate Automatic Tuning of a
      controller that was operating in the SELF mode, returning to this mode at the end.
•    TGHT: Like the SELF mode, but in addition to the Auto-Adaptive Tuning it also executes the Automatic Tuning whenever the controller is
     set in RvN=YES or when the controller is turned on.
Whenever the parameter ATvN is altered by the operator into a value different from OFF, an automatic tuning is immediately initiated by the
controller (if the controller is not in RvN=YES, the tuning will begin when it passes into this condition). The accomplishment of this automatic tuning
is essential for the correct operation of the auto-adaptative tuning.
The methods of Automatic Tuning and Auto-Adaptative Tuning are appropriate for most of the industrial processes. However, there may be
processes or even specific situations where the methods are not capable to determine the controller's parameters in a satisfactory way, resulting in
undesired oscillations or even taking the process to extreme conditions. The oscillations themselves imposed by the tuning methods may be
intolerable for certain processes. These possible undesirable effects must be considered before beginning the controller's use, and preventive

NOVUS AUTOMATION                                                                                                                                 24 / 63
measures must be adopted to assure the integrity of the process and users.
The TUNE signaling device will stay on during the tuning process.
In the case of PWM or pulse output, the quality of tuning will also depend on the cycle time adjusted previously by the user.
If the tuning does not result in a satisfactory control, refer to the table below for guidelines on how to correct the behavior of the process:

                                          PARAMETER                VERIFIED PROBLEM                  SOLUTION
                                                                        Slow answer                   Decrease
                                        Proportional band
                                                                       Great oscillation               Increase
                                                                        Slow answer                    Increase
                                         Integration rate
                                                                       Great oscillation              Decrease
                                                                  Slow answer or instability          Decrease
                                         Derivative time
                                                                       Great oscillation               Increase
                                                                      Table 11




NOVUS AUTOMATION                                                                                                                                  25 / 63
10       MAINTENANCE
10.1 PROBLEMS WITH THE CONTROLLER
Connection errors and inadequate programming are the most common errors found during the controller operation. A final revision may avoid loss
of time and damages.
The controller displays some messages to help the user identify problems.

                                            MESSAGE                    PROBLEM DESCRIPTION
                                               nnnn            Open input. No sensor or signal.
                                               Err1            Connection and/or configuration errors.
                                               Err6            Check the wiring and the configuration.
                                                                   Table 12

Other error messages may indicate hardware problems requiring maintenance service. When contacting the manufacturer, inform the instrument
serial number, obtained by pressing the key for more than 3 seconds.

10.2 INPUT CALIBRATION
All inputs are factory calibrated and recalibration should only be done by qualified personnel. If you are not familiar with these procedures do not
attempt to calibrate this instrument.
The calibration steps are:
a. Configure the type of input to be calibrated.
b. Configure the lower and upper limits of indication for the maximum span of the selected input type.
c. At the input terminals inject a signal corresponding to a known indication value a little above the lower display limit.
d. Access the parameter inLC. Use the keys and to adjust the display reading such as matching the applied signal. Then press the P key.
e. Inject a signal that corresponds to a value a little lower than the upper limit of indication.
f. Access the parameter inLC. Use the keys and to adjust the display reading such as matching the applied signal. Then press the P key.
Note: When checking the controller calibration with a Pt100 simulator, pay attention to the simulator minimum excitation current requirement, which
may not be compatible with the 0.170 mA excitation current provided by the controller.

10.3 ANALOG OUTPUT CALIBRATION
1)   Configure I/O 5 for the current output to be calibrated, be it control or retransmission.
2)   In the screen Ctrl, program manual mode (man).
3)   Connect a current meter to the analog output.
4)   Enter the calibration cycle with the correct password.
5)   Select the screen ovLC. Press the keys and for the controller to recognize the calibration process of the current output.
6)   Read the current indicated on the current meter and adjust the parameter ovLC to indicate this current value (use the keys and      )
7) Select the screen ovxC. Press the keys and for the controller to recognize the calibration process of the current output.
8) Read the current indicated on the current meter and adjust the parameter ovkC to indicate this current value
9) Press the key P to confirm the calibration procedure and return to the operating level.




NOVUS AUTOMATION                                                                                                                              26 / 63
11          SERIAL COMMUNICATION
The controller can be supplied with an asynchronous RS485 digital communication interface for master-slave connection to a host computer
(master).
The controller works as a slave only and all commands are started by the computer which sends a request to the slave address. The addressed
unit sends back the requested reply.
Broadcast commands (addressed to all indicator units in a multidrop network) are accepted but no reply is sent back in this case.

11.1 FEATURES
•    Signals compatible with RS485 standard. Modbus (RTU) Protocol. 2-wire connection between 1 master and up to 31 (addressing up to 247
     possible) instruments in bus topology. The communication signals are electrically insulated from the rest of the device.
•    Maximum connection distance: 1000 meters.
•    Time of disconnection for the controller: Maximum 2 ms after last byte.
•    Selectable speed; 8 data bits; 1 Stop Bit; selectable parity (no parity, pair, or odd).
•    Time at the beginning of response transmission: maximum 100 ms after receiving the command.
• There is no electrical isolation between serial communication (RS485) and channel I/O5.
The RS485 signals are:

                                         Bidirectional data line.                                                 Terminal 16
                                         Inverted bidirectional data line.                                        Terminal 17

                                         Optional connection that improves communication performance.             Terminal 18

                                                                       Table 13

11.2 CONFIGURATION OF PARAMETERS FOR SERIAL COMMUNICATION
To use the serial, you must set the following parameters:
    bavd:       Communication speed.
    prty:       Communication parity.
    addr:       Communication address for the controller.

11.3 COMMUNICATION PROTOCOL
The Modbus RTU slave is implemented. All configurable parameters can be accessed for reading or writing through the communication port.
Broadcast commands are supported as well (address 0).
The available Modbus commands are:

                                                           03        Read Holding Register
                                                           05        Force Single Coil
                                                           06        Preset Single Register
                                                           16        Preset Multiple Register


11.4 HOLDING REGISTERS TABLE
Follows a description of the usual communication registers.
For full documentation, see ATTACHMENT 1.
All registers are 16-bit signed integers.

     ADDRESS           PARAMETER                                                     REGISTER DESCRIPTION
       0000               Active SP        Read: Active control SP (main SP, from ramp and soak or from remote SP).
                                           Write: To main SP.
                                           Range: From spll to spkl.
       0001                  PV            Read: Process variable.
                                           Write: Not allowed.
                                           Range: Minimum value is the one configured in spll, and the maximum value is the one configured in
                                           spkl. Decimal point position depends on dppo value.
                                           In case of temperature reading, the value read is always multiplied by 10, independently of dppo value.




NOVUS AUTOMATION                                                                                                                             27 / 63
   ADDRESS         PARAMETER                                       REGISTER DESCRIPTION
     0002             MV       Read: Output Power in automatic or manual mode.
                               Write: Not allowed. See address 28.
                               Range: 0 to 1000 (0.0 to 100.0 %).
                                                       Table 14




NOVUS AUTOMATION                                                                          28 / 63
12     CONFIGURATION EXAMPLES
On NOVUS product page, you can download a file with configuration examples for N1200: www.novusautomation.com/en/examples_N1200.




NOVUS AUTOMATION                                                                                                                   29 / 63
13          SPECIFICATIONS
DIMENSIONS: ..................................................................................................................................................................... 48 x 48 x 110 mm (1/16 DIN)
   Panel cutout: .............................................................................................................................................................45.5 x 45.5 mm (+0.5 -0.0 mm)
   Approximate weight: ...........................................................................................................................................................................................150 g
POWER SUPPLY.................................................................................................................................................100 to 240 Vac/dc (±10 %), 50 / 60 Hz
   Optionally 24V: ...............................................................................................................................................12 to 24 Vdc / 24 Vac (-10 % / +20 %)
   Maximum consumption:...................................................................................................................................................................................... 9 VA
ENVIRONMENTAL CONDITIONS:
   Operation temperature: ............................................................................................................................................................................. 5 to 50 °C
   Storage temperature: .............................................................................................................................................................................. -20 to 60 °C
   Relative humidity: ...................................................................................................................................................................... 80 % max. @ 30 °C
   For temperatures above 30 °C, reduce 3 % for each °C.
   Internal Use | Category of installation II | Degree of pollution 2 | Altitude < 2000 m.
INPUT ..........................................................................................................................................T/C, Pt100, voltage and current (according to Table 1)
   Internal resolution: ................................................................................................................................................................ 32767 levels (15 bits)
   Display resolution: ...................................................................................................................................... 12000 levels (from - 1999 up to 9999)
   Rate of input reading: ..............................................................................................................................................................up to 55 per second
      Accuracy: ............................................................................................................................. Thermocouples J, K, T, E: 0.25 % of the span ±1 °C
      ............................................................................................................................................... Thermocouples N, R, S, B: 0.25 % of the span ±3 °C
      .............................................................................................................................................................................................Pt100: 0.2 % of the span
      .......................................................................................................................................... 4-20 mA, 0-50 mV, 0-5 Vdc, 0-10 Vdc: 0.2 % of the span
      Input Impedance: ................................................................................................................................... 0-50 mV, Pt100, Thermocouples: >10 MΩ
      .............................................................................................................................................................................................................. 0-5 V: >1 MΩ
      ..............................................................................................................................................................................4-20 mA: 15 Ω (+2 Vdc @ 20 mA)
      Measurement of Pt100: .........................................3-wire type, (α=0.00385) with compensation for cable length, excitation current of 0.170 mA
      All input and output types are factory calibrated. Thermocouples according to standard NBR 12771 / 99, RTD’s NBR 13773 / 97.
ANALOGICAL OUTPUT (I/O5): ..................................................................................................................................0-20 mA or 4-20 mA, 550Ω max.
   31000 levels, insulated, for control or retransmission of PV and SP.
CONTROL OUTPUT: ................................................................................................. 2 Relays SPST-NO (I/O1 and I/O2): 1.5 A / 240 Vac, typical use
   ........................................................................................................................................................ 1 Relay SPDT (I/O3): 3 A / 250 Vac, typical use
   .......................................................................................................................................................Voltage pulse for SSR (I/O5): 10 V max. / 20 mA
   .......................................................................................................................................... Voltage pulse for SSR (I/O3 and I/O4): 5 V max. / 20 mA
ELECTROMAGNETIC COMPATIBILITY: .......................................................................................................................... EN 61326-1 and EN 61326-1
SAFETY: ...............................................................................................................................................................................EN61010-1 and EN61010-1
USB INTERFACE: ........................................................................... USB Mini B 2.0, CDC Class (virtual communications port), Modbus RTU protocol
SPECIFIC CONNECTIONS FOR TYPE FORK TERMINALS OF 6.3 mm.
FRONT PANEL: .............................................................................................................................................................IP65, polycarbonate - UL94 V-2
HOUSING: ................................................................................................................................................................................ IP20, ABS+PC UL94 V-0
START-UP OPERATION: .................................................................................................... 3 seconds after connecting the device to the power supply
CERTIFICATIONS: .......................................................................................................................................................................CE, UL (FILE: 300526)




NOVUS AUTOMATION                                                                                                                                                                                                        30 / 63
14       IDENTIFICATION
                                               N1200 -              3R -               485 -               24V
                                                 A                   B                  C                   D
A: Controller Model:
   N1200

B: Optional I/O:
        Blank     (basic version, without I/O3 nor I/O4)
           3R     (SPDT Relay in I/O3)
          DIO     (Digital I/Os in I/O3 and I/O4)
         HBD      (Burnt-Out Resistance detection)


C: Digital Communication:
        Blank     (basic version, without serial communication);
         4851     (RS485, Modbus protocol)

D: Power Supply:
        Blank     (basic version, 100 to 240 Vac/dc input)
          24V     (12 to 24 Vdc / 24 Vac input voltage)




1 The RS485 interface uses a 1/4 UL (Unit Load) class transceiver. According to the TIA/EIA-485 standard, this allows the hardware to support addressing up to 128

devices on the same physical bus without the need for repeaters. The actual maximum number of devices in a network also depends on the Unit Load class of the
other equipment connected to the same bus.
NOVUS AUTOMATION                                                                                                                                            31 / 63
15      WARRANTY
Warranty conditions are available on our website www.novusautomation.com/warranty.




NOVUS AUTOMATION                                                                     32 / 63
16       ATTACHMENT 1 – COMMUNICATION PROTOCOL
16.1 COMMUNICATION INTERFACE
The optional RS485 serial interface allows you to address up to 247 networked controllers, communicating remotely with a computer or master
controller.

16.2 RS485 INTERFACE
•    Compatible line signals with RS485 standard.
•    3-wire connection between master and up to 31 slaves in a bus topology. With converters with multiples outputs, it is possible to address up to
     247 nodes.
•    Maximum communication distance: 1000 meters.
•    The RS485 signals are:

                                           Bidirectional data line.                                                Terminal 16
                                           Inverted bidirectional data line.                                       Terminal 17

                                           Optional connection that improves communication performance.            Terminal 18

                                                                         Table 15


16.3 GENERAL FEATURES
•    Serial interface optical isolation.
•    Programmable Baud Rate: 1200, 2400, 4800, 9600, 19200, 38400, 57600 or 115200 bps.
•    Data Bits: 8
•    Parity: None, Even or Odd.
•    Stop Bits: 1

16.4 COMMUNICATION PROTOCOL
The device supports slave Modbus RTU protocol, available in most supervisory software found in the market.
Using the Register Tables, you can access (read and/or write) the controller configurable parameters. By using address 0, it is possible to write to
the registers in Broadcast mode.
The available Modbus commands are the following:
                                                             03        Read Holding Register
                                                             05        Force Single Coil
                                                             06        Preset Single Register
                                                             16        Preset Multiple Register

The registers are presented in a table, so that it is possible to read several registers with one request.

16.4.1      SETTING THE COMMUNICATION PARAMETERS
To use the serial, you must set 3 parameters:
bavd: Communication baud rate. All devices have the same baud rate.
addr: Controller communication address. Each controller must have a unique address.
PrtY: Parity.




NOVUS AUTOMATION                                                                                                                              33 / 63
16.4.2     REGISTER MAP
Same as the Holding Registers (reference 4X). The registers are the internal parameters of the controller. Most of the registers up to address 12
are read-only. Check each case.
Each parameter in the table is a 16-bit word with sign represented as a 2 complement.

   HOLDING
                       PARAMETER                                                  REGISTER DESCRIPTION
  REGISTERS
                                            Read: Active control Setpoint (from main screen, Ramps and Soaks, or remote Setpoint).
         0000             Active SP         Write: Control Setpoint on the main screen.
                                            Maximum range: From spll to the value set in spkl.
                                            Read: Process variable.
                                            Write: Not allowed.
         0001                PV             Maximum range: The minimum value is the value set in spll. The maximum value is the value set in
                                            spkl. The position of the decimal point depends on the dppo screen.
                                            When reading the temperature, the value will always be multiplied by 10, regardless of the dppo
                                            value.
                                            Read: Power output enabled (manual or automatic).
                                            Write: When in manual mode, it allows you to write the MV. When in automatic mode, this register is
         0002                MV
                                            Read Only.
                                            Range: 0 to 1000 (0.0 to 100.0 %).
                                            Read/Write: Input type selected for the remote SP.
         0003            Remote SP
                                            Range: 0 – 3
                                            Read: Value on the current screen.
         0004           Screen value        Write: Value on the current screen.
                                            Maximum range: -1999 to 9999. The range depends on the screen shown.
                                            Read: Number of the current screen.
                                            Write: Not allowed. Range: 0000 h a 060 Ch.
         0005          Screen number        Screen number formation: XXYYh, where:
                                            XX → Number of the screen cycle
                                            YY → Screen number
                                            Read: Controller status Bits.
         0006          Status Word 1        Write: Not allowed.
                                            Read value: See STATUS WORDS section.
                                            Read: Controller software version.
         0007         Software Version      Write: Not allowed.
                                            Read values: If the equipment version is V1.00, for example, the read value will be 100.
                                            Read: Device identification number.
                                            Write: Not allowed.
         0008                ID
                                            Read value: 48 (30 h) for N1200.
                                            Read value: 18 (12 h) for N1200-HC.
                                            Read: Controller status Bits.
         0009          Status Word 2        Write: Not allowed.
                                            Read value: See STATUS WORDS section.
                                            Read: Controller status Bits.
         0010          Status Word 3        Write: Not allowed.
                                            Read value: See STATUS WORDS section.
                                            Integral rate (in repetitions/min).
         0011                Ir
                                            Range: 0 to 9999 (0.00 to 99.99).
                                            Derivative time (in seconds).
         0012                dt
                                            Range: 0 to 3000 (0.0 to 300.0).
                                            Proportional band (in percent).
         0013                pb
                                            Range: 0 to 5000 (0.0 to 500.0).
                                            Read/Write: Time base for Ramps and Soaks.
         0014              Pr.tb
                                            Range: 0 – 1 (seconds/minutes).


NOVUS AUTOMATION                                                                                                                           34 / 63
   HOLDING
                     PARAMETER                                                REGISTER DESCRIPTION
  REGISTERS
                                        PWM cycle period (in seconds).
      0015                ct
                                        Range: 5 to 1000 (0.5 to 100.0).
                                        Read/Write: Power grid frequency.
      0016               Freq
                                        Range: 0 – 1 (60/50 Hz).
                                        On/Off control hysteresis (on the engineering unit of the selected type).
      0017               Kyst
                                        Range: 0 to spkl – spll
                                        Read/Write: Filter strength on PV reading.
      0018               fltr
                                        Range: 0 – 20
                                        Lower limit of output power.
      0019               Ovll
                                        Range: 0 to 1000 (0.0 to 100.0 %).
                                        Upper limit of output power.
      0020               ovkl
                                        Range: 0 to 1000 (0.0 to 100.0 %).
   0021~0022           Reserved         Internal use.
                                        First four numbers of the serial number.
      0023         Serial number high
                                        Range: 0 to 9999. Read-only.
                                        Last four numbers of the serial number.
      0024         Serial number low
                                        Range: 0 to 9999. Read-only.
                                        Control Setpoint (Screen Setpoint).
      0025                SV
                                        Range: From spll to spkl.
                                        Setpoint lower limit.
      0026               spll           Range: The minimum value depends on the input type set in type (see Table 1). The maximum
                                        value is the value set in spkl.
                                        Setpoint upper limit.
      0027               Spkl
                                        Range: From spll to the maximum allowed for the selected input in type (see Table 1).
     0028              Reserved         Internal use.
                                        PV (Process Variable) Offset value.
      0029               offs
                                        Range: From spll to spkl.

                                        PV decimal point position. Range: 0 to 3.
                                        0 → X.XXX
      0030               dppo           1 → XX.XX
                                        2 → XXX.X
                                        3 → XXXX
      0031               Sp.a1
      0032               Sp.a2
                                        Alarm Setpoint.
      0033               Sp.a3
      0034               Sp.a4
      0035               Fva1           Alarm function. Range: 0 to 10.
      0036               Fva2           0 → off
                                        1 →ierr
      0037               Fva3
                                        2 → rs
                                        3 → lo
                                        4 → ki
                                        5 → dif
      0038               Fva4           6 → difl
                                        7 → difk
                                        8 → kbl
                                        9 → kbk
                                        10 → kblk
      0039               Kya1           Alarm 1 hysteresis.

NOVUS AUTOMATION                                                                                                                35 / 63
   HOLDING
                   PARAMETER                                         REGISTER DESCRIPTION
  REGISTERS
      0040           Kya2      Range: 0 to 9999 (0.00 to 99.99 %).

      0041           Kya3
      0042           Kya4
                               Type of PV input sensor.
      0043           type
                               Range: 0 to 22.
      0044           addr      Slave address. Range: 1 to 247
                               Communication Baud Rate.
                               Range: 0 to 7.
                               0 → 1200
                               1 → 2400
                               2 → 4800
      0045           bavd
                               3 → 9600
                               4 → 19200
                               5 → 32400
                               6 → 57600
                               7 → 115200
                               Control mode.
                               Range:
      0046           avto
                               0 → Manual
                               1 → Automatic
                               Enable control.
                               Range:
      0047            rvn
                               0 → No
                               1 → Yes
                               Control action.
                               Range:
      0048            act
                               0 → Direct
                               1 → Reverse
                               Enable Autotuning.
                               Range:
      0049           atvn
                               0 → No
                               1 → Yes
      0050           Bla1      Alarm 1 initial blocking.
      0051           Bla2      Range:
      0052           Bla3      0 → No

      0053                     1 → Yes
                     Bla4
                               Remote action of the pressed key.
                               Range: 0 to 9.
                               1 → P key
      0054           Tecla     2 → ∧ key
                               4 → ∨ key
                               8 → < key
                               9 → P and < keys
                               Remote Setpoint lower limit.
      0055           rsll      Range: The minimum value depends on the input type set in type. The maximum value is the value
                               set in rskl.
                               Remote Setpoint upper limit.
      0056           rskl      Range: The minimum value is the value set in rsll. The maximum value depends on the input type
                               set in type.
      0057           Io 1      I/O channel function.

NOVUS AUTOMATION                                                                                                        36 / 63
   HOLDING
                      PARAMETER                                                     REGISTER DESCRIPTION
  REGISTERS
      0058                Io 2
      0059                Io 3
      0060                Io 4
      0061                Io 5
                                            Time 1 of alarm timer 1.
      0062                A1t1
                                            Range: 0 to 6500 s.
                                            Time 2 of alarm timer 1 (in seconds).
      0063                A1t2
                                            Range: Same as in a1t1.
                                            Time 1 of alarm timer 2 (in seconds).
      0064                A2t1
                                            Range: Same as in a1t1.
                                            Time 2 of alarm timer 2 (in seconds).
      0065                A2t2
                                            Range: Same as in a1t1.
                                            Time de Soft Start (in seconds).
      0066                sfst
                                            Range: 0 to 9999.
                                            Temperature unity.
                                            Range: 0 to 1.
      0067                vnit
                                            0 → °C
                                            1 → °F
      0068                bias              Bias. Range: -100 to 100 %.
      0069              Reserved            Internal use.
                                            Running Ramps and Soaks segment number (read-only).
      0070            R&S Segment
                                            Range: 0 to 9.
                                            Ramps and Soaks program to be viewed (edited).
      0071                Pr n
                                            Range: 1 to 20.
                                            Ramps and Soaks program being executed.
      0072                E Pr
                                            Range: 0 to 20.
      0073         R&S Time remaining       Indicates the remaining time of the Ramps and Soaks segment.
                                            Square root of a linear input.
                                            Range:
      0074                Sqrt
                                            0 → Disable
                                            1 → Enable
      0075         PV Calibration (Start)   Calibration operator to enter the range start value currently applied to the PV input.
      0076         PV Calibration (End)     Calibration operator to enter the end-of-range value currently applied to the PV input.
                    Remote Setpoint
      0077                                  Calibration operator to enter the range start value currently applied to the Remote Setpoint input.
                    Calibration (Start)
                     Remote Setpoint
      0078                                  Calibration operator to enter the end-of-range value currently applied to the Remote Setpoint input.
                     Calibration (End)
      0079                RTLL              Retransmission lower limit.
      0080                RTkL              Retransmission upper limit.
                                            Enables the flashing upper display feature depending on the selected alarm.
      0081                FLSH
                                            Range: 0 to 15.
                                            Time 1 of alarm timer 3 (in seconds).
      0082                A3T1
                                            Range: Same as in a1t1.
                                            Time 2 of alarm timer 3 (in seconds).
      0083                A3T2
                                            Range: Same as in a1t2.
                                            Time 1 of alarm timer 4 (in seconds).
      0084                A4T1
                                            Range: Same as in a1t1.
                                            Time 2 of alarm timer 4 (in seconds).
      0085                A4T2
                                            Range: Same as in a1t2.
NOVUS AUTOMATION                                                                                                                                  37 / 63
   HOLDING
                   PARAMETER                                        REGISTER DESCRIPTION
  REGISTERS
                               Restores factory calibration.
                               Range: 0 to 1
      0086           Rstr
                               0 → No restore
                               1 → Restore calibration
     0087            PASS      Write the password. Always read 0.
                               Password protection level used.
      0088           Prot
                               Range: 1 to 7.
                               Serial channel parity.
                               Range: 0 to 2
      0089           PRTY      0 → No parity
                               1 → Even
                               2 → Odd
     0090~
                    Reserved   Internal use.
      0097
                               Enable remote Setpoint.
                               Range:
      0098           ersp
                               0 → Remote Setpoint depends on the I/O configuration
                               1 → Forces remote Setpoint
      0099          Reserved   Internal use.
                               Segment 1 event of program 1 (R&S).
      0100            Pe1
                               Range: 0 to 15.
                               Segment 2 event of program 1 (R&S).
      0101            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 1 (R&S).
      0102            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 1 (R&S).
      0103            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 1 (R&S).
      0104            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 1 (R&S).
      0105            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 1 (R&S).
      0106            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 1 (R&S).
      0107            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 1 (R&S).
      0108            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 2 (R&S).
      0109            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 2 (R&S).
      0110            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 2 (R&S).
      0111            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 2 (R&S).
      0112            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 2 (R&S).
      0113            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 2 (R&S).
      0114            Pe6
                               Range: Same as in pe1.

NOVUS AUTOMATION                                                                           38 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 7 event of program 2 (R&S).
      0115            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 2 (R&S).
      0116            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 2 (R&S).
      0117            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 3 (R&S).
      0119            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 3 (R&S).
      0120            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 3 (R&S).
      0118            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 3 (R&S).
      0121            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 3 (R&S).
      0122            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 3 (R&S).
      0123            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 3 (R&S).
      0124            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 3 (R&S).
      0125            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 3 (R&S).
      0126            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 4 (R&S).
      0127            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 4 (R&S).
      0128            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 4 (R&S).
      0129            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 4 (R&S).
      0130            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 4 (R&S).
      0131            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 4 (R&S).
      0132            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 4 (R&S).
      0133            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 4 (R&S).
      0134            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 4 (R&S).
      0135            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 5 (R&S).
      0136            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 5 (R&S).
      0137            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 5 (R&S).
      0138            Pe3
                               Range: Same as in pe1.



NOVUS AUTOMATION                                                                        39 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 4 event of program 5 (R&S).
      0139            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 5 (R&S).
      0140            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 5 (R&S).
      0141            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 5 (R&S).
      0142            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 5 (R&S).
      0143            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 5 (R&S).
      0144            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 6 (R&S).
      0145            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 6 (R&S).
      0146            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 6 (R&S).
      0147            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 6 (R&S).
      0148            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 6 (R&S).
      0149            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 6 (R&S).
      0150            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 6 (R&S).
      0151            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 6 (R&S).
      0152            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 6 (R&S).
      0153            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 7 (R&S).
      0154            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 7 (R&S).
      0155            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 7 (R&S).
      0156            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 7 (R&S).
      0157            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 7 (R&S).
      0158            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 7 (R&S).
      0159            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 7 (R&S).
      0160            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 7 (R&S).
      0161            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 7 (R&S).
      0162            Pe9
                               Range: Same as in pe1.



NOVUS AUTOMATION                                                                        40 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 1 event of program 8 (R&S).
      0163            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 8 (R&S).
      0164            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 8 (R&S).
      0165            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 8 (R&S).
      0166            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 8 (R&S).
      0167            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 8 (R&S).
      0168            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 8 (R&S).
      0169            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 8 (R&S).
      0170            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 8 (R&S).
      0171            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 9 (R&S).
      0172            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 9 (R&S).
      0173            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 9 (R&S).
      0174            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 9 (R&S).
      0175            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 9 (R&S).
      0176            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 9 (R&S).
      0177            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 9 (R&S).
      0178            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 9 (R&S).
      0179            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 9 (R&S).
      0180            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 10 (R&S).
      0181            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 10 (R&S).
      0182            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 10 (R&S).
      0183            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 10 (R&S).
      0184            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 10 (R&S).
      0185            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 10 (R&S).
      0186            Pe6
                               Range: Same as in pe1.



NOVUS AUTOMATION                                                                        41 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 7 event of program 10 (R&S).
      0187            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 10 (R&S).
      0188            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 10 (R&S).
      0189            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 11 (R&S).
      0190            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 11 (R&S).
      0191            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 11 (R&S).
      0192            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 11 (R&S).
      0193            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 11 (R&S).
      0194            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 11 (R&S).
      0195            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 11 (R&S).
      0196            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 11 (R&S).
      0197            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 11 (R&S).
      0198            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 12 (R&S).
      0199            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 12 (R&S).
      0200            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 12 (R&S).
      0201            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 12 (R&S).
      0202            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 12 (R&S).
      0203            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 12 (R&S).
      0204            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 12 (R&S).
      0205            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 12 (R&S).
      0206            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 12 (R&S).
      0207            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 13 (R&S).
      0208            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 13 (R&S).
      0209            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 13 (R&S).
      0210            Pe3
                               Range: Same as in pe1.



NOVUS AUTOMATION                                                                        42 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 4 event of program 13 (R&S).
      0211            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 13 (R&S).
      0212            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 13 (R&S).
      0213            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 13 (R&S).
      0214            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 13 (R&S).
      0215            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 13 (R&S).
      0216            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 14 (R&S).
      0217            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 14 (R&S).
      0218            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 14 (R&S).
      0219            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 14 (R&S).
      0220            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 14 (R&S).
      0221            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 14 (R&S).
      0222            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 14 (R&S).
      0223            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 14 (R&S).
      0224            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 14 (R&S).
      0225            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 15 (R&S).
      0226            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 15 (R&S).
      0227            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 15 (R&S).
      0228            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 15 (R&S).
      0229            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 15 (R&S).
      0230            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 15 (R&S).
      0231            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 15 (R&S).
      0232            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 15 (R&S).
      0233            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 15 (R&S).
      0234            Pe9
                               Range: Same as in pe1.



NOVUS AUTOMATION                                                                        43 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 1 event of program 16 (R&S).
      0235            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 16 (R&S).
      0236            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 16 (R&S).
      0237            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 16 (R&S).
      0238            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 16 (R&S).
      0239            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 16 (R&S).
      0240            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 16 (R&S).
      0241            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 16 (R&S).
      0242            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 16 (R&S).
      0243            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 17 (R&S).
      0244            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 17 (R&S).
      0245            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 17 (R&S).
      0246            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 17 (R&S).
      0247            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 17 (R&S).
      0248            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 17 (R&S).
      0249            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 17 (R&S).
      0250            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 17 (R&S).
      0251            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 17 (R&S).
      0252            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 18 (R&S).
      0253            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 18 (R&S).
      0254            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 18 (R&S).
      0255            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 18 (R&S).
      0256            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 18 (R&S).
      0257            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 18 (R&S).
      0258            Pe6
                               Range: Same as in pe1.



NOVUS AUTOMATION                                                                        44 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Segment 7 event of program 18 (R&S).
      0259            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 18 (R&S).
      0260            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 18 (R&S).
      0261            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 19 (R&S).
      0262            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 19 (R&S).
      0263            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 19 (R&S).
      0264            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 19 (R&S).
      0265            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 19 (R&S).
      0266            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 19 (R&S).
      0267            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 19 (R&S).
      0268            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 19 (R&S).
      0269            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 19 (R&S).
      0270            Pe9
                               Range: Same as in pe1.
                               Segment 1 event of program 20 (R&S).
      0271            Pe1
                               Range: Same as in pe1 of program 1.
                               Segment 2 event of program 20 (R&S).
      0272            Pe2
                               Range: Same as in pe1.
                               Segment 3 event of program 20 (R&S).
      0273            Pe3
                               Range: Same as in pe1.
                               Segment 4 event of program 20 (R&S).
      0274            Pe4
                               Range: Same as in pe1.
                               Segment 5 event of program 20 (R&S).
      0275            Pe5
                               Range: Same as in pe1.
                               Segment 6 event of program 20 (R&S).
      0276            Pe6
                               Range: Same as in pe1.
                               Segment 7 event of program 20 (R&S).
      0277            Pe7
                               Range: Same as in pe1.
                               Segment 8 event of program 20 (R&S).
      0278            Pe8
                               Range: Same as in pe1.
                               Segment 9 event of program 20 (R&S).
      0279            Pe9
                               Range: Same as in pe1.
                               Program 1 tolerance (Ramps and Soaks).
      0280           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 2 tolerance (Ramps and Soaks).
      0281           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 3 tolerance (Ramps and Soaks).
      0282           ptol
                               Range: 0 to (spkl - spll) value.



NOVUS AUTOMATION                                                                        45 / 63
   HOLDING
                   PARAMETER                                       REGISTER DESCRIPTION
  REGISTERS
                               Program 4 tolerance (Ramps and Soaks).
      0283           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 5 tolerance (Ramps and Soaks).
      0284           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 6 tolerance (Ramps and Soaks).
      0285           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 7 tolerance (Ramps and Soaks).
      0286           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 8 tolerance (Ramps and Soaks).
      0287           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 9 tolerance (Ramps and Soaks).
      0288           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 10 tolerance (Ramps and Soaks).
      0289           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 11 tolerance (Ramps and Soaks).
      0290           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 12 tolerance (Ramps and Soaks).
      0291           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 13 tolerance (Ramps and Soaks).
      0292           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 14 tolerance (Ramps and Soaks).
      0293           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 15 tolerance (Ramps and Soaks).
      0294           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 16 tolerance (Ramps and Soaks).
      0295           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 17 tolerance (Ramps and Soaks).
      0296           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 18 tolerance (Ramps and Soaks).
      0297           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 19 tolerance (Ramps and Soaks).
      0298           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 20 tolerance (Ramps and Soaks).
      0299           ptol
                               Range: 0 to (spkl - spll) value.
                               Program 1 link (Ramps and Soaks).
      0300            lp
                               Range: 0 to 20.
                               Program 2 link (Ramps and Soaks).
      0301            lp
                               Range: 0 to 20.
                               Program 3 link (Ramps and Soaks).
      0302            lp
                               Range: 0 to 20.
                               Program 4 link (Ramps and Soaks).
      0303            lp
                               Range: 0 to 20.
                               Program 5 link (Ramps and Soaks).
      0304            lp
                               Range: 0 to 20.
                               Program 6 link (Ramps and Soaks).
      0305            lp
                               Range: 0 to 20.
                               Program 7 link (Ramps and Soaks).
      0306            lp
                               Range: 0 to 20.



NOVUS AUTOMATION                                                                          46 / 63
   HOLDING
                   PARAMETER                                        REGISTER DESCRIPTION
  REGISTERS
                               Program 8 link (Ramps and Soaks).
      0307            lp
                               Range: 0 to 20.
                               Program 9 link (Ramps and Soaks).
      0308            lp
                               Range: 0 to 20.
                               Program 10 link (Ramps and Soaks).
      0309            lp
                               Range: 0 to 20.
                               Program 11 link (Ramps and Soaks).
      0310            lp
                               Range: 0 to 20.
                               Program 12 link (Ramps and Soaks).
      0311            lp
                               Range: 0 to 20.
                               Program 13 link (Ramps and Soaks).
      0312            lp
                               Range: 0 to 20.
                               Program 14 link (Ramps and Soaks).
      0313            lp
                               Range: 0 to 20.
                               Program 15 link (Ramps and Soaks).
      0314            lp
                               Range: 0 to 20.
                               Program 16 link (Ramps and Soaks).
      0315            lp
                               Range: 0 to 20.
                               Program 17 link (Ramps and Soaks).
      0316            lp
                               Range: 0 to 20.
                               Program 18 link (Ramps and Soaks).
      0317            lp
                               Range: 0 to 20.
                               Program 19 link (Ramps and Soaks).
      0318            lp
                               Range: 0 to 20.
                               Program 20 link (Ramps and Soaks).
      0319            lp
                               Range: 0 to 20.
      0320            Pt1      Time 1 of program 1. Range: 0 to 9999 minutes.
      0321            Pt2      Time 2 of program 1. Range: 0 to 9999 minutes.
      0322            Pt3      Time 3 of program 1. Range: 0 to 9999 minutes.
      0323            Pt4      Time 4 of program 1. Range: 0 to 9999 minutes.
      0324            Pt5      Time 5 of program 1. Range: 0 to 9999 minutes.
      0325            Pt6      Time 6 of program 1. Range: 0 to 9999 minutes.
      0326            Pt7      Time 7 of program 1. Range: 0 to 9999 minutes.
      0327            Pt8      Time 8 of program 1. Range: 0 to 9999 minutes.
      0328            Pt9      Time 9 of program 1. Range: 0 to 9999 minutes.
      0329            Pt1      Time 1 of program 2. Range: 0 to 9999 minutes.
      0330            Pt2      Time 2 of program 2. Range: 0 to 9999 minutes.
      0331            Pt3      Time 3 of program 2. Range: 0 to 9999 minutes.
      0332            Pt4      Time 4 of program 2. Range: 0 to 9999 minutes.
      0333            Pt5      Time 5 of program 2. Range: 0 to 9999 minutes.
      0334            Pt6      Time 6 of program 2. Range: 0 to 9999 minutes.
      0335            Pt7      Time 7 of program 2. Range: 0 to 9999 minutes.
      0336            Pt8      Time 8 of program 2. Range: 0 to 9999 minutes.
      0337            Pt9      Time 9 of program 2. Range: 0 to 9999 minutes.
      0338            Pt1      Time 1 of program 3. Range: 0 to 9999 minutes.
      0339            Pt2      Time 2 of program 3. Range: 0 to 9999 minutes.
      0340            Pt3      Time 3 of program 3. Range: 0 to 9999 minutes.

NOVUS AUTOMATION                                                                           47 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
      0341            Pt4      Time 4 of program 3. Range: 0 to 9999 minutes.
      0342            Pt5      Time 5 of program 3. Range: 0 to 9999 minutes.
      0343            Pt6      Time 6 of program 3. Range: 0 to 9999 minutes.
      0344            Pt7      Time 7 of program 3. Range: 0 to 9999 minutes.
      0345            Pt8      Time 8 of program 3. Range: 0 to 9999 minutes.
      0346            Pt9      Time 9 of program 3. Range: 0 to 9999 minutes.
      0347            Pt1      Time 1 of program 4. Range: 0 to 9999 minutes.
      0348            Pt2      Time 2 of program 4. Range: 0 to 9999 minutes.
      0349            Pt3      Time 3 of program 4. Range: 0 to 9999 minutes.
      0350            Pt4      Time 4 of program 4. Range: 0 to 9999 minutes.
      0351            Pt5      Time 5 of program 4. Range: 0 to 9999 minutes.
      0352            Pt6      Time 6 of program 4. Range: 0 to 9999 minutes.
      0353            Pt7      Time 7 of program 4. Range: 0 to 9999 minutes.
      0354            Pt8      Time 8 of program 4. Range: 0 to 9999 minutes.
      0355            Pt9      Time 9 of program 4. Range: 0 to 9999 minutes.
      0356            Pt1      Time 1 of program 5. Range: 0 to 9999 minutes.
      0357            Pt2      Time 2 of program 5. Range: 0 to 9999 minutes.
      0358            Pt3      Time 3 of program 5. Range: 0 to 9999 minutes.
      0359            Pt4      Time 4 of program 5. Range: 0 to 9999 minutes.
      0360            Pt5      Time 5 of program 5. Range: 0 to 9999 minutes.
      0361            Pt6      Time 6 of program 5. Range: 0 to 9999 minutes.
      0362            Pt7      Time 7 of program 5. Range: 0 to 9999 minutes.
      0363            Pt8      Time 8 of program 5. Range: 0 to 9999 minutes.
      0364            Pt9      Time 9 of program 5. Range: 0 to 9999 minutes.
      0365            Pt1      Time 1 of program 6. Range: 0 to 9999 minutes.
      0366            Pt2      Time 2 of program 6. Range: 0 to 9999 minutes.
      0367            Pt3      Time 3 of program 6. Range: 0 to 9999 minutes.
      0368            Pt4      Time 4 of program 6. Range: 0 to 9999 minutes.
      0369            Pt5      Time 5 of program 6. Range: 0 to 9999 minutes.
      0370            Pt6      Time 6 of program 6. Range: 0 to 9999 minutes.
      0371            Pt7      Time 7 of program 6. Range: 0 to 9999 minutes.
      0372            Pt8      Time 8 of program 6. Range: 0 to 9999 minutes.
      0373            Pt9      Time 9 of program 6. Range: 0 to 9999 minutes.
      0374            Pt1      Time 1 of program 7. Range: 0 to 9999 minutes.
      0375            Pt2      Time 2 of program 7. Range: 0 to 9999 minutes.
      0376            Pt3      Time 3 of program 7. Range: 0 to 9999 minutes.
      0377            Pt4      Time 4 of program 7. Range: 0 to 9999 minutes.
      0378            Pt5      Time 5 of program 7. Range: 0 to 9999 minutes.
      0379            Pt6      Time 6 of program 7. Range: 0 to 9999 minutes.
      0380            Pt7      Time 7 of program 7. Range: 0 to 9999 minutes.
      0381            Pt8      Time 8 of program 7. Range: 0 to 9999 minutes.
      0382            Pt9      Time 9 of program 7. Range: 0 to 9999 minutes.
      0383            Pt1      Time 1 of program 8. Range: 0 to 9999 minutes.
      0384            Pt2      Time 2 of program 8. Range: 0 to 9999 minutes.

NOVUS AUTOMATION                                                                         48 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
      0385            Pt3      Time 3 of program 8. Range: 0 to 9999 minutes.
      0386            Pt4      Time 4 of program 8. Range: 0 to 9999 minutes.
      0387            Pt5      Time 5 of program 8. Range: 0 to 9999 minutes.
      0388            Pt6      Time 6 of program 8. Range: 0 to 9999 minutes.
      0389            Pt7      Time 7 of program 8. Range: 0 to 9999 minutes.
      0390            Pt8      Time 8 of program 8. Range: 0 to 9999 minutes.
      0391            Pt9      Time 9 of program 8. Range: 0 to 9999 minutes.
      0392            Pt1      Time 1 of program 9. Range: 0 to 9999 minutes.
      0393            Pt2      Time 2 of program 9. Range: 0 to 9999 minutes.
      0394            Pt3      Time 3 of program 9. Range: 0 to 9999 minutes.
      0395            Pt4      Time 4 of program 9. Range: 0 to 9999 minutes.
      0396            Pt5      Time 5 of program 9. Range: 0 to 9999 minutes.
      0397            Pt6      Time 6 of program 9. Range: 0 to 9999 minutes.
      0398            Pt7      Time 7 of program 9. Range: 0 to 9999 minutes.
      0399            Pt8      Time 8 of program 9. Range: 0 to 9999 minutes.
      0400            Pt9      Time 9 of program 9. Range: 0 to 9999 minutes.
      0401            Pt1      Time 1 of program 10. Range: 0 to 9999 minutes.
      0402            Pt2      Time 2 of program 10. Range: 0 to 9999 minutes.
      0403            Pt3      Time 3 of program 10. Range: 0 to 9999 minutes.
      0404            Pt4      Time 4 of program 10. Range: 0 to 9999 minutes.
      0405            Pt5      Time 5 of program 10. Range: 0 to 9999 minutes.
      0406            Pt6      Time 6 of program 10. Range: 0 to 9999 minutes.
      0407            Pt7      Time 7 of program 10. Range: 0 to 9999 minutes.
      0408            Pt8      Time 8 of program 10. Range: 0 to 9999 minutes.
      0409            Pt9      Time 9 of program 10. Range: 0 to 9999 minutes.
      0410            Pt1      Time 1 of program 11. Range: 0 to 9999 minutes.
      0411            Pt2      Time 2 of program 11. Range: 0 to 9999 minutes.
      0412            Pt3      Time 3 of program 11. Range: 0 to 9999 minutes.
      0413            Pt4      Time 4 of program 11. Range: 0 to 9999 minutes.
      0414            Pt5      Time 5 of program 11. Range: 0 to 9999 minutes.
      0415            Pt6      Time 6 of program 11. Range: 0 to 9999 minutes.
      0416            Pt7      Time 7 of program 11. Range: 0 to 9999 minutes.
      0417            Pt8      Time 8 of program 11. Range: 0 to 9999 minutes.
      0418            Pt9      Time 9 of program 11. Range: 0 to 9999 minutes.
      0419            Pt1      Time 1 of program 12. Range: 0 to 9999 minutes.
      0420            Pt2      Time 2 of program 12. Range: 0 to 9999 minutes.
      0421            Pt3      Time 3 of program 12. Range: 0 to 9999 minutes.
      0422            Pt4      Time 4 of program 12. Range: 0 to 9999 minutes.
      0423            Pt5      Time 5 of program 12. Range: 0 to 9999 minutes.
      0424            Pt6      Time 6 of program 12. Range: 0 to 9999 minutes.
      0425            Pt7      Time 7 of program 12. Range: 0 to 9999 minutes.
      0426            Pt8      Time 8 of program 12. Range: 0 to 9999 minutes.
      0427            Pt9      Time 9 of program 12. Range: 0 to 9999 minutes.
      0428            Pt1      Time 1 of program 13. Range: 0 to 9999 minutes.

NOVUS AUTOMATION                                                                         49 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
      0429            Pt2      Time 2 of program 13. Range: 0 to 9999 minutes.
      0430            Pt3      Time 3 of program 13. Range: 0 to 9999 minutes.
      0431            Pt4      Time 4 of program 13. Range: 0 to 9999 minutes.
      0432            Pt5      Time 5 of program 13. Range: 0 to 9999 minutes.
      0433            Pt6      Time 6 of program 13. Range: 0 to 9999 minutes.
      0434            Pt7      Time 7 of program 13. Range: 0 to 9999 minutes.
      0435            Pt8      Time 8 of program 13. Range: 0 to 9999 minutes.
      0436            Pt9      Time 9 of program 13. Range: 0 to 9999 minutes.
      0437            Pt1      Time 1 of program 14. Range: 0 to 9999 minutes.
      0438            Pt2      Time 2 of program 14. Range: 0 to 9999 minutes.
      0439            Pt3      Time 3 of program 14. Range: 0 to 9999 minutes.
      0440            Pt4      Time 4 of program 14. Range: 0 to 9999 minutes.
      0441            Pt5      Time 5 of program 14. Range: 0 to 9999 minutes.
      0442            Pt6      Time 6 of program 14. Range: 0 to 9999 minutes.
      0443            Pt7      Time 7 of program 14. Range: 0 to 9999 minutes.
      0444            Pt8      Time 8 of program 14. Range: 0 to 9999 minutes.
      0445            Pt9      Time 9 of program 14. Range: 0 to 9999 minutes.
      0446            Pt1      Time 1 of program 15. Range: 0 to 9999 minutes.
      0447            Pt2      Time 2 of program 15. Range: 0 to 9999 minutes.
      0448            Pt3      Time 3 of program 15. Range: 0 to 9999 minutes.
      0449            Pt4      Time 4 of program 15. Range: 0 to 9999 minutes.
      0450            Pt5      Time 5 of program 15. Range: 0 to 9999 minutes.
      0451            Pt6      Time 6 of program 15. Range: 0 to 9999 minutes.
      0452            Pt7      Time 7 of program 15. Range: 0 to 9999 minutes.
      0453            Pt8      Time 8 of program 15. Range: 0 to 9999 minutes.
      0454            Pt9      Time 9 of program 15. Range: 0 to 9999 minutes.
      0455            Pt1      Time 1 of program 16. Range: 0 to 9999 minutes.
      0456            Pt2      Time 2 of program 16. Range: 0 to 9999 minutes.
      0457            Pt3      Time 3 of program 16. Range: 0 to 9999 minutes.
      0458            Pt4      Time 4 of program 16. Range: 0 to 9999 minutes.
      0459            Pt5      Time 5 of program 16. Range: 0 to 9999 minutes.
      0460            Pt6      Time 6 of program 16. Range: 0 to 9999 minutes.
      0461            Pt7      Time 7 of program 16. Range: 0 to 9999 minutes.
      0462            Pt8      Time 8 of program 16. Range: 0 to 9999 minutes.
      0463            Pt9      Time 9 of program 16. Range: 0 to 9999 minutes.
      0464            Pt1      Time 1 of program 17. Range: 0 to 9999 minutes.
      0465            Pt2      Time 2 of program 17. Range: 0 to 9999 minutes.
      0466            Pt3      Time 3 of program 17. Range: 0 to 9999 minutes.
      0467            Pt4      Time 4 of program 17. Range: 0 to 9999 minutes.
      0468            Pt5      Time 5 of program 17. Range: 0 to 9999 minutes.
      0469            Pt6      Time 6 of program 17. Range: 0 to 9999 minutes.
      0470            Pt7      Time 7 of program 17. Range: 0 to 9999 minutes.
      0471            Pt8      Time 8 of program 17. Range: 0 to 9999 minutes.
      0472            Pt9      Time 9 of program 17. Range: 0 to 9999 minutes.

NOVUS AUTOMATION                                                                         50 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
      0473            Pt1      Time 1 of program 18. Range: 0 to 9999 minutes.
      0474            Pt2      Time 2 of program 18. Range: 0 to 9999 minutes.
      0475            Pt3      Time 3 of program 18. Range: 0 to 9999 minutes.
      0476            Pt4      Time 4 of program 18. Range: 0 to 9999 minutes.
      0477            Pt5      Time 5 of program 18. Range: 0 to 9999 minutes.
      0478            Pt6      Time 6 of program 18. Range: 0 to 9999 minutes.
      0479            Pt7      Time 7 of program 18. Range: 0 to 9999 minutes.
      0480            Pt8      Time 8 of program 18. Range: 0 to 9999 minutes.
      0481            Pt9      Time 9 of program 18. Range: 0 to 9999 minutes.
      0482            Pt1      Time 1 of program 19. Range: 0 to 9999 minutes.
      0483            Pt2      Time 2 of program 19. Range: 0 to 9999 minutes.
      0484            Pt3      Time 3 of program 19. Range: 0 to 9999 minutes.
      0485            Pt4      Time 4 of program 19. Range: 0 to 9999 minutes.
      0486            Pt5      Time 5 of program 19. Range: 0 to 9999 minutes.
      0487            Pt6      Time 6 of program 19. Range: 0 to 9999 minutes.
      0488            Pt7      Time 7 of program 19. Range: 0 to 9999 minutes.
      0489            Pt8      Time 8 of program 19. Range: 0 to 9999 minutes.
      0490            Pt9      Time 9 of program 19. Range: 0 to 9999 minutes.
      0491            Pt1      Time 1 of program 20. Range: 0 to 9999 minutes.
      0492            Pt2      Time 2 of program 20. Range: 0 to 9999 minutes.
      0493            Pt3      Time 3 of program 20. Range: 0 to 9999 minutes.
      0494            Pt4      Time 4 of program 20. Range: 0 to 9999 minutes.
      0495            Pt5      Time 5 of program 20. Range: 0 to 9999 minutes.
      0496            Pt6      Time 6 of program 20. Range: 0 to 9999 minutes.
      0497            Pt7      Time 7 of program 20. Range: 0 to 9999 minutes.
      0498            Pt8      Time 8 of program 20. Range: 0 to 9999 minutes.
      0499            Pt9      Time 9 of program 20. Range: 0 to 9999 minutes.
                               Setpoint 0 of program 1.
      0500           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 1 (Ramps and Soaks).
      0501           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 1 (Ramps and Soaks).
      0502           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 1 (Ramps and Soaks).
      0503           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 1 (Ramps and Soaks).
      0504           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 1 (Ramps and Soaks).
      0505           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 1 (Ramps and Soaks).
      0506           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 1 (Ramps and Soaks).
      0507           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 1 (Ramps and Soaks).
      0508           Psp8
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                         51 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 9 of program 1 (Ramps and Soaks).
      0509           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 2.
      0510           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 2 (Ramps and Soaks).
      0511           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 2 (Ramps and Soaks).
      0512           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 2 (Ramps and Soaks).
      0513           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 2 (Ramps and Soaks).
      0514           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 2 (Ramps and Soaks).
      0515           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 2 (Ramps and Soaks).
      0516           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 2 (Ramps and Soaks).
      0517           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 2 (Ramps and Soaks).
      0518           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 2 (Ramps and Soaks).
      0519           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 3.
      0520           Psp0
                               Range: D From spll to the value set in spkl.
                               Setpoint 1 of program 3 (Ramps and Soaks).
      0521           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 3 (Ramps and Soaks).
      0522           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 3 (Ramps and Soaks).
      0523           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 3 (Ramps and Soaks).
      0524           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 3 (Ramps and Soaks).
      0525           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 3 (Ramps and Soaks).
      0526           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 3 (Ramps and Soaks).
      0527           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 3 (Ramps and Soaks).
      0528           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 3 (Ramps and Soaks).
      0529           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 4.
      0530           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 4 (Ramps and Soaks).
      0531           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 4 (Ramps and Soaks).
      0532           Psp2
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                         52 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 3 of program 4 (Ramps and Soaks).
      0533           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 4 (Ramps and Soaks).
      0534           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 4 (Ramps and Soaks).
      0535           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 4 (Ramps and Soaks).
      0536           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 4 (Ramps and Soaks).
      0537           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 4 (Ramps and Soaks).
      0538           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 4 (Ramps and Soaks).
      0539           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 5.
      0540           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 5 (Ramps and Soaks).
      0541           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 5 (Ramps and Soaks).
      0542           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 5 (Ramps and Soaks).
      0543           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 5 (Ramps and Soaks).
      0544           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 5 (Ramps and Soaks).
      0545           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 5 (Ramps and Soaks).
      0546           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 5 (Ramps and Soaks).
      0547           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 5 (Ramps and Soaks).
      0548           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 5 (Ramps and Soaks).
      0549           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 6.
      0550           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 6 (Ramps and Soaks).
      0551           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 6 (Ramps and Soaks).
      0552           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 6 (Ramps and Soaks).
      0553           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 6 (Ramps and Soaks).
      0554           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 6 (Ramps and Soaks).
      0555           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 6 (Ramps and Soaks).
      0556           Psp6
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                         53 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 7 of program 6 (Ramps and Soaks).
      0557           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 6 (Ramps and Soaks).
      0558           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 6 (Ramps and Soaks).
      0559           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 7.
      0560           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 7 (Ramps and Soaks).
      0561           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 7 (Ramps and Soaks).
      0562           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 7 (Ramps and Soaks).
      0563           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 7 (Ramps and Soaks).
      0564           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 7 (Ramps and Soaks).
      0565           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 7 (Ramps and Soaks).
      0566           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 7 (Ramps and Soaks).
      0567           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 7 (Ramps and Soaks).
      0568           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 7 (Ramps and Soaks).
      0569           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 8.
      0570           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 8 (Ramps and Soaks).
      0571           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 8 (Ramps and Soaks).
      0572           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 8 (Ramps and Soaks).
      0573           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 8 (Ramps and Soaks).
      0574           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 8 (Ramps and Soaks).
      0575           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 8 (Ramps and Soaks).
      0576           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 8 (Ramps and Soaks).
      0577           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 8 (Ramps and Soaks).
      0578           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 8 (Ramps and Soaks).
      0579           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 9.
      0580           Psp0
                               Range: From spll to the value set in spkl.



NOVUS AUTOMATION                                                                         54 / 63
   HOLDING
                   PARAMETER                                      REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 1 of program 9 (Ramps and Soaks).
      0581           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 9 (Ramps and Soaks).
      0582           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 9 (Ramps and Soaks).
      0583           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 9 (Ramps and Soaks).
      0584           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 9 (Ramps and Soaks).
      0585           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 9 (Ramps and Soaks).
      0586           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 9 (Ramps and Soaks).
      0587           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 9 (Ramps and Soaks).
      0588           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 9 (Ramps and Soaks).
      0589           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 10.
      0590           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 10 (Ramps and Soaks).
      0591           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 10 (Ramps and Soaks).
      0592           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 10 (Ramps and Soaks).
      0593           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 10 (Ramps and Soaks).
      0594           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 10 (Ramps and Soaks).
      0595           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 10 (Ramps and Soaks).
      0596           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 10 (Ramps and Soaks).
      0597           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 10 (Ramps and Soaks).
      0598           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 10 (Ramps and Soaks).
      0599           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 11.
      0600           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 11 (Ramps and Soaks).
      0601           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 11 (Ramps and Soaks).
      0602           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 11 (Ramps and Soaks).
      0603           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 11 (Ramps and Soaks).
      0604           Psp4
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                         55 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 5 of program 11 (Ramps and Soaks).
      0605           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 11 (Ramps and Soaks).
      0606           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 11 (Ramps and Soaks).
      0607           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 11 (Ramps and Soaks).
      0608           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 11 (Ramps and Soaks).
      0609           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 12.
      0610           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 12 (Ramps and Soaks).
      0611           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 12 (Ramps and Soaks).
      0612           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 12 (Ramps and Soaks).
      0613           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 12 (Ramps and Soaks).
      0614           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 12 (Ramps and Soaks).
      0615           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 12 (Ramps and Soaks).
      0616           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 12 (Ramps and Soaks).
      0617           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 12 (Ramps and Soaks).
      0618           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 12 (Ramps and Soaks).
      0619           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 13.
      0620           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 13 (Ramps and Soaks).
      0621           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 13 (Ramps and Soaks).
      0622           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 13 (Ramps and Soaks).
      0623           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 13 (Ramps and Soaks).
      0624           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 13 (Ramps and Soaks).
      0625           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 13 (Ramps and Soaks).
      0626           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 13 (Ramps and Soaks).
      0627           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 13 (Ramps and Soaks).
      0628           Psp8
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                        56 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 9 of program 13 (Ramps and Soaks).
      0629           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 14.
      0630           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 14 (Ramps and Soaks).
      0631           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 14 (Ramps and Soaks).
      0632           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 14 (Ramps and Soaks).
      0633           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 14 (Ramps and Soaks).
      0634           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 14 (Ramps and Soaks).
      0635           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 14 (Ramps and Soaks).
      0636           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 14 (Ramps and Soaks).
      0637           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 14 (Ramps and Soaks).
      0638           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 14 (Ramps and Soaks).
      0639           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 15.
      0640           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 15 (Ramps and Soaks).
      0641           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 15 (Ramps and Soaks).
      0642           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 15 (Ramps and Soaks).
      0643           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 15 (Ramps and Soaks).
      0644           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 15 (Ramps and Soaks).
      0645           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 15 (Ramps and Soaks).
      0646           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 15 (Ramps and Soaks).
      0647           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 15 (Ramps and Soaks).
      0648           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 15 (Ramps and Soaks).
      0649           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 16.
      0650           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 16 (Ramps and Soaks).
      0651           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 16 (Ramps and Soaks).
      0652           Psp2
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                        57 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 3 of program 16 (Ramps and Soaks).
      0653           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 16 (Ramps and Soaks).
      0654           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 16 (Ramps and Soaks).
      0655           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 16 (Ramps and Soaks).
      0656           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 16 (Ramps and Soaks).
      0657           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 16 (Ramps and Soaks).
      0658           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 16 (Ramps and Soaks).
      0659           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 17.
      0660           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 17 (Ramps and Soaks).
      0661           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 17 (Ramps and Soaks).
      0662           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 17 (Ramps and Soaks).
      0663           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 17 (Ramps and Soaks).
      0664           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 17 (Ramps and Soaks).
      0665           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 17 (Ramps and Soaks).
      0666           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 17 (Ramps and Soaks).
      0667           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 17 (Ramps and Soaks).
      0668           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 17 (Ramps and Soaks).
      0669           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 18.
      0670           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 18 (Ramps and Soaks).
      0671           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 18 (Ramps and Soaks).
      0672           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 18 (Ramps and Soaks).
      0673           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 18 (Ramps and Soaks).
      0674           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 18 (Ramps and Soaks).
      0675           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 18 (Ramps and Soaks).
      0676           Psp6
                               Range: Same as in psp0.



NOVUS AUTOMATION                                                                        58 / 63
   HOLDING
                   PARAMETER                                     REGISTER DESCRIPTION
  REGISTERS
                               Setpoint 7 of program 18 (Ramps and Soaks).
      0677           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 18 (Ramps and Soaks).
      0678           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 18 (Ramps and Soaks).
      0679           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 19.
      0680           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 19 (Ramps and Soaks).
      0681           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 19 (Ramps and Soaks).
      0682           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 19 (Ramps and Soaks).
      0683           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 19 (Ramps and Soaks).
      0684           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 19 (Ramps and Soaks).
      0685           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 19 (Ramps and Soaks).
      0686           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 19 (Ramps and Soaks).
      0687           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 19 (Ramps and Soaks).
      0688           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 19 (Ramps and Soaks).
      0689           Psp9
                               Range: Same as in psp0.
                               Setpoint 0 of program 20.
      0690           Psp0
                               Range: From spll to the value set in spkl.
                               Setpoint 1 of program 20 (Ramps and Soaks).
      0691           Psp1
                               Range: Same as in psp0.
                               Setpoint 2 of program 20 (Ramps and Soaks).
      0692           Psp2
                               Range: Same as in psp0.
                               Setpoint 3 of program 20 (Ramps and Soaks).
      0693           Psp3
                               Range: Same as in psp0.
                               Setpoint 4 of program 20 (Ramps and Soaks).
      0694           Psp4
                               Range: Same as in psp0.
                               Setpoint 5 of program 20 (Ramps and Soaks).
      0695           Psp5
                               Range: Same as in psp0.
                               Setpoint 6 of program 20 (Ramps and Soaks).
      0696           Psp6
                               Range: Same as in psp0.
                               Setpoint 7 of program 20 (Ramps and Soaks).
      0697           Psp7
                               Range: Same as in psp0.
                               Setpoint 8 of program 20 (Ramps and Soaks).
      0698           Psp8
                               Range: Same as in psp0.
                               Setpoint 9 of program 20 (Ramps and Soaks).
      0699           Psp9
                               Range: Same as in psp0.
   0700-0723        Reserved   Internal use.




NOVUS AUTOMATION                                                                        59 / 63
   HOLDING
                   PARAMETER                                          REGISTER DESCRIPTION
  REGISTERS
                               Read: Active output power (manual or automatic) of control output 2.
      0724           MV 2      Write: Not allowed. See address 28.
                               Range: 0 to 1000 (0.0 to 100.0 %).
                               Controller 2 proportional band (in percent).
      0725            PB2
                               Range: 0 to 5000 (0.0 to 500.0 %)
                               On/Off control hysteresis (in the engineering unit of the selected type) of control output 2.
      0726           HYT2
                               Range: 0 to spkl – spll.
                               PWM cycle period (in seconds) of control output 2.
      0727            CT2
                               Range: 5 to 1000 (0.5 to 100.0).
                               Lower limit of the output power for control output 2.
      0728           OvLL2
                               Range: 0 to 1000 (0.0 to 100.0 %).
                               Upper limit of the output power for control output 2.
      0729           OvkL2
                               Range: 0 to 1000 (0.0 to 100.0 %).
      0730           OLAP      Overlap between heating and cooling in the input type engineering unit.
      0731          NAME01
      0732          NAME02
      0733          NAME03
      0734          NAME04
                               String with the product name.
      0735          NAME05
      0736          NAME06
      0737          NAME07
      0738          NAME08
      0739          CODE01
      0740          CODE02
      0741          CODE03     String with the product code.
      0742          CODE04
      0743          CODE05
                               Enable Latch function for alarm 1.
      0744           LTA1      0 → Latch function disabled
                               1 → Latch function enabled
                               Enable Latch function for alarm 2.
      0745           LTA2
                               Range: Same as LTA1.
                               Enable Latch function for alarm 3.
      0746           LTA3
                               Range: Same as LTA1.
                               Enable Latch function for alarm 4.
      0747           LTA4
                               Range: Same as LTA1.
                               Reset Alarm Latch.
                               Bit array for individual reset of alarms that are holding alarms via Latch function.
                               bit 0 – Recognizes alarm 1 retentive
      0748            RAL
                               bit 1 – Recognizes alarm 2 retentive
                               bit 2 – Recognizes alarm 3 retentive
                               bit 3 – Recognizes alarm 4 retentive
                                                      Table 16




NOVUS AUTOMATION                                                                                                               60 / 63
16.4.3     STATUS WORDS
          REGISTER                                                         VALUE FORMAT
                          bit 0 – Alarm 1 (0 → Disabled / 1 → Enabled)
                          bit 1 – Alarm 2 (0 → Disabled / 1 → Enabled)
                          bit 2 – Alarm 3 (0 → Disabled / 1 → Enabled)
                          bit 3 – Alarm 4 (0 → Disabled / 1 → Enabled)
                          bit 4 – Input 0 - I/O 5 (0 → Disabled / 1 → Enabled)
                          bit 5 – Input 1 - I/O 3 (0 → Disabled / 1 → Enabled)
                          bit 6 – Input 2 - I/O 4 (0 → Disabled / 1 → Enabled)
                          bit 7 – Reserved
         Status Word 1
                          bit 8 – Value to detect hardware
                          bit 9 – Value to detect hardware
                          bit 10 – Value to detect hardware
                          bit 11 – Value to detect hardware
                          bit 12 − Reserved
                          bit 13 − Reserved
                          bit 14 − Reserved
                          bit 15 – Reserved
                          bit 0 − Automatic (0 → Manual / 1 → Automatic)
                          bit 1 − Run (0 → Stop / 1 → Run)
                          bit 2 – Control action 1 (0 → Direct / 1 → Reverse)
                          bit 3 – Reserved
                          bit 4 – Auto-tune (0 → No / 1 → Yes)
                          bit 5 – Alarm initial blocking 1 (0 → No / 1 → Yes)
                          bit 6 – Alarm initial blocking 2 (0 → No / 1 → Yes)
                          bit 7 – Alarm initial blocking 3 (0 → No / 1 → Yes)
         Status Word 2
                          bit 8 – Alarm initial blocking 4 (0 → No / 1 → Yes)
                          bit 9 − Unity (0 → °C / 1 → °F)
                          bit 10 − Reserved
                          bit 11 – Output 1 status
                          bit 12 – Output 2 status
                          bit 13 – Output 3 status
                          bit 14 – Output 4 status
                          bit 15 – Output 5 status
                          bit 0 – Very low PV conversion (0 → No / 1 → Yes)
                          bit 1 – Negative conversion after calibration (0 → No / 1 → Yes)
                          bit 2 – Very high PV conversion (0 → No / 1 → Yes)
                          bit 3 – Exceeded linearization limit (0 → No / 1 → Yes)
                          bit 4 – The Pt100 cable resistance is too high (0 → No / 1 → Yes)
                          bit 5 – Auto-Zero conversion out-of-range (0 → No / 1 → Yes)
                          bit 6 – Cold Junction conversion out-of-range (0 → No / 1 → Yes)
                          bit 7 − Reserved
         Status Word 3
                          bit 8 − Reserved
                          bit 9 − Reserved
                          bit 10 − Reserved
                          bit 11 − Reserved
                          bit 12 − Reserved
                          bit 13 − Reserved
                          bit 14 − Reserved
                          bit 15 − Reserved
                                                             Table 17




NOVUS AUTOMATION                                                                              61 / 63
You can only write to the digital output bits when the outputs are set to Off in the controller I/O configuration.

                                                   COIL STATUS             OUTPUT DESCRIPTION
                                                         0             Output 1 status (I/O1)
                                                         1             Output 2 status (I/O2)
                                                         2             Output 3 status (I/O3)
                                                         3             Output 4 status (I/O4)
                                                         4             Output 5 status (I/O5)
                                                                      Table 18

16.5 EXCEPTION RESPONSES – ERROR CONDITIONS
When receiving a command, the Modbus protocol checks the CRC of the received data block. If there is a CRC error during reception, the master
will receive no response.
After receiving an error-free packet, the controller processes the packet and verifies whether the request is valid or not. If invalid, an exception
response, containing the corresponding error code, will be sent. In exception responses, the field corresponding to the Modbus command in the
response will be added to 80 H.
If a command writing a value to a parameter has a value outside the allowed range, the maximum allowed value for this parameter will be forced,
which will return this as the response.
The controller ignores the read commands in Broadcast. That is, there will be no response. You can only write in Broadcast mode.

                                       ERROR CODES                          ERROR DESCRIPTION
                                              01          Invalid or non-existent command.
                                              02          Register number invalid or out of range.
                                              03          Number of registers invalid or out of range.
                                                                      Table 19


16.6 CONFIGURING I/O PARAMETERS
16.6.1     N1200
                                            I/O FUNCTION                                  CODE                   I/O TYPE
                         No function                                                  0         OFF                  Output
                         Alarm output 1                                               1         A1                   Output
                         Alarm output 2                                               2         A2                   Output
                         Alarm output 3                                               3         A3                   Output
                         Alarm output 4                                               4         A4                   Output
                         Loop Break Detection (LBD) function output                   5         Lbd                  Output
                         Control output (Relay or Digital Pulse)                      6       CTRL                   Output
                         Switch between Automatic/Manual modes                        7         mAN             Digital Input
                         Switch between Run/Stop modes                                8         RVN             Digital Input
                         Select remote SP                                             9         RSP             Digital Input
                         Freeze the program                                          10       KPRG              Digital Input
                         Select program 1                                            11       PR 1              Digital Input
                         Analog control output (0 to 20 mA)                          12       (.0.20          Analog Output
                         Analog control output (4 to 20mA)                           13       (.4.20          Analog Output
                         PV retransmission (0 to 20 mA)                              14       P.0.20          Analog Output
                         PV retransmission (4 to 20 mA)                              15       P.4.20          Analog Output
                         SP retransmission (0 to 20 mA)                              16       S.0.20          Analog Output
                         SP retransmission (4 to 20 mA)                              17       S.4.20          Analog Output
                                                                      Table 20




NOVUS AUTOMATION                                                                                                                              62 / 63
16.6.2   N1200-HC
                                       I/O FUNCTION                             CODE         I/O TYPE
                    No function                                            0       OFF        Output
                    Alarm output 1                                         1       A1         Output
                    Alarm output 2                                         2       A2         Output
                    Alarm output 3                                         3       A3         Output
                    Alarm output 4                                         4       A4         Output
                    Loop Break Detection (LBD) function output             5       Lbd        Output
                    Control output 1 (Relay or Digital Pulse)              6      (TR1        Output
                    Control output 2 (Relay or Digital Pulse)              7      (TR2        Output
                    Switch between Automatic/Manual modes                  8       mAN      Digital Input
                    Switch between Run/Stop modes                          9       RVN      Digital Input
                    Select remote SP                                       10      RSP      Digital Input
                    Freeze the program                                     11     KPRG      Digital Input
                    Select program 1                                       12     PR 1      Digital Input
                    Analog control output 1 (0 to 20mA)                    13     (.0.20   Analog Output
                    Analog control output 1 (4 to 20mA)                    14     (.4.20   Analog Output
                    Analog control output 2 (0 to 20mA)                    15     (.0.20   Analog Output
                    Analog control output 2 (4 to 20mA)                    16     (.4.20   Analog Output
                    PV retransmission (0 to 20 mA)                         17     P.0.20   Analog Output
                    PV retransmission (4 to 20 mA)                         18     P.4.20   Analog Output
                    SP retransmission (0 to 20 mA)                         19     S.0.20   Analog Output
                    SP retransmission (4 to 20 mA)                         20     S.4.20   Analog Output
                                                                Table 21




NOVUS AUTOMATION                                                                                            63 / 63
