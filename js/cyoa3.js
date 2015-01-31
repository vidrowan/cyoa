/*
 * Cyoa, a choose your own adventure type thing.
 *  actuall expected use does not include choose your own adventures, sadly.
 *  still plenty good for making flowchart like deals
 *
 * options looks like { 
 *     container: 'id of html element which holds the story',
 *     start_page : 'optional, the key of the story page you start on, defaults to "start"'
 * }
 * story looks like
 * {
 *      start : {  // default start page, if you want to call it something different, you have to set it in the options
 *          img: 'http://www.url/img.png',
 *          connects: { 
 *          'page_2': 'Some text here',
 *          'death_by_water': 'The hanged man', 
 *          'foobarbaz' : 'variables'
 *          }
 *      },
 *      page_2 : {
 *          html: '<h1>Arbitrary html goes here !!! WhoooO!!!',
 *          connects: {'death_by_water' : 'I hate fortune tellers'},
 *      },
 *      death_by_water : {
 *          img: 'http://wasteland.org/fear.jpg',
 *          select_img: 'http://placekitten.com/100/100' //optional
 *      }
 * }
 */
var Cyoa = function(story, options) {

    var cyoa = function() {
        this._start_page = 'start';
        this._container = 'cyoa_container';
        this._container_elem;
        this._back_button_elem;
        this._reset_button_elem;
        this._path = [];
        var that = this;

        this.init = function() {
            for ( var i in options ) {
                that['_' + i] = options[i];
            }
            create_cover();
            for ( var i in story ) {
                that.create_page(i);
            }
            that.add_to_path(that._start_page);
            that.display_page(that._start_page);
        }

        this.create_cover = function() {
            that._container_elem = jQuery('#' + this._container);
            that._container_elem.addClass('cyoa_container');
            that._container_elem.append(that.create_reset_button_elem());
            that._container_elem.append(that.create_back_button_elem());
        }

        this.create_back_button_elem = function() {
            that._back_button_elem = jQuery('<button id="cyoa_back_button"'
                + ' class="disabled" value="back" title="Back">BACK</button>'
            );
            that._back_button_elem.click(function(){that.back();});
            that._back_button_elem.addClass('cyoa_top_controls');
            return that._back_button_elem;
        }
        this.create_reset_button_elem = function() {
            that._reset_button_elem = jQuery('<button id="cyoa_reset_button"'
                + ' class="disabled" value="reset" title="Reset">RESET</button>'
            );
            that._reset_button_elem.click(function(){that.reset();});
            that._reset_button_elem.addClass('cyoa_top_controls');
            return that._reset_button_elem;
        }

        this.create_page = function(page) {
            story[page].element = create_page_element(page); 
            story[page].element.hide();
            this._container_elem.append(story[page].element);
        }

        this.create_page_element = function(page) {
            var page_obj = story[page];
            var content = page_obj.html
                ? page_obj.html
                : page_obj.img
                    ? '<img src="' + page_obj.img + '" />'
                    : page_obj.text
                        ? '<p>' + page_obj.text + '</p>'
                        : '<p>No content provided.  That\'s unfortunate';
            var element = jQuery(
                  '<div id="' + page + '_container" class="cyoa_page">'
                + '<div class="cyoa_content">'
                + content
                + '</div></div>'
            );
            element.append(that.create_selection_buttons(page));
            return element;
        }

        this.add_to_path = function(page) {
            that._path.push(page);
            if (that._path.length > 1) {
                that._back_button_elem.removeClass('disabled');
                that._reset_button_elem.removeClass('disabled');
            }
        }
        
        this.create_selection_buttons = function(page) {
            var controler_container = jQuery('<ul id="' + page + '_controls" class="cyoa_controls"></ul>');
            var choices = story[page].connects;
            if ( !choices ) { //must be the end of a line
                return controler_container;
            }
            for ( var connect in choices ) {
                var decision = choices[connect];
                if ( !story[connect] ) {
                    continue;
                }

                var control = jQuery('<li class="cyoa_controler_' + connect + '"></li>');
                control.append(jQuery('<span>' + decision + '</span>'));
                (function(choice) {  //Graaah, there must be a better way to do this, I always fear this construction leads to memory leaks
                    control.click(function() {
                        that.add_to_path(choice);
                        that.display_page(choice);
                    });
                })(connect);
                controler_container.append(control);
            }
            return controler_container;
        }

        this.display_page = function(page) {
            //maybe fancy this up inna bit, have it slide or somethign
            jQuery('.cyoa_page').hide();
            jQuery('#' + page + '_container').show();
        }

        this.back = function() {
            if ( that._path.length === 1 ) {
                that._back_button_elem.addClass('disabled');
                that._reset_button_elem.addClass('disabled');
                return;
            }
            that._path.pop();
            that.display_page( that._path[that._path.length - 1] );
            if ( that._path.length === 1 ) {
                that._back_button_elem.addClass('disabled');
                that._reset_button_elem.addClass('disabled');
            }
        }

        this.reset = function() {
            while (that._path.length > 1) {
                that._path.pop();
            }
            that.display_page(that._path[0]);
            that._back_button_elem.addClass('disabled');
            that._reset_button_elem.addClass('disabled');
        }

        return this.init(story, options)
        
    }

    return cyoa();
};
