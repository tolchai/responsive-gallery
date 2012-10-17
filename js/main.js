// globální proměnné

var items = $('div.item'),  
    container = $('div#target'),
    gallery = $('div#gallery');     
        
(function() {

// načtení template a galerie
  template = $.trim( $('#itemTemplate').html() );
  loadImages('galerie');
  
// ošetření změny velikosti containeru při změně velikosti okna

  $(window).resize(function() {
    delay(function(){
      readyWindow(500);
      container.find('img').css('max-height', $(window).height()+'px').end().center();  
      delay(function(){         
        var current = $('.placeholder div.item');           
        if (current.is(':visible')) {
          current.css({
             height : '',
             overflow : ''
          });      
          current.equalHeights();
        }        
      }, 500);
    }, 500);
  });
         
// funkce náhledů          
          
  $('body').delegate("div.item", 'mouseenter mouseleave click', function(e){
    if (e.type=='mouseenter') {
      $(this).addClass('hover')
      items.not(this).addClass('transparent');
    } else if (e.type=='mouseleave') {
      $(this).removeClass('hover')
      items.removeClass('transparent');   
    } else if (e.type=='click') {
      if (gallery.hasClass('deletemode')) {
        $(this).toggleClass('todelete');
      } else if (gallery.hasClass('addmode')) {
        $(this).toggleClass('toadd');
      } else {
        $(this).addClass('active');    
        readyWindow(500);
        var href = $(this).find('a').attr('href'),
            title = $(this).find('a').attr('title'),        
            type = $(this).find('a').attr('class');         
        insertContent(href, title, type);
      }    
    }
    e.preventDefault() 
  });          
          
// funkce menu     
     
  $('nav a').on('click', function(e) {
    if(gallery.hasClass('deletemode')) {
      return false;
    } else {
      var action = $(this).attr('data-action');
      if (action == 'deleteall') {
        if(items.length) {
          items.fadeOut(300, function() {
            $(this).remove();  
            items = $('div.item');               
          });
        } else {
         gallery.empty(); 
          var note =  $('<p></p>', {
            'class' : 'note',
            text: 'Nothing to delete...'
          }).prependTo(gallery).fadeOut(5000);       
        }; 
      } else if (action == 'restore') {
        loadImages('galerie');    
      } else if (action == 'add') {
        gallery.addClass('addmode');          
        container.fadeOut(function() {
          loadImages('window');
          $('.overlay').slideDown(300); 
          $(this).center();
          readyWindow(500);
          container.fadeIn(function () {
            $('.addoptions').fadeIn()
          });
        });          
        delay(function(){
          if ($(".placeholder div.item").is(':visible')) {
        		$(".placeholder div.item").equalHeights();
          }                    
        }, 600);  
      } else if (action == 'delete') {
        if(items.length) {
          $(this).addClass('active');
          gallery.addClass('deletemode');
          $('nav a').addClass('disabled');
          $('.suboptions').fadeIn();
        } else {
          gallery.empty();         
          var note =  $('<p></p>', {
            'class' : 'note',
            text: 'Nothing to delete...'
          }).prependTo(gallery).fadeOut(5000);  
        }    
      }
    }
    e.preventDefault()     
  });
   
// funkce tlačítek
  
  $('.confirmdelete').on('click', function(e) {  
    items.each(function () {
      if($(this).hasClass('todelete')) {
        $(this).fadeOut(300, function() {
          $(this).remove();  
        }); 
      }      
    });
    endDelete();
    e.preventDefault()        
  });  
  
  $('.enddelete').on('click', function(e) {
    endDelete();    
    e.preventDefault()     
  });  
  
  $('.confirmadd').on('click', function(e) {  
    container.find('div').each(function () {
      if($(this).hasClass('toadd')) {
        $(this).css({
           height : '',
           overflow : ''
        });
        $(this).appendTo(gallery);     
      }      
    });
    closeWindow(); 
    initDrag();    
    e.preventDefault()     
  });   
  $('.canceladd').on('click', function(e) {
    closeWindow(); 
    e.preventDefault()        
  }); 
  $('.options a').on('click', function(e) {
    var action = $(this).attr('data-action');
    if (action == 'closeimage') {
      closeWindow();
    } else if (action == 'nextimage') {
      var active = gallery.find('.active'),
          next = active.next(),
          first = items.first();
      active.removeClass('active');
      if(next.length) { 
        var anchor = next.find('a');            
        next.addClass('active');               
      } else {
        var anchor = first.find('a');      
        first.addClass('active');              
      }
      var href = anchor.attr('href'),
          title = anchor.attr('title'),        
          type = anchor.attr('class');         
      insertContent(href, title, type);   
    } else if (action == 'previmage') {
      var active = gallery.find('.active'),
          prev = active.prev(),
          last = items.last();
      active.removeClass('active');
      if(prev.length) {
        var anchor = prev.find('a');       
        prev.addClass('active');               
      } else {
        var anchor = last.find('a');    
        last.addClass('active');              
      }
      var href = anchor.attr('href'),
          title = anchor.attr('title'),        
          type = anchor.attr('class');      
      insertContent(href, title, type);
    };      
    e.preventDefault()            
  }); 
     
// Zavření okna při kliknutí na overlay, nebo při stiskutí ESC     
       
  $(document).keyup(function(e) {
    if ((e.keyCode == 27) && ($('.overlay').is(':visible'))) {
      closeWindow();
    }
  });
        
  $('.overlay').on('click', function() {
    closeWindow();
  });   
   
})();
        

// načtení obsahu konfigurace

function loadImages(target) {
  
  $.getJSON('config.json', function(data) {  
    if(target=='window') {
      var whereto = container.find('div.placeholder');
      whereto.empty().addClass('addwin');
    } else {
      $('h1').html(data.galleryName);         
      var whereto = gallery;        
      whereto.hide().empty();         
    }    

    item = '';

    $.each(data.images, function(key, val) {  
      item += template.replace( /{{source}}/ig, val.source)
                      .replace( /{{thumbnail}}/ig, val.thumbnail)
                      .replace( /{{title}}/ig, val.title)
                      .replace( /{{alt}}/ig, val.alt)
                      .replace( /{{type}}/ig, val.type);
    }); 
    whereto.append(item);        
    gallery.fadeIn();
    items = $(' div.item');
    initDrag();                    
  }); 
}

// funkce pro ukončení delete módu

function endDelete() {
  gallery.removeClass('deletemode');  
  $('nav a').removeClass('disabled');    
  items.each(function () {
    if($(this).find('a').hasClass('todelete')) {     
      $(this).find('a').removeClass('todelete');
    }    
  });
  $('.suboptions').fadeOut();
  $('nav a.active').removeClass('active');
  items = $('div.item');  
}

// funkce pro ukončení práce v okně

function closeWindow() {
  container.fadeOut().find('div.placeholder').empty().removeClass('addwin');  
  $('.overlay').slideUp(300);       
  gallery.removeClass('addmode');
  items.removeClass('active')
  $('.options, .addoptions').fadeOut();
  items = $('div.item');   
}

// funkce pro inicializaci d&d

function initDrag() {
  
  if ($.browser.msie && parseInt($.browser.version) <= 9) {
    return false;  
  } else {

    var dragSrcEl = null;
             
    var cols = document.querySelectorAll('#gallery > div.item');
    [].forEach.call(cols, function(col) {
      col.addEventListener('dragstart', handleDragStart, false);
      col.addEventListener('dragenter', handleDragEnter, false)
      col.addEventListener('dragover', handleDragOver, false);
      col.addEventListener('dragleave', handleDragLeave, false);
      col.addEventListener('drop', handleDrop, false);
      col.addEventListener('dragend', handleDragEnd, false);
    });
  }  
}      

function handleDragStart(e) {
  dragSrcEl = this;
  this.classList.add('extratransparent');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move'; 
  return false;
}

function handleDragEnter(e) {
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');
}

function handleDrop(e) {
  items.removeClass('hover over extratransparent');
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl != this) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
  }
  if (e.preventDefault) {
    e.preventDefault();
  } 
  return false;
}

function handleDragEnd(e) {                   
  if (e.stopPropagation) {
    e.stopPropagation();
  }    
}

// příprava okna 

function readyWindow (time) {
  var actwidth = container.parent('div').width();  
  container.animate({width : actwidth + 'px'}, time);
}

// vložení obsahu do okna

function insertContent(href,title,type) {
  container.fadeOut(function() { 
  container.find('div.placeholder').empty();         
  if(type=='image') { 
    var img = $("<img>").attr('src', href).css('max-height', $(window).height()+'px').load(function() {
      $('.overlay').slideDown(300);
      $('.options').fadeIn(); 
      container.find('div.placeholder').html(img).end().fadeIn().center();
      readyWindow(500);
      var heading = $('<h2></h2>', {
        'class': 'heading',
        text: title
      }).appendTo(container.find('div.placeholder'));                           
    });
  } else if (type=='video') {
      var video =  $("<iframe></iframe>").attr({'src' : href+"?wmode=transparent", 'frameborder' : '0'});                               
      var videowrap = $('<div></div>', {
        'class': 'videowrap'
      }).prependTo(container.find('div.placeholder'));   
      $('.overlay').slideDown(300);
      $('.options').fadeIn(); 
      container.find('div.placeholder .videowrap').html(video).end().fadeIn().center();
      readyWindow(500);
    }
  });
}

// Nastavení zpoždění

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

// zarovnání výšek produktu

(function($) {
	$.fn.equalHeights = function(minHeight, maxHeight) {
		tallest = (minHeight) ? minHeight : 0;
		this.each(function() {
			if($(this).height() > tallest) {
				tallest = $(this).height();
			}
		});
		if((maxHeight) && tallest > maxHeight) tallest = maxHeight;
		return this.each(function() {
			$(this).height(tallest).css("overflow","hidden");
		});
	}
})(jQuery);

