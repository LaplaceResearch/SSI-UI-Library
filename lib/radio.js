(function ( $ ) {

$.fn.radio = function( options ) {

    var SETTINGS = $.extend({
        // These are the defaults.
        // theme: 'default'
    }, options );

    var question_body = this;

    var checkboxes = [];
    var checkbox_template = '<div class="funkyradio-primary">' +
            '<input type="radio" name="<%= item.name %>" id="SIS-<%= item.id %>" />' +
            '<label for="SIS-<%= item.id %>">' +
                '<% if(item.text_field_name){ %>' +
                    '<input type="text" name="<%= item.text_field_name %>" placeholder="<%= item.label %>">' +
                '<% }else{ %>' +
                    '<%= item.label %>' +
                '<% } %>' +
            '</label>' +
        '</div>';

    $('.clickable').each(function(){
        data = {};
        data['label'] = $(this).find('label').text();
        data['name'] = $(this).find('input[type="radio"]').attr('name');
        data['id'] = $(this).find('input[type="radio"]').attr('id');

        if($(this).find('input[type="text"]').length) {
           data['text_field_name'] = $(this).find('input[type="text"]').attr('name');
        }
        checkboxes.push(data);
    });

    $('.inner_table').hide();

    question_body
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
        $(this).parent().parent().find('input[type="radio"]').prop("checked", true);
    });

    $('input[type="text"]').blur(function(){
        if($(this).val().length < 1)
            $(this).parent().parent().find('input[type="radio"]').prop("checked", false);
    })
};

}( jQuery ));