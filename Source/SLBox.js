/*
---
description: A Class that provides a simple lightbox with hooks for navigation

license: MIT-style

authors:
- Arieh Glazer

requires:
- core/1.3: [Class, Class.Extras, Element, Element.Event, Element.Style, Element.Dimensions, Selectors]
    
provides: [SLBox, SLBGalery]

...
*/
/*!
Copyright (c) 2009 Arieh Glazer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE 
*/
(function(window,$,$empty,undef){
	var first = true //whether the base box needs to be generated
		, buttons_set = false
		, container //the lightbox container
		, modal //the modal layer
		, loader; //the loader image
		
	window['SLBox'] = new Class({
		Implements : [Options,Events]
		,options :{
		  lang :{ // text to put in nav
		  	prev : 'Previous'
			,next : 'Next'
		  }
		  , nextFunc : $empty // function to run when the next button is pressed
		  , prevFunc : $empty // function to run when the prev button is pressed
		  , images : '.' // images folder
		  , loader : 'loading.gif' //loader image
		  , close  : 'close.png' //close button image
		  , useNav : true //display navigation?
		  /*
		   * onNext : $empty
		   * onPrev : $empty
		   * onClose : $empty
		   * onComplete : $empty
		   */
		}
		, modal:null
		, container : null
		, loader_size : {x:0,y:0}
		/**
		 * @param {String} src image source
		 * @param {Object} options
		 */
		, initialize : function(src,options){
            this.setOptions(options);
			
			if (first) this.generateBox();
			
			if (this.options.useNav && !buttons_set){
				this.generateNav();
			} 
			if (this.options.useNav) this.setButtons();
            
			this.openLoader();
			this.loadImage(src);	
			return this;
		}
		/**
		 * generate the lightbox html
		 */
		,generateBox : function(){
            var $this = this
			    , div_html = "<div class='content'></div><span class='close'></span>";
		        
			 container = new Element('div',{'class':'lightbox',html:div_html})
			     .addEvent('click',function(e){
	                e = e || window.event;
	                e.stopPropagation();
	             });
			 
		     modal = new Element('div',{'class':'modal'}).addEvent('click', this.close.bind(this));
			 
		     loader =  $(new Image()).addClass('loader');	
			 loader.src = this.options.images + '/' + this.options.loader;
			 loader.setStyles('right',-9999).inject(document.body);
			 this.loader_size = loader.getSize();
			 loader.setStyle('display','none');
			 
			 container.getElement('.close')
			     .setStyle('background-image' , 'url('+this.options.images+'/'+this.options.close)
			     .addEvent('click',this.close.bind(this));
			 
			 first = false;
		}
		/**
		 * generate navigation bar
		 */
		, generateNav : function(){
			  container.adopt(new Element('ul')
                    .set('html',
                        "<li class='prev'><a href='javascript:;' class='prev'></a></li>"
                        +"<li class='next'><a href='javascript:;' class='next'></a></li>"
                    )
              );
			  
             container.getElement('.next a').set('html',this.options.lang.next);
             container.getElement('.prev a').set('html',this.options.lang.prev);
			 buttons_set = true;
		}
		
		/**
		 * set navigation buttons
		 */
		, setButtons : function(){
			 container.getElement('.prev')
			     .removeEvents()
				 .addEvent('click',this.prev.bind(this))
				 .addClass('first')
				 .removeClass('hidden')
				 .getElement('a').set('html',this.options.lang.prev);
				 
             container.getElement('.next')
                 .removeEvents()
			     .addEvent('click',this.next.bind(this))
				 .removeClass('hidden')
				 .removeClass('first');
				 
             container.getElement('.close').addEvent('click',this.close.bind(this));
		}
		/**
		 * load an image into the lightbox
		 * @param {String} src
		 */
		, loadImage : function(src){
			var $this = this
			  , screen = Window.getSize()
			  , scroll = Window.getScroll()
			  , image = new Image()
              , full_size = Window.getScrollSize();
			
            image.src = src+'?'+(new Date());
			image.addEvents({
				'load': function(){
					$this.openModal();
					var content = container.getElement('.content'), clone = image.clone().setStyles({
						left: -9999,
						position: 'absolute'
					}).inject(document.body), size = clone.getSize(), ratio;
					
					clone.destroy();
					
					if (size.y > screen.y - 120) {
						ratio = size.x / size.y;
						size.y = screen.y - 120;
						size.x = size.y * ratio;
						
					}
					
					if (size.x > screen.x - 120) {
						ratio = size.y / size.x;
						size.x = screen.x - 120;
						size.y = size.x * ratio;
					}
					
					image.set('width', size.x);
					image.set('height', size.y);
					
					content.empty();
					content.adopt(image);
					content.setStyles({
						width: size.x,
						height: size.y
					});
					container.setStyle('width',size.x);
					$this.injectBox.bind($this)();
					$this.closeLoader();
				}
				,'error' : function(){
					//$this.close();
				}
			});
		}
		/**
		 * inject the lightbox into the center of the screen
		 */
		, injectBox : function(){
			var size, $this=this
              , screen = Window.getSize()
              , scroll = Window.getScroll();
			
			 
			container.setStyles({
				right:-9999
			}).inject(document.body);
			
			size = container.getSize();
			
			container.setStyles({
				top : screen.y/2 + scroll.y - size.y/2
				, right : '50%'
				, 'margin-right' : -1*size.x/2
			});
			
			this.fireEvent('complete');
			
		}
		/**
		 * move one image farword
		 */
		,next : function(){
            this.close();
			this.fireEvent('next');
			this.options.nextFunc();
		}
		/**
		 * move one image backwords
		 */
		,prev : function(){
            this.close();
			this.fireEvent('prev');
			this.options.prevFunc();
		}
		/**
		 * tell the menu the item displayed is the first (hide prev button)
		 */
		, setFirst : function(){
			container.getElement('.prev').addClass('hidden');
			container.getElement('.next').addClass('first');
		}
        /**
         * tell the menu the item displayed is the last (hide next button)
         */
		, setLast : function(){
			container.getElement('.next').addClass('hidden');
		}
		/**
		 * open the loader image
		 */
		, openLoader : function(){
			var size = this.loader_size
			  , screen = Window.getSize()
			  , scroll = Window.getScroll();
			
			loader.setStyles({
                top : screen.y/2 + scroll.y - size.y/2
                , right : '50%'
                , 'margin-right' : -1*size.x/2
				, 'display' : 'block'
            });
		} 
		/**
		 * close the loader image
		 */
		, closeLoader : function(){
			if (loader.getStyle('display')=='block'){
				loader.setStyle('display','none');
			}	
		}
		/**
		 * accessor to container element
		 */
		, getContainer : function(){return container;}
		/**
		 * Mootools accessor
		 */
		, getElement : function(){return this.getContainer;}
		/**
		 * open modal layer 
		 */
		, openModal : function(){
			var size = Window.getScrollSize();
			modal.setStyles({
				'height':size.y
				, 'width' : size.x
			}).inject(document.body);
		}
        /**
         * close the lightbox
         */
        ,close : function(){
            container.dispose();
            modal.dispose();
            this.closeLoader();
            this.fireEvent('close');
        }
	});
	
	window['SLBGalery'] = new Class({
        Extends : SLBox
		, Implements : Events
        , col : null
        , current : 0
		, box : null
        /**
         * @param {Elements} col a collection of anchor elements surounding img elements 
         * @param {Object} options
         */
        , initialize : function(col,options){
            var $this=this
                , t_next = $empty
                , t_prev = $empty;
            
            function prevFunc(){
                if ($this.current > 0){
                    $this.col[$this.current].removeClass('current');
                    $this.current--;
                    $this.col[$this.current].addClass('current');
                    $this.box = new SLBox($this.col[$this.current].href,options);    
                    $this.box.addEvents(events);//this is needed because adding the next event fails otherwise             
                    if ($this.current == 0) $this.box.setFirst();
                }else{
                    $this.box.setFirst();
                }
                t_prev();
            }
            
            function nextFunc(){
                if ($this.current < $this.col.length-1){
                    $this.col[$this.current].removeClass('current');
                    $this.current++;
                    $this.col[$this.current].addClass('current');
                    $this.box = new SLBox($this.col[$this.current].href,options);
                    $this.box.addEvents(events);//this is needed because adding the next event fails otherwise
                    if ($this.current == $this.col.length-1) $this.box.setLast();
                }
                t_next();
            }
                
            options = options || {};
            this.col = col;
            
            if (options['nextFunc']) t_next = options['nextFunc'];
            if (options['prevFunc']) t_prev = options['prevFunc'];
            
            events = {
                  'next' : function(){$this.fireEvent('next');}
                , 'prev' : function(){$this.fireEvent('prev');}
                , 'close' : function(){$this.fireEvent('close');}
                , 'complete' : function(){$this.fireEvent('complete');}
            };
            
            
            options['nextFunc'] = nextFunc;
            
            options['prevFunc'] = prevFunc;
            
            this.col.addEvent('click',function(e){
                e = e || window.event;
                var target = $(e.target), parent = target.getParent('a');
                e.preventDefault();
                if (target.match('img')){
                    $this.col[$this.current].removeClass('current');
                    $this.box = new SLBox(parent.href,options);
					$this.box.addEvents(events);//this is needed because adding the next event fails otherwise
                    $this.current = $this.col.indexOf(parent);
                    parent.addClass('current');
                    if ($this.current == 0) $this.box.setFirst();
                }
            });
        }
    });
})(this,document.id,function(){});
