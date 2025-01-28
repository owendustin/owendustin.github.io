---
layout: default
modal-id: 10
title: Electronic Calendar
date: 2025-01-29
img: submarine.png
alt: image-alt
project-date:
client:
category:
description:
  <div class="content">
    <p>This is a low power desktop calendar which can display all of my google calendar events on a screen.</p>

    <p>I came up with this idea when I had a desk calendar but I found myself never using it because everything was online in my google calendar so I decided to make a desk calendar that would reflect what was happening virtually. The main goal for this project was to run off a battery, so I don't need any cables on my desk. This is a very difficult task with a regular screen but this uses an e-ink screen which only draws minimal power when refreshing but does not have any power consumption otherwise. In fact even if you completely remove power it will still display the last image it had.</p>

    <p>I sourced the following components for the build:</p>

    <p>ESP32 - as the brains of the operation, this chip has wifi and bluetooth connectivity which makes it easy to connect to an api.</p>

    <img src="img/electronic_calendar/image3.png" alt="image3">

    <p>Waveshare 7.5 inch E-Paper display - low power e ink display which has no backlight and does not require power on standby</p>

    <img src="img/electronic_calendar/image1.png" alt="image1">

    <p>Tp4056 - BMS (battery management system)</p>

    <img src="img/electronic_calendar/image4.png" alt="image4">

    <p>600 mAh lipo battery - scraped from a broken mp3 player</p>


  </div>
---