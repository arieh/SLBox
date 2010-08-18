(function(window,$,undef){
	var first = true //whether the base box needs to be generated
		, buttons_set = false
		, container //the lightbox container
		, modal //the modal layer
		, loader; //the loader image
		
	SLBox = new Class({
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
		/**
		 * @param {String} src image source
		 * @param {Object} options
		 */
		, initialize : function(src,options){
            this.setOptions(options);
			
			if (first) this.generateBox();
			
			if (this.options.useNav && !buttons_set) this.generateNav();
			if (this.options.useNav) this.setButtons();

			this.loadImage(src);	
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
				 
             container.getElement('.close').addEvent('click',this.close);
		}
		/**
		 * load an image into the lightbox
		 * @param {String} src
		 */
		, loadImage : function(src){
			var $this = this
			  , screen = Window.getSize()
			  , scroll = Window.getScroll()
			  , image = new Asset.image(src+'?'+(new Date()))
              , full_size = Window.getScrollSize();
			
			this.openLoader();
			
			image.addEvents({
				'load': function(){
					$this.closeLoader();
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
					$this.injectBox();
				}
				,'error' : function(){
					$this.close();
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
			this.fireEvent('next');
			this.options.nextFunc();
            this.close();
		}
		/**
		 * move one image backwords
		 */
		,prev : function(){
			this.fireEvent('prev');
			this.options.prevFunc();
            this.close();
		}
		/**
		 * close the lightbox
		 */
		,close : function(){
			container.dispose();
			modal.dispose();
			loader.dispose();
			this.fireEvent('close');
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
			var size 
			  , screen = Window.getSize()
			  , scroll = Window.getScroll();
			
            loader.setStyles('right' , -9999).inject(document.body);
			
			size = loader.getSize();
			
			loader.setStyles({
                top : screen.y/2 + scroll.y - size.y/2
                , right : '50%'
                , 'margin-right' : -1*size.x/2
            }).inject(document.body);
		} 
		/**
		 * close the loader image
		 */
		, closeLoader : function(){loader.dispose();}
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
	});
})(this,document.id);
