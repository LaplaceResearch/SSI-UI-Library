(function ( $ ) {

    $.fn.gridSingle = function( options ) {

        var SETTINGS = $.extend({
            // These are the defaults.
            show_choice_labels: true,
            show_form: false
        }, options );

        var question_body = this;
        var canvas = question_body.parent();
        if (!SETTINGS.show_form) {
            this.hide();
        }


        // Append Survey.js elements
        canvas.append('<div id="surveyElement"></div>');
        canvas.append('<div id="surveyResult"></div>');

        // Collect choice labels
        var labels = [];
        $('.col_label_cell').each(function(index, item){
            labels.push($(item).find('.grid_options').text());
        });

        // Determine first and last labels from labels array
        var first_label = labels[0];
        var last_label = labels[labels.length - 1];

        var json = {
            questions: []
        };

        // Collect choices
        var choices = [];

        var rows = $('table').find('tr[class^="grid_row"]');

        rows.each(function(i, item){
            var data = {};
            $(item).find('.grid_options').each(function(index, item){
                data["text"] = $(item).text();
            });

            data['id'] = $(item).attr('id');
            choices.push(data);
        });

        $.each(choices, function(index, item) {
            choices_data = {};
            choices_data['type'] = 'rating';
            choices_data['name'] = item.id;
            choices_data['title'] = item.text;

            if(SETTINGS.show_choice_labels) {
                choices_data['minRateDescription'] = first_label
                choices_data['maxRateDescription'] = last_label
            }

            json.questions.push(choices_data);

        });

        Survey
            .StylesManager
            .applyTheme("bootstrap");

        window.survey = new Survey.Model(json);
        survey.onComplete.add(function (result) {});
        $("#surveyElement").Survey({model: survey});

        survey.onValueChanged.add(function(a,b){
            var radio_name = b.name.replace('_row', '');
            $('input[name="' + radio_name + '"][value='+ b.value +']').prop("checked", true);
        })

        $('.sv_complete_btn').hide();

    };

}( jQuery ));