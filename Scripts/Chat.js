$(function () {

	var defaultMapCoords = new window.google.maps.LatLng(44.087585, -106.171875);
	var masterMap, smallMap, rectangle01;
	var maprhub = $.connection.mapRHub;
	var userCollection = [];

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function (position) {
				var currentCoords = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				$.connection.hub.start(function () {
					masterMap = new window.google.maps.Map(document.getElementById('masterMap'), {
						zoom: 2,
						center: defaultMapCoords,
						mapTypeId: window.google.maps.MapTypeId.TERRAIN,
						disableDefaultUI: true,
						draggable: false,
						disableDoubleClickZoom: false,
						scrollwheel: false,
						backgroundColor: '#626D5D'
					});
					smallMap = new window.google.maps.Map(document.getElementById('smallMap'), {
						zoom: 10,
						center: currentCoords,
						mapTypeId: window.google.maps.MapTypeId.TERRAIN,
						backgroundColor: '#626D5D',
						noClear: true
					});
					window.google.maps.event.addListenerOnce(smallMap, 'tilesloaded', function () {
						var smallMapBounds = smallMap.getBounds();
						maprhub.join(smallMapBounds.getNorthEast(), smallMapBounds.getSouthWest())
							.done(function (data) {
								//$('#userCount').text(data.length);
								//
								//var collection = createUserCollection(data);
								//userCollection = collection;
								//
								//var masterBounds = new window.google.maps.LatLngBounds();
								//$.each(data, function (index, item) {
								//	var sw = new window.google.maps.LatLng(item.SouthWest.Pa, item.SouthWest.Qa);
								//	var ne = new window.google.maps.LatLng(item.NorthEast.Pa, item.NorthEast.Qa);
								//	var latlngBounds = new window.google.maps.LatLngBounds(sw, ne);
								//	masterBounds.union(latlngBounds);
								//});
								//masterMap.fitBounds(masterBounds);
							});

						window.google.maps.event.addListener(smallMap, 'bounds_changed', function () {
							throttledBoundsChange();
						});
					});
				});
			},
		// next function is the error callback
			function (error) { });
	};

	maprhub.joinResult = function (data) {
		var collection = createUserCollection(data);

		if (userCollection.length >= collection.length) {
			userCollection = _.intersection(userCollection, collection);
		}else {
			userCollection = _.union(userCollection, collection);
		}


		//clear out list and repace it w/ fresh list from server
		$('#userList').empty();
		var masterBounds = new window.google.maps.LatLngBounds();

		_.each(userCollection, function (item) {

			masterBounds.union(item.Rectangle.getBounds());
			$('#userList').append(userTemplate({ ClientId: item.ClientId, Color: item.Color, Name: item.Name }));

		});
		masterMap.fitBounds(masterBounds);
	};

	var throttledBoundsChange = _.throttle(function () {
		var ne = smallMap.getBounds().getNorthEast();
		var sw = smallMap.getBounds().getSouthWest();
		maprhub.boundsChanged(ne, sw);
	}, 150);

	var userTemplate = _.template('<div id="<%= ClientId %>" style="-moz-border-radius: 7px;border-radius: 7px;padding:3px;margin-bottom:2px;margin-top:2px;border-style:solid;border-width:2px;background-color:#f0f0f0;border-color:<%= Color %>;"><%= Name %><br/><%= ClientId %></div>');

	function createUserCollection(data) {

		return _.map(data, function (item) {
			function createCoord() {
				var userBounds = new window.google.maps.LatLngBounds(
				new window.google.maps.LatLng(item.SouthWest.Pa, item.SouthWest.Qa),
				new window.google.maps.LatLng(item.NorthEast.Pa, item.NorthEast.Qa));
				return userBounds;
			};

			var client = {
				ClientId: item.ClientId,
				Color: item.Color,
				Name: item.Name,
				Rectangle: new window.google.maps.Rectangle({
					strokeColor: item.Color,
					strokeOpacity: 1,
					strokeWeight: 1.5,
					fillColor: '#FFF',
					fillOpacity: 0.15,
					editable: false,
					clickable: false,
					map: masterMap,
					bounds: createCoord()
				})
			};
			return client;
		});

	};

	maprhub.updateMasterBounds = function (data) {
		
		var masterBounds = new window.google.maps.LatLngBounds();

		for (var i = 0; i < userCollection.length; i++) {
			var newClient = _.first(data.filter(function (element, index, array) {
				return userCollection[i].ClientId == element.ClientId;
			}));

			var userBounds = new window.google.maps.LatLngBounds(
				new window.google.maps.LatLng(newClient.SouthWest.Pa, newClient.SouthWest.Qa),
				new window.google.maps.LatLng(newClient.NorthEast.Pa, newClient.NorthEast.Qa)
			);

			userCollection[i].Rectangle.setBounds(userBounds);
			masterBounds.union(userBounds);
		}
		masterMap.fitBounds(masterBounds);
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


	rectangle01 = new window.google.maps.Rectangle();
	rectangle01.setOptions({
		strokeColor: '#FF5D00',
		strokeOpacity: 1,
		strokeWeight: 1.5,
		fillColor: '#FFF',
		fillOpacity: 0.15,
		editable: false,
		clickable: false,
		map: masterMap
		//bounds: smallMap.getBounds()
	});

	maprhub.debug = function (data) {
		console.log(data);
	};

});