# DuoVision

This is a hackathon project submitted to MakeUofT, Canada's largest makeathon.

> Demo: [https://youtu.be/tx8E-Q6v1pg](https://youtu.be/tx8E-Q6v1pg)

> DevPost: [https://devpost.com/software/duovision?ref_content=my-projects-tab&ref_feature=my_projects](https://devpost.com/software/duovision?ref_content=my-projects-tab&ref_feature=my_projects)

## Inspiration

Have you ever felt frustrated by constantly switching your gaze between the lecture slides and your notebook and subsequently missing your professor's fast paced content? We set out to solve this common classroom challenge by creating an assistive technology that merges both visual fields into one.

**DuoVision enables students to view the blackboard while simultaneously seeing their notes in their field of vision, eliminating the need to look down at their paper.** This enhancement to the lecture experience allows for more efficient and comfortable note-taking, keeping students focused on the content being presented.

## What it does

DuoVision is a pair of “smart glasses” that uses:

- A two-axis mirror system driven by servos to track and reflect an image feed (projector/lecture slides) into the user’s line of sight.

- A camera (connected via a TPU) that streams a live view of the lecture content using WiFi/Bluetooth.

- A computer vision model that uses OpenCV instance segmentation to determine the position of the user’s notepad for tracking

- A custom controller to adjust mirror positions to ensure the notepad remains visible as the user shifts their gaze or moves the paper.

- A mobile application to view adjusted view of the notes in real time and accelerate computation

## Tech Stack

- Expo SDK, React Native, TypeScript, Android Studio, XCode

- OpenCV, Python (Serial, Flask, Socket)

- ESP32 Camera, Servo Motors, TPU
