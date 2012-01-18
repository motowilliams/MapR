$(function () {

	var clients;

	var maprhub = $.connection.mapRHub;
	$.connection.hub.start(function () {
		maprhub.join();
	});

	var userTemplate = _.template('<div id="<%= ClientId %>" style="-moz-border-radius: 7px;border-radius: 7px;padding:3px;margin-bottom:3px;border-style:solid;border-width:2px;background-color:#f0f0f0;border-color:<%= Color %>;"><%= Name %><br/><%= ClientId %></div>');

	maprhub.joinResult = function (data) {
		clients = data;
		$('#userList').empty();
		$.each(data, function (index, item) {
			$('#userList').append(userTemplate({ ClientId: item.ClientId, Color: item.Color, Name: item.Name }));
		});
	};
	
	maprhub.userCount = function (data) {
		$('#userCount').text(data);
	};

	$(window).bind('beforeunload', function () {
		maprhub.disconnect();
	});
	
	$(window).unload(function () {
		maprhub.disconnect();
	});
});