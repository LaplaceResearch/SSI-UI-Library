(function ( $ ) {

$.fn.checkbox = function( options ) {

    var SETTINGS = $.extend({
        // These are the defaults.
        // theme: 'default'
    }, options );

    var question_body = this;
    var inner_table = $(".inner_table");

    var checkboxes = [];
    var checkbox_template = '<div class="funkycheck-darkrose">' +
            '<input type="checkbox" value="<%= item.value %>" name="<%= item.name %>" id="id-<%= item.name %>" <% if(item.isChecked) { %>checked="checked"<%}%> />' +
            '<label for="id-<%= item.name %>">' +
                '<% if(item.text_field_name){ %>' +
                    '<input name="<%= item.text_field_name %>" type="text" value="<%= item.text_field_value %>" placeholder="<%= item.label %>">' +
                '<% }else{ %>' +
                    '<%= item.label %>' +
                '<% } %>' +
            '</label>' +
        '</div>';

    $('.clickable').each(function(){
        var data = {};
        var input = $(this).find('input[type="checkbox"]');

        data['label'] = $(this).find('label').text();
        data['name'] = input.attr('name');
        data['value'] = input.attr('value');
        data['isChecked'] = input.prop('checked');

        if($(this).find('input[type="text"]').length) {
           data['text_field_name'] = $(this).find('input[type="text"]').attr('name');
           data['text_field_value'] = $(this).find('input[type="text"]').val();
        }
        checkboxes.push(data);
    });

    inner_table.html('');

    question_body
    .append('<div class="col-md-6></div>')
    .append('<div class="funkycheck"></div>');
    var wrapper = $('.funkycheck');

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

    var is_none_above = function(el){
        var name = el.attr('name');
        return name.search("noneabove") > -1
    }

    // var noneAboveInput;
    // var noneAboveInputName;

    // $('input[type=hidden]').each(function(){
    //     var name = $(this).attr('name');
    //     if (is_none_above($(this))){
    //         var input_number = $(this).val();
    //         var input_name = $(this).attr('name').replace('hid_noneabove_', '');
    //         noneAboveInputName = input_name + "_" + input_number;
    //         noneAboveInput = $("input[name="+ noneAboveInputName +"]");

    //         noneAboveInput.click(function(){
    //             $('input[type=checkbox]').prop('checked', false);
    //             noneAboveInput.prop('checked', true);
    //         });
    //     }

    // });

    // $('input[type="checkbox"]').click(function(){
    //     if($(this).attr('name') !== noneAboveInputName) {
    //         noneAboveInput.prop('checked', false);
    //     }
    // });


};

}( jQuery ));
