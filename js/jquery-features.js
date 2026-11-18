$(document).ready(function () {
  $('.help-button').on('click', function () {
    $(this).closest('.card').find('.help-content').slideToggle(200);
  });

  $('#topic').on('change', function () {
    const tips = {
      api: 'API access: tell us which statistics you need.',
      bug: 'Website bug: describe the page and the steps to reproduce it.',
      partner: 'Partnership: tell us about your idea.'
    };
    const tip = $(this).closest('.card').find('#topicTip');
    if (this.value) tip.text(tips[this.value]).hide().fadeIn(250);
    else tip.hide();
  });
});
