SLBox
=============

SLBox stands for simple lightbox. And that's what it is. There are tons of lightboxes out there for mootools, but I was missing one that supplies hooks (via events or options) for 
interacting with other classes. I was looking for a way to integrate ThumbsSlides with a lighbox navigation. 
This class was specificaly designed to interact with other classes. 

Just so this will still be usable as a standalone (and also for testing), I also supplied the SLBGalery class, that takes a collection of `a>img` and supplies navigation controlles for it. 
This has been tested on FF 3.5 and IE6/8, so I'm assuming close-to-full cross browser support

How to use
----------
Simple - 

    #JS
    lb = new SLBox('source.to.image.png');

*NOTE: all styles are on the CSS file, so obviously you're gonna need that*    

For SLBGalery:

    #JS
    var lb = new SLBGalery($$(#images a));
    
Options for galery will be passed to the lightbox. Events attached to it will be attached to the box.
Note that the Gallery assumes the anchors' href will point to the target image for the lightbox.
Also note that the Gallery provides all the API of SLBox.
   
Options:
--------
  * lang: An object containing the text used for the buttons (look at source code to see what you can put there)
  * next : A function to fire when pressing the next button
  * prev : A function to fire when pressing the prev button
  * images : path to images folder
  * loader : name of loader image
  * close : name of close button image
  * useNav : should the class create the navigation buttons (default:`true`);

Events:
--------
  * next : fires when the next button is clicked
  * prev : fires when the prev button is clicked
  * close : fires when the box closes
  * complete : fires when the loading <completes></completes>