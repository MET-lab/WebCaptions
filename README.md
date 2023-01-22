# WebCaptions
A basic Node + Socket.io web app to display and control captions for live events. This is a primitive implementation, originally developed to enable titles and translations for opera performances. The system was used successfully for audiences as part of Opera Philadelphia's O17 Festival.

The system was initially developed by the Music & Entertainment Technology Lab of the [Drexel University ExCITe Center](https://drexel.edu/excite).

Files:
* captions.js: Node and Socket.io code for a webserver
* index.html: The user viewable webpage
* control.html: The system control webpage (to preview and push title changes to users)
* Test.csv: An example CSV file with cue numbers and captions

Notes:
* The system requires a webserver with MySQL, Node, and Socket.io
* *Warning:* The current implementation is hard-coded for 3 works that can be switched between.
  * It wouldn't be difficult to support dynamic loading of the works list, but it's not implemented.
  
  
