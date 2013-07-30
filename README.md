FBPublisher
===========

Helping with smart publishing of Open Graph actions since 2013!

This js class stores all Open Graph actions performed by user during a session (including ones performed before Facebook Sign in). When user Signs in to Facebook, it automatically publishes all stored actions. It's useful for games and other one-page apps.

Usage
=====

Initialize it by calling `FBPublisher.init()`, object automatically subscribes to Facebook Sign in event and does not interfere with any existing site code.
After initialization, publish your actions through `FBPublisher.publish(action, object, callback)`.
