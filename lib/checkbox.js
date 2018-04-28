(function ( $ ) {

$.fn.checkbox = function( options ) {

    var SETTINGS = $.extend({
        // These are the defaults.
        // theme: 'default'
    }, options );

    var question_body = this;

    var checkboxes = [];
    var checkbox_template = '<div class="funkyradio-darkrose">' +
            '<input type="checkbox" name="<%= item.name %>" id="id-<%= item.name %>">' +
            '<label for="id-<%= item.name %>">' +
                '<% if(item.text_field_name){ %>' +
                    '<input type="text" placeholder="<%= item.label %>">' +
                '<% }else{ %>' +
                    '<%= item.label %>' +
                '<% } %>' +
            '</label>' +
        '</div>';

    $('.clickable').each(function(){
        data = {};
        data['label'] = $(this).find('label').text();
        data['name'] = $(this).find('input[type="checkbox"]').attr('name');

        if($(this).find('input[type="text"]').length) {
           data['text_field_name'] = $(this).find('input[type="text"]').attr('name');
        }
        checkboxes.push(data);
    });

    $('.inner_table').hide();

    question_body
    .append('<div class="col-md-6></div>')
    .append('<div class="funkyradio"></div>');
    var wrapper = $('.funkyradio');

    var _template = function(element, template, data){
        var cb_tpl = _.template(template);
        element.append(cb_tpl(data));
    }

    _.map(checkboxes, function(item){
        _template(wrapper, checkbox_template, {item: item });
    });

    $('input[type="text"]').keyup(function(e){
        if(e.keyCode == 13) {
            return false;
        }
        $(this).parent().parent().find('input[type="checkbox"]').prop("checked", true);
    });
};

}( jQuery ));