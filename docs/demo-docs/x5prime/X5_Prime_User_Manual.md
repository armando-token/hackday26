# X5_Prime_User_Manual

> Source PDF: `MAN1039_21_EN_X5_X5P_UM.pdf`
> Converted for agent/API Markdown consumption. Prefer this file over PDF parsing.

---

User Manual for
 X5 & X5 Prime




 MAN1039_21_X5_X5P_UM
LIMITED WARRANTY AND LIMITATION OF LIABILITY
Horner APG, LLC, ("HE-APG") warrants to the original purchaser that the X5/X5 Prime OCS module manufactured by HE-APG is free
from defects in material and workmanship under normal use and service. The obligation of HE-APG under this warranty shall be
limited to the repair or exchange of any part or parts which may prove defective under normal use and service within two (2) years from
the date of manufacture or eighteen (18) months from the date of installation by the original purchaser whichever occurs first, such
defect to be disclosed to the satisfaction of HE-APG after examination by HE-APG of the allegedly defective part or parts. THIS
WARRANTY IS EXPRESSLY IN LIEU OF ALL OTHER WARRANTIES EXPRESSED OR IMPLIED INCLUDING THE WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR USE AND OF ALL OTHER OBLIGATIONS OR LIABILITIES AND HE-APG NEITHER
ASSUMES, NOR AUTHORIZES ANY OTHER PERSON TO ASSUME FOR HE-APG, ANY OTHER LIABILITY IN CONNECTION
WITH THE SALE OF THIS X5/X5 Prime OCS MODULE. THIS WARRANTY SHALL NOT APPLY TO THIS X5/X5 Prime OCS
MODULE OR ANY PART THEREOF WHICH HAS BEEN SUBJECT TO ACCIDENT, NEGLIGENCE, ALTERATION, ABUSE, OR
MISUSE. HE-APG MAKES NO WARRANTY WHATSOEVER IN RESPECT TO ACCESSORIES OR PARTS NOT SUPPLIED BY HE-
APG. THE TERM "ORIGINAL PURCHASER", AS USED IN THIS WARRANTY, SHALL BE DEEMED TO MEAN THAT PERSON FOR
WHOM THE X5/X5 Prime OCS MODULE IS ORIGINALLY INSTALLED. THIS WARRANTY SHALL APPLY ONLY WITHIN THE
BOUNDARIES OF THE CONTINENTAL UNITED STATES.
In no event, whether as a result of breach of contract, warranty, tort (including negligence) or otherwise, shall HE-APG or its suppliers
be liable of any special, consequential, incidental or penal damages including, but not limited to, loss of profit or revenues, loss of use
of the products or any associated equipment, damage to associated equipment, cost of capital, cost of substitute products, facilities,
services or replacement power, down time costs, or claims of original purchaser's customers for such damages.
To obtain warranty service, return the product to your distributor with a description of the problem, proof of purchase, post paid, insured
and in a suitable package.
To obtain warranty service, return the product to your distributor with a description of the problem, proof of purchase,
postpaid, insured and in a suitable package.

ABOUT PROGRAMMING EXAMPLES
Any example programs and program segments in this manual or provided from Horner's website, Cscape, or on YouTube, are
included solely for illustrative purposes. Due to the many variables and requirements associated with any installation, Horner APG
cannot assume responsibility or liability for actual use based on the examples and diagrams. It is the sole responsibility of the system
designer utilizing the X5/X5 Prime OCS module to design the end system, integrate the X5/X5 Prime OCS module, and make safety
provisions for the end equipment customary to industrial applications as defined in any codes or standards which apply.

 NOTE: The programming examples shown in this manual are for illustrative purposes only. Proper machine operation is
 the sole responsibility of the system integrator.
PREFACE
This manual explains how to use the X5/X5 Prime OCS.
Copyright (C) 2016 Horner APG, LLC, 59 South State Avenue, Indianapolis, Indiana 46201. All rights reserved. No part of this
publication may be reproduced, transmitted, transcribed, stored in a retrieval system, or translated into any language or computer
language, in any form by any means, electronic, mechanical, magnetic, optical, chemical, manual or otherwise, without the prior
agreement and written permission of Horner APG, Inc.
All software described in this document or media is also copyrighted material subject to the terms and conditions of the Horner
Software License Agreement.
Information in this document is subject to change without notice and does not represent a commitment on the part of Horner APG.
Cscape, SmartStack, SmartStix, SmartRail, and CsCAN are trademarks of Horner APG. Ethernet is a trademark of Xerox
Corporation®.
microSD® and CompactFlash are registered trademarks of SanDisk Corporation®.
Published with Madcap Flare®.


North America
Tel: (+) (317) 916-4274
Fax: (+) (317) 639-4279
Web: http://www.hornerautomation.com
Email: APGUSATechSupport@heapg.com


Europe
Tel: (+) 353-21-4321-266
Fax: (+) 353-21-4321-826
Web: http://hornerautomation.eu
Email: technical.support@horner-apg.com
                                     Table of Contents
Chapter 1: Safety and Compliance                                      9
  1.1: Warnings                                                        9
  1.2: FCC Compliance                                                 10
  1.3: Safety Precautions                                             10
Chapter 2: Intro to the X5 & X5 Prime                                 12
  2.1: Visual Overview                                                12
  2.2: Where to find more information for the X5 & X5 Prime           12
  2.3: Connectivity to the X5 & X5 Prime                              13
  2.4: Features of X5/X5 Prime OCS                                    14
Chapter 3: Mechanical Installation                                    16
  3.1: Mounting Requirements                                          16
  3.2: Mounting Orientation                                           17
  3.3: Dimensions                                                     17
  3.4: Installation Procedure                                         18
  3.5: Factors Affecting Panel Layout Design and Clearances           18
     3.5.1: Clearance/Adequate Space                                  19
     3.5.2: Grounding                                                 19
     3.5.3: Temperature/Ventilation                                   19
     3.5.4: Orientation                                               19
     3.5.5: Noise                                                     19
     3.5.6: Shock and Vibration                                       19
     3.5.7: Panel Layout Design and Clearance Checklist               20
Chapter 4: Electrical Installation                                    22
  4.1: Ground Specifications                                          22
  4.2: How to Test for Good Ground                                    22
  4.3: Primary Power Port                                             23
     4.3.1: DC Input/Frame                                            23
     4.3.2: Power Up                                                  23
Chapter 5: System Settings                                            25
  5.1: Opening System Menu                                            25
  5.2: OCS LED Indicator Lights                                       26
  5.3: System Menu                                                    27
     5.3.1: Navigation and Editing                                    28
  5.4: Set Networks                                                   29
  5.5: View Status & Diags                                            30
     5.5.1: View Status                                               30
     5.5.2: View Diags                                                31
  5.6: View I/O Slots & Protocols                                     33
     5.6.1: View I/O Slots                                            33
     5.6.2: View Protocols                                            34
  5.7: Set Keys, Serial Ports, Ethernet, Time/Date, Beeper & Screen   35
     5.7.1: Set Fkeys Mode                                            35
     5.7.2: Set Serial Ports                                          35
     5.7.3: Set Time/Date                                             36
     5.7.4: Set Beeper                                                38
     5.7.5: Set Screen                                                38
  5.8: Removable Media                                                39
  5.9: Fail – Safe System                                             40
     5.9.1: Enable AutoRun                                            41
     5.9.2: Enable AutoLoad                                           41
  5.10: Clone Unit                                                    42
     5.10.1: Make Clone                                               42
     5.10.2: Load Clone                                               43
  5.11: WebMI License Details                                         44
  5.12: Touch Screen Calibration                                      45
Chapter 6: Registers                                      47
 6.1: Register Definitions                                47
 6.2: %S Registers                                        48
 6.3: %SR Registers                                       49
 6.4: I/O Register Map for X5 & X5 Prime                  57
 6.5: X5 & X5 Prime Resource Limits                       57
Chapter 7: Cscape Configuration                           59
 7.1: Cscape Status Bar                                   59
 7.2: Establishing Communications                         60
    7.2.1: User Programming Port:                         60
 7.3: Communicating via MJ1 Serial Port                   65
 7.4: Communicating via On Board Ethernet Port            65
 7.5: Configuring Ethernet Settings                       68
 7.6: Cscape Configuration                                69
 7.7: Digital/HSC Input Configuration                     69
    7.7.1: Digital Input Configuration                    69
 7.8: Digital/PWM Output Configuration                    73
    7.8.1: Digital Output Configuration                   73
 7.9: Analog Inputs                                       75
    7.9.1: Scaling Analog Inputs & Examples               78
Chapter 8: General I/O Configuration                      81
 8.1 Digital / HSC Input Configuration                    81
 8.2 Digital / PWM Output Configuration                   85
    8.2.1 Solid State Digital Outputs                     86
    8.2.2 Digital Output Configuration                    87
 8.3 Analog Input Wiring                                  89
 8.4 Analog Outputs                                       90
Chapter 9: High Speed I/O (HSC/PWM)                       92
 9.1: Overview                                            92
 9.2: High Speed I/O Glossary                             93
 9.3: High Speed Counter (HSC) Functions                  94
    9.3.1: Frequency                                      94
    9.3.2: Totalize                                       94
 9.4: Pulse Width Measurement                             95
 9.5: Period Measurement                                  95
 9.6: Quadrature                                          96
 9.7: Register Match                                      96
 9.8: HSC Functions                                       96
 9.9: Status Bits                                         98
 9.10: HSC Functions Register Maps                        99
    9.10.1: I/O Mapping 2-Counter Mode (X5 Only)          99
    9.10.2: I/O Mapping 4-Counter Mode (X5 Only)         101
    9.10.3: I/O Mapping 4-Counter Mode (X5 Prime Only)   104
 9.11: High Speed Output Functions                       107
    9.11.1: Normal                                       107
    9.11.2: PWM                                          107
    9.11.3: PWM Output Waveform                          108
    9.11.4: High Speed Counter Match                     108
    9.11.5: Stepper Function                             109
 9.12: High Speed Output Functions Register Map          110
    9.12.1: I/O Mapping 2-Counter Mode                   110
    9.12.2: I/O Mapping 4-Counter Mode                   111
    9.12.3: PWM Examples                                 112
    9.12.4: STP Examples                                 113
 9.13: HSC I/O Filtering                                 114
Chapter 10: Serial Communications                        117
 10.1: The Serial Port & Dip Switches                    117
 10.2: RS-485 Serial Port                                118
 10.3: CAN Termination                                   118
 10.4: Cscape Programming via Serial Port                 118
 10.5: Ladder-Controlled Serial Communication             118
 10.6: Downloadable Serial Communication Protocols        118
 10.7: Configuration via Mini-B USB                       119
Chapter 11: CAN Communications                            121
 11.1: Port Description                                   121
 11.2: CAN1 Port Wiring                                   121
   11.2.1: CAN Connector                                  121
                                                          121
 11.3: Cscape Programming via CAN                         121
 11.4: Ladder-Controlled CAN Communication                122
 11.5: Using CAN for I/O Expansion (Network I/O)          122
Chapter 12: Ethernet Communications                       124
 12.1: Ethernet Module Protocols                          124
 12.2: Ethernet Systems Requirements                      125
 12.3: Ethernet Module Specifications                     125
 12.4: Ethernet Module Configuration                      125
 12.5: Ethernet Module Protocol Configuration             128
Chapter 13: Protocol Configuration                        130
 13.1: Overview                                           130
 13.2: Protocol Device Driver Selection                   131
 13.3: Network Configuration                              132
 13.4: Device List and Device Configuration               133
   13.4.1: Device List                                    133
   13.4.2: Device Configuration                           134
 13.5: Scan List                                          135
   13.5.1: Menu                                           136
   13.5.2: Buttons                                        136
   13.5.3: Display Control                                136
   13.5.4: Data Mapping Configuration (Scan List Entry)   137
Chapter 14: User Interface                                141
 14.1: Screen Specifications                              141
 14.2: Displaying and Entering Data                       142
   14.2.1: Alpha-Numeric Keypad                           143
 14.3: Screen Navigation                                  144
 14.4: Ladder-Based Screen Navigation                     145
 14.5: Beeper Acknowledgment                              145
 14.6: Touch (Slip) Sensitivity                           146
 14.7: Alarms                                             146
   14.7.1: Alarm Viewer                                   147
 14.8: Removable Media                                    148
   14.8.1: Removeable Media Viewer                        148
   14.8.2: Safe Removal of Removeable Media               149
 14.9: Screen Saver                                       149
 14.10: Screen Brightness                                 149
 14.11: Touch Screen Pressure                             150
Chapter 15: Video Object                                  152
 15.1: Video Object Overview                              152
 15.2: Opening Video Object in Cscape                     153
 15.3: Video Properties Configuration                     154
   15.3.1: Video Type                                     154
   15.3.2: Control                                        155
   15.3.3: Configuring Display Properties                 156
 15.4: Video Object Performance                           156
 15.5: Web Cameras                                        156
Chapter 16: Removable Media                               158
 16.1: microSD Cards                                      158
   16.1.1: microSD File System                            159
 16.2: Using the Removable Media Manager               159
 16.3: Log Data                                        160
 16.4: View and Capture Screens                        160
 16.5: Removable Media Object                          160
 16.6: Function Blocks in Cscape                       161
   16.6.1: Program Features                            161
   16.6.2: Graphic/Screen Editor                       161
   16.6.3: Additional Configuration                    162
 16.7: Filenames                                       162
 16.8: System Registers used with RM                   162
Chapter 17: Clone Unit                                 165
 17.1: Make Clone                                      165
 17.2: Load Clone                                      168
Chapter 18: Fail-Safe System for the XL and X Series   171
 18.1: For the XL & X Series                           171
 18.2: Fail-Safe System Overview                       171
 18.3: Settings                                        172
 18.4: Backup/Restore Data                             172
   18.4.1: Backup OCS Data                             173
   18.4.2: Restore OCS Data                            173
 18.5: Clear Backup Data                               173
 18.6: AutoLoad                                        176
 18.7: AutoRun                                         178
Chapter 18: Fail-Safe System for the XL Prime Series   179
 18.1: For the XL Prime Series                         179
 18.2: Fail-Safe System Overview                       179
 18.3: Settings                                        180
 18.4: Backup/Restore Data                             180
   18.4.1: Backup OCS Data                             181
   18.4.2: Restore OCS Data                            181
 18.5: Clear Backup Data                               182
 18.6: AutoLoad                                        184
 18.7: AutoRun                                         186
Chapter 19: Modbus Communications                      188
 19.1: Modbus Slave Overview                           188
 19.2: Modbus Master Overview                          189
 19.3: Modbus Addressing Table                         190
Chapter 20: Firmware Updates                           192
 20.1: Check for Current Firmware Revision             192
 20.2: Firmware Update Details                         193
 20.3: Download Firmware                               193
 20.4: Firmware Update Steps                           194
 20.5: Onboard Battery                                 194
Chapter 21: Troubleshooting                            196
 21.1: Connecting to the OCS                           196
   21.1.1: Serial Port – MJ1 Programming               197
   21.1.2: USB Port - Mini BType C Programming         197
   21.1.3: ETN Port Programming                        197
 21.2: Local Controller and Local I/O                  198
   21.2.1: Local I/O Troubleshooting Checklist         198
 21.3: CsCAN Network                                   198
   21.3.1: CsCAN Network Troubleshooting Checklist     199
 21.4: USB Interfaces                                  199
 21.5: Basic Troubleshooting                           200
 21.6: Technical Support Contacts                      200
Change Log                                             201
Index                                                  202
Safety and
Compliance




    Page 8
                                                                                       Chapter 1: Safety and Compliance



Chapter 1: Safety and Compliance
1.1: Warnings
When found on the product, the following symbols specify:



  WARNING:              Consult user documentation.




  WARNING:                Electrical Shock Hazard.

  WARNING: EXPLOSION HAZARD – Substitution of components may impair suitability for Class I, Division 2.


  WARNING: EXPLOSION HAZARD – Do not disconnect equipment unless power has been switched off or the area is
  known to be non-hazardous.



   1.   To avoid the risk of electric shock or burns, always connect the safety (or earth) ground before making any
        other connections.
   2.   To reduce the risk of fire, electrical shock, or physical injury it is strongly recommended to fuse the voltage
        measurement inputs. Be sure to locate fuses as close to the source as possible.
   3.   Replace fuse with the same type and rating to provide protection against risk of fire and shock hazards.
   4.   In the event of repeated failure, do not replace the fuse again as a repeated failure indicates a defective
        condition that will not clear by replacing the fuse.
   5.   Only qualified electrical personnel familiar with the construction and operation of this equipment and the
        hazards involved should install, adjust, operate, or service this equipment. Read and understand this
        manual and other applicable manuals in their entirety before proceeding. Failure to observe this precaution
        could result in severe bodily injury or loss of life.


  WARNING: BATTERY MAY EXPLODE IF MISTREATED. DO NOT RECHARGE, DISASSEMBLE, OR DISPOSE OF IN
  FIRE.


  WARNING: BATTERIES MUST ONLY BE CHANGED IN AN AREA KNOWN TO BE NON-HAZARDOUS.


  WARNING: The USB parts are for operational maintenance only. Do not leave permanently connected unless area is
  known to be non-hazardous.


  WARNING: If the equipment is used in a manner not specified by Horner APG, the protection provided by the equipment
  may be impaired.


NOTE: All applicable codes and standards must be followed in the installation of this product.
NOTE: For I/O wiring (discrete), use the following wire type or equivalent: Belden 9918, 18 AWG, or larger.
NOTE: See "Electrical Installation" for more details.

                                                            Page 9 of 206
                                                                                 Chapter 1: Safety and Compliance




1.2: FCC Compliance
This device complies with Part 15 of the FCC Rules. Operation is subject to the following two conditions:
   1.   This device may not cause harmful interference.
   2.   This device must accept any interference received, including interference that may cause undesired
        operation.



1.3: Safety Precautions
Adhere to the following safety precautions whenever any type of connection is made to the module:
ll applicable codes and standards need to be followed in the installation of this product. Adhere to the following
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
  11.   Use copper conductors in Field Wiring only, 60/75°C.
  12.   Use caution when connecting controllers to PCs via serial or USB. PCs, especially laptops may use
        “floating power supplies” that are ungrounded. This could cause a damaging voltage potential between the
        laptop and controller. Ensure the controller and laptop are grounded for maximum protection. Consider
        using a USB isolator due to voltage potential differences as a preventative measure.




                                                       Page 10 of 206
 Intro to the
X5 & X5 Prime




     Page 11
                                                                                    Chapter 2: Intro to the X5 & X5 Prime



Chapter 2: Intro to the X5 & X5 Prime
   2.1: Visual Overview                                                                                                     12
   2.2: Where to find more information for the X5 & X5 Prime                                                                12
   2.3: Connectivity to the X5 & X5 Prime                                                                                   13
   2.4: Features of X5/X5 Prime OCS                                                                                         14

2.1: Visual Overview
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



 NOTE: Use caution when connecting controllers to PCs with serial or USB. PCs, especially laptops, use “floating power
 supplies” that are ungrounded. These can cause a voltage potential between the laptop and controller. Confirm that the
 controller and laptop are grounded for maximum protection.


2.2: Where to find more information for the X5 & X5 Prime
See MAN1040 or MAN1363 from the Horner website Documentation Search for for additional information.




                                                          Page 12 of 206
                                                                         Chapter 2: Intro to the X5 & X5 Prime


2.3: Connectivity to the X5 & X5 Prime




                                         Connectivity
       CAN              I/O         USB                            Serial                      Ethernet
 Other OCS Devices   Sensors      Flash Drive               Other OCS Devices                   Cscape
   SmartStix I/O     Indicators    Cscape                          Drives                     OPC Server
     OCS-I/O          Alarms                                       PLCs                  Modbus TCP Devices
  SmartBlock I/O     Encoders                                     Printers                   SmartRail I/O
   SmartRail I/O      Pumps                                       SCADA                      OCS to OCS
                      Relays                                     OPC Server
                     Solenoids                                     Portal
                                                                 I/O Devices
                                                            SmartMod Devices




                                                Page 13 of 206
                                                                                      Chapter 2: Intro to the X5 & X5 Prime


2.4: Features of X5/X5 Prime OCS
The X5/X5 Prime OCS are all-in-one industrial control devices combining control, user interface, I/O and networking into a
single, integrated package. Unique features of the X5/X5 Prime OCS include:
    l   Bright, 65K color graphical touch sensing LCD display
    l   Display of complex graphical objects including trends, gauges, meters and animations
    l   High performance graphic processing
    l   Advanced control capabilities including floating point, multiple auto-tuning PID loops and string handling
        capabilities
    l   Removable media for FAT32 format (up to 2TB) of storage of programs, data logging or screen captures
    l   CsCAN networking port for communication with remote I/O, other controllers or PCs
    l   High speed USB port for communication with PCs and programming of controller
    l   Configurable serial protocols for communication to drives, PLCs, or other serial peripherals
    l   Full featured, built-in I/O including high resolution analog, high speed counter inputs, and PWM outputs
    l   Advanced high speed I/O capabilities
    l   Cscape programming software that allows all aspects of the X5/X5 Prime OCS to be programmed and
        configured from one integrated application
    l   On board Ethernet port (10/100Mbps) for Cscape programming and application defined communication,
        with Auto MDI/MDI-X




                                                           Page 14 of 206
Mechanical
Installation




     Page 15
                                                                                          Chapter 3: Mechanical Installation



Chapter 3: Mechanical Installation
    3.1: Mounting Requirements                                                                                                      16
    3.2: Mounting Orientation                                                                                                       17
    3.3: Dimensions                                                                                                                 17
    3.4: Installation Procedure                                                                                                     18
    3.5: Factors Affecting Panel Layout Design and Clearances                                                                       18
The mechanical installation greatly affects the operation, safety and appearance of the system. Information is provided to
mechanically install the unit such as cut-out sizes, mounting procedures, and other recommendations for the proper mechanical
installation of the unit.

 NOTE: The datasheet is the first document to refer to for model-specific information related to X5 & X5 Prime models such as
 pin-outs, jumper settings, and other key installation information. See the Documentation Search for the datasheet.


3.1: Mounting Requirements




Once the panel design has been completed using the criteria and suggestions in the following sections, use the following steps
to panel mount the X5/X5 Prime OCS.
   1.   Locate a place to mount the X5. Be sure to leave enough room at the top of the unit for insertion and removal of the
        microSD™ card.
   2.   Cut the host panel per the diagram, creating a 90.5mm x 119.5mm (with a tolerance of +0.5mm / -0mm) opening into
        which the X5 will be installed.
    l   If the opening is too large, water may leak into the enclosure, potentially damaging the unit.
    l   If the opening is too small, the OCS may not fit through the hole without damage.

   3.   Remove the burrs and sharp edges, and ensure the panel is not warped in the cutting process.

   4.   Install and tighten the four mounting clips (provided in the box) until the gasket forms a tight seal. For included metal
        mounting clips, use a torque rating of 7-10 in•lbs (0.79-1.13 N•m).
   5.   Connect communications cables to the serial port, USB ports, and CAN port as required.




                                                             Page 16 of 206
                                                                                 Chapter 3: Mechanical Installation


3.2: Mounting Orientation




NOTE: For panel or DIN rail mounting: The orientation shown above provides for optimum readability of the screen.


3.3: Dimensions




                                                                                            Panel Tolerance: +/- 0.5mm




                                                       Page 17 of 206
                                                                                          Chapter 3: Mechanical Installation


3.4: Installation Procedure
    l   The equipment is panel mounted and is meant to be installed in an enclosure suitable for the environment,
        such that the back of the equipment is only accessible with the use of a tool.
    l   Requires a Class 2 Power Source.
    l   The equipment is suitable for use in Class I, Division 2, Groups A, B, C and D; Class II, Division 2 Groups F
        and G; and Class III Hazardous Locations or Non-Hazardous Locations only.
    l   The X5 uses a clip installation method to ensure a robust and watertight seal to the enclosure. Use the
        following steps for correct installation and operation of the unit.
Installation and operation of the unit:
   1.   Locate a place to mount the X5. Be sure to leave enough room at the top of the unit for insertion and removal of the
        microSD™ card.
   2.   Cut the host panel per the diagram, creating a 90.5mm x 119.5mm (with a tolerance of +0.5mm / -0mm) opening into
        which the X5 will be installed.
    l   If the opening is too large, water may leak into the enclosure, potentially damaging the unit.
    l   If the opening is too small, the OCS may not fit through the hole without damage.

   3.   Remove the burrs and sharp edges, and ensure the panel is not warped in the cutting process.

   4.   Install and tighten the four mounting clips (provided in the box) until the gasket forms a tight seal. For included metal
        mounting clips, use a torque rating of 7-10 in•lbs (0.79-1.13 N•m).
   5.   Connect communications cables to the serial port, USB ports, and CAN port as required.




3.5: Factors Affecting Panel Layout Design and Clearances

  WARNING: It is important to follow the requirements of the panel manufacture and to follow all applicable electrical codes
  and standards.

The designer of a panel layout must assess the requirements of a particular system and to consider the following design factors.




                                                             Page 18 of 206
                                                                                         Chapter 3: Mechanical Installation


3.5.1: Clearance/Adequate Space
Install devices to allow sufficient clearance to open and close the panel door.
                                 Minimum Clearance Requirements for Panel Box and Door
 Minimum Distance between base of device and sides of cabinet                     2” (50.80mm)
 Minimum Distance between base of device and wiring ducts                         1.5” (38.10mm)
 If more than one device installed in panel box (or on door): Minimum
                                                                                  4” (101.60mm) between bases of each device
 Distance between bases of each device
 When door is closed: Minimum distance between device and closed door
                                                                                  2” (50.80mm)
 (Be sure to allow enough depth for the OCS.)

3.5.2: Grounding
Panel Box: The panel box must be properly connected to earth ground to provide a good common ground reference.
Panel Door: Tie a low impedance ground strap between the panel box and the panel door to ensure that they have the same
ground reference.

  WARNING: Be sure meet the ground requirements of the panel manufactuer and also meet applicable electrical codes and
  standards.


3.5.3: Temperature/Ventilation
Ensure that the panel layout design allows for adequate ventilation and maintains the specified ambient temperature range.
Consider the impact on the design of the panel layout if operating at the extreme ends of the ambient temperature range. For
example, if it is determined that a cooling device is required, allow adequate space and clearances for the device in the panel
box or on the panel door.

3.5.4: Orientation
When panel-mounted, there are no orientation restrictions on the X5/X5 Prime OCS.

3.5.5: Noise
Consider the impact on the panel layout design and clearance requirements if noise suppression devices are needed. Be sure to
maintain an adequate distance between the OCS and noisy devices such as relays, motor starters, etc. For details on output
protection, especially when using contactors, solenoids, etc., see MAN0962 on “Spark Quenchers”.

3.5.6: Shock and Vibration
The OCS has been designed to operate in typical industrial environments that may inflict some shock and vibration on the unit.
For applications that may inflict excessive shock and vibration please use proper dampening techniques or relocate the OCS to
a location that minimizes shock and/or vibration.




                                                             Page 19 of 206
                                                                               Chapter 3: Mechanical Installation


3.5.7: Panel Layout Design and Clearance Checklist
The following list provides highlights of panel layout design factors:
    n    Meets the electrical code and applicable standards for proper grounding, etc.?
    n    Meets the panel manufacturer’s requirements for grounding, etc.?
    n    Is the panel box properly connected to earth ground? Is the panel door properly grounded? Has the
         appropriate procedure been followed to properly ground the devices in the panel box and on the panel
         door?
    n    Are minimum clearance requirements met? Can the panel door be easily opened and closed? Is there
         adequate space between device bases as well as the sides of the panel and wiring ducts?
    n    Is the panel box deep enough to accommodate the controller?
    n    Is there adequate ventilation? Is the ambient temperature range maintained? Are cooling or heating
         devices required?
    n    Are noise suppression devices or isolation transformers required? Is there adequate distance between the
         base of the controller and noisy devices such as relays or motor starters? Ensure that power and signal
         wires are not routed in the same conduit.
    n    Are there other requirements that impact the particular system, which need to be considered?




                                                              Page 20 of 206
 Electrical
Installation




     Page 21
                                                                                           Chapter 4: Electrical Installation



Chapter 4: Electrical Installation
    4.1: Ground Specifications                                                                                                   22
    4.2: How to Test for Good Ground                                                                                             22
    4.3: Primary Power Port                                                                                                      23

 NOTE: The datasheet is the first document to refer to for model-specific information. Refer to the Documentation Search on
 the Horner website.


4.1: Ground Specifications
Ideally, a ground resistance measurement from equipment to earth ground is 0Ω. In reality it typically is higher. The US National
Electrical Code (NEC) states the resistance to ground shall not exceed 25Ω. Horner Automation recommends less than 15Ω
resistance from the equipment to ground. Resistance greater than 25Ω can cause undesirable or harmful interference to the
device.
Grounding Definition - The term ground is defined as a conductive connection between a circuit or piece of equipment and the
earth. Grounds are fundamentally used to protect an application from harmful interference
causing either physical damage such as by lightning or voltage transients or from circuit disruption often caused by radio
frequency interference (RFI).

4.2: How to Test for Good Ground
In order to test ground resistance, a Ground Resistance Tester must be used. A typical Ground Resistance Meter Kit contains a
meter, two or three wire leads, and two ground rods. Instructions are supplied for either a two-point or a three-point ground test.
The figure shows a two-point ground connection test.




                                                             Page 22 of 206
                                                                                     Chapter 4: Electrical Installation


4.3: Primary Power Port
The Primary Power Range is 10VDC to 30VDC




                                                Primary Power Port Pins
         PIN                    Signal                                            Description
          1                     Ground               Frame Ground
          2                       DC-                Input Power Supply Ground
          3                       DC+                Input Power Supply Voltage

4.3.1: DC Input/Frame
    l   Solid/Stranded Wire: 12-24 AWG (2.5-0.2mm²)
    l   Strip length: 0.28” (7mm)
    l   Torque, Terminal Hold-Down Screws: 4.5 – 7 in•lbs (0.50 – 0.78 N•m)
    l   DC- is internally connected to I/O V-, but is isolated from the V- connection of both CAN1 and CAN2 ports.
        A Class 2 power supply must be used.

4.3.2: Power Up
   1.   OPTION: Attach ferrite core with a minimum of two turns of the DC+ and DC- signals from the DC supply
        that is powering the controllers.




   2.   Connect to earth ground.
   3.   Apply recommended power.

 NOTE: Refer to datasheet for power specifications




                                                           Page 23 of 206
System Settings and
   Adjustments




        Page 24
                                                                                         Chapter 5: System Settings



Chapter 5: System Settings
   5.1: Opening System Menu                                                                                                 25
   5.2: OCS LED Indicator Lights                                                                                            26
   5.3: System Menu                                                                                                         27
   5.4: Set Networks                                                                                                        29
   5.5: View Status & Diags                                                                                                 30
   5.6: View I/O Slots & Protocols                                                                                          33
   5.7: Set Keys, Serial Ports, Ethernet, Time/Date, Beeper & Screen                                                        35
   5.8: Removable Media                                                                                                     39
   5.9: Fail – Safe System                                                                                                  40
   5.10: Clone Unit                                                                                                         42
   5.11: WebMI License Details                                                                                              44
   5.12: Touch Screen Calibration                                                                                           45



5.1: Opening System Menu
The X5/X5 Prime has a built-in System Menu, which lets the user view System Settings and makes adjustments. To start the
System Menu, press the far upper right corner of the touchscreen to bring out the function keys, then press the SYSTEM key (or
set %SR3 to 1), which will display the Main Menu. Then use the ↑ and ↓ (Up Arrow or Down Arrow) keys to select a Main Menu
item and press Enter (Return Arrow) to display the item’s Sub-Menu.




                                                           Page 25 of 206
                                                                            Chapter 5: System Settings


5.2: OCS LED Indicator Lights




                                                     OCS LEDs
       n   OFF indicates OCS is in IDLE/STOP mode.
RUN    n   Flashing indicates DO / IO mode or RUN with no ladder program.
       n   ON indicates ladder code running.
       n   OFF indicates one or more self-tests failed.
 OK    n   ON indicates all self-tests passed.
       n   Flashing at 1 Hz indicates forcing is active.




                                                   Page 26 of 206
                                    Chapter 5: System Settings


5.3: System Menu




                   Page 27 of 206
                                                                                               Chapter 5: System Settings


5.3.1: Navigation and Editing




As mentioned above, the System Menu is started by pressing the System key on the X5/X5 Prime. Next press ESC to exit the
System Menu, or use ↑ and ↓ to select an item and press the Enter key to display the item’s Sub-Menu.
A Sub-Menu generally shows a list of System Settings and their values. After opening a Sub-Menu, if any of its System Settings
are editable, the first System Setting that can be edited is highlighted. If desired, the↑ and ↓ keys can be used to select a different
System Setting to be edited.
At this point, either press ESC to exit the Sub-Menu (returning to the Main Menu) or press Enter to edit the highlighted System
Setting. If Enter is pressed, the System Setting’s value will be highlighted, indicating that it is ready to be modified.
When modifying a System Setting’s value, use either the arrow keys ( ↓↑ → ← ) or the numeric keys, or the appropriate touch
screen icons to select a new value.
The arrow keys are used to edit System Settings that have just a few possible values. Each time the arrow key is pressed, a new
possible value is displayed. When the desired value appears, press the Enter key to save it; otherwise press the ESC key to
cancel the edit.




The numeric keys are normally used to enter numeric System Settings:




                                                              Page 28 of 206
                                                                                              Chapter 5: System Settings

In addition, to edit a single numeric digit, use the → or ← key to select the digit and then either press a numeric key or use ↓ or ↑
to modify the digit. In any case, after entering the new desired value, press the Enter key to save it; otherwise press the ESC key
to cancel the edit.

5.4: Set Networks




This sub menu allows setting for the CAN and Ethernet network to be viewed or changed.
                    Yes = CAN1 connected to a CAN network and functioning properly
 CAN Ok?
                    No = Not ready to communicate on CAN network
 CAN ID             1 to 253 = This node’s CsCAN Network ID; must be unique on network
                    125kB = 125kBd CAN network
                    250kB = 250kBd CAN network
 CAN Baud
                    500kB = 500kBd CAN network
                    1MB = 1MBd CAN network
 MAC ID             Displays the Ethernet MAC ID of the unit
 IP                 Displays the Ethernet IP address of the unit
 NetM               Displays the Ethernet net mask of the unit
 GatWy              Displays the Ethernet gateway of the unit

 NOTE: The IP address, Net Mask, and Gateway can be changed from the System Menu. This is designed for commissioning
 or temporary field changes. The actual parameters are defined in Cscape under the Ethernet configuration.

 NOTE: The downloaded program overrides settings made in the System Menu.




                                                              Page 29 of 206
                                                                                           Chapter 5: System Settings


5.5: View Status & Diags
5.5.1: View Status




The View Status Sub-Menu displays up to 19 System Settings. Only the Mode System Setting is editable.
 Model:                    HE-X5 = Model number of this X5/X5 Prime OCS unit
                           Idle = X5/X5 Prime OCS is in Idle mode
 OCS Mode:                 DoIO = X5/X5 Prime OCS is in Do I/O mode
                           Run = X5/X5 Prime OCS is in Run mode
                           0.0 = X5/X5 Prime OCS is not in Run mode
 Scan Rate(mS):
                           0.1 to 999.9 = Average number of mS for each ladder scan
 OCS Net Use %:            0.0 to 100.0 = CAN network bandwidth % used by this X5/X5 Prime OCS node
 All Net Use %:            0.0 to 100.0 = CAN network bandwidth % used by all nodes
 Ladder Size:              x = Number of bytes in application ladder program
 Config Size:              x = Number of bytes in application I/O configuration
 Graphics Size:            x = Number of bytes in application graphic screens
 String Size:              x = Number of bytes in application string table
 Bitmap Size:              x = Number of bytes in application bitmaps
 Text Tbl Size:            x = Number of bytes in application text tables
 Font Tbl Size:            x = Number of bytes in application font tables
 Protocol Size:            x = Number of bytes in application downloaded protocols
 SMS File Size:            x = Number of bytes in application SMS protocol configuration
 Firmware Rev:             xx.yy = Current firmware version
 FPGA Rev:                 x.y = Current FPGA version (High Speed I/O Sub System)
 OS Ver:                   a.b.cd.yz = Current Operating System version
 InitRD Rev:               x.yz = Bootloader version
                           Ok = All power-on self-tests passed
 Self-Test:
                           Fault = One or more power-on self-tests failed




                                                           Page 30 of 206
                                                                                             Chapter 5: System Settings


5.5.2: View Diags




The View Diags Sub-Menu displays up to 11 System Diagnostics, none of which are editable.
The first two System Diagnostics are critical. If any of them indicate a Fault condition, the X5/X5 Prime OCS will not enter or
remain in Run mode, and the problem must be investigated and corrected.
                             Ok = All executed ladder instructions are legal for loaded firmware
 Logic Error:
                             Fault = A ladder instruction not supported by firmware was found
                             Ok = Ladder program and I/O configuration loaded successfully
 User Program:
                             Fault = Ladder program or I/O configuration not loaded or load failed




                                                             Page 31 of 206
                                                                                           Chapter 5: System Settings

The last nine System Diagnostics are informational. If any of them indicate a Warning condition, the X5/X5 Prime OCS can still
enter and remain in Run mode, but the problem should be investigated and corrected.
                                   Ok = Application graphics objects loaded successfully
 User Graphics
                                   Fault = Application graphics objects not loaded or load failed
                                   0 = Watchdog timer has not tripped since the last power-up
 W-Dog Trips
                                   x = Number of times watchdog timer has tripped
                                   0 = No CAN network bus-off errors have occurred
 Net Errors
                                   x = Number of CAN network bus-off errors that have occurred
                                   Ok = At least one other node was found on the CAN network
 Network State
                                   Warning = No other nodes were found on the CAN network
                                   Ok = This node’s CAN Network ID is in the range 1 to 253
 Network ID
                                   Warning = This node’s CAN Network ID was out of range at power-up
                                   Ok = This node’s Network ID is unique on the CAN network
 Dup Net ID
                                   Warning = This node’s Network ID is duplicated in another node
                                   Ok = Time and date have been set
 Clock Error
                                   Warning = Time and date need to be set
                                   Ok = I/O configuration matches the installed I/O and COM modules
 I/O System
                                   Warning = I/O configuration needs updating to match installed modules
                                   Ok = Backup battery operating properly
 Battery
                                   Warning = Backup battery needs to be replaced




                                                           Page 32 of 206
                                                                                         Chapter 5: System Settings


5.6: View I/O Slots & Protocols
5.6.1: View I/O Slots




The View I/O Slots Sub-Menu displays three System Settings, all of which are not editable.
                                                 Slot 1:     Built-in I/O
                                                 Slot 2:     Unavailable
                                                 Slot 3:     Ethernet




                                                           Page 33 of 206
                                                                                          Chapter 5: System Settings


5.6.2: View Protocols
See also: "Protocol Configuration " on page 130




The View Protocols Sub-Menu displays three System Settings, none of which are editable.
As mentioned in Downloadable Serial Communication Protocols section, both the MJ1 (Port 1) and MJ2 (Port 2) serial ports
support downloadable protocols. To assign a downloadable protocol to an X5/X5 Prime OCS serial port, select the Protocol
Config item in Cscape’s Program menu and then setup a protocol for Port 1 or Port 2 (or both).
In the View Protocols Sub-Menu, the currently downloaded protocol, if any, and its version number are displayed for both Port 1
and Port 2.
 Port 1
 Protocol Name                  (None Loaded) or name of the protocol assigned to MJ1
 Protocol Version               Blank or version of the protocol assigned to MJ1
 Port 2
 Protocol Name                  (None Loaded) or name of the protocol assigned to MJ2
 Protocol Version               Blank or version of the protocol assigned to MJ2




                                                           Page 34 of 206
                                                                                           Chapter 5: System Settings


5.7: Set Keys, Serial Ports, Ethernet, Time/Date, Beeper & Screen
5.7.1: Set Fkeys Mode




The Set Fkeys Sub-Menu displays two System Settings, both of which are editable.
                          Momentary = %K1-5 bits go On & Off as F1-F5 are pressed & released
 Fkeys
                          Toggle = %K1-5 bits toggle each time F1-F4 are pressed
                          Yes = Reset and all clear system functions enabled
 SYS_Fn enable
                          No = Reset and all clear system functions disabled

5.7.2: Set Serial Ports
See also: "Serial Communications" on page 102




The Set Serial Ports Sub-Menu displays three System Settings, all of which are editable, and one optional item. For the Dflt
Pgm Port System setting, only MJ1-232 can be selected.
 Dflt Pgm Port                 MJ1-232 = MJ1 RS232 port is the default programming port
                               No = MJ2 RS485 bias resistors are not switched in
 MJ2 RS485 Bias
                               Yes = MJ2 RS485 bias resistors are switched in




                                                            Page 35 of 206
                                                                                               Chapter 5: System Settings


5.7.3: Set Time/Date
The following instructions are to set and display the real-time clock in the controller. More details can be found in the Help File in
Cscape.
                                                 Clock and Time Setting Terms
Coordinated Universal           Abbreviated to UTC, Coordinated Universal Time is the primary time standard by which the
Time (UTC)                      world regulates clocks and time.
                                In order to obtain the local time (anywhere in the world), the user needs to subtract/add a certain
Time Offset
                                number of hours from UTC depending on how many time zones user is away from Greenwich.
Network Time Protocol           A Networking Time Protocol (NTP) for clock synchronization between computer systems over
(NTP)                           packet-switched, variable latency data networks.
                                Time as adjusted to achieve longer evening daylight, especially in summer, by setting the clocks
Daylight Saving Time
                                an hour ahead of the standard time.
                                Daylight Saving Time (DST) is the practice of setting the clocks forward one hour from standard
Apply Daylight Saving
                                time during the summer months, and back again in the fall, in order to make better use of natural
(DST)
                                daylight. Selecting this option increases the Time offset by 1 hour.

 NOTE: Not all controllers contain real-time clocks.

 NOTE: Controller Time Zone (UTC time): From Cscape 9.70 SP2 and FW 14.22 onwards, UTC time is supported.

                               System Registers for UTC (Coordinated Universal Time)
             %SR210 (R/W)                   Time Zone: set in hours + / - UTC.
                                            Daylight Saving: YES = 1
             %SR211 (R/W)                   Daylight Saving: NO = 0
                                            (If daylight saving is enabled, one hour will be added to the local time).
               %SR212 (R)                   UTC – Seconds
               %SR213 (R)                   UTC – Minutes
               %SR214 (R)                   UTC – Hours
               %SR215 (R)                   UTC – Date
               %SR216 (R)                   UTC – Month
               %SR217 (R)                   UTC – Year




To Set Time Zone: The Time Zone setting is an hourly offset from UTC time. If using the Time Zone setting, set it first, then set
the local time. UTC time will be automatically set based on the time zone and local time settings.


                                                              Page 36 of 206
                                                                                            Chapter 5: System Settings

If using NTP: NTP utilizes UTC time, therefore when using NTP, the appropriate hourly offset from UTC time must entered into
the time zone setting.
Daylight Saving Time: If currently observing Daylight Saving Time, set to Yes. If not currently observing Daylight Saving Time,
set to No, the OCS controller does not automatically switch to daylight saving time; however, program logic can be written to
accomplish an automatic switchover using system register %SR211. In program logic, move a “1” (INT) into %SR211 to enable
Daylight Saving Time. Move a “0” (INT) into %SR211 to disable Daylight Saving Time. Trigger the move to %SR211 based on a
compare function to the RTC date according to daylight saving practices in your desired region.
To Set Local Time: The Set Time/Date sub-menu displays three system settings. Time and Date may be edited, and Day is
automatically calculated from the Date setting.

 NOTE: Time and Date are split into three fields each, all of which may be edited. Touch the field or use ↓ or ↑ buttons to select
 a field, then use the ↓ or ↑ buttons to edit the field.

 Time               16:09:49 = Current time (hours:minutes:seconds in 24-hour format)
 Date               10-Jun-2013 = Current date (day-month-year)
 Day                Monday = Current day of week calculated from the Date setting




                                                            Page 37 of 206
                                                                                           Chapter 5: System Settings


5.7.4: Set Beeper




The Set Beeper Sub-Menu displays one System Setting, which is editable.
                              Yes (default) = Enables beeper
 Beeper Enable
                              No = Disables beeper (does NOT affect ladder access)

5.7.5: Set Screen
The Set Screen Sub-Menu displays four System Settings, all of which are editable.




                             Yes = Enable screen saver
 Saver enable
                             No (default) = Disable screen saver
                             5 - 1200 = Amount of time in minutes to expire with NO touch activity before activating screen
 Timeout (min)
                             saver (black screen)
                             Off (default) = Disable popup status
 Popup Status                Warning = Display popup status only if controller status changes to NOT Ok or NOT Run mode.
                             On = Display popup status on any controller status change.
 Update Time (mS)            2 - 50 = Maximum amount of time to allow for graphics update per scan

 NOTE: The built-in screen saver function will not relight the screen unless the touchscreen is touched. There is no automatic
 re-light of the screen in case of alarms or other conditions that may need to be enunciated on the screen. For these instances,
 the application code may generate a positive-transition “1-shot” to %SR57.16 (1 bit only) to re-light the screen in case of
 alarms or other notifications.




                                                           Page 38 of 206
                                                                                        Chapter 5: System Settings


5.8: Removable Media
See also: "Removable Media" on page 158




The Removable Media Sub-Menu displays the Removable Media Manager. After selecting Removable Media from the Main
Menu, one of four Sub-Menu screens will appear:



                                                         = No microSD card has been installed in the Memory Slot




                                                         = microSD card is installed, but it is still initializing




                                                         = microSD card is installed and initialized, but contains no files



                                                                  = microSD card is installed and initialized, and it contains




                                                     Page 39 of 206
                                                                                               Chapter 5: System Settings

If a directory name is highlighted, pressing Enter will switch to that directory showing its files and sub-directories. In a sub-
directory, highlighting .. (dot dot) and pressing Enter will move up one directory.

5.9: Fail – Safe System
See also: "Fail-Safe System for the XL and X Series" on page 171
The Fail-Safe System is a set of features that allow an application to continue running in the event of certain types of "soft"
failures. These "soft" failures include:
    n    Battery power loss
    n    Battery-Backed Register RAM or Application Flash corruption due to, for example, an excessive EMI,
         Electromagnetic Interference, event.
Selecting “Fail-Safe System” menu will open the following menu screen:




                                                               Page 40 of 206
                                                                                      Chapter 5: System Settings

Selecting Backup/Restore Data displays the following screen in:




Backup                 = Copies battery-backed RAM contents on to the onboard flash memory of the OCS.
Restore                = Copies the backed-up data from onboard flash to the battery-backed RAM.
Clear Backup           = The backup data will be erased from the onboard flash.
Exit                   = Goes back to previous menu

5.9.1: Enable AutoRun
“Enable AutoRun” displays the following options which can be selected:




                     No = OCS will be in IDLE mode after AutoLoad or Automatic Restore.
 Enable AutoRun
                     Yes = OCS will automatically be placed into RUN mode after AutoLoad or Automatic Restore.

5.9.2: Enable AutoLoad
“Enable AutoLoad” displays the following options which can be selected:




                                                          Page 41 of 206
                                                                                         Chapter 5: System Settings


                            No = Does not load AUTOLOAD.PGM automatically when application program is absent or
                            corrupted.
 Enable AutoLoad
                            Yes = Loads AUTOLOAD.PGM file automatically from RM when application program is absent or
                            corrupted.


5.10: Clone Unit
See also: "Clone Unit" on page 165
‘Clone Unit’ feature allows the user to “clone” the OCS of the exact same model. This feature “clones” application program and
unit settings stored in battery-backed RAM of an OCS into the RM. Refer to "Removable Media" on page 158 for details on using
RM. It can then be used to clone a different OCS (same model).
This feature can be used for:
    n   Replacing an OCS by another unit of the same model.
    n   Duplicating or “clone” units without a PC.

5.10.1: Make Clone
Selecting “Clone Unit” menu will open the following menu screen:




Load Clone and Make Clone virtual buttons are below the screen. Free/Total: Displays number of Free and Total bytes in
Removable Media.
Selecting Make Clone brings up the screen below for the user:




                                                          Page 42 of 206
                                                                                          Chapter 5: System Settings

After confirmation, the OCS will create two new files in the root directory of the Removable Media Drive as shown below:




 AUTOLOAD.PGM                 Application file
 CLONE.DAT                    File having all unit settings and register values from battery-backed RAM

5.10.2: Load Clone
Selecting “Clone Unit” menu will open the following menu screen. Select “Load Clone” (one of the virtual buttons beneath the
screen).




 NOTE: For security enabled files, Load Clone asks for password validation before loading the application.




                                                           Page 43 of 206
                                                                                      Chapter 5: System Settings


5.11: WebMI License Details




License details page displays the information about the WebMI license. Please refer to MAN1036 for the WebMI Manual using
Horner's Documentation Search page. The information can also be viewed from Cscape using the following %SR registers:
 %SR209.3                           WebMI server status
 %SR209.4                           WebMI user logged in status
 %SR209.9 to SR209.16               Number of Users
 %SR218                             Number of Webpages
 %SR219                             Number of Data Points
 %SR220-SR222                       Expiry Date of WebMI License




                                                          Page 44 of 206
                                                                                            Chapter 5: System Settings


5.12: Touch Screen Calibration
The touch screen is calibrated at the factory and rarely needs modification. However, if actual touch locations do not appear to
correspond with responding objects on the display, field adjustment is available. To access the field adjustable touch screen
calibration dialog, press the far upper right corner of the touchscreen to bring out the function keys, then press and hold the
SYSTEM key for longer than five (5) seconds and a menu with several advanced functions will appear. Select TOUCH
CALIBRATION to calibrate the touch screen.




 NOTE: Advanced options, accessed by holding the system key down, may be locked out from user access. If holding the
 SYSTEM key does NOT respond, verify that the system menu’s Set Fkeys sub-menu’s parameter SYS_Fn is enabled.

For best results in screen calibration, use a stylus with a plastic tip. When the crosshair appears, touch the center of the
crosshair as exactly as possible and release. A small “+” should appear and will move closer to the center of the crosshair. Once
it has done so and disappeared again, repeat the process until “+” appears in the center of the crosshair. Then move on to the
next step.




                                                            Page 45 of 206
Register Mapping




       Page 46
                                                                                                   Chapter 6: Registers



Chapter 6: Registers
    6.1: Register Definitions                                                                                                        47
    6.2: %S Registers                                                                                                                48
    6.3: %SR Registers                                                                                                               49
    6.4: I/O Register Map for X5 & X5 Prime                                                                                          57
    6.5: X5 & X5 Prime Resource Limits                                                                                               57
There are two types of System Registers that may be used during programming. %S registers indicate the status of several
system operations. %SR registers indicate the state of many system operations and can be used to control them in several
cases. Some of the system registers have predefined I/O names, though they may still be changed if desired.

6.1: Register Definitions
When programming the an OCS, data is stored in memory that is segmented into different types. This memory in the controller is
referred to as registers. Different groups of registers are defined as either bits or words (16 bits). Multiple registers can usually be
used to handle larger storage requirements. For example, 16 single-bit registers can be used to store a word, or two 16-bit
registers can be used to store a 32-bit value.
                                                       Types of Registers
                                  16-bit input registers used to gather analog input data such as voltages, temperatures, and
 %AI = Analog Input
                                  speed settings coming from an attached device.
                                  16-bit output registers used to send analog information such a voltages, levels or speed
 %AQ = Analog Output
                                  settings to an attached device.
                                  These are digital flags used to control the displaying of screens on a unit which has the ability to
 %D = Display Bit
                                  display a screen. If the bit is SET, the screen is displayed.
 %I = Digital Input               Single-bit input registers. Typically, an external switch is connected to the registers.
                                  Single-bit flags used to give the programmer direct access to any front panel keys appearing on
 %K = Key Bit
                                  a unit.
 %M = Retentive Bit               Retentive single-bit registers.
                                  Single-bit output registers. Typically, these bits are connected to an actuator, indicator light or
 %Q = Digital Output
                                  other physical outputs.
 %R = General Purpose
                                  Retentive 16-bit registers.
 Register
 %S = System Bit                  Single-bit bit coils predefined for system use.
 %SR = System Register            16-bit registers predefined for system use.
 %T = Temporary Bit               Non-retentive single-bit registers.




                                                                Page 47 of 206
                                                                                       Chapter 6: Registers


6.2: %S Registers
%S registers indicate system status as follows:

      S#              Name           Predefined I/O Name                              Notes
  %S1               First Scan        FST_SCN                  On for 1 scan only each time the program is first run
  %S2              Network OK         NET_OK                                 If on, the Network is OK
  %S3               10ms pulse        T_10MS                    Cycling pulse that is high for 5ms and low for 5ms
  %S4              100ms pulse        T_100MS                 Cycling pulse that is high for 50ms and low for 50ms
  %S5             1 second pulse      T_1SEC                 Cycling pulse that is high for 500ms and low for 500ms
  %S6                 I/O OK          IO_OK                                 If on, the I/O system is OK
  %S7               Always On         ALW_ON                                   This bit is always on
  %S8              Always OFF         ALW_OFF                                  This bit is always off
  %S9              Pause Scan         PAUSING_SCN                  On for at least 1 scan prior to Pause 'n Load
  %S10            Resume Scan         RESUMED_SCN                On for 1 scan only after Pause 'n Load is done
  %S11           Forcing Present      FORCE                             If on, I/O is presently being forced
  %S12           Forcing Enabled      FORCE_EN                          If on, I/O forcing is been enabled
  %S13              Net I/O OK        NET_IO_OK                              If on, Network I/O is OK




                                                     Page 48 of 206
                                                                                                  Chapter 6: Registers


6.3: %SR Registers
%SR registers are special word-length registers that display and/or control system operations in the controller. Not all controllers
support all defined system registers.
Please refer to the Cscape help file for a complete list of registers.

     SR #                  Name and Description                  Default     I/O Min - Max            Program         Display
                                                                 Name I/O Name Values               (Read/Write)    (Read/Write)
 %SR1            User Screen Number (0=none)                        USER_SCR          0 to 1023      Read/Write       Read/Write
 %SR2            Alarm Screen Number                                ALRM_SCR          0 to 1-23       Read Only          Read Only
 %SR3            System Screen Number                                SYS_SCR           0 to 24       Read/Write       Read/Write
                 1 = Main System Menu
                 2= Set Network ID, Network Status,
                 (%SR29)
                 3= Set Network Baud (%SR30)
                 4= Set Contrast (%SR32)
                 5= View OCS Status
                 6= View OCS Diagnostics
                 7= View I/O Slots
                 8= Set Function Key Mode (%SR33)
                 9= Set Serial Ports (%SR34)
                 10= Set Time/Date (%SR44-%SR50)
                 11= Set Beeper (%SR183)
                 12= Set Screen (%SR185)
                 13= Removable Media
                 14= View Protocols
                 15= IP Address IP Address (ETN I/O Board)
                 16= Fail Safe System
                 17= Backup / Restore Data
                 18= Enable AutoRun
                 19= Enable AutoLoad
                 20= Clone Unit -
                 21= Touch Calibration
                 24= License Details
 %SR4            Self Test Results                                  SELF_TEST                         Read Only          Read Only
 %SR4.1          Self Test Results - BIOS Error                                                       Read Only          Read Only
 %SR4.2          Self Test Results - Engine Error                                                     Read Only          Read Only
 %SR4.3          Self Test Results - Ladder Error                                                     Read Only          Read Only
 %SR4.4          Self Test Results - RAM Error                                                        Read Only          Read Only
 %SR4.5          Self Test Results - Duplicate ID Error                                               Read Only          Read Only
 %SR4.6          Self Test Results - Bad ID Error                                                     Read Only          Read Only
 %SR4.7          Self Test Results - I/O Configuration Error                                          Read Only          Read Only
 %SR4.8          Self Test Results - Bad Network Error                                                Read Only          Read Only
 %SR4.9          Self Test Results - Bad Logic Error                                                  Read Only          Read Only
 %SR4.10         Self Test Results - Bad Clock Error                                                  Read Only          Read Only
 %SR4.11         Self Test Results - DeviceNet Error                                                  Read Only          Read Only



                                                               Page 49 of 206
                                                                                      Chapter 6: Registers


%SR4.12 -                    Reserved
16
%SR5        Control Station Mode                           CS_Mode           0 to 3       Read Only      Read/Write
            0= Idle
            1= Do I/O
            2= Run
            3= Online Change
%SR6        Average Scan Rate ms ( / 10)                                                  Read Only          Read Only
%SR7        Minimum Scan Rate ms ( / 10)                                                  Read Only          Read Only
%SR8        Maximum Scan Rate ms ( / 10)                                                  Read Only          Read Only
%SR9        Current Touch Pressure                              TCH_      0 to 3000       Read Only          Read Only
                                                              PRESSURE
%SR10       Threshold Touch Pressure                            TCH_      0 to 3000      Read/Write      Read/Write
                                                             PRESSURE_
                                                                 TSH
%SR11-12    Ladder Size (32-Bit DINT)                                                     Read Only          Read Only
%SR13-14    User Text Screen Size (32-Bit DINT)                                           Read Only          Read Only
%SR15-16    System Text Screen Size (32-Bit DINT)                                         Read Only          Read Only
%SR17-18    I/O Configuration Table Size (32-Bit DINT)                                    Read Only          Read Only
%SR19-20    Network Config Table Size (32-Bit DINT)                                       Read Only          Read Only
%SR21-22    Security Data Table Size (32-Bit DINT)                                        Read Only          Read Only
%SR23       Ladder Code CRC                                                               Read Only          Read Only
%SR24       User Text CRC                                                                 Read Only          Read Only
%SR25       System Text CRC                                                               Read Only          Read Only
%SR26       I/O Configuration Table CRC                                                   Read Only          Read Only
%SR27       Network Configuration Table CRC                                               Read Only          Read Only
%SR28       Security Data Table CRC                                                       Read Only          Read Only
%SR29       Network ID                                                                    Read Only      Read/Write
            CsCAN Mode                                          NET_ID    1 to 253
            DeviceNet Mode                                                0 to 63
            CANopen Mode                                                  1 to 127
%SR30       Network Baud Rate                                             0 to 4          Read Only      Read/Write
            0=125KB
            1= 250kB
            2= 5000KB
            3= 1MB
            4=50K
%SR31       Network Required                                              0 to 3          Read Only          Read Only
            0= Network not required
            1= Network required;
            2= Network optimized;
            3= Network required and optimized
%SR32       LCD Display Contrast setting                                   0 to 255       Read Only      Read/Write
%SR33       Function Key Toggle Mode                                         0 to 1      Read/Write      Read/Write



                                                         Page 50 of 206
                                                                                 Chapter 6: Registers


           0= Momentary
           1= Toggle
%SR34      RS232 Serial Protocol Mode                                                Read Only          Read Only
           0= Firmware Update (RISM)
           1= CsCAN
           2= Generic (Ladder- Controlled)
           3= Modbus RTU
           4= Modbus ASCII
%SR35-36   Unique Serial Number / Hexadecimal                                        Read Only          Read Only
           l LAN1 MAC ID
%SR37      Model Number                                                              Read Only          Read Only
%SR38      Engine Version ( /100)                                                    Read Only          Read Only
%SR39      BIOS Rev Number ( / 100)                                                  Read Only          Read Only
%SR40      FPGA Image Rev Number ( / 10)                                             Read Only          Read Only
%SR41      Vertical Pixel Count                                                      Read Only          Read Only
%SR42      Horizontal Pixel Count                                                    Read Only          Read Only
%SR43      Keypad Type                                                               Read Only          Read Only
%SR44      Real-Time-Clock Second                      RTC_SEC        0 to 59        Read Only          Read Only
%SR45      Real-Time-Clock Minute                      RTC_MIN        0 to 59        Read Only          Read Only
%SR46      Real-Time-Clock Hour                        RTC_HOUR       0 to 23        Read Only          Read Only
%SR47      Real-Time-Clock Date                        RTC_DATE       1 to 31        Read Only          Read Only
%SR48      Real-Time-Clock Month                       RTC_MONTH      1 to 12        Read Only          Read Only
%SR49      Real-Time-Clock Year                        RTC_YEAR       1996 to        Read Only          Read Only
                                                                       2095
%SR50      Real-Time-Clock Day (1=Sunday)              RTC_DAY         1 to 7        Read Only          Read Only
%SR51      Network Error Count                                                       Read Only          Read Only
%SR52      Watchdog-Tripped Error Count                                              Read Only          Read Only
%SR53-54                    Reserved
%SR55.13   Self-Test: Battery Low or Missing                                         Read Only          Read Only
%SR56      Key Currently Pressed                          LAST_KEY    0 to 255       Read Only          Read Only
           No key = 0 (No key pressed since power-
           up) F1 = 1
           F2= 2
           F3= 3
           F4 = 4
           F5= 5
           F6= 6
           F7=7
           F8= 8
           F9= 9
           F10 = 10
           F11= 11
           F12 = 12
           Enter = 13
           +/ - = 14


                                                     Page 51 of 206
                                                                                Chapter 6: Registers


             . (dot) = 15
             0 = 16
             1 = 17
             2 = 18
             3 = 19
             4 = 20
             5 = 21
             6 = 22
             7= 23
             8 = 24
             9 = 25
             System = 26
             Escape = 27
             Left = 28
             Right = 29
             Up = 30
             Down = 31
             Shift = 32
             Soft Key 1 = 34
             Soft Key 2 = 35
             Soft Key 3 = 36
             Soft Key 4 = 37
             Soft Key 5 = 38
             Soft Key 6 = 39
             Soft Key 7 = 40
             Soft Key 8 = 41
             Release = 255 (Keys pressed since power-
             up but not currently)
%SR57        LCD Backlight Dimmer Register                           0 to 255       Read Only          Read Only
             0-100 = 0% to 100% On
             100-255 = 100% On
%SR57.16     Temporarily disable Screen Saver                                      Read/Write      Read/Write


%SR58        User LEDs                                   USER_LEDS                 Read/Write      Read/Write
%SR59        Engine Build Number                                                    Read Only          Read Only
             (Only last three numbers displayed)
%SR60        Build Option                                             0 to 2        Read Only          Read Only
             Build Test = 0
             Build Beta = 1
             Build Product = 2
%SR61        Number of CsCAN Network IDs                  NUM_IDS                   Read Only          Read Only
%SR62-130                    Reserved
%SR131-135 OCS Model: ASCII, 10 characters                                          Read Only          Read Only
%SR136       Communication Download Timeout                                         Read Only          Read Only
%SR137       Communication Idle Timeout                                             Read Only          Read Only
%SR138-148                   Reserved


                                                    Page 52 of 206
                                                                                     Chapter 6: Registers


%SR149-150 Free-running 10kHz count: 1 count = 0.1ms                                     Read Only          Read Only
           (32-Bit DINT)
%SR151                          Reserved
%SR152       RS-485 Termination                                                         Read/Write      Read/Write
%SR152.1     MJ2 Termination Enable                                                     Read/Write      Read/Write


%SR153 -                        Reserved
163
%SR164       FailSafe / Clone
%SR164.1     RS485 Port Biasing #1 (MJ1 or MJ2)                                         Read/Write      Read/Write
%SR164.2     RS485 Port Biasing #2 (MJ2 or MJ3)                                         Read/Write      Read/Write
%SR164.3     Indicates Automatic Restore Operation           AUTO_RESTRD                 Read Only          Read Only
             has been performed
%SR164.4     Indicates Backup of Registers has been           BCKUP_TAKN                 Read Only          Read Only
             taken
%SR164.5     Enable AUTORUN – Sets “Enable                    EN_AUTO_LD                Read/Write      Read/Write
             AutoRun” to “Yes” or “No”
%SR164.6     Enable AUTOLOAD – Sets “Enable                   EN_AUTO_LD                Read/Write      Read/Write
             AutoLoad” to “Yes” or “Not”
%SR164.7     Start Backup trigger bit –                       STRT_BCKUP                Read/Write      Read/Write
             Setting TRUE starts backup of all register
             data


%SR164.8     Clear Backup trigger bit – Setting TRUE          CLR_BACKUP                Read/Write      Read/Write
             clears backup of all register data
             (if a backup was done previously)
%SR164.9     MAKE_CLONE trigger bit =                         MAKE_CLONE                Read/Write      Read/Write
             Setting TRUE does a Load Clone
             (if a media card is present)
%SR164.10    LOAD_CLONE trigger bit –                         LOAD_CLONE                Read/Write      Read/Write
             Setting TRUE does a LOAD CLONE
             (if a media card is present that contains
             clone files)
%SR164.11    Make Clone Fail                                   MK_CLN_FL                Read/Write      Read/Write
             (This bit goes high when Make/Create
             Clone fails)
%SR164.12    Load Clone Fail                                   LD_CLN_FL                Read/Write      Read/Write
             (This big goes high when Load Clone fails)
%SR164.14                       Reserved                                                Read/Write      Read/Write
%SR164.15                       Reserved                                                Read/Write      Read/Write
%SR165-166                      Reserved
%SR167       Screen Update Time, Default= 5                                2 to 50      Read/Write      Read/Write
%SR168-170                      Reserved
%SR171       X-Coordinate Touched                                                        Read Only          Read Only




                                                          Page 53 of 206
                                                                                     Chapter 6: Registers


%SR172       Y-Coordinate Touched                                                        Read Only          Read Only
%SR173       System-Function Disable                                      0 to 1        Read/Write      Read/Write
%SR174       Removable Media Protect                                                    Read/Write      Read/Write
%SR174.1     Request Media Card be Removed                                              Read/Write      Read/Write
%SR174.2     Indicates safe to remove Media Card                                        Read/Write      Read/Write
%SR175       Removable Media - Status                                                    Read Only          Read Only
%SR176-177 Removable Media Free Space (32-Bit                                            Read Only          Read Only
           DINT)
%SR178-179 Removable Media Total Space (32-Bit                                           Read Only          Read Only
           DINT)
%SR180                         Reserved
%SR181       Bits 1-16 indicate Unacknowledged in           ALM_UNACK                    Read Only          Read Only
             Alarm Groups 1-16
%SR182       Bits 1-16 indicate Active in Alarm Groups 1-     ALM_ACT                    Read Only          Read Only
             16


%SR183       Beep on Keypress Enable                         SYS_BEEP     0 to 1        Read/Write      Read/Write
             0= Disabled
             1= Enabled
%SR184       Internal Beeper                                USER_BEEP     0 to 1        Read/Write      Read/Write
             0=OFF
             1=ON
%SR185       Screen Saver Enabled                                         0 to 1       Read Only            Read Only
             0= Disabled
             1= Enabled
             NOTE: See %SR57.16
%SR186       Screen Saver Time in minutes (delay)                        5 to 1200       Read Only          Read Only
%SR187       Network Usage (Avg)                              NET_USE    0 to 1000       Read Only          Read Only
%SR188       Network Usage (Min)                                         0 to 1000       Read Only          Read Only
%SR189       Maximum Net Usage of all units on the CAN                   0 to 1000       Read Only          Read Only
             network
%SR190       Network TX Usage % ( / 10) (Avg)                NT_TX_AVG   0 to 1000       Read Only          Read Only
%SR191       Network TX Usage % ( / 10) (Min)                            0 to 1000       Read Only          Read Only
%SR192       Network TX Usage % ( / 10) (Max)                            0 to 1000       Read Only          Read Only
                                          EXTENDED SYSTEM REGISTERS
%SR193       Online Change                                  ONLINE_CHG
%SR193.1     TRUE if 2 programs in target FLASH                                          Read Only          Read Only
%SR193.2     TRUE to switch programs, FALSE when                                         Read Only          Read Only
             complete
%SR193.3     TRUE if executing program is temporary                                      Read Only          Read Only
             test
%SR193.4     TRUE during last scan of switched-from                                      Read Only          Read Only
             program
%SR193.5     TRUE during first scan of switched-to                                       Read Only          Read Only
             program


                                                        Page 54 of 206
                                                                                     Chapter 6: Registers


%SR193.6     TRUE to revert to FLASH and delete all                                      Read Only          Read Only
             RAM;
             FALSE when complete
%SR193.9     TRUE if error in temporary program                                          Read Only          Read Only
%SR194       Battery Charge Temp Low                                                     Read Only          Read Only
%SR195       Battery Charge Temp High                                                    Read Only          Read Only
%SR196       Charging State                                                0 to 11       Read Only          Read Only
             NOTE: Refer to MAN1142 for more details
             on Rechargeable Batteries
             0=Waiting
             1=Normal Charging
             2=Hot Charge
             3=Hot Charge
             4= Battery Hot
             5= Cold Charge
             6=Battery Cold
             7=No Battery
             8= Not Charging (after 8 hours of charging)
             9= CPU Hot, not charging
             10 Battery voltage <2V, not charging
             11= First 2 minutes Init Wait (Not Charging)
%SR197       Charging Current Max mA                                                     Read Only          Read Only
%SR198       Battery Voltage is mV                                                       Read Only          Read Only
%SR199                        Reserved
%SR200       InitRD Version ( /100)                                                      Read Only          Read Only
%SR201 -     Linux Kernel version: ASCII, 10 characters                                  Read Only          Read Only
205
%SR206-208                    Reserved
%SR209.3     WebMI Server Status. Bit 3 is ON if server                                  Read Only          Read Only
             running.
%SR209.4     WebMI User Logged in Status.                                                Read Only          Read Only
             Bit 4 is ON if 1 or more users logged in.
%SR209.8 -   Number of Users.                                                            Read Only          Read Only
209.14       Shows in upper byte in decimal format.
%SR210       Time Zone: set in minutes + / -UTC                                         Read/Write      Read/Write
             (Ex: EST is -4 hours = -240 minutes)
%SR211       Daylight Saving: YES = 1                                                   Read/Write      Read/Write
             Daylight Saving: NO = 0
             (If daylight saving is enabled,
             one hour will be added to the local time).
%SR212       UTC - Seconds                                                               Read Only          Read Only
%SR213       UTC - Minutes                                                               Read Only          Read Only
%SR214       UTC - Hours                                                                 Read Only          Read Only
%SR215       UTC - Date                                                                  Read Only          Read Only
%SR216       UTC - Month                                                                 Read Only          Read Only



                                                          Page 55 of 206
                                                                        Chapter 6: Registers


%SR217       UTC - Year                                                     Read Only          Read Only
%SR218       Number of Webpages, license detail                             Read Only          Read Only
%SR219       Number of Data Points, license detail.                         Read Only          Read Only
%SR220-222 Expiration Date of WebMI License, license                        Read Only          Read Only
           detail




                                                       Page 56 of 206
                                                                                 Chapter 6: Registers


6.4: I/O Register Map for X5 & X5 Prime
   Fixed Starting Address                 Digitial/Analog I/O Function                        X5/X5 Prime
                                                    Digital Inputs                                  1-4
              %I1
                                                      Reserved                                      5-16
                                                   Digital Outputs                                  1-4
              %Q1
                                                      Reserved                                      5-16
                                                    Analog Inputs                                   1-4
             %AI1
                                                      Reserved                                      n/a


6.5: X5 & X5 Prime Resource Limits
          Resource                                                   Value
              %S                                                       13
              %SR                                                     192
                                                                     2048
              %T
                                                                 Prime: 16,384
                                                                     2048
              %M
                                                                 Prime: 16,384
                                                        8192 (%R1 - %R1024 Retentive)
              %R
                                                          Prime: 50,000 (all retentive)
              %K                                                       4
              %D                                                     1023
               %I                                                    2048
              %Q                                                     2048
              %AI                                                     512
             %AQ                                                      512
                                 CsCAN, Ping, EGD, SRTP, Modbus TCP Master & Slave, Ethernet IP, FTP, HTTP,
            Ethernet
                                                      SMTP @ 10 Mbps or 100 Mbps
            CsCAN                                   125 kbps, 250 kbps, 500 kbps, or 1 Mbps
          Serial Ports                                     1 RS-232, 1 RS-485 Ports
     IDs Per CsCAN Network                           64 w/o repeaters (253 w/ 3 repeaters)
            Keypad                              5 virtual keys (4 function keys and a System Key)
            Display                               480 x 272 4.3” Widescreen TFT, 64K colors
        Screen Memory                                                64 MB
          User Screens                                               1023
   Data Fields Per User Screen                                       1023
      Ladder Logic Memory                                             2MB




                                               Page 57 of 206
  Cscape
Configuration




     Page 58
                                                                                    Chapter 7: Cscape Configuration



Chapter 7: Cscape Configuration
   7.1: Cscape Status Bar                                                                                                59
   7.2: Establishing Communications                                                                                      60
   7.3: Communicating via MJ1 Serial Port                                                                                65
   7.4: Communicating via On Board Ethernet Port                                                                         65
   7.5: Configuring Ethernet Settings                                                                                    68
   7.6: Cscape Configuration                                                                                             69
   7.7: Digital/HSC Input Configuration                                                                                  69
   7.8: Digital/PWM Output Configuration                                                                                 73
   7.9: Analog Inputs                                                                                                    75
X5/X5 Prime OCS hardware is programmed with a Windows based PC application called Cscape. This application can be used
to program, configure, monitor, and debug all aspects of the X5/X5 Prime OCS unit. Please see the Online Help provided with
Cscape for additional details.

7.1: Cscape Status Bar
When the X5/X5 Prime OCS is connected to a PC using Cscape software, a Status Bar appears at the bottom of the screen. The
Cscape Status Bar can be used to determine if communications have been established between the X5/X5 Prime OCS and the
Cscape program. Components of the Cscape Status Bar are explained below:




                                                         Page 59 of 206
                                                                                 Chapter 7: Cscape Configuration


7.2: Establishing Communications
The X5/X5 Prime OCS can communicate with Cscape using USB to USB, USB to serial adapters, serial port communications via
MJ1 Port, Ethernet (with an Ethernet adapter board), on-board Ethernet Port, CAN (CsCAN), or modems.
Otherwise, the drivers may be loaded from the HE-XEC Ethernet Utility/HTTP Web Server Demo/Communications Drivers
section of the support files page found on our website.
Support files:
North America https://hornerautomation.com/support-files
Europe https://www.hornerautomation.eu/support/
Next, connect a PC’s (Personal Computer running a Windows Microsoft operating system) USB port via USB cable to the USB
mini B port on the X5/X5 Prime OCS.

7.2.1: User Programming Port:
The PC will detect a new device has been plugged into the USB port.

Now that the X5/X5 Prime is plugged in, go to Cscape > Controller >                   Connection Wizard. If you are just
opening Cscape, Connection Wizard usually opens by default.




                                                          Page 60 of 206
                                                                                      Chapter 7: Cscape Configuration

Select USB and click Next >>.




If the Connection Wizard does not pop up upon opening Cscape, then select Controller (in the Cscape tool bar) > Connection
Wizard, choose your connection method. If you are connecting for the first time, we suggest connecting via USB.




If Controller USB COM Port is not present in the dropdown list, the Windows operating system has not yet recognized the OCS
as an installed device. Be sure the installation process is complete and that the correct drivers are installed. The Connection
Wizard must be completely closed and reopened to refresh the USB dropdown list.




                                                           Page 61 of 206
                                                                                  Chapter 7: Cscape Configuration

An alternate way to select the COM setting is to go to Cscape > Tools > Application Settings > Communication >
Configure and choose connection method in Add Target.




                                                        Page 62 of 206
                                                                                       Chapter 7: Cscape Configuration


                                   Communication Configuration Dialog
                                   Name for connection. This is not a mandatory column to be filled, by default Cscape will
 Target Name
                                   populate ‘Default1’ in edit box.

                                                Connection Medium
                                   Select this option to communicate over serial communication with the device. The port
 Com Port
                                   number can be configured here.
                                   Select this option to communicate over Ethernet. Provide the IP address of the device and
                                   select the mode: HE GSM GPRS mode, Built in/ ETN Ethernet mode, or HE XEC Ethernet
                                   mode.
                                   Select HE GSM GPRS mode if communication with XL series controller on GPRS is
                                   required and the device has GSM modem installed in XL series controller.
                                   Select Built in/ ETN Ethernet mode if the device has on-board Ethernet port.
                                   Select HE XEC Ethernet mode if the device has Ethernet comm. option board installed in
 Ethernet
                                   XL series controller.

                                    NOTE: For GPRS connectivity, GPRS configuration from Programs à Messaging à
                                    GPRS needs to be done.

                                    NOTE: The controller should support the type of connectivity selected and configured
                                    for Ethernet communication.

                                   Select this option to communicate to the device through the internal modem of the
                                   computer. Cscape will automatically detect the internal modem attached with PC and list in
                                   the attached drop down. User can select modem and telephone number for target
 Installed Modem                   controller.

                                    NOTE: Cscape will do necessary initialization for the selected internal modem.

                                   Select this option to communicate over USB. Now Horner devices and Horner USB to serial
 USB
                                   converters are recognized and can be specifically selected.

                                                  Connected Device
  NOTE: This configuration is required if the controller to which Cscape is communicating is connected to a CsCAN network.

 Connected Device                  By default, this option is selected and networking feature of Cscape is disabled.
                                   On selecting this option, Networking feature of Cscape is enabled. CsCAN ID for the target
 Target Node ID
                                   controller to be provide here.

                       Connection Settings (General Communication Settings)
 Maximum Baud Rate                 Select the baud rate for serial communication.
                                   Select the communication timeout.

 Timeout                            NOTE: Select a larger timeout for GPRS and installed modem communication
                                    configuration

If communications are successful, the message line should show “USB (COM8)” for this example, and an (R) should follow the
Target number.




                                                          Page 63 of 206
                                                                                          Chapter 7: Cscape Configuration




If the controller is not communicating, you may need to set the target ID of the controller in Cscape or on the unit. The Target ID
allows directing communications to a particular unit when multiple units are connected via a CsCAN network. Units without
CsCAN network ports respond to any network ID and do not require the ID to be configured.


To check or change the ID on the X5/X5 Prime OCS, press the System Menu key.
The first item in the menu is Set Networks. Pressing Enter allows you to view or modify the ID of the unit.




To change the Target ID of Cscape, highlight CAN ID and press Enter to provide a new number.
To point Cscape at the correct controller, change the Target ID using the Controller > Set Target Network ID dialog.




                                                             Page 64 of 206
                                                                                         Chapter 7: Cscape Configuration


7.3: Communicating via MJ1 Serial Port
Start by configuring Cscape to use the correct communications port. This can be done using the Tools àOptions à
Communication Port dialog in Cscape.
Next, connect the PC’s serial port to the port labeled MJ1 on the X5/X5 Prime.
If communications are successful, the target indicator should show the mode of the controller Target: yy® as shown in the status
section above.
If the controller is not communicating, you may need to set the target ID of the controller in Cscape or on the unit. The Target ID
allows directing communications to a particular unit when multiple units are connected via a CsCAN network. Units without
CsCAN network ports respond to any network ID and do not require the ID to be configured.
To check or change the ID on the X5/X5 Prime OCS, press in the far upper right corner of the touch screen to bring out the
function keys, then press the System Menu key.
Select Set Networks and press Enter.
Select CAN ID: and press Enter allows you to view or modify the ID of the unit.
To point Cscape at the correct controller, change the Target ID using the Controller > Set Target Network ID dialog.

7.4: Communicating via On Board Ethernet Port
The X5/X5 Prime Ethernet address may be set from the System Menu depending on the program currently loaded.
To check or change the Ethernet address on the OCS, press in the far upper right corner of the touch screen to bring out the
function keys, then press the System Menu key.
Select Set Networks and press Enter.
At a bare minimum, the IP (IP Address) and NetM (NetMask) settings must be configured in order to communicate via Ethernet.
Depending on how the network is setup, the GatWy (Gateway) may also need to be configured.
From the factory, the X5/X5 Prime OCS is set to the IP Address 192.168.254.128. To obtain Ethernet communications between
Cscape and the OCS using a single Ethernet cable between a PC and the OCS, or through an unmanaged Ethernet Switch, the
PC will also need to be manually configured as follows (may require Administrator access on PC):
   1.   Access the Network Connections in the Control Panel (Shortcut: Press the Windows key and type
        Network Connections… select the resulting filtered link).
   2.   Double-click the connection being used to directly connect to the X5/X5 Prime OCS to bring up the
        Connection Status.
   3.   Click Properties.
   4.   Double-click Internet Protocol Version 4 (TCP/Ipv4) in the list of available protocols.
   5.   The PC may normally be set to “Obtain an IP address automatically”. Click next to Use the following IP
        address:
   6.   Use the IP address 192.168.254.111 or something other than that of the OCS.
   7.   The Subnet Mask (255.255.255.0) should fill in automatically once the IP address has been entered.
   8.   The Default Gateway is not required for a direct connection.
   9.   Click OK all the way back to the Network Connections dialog.
  10.   Confirm the X5/X5 Prime OCS is set to the default 192.168.254.128 address or something on the same
        network.
  11.   In Cscape, click Tools > Application Settings > Communications > Configure.
  12.   Select Ethernet, then enter the IP address of the X5/X5 Prime OCS.

           ALERT: The MTU setting defaults to the maximum 1500. It needs to match the PC’s MTU setting for the best
           results. A PC may be set to an MTU of 1300 or something other than the default maximum setting by a network
           administrator.

  13.   The Port for CsCAN over Ethernet is 18501.


                                                             Page 65 of 206
                                                                             Chapter 7: Cscape Configuration


14.   The Mode for any controller with built-in Ethernet is Built-in/ETN Ethernet Mode.
15.   Change the Timeout value to 3000 for direct connections. Timeout values of 5000-30000+ may be
      common for access over the internet or via VPN or other more complex networks.
16.   Click OK all the way back to the main Cscape window. It may take a moment to initialize the
      communications.
17.   Check the status bar for successful communications.




                                                   Page 66 of 206
                                                                                   Chapter 7: Cscape Configuration

Examples of the PC Ethernet setup and the Cscape Ethernet setup mentioned in the above steps:
Internet Protocol Screenshot:




Cscape Ethernet Settings:




                                                        Page 67 of 206
                                                                                        Chapter 7: Cscape Configuration


7.5: Configuring Ethernet Settings
To configure the Ethernet settings of the X5/X5 Prime OCS using Cscape, go to Controller > Hardware Configuration. If not
already done, select the correct connected controller, or use the Auto Config button to automatically recognize a controller that
is already successfully connected to Cscape.
Below the main controller configuration, under Network Ports, find LAN1, and click on the Config button to the right of the
greyed-out ETN300.
In the LAN1 Configuration, fill in the network setup for the X5/X5 Prime OCS. It may be required to consult IT personnel to
determine proper settings if connection to a corporate network is required.




    l   If Get settings from is set to Configuration for any parameter, the addresses in the Default Settings
        column will take place when this program is loaded and every time this controller enters RUN mode.
        Registers may optionally be defined that will reflect the settings. These settings may temporarily be
        changed via the SYSTEM menu but will revert to the Cscape-configured settings at any transition into RUN
        mode, i.e. a program download or at power-up.
    l   If Get settings from is set to Register for any parameter, the addresses in the Default Settings column
        are ignored entirely. The addresses instead must come from the configured registers. It is not possible to
        change these settings via the SYSTEM menu in this case.




                                                            Page 68 of 206
                                                                                          Chapter 7: Cscape Configuration


7.6: Cscape Configuration
An overview of configuration:
   1.   Start the configuration by selecting the Controller > Hardware Configuration menu item.
   2.   If the X5/X5 Prime OCS is connected to the PC, press the Auto Config System button to automatically
        detect the Base model, I/O, and any communication options.
   3.   If the X5/X5 Prime OCS is not connected, press the Config button to the right of the top of the unit. This
        allows the base CPU to be selected.
   4.   Select either X5/X5 Prime OCS CsCAN from the type drop down box.
   5.   Once the type of X5/X5 Prime OCS is selected, the model # drop down box will provide the X5/X5 Prime
        OCS model numbers from which to choose.
   6.   Once the X5/X5 Prime OCS CPU is selected, press OK to exit the dialog and configure the I/O that is
        present in the first slot.
   7.   The I/O configure dialog (specifically the Module Setup tab) provides four (4) buttons to configure all of the
        I/O. Go through each area of I/O and configure it.
   8.   Once done configuring the I/O, OK out of configuration dialogs.
Configuring the X5/X5 Prime OCS I/O has four main portions that are covered in this chapter. For additional information on I/O,
refer to "General I/O Configuration" on page 1 or "High Speed I/O (HSC / PWM) " on page 1.
The three areas of I/O configuration are:
    l   Digital In / HSC
    l   Digital Out / PWM
    l   Analog In

7.7: Digital/HSC Input Configuration
Horner controllers vary greatly on series and model numbers. Refer to the datasheets on the Document Search table on the
Horner website.
The Digital / HSC Input configuration allows the multi-mode digital inputs to be configured as either standard digital inputs or as
high-speed inputs.

 NOTE: Early versions of Cscape with X5/X5 Prime support may mistakenly remind that jumper settings must match
 configuration settings. The X5/X5 Prime does not have any jumpers that need to match the configuration.

7.7.1: Digital Input Configuration
Home > Hardware Configuration [select Device Type/Model#] > Local I/O Tab > I/O / Config But-
ton > Module Setup > Digital In/HSC
Select Hardware Configuration from the Home menu and ensure that the correct Device Type and Model# are selected. Then
select the Local I/O tab.




                                                             Page 69 of 206
                                                                                        Chapter 7: Cscape Configuration




After selecting Local I/O, select the Config button next to the I/O connector.




The Module Configuration screen will appear, select the Module Setup tab. See below. The Module Setup allows a user to
configure four types of I/O.

 NOTE: Not all controllers offer all four types. Refer to the controller's datasheet on the using Horner's Documentation Search
 page.




                                                             Page 70 of 206
                                                                                           Chapter 7: Cscape Configuration




Select Digital In/HSC to open the Digital / HSC Input configuration dialog for a specific controller.




TThe digital inputs active mode configuration allows the user to select if inputs are active high (Positive logic, voltage triggers
input high) or active low (Negative logic, 0V triggers input high). For the X5/X5 Prime controller, there are no jumpers to set.
The Counter Modes configuration allows the inputs to be configured as high-speed counter inputs. Two modes are available,
each with a unique set of functions that are allowed.




                                                              Page 71 of 206
                                                                                           Chapter 7: Cscape Configuration

             Mode                         High Speed Counters                    Quadrature                Stepper Outputs
        2 Counter Mode                                2                                1                            2
        4 Counter Mode                                4                                0                            1
By default, 2 Counter Mode is selected but Counter1 and Counter2 are both disabled. This allows all digital inputs to function as
standard digital inputs addressed at %I1 - %I4.
The HSC I/O Mapping section allows specification of register usage for high-speed counter functions. The register specified is
the first of multiple consecutive registers used. The type of register and the number of registers used is noted to the right of each
starting address configuration.
The Counter1 and Counter2 (and, if configured for four (4) Counter modes, Counter3 and Counter4) tabs allow configuration
of each of the high-speed counters. See "High Speed I/O (HSC/PWM) " on page 92 for more details on configuring the high-
speed counter inputs.




                                                              Page 72 of 206
                                                                                      Chapter 7: Cscape Configuration


7.8: Digital/PWM Output Configuration
The Digital/PWM Output Configuration allows multi-mode digital outputs Q1 and Q2 to be configured as Normal solid-state
digital outputs, Pulse-Width Modulation (PWM) outputs, outputs that are triggered by High Speed Counter functions, or Stepper
outputs.

7.8.1: Digital Output Configuration
Home > Hardware Configuration [select Device Type/Model#] > Local I/O Tab > I/O / Config But-
ton > Module Setup > Digital Out/PWM
Select Hardware Configuration from the Home menu and ensure that the correct Device Type and Model# are selected. Then
select the Local I/O tab.




After selecting Local I/O, select the Config button next to the I/O connector.




                                                             Page 73 of 206
                                                                                        Chapter 7: Cscape Configuration




The Module Configuration screen will appear, select the Module Setup tab. See below. The Module Setup allows a user to
configure four types of I/O.

 NOTE: Not all controllers offer all four types. Refer to the controller's datasheet the using Horner's Documentation Search
 page.




Select Digital Out/PWM to open the Digital / PWM Output Configuration dialogue.




                                                           Page 74 of 206
                                                                                           Chapter 7: Cscape Configuration




The Q1 and Q2 group boxes allow the user to specify the operation of the multifunction outputs.
PWM State On Controller Stop - Contains items that allow the user to specify how the PWM outputs behave when the
controller is stopped. These items can either hold their value or default to some value when the controller is stopped.

 NOTE: The PWM outputs are set to the OFF state at power-up and during program download and remain in that state until
 the unit is placed in RUN.

Output State On Controller Stop - Contains items to allow the user to specify how the remaining digital outputs behave when
the controller is stopped. These items can either hold their value or default to some value when the controller is stopped.

 NOTE: The number of Output States on Controller Stop vary by product.

Stop State - When a controller stops running ladder logic, the state of most output I/O modules can be configured. By default
digital outputs turn OFF and analog outputs go to a zero output level. Outputs can be configures to hold the last state the outputs
was in when the controller stopped, or it can be configured to go to a predefined state.

 NOTE: When a controller is in DO I/O mode the outputs are still controlled by the values in the controller's registers.

 NOTE: The number of Output State on Controller Stop varies by controller. See the datasheet on the Documentation Page
 for more details.


7.9: Analog Inputs
The analog inputs on the OCS allow voltage or current measurement from a variety of devices. The voltage or current mode is
set though jumpers on the unit and settings in Cscape. Each channel can be separately configured for voltage or current mode.
The analog inputs have a digital filter that can be used to filter electrical noise that may be unavoidable in some installations. The
downside to digital filtering is the inputs will respond more slowly to sudden changes in the actual input.




                                                              Page 75 of 206
                                                                                  Chapter 7: Cscape Configuration

Home > Hardware Configuration [select Device Type/Model#] > Local I/O Tab > I/O / Config Button > Module Setup >
Analog In
Select Hardware Configuration from the Home menu and ensure that the correct Device Type and Model# are selected. Then
select the Local I/O tab.




After selecting Local I/O, select the Config button next to the I/O connector.




The Module Configuration screen will appear, select the Module Setup tab. See below. The Module Setup allows a user to
configure four types of I/O.




                                                             Page 76 of 206
                                                                                       Chapter 7: Cscape Configuration




 NOTE: Not all controllers offer all four types. Refer to the controller's datasheet on the Horner website's Documentation Page
 for more information regarding specific models.

Select Analog In to open the Analog Input Configuration dialogue:




                                                           Page 77 of 206
                                                                                       Chapter 7: Cscape Configuration

Each analog input may be configured for one of three modes by selecting the mode from the dropdown menu for that channel:
    l   0..10V
    l   0..20mA
    l   4..20mA
For each range selected, the raw value in the corresponding register (%AI1 - %AI4) will be a range of 0 to 32000. For example,
Channel 1 set to 4--20mA would show a 0 in %AI1 for 4mA on the input, 32000 in %AI1 for 20mA (and -8000 in %AI1 for 0mA).

7.9.1: Scaling Analog Inputs & Examples
To access the Advanced Math Scaling function, select Home > View > Project Toolbox. This will open a side bar, and then
select Advanced Math > Scale.




                                                           Page 78 of 206
                                                                                          Chapter 7: Cscape Configuration

Example 1
The Cscape Scale function, found in the Advanced Math functions, allows for very easy conversion of the raw input value into a
meaningful reading. For example, a pressure transducer may be specified as a 4-20mA signal to signify a 0-2000 psi pressure
reading. With the analog channel set to the 4..20mA range, the raw analog input value, which is in INT format ranges from 0 to
4mA to 32000 for 20mA. Use the Scale function to obtain an Integer pressure reading using the 0-32000 raw input range and the
sensor’s 0-2000psi output range.




Example 2:
If readings with fractions are required, the raw Integer input value must first be translated in REAL, or Floating Point Format, see
note below. . The Cscape INT-to-REAL Conversion function may be used to convert the raw input value from INT to REAL
format in an intermediate memory location. The SCALE function, specified as REAL type, may be used to scale the converted
raw value into a reading that supports digits beyond the decimal place, i.e. 475.25psi.




                                                             Page 79 of 206
 General I/O
Configuration




     Page 80
                                                                                          Chapter 8: General I/O Configuration



Chapter 8: General I/O Configuration
    8.1 Digital / HSC Input Configuration                                                                                             81
    8.2 Digital / PWM Output Configuration                                                                                            85
    8.3 Analog Input Wiring                                                                                                           89
    8.4 Analog Outputs                                                                                                                90

8.1 Digital / HSC Input Configuration
Horner controllers vary greatly on series and model numbers. Refer to the datasheets on the Document Search table on the
Horner website.

The inputs are designed to support both positive and negative input modes. For many models, the mode is set by a jumper
setting and a configuration parameter in Cscape. All the inputs on the unit must be configured to the same mode.




In positive logic mode a positive voltage applied to the input will turn the input. The internal design of this mode is basically a
resistor from the input to I/O ground. This mode is sometimes called sourcing.

In negative logic mode, connecting the input to the I/O ground or zero volts will turn the input on. The internal design of this mode
is basically a resistor from the input to the positive I/O voltage (usually 12 or 24V). This mode is sometimes called sinking.


Some of the digital inputs may support high-speed input functional such as counting or frequency measurement.




                                                               Page 81 of 206
                                                                                 Chapter 8: General I/O Configuration


Digital Input Configuration

Home > Hardware Configuration [select Device Type/Model#] > Local I/O Tab > I/O / Config Button > Module Setup >
Digital In/HSC

Select Hardware Configuration from the Home menu and ensure that the correct Device Type and Model# are selected. Then
select the Local I/O tab.




After selecting Local I/O, select the Config button next to the I/O connector.




The Module Configuration screen will appear, select the Module Setup tab. See below.




                                                             Page 82 of 206
                                                                                        Chapter 8: General I/O Configuration




The Module Setup allows a user to configure four types of I/O. NOTE: Not all controllers offer all four types. Refer to the
controller's datasheet on the using Horner's Documentation Search page.




                                                             Page 83 of 206
                                                                                          Chapter 8: General I/O Configuration

Select Digital In/HSC to open the Digital / HSC Input configuration dialog for a specific controller.




The Digital / HSC Input configuration allows the multi-mode digital inputs to be configured as either standard digital
inputs or as high-speed inputs.

The digital inputs active mode configuration allows the user to select if inputs are active high (Positive logic,
voltage triggers input high) or active low (Negative logic, 0V triggers input high). For the X5 / X5 PRIME controller,
there are no jumpers to set.


The Counter Modes configuration allows the inputs to be configured as high-speed counter inputs. Two modes are
available, each with a unique set of functions that are allowed.


           Mode                      High Speed Counters                        Quadrature                 Stepper Outputs
      2 Counter Mode                              2                                   1                              2
      4 Counter Mode                              4                                   0                              1


By default, 2 Counter Mode is selected but Counter1 and Counter2 are both disabled. This allows all digital inputs to
function as standard digital inputs addressed at %I1 - %I4.
The HSC I/O Mapping section allows specification of register usage for high-speed counter functions. The register
specified is the first of multiple consecutive registers used. The type of register and the number of registers used is
noted to the right of each starting address configuration.
The Counter1 and Counter2 (and, if configured for four (4) Counter modes, Counter3 and Counter4) tabs allow
configuration of each of the high-speed counters. See the High Speed I/O chapter for more details on configuring

                                                              Page 84 of 206
                                                                                     Chapter 8: General I/O Configuration

the high-speed counter inputs.

8.2 Digital / PWM Output Configuration




The Digital / PWM Output Configuration allows multi-mode digital outputs Q1 and Q2 to be configured as Normal
solid-state digital outputs, Pulse-Width Modulation (PWM) outputs, outputs that are triggered by High Speed
Counter functions, or Stepper outputs.
By default, both Q1 and Q2 are configured as Normal. This allows the application code to use them as digital outputs assigned to
%Q1 and %Q2.
Setting Q1 to PWM #1 and/or Q2 to PWM #2 allows those outputs to function as a Pulse Width Modulation output.
Duty Cycle and Frequency are configured via registers assigned next to the Q1 and Q2 configuration boxes. See
the High Speed I/O Chapter for more details on configuring PWM outputs.
The PWM State On Controller Stop box contains items that allow the user to specify how the PWM outputs
behave when the controller is stopped. These items can either hold their value or default to some value when the
controller is stopped.
NOTE: The PWM outputs are set to the OFF state at power-up and during program download, and they remain in
that state until the unit is placed in RUN.
The Output State On Controller Stop box contains items to allow the user to specify how Normal digital outputs
behave when the controller is stopped. These items can either hold their value or default to some value when the


                                                           Page 85 of 206
                                                                                         Chapter 8: General I/O Configuration

controller is stopped.

8.2.1 Solid State Digital Outputs
Solid-state digital outputs are generally used to activate lamps, low voltage solenoids, relays, and other low voltage
and low current devices.

NOTE: The digital outputs used on the X5/X5 Prime controllers are "sourcing" outputs. This means the output applies a positive
voltage to the output pin when turned ON. When turned off, the output applies approximately
zero volts with respect to the I/O ground. Use the Documentation Page to view the datasheet for a specific controller
for specifics on a module's I/O.




The digital outputs used in the OCS have electronic short circuit protection and current limiting. While these electronic
protections work in most applications, some application may require external fusing on these outputs.

The digital outputs in the OCS are typically controlled via %Q bits in the register mapping. Some of the outputs are designed for
high-speed applications and can be used for PWM or frequency output applications.

When the controller is stopped, the operation of each output is configurable. The outputs can hold the state they were in before
the controller stopped or they can go to a predetermined state. By default, digital outputs turn off.


NOTE: The digital outputs feature an output fault bit. %I32 will turn on if any of the outputs experience a short circuit, over-current
or the output driver overheats.




                                                              Page 86 of 206
                                                                                 Chapter 8: General I/O Configuration


8.2.2 Digital Output Configuration
Home > Hardware Configuration [select Device Type/Model#] > Local I/O Tab > I/O / Config Button > Module Setup >
Digital Out/PWM
Select Hardware Configuration from the Home menu and ensure that the correct Device Type and Model# are selected. Then
select the Local I/O tab.




After selecting Local I/O, select the Config button next to the I/O connector.




The Module Configuration screen will appear, select the Module Setup tab. See below.




                                                             Page 87 of 206
                                                                                        Chapter 8: General I/O Configuration




The Module Setup allows a user to configure four types of I/O. NOTE: Not all controllers offer all four types. Refer to the
controller's datasheet the using Horner's Documentation Search page.




The Channel x drop down windows allow the user to specify the mode for each analog input to operate. The Channel x drop
down windows are enabled/disabled according to which model is being configured. All of the models
have the following modes available:
• 0..10V
• 0..20mA
• 4..20mA
For each range selected, the raw value in the corresponding register (%AI1 - %AI4) will be a range of 0 to 32000.


                                                             Page 88 of 206
                                                                                         Chapter 8: General I/O Configuration

For example, Channel 1 set to 4--20mA would show a 0 in %AI1 for 4mA on the input, 32000 in %AI1 for 20mA (and
-8000 in %AI1 for 0mA).

8.3 Analog Input Wiring
The analog inputs on the X5 / X5 PRIME OCS allow voltage or current measurement from a variety of devices. The
voltage or current mode is set though settings in Cscape. Each channel can be separately configured for voltage or
current mode.
                                             20mA Analog In - Not Self-Powered




                                                 20mA Analog In - Self-Powered




                                                            0-10VDC In




The analog inputs have a digital filter that can be used to filter electrical noise that may be unavoidable in some
installations. The downside to digital filtering is the inputs will respond more slowly to sudden changes in the actual
input.




                                                              Page 89 of 206
                                                                                       Chapter 8: General I/O Configuration


8.4 Analog Outputs
NOTE: Refer to the datasheet for details on jumper settings.

The analog outputs on Horner OCS devices provide high resolution voltage or current outputs. The voltage or current selection is
controlled with jumpers and configuration settings in Cscape.

NOTE: Each channel can be separately configured for voltage or current mode.

When the controller is stopped, the operation of each output is configurable. The outputs can hold the
state they were in before the controller stopped or they can go to a predetermined value. By default,
analog outputs are set to a value of zero (0).

The following figure illustrates the Analog Output Configuration dialog. To open the I/O configuration dialogs, select Controller >
Hardware Configuration > Local I/O > Config > Module Setup.




The Output value on Stop group box contains items that allow the user to specify how the analog output channels behave when
the controller is stopped. The outputs can either hold their value or default to a value when the controller is stopped.

The Output Mode group box allows the user to select the operating modes for each of the analog outputs. The modes include the
following:
     l   0-10V
     l   0-20mA
     l   4-20mA


For more information on Stop State, refer to the "Cscape Configuration".




                                                            Page 90 of 206
High Speed I/O
(HSC & PWM)




      Page 91
                                                                                      Chapter 9: High Speed I/O (HSC/PWM)



Chapter 9: High Speed I/O (HSC/PWM)
    9.1: Overview                                                                                                                92
    9.2: High Speed I/O Glossary                                                                                                 93
    9.3: High Speed Counter (HSC) Functions                                                                                      94
    9.4: Pulse Width Measurement                                                                                                 95
    9.5: Period Measurement                                                                                                      95
    9.6: Quadrature                                                                                                              96
    9.7: Register Match                                                                                                          96
    9.8: HSC Functions                                                                                                           96
    9.9: Status Bits                                                                                                             98
    9.10: HSC Functions Register Maps                                                                                            99
    9.11: High Speed Output Functions                                                                                           107
    9.12: High Speed Output Functions Register Map                                                                              110
    9.13: HSC I/O Filtering                                                                                                     114

9.1: Overview
In addition to the compliment of simple analog and digital I/O, several of the OCS I/O modules support High Speed Counting
(HSC) I/O functions and may also support Pulse Width Modulation (PWM) Output functions (non-relay modules). The HSC
functions include internal timing, frequency, totalizing, pulse width/period, and quadrature measurement. The PWM functions
include traditional PWM (with variable rate and duty cycle) and a stepper (limited functionality) with variable acceleration and
deceleration rates.
The OCS contains a Field-Programmable Gate Array (FPGA), which is an integrated configurable circuit that allows the OCS
to be programmed to have either two high-speed counters or four high-speed counters. The OCS ships with two high-speed
counters, but a customer can contact Horner Technical Support to receive a file that will configure the unit to have four. These
modes are not supported simultaneously. Two counter mode supports Quadrature mode and two stepper outputs, while four
counter mode does not support Quadrature mode and supports only one stepper output.
The HSC functions include internal timing, frequency, totalizing, pulse width/period, and quadrature measurement.
The PWM functions include traditional PWM (with variable rate and duty cycle) and a stepper (limited functionality) with variable
acceleration and deceleration rates. To determine function availability, refer to the associated model’s Specification/Installation
sheet (Digital DC Input / Output sections).
This chapter describes the operation of these high level I/O functions. For configuration details of these functions, see "Cscape
Configuration" on page 1.




                                                             Page 92 of 206
                                                                               Chapter 9: High Speed I/O (HSC/PWM)


9.2: High Speed I/O Glossary
                                    Glossary of High Speed I/O Terms
    Accumulator      Register used to accumulate or store up a sum or count of many items or events.
                     A special function to zero out the value in a specific register. (Not used with Frequency or Period
        Clear
                     Measurement.)
       Disable       A special function to prevent the counter from running.
      Encoder        A sensor or transducer for converting rotary motion or position to a series of electronic pulses
                     The number of times an electromagnetic signal repeats an identical cycle in a unit of time, usually
   Frequency Input
                     one second.
                     A special function that uses a digital logic circuit to store one or more bits. A latch has a data input,
                     a clock input and an output. When the clock input is active, data on the input is "latched" or stored
    Latch (strobe)
                     and transferred to the output register either immediately or when the clock input goes inactive. The
                     output retains its value until the clock goes active again.
                     Input into the OCS that indicates a particular position. Typically, an encoder has a marker output
       Marker
                     that represents a specific point in the rotation.
                     A Polarity pull-down box is associated with each function and indicates the manner in which the
       Polarity
                     trigger happens (e.g., High level, Low Level, Falling Edge, Rising Edge).
                     A special function used to trigger loading of a value into a register upon an event. (Not used with
    Preload (load)
                     Frequency or Period Measurement.)
                     A high-speed device that expresses the phase relationship between two periodic quantities of the
     Quadrature      same period when the phase difference between them is one fourth of a period. A coupler in which
                     the two output signals are 90° out of phase.
      Totalizer      A counter that sums the total number of cycles applied to its input.




                                                     Page 93 of 206
                                                                                      Chapter 9: High Speed I/O (HSC/PWM)


9.3: High Speed Counter (HSC) Functions
The supports two high speed, configurable counters. There are four dedicated inputs that can be configured to a number of
different options. Each of the two counters can run in one of five modes. Those modes are Totalizer, Frequency Counter, Pulse
Width Measurement, Period Measurement and Quadrature measurement. For some modes, more than one HSC input may be
consumed. The measurement values are provided to ladder in a %AI register. Refer to the Register chapter for more details.

9.3.1: Frequency
In frequency mode, the frequency of the input signal is written to the accumulator in terms of Hertz (cycles/second). When using
frequency mode, four update selections are provided which specify the width of the sample window.

 NOTE: Selecting a shorter sample window provides a quicker measurement (faster response) but lowers the frequency
 accuracy (resolution) and increases the minimum frequency measurement limit. In this mode the Disable and Latch special
 functions are allowed. Refer to the"High Speed I/O Glossary " on the previous page"High Speed I/O Glossary " on the
 previous pagefor a description of these functions.

9.3.2: Totalize
In totalize mode, the accumulator is simply incremented or decremented each time the input transitions in a specific direction.
The totalizer supports the following modes:
                              This mode ties the input to the counter to an internal 10MHz or 1MHz clock. The special functions
 Internal
                              can be used to accurately time events.
                              This increments the accumulator when the input is enabled.

 Count Up                       NOTE: Two inputs can be assigned. Either input can cause the counter to increment. The
                                second input can also be disabled.

                              This decrements the accumulator when the input is enabled.

 Count Down                     NOTE: Two inputs can be assigned. Either input can cause the counter to decrement. The
                                second input can also be disabled.

 Up/Down (Input 1             In this mode, Input 1 (assigned to any of the four inputs) increments the counter, while Input 2
 Up/Input 2 Down)             (also assigned to any of the 4 inputs) decrements the counter.
                              This mode uses input 1 as a clock signal to increment or decrement the counter and then uses
 Clk/Dir (Input 1 Clk,
                              input 2 to decide the direction. Input 2 disabled increments the counter, while input 2 enabled
 Input 2 Dir)
                              decrements the counter.

 NOTE: The totalize mode enables the Disable, Latch, Preload, and Clear special functions. Refer to the "High Speed I/O
 Glossary " on the previous page for a description of these functions.




                                                            Page 94 of 206
                                                                                     Chapter 9: High Speed I/O (HSC/PWM)


9.4: Pulse Width Measurement
In pulse width measurement mode, the high-speed input can measure the width of a pulse stream in one of two modes and
provides a continuous indication of the last sampled value. In this mode the Disable and Latch special functions are allowed.
Refer to the "High Speed I/O Glossary " on page 93 for a description of these functions.
Width High 1 μs Counts – In this sub-mode the accumulator value will contain the number of 1 μs counts the pulse is high.




Width Low 1 μs Counts - In this sub-mode the accumulator value will contain the number of 1 μs counts the pulse is low.




9.5: Period Measurement
In period measurement mode, the high-speed input can measure the period of a pulse stream in one of two modes and provides
a continuous indication of the last sampled value. In this mode, the Disable and Latch special functions are allowed. Refer to the
"High Speed I/O Glossary " on page 93 for a description of these functions.
Period Rising Edges 1 μs Counts – In this sub-mode the period of the input signal is reported in one (1) μs units. The period
measurement will start on the rising edge of the input.




Period Falling Edges 1 μs Counts – In this sub-mode the period of the input signal is reported in 1 μs units. The period
measurement will start on the falling edge of the input.




                                                            Page 95 of 206
                                                                                            Chapter 9: High Speed I/O (HSC/PWM)


9.6: Quadrature
Quadrature mode uses two HSC inputs, any of the four HSC inputs can be assigned for this purpose.
Quadrature mode works much like the totalizer except the accumulator will automatically increment or decrement based on the
rotation phase of the two inputs. See the following example for more details. Quadrature inputs are typically used for reporting
the value of an encoder.
Two modes are available for quadrature that select whether the accumulator counts up or down when the phase of Input 1 leads
Input 2. Check your encoder’s documentation to determine the output form it uses or try both modes to determine if the encoder
counts up when expected.




Using the above waveforms and a HSC input configuration of “Quadrature” - “1 leads 2, count up,” the accumulator will count up
when 1 is rising and 2 is low, 1 is high and 2 is rising, 1 is falling and 2 is high, and when 1 is low and 2 is falling. This results in 4
counts per revolution. So in order to determine the number of cycles, the accumulator would have to be divided by 4.
Marker reset operation is configured in the special operations and can be assigned to any of the 4 high speed inputs or can be
assigned to be controlled by a “Q” bit in ladder.

 NOTE: The quadrature mode enables the Disable, Latch, Preload, Clear and Marker special functions. Refer to the "High
 Speed I/O Glossary " on page 93 for a description of these functions.


9.7: Register Match
Totalizer & Quadrature counter modes support a register match function. When the accumulator value matches either the Match
1 or Match 2 value configured in the corresponding %AQ registers, a high-speed output can Turn On, Turn Off, or Toggle. An
internal %I register mirrors the output state whether the high-speed output is configured or not. The output can be reset in
program logic using the corresponding %Q registers.
   1.    2-Counter Mode has Register Match support for both counters.
   2.    4-Counter Mode has Register Match support only for counters 1 and 2.
   3.    The High-Speed Outputs are %Q1 for Counter 1 and %Q2 for Counter 2. They operate as high-speed
         outputs, independent of the controller scan rate, when configured as ‘HSC Output’ in the Digital Out/PWM
         configuration in Cscape.
   4.    The High-Speed Output state reflects in the status register “High Speed Out”, e.g. %I0009 for Counter 1
         (the update speed of the status bit is scan rate dependent)
   5.    The High-Speed Output can be reset through ladder with the assigned output, e.g. %Q0022 for Counter 1
   6.    Both Match 1 and Match 2 values will trigger the match function.
   7.    If the output is already triggered by any Match register while using ‘Turn On’ or ‘Turn Off’ modes,
         subsequent matches will not affect the output.
   8.    If using ‘Toggle’ mode, every match of either Match value will toggle the output to the opposite state.

9.8: HSC Functions
The high-speed input on the OCS contains many optional tasks. All of which can be disabled, or set to an internal pre-assigned
register (Assigned %Q) or to one of the external high speed inputs (External Input #1, 2, 3, or 4), or they can be set as an


                                                                 Page 96 of 206
                                                                                     Chapter 9: High Speed I/O (HSC/PWM)

“overflow interrupt” or “underflow interrupt” meaning that they will occur when either the Overflow or Underflow input has been
activated.
    n   Disable: When the Disable function is active, it will “disable” the high-speed inputs and no longer count
        pulses until it is re-enabled
    n   Latch: When the Latch function is active, it takes the current value of the Accumulator and moves it into the
        “Latch Value” register
    n   Preload: When the pre-load function is active, it will take the value from the “Preload” register and put it into
        the “Accumulator” for the corresponding Counter.
    n   Clear: When the clear function is active, it will move a value of 0 into the “Accumulator” for the
        corresponding counter.
    n   Marker: When the marker function is enabled, it acts as a dynamic enable/disable for the Disable, Latch,
        Preload, and Clear functions. If the marker is enabled and “Assigned %Q” is selected, then both the
        “Disable” and the “Disable Marker” bits need to be set high in order to disable the high-speed input. If the
        Marker is set for one of the inputs, then the input will need to be “High” in order to use any of the Disable,
        Clear, Preload, or Latch functions.




                                                            Page 97 of 206
                                                                                   Chapter 9: High Speed I/O (HSC/PWM)


9.9: Status Bits
There are three status bits (%I registers for each high-speed counter):
    n   Overflow Flag: This status bit turns high when the Accumulator “overflows”, it moves from 4,294,967,295
        (-1 if Signed) to 0, this bit can be reset with the “Output Reset Bit”. See Table 9.4.
    n   Underflow Flag: This status bit turns high when the Accumulator “underflows”, it moves from 0 to
        4,294,967,295 (-1 if Signed), this bit can also be reset with the “Output Reset Bit”.

          NOTE: For the Overflow and Underflow flag registers, if using some sort of counter that counts both up and down,
          going over the threshold to go negative, triggers the underflow, and then going back over the threshold back into
          positive numbers will trigger the positive register to go active.

    n   High Speed Out: This register will follow the high-speed output assigned to the counter, it is important to
        note that this register is still populated within the scan time so the value in this register may not be up to
        date depending on the timing of the output (it should be up to date within one scan).




                                                            Page 98 of 206
                                                                                  Chapter 9: High Speed I/O (HSC/PWM)


9.10: HSC Functions Register Maps
The register assignments for the high-speed I/O can be moved via a setting in Cscape. The values shown are the DEFAULT
values and may not match the same starting point as the values shown below.

9.10.1: I/O Mapping 2-Counter Mode (X5 Only)
                                     Default Analog Output Registers for HSC
                Register                                                      Function
                %AQ1 - 2                                              Preload Value (Counter1)
                %AQ3 - 4                                              Match1 Value (Counter1)
                %AQ5 – 6                                              Match2 Value (Counter1)
                %AQ7 - 8                                              Preload Value (Counter2)
               %AQ9 – 10                                              Match1 Value (Counter2)
               %AQ11 - 12                                             Match2 Value (Counter2)
                                      Default Analog Input Registers for HSC
                Register                                                      Function
                %AI5 – 6                                        Accumulator / Count Value (Counter1)
                 %AI7 - 8                                                Latch Value (Counter1
                %AI9 – 10                                       Accumulator / Count Value (Counter2)
               %AI11 - 12                                              Latch Value (Counter2)
                                          Default Output Registers for HSC
                Register                                                      Function
                  %Q17                                                Latch Trigger (Counter1)
                  %Q18                                               Preload Trigger (Counter1)
                  %Q19                                                Clear Trigger (Counter1)
                  %Q20                                               Disable Counter (Counter1)
                  %Q21                                                    Direction (Counter1)
                  %Q22                               Underflow/Overflow/HSCQ Reset (Counter1) ( High – Reset)
                  %Q23                                       Preload Disable (Counter1) (High – Disable)
                  %Q24                                        Latch Disable (Counter1) (High - Disable)
                  %Q25                                            Disable Marker Level (Counter1)
                  %Q26                                             Latch Marker Level (Counter1)
                  %Q27                                            Preload Marker Level (Counter1)
                  %Q28                                             Clear Marker Level (Counter1)
                  %Q29                                                         Reserved
                  %Q30                                                         Reserved
                  %Q31                                                         Reserved
                  %Q32                                                         Reserved
                  %Q33                                                Latch Trigger (Counter2)
                  %Q34                                               Preload Trigger (Counter2)
                  %Q35                                                Clear Trigger (Counter2)



                                                        Page 99 of 206
                                                 Chapter 9: High Speed I/O (HSC/PWM)


           Default Output Registers for HSC
Register                                     Function
 %Q36                               Disable Counter (Counter2)
 %Q37                                    Direction (Counter2)
 %Q38                Underflow/Overflow/HSCQ Reset (Counter2) ( High – Reset)
 %Q39                       Preload Disable (Counter2) (High – Disable)
 %Q40                         Latch Disable (Counter2)(High - Disable)
 %Q41                            Disable Marker Level (Counter2)
 %Q42                             Latch Marker Level (Counter2)
 %Q43                            Preload Marker Level (Counter2)
 %Q44                              Clear Marker Level (Counter2)
 %Q45                                          Reserved
 %Q46                                          Reserved
 %Q47                                          Reserved
 %Q48                                          Reserved

             Default Input Registers for HSC
Register                                       Function
 %I17                                Overflow Flag (Counter1)
 %I18                               Underflow Flag (Counter1)
 %I19                                     HSCQ (Counter1)
 %I20                                    Reserved (Counter1)
 %I21                                Overflow Flag (Counter2)
 %I22                               Underflow Flag (Counter2)
 %I23                                     HSCQ (Counter2)
 %I24                                    Reserved (Counter2)




                       Page 100 of 206
                                                                Chapter 9: High Speed I/O (HSC/PWM)


9.10.2: I/O Mapping 4-Counter Mode (X5 Only)
                    HSC Functions Register Map for 4 HSC Configuration
     Register           Frequency                     Pulse                        Totalize
    %AI401-402                                 Accumulator - Counter 1
    %AI403-404                                 Latch Value - Counter 1
    %AI405-406                                 Accumulator - Counter 2
    %AI407-408                                 Latch Value - Counter 2
    %AI409-410                                 Accumulator - Counter 3
    %AI411-412                                 Latch Value - Counter 3
    %AI413-414                                 Accumulator - Counter 4
    %AI415-416                                 Latch Value - Counter 4


     Register           Frequency                     Pulse                        Totalize
    %AQ401-402                                                                Preload - Counter 1
    %AQ403-404                                   Match 1 - Counter 1
    %AQ405-406                                   Match 2 - Counter 1
    %AQ407-408                                                                Preload - Counter 2
    %AQ409-410                                   Match 1 - Counter 2
    %AQ411-412                                   Match 2 - Counter 2
    %AQ413-414                                                                Preload - Counter 3
    %AQ415-416                                   Match 1 - Counter 3
    %AQ417-418                                   Match 2 - Counter 3
    %AQ419-420                                                                Preload - Counter 4
    %AQ421-422                                   Match 1 - Counter 4
    %AQ423-424                                   Match 2 - Counter 4


     Register           Frequency                     Pulse                        Totalize
      %Q1601                                      Latch - Counter 1
      %Q1602                                                                  Preload - Counter 1
      %Q1603                                                                    Clear - Counter 1
      %Q1604                                     Disable - Counter 1
      %Q1605                                                                     Direction - C1
      %Q1606                                                                Output Reset - Counter 1
      %Q1607                                                               Preload Disable - Counter 1
      %Q1608                                                                Latch Disable - Counter 1
    %Q1609-1616                                      Reserved
      %Q1617                                      Latch - Counter 2
      %Q1618                                                                  Preload - Counter 2
      %Q1619                                                                    Clear - Counter 2
      %Q1620                                     Disable - Counter 2



                                         Page 101 of 206
                                                 Chapter 9: High Speed I/O (HSC/PWM)




 Register     Frequency                Pulse                        Totalize
  %Q1621                                                          Direction - C2
  %Q1622                                                     Output Reset - Counter 2
  %Q1623                                                    Preload Disable - Counter 2
  %Q1624                                                     Latch Disable - Counter 2
%Q1625-1632                           Reserved
  %Q1633                           Latch - Counter 3
  %Q1634                                                       Preload - Counter 3
  %Q1635                                                         Clear - Counter 3
  %Q1636                          Disable - Counter 3
  %Q1637                                                          Direction - C3
  %Q1638                                                     Output Reset - Counter 3
  %Q1639                                                    Preload Disable - Counter 3
  %Q1640                                                     Latch Disable - Counter 3
%Q1641-1648                           Reserved
  %Q1649                           Latch - Counter 4
  %Q1650                                                       Preload - Counter 4
  %Q1651                                                         Clear - Counter 4
  %Q1652                          Disable - Counter 4
  %Q1653                                                          Direction - C4
  %Q1654                                                     Output Reset - Counter 4
  %Q1655                                                    Preload Disable - Counter 4
  %Q1656                                                     Latch Disable - Counter 4
%Q1657-1664                           Reserved


  %I1601                       Overflow Flag - Counter 1
  %I1602                      Underflow Flag - Counter 1
  %I1603                           High Speed Out 1
  %I1604                              Reserved
  %I1605                       Overflow Flag - Counter 2
  %I1606                      Underflow Flag - Counter 2
  %I1607                           High Speed Out 2
  %I1608                              Reserved
  %I1609                       Overflow Flag - Counter 3
  %I1610                      Underflow Flag - Counter 3
  %I1611                           High Speed Out 3
  %I1612                              Reserved
  %I1613                       Overflow Flag - Counter 4
  %I1614                      Underflow Flag - Counter 4




                          Page 102 of 206
                                              Chapter 9: High Speed I/O (HSC/PWM)




Register   Frequency                Pulse                        Totalize
%I1615                          High Speed Out 4
%I1616                             Reserved




                       Page 103 of 206
                                                                   Chapter 9: High Speed I/O (HSC/PWM)


9.10.3: I/O Mapping 4-Counter Mode (X5 Prime Only)
                           Default Analog Output Registers for HSC
           Register                                             Function
         %AQ401 – 402                                  Preload Value (Counter1)
         %AQ403 – 404                                  Match1 Value (Counter1)
         %AQ405 – 406                                  Match2 Value (Counter1)
         %AQ407 – 408                                  Preload Value (Counter2)
         %AQ409 – 410                                  Match1 Value (Counter2)
         %AQ411 – 412                                  Match2 Value (Counter2)
         %AQ413 – 414                                  Preload Value (Counter3)
         %AQ415 – 416                                           Reserved
         %AQ417 – 418                                           Reserved
         %AQ419 – 420                                  Preload Value (Counter4)


                           Default Analog Input Registers for HSC
           Register                                             Function
         %AI401 – 402                            Accumulator/Count Value (Counter1)
         %AI403 – 404                                   Latch Value (Counter1)
         %AI405 – 406                            Accumulator/Count Value (Counter2)
         %AI407 – 408                                   Latch Value (Counter2)
         %AI409 – 410                            Accumulator/Count Value (Counter3)
         %AI411 – 412                                   Latch Value (Counter3)
         %AI413 – 414                            Accumulator/Count Value (Counter4)
         %AI415 – 416                                   Latch Value (Counter4)

                              Default Output Registers for HSC
           Register                                             Function
           %Q1601                                      Latch Trigger (Counter1)
           %Q1602                                     Preload Trigger (Counter1)
           %Q1603                                      Clear Trigger (Counter1)
           %Q1604                                     Disable Counter (Counter1)
           %Q1605                                          Direction (Counter1)
           %Q1606                      Underflow/Overflow/HSCQ Reset (Counter1) ( High – Reset)
           %Q1607                             Preload Disable (Counter1) (High – Disable)
           %Q1608                              Latch Disable (Counter1)(High – Disable)
           %Q1609                                               Reserved
           %Q1610                                               Reserved
           %Q1611                                               Reserved
           %Q1612                                               Reserved
           %Q1613                                               Reserved
           %Q1614                                               Reserved



                                         Page 104 of 206
                                                Chapter 9: High Speed I/O (HSC/PWM)


           Default Output Registers for HSC
Register                                     Function
%Q1615                                       Reserved
%Q1616                                       Reserved
%Q1617                              Latch Trigger (Counter2)
%Q1618                            Preload Trigger (Counter2)
%Q1619                              Clear Trigger (Counter2)
%Q1620                            Disable Counter (Counter2)
%Q1621                                  Direction (Counter2)
%Q1622             Underflow/Overflow/HSCQ Reset (Counter2) ( High – Reset)
%Q1623                     Preload Disable(Counter2) (High – Disable)
%Q1624                      Latch Disable (Counter2)(High – Disable)
%Q1625                                       Reserved
%Q1626                                       Reserved
%Q1627                                       Reserved
%Q1628                                       Reserved
%Q1629                                       Reserved
%Q1630                                       Reserved
%Q1631                                       Reserved
%Q1632                                       Reserved
%Q1633                              Latch Trigger (Counter3)
%Q1634                            Preload Trigger (Counter3)
%Q1635                              Clear Trigger (Counter3)
%Q1636                            Disable Counter (Counter3)
%Q1637                                  Direction (Counter3)
%Q1638             Underflow/Overflow/HSCQ Reset (Counter3) ( High – Reset)
%Q1639                     Preload Disable(Counter3) (High – Disable)
%Q1640                      Latch Disable (Counter3)(High – Disable)
%Q1641                                       Reserved
%Q1642                                       Reserved
%Q1643                                       Reserved
%Q1644                                       Reserved
%Q1645                                       Reserved
%Q1646                                       Reserved
%Q1647                                       Reserved
%Q1648                                       Reserved
%Q1649                              Latch Trigger (Counter4)
%Q1650                            Preload Trigger (Counter4)
%Q1651                              Clear Trigger (Counter4)
%Q1652                            Disable Counter (Counter4)




                      Page 105 of 206
                                                Chapter 9: High Speed I/O (HSC/PWM)


           Default Output Registers for HSC
Register                                     Function
%Q1653                                  Direction (Counter4)
%Q1654             Underflow/Overflow/HSCQ Reset (Counter4) ( High – Reset)
%Q1655                     Preload Disable(Counter4) (High – Disable)
%Q1656                      Latch Disable (Counter4) (High – Disable)
%Q1657                                       Reserved
%Q1658                                       Reserved
%Q1659                                       Reserved
%Q1660                                       Reserved
%Q1661                                       Reserved
%Q1662                                       Reserved
%Q1663                                       Reserved
%Q1664                                       Reserved

           Default Input Registers for HSC
Register                                     Function
%I1601                              Overflow Flag (Counter1)
%I1602                             Underflow Flag (Counter1)
%I1603                                   HSCQ (Counter1)
%I1604                                  Reserved (Counter1)
%I1605                              Overflow Flag (Counter2)
%I1606                             Underflow Flag (Counter2)
%I1607                                   HSCQ (Counter2)
%I1608                                  Reserved (Counter2)
%I1609                              Overflow Flag (Counter3)
%I1610                             Underflow Flag (Counter3)
%I1611                                   HSCQ (Counter3)
%I1612                                  Reserved (Counter3)
%I1613                              Overflow Flag (Counter4)
%I1614                             Underflow Flag (Counter4)
%I1615                                   HSCQ (Counter4)
%I1616                                  Reserved (Counter4)




                      Page 106 of 206
                                                                                     Chapter 9: High Speed I/O (HSC/PWM)


9.11: High Speed Output Functions
On units that support high-speed output functions, two dedicated outputs are available that can be configured for one of four
modes of operation. Those modes are Normal, PWM, HSC Match and Stepper.

9.11.1: Normal
When either Q1 or Q2 is configured for Normal operation, the digital output registers %Q1 and %Q2 drives that respective
output.

9.11.2: PWM
When either Q1 or Q2 is configured for PWM, the PWM function drives that respective output. Both PWM channels may be
individually enabled and can have independent frequency and duty cycles.
The PWMs require two parameters (%AQs) to be set for operation. These parameters may be set at run-time.
Duty Cycle - The Duty Cycle is a 32-bit value from 0 to 32,000 indicating the relative duty cycle of the output. For example, a
value of 8000 would indicate a 25% duty cycle, a value of 16,000 would indicate a 50% duty cycle. Zero (0) turns the output off,
32,000 turns the output on.




Frequency - The Frequency is a 32-bit value indicating the output frequency in Hertz. One over the frequency is the period.




At controller power-up or during a download, the PWM output is maintained at zero until both the Frequency and the Duty cycle
are loaded with non-zero values. When the controller is placed in stop mode, the state of the PWM outputs is dependent on the
PWM State on Controller Stop configuration. This configuration allows for either hold-last-state or specific frequency and duty
cycle counts. Specifying zero for either the period or duty causes the PWM output to remain low during stop mode.

 NOTE: The maximum recommended PWM frequency is 500kHz, due to the limitations of built-in output circuitry.




                                                           Page 107 of 206
                                                                                  Chapter 9: High Speed I/O (HSC/PWM)


9.11.3: PWM Output Waveform




                                             PWM Output Waveform Table
                                          Rise Time         150ns Max
                                          Fall Time         150ns Max
                                          PWM Period        Frequency = 1/Period

9.11.4: High Speed Counter Match
When either Q1 or Q2 is configured for HSC Output operation, their output state is based on a comparison between the counter
accumulator and match registers. Refer to the "HSC Functions Register Maps" on page 99 for more details.




                                                         Page 108 of 206
                                                                                        Chapter 9: High Speed I/O (HSC/PWM)


9.11.5: Stepper Function
The OCS supports two stepper functions, one on each high-speed output when in two counter mode. In four counter mode, the
OCS supports one stepper function
The Stepper requires five parameters (%AQs) to be set for operation. These parameters may be set at run-time but are ‘latched’
when the stepper is commanded to start:
                     Sets the frequency for the first cycle during the acceleration phase and the frequency of the last cycle
 Start Frequency
                     during the deceleration phase. When an acceleration or deceleration count is specified, the Start
 (pulses per second)
                     Frequency must be greater than 0 and must not exceed the run frequency or an error is generated.
                     Sets the frequency for the last cycle during the acceleration phase, the consistent frequency during the
 Run Frequency
                     run phase, and the frequency of the first cycle during the deceleration mode. The Run Frequency must
 (pulses per second)
                     be greater than 0 and must not exceed 5000Hz (standard).
                          Sets the number of cycles to occur within the acceleration phase. The frequency of the cycles within
 Acceleration Count       this mode will vary linearly between the specified Start and Run frequency. The Accel count must not
                          equal 1 or an error is generated. Setting this value to zero disables this phase.
                          Sets the number of cycles to occur within the run phase. The frequency of the cycles within this mode
 Run Count                is constant at the specified Run frequency. The Run count may be any value. Setting this value to zero
                          disables this phase.
                          Sets the number of cycles to occur within the deceleration phase. The frequency of the cycles within
 Deceleration Count       this phase will vary linearly between the specified Run and Stop frequency. The Decel count must not
                          equal 1 or an error is generated. Setting this value to zero disables this phase.
The stepper provides two Boolean registers to provide stepper status:
                          A high indication on this register indicates the stepper sequence can be started (i.e. not currently busy)
 Ready/Done
                          and also when the move is completed.
                          A high indication on this register indicates that one of the analog parameters specified above is invalid
 Error                    or the stepper action was aborted before the operation was complete. This register is cleared on the
                          next start command if the error was corrected.
The stepper requires one discrete register to control the stepper action. Setting this register starts the stepper cycle. This register
must remain set to complete the entire cycle. Clearing this register before the cycle is complete aborts the step sequence and
sets the error bit.

 NOTE: Setting the PLC mode to stop while the stepper is in operation causes the stepper output to immediately drop to zero
 and the current stepper count to be lost.

 NOTE: The stepper output level may cause damage or be incompatible with some motor drive inputs. Consult drive
 documentation to determine if output level and type is compatible.




                                                              Page 109 of 206
                                                                                Chapter 9: High Speed I/O (HSC/PWM)


9.12: High Speed Output Functions Register Map
The register assignments for the high speed I/O can be moved via a setting in Cscape. The values shown are the DEFAULT
values and may not match the same starting point as the values shown below.

9.12.1: I/O Mapping 2-Counter Mode
                               Default Analog Output Registers for PWM & Stepper
               Register                              PWM                                     Stepper
              %AQ21 - 22                      Duty Cycle (PWM1)                     Start Frequency (Stepper1)
              %AQ23 - 24                      Frequency (PWM1)                      Run Frequency (Stepper1)
              %AQ25 - 26                                                           Acceleration Count (Stepper1)
              %AQ27 - 28                                                               Run Count (Stepper1)
              %AQ29 - 30                                                           Deceleration Count (Stepper1)
              %AQ31 - 32                      Duty Cycle (PWM2)                     Start Frequency (Stepper2)
              %AQ33 - 34                      Frequency (PWM2)                      Run Frequency (Stepper2)
              %AQ35 - 36                                                           Acceleration Count (Stepper2)
              %AQ37 - 38                                                               Run Count (Stepper2)
              %AQ39 - 40                                                           Deceleration Count (Stepper2)
                                    Default Input Registers for PWM & Stepper
               Register                               PWM                                     Stepper
                 %I33                                                                 Ready/Done (Stepper1)
                 %I34                                                                     Error (Stepper1)
                 %I35                                                                 Ready/Done (Stepper2)
                 %I36                                                                     Error (Stepper2)
                                   Default Output Registers for PWM & Stepper
              Register                                PWM                                     Stepper
                 %Q1                                                                    Digital Out (Stepper1)
                 %Q2                                                                    Digital Out (Stepper2)




                                                        Page 110 of 206
                                                            Chapter 9: High Speed I/O (HSC/PWM)


9.12.2: I/O Mapping 4-Counter Mode
                    Default Analog Output Registers for PWM & Stepper
        Register                  PWM                                    Stepper
       %AQ21 - 22            Duty Cycle (PWM1)                Start Frequency (Stepper1)
       %AQ23 - 24            Frequency (PWM1)                 Run Frequency (Stepper1)
       %AQ25 - 26                                            Acceleration Count (Stepper1)
       %AQ27 - 28                                                Run Count (Stepper1)
       %AQ29 - 30                                            Deceleration Count (Stepper1)
       %AQ31 - 32            Duty Cycle (PWM2)
       %AQ33 - 34            Frequency (PWM2)
       %AQ35 - 36
       %AQ37 - 38
       %AQ39 - 40
                        Default Input Registers for PWM & Stepper
        Register                     PWM                                  Stepper
          %I33                                                   Ready/Done (Stepper1)
          %I34                                                        Error (Stepper1)
                       Default Output Registers for PWM & Stepper
        Register                     PWM                                  Stepper
          %Q1                                                       Digital Out (Stepper1)
          %Q2                                                       Digital Out (Stepper2)




                                        Page 111 of 206
                                                                         Chapter 9: High Speed I/O (HSC/PWM)


9.12.3: PWM Examples
Example 1
                                                      Duty Cycle                       Frequency
To get a 50% Duty Cycle @ 10kHz
                                        Set %AQ21-22 = 16,000             Set %AQ23-24 = 10,000
waveform on PWM1:

Example 2
                                                      Duty Cycle                       Frequency
To get a 50% Duty Cycle on PW1 and 0    Set %AQ21-22 = 16,000
                                                                          Set %AQ23-24 = 1,000
% Duty Cycle on PWM2 @ 1kHz             Set %AQ31-32 = 28,800
waveform:                                                                 Set %AQ33-34 = 1,000
                                        (duty cycle (32000 * 0.9))

Example 3
                                                      Duty Cycle                       Frequency
To turn PWM 1 output ON all the time    Set %AQ21-22 = 32,000             Set %AQ23-24 = Any Value

Example 4
                                                      Duty Cycle                       Frequency
To turn PWM 1 output OFF all the time   Set %AQ21-22 = 0                  Set %AQ23-24 = Any Value




                                                       Page 112 of 206
                                                                                     Chapter 9: High Speed I/O (HSC/PWM)


9.12.4: STP Examples
Example 1
                      Start Frequency        Run Frequency          Accel Count            Run Count            Decel Count
10,000,000 steps     Set %AQ21-22 =        Set %AQ23-24 =        Set %AQ25-26 =        Set %AQ27-28 =       Set %AQ29-30 =
control sequence     2500 (Hz)             5000 (Hz)             1,000,000 (Steps)     8,000,000 (Steps)    1,0000,000 (Steps)
When the start bit is energized, the example starts at 2.5kHz and ramps up to 5kHz during the first 1,000,000 steps. Then, it
runs at 5kHz for the next 8,000,000 steps. Finally, during the last 1,000,000 steps it slows to a stop.

Example 2
                      Start Frequency        Run Frequency          Accel Count            Run Count            Decel Count
5,000,000 steps      Set %AQ21-22 =        Set %AQ23-24 =        Set %AQ25-26 =        Set %AQ27-28 =       Set %AQ29-30 =
control sequence     500 (Hz)              1000 (Hz)             2,000,000 (Steps)     2,000,000 (Steps)    1,000,000 (Steps)
When the start bit is energized, the example starts at 0.5 kHz and ramps up to 1 kHz during the first 2,000,000 steps. Then, it
runs at 1 kHz for the next 2,000,000 steps. Finally, during the last 1,000,000 steps it slows to a stop.

Example 3
                      Start Frequency        Run Frequency          Accel Count            Run Count            Decel Count
6,000,000 steps      Set %AQ21-22 =        Set %AQ23-24 =        Set %AQ25-26 =        Set %AQ27-28 =        Set %AQ29-30 =
control sequence     50 (Hz)               250 (Hz)              150,00 (Steps)        5,500,000 (Steps)     350,000 (Steps)
When the start bit is energized, the following example starts at 50Hz and ramps up to 250Hz during the first 150,000 steps.
Then, it runs at 250Hz for the next 5,500,000 steps. During the last 350,000 steps it slows to a stop.

NOTE: Prior to the start of a move, the Ready/Done bit for that channel must be ON (%I33 or %I35 for channel 1 and 2
respectfully). The Ready/Done bit will turn OFF during the move, and then back ON once the move is completed.

NOTE: The pulse generation hardware on the OCS can generate any frequency that can be evenly divided into 10MHz
(10,000,000Hz) under the maximum recommended frequencies for each model. This results in a very smooth operation at
lower frequencies, with a progressively choppier operation at higher frequencies, as the units reach their maximum
recommended frequency.




                                                           Page 113 of 206
                                                                                       Chapter 9: High Speed I/O (HSC/PWM)


9.13: HSC I/O Filtering
This feature is used to enable digital Filter for HSC Inputs. Selecting Digital In/HSC configuration opens up the following dialog
where in HSC I/O Filtering is available.




Input signal is filtered based on the filter frequency and Number of samples selected. User has to select Filter Frequency and
Number of samples based on the frequency of the Input signal.
Filter Frequency: To set the filter, choose a value that is: 4*Number of Samples*Expected Max Hz on the high-speed inputs.
Number of samples: The input must be stable for this many samples before the HSC accumulator is affected by any change.
The state (high or low) of the high-speed input is sampled with every rising input edge of the filter frequency. The rising edges of
the filter frequency are totaled in a sample counter, and when that total equals the number of samples configured, the sample
counter is reset. If the high-speed input state did not change by the time of the sample counter reset, that state, high or low, is
passed on to the high-speed accumulator. If the high-speed input state changes during the sample counting, the sample counter
is reset to zero and the process starts over.




If user selects filter frequency as 1MHz and Number of samples as 4, then Input signal is sampled for 4 samples and if the signal
is stable for 4 samples i.e. 4μs then the signal is passed to Accumulator.
If the Input state is changed in between the sampling counts, then the count is reset, and the Input state is again checked for
given number of samples.


                                                            Page 114 of 206
                                                                                       Chapter 9: High Speed I/O (HSC/PWM)

Refer to Dotted lines in the Figure 2, after 2 samples the state of input signal changes to 1, so the counter is again started to
count 4 samples, to pass the signal to accumulator.
There will be a delay in passing the input signal to accumulator since we are filtering the Input signal and the delay is based on
the selected filter frequency and Number of samples. In the above example filter frequency is 1MHZ (1μs) and number of
samples: 4, so the minimum delay in input signal will be 4μs.




                                                             Page 115 of 206
    Serial
Communications




      Page 116
                                                                                     Chapter 10: Serial Communications



Chapter 10: Serial Communications
   10.1: The Serial Port & Dip Switches                                                                                      117
   10.2: RS-485 Serial Port                                                                                                  118
   10.3: CAN Termination                                                                                                     118
   10.4: Cscape Programming via Serial Port                                                                                  118
   10.5: Ladder-Controlled Serial Communication                                                                              118
   10.6: Downloadable Serial Communication Protocols                                                                         118
   10.7: Configuration via Mini-B USB                                                                                        119
All X5/X5 Prime OCS models provide two serial ports, which are implemented with single 8-pin modular jacks, are labeled MJ1
and MJ2. The MJ1 serial port is RS-232 while the MJ2 port is RS-485. MJ1 defaults to OCS programming by connecting it to the
COM port of a PC running Cscape. In addition, both MJ1 and MJ2 can be used for application-specific communication, using a
variety of standard data exchange protocols.

10.1: The Serial Port & Dip Switches
 NOTE: If needed, wiring for MJ1/2 can easily be broken out into eight (8) separate screw terminals using the HE200MJ2TRM
 adapter.

                                                           MJ1 PINS                                      MJ2 PINS
                                            Pin          Signal            Direction          Signal            Direction

                                             8            TXD                OUT                    -                 -

                                             7            RXD                 IN                    -                 -

                                             6             0V              GROUND                   0V          GROUND

                                             5         +5V @ 60mA            OUT            +5V @ 60mA               OUT

                                             4            RTS                OUT                    -                 -

                                             3            CTS                 IN                    -                 -

                                             2              -                  -              RX-/TX-               IN/OUT

                                             1              -                  -              RX+/TX+               IN/OUT


                                                                       DIP SWITCHES

                                   PIN                  NAME                         FUNCTION                  DEFAULT

                                    1             RS-485 Termination               On = Terminated                  OFF

                                    2              CAN Termination                 ON = Terminated                  OFF

                                    3                  Bootload                        Always Off                   OFF




                                                         Page 117 of 206
                                                                                        Chapter 10: Serial Communications


10.2: RS-485 Serial Port
RS-485 Termination - Proper RS-485 termination minimizes reflections and improves reliability. The 485 serial port allows an
internal RS-485 termination resistor to be placed across pins 1 and 2 by DIP Switch Setting. Only the two devices physically
located at the endpoints of the RS-485 network should be terminated.
RS-485 Biasing - RS-485 biasing passively asserts a line-idle state when no device is actively transmitting, which is useful for
multi-drop RS-485 networking. The 485 serial ports allow internal RS-485 bias resistors to be switched in, pulling pin 1 up to 3.3V
and pulling pin 2 down to ground. The Set Serial Ports item in the System Menu can be used to enable RS-485 biasing. Also,
an application graphics screen that writes to %SR164 can do the same thing. Setting %SR164.1 enables MJ1 biasing and
setting %SR164.2 enables MJ2 biasing.
If biasing is used, it should be enabled in only one of the devices attached to the RS-485 network.

10.3: CAN Termination
Proper CAN bus termination minimizes reflections and improves reliability. The CAN port allows an internal termination resistor
to be placed across the CAN_H and CAN_L connections by DIP Switch Setting.
Only the two devices physically located at the endpoints of the CAN bus should be terminated.

10.4: Cscape Programming via Serial Port
The X5/X5 Prime OCS MJ1 serial port supports CsCAN Programming Protocol. If a PC COM port is connected to the X5/X5
Prime OCS MJ1 serial port, Cscape can access the X5/X5 Prime OCS for programming and monitoring. Programming can also
be done via the CAN port, USB port or Ethernet. Successful communications with USB-to-serial adapters vary. If in doubt,
Horner APG offers a USB to serial adapter: part number HE-CPK.

10.5: Ladder-Controlled Serial Communication
Using Serial Communication function blocks, both MJ1 and MJ2 support Generic, Modbus Master, and Modbus Slave Protocols.
In addition, external modems can be connected and accessed using Init and Dial and Answer Modem function blocks.

10.6: Downloadable Serial Communication Protocols
Both MJ1 and MJ2 also support downloadable protocols, such as Allen Bradley DF1, CsCAN Master, GE Fanuc SNP and
Modbus Master.

 NOTE: Refer to the download section of our website for the list of latest supported protocols.




                                                            Page 118 of 206
                                                                                     Chapter 10: Serial Communications


10.7: Configuration via Mini-B USB
 NOTE: The unit must be connected via the mini-USB port to the PC or laptop.

It is possible to load the program and monitor data via the Mini-B USB. To load via Mini-B USB, configure the communications
port in Cscape as follows:
Select Tools from the toolbar > Application Settings > Communications > USB button
It is possible to download or upload and use the data monitoring functions once connected.

 NOTE: It is advisable to use an isolated USB cable between the PC or laptop and the X5/X5 Prime when third party devices
 are connected to the X5/X5 Prime to avoid damage to the PC or laptop and/or the X5/X5 Prime.




                                                          Page 119 of 206
    CAN
Communications




      Page 120
                                                                                       Chapter 11: CAN Communications



Chapter 11: CAN Communications
    11.1: Port Description                                                                                                   121
    11.2: CAN1 Port Wiring                                                                                                   121
                                                                                                                             121
    11.3: Cscape Programming via CAN                                                                                         121
    11.4: Ladder-Controlled CAN Communication                                                                                122
    11.5: Using CAN for I/O Expansion (Network I/O)                                                                          122

 NOTE: For additional CAN information, refer to the CAN Networks manual, MAN0799 (MAN0799) using Horner's
 Documentation Search page.

The X5/X5 Prime OCS provides a CAN networking port, which is implemented with an 8-position modular jack. The connector is
labeled CAN. The CAN1 port allows the X5/X5 Prime OCS to exchange global data with other OCS/RCS controllers and to
access remote Network I/O devices (SmartStix, SmartBlocks, and Smart Rail Modules). The CAN1 port also supports pass-
through communications for programming multiple OCS controllers over the CsCAN network.

11.1: Port Description
The OCS CAN ports implement the ISO 11898-2 physical layer and the CAN 2.0A data link layer standards. Also, since the CAN
ports are powered by an internal isolated power supply, external CAN power is not required.

 NOTE: The CAN port does not supply power to the network.


11.2: CAN1 Port Wiring
11.2.1: CAN Connector

                                                                               CAN Pin Assignments
                                                                PIN                          SIGNAL
                                                                 8                        No Connection
                                                                 7                    Ground (PCB Ground)
                                                                 6                 [CAN] Shield (Earth Ground)
                                   Modular jack (8p8c)
                                                                 5                        No Connection
                                                                 4                        No Connection
                                                                 3                    Ground (PCB Ground)
                                                                 2                        CAN Data Low
                                                                 1                        CAN Data High
The CAN port is provided via the single 8-position modular jack labeled “CAN”. It may be used to communicate with other OCS
products using Horner’s CsCAN protocol. Additionally, remote expansion I/O such as SmartRail, SmartBlock, OSC IO, and
SmartStix may be implemented using the CsCAN protocol.
Termination for the CAN port may be achieved by turning DIP switch 2 to the ON position. This should only occur if the X5 is at
one end of the CAN daisy-chain or the other. Only the two devices on either end of the CAN daisy-chain should be terminated.

11.3: Cscape Programming via CAN
The CAN port supports CsCAN Programming Protocol. If a PC has a CAN interface installed (via PCI card or USB), and the PC
CAN port is connected to the OCS CAN port, Cscape can access the OCS for programming and monitoring.



                                                           Page 121 of 206
                                                                                     Chapter 11: CAN Communications

In addition, the OCS supports single-point-programming of all OCS devices that are connected to the CAN port network. If the
PC COM port is connected to the OCS MJ1 serial port, the OCS can act as a pass-through gateway allowing Cscape to access
all OCS devices that are attached to the CAN port network.

11.4: Ladder-Controlled CAN Communication
Using Put and Get Network Words function blocks, the CAN1 port can exchange digital and analog global data with other
devices (nodes) attached to the CAN network.
In addition, Put and Get Network Heartbeat function blocks allow nodes on the CAN network to regularly announce their
presence and to detect the presence (or absence) of other nodes on the network.

11.5: Using CAN for I/O Expansion (Network I/O)
Connecting network I/O devices (SmartStix, SmartBlock, SmartMod, or SmartRail) to the OCS CAN1 port, allows the OCS I/O to
be economically expanded and distributed. A variety of modules are available for this purpose.




                                                         Page 122 of 206
  Ethernet
Communication




     Page 123
                                                                                    Chapter 12: Ethernet Communications



Chapter 12: Ethernet Communications
   12.1: Ethernet Module Protocols                                                                                        124
   12.2: Ethernet Systems Requirements                                                                                    125
   12.3: Ethernet Module Specifications                                                                                   125
   12.4: Ethernet Module Configuration                                                                                    125
   12.5: Ethernet Module Protocol Configuration                                                                           128

 NOTE: Refer to the Ethernet Supplement on the Document Search page for more details.


12.1: Ethernet Module Protocols
The X5/X5 Prime controller supports the following:
   1.   Downloadable Protocols:ASCII TCP/IP Client, BACNetIP server, EIPC Client (Limited Use), Modbus
        TCP Client
   2.   Built-In Protocols: ICMP (Ping), EGD, Modbus Slave, Ethernet I/P, FTP, ASCII over TCP/IP, MQTT,
        WebMI, SMTP (email), and CsCAN
   3.   Supports a maximum of 4 WebMI simultaneous connections
   4.   Ethernet SmartRail
The following table describes the Ethernet Module Protocols and features supported by the Ethernet port on the X5/X5 Prime.
               Protocol/Feature                                          Protocol/Feature Description
 ICMP (Ping)                                    Internet Control Message Protocol
 EGD                                            Ethernet Global Data
 SRTP Slave (90-30 Service Request)             Service Request Transfer Protocol
 CsCAN TCP Server                               Horner APG CsCAN over Ethernet (for Cscape to OCS programming)
 Modbus Slave                                   Modbus over Ethernet
 Ethernet / IP                                  ODVA CIP over Ethernet
 FTP (File Server)                              File Transfer Protocol
 HTTP (Web Server)                              HyperText Transfer Protocol (Web Server)
 ASCII over TCP/IP                              ASCII Data over Ethernet
 NTP Protocol                                   Network Time Protocol (Obtain clock from web-based server)




                                                          Page 124 of 206
                                                                                      Chapter 12: Ethernet Communications


12.2: Ethernet Systems Requirements
Full Ethernet functionality requires PC running Cscape Programming Software Version 9.8 or later (for configuration).

12.3: Ethernet Module Specifications
 Speeds                                   10 BaseT Ethernet (10Mbps) 100 BaseTx Fast Ethernet (100Mbps)
 Modes                                    Half or Full Duplex
 Auto-Negotiation                         Both 10/100Mbps and Half/Full Duplex
 Connector Type                           Shielded 8-pin modular jack
 Cable Type (Recommended)                 CAT5 (or better) UTP
 Port                                     Auto MDI/MDI-X (Auto Crossover)


12.4: Ethernet Module Configuration
 NOTE: The following configuration is required for all applications regardless of the protocols used. Additional configuration
 procedures must be performed for each protocol used.

To configure the Ethernet Module, use Cscape Programming Software to perform the following steps:
   1.   On the main Cscape screen, select the Controller menu and its Hardware Configuration sub-menu to
        open the Hardware Configuration dialog.
   2.   If configuring a different OCS Model than the one shown in the Hardware Configuration dialog, click on
        the topmost Config button, select the desired OCS Model, and then click OK.




   3.   Click the Config button to the right of the LAN1 for LAN 1 or LAN2 for LAN 2, revealing the Ethernet
        Module Configuration dialog.




                                                           Page 125 of 206
                                                                             Chapter 12: Ethernet Communications




4.   Configure the Ethernet Module parameters as follows:
5.   IP Address: Enter the static IP Address for the Ethernet Module being configured.

      NOTE: IP Addresses are entered as four numbers, each ranging from 0 to 255. These four numbers are called
      octets, and they are always separated by decimal points.

 l   Net Mask: Enter the Net Mask (sometimes called Subnet Mask) being used by all nodes on the local
     network. Typical local networks use Class C IP Addresses, in which case the low octet (rightmost number)
     is used to uniquely identify each node on the local network. In this case, the default Net Mask value of
     255.255.255.0 should be used.
 l   Gateway: Enter the IP Address of a Gateway Server on the local network that allows for communication
     outside of the local network. To prevent the Ethernet Module from communicating outside the local
     network, set the Default Gateway IP Address to 0.0.0.0 (the default setting).
 l   Status Register: Enter an OCS Register reference (such as %R100) to indicate which 16-bit OCS register
     will have the Ethernet Status word written to it. The table shows how this register value is formatted and
     explains the meaning of each bit in the Status Word.




                                                    Page 126 of 206
                                                                                            Chapter 12: Ethernet Communications


                                      Ethernet Status Word Register Format
                          High Byte                                                         Low Byte
 Bit 16 Bit 15 Bit 14 Bit 13 Bit 12 Bit 11 Bit 10        Bit 9    Bit 8 Bit 7 Bit 6 Bit 5     Bit 4        Bit 3   Bit 2        Bit 1
   0       0        Dup   Spd     0      Rx      Tx      Link                        TCP Connections
                                                                                                          Status Values
          Status Bit                              Status Indication
                                                                                               Minimum              Maximum
                0                                      Reserved                                              Always 0
               Dup                         Link Duplex (Auto-Negotiated)                     0 = Half Duplex 1 = Full Duplex
               Spd                          Link Speed (Auto-Negotiated)                      0 = 10 Mbps          1 = 100 Mbps
               Rx                                     Receive State                           0 = Inactive          1 = Active
               Tx                                   Transmit State                            0 = Inactive          1 = Active
               Link                                    Link State                              0 = Down                 1 = Up
       TCP Connections                Total Number of Active TCP Connections                          0                    40
Version Register: Optionally enter an OCS Register reference (such as %R101) to indicate which 16-bit OCS register will have
the Ethernet Firmware Version written to it. For example, for Ethernet Firmware Version 4.30, the Version register will contain
430. This version will only change with a complete controller Firmware Update.
Optionally, check the Use CAN ID for last Octet box in order to leave the last octet of the IP Address editable by way of
changing the controllers CAN ID. This does not affect the Net Mask or Gateway settings.

 NOTE: Get settings from may be specified for Configuration or Register.

If set to Configuration, addresses will be obtained from the Default Settings column. They may temporarily be changed via the
X5/X5 Prime System Menu which is useful to obtain an Ethernet connection initially. These temporary settings will revert to those
configured in Cscape each time the controller is placed in RUN mode, i.e. after a program download or upon power-up. Refer to
"System Settings" on page 25 for more details.
If set to Register, addresses will be obtained from the configured register only, whether via the application code or a data field on
the touchscreen or any combination thereof. The Default Settings column is ignored in this case. The X5/X5 Prime System Menu
will reflect the current addresses, but the addresses may not be edited from the System Menu.

 NOTE: While assigning registers to IP address, Net Mask, Gateway, Status, and Version are optional, it is highly
 recommended to assign registers to these fields for the purpose of troubleshooting.




                                                                 Page 127 of 206
                                                                                         Chapter 12: Ethernet Communications


12.5: Ethernet Module Protocol Configuration
The Protocol Support area contains a list of the resident protocols supported by the platform being configured. To activate a
protocol, check its checkbox.
For protocols that require additional configuration, click on a listed protocol to select it and then click the Configure Selected
Protocol button. This will open a new dialog with configuration options for the selected protocol.
For detailed information on individual protocol configuration, refer to latest version of the Ethernet Manual, SUP0740.




                                                              Page 128 of 206
Downloadable
  Protocols




     Page 129
                                                                                            Chapter 13: Protocol Configuration



Chapter 13: Protocol Configuration
    13.1: Overview                                                                                                                  130
    13.2: Protocol Device Driver Selection                                                                                          131
    13.3: Network Configuration                                                                                                     132
    13.4: Device List and Device Configuration                                                                                      133
    13.5: Scan List                                                                                                                 135



13.1: Overview
Through loadable protocol device drivers, certain models of the OCS family can provide the ability to exchange data with remote
devices such as variable-frequency drives, PLCs and remote I/O devices. This feature greatly expands the OCS’s control
capability with negligible effect on the OCS ’s ladder scan time.
Remote devices that communicate serially must do so under certain rules of data transfer known as a protocol. Many device
manufactures have created their own protocol for communications with their device. For a OCS to communicate with a specific
device, it must be loaded with the corresponding serial communications protocol device driver that supports that protocol.

A limited number of protocol device drivers are packaged with the Cscape distribution; however, as more are developed, they
will be made available as add-on packages. A device driver is typically distributed as a Windows module, which contains the
configuration menus, help files and the target executable driver code. When updating device drivers, an install routine loads the
device driver to the Cscape directory structure and makes that driver available to Cscape applications.
Once installed, the protocol device driver can be included as part of a Cscape application by selecting it from a list of installed
protocol device drivers and attaching it to the desired serial port (Home > Protocols). Only one protocol device driver can be
associated with a serial port, though some OCS models support multiple protocols on a single EtherNet port.

Once the protocol is selected for a specific port, that port must be configured to match the bit transfer size and rate of the target
device(s). This is configured under the Network Config menu, which contains port specific information such as the basic serial
port parameters (i.e. baud rate, stop bits parity, retries, etc.). In addition to the serial port parameters, this menu also contains the
transaction scan update control configuration and any network level protocol specific configuration.

Once the network is configured, each device on the serial communications network must be configured. For some
communications (i.e. RS-232), the network can be limited to one device. The devices are configured under the Device Config
menu, which contains an arbitrary device name, the device ID and optionally a OCS status register that contains any device fault
information.

Once each device(s) is configured, a Scan List of entries must be created which defines the transfer of data between a local
(OCS ) register(s) and a remote device register(s). These entries are created under the Data Mapping menu, which contains a
OCS register, a target device ID, a target device register address, the number of registers to transfer, and update type.

Each entry can be configured for one of two types of initiating a transaction: Polled and Triggered. Polled type entries initiate a
transaction with the remote device on every transaction scan. Triggered type entries only initiate a transaction when a
corresponding local (OCS ) binary trigger register is set. Once a triggered type transaction completes, the protocol device driver
resets the local (OCS ) binary register to indicate completion.

These basic types are also subdivided into read or write operations. For polled operations, a Read operation only reads from a
remote device. Likewise a Read/Write operation continuously reads from the remote device unless the target OCS register value
changes from one ladder scan to another. In this case, the new OCS value is written to the target device. For triggered
operations, only a read or write action is available.




                                                               Page 130 of 206
                                                                                       Chapter 13: Protocol Configuration

When downloaded to the OCS , the Scan List is scanned sequentially to generate data transactions with the remote device. This
transaction scanning can be on a continual basis (automatic) or controlled from ladder logic (manual) once a complex
connection is created via a program. The specific transaction-scanning mode is selected from the Network Config menu.

Refer to the Cscape Help file for more information on Downloadable Protocols Configuration.



13.2: Protocol Device Driver Selection
From the Cscape Home > Protocols menu, select the port drop-down box to select a protocol device driver. All protocol device
drivers currently loaded in Cscape are displayed in the drop down selection along with their version numbers. A selected
protocol can be removed by selecting None from the drop-down selection. Some OCS models can be limited in the number of
ports or number of protocol device drivers that can be selected. Once a protocol is selected, the Network, Devices and Data
(Scan List) must be configured through corresponding dialogues accessible through the respective buttons (Network, Devices
and Scan List).




 NOTE: If the MJ1 port is to be used in the Protocol Config, it will no longer be available for Cscape programming unless the
 controller is put into IDLE mode.

Three fields must be configured after a protocol is selected:
   1.   Network
   2.   Devices
   3.   Scan List




                                                            Page 131 of 206
                                                                                         Chapter 13: Protocol Configuration


13.3: Network Configuration




Network Configuration provides the required parameters to configure the network. Each protocol is different and may not require
the entire Network Config field. Please refer to the table below for the options in the Network Config field.
                                                   Network Protocols
  Baud Rate, Data
  Bits, Stop Bits,     These field define the bit level transfer over the serial port.
       Parity
                       None – No handshake lines are used
                       Multidrop Full – Rx remains active while Tx is occurring.
     Handshake
                       Multidrop Half – Rx is shut off while Tx is occurring.
                       Radio Modem – Wait for CTS acknowledgment before transmitting (legacy radio modem support).
                       If a driver supports multiple protocols, it is selected here, (i.e., Modbus-TCP/UDP supports RTU or
       Protocol
                       ANSI).
        Mode           Specifies if port operates in RS-232 or RS-485 mode.
       Retries         Specifies number of times a transaction is retried on a failed response.
       Timeout         Specifies the amount of time for a device to wait for a valid response.
                                                     Update Interval – Specifies the update interval at which all the mapped
                                                     entries are executed.
                                Automatic
    Update Scan                                      Reacquire Time – Specifies the amount of time to wait before attempting
                                                     communications with an offline device.
                                 Manual              Trigger – Specifies the binary register that a single transaction scan of the


                                                            Page 132 of 206
                                                                                          Chapter 13: Protocol Configuration


                                                   Network Protocols
                                                    Scan List.
                                                    ID Select – If an analog is specified in the field, the ID Select filter is
                                                    enabled.
                        Specifies the starting OCS register of eight (8) consecutive registers (4-32bit counters), which provide
   Status Register
                        an indication of the network health.
  Scanner Address       Specifies the OCS’s device (network) ID if a master ID is required by the protocol.
    Protocol Help       Provides protocol specific help.



13.4: Device List and Device Configuration
13.4.1: Device List




This configuration list is reached from the Device button on the Protocol Config screen and provides a list of the configured
devices on the Network. Devices must be created and exist in this list before corresponding Scan List entries can be created for
this device. Typically, the number of entries is limited to 64 devices.
    l   Add - Opens the Device Config dialog to add a new device to the list.
    l   Delete - Remove selected device from list (all corresponding Scan List entries are also removed).
    l   Config - Invoke the Device Config dialog for the currently selected device. This can also be accomplished
        by double-clicking a device entry.
    l   Mapping - Invoke the Scan List limiting the entries displayed for the selected device.




                                                           Page 133 of 206
                                                                                      Chapter 13: Protocol Configuration


13.4.2: Device Configuration




This configuration is reached from the device list when adding or modifying an existing device. While each protocol is somewhat
different and can contain protocol specific field, all protocols typically support at least:
    l   Device Name - Specifies a tag name for this device. This tag name is used in the Data Mapping
        configuration to identify this device. This allows device addresses to be modified without the need to
        update all associated Data Mapping entries.
    l   Device ID - Specifies the target device communications ID or station address.
    l   Swap Words on 32-bit Data - If a Scan List entry is configured to transfer 32-bits and this option is
        checked, the high and low 16-bit values are swapped when transferred between the target and OCS.
    l   Disable Device - From Cscape 9.90 SP3 and firmware 15.40 onwards, disable device feature has been
        added in protocol device configuration. This option is used to disable a particular slave configured in the
        network. Single bit register has to be configured to use this function. Setting the bit high disables the slave
        and OCS will not send any serial (TCP for EtherNet/IP protocols) packets only to this slave until the bit is
        high. Setting the bit low enables the communication with the slave again.
    l   Status Enable - This checkbox enables device status to be displayed and controlled from two consecutive
        16-bit registers.
    l   Status Address - Enter the starting 16-bit OCS register of two consecutive registers used for device
        status. The first register contains the protocol device driver specific error code while the second register
        contains the index of the offending Scan List entry.
    l   Status Modes:
           a. Stop on Error - Specifies that communications be only reattempted after offline status when the
               corresponding device status register is cleared.
            b.   Retry on Error - Specifies that communications be reattempted either during the reacquire
                 interval or when the corresponding device status register is cleared.




                                                          Page 134 of 206
                                                                                           Chapter 13: Protocol Configuration


13.5: Scan List




This configuration list is reached from the Scan List button on the Protocol Config screen or the Mapping button on the Device
List screen and provides a Scan List of the Data Mapping entries. To transfer data between the OCS and remote target, a Scan
List must be created that defines each transaction. Each mapping entry (transaction) contains the source and destination
registers, the number of consecutive registers transferred, the direction of the transfer and what triggers the transfer. Typically,
the number of entries is limited to 512.

 NOTE: The order of the Scan List is the order in which the transactions occur. Sort functions are provided to change
 the order of the list. Each entry also has an identifying index. If the device status register is enabled and a transaction failure
 occurs, the status register indicates the index number of the transaction that failed.




                                                             Page 135 of 206
                                                                                         Chapter 13: Protocol Configuration


13.5.1: Menu
    l   Edit > Copy All - Copies Scan List to clipboard in a tab delimited format suitable for pasting into an
        application like Microsoft Excel.
    l   Edit > Paste - Loads Scan List from clipboard. Pasted items are added to the scan list even if they are
        duplicates.
    l   View > Toggle All Name View - Expands Scan List such that each point and corresponding local name is
        displayed.
    l   Sort Scan List by different criteria. The firmware will scan the devices based on the order they are
        displayed or sorted. There are four ways to sort the scan list:
           a. By Local Address – Sorts the list by local register address in increasing order.
            b.   By Target Address – Sorts the list by target register address in increasing order.
            c.   By Device Name – Sorts by device name, then target address.
            d.   Interleave Devices – This sort evenly distributes request among the different devices. Instead of
                 requesting 100 blocks from device A, then 100 blocks from device B, one requests is sent to
                 device A, then one request is sent to device B until all the data has been requested. This is useful
                 for devices that may have a timeout timer because the time between each scan for a particular
                 device is minimized. This sorting options usually doesn’t affect performance.


13.5.2: Buttons
    l   Add - Opens the Data Mapping dialog to add a new entry to the Scan List.
    l   Delete - Removes selected entry from Scan List
    l   Config - Opens the Data Mapping dialog for the currently selected entry. This can also be accomplished by
        double-clicking an entry.
    l   Edit Names - Invokes the Edit Names dialog for the currently selected entry. The Edit Names dialog
        provides the ability to create OCS program names for each point in the transaction.


13.5.3: Display Control
Filter by Device - Limits displayed entries to only those assigned to the indicated device. To show all entries select –All--.




                                                             Page 136 of 206
                                                                                  Chapter 13: Protocol Configuration


13.5.4: Data Mapping Configuration (Scan List Entry)




Target
   l     Device Name - Selects the target device (by tag name) to use for this transaction. Only those device
         entries previously created from the Device Config menu are available.
   l     Device Register - Specifies the target device’s register to use for this transaction. This designation is
         target-specific. The configuration menu displays an error if a specified address is unacceptable. Generally,
         the data type of the local (OCS ) register must match the data type of the device register.
   l     The Right Arrow button - Displays protocol device driver specific help for the target addressing. Note that
         some devices can require register addresses that exist on 8-bit, 16-bit or 32-bit boundaries.
   l     Local Register - Specifies the local (OCS ) register that is the source or destination for the transaction.
   l     Local Name [Optional] - Optionally allows selection of a OCS register by name <or> creation of a name
         for a register already selected by direct reference. Created names can be used thereafter to specify the
         local (OCS ) register in ladder or graphics address fields.
   l     32-Bit Access - Allows two local (OCS ) 16-bit registers to be treated as a single 32-bit value. For
         example, if the value in either 16-bit register is modified, both registers are written to the device. Device-
         specific, 32-bit word swapping options also apply to this designation. Since the transaction is treated as a
         32-bit access, the length is generally limited to 16. Note that some protocols can disable this feature.




                                                        Page 137 of 206
                                                                                        Chapter 13: Protocol Configuration

    l   Length
          a. Specifies the number of consecutive device registers that are transferred in this transaction. Note
               that some protocols can limit the length that can be transferred. However, typically the length is
               limited to 32. The configuration menu displays an error if a specified length is unacceptable.
            b.   If allowed, specifying a length greater than one (multiple consecutive register transfers
                 per transaction) is more efficient than creating a single transaction for each register. This
                 grouping of registers per transaction can significantly reduce the transaction scan time; however,
                 update types that include writing on a polled basis require additional consideration.
            c.   On Read/Write and Read/Write/Init update types, the write transaction only occurs when the
                 local (OCS ) register value changes. If the length is greater than 1 for Read/Write and
                 Read/Write/Init types, only the local register(s) that change in value are written. More specifically,
                 only one write transaction occurs per scan per mapping entry for the register or consecutive sub-
                 group of local registers that changed in value. Depending on the protocol, the number of points
                 written with that write transaction are limited either to one or the number of consecutive points that
                 changed value.
            d.   Therefore, if several local registers (specified in a single mapping entry) change in value
                 prior to a transaction scan, it takes SEVERAL transaction scans to complete all the write
                 operations. Furthermore, all write operations are completed before a read operation is
                 scheduled.
            e.   For Manual Update (transaction) scans (i.e. dialup modem), it is recommended that all
                 Read/Write Scan List entry lengths be limited to 1.

Update Type
This field specifies the direction and what triggers the transfer of data between the OCS and target device for a mapping entry.
    l    Polled Read - On every transaction scan, a read-only target device register(s) transaction occurs.
    l   Polled Read/Write
          a. On every transaction scan, a read target device register transaction occurs unless a local register
               value has changed. The write transaction only updates those local registers that have changed in
               value. If several non-consecutive local registers (contained in a single mapping entry) change
               value between transaction scans, it takes several consecutive transaction scans to write each
               changed register.
            b.   When the OCS is placed in RUN mode, the initial action for this mapping type is a read
                 target register transaction. This transaction initializes the local (OCS ) register(s) to match that
                 of the remote device register(s). Thereafter, any change to the corresponding OCS register(s)
                 triggers a write operation to the remote device.




                                                            Page 138 of 206
                                                                               Chapter 13: Protocol Configuration

l   Polled Read/Write/Init
      a. On every transaction scan, a read target device register transaction occurs unless a local register
           value has changed. The write transaction only updates those local registers that have changed in
           value. If several non-consecutive local registers (contained in a single mapping entry) change
           value between transaction scans, it takes several consecutive scans to write each changed
           register.
       b.   On every transaction scan, a read target device register transaction occurs unless a local register
            value has changed. The write transaction only updates those local registers that have changed in
            value. If several non-consecutive local registers (contained in a single mapping entry) change
            value between transaction scans, it takes several consecutive scans to write each changed
            register.
       c.   When the OCS is placed in RUN mode, the initial action for this mapping type is a write
            target register transaction. This transaction initializes the target device register(s) to match that
            of the local (OCS ) register(s). Thereafter, any change to the corresponding OCS register(s)
            triggers a write operation to the remote device.
       d.   The initial write transaction does not occur until after the first logic scan of the OCS . This allows
            registers to be initialized locally before Writing to the target device register(s).
l   Triggered Read - A read transaction is triggered by a high level on a separately designated OCS (binary)
    trigger register. Once the read transaction is complete (or the device is offline), the OCS trigger register is
    cleared by the OCS . This update type can be used for occasional data accesses such as retrieving trend
    data. Note that this operation increases the associated transaction scan time and can cause the Update
    Interval Exceeded Counter to increment on a tightly adjusted update interval.
l   Triggered Write - A write transaction is triggered by a high level on a separately designated OCS (binary)
    trigger register. Once the write transaction is complete (or the device is offline) the OCS trigger register is
    cleared by OCS . This function can be used for occasional data accesses such as sending recipe data.
    Note that this operation increases the associated transaction scan time and can cause the Update Interval
    Time Exceeded Counter to increment on a tightly adjusted update interval.




                                                    Page 139 of 206
User Interface




      Page 140
                                                                                           Chapter 14: User Interface



Chapter 14: User Interface
    14.1: Screen Specifications                                                                                              141
    14.2: Displaying and Entering Data                                                                                       142
    14.3: Screen Navigation                                                                                                  144
    14.4: Ladder-Based Screen Navigation                                                                                     145
    14.5: Beeper Acknowledgment                                                                                              145
    14.6: Touch (Slip) Sensitivity                                                                                           146
    14.7: Alarms                                                                                                             146
    14.8: Removable Media                                                                                                    148
    14.9: Screen Saver                                                                                                       149
    14.10: Screen Brightness                                                                                                 149
    14.11: Touch Screen Pressure                                                                                             150
This chapter presents the user interface (or operator view) of the X5/X5 Prime and some of the model specific characteristics of
the X5/X5 Prime as compared to the rest of the OCS line. This chapter does NOT cover building screens or using the CSCAPE
graphics editor. For instructions on creating screens and using the graphics editor, refer to the Graphics Editor Help File in
CSCAPE.

14.1: Screen Specifications
 Display Type                           Resistive 4.3” Touchscreen (450 cd/m² (nits)
 Resolution                             WVGA (480x272)
 Color                                  65K Color
 Screen Memory                          22MB
 User-Programmable Screens              1023
 Backlight                              White LED




                                                           Page 141 of 206
                                                                                             Chapter 14: User Interface


14.2: Displaying and Entering Data




Multiple objects are provided for displaying data such as virtual panel lights, push buttons, numeric value displays, bar graphs,
meters, graphs and animated bitmaps. On the X5/X5 Prime, these graphical objects (through ladder manipulation of attribute
bits) can change color, flash, or change visibility to attract operator attention.
On objects that accept user input, the input is provided by touching the object or alternately changing an OCS register (i.e.
function key registers). Objects that allow input generally have a raised 3D appearance. An exception is the binary type objects,
such as buttons, which are shown in a depressed 3D appearance when in the ON state. Objects that normally accept touch input
may be disabled through program control (through ladder manipulation of an attribute bit). If an object is disabled, the object’s
representation changes to a 2D appearance.
On objects that represent non-discrete information, more action may be required beyond that of simply touching the object. For
example, the slider object requires the operator to touch and slide the control in the direction desired. Alternately, alpha-numeric
entry objects invoke a pop-up alpha-numeric keypad for additional user input. The alpha-numeric keypad is discussed below.

 NOTE: If the numeric entry object displays >>>>>>>, the value is too big to display in the field or is above the maximum for an
 editable field. Likewise, if the numeric entry object displays <<<<<<< in a numeric field, the value is too small to display or is
 below the minimum for an editable field.




                                                            Page 142 of 206
                                                                                             Chapter 14: User Interface


14.2.1: Alpha-Numeric Keypad
To allow entry of a specific number or text, several of the input objects invoke a pop-up alpha-numeric keypad when the object is
touched. An example of the alpha-numeric keypad invoked from a numeric input object is shown below. Once invoked, the
operator may touch the appropriate keys to enter a specific value. When entering a value, the alpha-numeric keypad is in one of
two modes [new-value or edit-value].
New-Value Mode - Generally, when the alpha-numeric keypad is first invoked, it is placed in new-value mode. Initially, the
alpha-numeric keypad displays the current value with all the digits being highlighted. Once the first digit is entered, the current
value is erased from the display and the new digit is placed in the first location. Thereafter, no digits are highlighted, and new
digits are added to the rightmost position while the other digits are shifted left.
Edit-Value Mode - Edit-value mode may be entered from the initial new-value mode by pressing either the left or right arrow key
before any digit key is pressed. The result will be a single character highlighted. The user may then either touch a key to change
the digit at the selected position or the up and down arrows may be used to add or subtract (respectively) from the selected digit.
The user may then use the left or right arrow keys to select a new position.




Once the desired value is entered, pressing the Enter key moves that value into the object (and the corresponding OCS register)
and the alpha-numeric keypad disappears. Alternately, pressing the ESC key any time before the Enter key cancels the
operation, leaves the objects current value unchanged, and the alpha-numeric keypad disappears.

 NOTE: Each numeric entry object has a configured minimum and maximum value. If the operator enters a value outside of
 the configured range, the new value is ignored when Enter is pressed and the current object value is NOT changed.

Since the alpha-numeric keypad services several different graphical objects, certain keys on the alpha-numeric keypad may be
disabled (grayed) when the keypad is invoked for certain objects. The following describes the alpha-numeric keypad variation
based on object.
Numeric Object - When editing a numeric value, the [+/-] or the [.] key are disabled (grayed) if the object is NOT configured for
floating-point value or a signed value.
Password Object - When editing a password value, the arrow keys, [+/-], and the [.] keys are disabled. Additionally, overwrite
mode is disabled. When entering digits, the pop-up keypad hides the value by displaying ‘*’ alternately for each digit.
ASCII Object - When editing an ASCII value, an ASCII keypad is displayed as shown Figure 14.2. The ASCII keypad has three
(3) modes: numeric, symbols, and alpha. In Alpha mode, the Caps Lock button may be pressed to access capital letters. When
you first enter this editor typing, a character will overwrite the entire old string and start a new entry. You may press the back
space arrow to delete the previous character. Pressing Enter will save the entry; pressing ESC will cancel the edit and return the
string to the previous value.




                                                            Page 143 of 206
                                                                                           Chapter 14: User Interface

Text Table Object - When editing a Text Table Object, all the keys except the Up and Down arrow keys are grayed and
disabled. The next text selection is made by pressing either the Up or Down arrow.
Time/Date Object - When editing a Time/Date Table Object, all the keys except the Up, Down, Left and Right arrow keys are
grayed and disabled. The specific field (i.e. hour or minutes) is selected using the Left and Right arrows. The value in the
selected field is changed by pressing either the Up or Down arrow.

14.3: Screen Navigation
To allow the operator to change screens, a Screen Jump Object is generally used. This object may be visually represented as a
3-D button (responding to touch) or remain invisible and logically tied to an OCS register. An optional system ICON may be
configured for display along with the legend, which aids in identifying the object as one that causes a screen change.




Screen jumps can also be triggered on other keys or based on control logic for more advanced applications. To allow the
operator to change screens, a screen jump object is generally used. This object may be visually represented as a button
(responding to touch) or remain invisible and logically tied to an OCS register. An optional system ICON may be configured for
display along with the legend, which aids in identifying the object as one that causes a screen change.




                                                           Page 144 of 206
                                                                                             Chapter 14: User Interface


14.4: Ladder-Based Screen Navigation
Ladder logic can use several techniques to control screen navigation. Coils can be tied to %D registers to make them screen
coils. These coils have two modes: switch and alarm. If the ladder program energizes an alarm display coil, the screen
associated with this coil is displayed and overrides the normal user screens. This is designed to show alarm conditions or to
display other ladder-detected events. When the text coil is de-energized, the previous screen that was being viewed before the
alarm is returned.
The switch display coil switches to the associated screen when it is energized. Once it is de-energized, the screen remains until
it is switched by the user or ladder.




There is also a system register that can be used to for control-based screen navigation. %SR1 can be read to determine the
current screen or written to change the current screen. Refer to the online help file in Cscape for more information on control-
based screen navigation.

14.5: Beeper Acknowledgment
The X5/X5 Prime contains an internal beeper that provides an audible acknowledgment when an operator touches a graphic
object that accepts touch input. When the graphic object is enabled, a short 5ms tone is emitted. When the graphic object is
disabled, a longer 100ms tone is emitted to announce that the graphical object is not currently accepting the touch input.
If beep acknowledgment is not desired, the beeper function can be disabled from the System Menu.




                                                            Page 145 of 206
                                                                                                Chapter 14: User Interface


14.6: Touch (Slip) Sensitivity
Touch slip sensitivity is preset to meet most applications; however, adjustment is available to reduce the sensitivity for touch
release. That is, once a graphical object (button) is touched and held by a finger, the default touch slip sensitivity allows for a
slight slip of the finger on the graphical object before the X5/X5 Prime assumes touch been released (equates to approximately a
quarter inch of movement with a stylus).
In some applications (such as jog buttons) where the operator is pushing a button for a period of time, the amount of slip while
holding a button pressed may exceed the default sensitivity. To increase the amount of tolerable slip and prevent false releases
of the button, the X5/X5 Prime allows adjustment of the allowable slide up to 5x the default value.
To enable the touch (slip) sensitivity, first an OCS data register must be allocated through the Graphics Editor Configuration
menu for Display Settings. Once a Touch Sensitivity register is assigned, that register may be modified [range = 1 (Low) to 5
(High)] to the desired slide amount. If a value outside the valid range is entered in the touch sensitivity register, it is ignored, and
the last valid value is used.

14.7: Alarms
Alarm presentation to the operator is highly configurable and beyond the scope of this document to describe fully. For more
information, refer to the graphics editor help file in Cscape. This section presents a typical configuration thereby providing an
introductory description on what the operator should expect.
The alarm object is generally used to enunciate alarms to the operator. While the display characteristics of this object is
configurable, it is generally displayed as a button that changes colors to indicate the highest state of the alarm(s) in the alarm
group it is monitoring. The following indicates the priority of the alarm states and the default colors associated with these states.

 NOTE: Alarm limit is 64 alarms.

                             Highest        (Red)             Unacknowledged Alarms Exist
                             -              (Yellow)          Acknowledged Alarms Exist
                             Lowest         (Green)           No Alarms Exist




To view, acknowledge and/or clear alarms, the operator must access the alarm viewer. This is accomplished by touching an
(enabled) alarm object. When accessed, the alarm viewer is displayed as pop-up alarm viewer dialog.




                                                              Page 146 of 206
                                                                                              Chapter 14: User Interface


14.7.1: Alarm Viewer
To view, acknowledge and/or clear alarms, the operator must access the alarm viewer. This is accomplished by touching an
(enabled) alarm object. When accessed, the alarm viewer is displayed as pop-up alarm viewer dialog similar to that shown in the
figure below.




The currently selected entry is indicated by a yellow highlight which can be moved up or down by touching the arrow buttons or
by directly touching an entry. If more entries exist than can fit on the page, a scroll bar is displayed on the right side that also
indicates the current relative position.
The current state of the displayed alarm is indicated by its color and optionally by an abbreviated indicator after the date/time
stamp (ALM, ACK, RTN). The operator can acknowledge an alarm by selecting it from the list and touching the ACK button. The
operator can also clear an alarm if that function is enabled in the alarm object. If not enabled, the Clear buttons are grayed and
do not respond to touch. Once view operations are complete, simply touch the Esc button to remove the pop-up alarm viewer.

 NOTE: OCS registers %SR181 and %SR182 are available for ladder use, which indicate presence of unacknowledged or
 acknowledged alarm (respectively). The screen designer may implement these registers to switch screens or activate the
 beeper to attract the operator’s attention.




                                                             Page 147 of 206
                                                                                               Chapter 14: User Interface


14.8: Removable Media
The Removable Media Object is generally used to inform the operator on the current state of the removable media device and
allow access to its file structure. The Removable Media Object is displayed as a button that changes colors to indicate the
current state of the removable media device. The following indicates the device states and the default colors associated with
these states.
                             Highest        (Red)            Device Error
                             -              (Yellow)         Device Full (threshold adjustable)
                             Lowest         (Green)          Device OK




To view and perform file operations, the operator must access the removable viewer. This is accomplished by either touching an
(enabled) removable media object or through the System Menu. When accessed, the removable media viewer is displayed as
pop-up removable media dialog.

 NOTE: The Removable Media Object can be configured to open the removable media viewer at a certain directory complete
 with restrictions on transversing back up the file path. This may be used to restrict operator access to non-critical files.

14.8.1: Removeable Media Viewer




The currently selected entry is indicated by a yellow highlight which can be moved up or down by touching the arrow buttons or
by directly touching an entry. If more entries exist than can fit on the page, a scroll bar is displayed on the right side that also
indicates the current relative position.
File operations are accomplished by pressing the appropriate button at the bottom of the Removable Media Viewer. The
configuration of the removable media object that invokes the Removable Media Viewer defines what buttons are enabled and
available to the user. A button is grayed and does not respond to touch if configured as disabled.




                                                             Page 148 of 206
                                                                                              Chapter 14: User Interface


14.8.2: Safe Removal of Removeable Media

The       (Enter) button (if enabled) performs certain operations based on the selected file’s type:

 ..                    Change display to parent directory
 <DIR>                 Change display to child directory
 bmp, jpeg             Display bitmap (if compatible format)
 pgm                   Load application (if compatible model and version)
Alternately, the (enter) button can be configured to simply load the ASCII representation of the file path (including the file name)
to a group of OCS registers. That pathname can then be used by ladder for opening and manipulating that file.
Once view operations are complete, simply touch the Esc button to remove the pop-up removable media viewer.
If the removable media is used in an application, the Removable Media Device requires changing by the operator, and the
application is attempting to write to the removable media when it is removed, the screen designer should create objects that
allow the operator to temporarily halt access to the removable media. This prevents corruption to the file system if the removable
media is removed during a file-write sequence. The graphic objects should set OCS register %SR174.1 (when requesting the
card be removed) and provide an indicator based on OCS register %SR174.2 (which indicates that it is safe to remove the
removable media).




14.9: Screen Saver
The X5/X5 Prime screen backlight life is typically five (5) years when in continuous use. If the application does not require
interaction with the X5/X5 Prime for long periods of time, the backlight life can be extended by using the screen saver function.
When enabled through the System Menu, the backlight is shut off (screen goes black) after a specified time of no touch activity
on the screen. When the screen saver shuts off the backlight, any operator touch on the screen or function keys reactivates the
backlight.

 NOTE: When the screen saver is active (backlight shut off), any initial touch activity on the screen (or function key) to
 reactivate the backlight is otherwise ignored by the X5/X5 Prime. Any additional touch activity is also ignored by the X5/X5
 Prime for approximately one second thereafter.

It is possible for the application to temporarily disable the screen saver by generating a positive transition to %SR57.16 (coil
only) at a rate faster than the screen saver timeout value. This may be desired while waiting for alarm acknowledgement.

14.10: Screen Brightness
The X5/X5 Prime provides a feature that allows screen dimming for night operation. To enable this feature, the application must
access and control system register %SR57 (Display Backlight Brightness). Screen brightness is continuously variable by driving
%SR57 through the range of 100 (full bright) to 0 (full off). It is left to the screen designer on if and how to present a Screen
Brightness control to the user.

 NOTE: The backlight life can be extended by dimming or powering off the backlight.




                                                             Page 149 of 206
                                                                                         Chapter 14: User Interface


14.11: Touch Screen Pressure
The Horner XL series OCS controllers have a resistive touch screen that allows mechanically detecting touch events. The
resistive touch screen works by measuring the resistance between two layers of conductive film.




 NOTE: Touch creates contact between resistive circuit layers, closing a switch.

With a unique change to the touch monitoring firmware user can measure the pressure being exerted on the touch screen. This
feature has been added in some Horner XL series controllers. This allows the OCS programmer to be notified of the touch
pressure and it can configure the pressure required to accept a touch event.
There are two system registers that provide this touch feature:
    n   %SR9 (I/O Name - TCH_PRESSURE) - Records the highest-pressure level of the last touch on the screen
        that exceeds the threshold value set in %SR10. This is a range of 0 to 3000. Zero (0) indicates no pressure
        and 3000 is the maximum amount of pressure that can be measured.
    n   %SR10 (I/O Name - TCH_PRESSURE_TSH) - This register sets the pressure threshold to indicate a
        touch. A value of 200 is typically the lightest touch, 600 is moderate and 1000+ is a heavy touch.
These new features allow customizing the feel of the touch screen and can be used to add unique user interface features such
as having different operations depending on the force of the touch.




                                                          Page 150 of 206
Video Object




     Page 151
                                                                                            Chapter 15: Video Object



Chapter 15: Video Object
    15.1: Video Object Overview                                                                                              152
    15.2: Opening Video Object in Cscape                                                                                     153
    15.3: Video Properties Configuration                                                                                     154
    15.4: Video Object Performance                                                                                           156
    15.5: Web Cameras                                                                                                        156



15.1: Video Object Overview
The Video Object feature allows two options for video type: Stream and Playback. The Video Object trigger is used to start, stop,
and pause video, and the System Register provides the status of the video object, which supports various resolutions and
frames per second.




                                           Specifications of Video Properties
                                       4 channels supported through USB hub
        Streaming Channels
                                       1 channel can be viewed at a time
         Playback Formats              .mp4, .mov, .mpg, .wmv
             Resolution                320x240 (QVGA)
        Frames per Seconds             10, 15, 20, 24, 30 & MAX_FPS




                                                           Page 152 of 206
                                                                                      Chapter 15: Video Object


15.2: Opening Video Object in Cscape
 NOTE: For Cscape 10 please refer to the Help File.

In Cscape, select the OCS and model number by selecting Controller > Hardware Configuration from the toolbar.
   1.   Open the Graphics Editor by selecting the “T” button from the toolbar.




   2.   In the Graphics Editor, select the video button from the toolbar.




   3.   Click on the grid.




   4.   Then double click on the icon in the middle to open the Video Properties dialog.




                                                       Page 153 of 206
                                                                                             Chapter 15: Video Object


15.3: Video Properties Configuration
15.3.1: Video Type




There are two options for video type: Stream and Playback.

Stream – This option can be selected to view live video from a web cam. Four channels are supported through the USB hub.
Only one channel can be viewed at a time. Enter Channel Number directly or through registers in the Enter Channel No field.

Playback – This option can be selected to view videos that are stored in Removable Media on the controller. Videos present in
both A (microSD) and B (USB) drives are supported and can be viewed. Supported formats including .mp4, .mov, .mpg, and
.wmv, can be played.

Select Playback and enter video name in the Enter Target Path field either directly or through registers.

For example: Test1.mp4 (from microSD) or B:\Test2.mp4 (from USB).




                                                           Page 154 of 206
                                                                                              Chapter 15: Video Object


15.3.2: Control




Trigger - The video control trigger is used to start, stop and pause video. Video trigger is done by bit level addressing. The
trigger reserves eight (8) bits and uses the first two (2) bits.

 NOTE: The least significant bit is Bit 1.

                                                         High = Start
                                      Bit 1
                                                         Low = Stop
                                                         High = Pause
                                      Bit 2
                                                         Low = Play


System Bit - The Video Control System Bit provides the status of the Video Object. The status word is 16-bits and should be
viewed in hexadecimal format.
                              0x0001              Video is currently playing
                              0x0002              Video is paused
                              0x00010             Channel number cannot be greater than 4
                              0x0020              File not present or corrupted
                              0x0040              Frame per second not supported or not compatible




                                                             Page 155 of 206
                                                                                          Chapter 15: Video Object


15.3.3: Configuring Display Properties




                           Resolution Options                    320x240 (QVGA)
                           Frames per Seconds                    10, 15, 20, 24, 30 & MAX_FPS



15.4: Video Object Performance
   1.   When Video Object is active, navigating to System Menu or any popup window, causes Video Object to be
        inactive.
   2.   Video Object can be made active in both Idle and Run modes.
   3.   If Frames Per Second of the configured video is different from the video that is configured in Cscape,
        frames can be missed during the video.



15.5: Web Cameras
If multiple web cameras are directly connected to the OCS, then only one web cam will be considered. If user needs to connect
multiple web cams, USB hub needs to be used. A maximum of four channels (web cameras) are supported.




                                                          Page 156 of 206
Removable Media




      Page 157
                                                                                        Chapter 16: Removable Media



Chapter 16: Removable Media
    16.1: microSD Cards                                                                                                    158
    16.2: Using the Removable Media Manager                                                                                159
    16.3: Log Data                                                                                                         160
    16.4: View and Capture Screens                                                                                         160
    16.5: Removable Media Object                                                                                           160
    16.6: Function Blocks in Cscape                                                                                        161
    16.7: Filenames                                                                                                        162
    16.8: System Registers used with RM                                                                                    162


All Horner controllers models provide a Removable Media slot, labeled Memory Card, which supports standard microSD flash
memory cards. microSD cards can be used to save and load applications, to capture graphics screens, and to log data for later
retrieval.




16.1: microSD Cards
MicroSD cards(Memory Cards) with up to 32GB of flash memory, are compatible with the Horner controller Memory Card slot.
The Memory Card slot is equipped with a “push-in, push-out” connector and a microSD card can be safely inserted into the
Memory Card slot whether the Horner controller power is On or Off.
    n  To install a microSD card: Align its 8-pin gold edge connector down, facing the front of the Horner controller unit as
       shown above; then carefully push it all the way into the Memory Card slot. Ensure that it clicks into place.
    n   To remove the microSD card: Push down on the top of the card gently to release the spring. The card pops up for
        removal.




                                                          Page 158 of 206
                                                                                            Chapter 16: Removable Media


16.1.1: microSD File System
The microSD Memory Card slot uses the PC-compatible FAT32 File System. This means that a PC, with a microSD-compatible
card reader, can read files that have been written by the Horner controller and can write files that can be read by the Horner
controller.
However, the Horner controller does not support long filenames, but instead implements the 8.3 filename format. This means
that all file and directory names must consist of up to eight (8) characters, followed by an optional dot, and an optional extension
with up to three (3) characters.
Directories and sub-directories can be nested up to 16 levels deep as long as each path name string does not exceed 147
characters.



16.2: Using the Removable Media Manager
The Removable Media Manager is an interactive Horner controller screen that performs the following functions:
   a. Display total capacity, and available space in kilobytes
   b.    Browse file and directory lists
    c.   Delete files and directories
   d.    Format a microSD card
   e.    Load and save application programs
    f.   View screen capture bitmaps
The Removable Media Manager can be accessed via the System Menu or by using Cscape to place a Removable Media
Manager object on an application graphics screen.




                                                             Page 159 of 206
                                                                                           Chapter 16: Removable Media


16.3: Log Data
Using Read and Write Removable Media function blocks, an application ladder program can read and write Horner controller
register data in the form of comma-delimited files, with a .csv extension. These files are compatible with standard database and
spreadsheet PC programs. In addition, an application ladder program can use Rename and Delete Removable Media function
blocks to rename and delete files.



16.4: View and Capture Screens
The Horner controller File System uses bitmap files with the .BMP extension or JPEG files with the .JPG extension to store
Horner controller graphic screen captures.
To view a captured Horner controller screen, use the Removable Media Manager to find and highlight the desire .BMP or .JPG

file, and then press Enter.
To capture an Horner controller screen, turning on the assigned Screen Capture Control Register will capture the current
Horner controller graphics screen and write it to the microSD card using the assigned Screen Capture Filename.

Before capturing an Horner controller screen, Cscape must first be used to assign a Screen Capture Control Register and
Filename in the application. To do this, first open the Graphics Editor by selecting the View > Edit Screens item on the Cscape
Screens menu. Next, select the Screen Capture item of the Graphics Editor Config menu and then enter a Control Register
and Filename.

To capture an Horner controller screen, turning On the assigned Screen Capture Control Register will capture the current
Hornercontroller graphics screen and write it to the microSD card using the assigned Screen Capture Filename. To view a
captured Horner controller screen, use the Removable Media Manager to find and highlight the desired .BMP or .JPG file, and
then press Enter.



16.5: Removable Media Object
The configuration of the Removable Media Object that loads the Removable Media Viewer defines what buttons are enabled
and available to the user.

The       (Enter) button (if enabled) performs certain operations based on the selected file’s type:

 ..              Change display to parent directory
 <DIR>           Change display to child directory
 pgm             Load application (if compatible model and version)
Alternately, by checking the ‘Write Selected Filename’ option, the RM Manager object will load the currently displayed path and
filename into a block of registers for use with other Removable Media functions. The register block is assigned in the ‘File Select’
config found in the Config menu of the graphic/screen editor.

Once view operations are complete, simply touch the Esc button to remove the pop-up removable media viewer.




                                                            Page 160 of 206
                                                                                          Chapter 16: Removable Media


16.6: Function Blocks in Cscape
 NOTE: For detailed information regarding RM function blocks and parameters, refer to the Help File in Cscape Software.
 Refer to ‘USB flash Media support for RM Functions’ for USB flash drive access details.

The following RM functional blocks are available in Cscape Software. These function blocks will reference:
   a.   microSD when filename is prefixed with ‘A:’ or nothing
   b.   USB A flash drive when filename is prefixed with ‘B:’
                                  Allows reading of a comma-separated value file from the microSD interface into the controller
 Read RM csv
                                  register space.
                                  Allows writing of a comma-separated value file to the microSD interface from the controller
 Write RM csv
                                  register space.
 Rename RM csv                    Allows renaming a file on the RM card. The data in the file is not changed.
 Delete RM csv                    Allows deleting a file on the RM card
 Copy RM csv                      Allows copying a file on the RM card. The data in the file is not changed.



16.6.1: Program Features
   a.   Datalog Configuration - This feature allows the controller to periodically log register values to Removable
        Media. The register data is stored in .csv (comma separated value) format, which is compatible with 3rd
        party PC applications, such as Microsoft Excel.
   b.   Report Editor - This feature allows the OCS to be configured to generate text printouts which incorporate
        data from the registers embedded in the text. The reports can be printed using a serial interface printer
        through any of the serial ports of the OCS or can be saved on the removable media of the device.
   c.   Recipes Editor - Recipes allow the user to send or update multiple registers simultaneously.


16.6.2: Graphic/Screen Editor
   a.   Trends - The historic support feature in the trend object utilizes Removable Media.
   b.   Removable Media - This is a graphic object used to access files and functions pertaining to Removable
        Media.
   c.   Recipes - This is a graphic object that is used in conjunction with the recipe editor which is mentioned
        above.




                                                           Page 161 of 206
                                                                                          Chapter 16: Removable Media


16.6.3: Additional Configuration
   a.   Alarms - Alarm data can be logged to a .csv file stored on Removable Media.
   b.   Screen Capture - The screen capture function allows a bitmap or jpeg image of the displayed OCS screen
        to be written to the Removable Media card.
   c.   Filename Counters - The filename counters can be accessed wherever Removable Media functions
        require a path name. A typical application is the auto-incrementing of a file name when doing screen
        captures.
   d.   File Select - File Select is used to specify the register block that is used with the Removable Media
        Manager object ‘Write Selected Filename’ option.



16.7: Filenames
The RM function blocks support the flash with a Windows standard FAT-16 file system. All names must be limited to the “8.3”
format where the filename contains eight characters a period then a three-character extension.
The entire filename including any path must be less than or equal to 147 characters.
When creating filenames and directories, it is sometimes desirable to include parts of the current date or time. There are six
special symbols that can be entered into a filename that are replaced by the OCS with current time and date information.
                                                Filename Special Symbols
                      Symbol                            Description                              Example
                         $Y       Substitutes the current 2-digit year                       2015 = 15
                         $M       Substitutes the current month with a 2-digit code          March = 03
                         $D       Substitutes the current day                                22nd = 22
                         $h       Substitutes the current hour in 24-hour format             5 pm = 17
                         $m       Substitutes the current minute                             45 = 45
                         $s       Substitutes the current second                             34 = 34

 NOTE: All the symbols start with the dollar sign ($) character. Date symbols are in upper case, time symbols are in lower
 case.

The following are examples of the substituted time/date filenames:
Current date and time: March 1, 2015 5:45:34 PM
Filename: Data$M$D.csv = Data0301.csv
Filename: Year$Y\Month$M\aa$D_$h.csv = Year15\Month03\aa01_17.csv
Filename: Month_$M\Day_$D\$h_$m_$s.csv = Month_03\Day_01\17_45_34.csv



16.8: System Registers used with RM
%SR174 – Removable Media Protect. Write a one (1) to %SR174 to prohibit read/write access to the removable media card.
Write a zero (0) to allow access.
%SR175 Status – This shows the current status of the RM interface.
%SR176 Free Space – This 32-bit register shows the free space on the RM card in bytes.
%SR178 Card Capacity – This 32-bit register shows the total card capacity in kilobytes.
Possible status values are shown in the table:
                                                      RM Status Values
                           0     RM interface OK
                           1     Card present but unknown format



                                                           Page 162 of 206
                                                 Chapter 16: Removable Media


                       RM Status Values
2   No card in slot
3   Card present, but not supported
4   Card swapped before operation was complete
5   Unknown error




                            Page 163 of 206
Clone Unit




    Page 164
                                                                                            Chapter 17: Clone Unit



Chapter 17: Clone Unit
    17.1: Make Clone                                                                                                       165
    17.2: Load Clone                                                                                                       168


"Clone Unit" feature allows the user to “clone” the OCS of the exact same model. This feature “clones” application program and
unit settings stored in the following:
    l   Prime Series: retentive memory
    l   Non-Prime controllers: battery-backed RAM of an OCS into the RM
This feature can be used for:
    l   Replacing an OCS by another unit of the same model.
    l   Duplicating or “clone” units without a PC.



17.1: Make Clone
The user needs to perform the following to Clone:
Step 1: The "Clone Unit" can be accessed by going to the "System Menu" of the OCS. A new menu “Clone Unit” has been added
at the end of the main System Menu as shown below:




                                                          Page 165 of 206
                                                                                               Chapter 17: Clone Unit

Step 2: Selecting “Make Clone” will open the following menu screen.




 NOTE: Free/Total – displays number of free and total bytes in Removable Media.

Make/Create Clone option enables user to duplicate/Clone application file, all unit settings and all register values. Selecting
Make Clone brings up the screen below for the user:




                                                            Page 166 of 206
                                                                                            Chapter 17: Clone Unit

After confirmation, the OCS will create two new files in the root directory of the Removable Media Drive as shown below.




AUTOLOAD.PGM                            Application file
CLONE.DAT                               File having all unit settings and register values

 NOTE: Make/Create clone operation automatically includes the security in \AUTOLOAD.PGM file for security enabled files.

Once the cloning is successful, OCS gives a message as below:




                                                            Page 167 of 206
                                                                                             Chapter 17: Clone Unit

Make/Create clone can also be triggered by setting %SR164.9 bit to “1” from Ladder program or graphics. Once the operation is
completed, this bit is made zero by the firmware. When Make Clone operation is triggered by this SR bit, it does not ask the user
for confirmation for making clone. The success / failure of the operation is also not notified on screen to the user.
In case of failure of “Make Clone” operation, %SR164.11 bit is set to “1” by the firmware and never reset.

 NOTE: Backup of registers in flash memory is not performed by Clone Feature. Refer to "Fail-Safe System for the XL and X
 Series" on page 171.




17.2: Load Clone
This option loads the application, all unit settings and register values from Removable media to the OCS memory (regardless of
the AutoLoad settings) and then resets the OCS for the settings to take effect.
User needs to perform the following to Load Clone:
Step 1: Select “Clone Unit” from main System Menu of OCS as shown below:




Step 2: Selecting “Clone Unit” menu will open the following menu screen. Select “Load Clone”.




Step 3: User needs to confirm Load Clone as shown below:




                                                           Page 168 of 206
                                                                                              Chapter 17: Clone Unit




Step 4: After confirmation, all unit settings and register values will be loaded from Removable media to the OCS memory
(regardless of AutoLoad settings) and then OCS resets for the settings to take effect.

 NOTE: For security enabled files, Load clone asks for password validation before loading the application.

Load Clone can also be triggered by setting %SR164.10 bit to “1” from Ladder program or graphics. Once the operation is
completed, this bit is made zero by the firmware. When Load Clone operation is triggered by this SR bit, it does not ask the user
for confirmation for loading clone. The success / failure of the operation is also not notified on screen to the user.
In case of failure of “Load Clone” operation, %SR164.12 bit is set to “1” by the firmware and never reset.




                                                            Page 169 of 206
Fail-Safe System




       Page 170
                                                                                    Chapter 18: Fail-Safe System for the XL and X
                                                                                                       Series



Chapter 18: Fail-Safe System for the XL and X Series
    18.1: For the XL & X Series                                                                                                   171
    18.2: Fail-Safe System Overview                                                                                               171
    18.3: Settings                                                                                                                172
    18.4: Backup/Restore Data                                                                                                     172
    18.5: Clear Backup Data                                                                                                       173
    18.6: AutoLoad                                                                                                                176
    18.7: AutoRun                                                                                                                 178

18.1: For the XL & X Series
The Fail-Safe System is a set of features that allow an application to continue running in the event of certain types of "soft"
failures. These "soft" failures include:
    n    Battery power loss
    n    Battery-Backed Register RAM or Application flash corruption due to, for example, an excessive EMI,
         Electromagnetic Interference, event.

18.2: Fail-Safe System Overview
The Fail-Safe System has the following capabilities:
     l   Manually backup the current retentive register settings into flash memory.
     l   Manually restore register settings from the values previously backed up in flash memory to retentive
         registers.
     l   Detect corrupted register settings at power-up and then automatically restore them from flash.
     l   Detect corrupted or empty application in flash memory at power-up and then automatically load the
         AUTOLOAD.PGM application file from Removable Media (Compact flash or microSD).
     l   If an automatic Register Restore or Application Load occurs, the OCS can automatically be placed in RUN
         mode.




                                                             Page 171 of 206
                                                                               Chapter 18: Fail-Safe System for the XL and X
                                                                                                  Series

The fail-safe system can be accessed from the System Menu of the OCS; see the Fail-Safe System on the main System Menu.




18.3: Settings
To use the Fail-Safe feature, the following steps are required:
   1.   From Cscape, create AUTOLOAD.PGM for the application program using Export to Removable Media.
   2.   Place the Removable Media with AUTOLOAD.PGM in the device.
   3.   Set the Enable AutoLoad option in the device to YES.
   4.   Set the Enable AutoRun option to YES if the controller needs to be placed in RUN mode automatically
        after automatic restore of data or AutoLoad operation.
   5.   Backup the current primary memory register contents in the onboard flash memory using the System Menu
        options.

18.4: Backup/Restore Data
Use this option to display a screen with the following four operations:
    n   Backup OCS Data
    n   Restore OCS Data
    n   Clear Backup Data
    n   Exit




                                                             Page 172 of 206
                                                                                     Chapter 18: Fail-Safe System for the XL and X
                                                                                                        Series


18.4.1: Backup OCS Data
When initiated, the user can manually copy register contents onto the an alternate section of onboard flash memory of the OCS.
This will have result in backing up all the registers and controller settings (Network ID, etc.) that would otherwise be lost due to a
memory failure. %SR164.4 is set to 1 when backup operation is performed.




18.4.2: Restore OCS Data
When initiated, the user can manually copy the backed-up data from the onboard flash to the primary memory.
A restore operation will be automatically initiated if 1) a backup has been previously created and 2) on power-up the primary
memory registers fail their check.

The following steps are required:
   1.    Place the controller in IDLE mode.
   2.    Copy data from onboard flash memory to OCS primary memory
   3.    Reset the Controller.
   4.    Put the controller in RUN mode if the AutoRun setting is ‘Yes’, or else it will remain in IDLE mode.




%SR164.3 is set to 1 only when an automatic restore operation is performed, not on a manual one. This bit is reset to the value
of “0” when a new backup is created.
Restoring of data can be manually performed by selecting RESTORE option from the Backup / Restore Data menu. This causes
the controller to reset.

18.5: Clear Backup Data
When initiated, the backup data is erased from the onboard flash and no backup will exist. %SR164.4 and %SR164.3 is reset to
0 when backed up data is erased.




                                                              Page 173 of 206
                                                            Chapter 18: Fail-Safe System for the XL and X
                                                                               Series




Exit: Goes back to the previous screen.




                                          Page 174 of 206
                                                                            Chapter 18: Fail-Safe System for the XL and X
                                                                                               Series

The OCS follows the following sequence in execution of Automatic Restore:




                                                        Page 175 of 206
                                                                                  Chapter 18: Fail-Safe System for the XL and X
                                                                                                     Series


18.6: AutoLoad
This System Menu option permits the user to specify whether the OCS automatically loads the application AUTOLOAD.PGM
located in Removable Media.
When the AutoLoad setting is enabled (set to YES), it can either be manually initiated or automatically initiated at power-up.
The automatic initiation will happen only in the following two cases:
    n   When there is no application program in the OCS and a valid AUTOLOAD.PGM is available in the
        removable media of the device.
    n   When the program residing in onboard memory is corrupted and a valid AUTOLOAD.PGM is available in
        the removable media of the device.
AutoLoad can be manually initiated when the SYS-F3 key is pressed (OCS can be in any of the following mode –
Idle/Run/DOIO). This also requires a valid AUTOLOAD.PGM to be present in the removable media of the device.
When the AutoLoad setting is not enabled (set to NO), OCS will be in IDLE mode and the application is not loaded.
If the AUTOLOAD.PGM is security enabled, the user will be prompted to enter the password before loading the application. The
application will be loaded from the Removable media only after getting the correct password.
%SR164.6 can be set to enable AutoLoad feature.




                              No = Does not load AUTOLOAD.PGM automatically when application program is absent or
                              corrupted.
 Enable AutoLoad
                              Yes = Loads AUTOLOAD.PGM file automatically from Removable Media when application
                              program is absent or corrupted.




                                                           Page 176 of 206
                                                                          Chapter 18: Fail-Safe System for the XL and X
                                                                                             Series

The OCS follows the following sequence in execution of AutoLoad:




                                                        Page 177 of 206
                                                                                 Chapter 18: Fail-Safe System for the XL and X
                                                                                                    Series


18.7: AutoRun
This System Menu option, when enabled (YES), allows the user to automatically place the OCS into RUN mode after the
AutoLoad operation or automatic Restore Data operation.
When the AutoRun setting is disabled (NO), the OCS remains in the IDLE mode after a Restore Data or AutoLoad operation.
%SR164.5 can be set by putting the system into RUN mode automatically, once an AutoLoad has been performed or an
Automatic Restore has occurred.
If for any reason the AutoLoad-Run (Loading the AUTOLOAD.PGM automatically and OCS put in RUN mode) sequence does
not succeed, a pop-up message box saying "AUTO-LOAD-RUN SEQUENCE FAILED" will be displayed. It will also show the
reason for its failure. On acknowledging this message box, the AutoLoad-Run sequence will be terminated, controller will return
to the first user-screen and will be placed in IDLE mode.




                              No = OCS will be in IDLE mode after AutoLoad or Automatic Restore.
 Enable AutoRun
                              Yes = OCS will automatically be placed into RUN mode after AutoLoad or Automatic Restore.
“Enable AutoLoad” displays the following options:
                              No = Does not load AUTOLOAD.PGM automatically when application program is absent or
                              corrupted.
 Enable AutoLoad
                              Yes = Loads AUTOLOAD.PGM file automatically from Removable Media when application
                              program is absent or corrupted.




                                                          Page 178 of 206
                                                                                    Chapter 18: Fail-Safe System for the XL Prime
                                                                                                        Series


Chapter 18: Fail-Safe System for the XL Prime Series
    18.1: For the XL Prime Series                                                                                                 179
    18.2: Fail-Safe System Overview                                                                                               179
    18.3: Settings                                                                                                                180
    18.4: Backup/Restore Data                                                                                                     180
    18.5: Clear Backup Data                                                                                                       182
    18.6: AutoLoad                                                                                                                184
    18.7: AutoRun                                                                                                                 186



18.1: For the XL Prime Series
The Fail-Safe System is a set of features that allow an application to continue running in the event of certain types of "soft"
failures, including but not limited to retentive register or application flash corruption due to an excessive Electromagnetic
Interference (EMI) event.



18.2: Fail-Safe System Overview
The Fail-Safe System has the following capabilities:
     l   Manually backup the current retentive register settings into flash memory.
     l   Manually restore register settings from the values previously backed up in flash memory to retentive
         registers.
     l   Detect corrupted register settings at power-up and then automatically restore them from flash.
     l   Detect corrupted or empty application in flash memory at power-up and then automatically load the
         AUTOLOAD.PGM application file from Removable Media (Compact flash or microSD).
     l   If an automatic Register Restore or Application Load occurs, the OCS can automatically be placed in RUN
         mode.

The Fail-Safe system can be accessed from the System Menu of the OCS; see the Fail-Safe System option on the main
System Menu.




                                                             Page 179 of 206
                                                                               Chapter 18: Fail-Safe System for the XL Prime
                                                                                                   Series

Selecting the Fail-Safe System menu opens the following submenu screen:




18.3: Settings
To use the Fail-Safe feature, the following steps are required:
   1.   From Cscape, create AUTOLOAD.PGM for the application program using Export to Removable Media.
   2.   Place the Removable Media with AUTOLOAD.PGM in the device.
   3.   Set the Enable AutoLoad option in the device to YES.
   4.   Set the Enable AutoRun option to YES if the controller needs to be placed in RUN mode automatically
        after automatic restore of data or AutoLoad operation.
   5.   Backup the current primary memoryregister contents in the onboard flash memory using the System Menu
        options.



18.4: Backup/Restore Data
Use this option to display a screen with the following four operations:
    n   Backup OCS Data
    n   Restore OCS Data
    n   Clear Backup Data
    n   Exit




                                                             Page 180 of 206
                                                                                    Chapter 18: Fail-Safe System for the XL Prime
                                                                                                        Series


18.4.1: Backup OCS Data
When initiated, the user can manually copy register contents onto the an alternate section of onboard flash memory of the OCS.
This will have result in backing up all the registers and controller settings (Network ID, etc.) that would otherwise be lost due to a
memory failure. %SR164.4 is set to 1 when backup operation is performed.




18.4.2: Restore OCS Data
When initiated, the user can manually copy the backed-up data from the onboard flash to the primary memory.
A restore operation will be automatically initiated if 1) a backup has been previously created and 2) on power-up the primary
memory registers fail their check.

The following steps are required:
   1.    Place the controller in IDLE mode.
   2.    Copy data from onboard flash memory to OCS primary memory
   3.    Reset the OCS.
   4.    Put the controller in RUN mode if the AutoRun setting is ‘Yes’, or else it will remain in IDLE mode.




%SR164.3 is set to 1 only when an automatic restore operation is performed, not on a manual one. This bit is reset to the value
of “0” when a new backup is created.
Restoring of data can be manually performed by selecting RESTORE option from the Backup / Restore Data menu. This causes
the controller to reset.




                                                              Page 181 of 206
                                                                              Chapter 18: Fail-Safe System for the XL Prime
                                                                                                  Series


18.5: Clear Backup Data
When initiated, the backup data is erased from the onboard flash and no backup will exist. %SR164.4 and %SR164.3 is reset to
0 when backed up data is erased.




Exit: Returns to the previous screen.




                                                         Page 182 of 206
                                                                            Chapter 18: Fail-Safe System for the XL Prime
                                                                                                Series

The OCS follows the following sequence in execution of Automatic Restore:




                                                        Page 183 of 206
                                                                                  Chapter 18: Fail-Safe System for the XL Prime
                                                                                                      Series


18.6: AutoLoad
This System Menu option permits the user to specify whether the OCS automatically loads the application AUTOLOAD.PGM
located in Removable Media.

When the AutoLoad setting is enabled (set to YES), it can either be manually initiated or automatically initiated at power-up.

The automatic initiation will happen only in the following two cases:
    n   When there is no application program in the OCS and a valid AUTOLOAD.PGM is available in the
        removable media of the device.
    n   When the program residing in onboard memory is corrupted and a valid AUTOLOAD.PGM is available in
        the removable media of the device.

AutoLoad can be manually initiated when the SYS-F3 key is pressed (OCS can be in any of the following mode –
Idle/Run/DOIO). This also requires a valid AUTOLOAD.PGM to be present in the removable media of the device.
When the AutoLoad setting is not enabled (set to NO), OCS will be in IDLE mode and the application is not loaded.

If the AUTOLOAD.PGM is security enabled, the user will be prompted to enter the password before loading the application. The
application will be loaded from the Removable media only after getting the correct password.
%SR164.6 can be set to enable AutoLoad feature.




                               No = Does not load AUTOLOAD.PGM automatically when application program is absent or
                               corrupted.
 Enable AutoLoad
                               Yes = Loads AUTOLOAD.PGM file automatically from Removable Media when application
                               program is absent or corrupted.


The OCS follows the following sequence in execution of AutoLoad:




                                                             Page 184 of 206
                  Chapter 18: Fail-Safe System for the XL Prime
                                      Series




Page 185 of 206
                                                                                Chapter 18: Fail-Safe System for the XL Prime
                                                                                                    Series


18.7: AutoRun
This System Menu option, when enabled (YES), allows the user to automatically place the OCS into RUN mode after the
AutoLoad operation or automatic Restore Data operation.
When the AutoRun setting is disabled (NO), the OCS remains in the IDLE mode after a Restore Data or AutoLoad operation.

%SR164.5 can be set by putting the system into RUN mode automatically, once an AutoLoad has been performed or an
Automatic Restore has occurred.

If for any reason the AutoLoad-Run (Loading the AUTOLOAD.PGM automatically and OCS put in RUN mode) sequence does
not succeed, a pop-up message box saying "AUTO-LOAD-RUN SEQUENCE FAILED" will be displayed. It will also show the
reason for its failure. On acknowledging this message box, the AutoLoad-Run sequence will be terminated, controller will return
to the first user-screen and will be placed in IDLE mode.




                              No = OCS will be in IDLE mode after AutoLoad or Automatic Restore.
 Enable AutoRun
                              Yes = OCS will automatically be placed into RUN mode after AutoLoad or Automatic Restore.
“Enable AutoLoad” displays the following options:
                              No = Does not load AUTOLOAD.PGM automatically when application program is absent or
                              corrupted.
 Enable AutoLoad
                              Yes = Loads AUTOLOAD.PGM file automatically from Removable Media when application
                              program is absent or corrupted.




                                                          Page 186 of 206
Modbus-TCP/UDP
Communications




      Page 187
                                                                                        Chapter 19: Modbus Communications



Chapter 19: Modbus Communications
    19.1: Modbus Slave Overview                                                                                                  188
    19.2: Modbus Master Overview                                                                                                 189
    19.3: Modbus Addressing Table                                                                                                190
For complete Modbus instructions, please refer to the Help file in Cscape.
Modbus (serial) is a popular, de-facto standard protocol that allows industrial devices from multiple manufacturers to easily
share data in real-time. For Modbus serial communications, the X5/X5 Prime can act as either a Master or a Slave.
Modbus protocol (serial) allows for one master and multiple slaves. The master always initiates the conversation by sending a
request to a particular slave. Only the addressed slave will send a response when the request is completed. Should the slave be
unable to complete the request, it returns the appropriate error response. Should the slave be unable to respond, the master’s
timeout timer expires to provide an indication of No Response.

19.1: Modbus Slave Overview
The Modbus slave function block, when used with the appropriate Modem and/or Open Function Blocks, allows the primary
serial port on the controller to act as a Modbus slave. The Modbus function supports both ASCII and RTU modes of operation
across a range of baud rates and protocol frames. Also supported is port activity status, an inactivity timer, support for call-on
exception, and support for store and forward (repeater) operation for radio modems.
The Modbus Addressing section describes the supported Modbus Commands as well as the Modbus Map for X5/X5 Prime
References (%R, %M, etc.).




                                                             Page 188 of 206
                                                                                       Chapter 19: Modbus Communications


19.2: Modbus Master Overview
For complete Modbus Master instructions, please refer to the Help file in Cscape.
When acting as a Modbus master, there are two primary mechanisms used by the X5/X5 Prime to allow the user to specify the
data to be read/written from/to the slaves.
Modbus Master Function Block—This is for serial only. This is an advanced feature that should only be used in rare
occasions.
Protocol Config—The Protocol Config is configured in the Hardware Configuration dialog box in Cscape (serial). Refer to the
Modbus Addressing section. This is the preferred method in most applications.
After the protocol has been selected from the dropdown menu, the Network, Devices, and Scan List become available. The
Protocol Config is configured on three different levels:
    n   Network—Parameters, such as the polling rate of the data scan, are specified along with timeout values,
        retry, and re-acquisition settings. Serial configuration, baud rate, parity, etc. are also set here.
    n   Devices—For every slave to be polled, configuration details are added in the Devices dialog box. This
        includes Slave ID (serial). Under Device Type, the Modbus addressing style matching that specified in the
        slave’s user documentation may be selected. For instance, some slaves specify Modbus addresses (i.e.
        40,001), and others specify offsets (i.e. 0000).
            n   Hex or Decimal—Some specify addresses in hex, and others in decimal. By allowing the user to
                select the Modbus addressing style for each slave on the network, minimal address conversion is
                required. Also, if the slave is another Horner product (i.e. another OCS), the “Native Addressing”
                option can be selected (i.e. %R1, %M17, etc.), and this skips the conversion to Modbus style
                altogether.
    n   Scan List—This is where the specific Modbus addresses to be read/written from/to each slave are
        specified. Up to 32 words of data can be read at the same time.

 NOTE: Once configuration has been completed on the Network and Devices level, Modbus data can be directly read/written
 from graphics objects in the Cscape screen editor. This is available even if the Modbus register is not listed on the scan list.




                                                            Page 189 of 206
                                                                                    Chapter 19: Modbus Communications


19.3: Modbus Addressing Table
To access X5/X5 Prime registers, a Modbus Master must be configured with the appropriate register type and offset. This is
usually accomplished with one of two methods:
Method 1: The first method uses Traditional Modbus References, in which the high digit represents the register type, and the
lower digits represent the register offset (starting with Register 1 for each type). Since only four register types can be
represented in this manner, X5/X5 Prime Modbus Function Blocks pack several X5/X5 Prime register types into each Modbus
register type. Starting addresses of each X5/X5 Prime register type are shown in the Traditional Modbus Reference column of
the Mobus Table.
Method 2: The second method requires the Modbus Master to be configured with a specific Modbus Command and Modbus
Offset. The supported Modbus commands and the associated offsets are also illustrated in Modbus Table.
                                 X5/X5 Prime Modbus Master Mapping
                        Trad Modbus Ref. Expanded Modbus Ref.
Reference Maximum Range                                          Modbus Command(s)                          Modbus Offset
                            (5 Digits)         (6 Digits)
    %I1            2048              10001                 010001                                                 0
   %IG1            256               13001                 013001                                               3000
    %S1            256               14001                 014001            Read Input Status (2)              4000
    %K1              4               15001                 015001                                               5000


   %Q1             2048              00001                 000001                                                 0
   %M1             2048              03001                 003001            Read Coil Status (1)               3000
    %T1            2048              06001                 006001            Force Coil (5)                     6000
   %QG1            256               09001                 009001            Force Multiple Coils (15)          9000


   %AI1            512               30001                 030001                                                 0
  %AIG1             32               33001                 033001                                               3000
                                                                             Read Input Register (4)
   %SR1            256               34001                 034001                                               4000


   %AQ1            512               40001                 040001                                                 0
   %R1             2488              40513                 040513                                                512
   %R1             2048              43001                 043001            Read Holding Register (3)          3000
  %AQG1             32               46001                 046001            Load Register (6)                  6000
                  8192                                                       Load Multiple Registers (16)
   %R1                                  --                 410001                                               10000
              Prime: 10,000




                                                          Page 190 of 206
Firmware
 Update




   Page 191
                                                                                       Chapter 20: Firmware Updates



Chapter 20: Firmware Updates
   20.1: Check for Current Firmware Revision                                                                               192
   20.2: Firmware Update Details                                                                                           193
   20.3: Download Firmware                                                                                                 193
   20.4: Firmware Update Steps                                                                                             194
   20.5: Onboard Battery                                                                                                   194
The X5/X5 Prime OCS products contain field updatable firmware to allow new features to be added to the product. Firmware
updates should only be performed when a new feature or correction is required.

  WARNING: Firmware updates should only be performed when the equipment being controlled by the OCS is in a safe, non-
  operational state. Communication or hardware failures during the firmware update process can cause the controller to
  behave erratically resulting in injury or equipment damage. Make sure the functions of the equipment work properly after a
  firmware update before returning the device to an operational mode.


20.1: Check for Current Firmware Revision
To check the firmware revision on a controller, open System Menu > View Status.




                                                         Page 192 of 206
                                                                                        Chapter 20: Firmware Updates


20.2: Firmware Update Details
 NOTE: Updating firmware will clear the application program, screens, configurations, and register data. If required, make
 sure to backup program and register data before updating firmware. The controller’s User Manual has instructions for doing
 backups.

There are two methods for updating firmware. The method used depends on the type of controller being updated.
Method A: Removable Media Method – The controller firmware is updated by a bootloader, using a microSD card or USB
Flash drive (not through the Cscape Firmware Update Wizard). To update or change firmware:
   1.   Download desired Firmware set from the Horner APG website. (Verify CsCAN or CANopen
        communications.)
   2.   Save Firmware files to microSD card or USB, these are the removable media devices.
   3.   Update the firmware through the controller’s Firmware Update function

 NOTE: Files from the Horner website come as a .ZIP file which need to be unzipped and placed in the root of the drive for
 them to function properly.

Method B: RS232 Serial Connection – Serial firmware updates are done from Cscape software to the controller’s primary
serial port, MJ1 in most cases.

20.3: Download Firmware
In North America, visit https://hornerautomation.com. Then click Support > Downloads > Controller Firmware and download
the most recent firmware set with the correct communication protocol.
                                                              -OR-
In Europe, visit http://www.hornerautomation.eu and click Support > Firmware tab and download the desired firmware (an
account is required to access firmware updates, create one if necessary).




                                                          Page 193 of 206
                                                                                           Chapter 20: Firmware Updates


20.4: Firmware Update Steps
   1.   Unzip all files from downloaded .zip file (see "Download Firmware" on the previous page) onto removable
        media.
   2.   Plug removable media into a powered-up controller.
   3.   Touch the upper-right-hand screen corner to slide out the control panel.
   4.   Press and hold the SYSTEM key until the Boot Installer screen appears. Select System upgrade option.
        Boot Installer screen appears.
   5.   Press the Install Bootloader button and then press Yes.
   6.   When Operation Completed appears, press OK.
   7.   Power-cycle the controller and wait for it to boot up.
   8.   Touch the upper-right-hand screen corner to slide out the control panel.
   9.   Press SYSTEM key, select View Status and press the Enter button.
  10.   If any of the version numbers are incorrect, verify the correct files were copied to the removable media
        device and repeat the steps above.
For more Firmware Update information refer to the Firmware Update Manual, MAN1011, which can be found on the Horner
website.

20.5: Onboard Battery
The X5/X5 Prime OCS has no battery-backed memory of any kind on the product. The onboard lithium battery runs the real time
clock, is non-replaceable, and is designed to last the lifetime of the product (greater than 10 years). None of the system registers
allocated to battery indication apply to the X5/X5 Prime OCS. The onboard battery is soldered to the unit and cannot be
removed.

  WARNING: Lithium Batteries may explode or catch fire if mistreated.


  WARNING: Do not disassemble, heat above 100°C (212°F), incinerate, or puncture.




                                                            Page 194 of 206
Troubleshooting
       &
  Tech Support




      Page 195
                                                                                          Chapter 21: Troubleshooting



Chapter 21: Troubleshooting
   21.1: Connecting to the OCS                                                                                               196
   21.2: Local Controller and Local I/O                                                                                      198
   21.3: CsCAN Network                                                                                                       198
   21.4: USB Interfaces                                                                                                      199
   21.5: Basic Troubleshooting                                                                                               200
   21.6: Technical Support Contacts                                                                                          200



21.1: Connecting to the OCS
Cscape connects to the local controller automatically when the serial connection is made. The status bar below shows an
example of a successful connection. This status bar is located in the bottom right-hand corner of the Cscape window.




In general, the Target number should match the Local number. The exception to this is when the controller is being used as a
"pass through" unit where other controllers on a CsCAN network could be accessed through the local controller. See Cscape
Help File for more details.
Determine connection status by examining feedback next to Local & Target in the status bar of Cscape.
                                        Cscape Target & Local Numbers
     Local: ###        If a number shows next to Local then communication is established to the local controller.
                       Cscape is unable to access the COM port of the PC. This could mean that Cscape is configured for a
   Local: No Port      COM port that is not present or that another program has control of the COM port. Only one Cscape
                       window can access a port at a time. Subsequent instances of Cscape opened will indicate No Port.
                       Cscape has accessed a PC COM port but is not communicating with the controller. This typically occurs
   Local: No Com
                       when the controller is not physically connected.
                       Unknown communication error. Close Cscape, power cycle the controller and reopen Cscape with a
     Local: ???
                       blank project. Check Local.
                       If I (idle), R (run), or D (do I/O) shows next to Target number, then communication is established to the
   Target: #(I,R,D)
                       target controller.
                       Communication is not established to the target controller. Check node ID of controller and set Target to
     Target: #(?)
                       match. Make sure local connection is established.




                                                           Page 196 of 206
                                                                                 Chapter 21: Troubleshooting


21.1.1: Serial Port – MJ1 Programming
  1.   Controller must be powered up.
  2.   Ensure that the correct COM port is selected in Cscape. Tools > Applications Settings >
       Communications.
  3.   Ensure that a cable with proper pinout is being used between PC and controller port MJ1.
  4.   Check that a Loaded Protocol or ladder is not actively using MJ1. Taking the controller out of Run Mode
       from the System Menu on the controller will make MJ1 available to Cscape.
  5.   Successful communications with USB-to-serial adapters vary. If in doubt, Horner APG offers a USB to
       serial adapter: part number HE-CPK.

21.1.2: USB Port - Mini BType C Programming
  1.   Power-up the controller.
  2.   Ensure that the correct COM port is selected in Cscape.Tools > Applications Settings >
       Communications > Configure.
  3.   Confirm that the USB cable is connected between the PC and the controller.
  4.   Examine the Windows Device Manager to confirm that the USB driver is correctly installed and to verity the
       port number.
  5.   The Mini-BType C USB port driver installs.

21.1.3: ETN Port Programming
  1.   Controller must be powered up.
  2.   Ensure that the correct IP address is given in the Ethernet field and correct Mode is selected, in Cscape:
       Tools > Applications Settings > Communications.
  3.   Ensure that an Ethernet connection has been established by pinging the controller from the Windows DOS
       prompt.




                                                     Page 197 of 206
                                                                                        Chapter 21: Troubleshooting


21.2: Local Controller and Local I/O
The System Menu provides the following status indications that are useful for troubleshooting and system maintenance. To view
the System Menu, press the System key.
    n   Self-test results, diagnostics.
    n   RUN and OK status
    n   Network status and usage
    n   Average logic scan rate
    n   Application memory usage
    n   Loaded firmware versions
    n   Loaded protocols
    n   Removable media access

21.2.1: Local I/O Troubleshooting Checklist
   1.   Verify the controller is in RUN mode.
   2.   Check diagnostics to ensure controller passed self-tests. View Diags in System Menu or in Cscape, click
        Controller/Diagnostics.
   3.   Check data sheets to ensure proper wiring.
   4.   Ensure that hardware jumpers and software configuration for I/O match.
   5.   Check data sheets for voltage and current limits.
   6.   Take ladder out of the picture. From Cscape set controller to “Do I/O” mode. In this mode inputs can be
        monitored, and outputs set from a data watch window in Cscape without interference from the ladder
        program. Some I/O problems are only a result of a mistake in the ladder program.

  WARNING: Setting outputs ON in Do I/O mode can result in injury or cause machinery to engage in an unsafe manner
  depending on the application and the environment.


21.3: CsCAN Network
For complete information on setting up a CsCAN network, refer to CAN Networks manual (MAN0799) by using Horner's
Documentation Search page.
Network status, node ID, errors, and baud rate in the controller System Menu are all in reference to the CsCAN network. These
indications can provide performance feedback on the CsCAN network and can also be used to aid in troubleshooting.




                                                          Page 198 of 206
                                                                                      Chapter 21: Troubleshooting


21.3.1: CsCAN Network Troubleshooting Checklist
  1.   Use the proper Belden wire type or equivalent for the network as specified in the CAN Networks Manual,
       MAN0799.
  2.   The Horner OCS does not provide 24VDC to the network. An external voltage source must be used for
       other devices such as SmartStix I/O.
  3.   Check voltage at both ends of the network to ensure that voltage meets specifications of attached devices.
  4.   Proper termination is required. Use 121Ω (or 120Ω) resistors at each end of the network. The resistors
       should be placed across the CAN_HI and CAN_LO terminals.
  5.   Measure the resistance between CAN_HI and CAN_LO. If the network is properly wired and terminated,
       there should be around 60Ω.
  6.   Check for duplicate node ID’s.
  7.   Keep proper wires together. One twisted pair is for V+ and V- and the other twisted pair is used for CAN_HI
       and CAN_LO.
  8.   Make sure the baud rate is the same for all controllers on the network.
  9.   Assure shields are connected at one end of each segment—they are not continuous through the network.
 10.   Do not exceed the maximum length determined by the baud rate and cable type.
 11.   Total drop length for each drop should not exceed 6m (20’). A drop may include more than one node. The
       drop length adds to the overall network length.
 12.   Network should be wired in "straight line" fashion, not in a "star" pattern.
 13.   In applications requiring multiple power supplies, make sure the V- of all supplies is connected and to earth
       ground at one place only.
 14.   In some electrically noisy environments, it may be necessary to add repeaters to the network. Repeaters
       can be used to add additional nodes and/or distance to the network and protect the signal against noisy
       environments.

21.4: USB Interfaces
  n    Plugging and unplugging USB devices while the OCS is powered up can cause the OCS to reset. In
       general, branded USB memory sticks will not cause this problem, however, with the advent of USB 3.0 and
       larger / faster memory devices this cannot be guaranteed.
  n    Larger USB devices such as hard-drives etc. should only be attached and removed when the OCS is
       powered down.
  n    The resets are caused by short sharp current spikes when devices are added or removed from the OCS,
       these spikes can exceed the USB specification but are usually very short and mostly do not cause
       problems. Some devices however draw a longer larger current as they power up causing a brief dip in the
       OCS internal supplies leading to a reset.
  n    Standard SanDisk and Kingston ranges with read times less than 120MB/sec. should not cause resets.
       The display will flicker when a device is added or removed.




                                                       Page 199 of 206
                                                                                           Chapter 21: Troubleshooting


21.5: Basic Troubleshooting
             Description                                                         Action
 OCS does not read media card.         The media card should be formatted with the controller.
                                       Make sure the project file is saved as a .pgm file and not a .csp file. In addition, the file
 OCS will not download project file.   must be .pgm. The file's I/O configuration must match the controller configuration for it to
                                       download.



21.6: Technical Support Contacts
For manual updates and assistance, contact Technical Support at the following locations:
North America:
Tel: (317) 916-4274
Fax: (317) 639-4279
Website: https://hornerautomation.com
Email: APGUSATechSupport@heapg.com
Europe:
Tel: (+) 353-21-4321-266
Fax: (+353)-21-4321826
Website: https://www.hornerautomation.eu
Email: technical.support@horner-apg.com




                                                           Page 200 of 206
                                                                                            Change Log


Change Log
            Rev
  Date            Description of Revision
             #
                  Updated Firmware Update Steps per new Firmware Update Manual (Mantis 2209)
 8/5/2020    8    Rearranged Chapter order (Mantis 3029)
                  Updated back panel image with red CAN connector (Mantis 2802)
                  WebMI Registers Updates (4845)
                  Added section about 121Ω resistor for CAN Communication. (3467)
 5/2/2021    9    Definition of EMI in Fail-Safe chapter. (4567)
                  Replaced HSC Register table with correct one from earlier draft of user manual. Removed table with four
                  counter information. (2909)
                  WebMI – Max # of connections (4802)
8/16/2021   10
                  Alarm Limit added (6103)
 8/2/2022   11    Added X5 Prime to User Manual (8395)
                  Corrected mapping table for HSC and PWM (10451)
  2023      21    Corrected STP examples (1039)
                  Fixed incorrect US tech support email and other assorted formatting changes.
                  Updated HSC table; replaced missing images; replaced missing or inconsistent content from
 2-5-24     22
                  old X5 version




                                                      Page 201 of 206
Index




 Page 202
                                           INDEX
                             A                                Status Bar                                   59
Alarm Viewer                                   147            via Cscape                                   68
Alarms                                         146     Cscape Programming via CAN                         121
Alpha-Numeric Keypad                           143     Cscape Programming via Serial Port                 118
Analog Input Configuration                      89     Cscape Status Bar                                   59
Analog Inputs                                   75     Cscape Target & Local Numbers                      196
Analog Outputs                                  90                                    D
AutoLoad                                   176, 184    Device List and Device Configuration               133
AutoRun                                    178, 186    Digital / HSC Input Configuration                69, 81
                             B                         Digital / PWM Output Configuration               73, 85
Backup / Restore Data                      172, 180    Digital Output Configuration                     73, 87
Basic Troubleshooting                          200     Dimensions                                          17
Battery                                        194     Dip Switches                                       117
Beeper Acknowledgment                          145     Displaying and Entering Data                       142
                                                       Download Firmware                                  193
                             C
                                                       Downloadable Serial Communication Protocols        118
CAN Communications                             121
                                                                                      E
   CAN1 Port Wiring                            121
   Cscape Programming                          121     Electrical Installation                             22
   I/O Expansion                               122            Ground Specifications                        22
   Ladder-Controlled                           122            How to Test for Good Ground                  22
   Port Description                            121            Primary Power Port                           23
CAN Termination                                118     Establishing Communications                         60
CAN1 Port Wiring                               121     Ethernet Communications                            124
Check for Current Firmware Revision            192     Ethernet Module Configuration                      125
Clearance / Adequate Space                      19     Ethernet Module Protocol Configuration             128
Clock and Time Setting Terms                    36     Ethernet Module Protocols                          124
Clone Unit                                     165     Ethernet Module Specifications                     125
   Load Clone                                  168     ETN Port Programming                               197

   Make Clone                                  165     Examples
Communicating via MJ1 Serial Port               65            PWM                                         112
Communicating via On Board Ethernet Port        65            Scaling Analog Inputs                        78
Configuration via Mini-B USB                   119            STP                                         113
Configuring Ethernet Settings via Cscape        68                                    F
Connecting to the OCS                          196     Factors Affecting Panel Layout Design and Clearances 18
Connectivity to the X5 & X5 Prime               13     Fail-Safe System                              171, 179
CsCAN Network                                  198            AutoLoad                               176, 184
CsCAN Network Troubleshooting Checklist        199            AutoRun                                178, 186
Cscape Configuration                         59, 69           Backup/Restore Data                    172, 180
   Configuration                                69            Clear Backup Data                      173, 182
   Establishing Communications                  60            Settings                               172, 180
   MJ1 Serial Port                              65            XL & X Series                               171
   On Board Ethernet Port                       65            XL Prime Series                             179



                                            Page 203 of 206
                                       INDEX
FCC Compliance                             10            PWM Output Waveform                 108
Features of X5/X5 Prime OCS                14            Stepper                             109
Field-Programmable Gate Array (FPGA)       92            STP Examples                        113
Filenames                                 162     High Speed Output Functions Register Map   110
Firmware                                          High-Speed IO                              96
   Check Revision                         192            Frequency                           94
   Download Firmware                      193            Glossary                            93
Firmware Update Details                   193            HSC                                 94
Firmware Update Steps                     194            HSC I/O Filtering                   114
Firmware Updates                          192            Period Measurement                  95
For the XL & X Series                     171            Pulse Width Measurement             95
For the XL Prime Series                   179            Quadrature                          96
FPGA                                       92            Register Maps                       99
Frequency                                  94            Register Match                      96
Function Blocks in Cscape                 161            Status Bits                         98
                            G                            Totalize                            94
                                                  How to Test for Good Ground                22
General I/O
                                                  HSC Functions                              96
   Analog Input                            89
                                                  HSC Functions Register Maps                99
   Digital Input                           81
                                                  HSC I/O Filtering                          114
   Digital Output                          85
                                                  HSC Input Configuration                    81
   HSC                                     81
   PWM                                     85                                  I
   Solid State                             86     I/O Register Map for X5 & X5 Prime         57
General I/O Configuration                  81     Installation Procedure                     18
   Analog Inputs                           75     Intro to the X5 & X5 Prime                 12
   Digital Input Configuration             69                                  L
   Digital Output Configuration            73
                                                  Ladder-Based Screen Navigation             145
   HSC Input Configuration                 69
                                                  Ladder-Controlled CAN Communication        122
   PWM Output Configuration                73
                                                  Ladder-Controlled Serial Communication     118
   Scaling Analog Inputs                   78
                                                  LED Indicator Lights                       26
   Scaling Examples                        78
                                                  Load Clone                                 168
Ground Specifications                      22
                                                  Local Controller and Local I/O             198
Grounding                                  19
                                                  Local I/O Troubleshooting Checklist        198
                            H                     Log Data                                   160
High Speed Counter (HSC) Functions         94                                  M
High Speed Counter Match                  108
                                                  Make Clone                                 165
High Speed I/O (HSC / PWM)                 92
                                                  Mechanical Installation                    16
High Speed I/O Glossary                    93
                                                         Battery                             194
High Speed Output Functions               107
                                                         Dimensions                          17
   Normal                                 107
                                                         Installation                        18
   PWM                                    107
                                                         Mounting                            16
   PWM Examples                           112
                                                         Panel Layout                        18



                                       Page 204 of 206
                                              INDEX
microSD Cards                                    158     Register Match                                  96
microSD File System                              159     Register Tables                                 47
Modbus Addressing Table                          190     Registers
Modbus Communications                            188            Removable Media                         162
Modbus Master Mapping                            190            UTC or Coordinated Universal Time        36
Modbus Master Overview                           189     Removable Media                            148, 158
Modbus Slave Overview                            188            Filenames                               162
Mounting Orientation                              17            Function Blocks                         161
Mounting Requirements                             16            Log Data                                160

                           N                                    Media Manager                           159
                                                                microSD cards                           158
Navigation and Editing                            28
                                                                Registers                               162
Network Configuration                            132
                                                                RM Object                               160
Network Protocols                                132
                                                                View and Capture Screens                160
Noise                                             19
                                                         Removable Media Object                         160
Normal                                           107
                                                         RS-485 Serial Port                             118
                           O
                                                                                         S
Onboard Battery                                  194
                                                         S Registers                                     48
Opening Video Object in Cscape                   153
                                                         Safety and Compliance                            9
                           P                                    FCC Compliance                           10
Panel Layout Design and Clearance Checklist       20            Safety Precautions                       10
Period Measurement                                95            Warnings                                  9
Primary Power Port                                23     Safety Precautions                              10
Protocol Configuration                           130     Scaling Analog Inputs & Examples                78
   Data Mapping                                  137     Scan List                                      135
   Device Configuration                          134     Screen Brightness                              149
   Device Driver                                 131     Screen Navigation                              144
   Device List                                   133     Screen Saver                                   149
   Network Configuration                         132     Screen Specifications                          141
   Network Protocols                             132     Serial Communications                          117
   Scan List                                     135            CAN Termination                         118
Protocol Device Driver Selection                 131            Cscape                                  118
PWM                                              107            Dip Switches                            117
PWM Examples                                     112            Downloadable Protocols                  118
PWM Functions Register Map, Four Counter         111            Ladder-Controlled                       118
PWM Functions Register Map, Two Counter          110            Mini-B USB                              119
PWM Output Configuration                          85            Port                                    117
PWM Output Waveform                              108            RS-485 Serial Port                      118

                           Q                             Serial Port – MJ1 Programming                  197
                                                         Serial Port & Dip Switches                     117
Quadrature                                        96
                                                         Set Beeper                                      38
                           R                             Set Fkeys Mode                                  35
Register Definitions                              47     Set Networks                                    29



                                              Page 205 of 206
                                     INDEX
Set Screen                               38            ETN Port Programming                 197
Set Serial Ports                         35            Local Controller & Local I/O         198
Set Time/Date                            36            Local I/O Checklist                  198
Shock and Vibration                      19            Serial Port - MJ1 Programming        197
Solid State Digital Outputs              86            USB Interfaces                       199
Specifications of Video Properties      152            USB Port - Mini B Programming        197
SR Registers                             49     troubleshooting
Status Bits                              98            Connecting to the OCS                196
Stepper Function                        109                                     U
STP Examples                            113
                                                USB Interfaces                              199
System Menu                              27
                                                USB Port - Mini B Programming               197
System Registers used with RM           162
                                                User Interface                              141
System Settings                          25
                                                Using CAN for I/O Expansion (Network I/O)   122
   Clone Unit                            42
                                                Using the Removable Media Manager           159
   Fail-Safe System                      40
   LED Lights                            26                                     V
   Navigation                            28     Video Object                                152
   Removable Media                       39            Configuration                        154
   Set Beeper                            38            Cscape                               153
   Set Fkeys Mode                        35            Performance                          156
   Set Networks                          29            Specifications                       152
   Set Screen                            38            Web Cameras                          156
   Set Serial Ports                      35     Video Object Overview                       152
   Set Time/Date                         36     Video Object Performance                    156
   System Menu                           27     Video Properties Configuration              154
   Touch Screen Calibration              45     View and Capture Screens                    160
   View Diags                            31     View Diags                                  31
   View I/O Slots                        33     View I/O Slots                              33
   View Protocols                        34     View Protocols                              34
   View Status                           30     View Status                                 30
   WebMI License                         44     Visual Overview                             12
                              T                                                W
Technical Support Contacts              200     Web Cameras                                 156
Temperature / Ventilation                19     WebMI License Details                       44
Totalize                                 94                                     X
Touch (Slip) Sensitivity                146
                                                X5 & X5 Prime Resource Limits               57
Touch Screen Calibration                 45
Touch Screen Pressure                   150
Troubleshooting                         196
   Basic Troubleshooting                200
   CsCAN Checklist                      199
   CsCAN Network                        198
   Cscape Target & Local Numbers        196



                                     Page 206 of 206
