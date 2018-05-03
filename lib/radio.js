(function ( $ ) {

$.fn.radio = function( options ) {

    var SETTINGS = $.extend({
        // These are the defaults.
        // theme: 'default'
    }, options );

    var question_body = this;

    var checkboxes = [];
    var checkbox_template = '<div class="funkyradio-darkrose">' +
            '<input type="radio" value="<%= item.value %>" name="<%= item.name %>" id="SIS-<%= item.id %>" <% if(item.isChecked) { %>checked="checked"<%}%> />' +
            '<label for="SIS-<%= item.id %>">' +
                '<% if(item.text_field_name){ %>' +
                    '<input type="text" name="<%= item.text_field_name %>" value="<%= item.text_field_value %>" placeholder="<%= item.label %>">' +
                '<% }else{ %>' +
                    '<%= item.label %>' +
                '<% } %>' +
            '</label>' +
        '</div>';

    $('.clickable').each(function(){
        data = {};
        data['label'] = $(this).find('label').text();
        var input = $(this).find('input[type="radio"]')
        data['name'] = input.attr('name');
        data['id'] = input.attr('id');
        data['value'] = input.attr('value');
        data['value'] = input.attr('value');
        data['isChecked'] = input.prop('checked');

        if($(this).find('input[type="text"]').length) {
           data['text_field_name'] = $(this).find('input[type="text"]').attr('name');
           data['text_field_value'] = $(this).find('input[type="text"]').val();
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