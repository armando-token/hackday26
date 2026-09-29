# X5_Prime_Datasheet

> Source PDF: `MAN1363_R21_X5P_DS.pdf`
> Converted for agent/API Markdown consumption. Prefer this file over PDF parsing.

---

                                    X5 Prime OCS Datasheet
                       Built-In I/O: 4 Digital DC Inputs, 4 Digital DC Outputs, 4 Analog Inputs
                                                             MAN1363 R21

                                                              24 JUL 2023

                                                                         Table of Contents
                                                                               User Manual and Add-Ons               1
                                                                               Backup Battery                        1
                                                                               Power Supply Note                     1


                                                                              TECHNICAL SPECIFICATIONS               2
                                                                               General Specifications                2
                                                                               Control and Logic                     3
                                                                               Display                               3
                                                                               Connectivity                          3
Part Number: HE-XP5                                                            USB Webcams                           3
                                                                              CONTROLLER OVERVIEW                    4
User Manual and Add-Ons                                                        Overview of OCS                       4
                                                                               Power Wiring                          5
Find the documents via the Documentation Search.                              DIGITAL & ANALOG I/O SPECIFICATIONS    6
                                                                               Digital DC Inputs                     6
     Part #                       Description                                  Analog Inputs                         7
                                                                               Digital DC Outputs                    8
MAN1039           HE-X5 & HE-X5 Prime User Manual                              Analog In Tranzorb Failure            8
HE-XCK             Programming Cables                                         WIRING: INPUTS AND OUTPUTS             9
HE-FBD001         Ferrite core for filtering out electrical noise.             Digital Input Wiring                  9
                                                                               Digital Output Wiring                 9
                  Adapter, RJ45 (8P8C) male to                                 Analog Inputs                        10
HE200MJ2TRM
                  8-position terminal strip.                                   Built-In I/O Register Map for X5     11
HE-XRJ503          RJ45 to 5-pin Cable - 3ft                                  COMMUNICATIONS                        12
HE-XRJ509          RJ45 to 5-pin Cable - 9ft                                   Serial Communication                 12
                                                                               Dip Switches                         13
HE-XRJ003          RJ45 to RJ45 Ethernet Patch Cable 3ft                       CAN Communications                   13
HE-XRJ009          RJ45 to RJ45 Ethernet Patch Cable 9ft                       Ethernet                             14
                                                                               microSD Slot                         14
                                                                               USB Ports                            14
Backup Battery                                                                DIMENSIONS & INSTALLATION             15
                                                                               X5 & X5 Prime Dimensions             15
The XL6 Prime uses a Renata CR2032 lithium battery to                          Installation Procedure               16
run the Real Time Clock for 7-10 years. Please reference                      SAFETY & MAINTENANCE                  17
MAN1039 for more details about the battery.                                    Warnings                             17
                                                                               FCC Compliance                       17
                                                                               Technical Support                    17
Power Supply Note                                                              Precautions                          18

Very short dips (about 100 milliseconds) in the input
power can result in output that are ON to remain ON for
about 1 second while the unit cycles power. Selecting a
power supply that prevents these short glitches or using
remote I/O can eliminate this issue.




                                                                     Page 1
                              TECHNICAL SPECIFICATIONS
General Specifications
         Required Pwr.
                                                    118.1mA @ 24VDC
          (steady state)

     Required Pwr. (inrush)                 20A for < 1 ms at 24VC DC Switched

       Primary Pwr. Range                                10-30VDC

  Required Pwr with Backlight @
                                                     85.6mA @ 24VDC
             50%

         Backlight OFF                               83.6mA @ 24VDC

             Battery                               Replaceable Coin Cell

         Clock Accuracy                 +/-20 ppm maximum at 25°C (+/- 1 min/month)

        Real Time Clock                                 With Battery

           Battery Life                           5-10 Yrs Not Replaceable

        Relative Humidity                          5-95% non-condensing

        Operating Temp.                                -10˚C to +60˚C

         Storage Temp.                                 -30˚C to +70˚C

             Altitude                                   Up to 2000m

     Rated Pollution Degree                Evaluated for Pollution Degree 2 Rating

             Weight                                     10 oz / 271 g

       Certifications (CE)                        North America or Europe

         Enclosure Type                       Type 1, 3R, 4, 4X, 12, 12K, & 13




                                         Page 2
Control and Logic
 Control Lang. Support                              Advanced Ladder Logic; Full IEC 61131-3 Languages

 Logic Program Size                                                       2MB, Max.

 Scan Rate                                                                0.02ms/kB

 Online Programming Changes                                     Supported in Advanced Ladder

 Digital Inputs                                                             2048

 Digital Outputs                                                            2048

 Analog Inputs                                                               512

 Analog Outputs                                                              512

 Gen. Purpose Registers                             50,000 (words) Retentive; 16,384 (bits) Non-Retentive


Display
 Display Type                                            Resistive 4.3” Touchscreen: 450cd/m² (nits)

 Resolution                                                         WQVGA (480 x 272)

 Color                                                                    65K Color

 Screen Memory                                                              22MB

 User-Program. Screens                                                      1023

 Backlight                                                               White LED


Connectivity
 Serial                                                         2 (1xRS232, 1x2-wire RS485)

 CAN                                                               CAN 125kbps – 1Mbps

 Ethernet                                                          1 x 10Mbps/100Mbps

 USB (2)                                    1 X Mini B for Programming. 1 X USB A for drives, Wi-Fi, or cameras

 microSD                                                   1 x SD, SDHC, SDXC in FAT32 format


USB Webcams
USB Webcams supported should support the UVC (USB Video class) protocol for the OCS to be able to display
video. Most USB based video devices support this today. Special feature such as zoom and high definition are not
supported by the OCS.




                                                       Page 3
                               CONTROLLER OVERVIEW
Overview of OCS




  1.   Power
  2.   Input Connector
  3.   Output Connector
  4.   CAN Port
  5.   Serial Ports
  6.   DIP Switches
  7.   Ethernet Port
  8.   microSD Slot
  9.   USB A Port
 10.   USB Mini-B Port

NOTE: See "Precautions" on page 18 about USB and grounding.




                                                  Page 4
Power Wiring
NOTE: The Primary Power Range is 10VDC to 30VDC.




                                            Primary Power Port Pins

         PIN                  Signal                                        Description

          1                   Ground           Frame Ground

          2                        DC-         Input Power Supply Ground

          3                    DC+             Input Power Supply Voltage



DC Input/Frame
   l   Solid/Stranded Wire: 12-24 awg (2.5-0.2mm)
   l   Strip length: 0.28” (7mm)
   l   Torque, Terminal Hold-Down Screws: 4.5 – 7 in-lbs (0.50 – 0.78 N-m)

DC- is internally connected to I/O V-and CAN V-. A Class 2 power supply must be used.

Power Up
  1.   Optional: Attach ferrite core with a minimum of two turns of the DC+ and DC- signals from the DC supply that
       is powering the controllers.




  2.   Connect Pin 1 to Earth Ground
  3.   Apply DC power to pins 2 & 3.




                                                        Page 5
                       DIGITAL & ANALOG I/O SPECIFICATIONS
Digital DC Inputs
 Inputs per Module                                              4

 Commons per Module                                             1

 Input Voltage Range                                      0VDC - 24VDC

 Absolute Max. Voltage                                     30VDC Max.

 Input Impedance                                              10kΩ

 Input Current                         Positive Logic                      Negative Logic

 Min. ON Current                          0.8mA                                -1.6mA

 Max. OFF Current                         0.3mA                                -2.1mA

 Min. ON Input                                                8VDC

 Max. OFF Input                                               3VDC

 OFF to ON Response                                         2ms min*

 ON to OFF Response                                         2ms min*

 Galvanic Isolation                                           None

 Logic Polarity                                 Pos. or Neg. based on configuration

 I/O Indication                                               None

 High Speed Counter                                           4 HSC

 Maximum Frequency                                           500kHz

 Connector Type                                   3.5mm Pluggable Cage Clamp

*all values updated 1x per scan




                                       Page 6
Analog Inputs
 Number of Channels                                               4

 Input Signal Range                                4-20mA, 0-20mA DC, 0-10VDC

 Input Raw Value Range                                        0-32,000

 Abs. Max. Input Voltage                                   -0.5 to 12VDC

 Galvanic Isolation                                             None

 Input Impedance (clamped at -0.5 to 12                       mA: 50Ω
 Vdc)                                                         V: 500kΩ

 Nominal Resolution                                            12 Bits

 Conversion Speed                                  All Channels Once per OCS Scan

 Analog Max Error @ 25˚C                                  1.5% of full scale




                                          Page 7
Digital DC Outputs
 Outputs per Module                                                                  4

 Commons per Module                                                                  1

 Output Type                                                                    Half-Bridge

 Absolute Max. Voltage                                                         30VDC Max.

 Output Protection                                                      Short Circuit & Overvoltage

 Max. Output Current per Point                                                     0.5A

 Max. Total Current                                                          2A Total Current

 Max. Output Supply                                                               30VDC

 Min. Output Supply                                                               10VDC

 Max. Voltage Drop at Rated Current                                              0.25VDC

 Min. Load                                                                         None

 I/O Indication                                                                    None

 Galvanic Isolation                                                                None

 OFF to ON Response                                                             500ns min*

 ON to OFF Response                                                             500ns min*

 PWM Out                                                                       500kHz Max.

 Output Characteristics                                                Current Sourcing (Pos. Logic)

*all values updated 1x per scan

Analog In Tranzorb Failure
A common cause of Analog Input Tranzorb Failure on Analog Inputs: If a 4-20mA circuit is initially wired with loop
power, but without a load, the analog input could see 24VDC. This is higher than the rating of the tranzorb. This

can be solved by NOT connecting loop power prior to load connection, or by installing a low-cost PTC in series
between the load and analog input.




                                                         Page 8
                               WIRING: INPUTS AND OUTPUTS
Digital Input Wiring




Positive Logic vs. Negative Logic Wiring: The X5 & X5 Prime can be wired for Positive Logic inputs or Negative
Logic inputs.

Digital inputs may be wired in either a Positive Logic or Negative Logic fashion as shown. The setting in the Cscape
Hardware Configuration for the Digital Inputs must match the wiring used in order for the correct input states to be
registered. No jumper settings are required for X5 & X5 Prime. When used as a normal input and not for high speed
functions, the state of the input is reflected in registers %I1 – %I4.

Digital inputs may alternately be specified for use with High Speed Counter functions, also found in the Hardware
Configuration for Digital Inputs. Refer to the X5 & X5 Prime User Manual (MAN1039) for full details.

Digital Output Wiring




Digital outputs are Positive Logic. If an output is turned on, the voltage supplied at the Vext terminal is applied to that
output. When used as normal outputs, the state of the output may be controlled using the registers %Q1, %Q2, %Q3,
and %Q4.

The first two digital outputs may alternately be specified for use as Pulse Width Modulation (PWM) or Stepper
outputs. The configuration for these functions is found in the Cscape Hardware Configuration for Digital Outputs.




                                                           Page 9
Analog Inputs




Raw input values for channels 1-4 are found in the registers as Integer- type data with a range from 0 – 32000.

Analog inputs may be filtered digitally with the Filter Constant found in the Cscape Hardware Configuration for Analog
Inputs. Valid filter values are 0-7 and act according to the following chart:




                                                     Data Values
                  Input Mode:                                           Data Format, 12-bit INT:

                0-20mA, 4-20mA                                                  0-32000




                                                        Page 10
Built-In I/O Register Map for X5
           FIXED ADDRESS                     I/O FUNCTION      X5

                                             Digital Inputs    1-4
                %I1
                                               Reserved        5-16

                                             Digital Outputs   1-4

                %Q1                            Reserved        5-16

                                             Analog Inputs     1-4
                %AI1
                                               Reserved        n/a




                                   Page 11
                                         COMMUNICATIONS
Serial Communication
MJ1/2 Serial Ports

                      2 Serial Ports on 1 Module Jack (8posn)



                      MJ1: RS-232 w/Full Handshaking

                      MJ2: RS-485 Half-Duplex




                                  MJ1 PINS                                            MJ2 PINS

    PIN              SIGNAL                  DIRECTION                   SIGNAL                  DIRECTION

     8                 TXD                       OUT                        --                         --

     7                 RXD                        IN                        --                         --

     6                  0V                    GROUND                        0V                    GROUND

     5            +5V @ 60mA                     OUT                  +5V @ 60mA                     OUT

     4                 RTS                       OUT                        --                         --

     3                 CTS                        IN                        --                         --

     2                  --                        --                     RX- / TX-                 IN / OUT

     1                  --                        --                    RX+ / TX+                  IN / OUT

NOTE: Refer to connector pinout on product

Two serial ports are provided via the single 8-position modular jack labeled “MJ1/2”. MJ1 defaults to one of several
methods available to program the controller. It may instead be specified for RS-232 communications with or without
hardware handshaking, such as for Modbus Master/Slave, or to communicate to devices such as bar code scanners.

MJ2 may only be used as half-duplex (2-wire) RS-485. The most common use is for Modbus communications, either
as a Modbus Master or Modbus Slave, though many other options are also available. Termination for the RS-485 port
may be achieved by turning DIP switch 1 to the ON position. Only the two devices on either end of the RS-485 daisy-
chain should be terminated.




                                                       Page 12
Dip Switches
                                                                    DIP Switches
                               PIN                                        NAME          FUNCTION          DEFAULT

                                                                     RS-485             ON =
                               1                                                                         OFF
                                                                     Termination        Terminated

                                                                     CAN                ON =
                               2                                                                         OFF
                                                                     Termination        Terminated
                               3                                    Bootload           Always OFF        OFF

The DIP switches are used to provide a build-in termination to both the MJ2 port and CAN port if needed. The
termination for these ports should only be used if this device is located at either end of the multidrop/daisy-chained
RS-485 network or CAN bus.

CAN Communications


                            CAN: Modular jack (8posn)




                                         CAN Pin Assignments

                     PIN                                                 SIGNAL

                      8                                              No Connection

                      7                                                  Ground

                      6                                                  Ground

                      5                                              No Connection

                      4                                              No Connection

                      3                                                  Ground

                      2                                               CAN Data Low

                      1                                               CAN Data High

The CAN port is provided via the single 8-position modular jack labeled “CAN”. It may be used to communicate with
other OCS products using Horner’s CsCAN protocol. Additionally, remote expansion I/O such as SmartRail,
SmartBlock, OSC IO, and SmartStix may be implemented using the CsCAN protocol.

Termination for the CAN port may be achieved by turning DIP switch 2 to the ON position. This should only occur if
the X5 is at one end of the CAN daisy-chain or the other. Only the two devices on either end of the CAN daisy-chain
should be terminated.



                                                         Page 13
Ethernet

                   Green LED indicates link - when illuminated, data
                   communication is available.

                   Yellow LED indicates activity - when flashing, data is in
                   transmission.

10/100 Ethernet port with automatic MDI-X (crossover detection) is provided via the single 8-position modular jack
labeled “LAN”. Several features are available for use over Ethernet, such as WebMI, Modbus TCP/IP, Ethernet/IP,
SMTP (E-mail), and more. Ethernet configuration is done via the Cscape Hardware Configuration, though temporary
Ethernet configuration may be done through the System Menu directly on the X5.

For more information on Ethernet, available features and protocols, refer to the Ethernet Supplement (SUP0740).

microSD Slot
A microSD card may be used for data and alarm logging, historic trending, program loading, firmware updates, and
many other features. Supported types of microSD cards are SD, SDHC, and SDXC as long as the format of the card
file system is FAT32. Card formatting may be done by the controller if no other means are available to do so.

USB Ports
The USB Mini B port is provided as one of several ways to program the X5. Drivers for Windows to recognize the
controller as a virtual COM port are automatically installed with Cscape software.

The USB A port is provided to be able to use a thumb drive for data and alarm logging, historic trending, firmware
updates, and many other purposes. Files may also be transferred between a USB thumb drive and the installed
microSD card, Wi-Fi module, or USB cameras.




                                                        Page 14
                            DIMENSIONS & INSTALLATION
X5 & X5 Prime Dimensions




Panel Tolerance +/- 0.5mm




                                       Page 15
Installation Procedure
   l   This equipment is panel mounted and is meant to be installed in an enclosure suitable for the environment,
       such that the back of the equipment is only accessible with the use of a tool.
   l   Requires a Class 2 Power Source.
   l   This equipment is suitable for use in Class I, Division 2, Groups A, B, C and D; Class II, Division 2 Groups F
       and G; and Class III Hazardous Locations or Non-Hazardous Locations only.

The X5 utilizes a clip installation method to ensure a robust and watertight seal to the enclosure. Follow the steps
below for the proper installation and operation of the unit.

  1.   Carefully locate an appropriate place to mount the X5. Be sure to leave enough room at the top of the unit for
       insertion and removal of the microSD™ card.
  2.   Carefully cut the host panel per the diagram , creating a 90.5mm x 119.5mm (with a tolerance of +/- 0.5mm)
       opening into which the X5 may be installed. If the opening is too large, water may leak into the enclosure,
       potentially damaging the unit. If the opening is too small, the OCS may not fit through the hole without
       damage.
  3.   Remove any burrs and or sharp edges and ensure the panel is not warped in the cutting process.
  4.   Install and tighten the four mounting clips (provided in the box) until the gasket forms a tight seal. For standard
       composite mounting clips (included with product), use a torque rating of 2-3 in-lbs (0.23- 0.34 Nm). For
       optional metal mounting clips, use a torque rating of 4-8 in lbs (0.45-0.90 Nm).
  5.   Connect I/O, communications cables to the serial port, USB ports, and CAN port as required.




                                                          Page 16
                                     SAFETY & MAINTENANCE
Warnings
  1.   To avoid the risk of electric shock or burns, always connect the safety (or earth) ground before making any
       other connections.
  2.   To reduce the risk of fire, electrical shock, or physical injury, it is strongly recommended to fuse the voltage
       measurement inputs. Be sure to locate fuses as close to the source as possible.
  3.   Replace fuse with the same type and rating to provide protection against risk of fire and shock hazards.
  4.   In the event of repeated failure, do NOT replace the fuse again as repeated failure indicates a defective
       condition that will NOT clear by replacing the fuse.
  5.   Only qualified electrical personnel familiar with the construction and operation of this equipment and the
       hazards involved should install, adjust, operate, or service this equipment.
  6.   Read and understand this manual and other applicable manuals in their entirety before proceeding. Failure to
       observe this precaution could result in severe bodily injury or loss of life.

  7.
         WARNING: Battery may explode if mistreated. Do not recharge, disassemble, or dispose of in fire.


  8.
         WARNING: EXPLOSION HAZARD- Batteries must only be changed in an area known to be non-
         hazardous.


  9.
         WARNING: Do not disconnect while circuit is live unless are is know to be non-hazardous.


FCC Compliance
This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions:

  1.   This device may not cause harmful interference.
  2.   This device must accept any interference received, including interference that may cause
       undesired operation.

Technical Support
North America                                              Europe

 1 (317) 916-4274
                                                            +353 (21) 4321-266
 (877) 665-5666
                                                            www.hornerautomation.eu
 www.hornerautomation.com
                                                            technical.support@horner-apg.com
 APGUSATechSupport@heapg.com




                                                          Page 17
Precautions
All applicable codes and standards need to be followed in the installation of this product. Adhere to the following
safety precautions whenever any type of connection is made to the module:

  1.   Connect the safety (earth) ground on the power connector first before making any other connections.
  2.   When connecting to the electric circuits or pulse-initiating equipment, open their related breakers.
  3.   Do NOT make connection to live power lines.
  4.   Make connections to the module first; then connect to the circuit to be monitored.
  5.   Route power wires in a safe manner in accordance with good practice and local codes.
  6.   Wear proper personal protective equipment including safety glasses and insulated gloves when making
       connections to power circuits.
  7.   Ensure hands, shoes, and floor are dry before making any connection to a power line.
  8.   Make sure the unit is turned OFF before making connection to terminals.
  9.   Make sure all circuits are de-energized before making connections.
 10.   Before each use, inspect all cables for breaks or cracks in the insulation. Replace immediately if defective.
 11.   Use copper conductors in Field Wiring only, 60/75˚C.
 12.   Use caution when connecting controllers to PCs via serial or USB. PCs, especially laptops, may use “floating
       power supplies” that are ungrounded. This could cause a damaging voltage potential between the laptop and
       controller. Ensure the controller and laptop are grounded for maximum protection. Consider using a USB
       isolator due to voltage potential differences as a preventative measure.




                                                         Page 18
