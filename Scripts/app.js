var userCollection = [];

$(function () {

    var defaultMapCoords = new window.google.maps.LatLng(44.087585, -106.171875);
    var masterMap, smallMap, rectangle01;
    var maprhub = $.connection.mapRHub;

    // only if the broswer supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var currentCoords = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                // once once the hub has successfully started should maps be rendered
                $.connection.hub.start().done(function (data) {
                    console.log(data.id);

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
                        maprhub.join(smallMapBounds.getNorthEast().lat(), smallMapBounds.getNorthEast().lng(), smallMapBounds.getSouthWest().lat(), smallMapBounds.getSouthWest().lng())
                               .done(function () {
                                   window.google.maps.event.addListener(smallMap, 'bounds_changed', function () {
                                       throttledBoundsChange();
                                   });
                               });
                    });
                });
            });
    };

    // this is called after the client submits their inital map state
    maprhub.joinResult = function (data) {
        $('#userCount').text(data.length);
        $.extend(userCollection, createUserCollection(data));
        //userCollection = createUserCollection(data);
        console.log(userCollection);
    };

    var throttledBoundsChange = _.throttle(function () {
        var ne = smallMap.getBounds().getNorthEast();
        var sw = smallMap.getBounds().getSouthWest();
        maprhub.boundsChanged(ne.lat(), ne.lng(), sw.lat(), sw.lng());
    }, 100);

    maprhub.updateMasterBounds = function (data) {

        var masterBounds = new window.google.maps.LatLngBounds();

        console.log("userCollection.length => " + userCollection.length);
        for (var i = 0; i < userCollection.length; i++) {

            var newClient = _.first(data.filter(function (element, index, array) {
                return userCollection[i].Id == element.Id;
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

    function createUserCollection(data) {

        return _.map(data, function (item) {
            function createCoord() {
                var userBounds = new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(item.SouthWest.Pa, item.SouthWest.Qa),
                    new window.google.maps.LatLng(item.NorthEast.Pa, item.NorthEast.Qa));
                return userBounds;
            };

            var client = {
                Id: item.Id,
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

    maprhub.debug = function (data) {
        console.log('Client debug');
        console.log(data);
    };

    maprhub.joined = function (data) {
        //console.log('Client joined (IConnected callback)');
        //console.log(data);
        //$('#userCount').text(data.length);
    };

    maprhub.leave = function (data) {
        console.log('Client leave (IDisconnected callback)');
        console.log(data);
        $('#userCount').text(data.length);
        $.extend(userCollection, createUserCollection(data));
        //todo remove item
    };

    maprhub.rejoined = function (data) {
        console.log('Client rejoined (IDisconnected callback)');
        console.log(data);
        $('#userCount').text(data.length);
        $.extend(userCollection, createUserCollection(data));
    };
});