var nowPlaying = {
    getRecentTracksURL: "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=getmicah&api_key=b4678efadfadbcf8882ed8e5432173b1&format=json",
    recentTrack: null,
    init: function() {
        this.cacheDom();
        this.loadMusicInfo();
    },
    cacheDom: function() {
        this.el = document.getElementById('nowPlaying');
    },
    getJSON: function(path, success) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        console.log(xhr);
                }
            }
        };
        xhr.open('GET', path, true);
        xhr.send();
    },
    loadMusicInfo: function() {
        this.getJSON(this.getRecentTracksURL, this.setMusicInfo.bind(this));
    },
    setMusicInfo: function(data) {
        var i = 0;
        while(i < 3) {
            var track = data.recenttracks.track[i];
            console.log(track.album['#text']);
            if (track.album['#text'] == null) {
                i++;
            } else {
                var artist = track.artist['#text'];
                var title = track.name.replace(/-/g, '~');;
                this.recentTrack = artist + " - " + title;
                break;
            }
        }
        this.render();
    },
    render: function() {
        this.el.innerHTML = this.recentTrack;
    }
}
nowPlaying.init();
