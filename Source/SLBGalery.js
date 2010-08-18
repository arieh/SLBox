(function(window,$,undef){
    window['SLBGalery'] = new Class({
		Implements : Events
		, col : null
		, current : 0
		/**
		 * @param {Elements} col a collection of anchor elements surounding img elements 
		 * @param {Object} options
		 */
		, initialize : function(col,options){
			var $this=this
				, t_next = $empty
				, t_prev = $empty
				, box;
			
			function prevFunc(){
                if ($this.current > 0){
                    $this.col[$this.current].removeClass('current');
					$this.current--;
                    $this.col[$this.current].addClass('current');
                    box = new SLBox($this.col[$this.current].href,options);					
					if ($this.current == 0) box.setFirst();
                }else{
                    box.setFirst();
                }
                t_prev();
			}
			
			function nextFunc(){
                if ($this.current < $this.col.length-1){
                    $this.col[$this.current].removeClass('current');
                    $this.current++;
                    $this.col[$this.current].addClass('current');
                    box = new SLBox($this.col[$this.current].href,options);
					if ($this.current == $this.col.length-1) box.setLast();
                }
                t_next();
            }
				
			options = options || {};
			this.col = col;
			
			if (options['nextFunc']) t_next = options['nextFunc'];
			if (options['prevFunc']) t_prev = options['prevFunc'];
			
            options['events'] = {
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
					box = new SLBox(parent.href,options);
					$this.current = $this.col.indexOf(parent);
					parent.addClass('current');
                    if ($this.current == 0) box.setFirst();
				}
			});
		}
	});
})(this,document.id);
