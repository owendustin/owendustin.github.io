---
title: "Bartending Robot"
image: "unnamed.jpg"
progress: "Completed"
date: "March 2026"
skills: "Solidworks, DFA, DFM, Electronics"
difficulty: "&#9733; &#9733; &#9733; &#9733; &#9733;"
---

# Bartending Robot

This project is a bartending robot intended to deliver a two-part mixed drink to the user. The user first places the cup in the holder and a linear gantry moved the cup to station 1 to be fixed with the first part, station 2 for the second and finally is left at the end for pickup. 

The project is powered using a keyence KV-40DT PLC. Which controls the drink actuation, gantry positioning, input buttons and indicators. 

The design is inspired by industrial factories and control panels and was made from primarily metal construction. 

<video width="640" height="360" controls preload="metadata">
  <source src="IMG_1723.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<video width="270" height="480" controls preload="metadata">
  <source src="IMG_9595.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

# Mechanical

I first started by designing the project in SolidWorks where I came up with the general mechanisms and aesthetics for the project. I decided on a vertical panel which would show the wiring and hardware components in a clean manner and a lower section for the linear gantry.

The linear gantry was custom designed for the project taking inspiration from other projects. It uses a section of 20x40 aluminum extrusion with bearings to slide along the V-shaped grooves. There is a belt which connects to the gantry and loops back through the center of the extrusion. The belt is then driven using a NEMA17 stepper motor and DMC450 stepper driver.  

<video width="640" height="360" controls preload="metadata">
  <source src="IMG_9229.MOV" type="video/mp4">
  Your browser does not support the video tag.
</video>

The vertical panel was made using scrap 1.5’ aluminum extrusion which was connected with V nuts and 3D printed corner brackets. The front plate was waterjet with holes for the valves and actuations. 

Similarly the base was constructed from a large piece of scrap steel. It was cut on the waterjet and bent using the brake press. A wooden structure was made beneath the metal to provide more rigidity and mounting locations for the gantry. 

# Wiring

Everything was installed and wired up with custom soldered wire harnesses. Wires were routed through the metal pieces using 3d printed grommet. The indicators, buttons, and gantry all required harnesses for easy cable management and troubleshooting. The PLC and stepper motor were mounted on din rail. Terminal blocks were also used to easily wire up the 5, 12, and 24V busses for the various components.

# Software

The ladder logic for this project was all written in the Keyence KV studio. It consisted of various blocks that control the timing between the gantry and valve. To drive the stepper motors the PLC was found to be unsuitable due to its limited pulse output frequency. To solve this I used an arduino with its PWM pin to drive the stepper at its required frequency.

# Conclusion

The final project put together is able to dispense drinks by placing a cup at the start, pressing a button and the drinks are automatically dispensed. Drink ratios are easily changed in the ladder logic. This device was used at an amino event where it ran for over 200 cycles with no errors. The limit switches in the linear gantry allowed for automatic homing after every run greatly improving the repeatability. In the future I might add more dispensers for multiple drink options.
