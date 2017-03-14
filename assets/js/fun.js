var shadowSwag = {
    pointerX: 0,
    pointerY: 0,
    pageWidth: null,
    pageHeight: null,
    originX: null,
    originY: null,
    shadowX: null,
    shadowY: null,
    shadowBlur: '8px',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    init: function() {
        this.cacheDom();
        this.setPageSize();
        this.setPageOrigin();
        this.bindEvents();
    },
    cacheDom: function() {
        this.el = document.getElementById("name");
    },
    setPageSize: function() {
        this.pageWidth = document.documentElement.clientWidth;
        this.pageHeight = document.documentElement.clientHeight;
    },
    setPageOrigin: function() {
        var position = this.el.getBoundingClientRect();
        this.originX = this.pageWidth / 2;
        this.originY = position.top + (position.bottom - position.top);
    },
    logPageOrigin: function() {
        console.log('ORIGIN:' + this.originX + ', ' + this.originY);
    },
    bindEvents: function() {
        document.onmousemove = this.setPointerLocation.bind(this);
    },
    setPointerLocation: function(event) {
        this.pointerX = event.pageX;
        this.pointerY = event.pageY;
        this.calculateShadow();
    },
    logPointerLocation: function() {
        console.log(this.pointerX + ',' + this.pointerY);
    },
    calculateShadow: function() {
        var deltaX = this.originX - this.pointerX;
        var deltaY = this.originY - this.pointerY;
        var angle = Math.atan2(deltaY, deltaX);
        var R = 0.05 * (Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));
        this.shadowX = R * Math.cos(angle);
        this.shadowY = R * Math.sin(angle);
        this.render();
    },
    render: function() {
        this.el.style.textShadow = this.shadowX + 'px ' +
                                   this.shadowY + 'px ' +
                                   this.shadowBlur + ' ' +
                                   this.shadowColor;
    }
}
shadowSwag.init();
