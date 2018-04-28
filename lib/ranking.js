var json = {
    "elements": [
    {
        "type": "sortablelist",
        "name": "lifepriopity",
        "title": "Life Priorities",
        "isRequired": true,
        "choices": ["Turkcell", "Vodafone", "Turk Telekom"]
    }
]};

window.survey = new Survey.Model(json);

survey
.onComplete
.add(function (result) {
    console.log(result)
});

survey.onValueChanged.add(function(a,b){

})

survey.showCompletedPage = false;

$("#surveyElement").Survey({model: survey});