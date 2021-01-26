'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

$('.availability-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const scheduleId = button.data('schedule-id');
    const userId = button.data('user-id');
    const availability = parseInt(button.data('availability'));
    const nextAvailability = (availability + 1) % 2;
    $.post(
      `/schedules/${scheduleId}/users/${userId}`,
      { availability: nextAvailability },
      data => {
        button.data('availability', data.availability);
        const availabilityLabels = ['このイベントに申し込む', '申し込みを取り消す'];
        button.text(availabilityLabels[data.availability]);

        const buttonStyles = ['btn-primary', 'btn-danger'];
        button.removeClass('btn-primary btn-danger');
        button.addClass(buttonStyles[data.availability]);
      }
    );
  });
});