(function(obj) {
    
    // Random number between 1 and max
    var _randomNum = function _randomNum(max) {
        return Math.floor((Math.random() * max) + 1);
    };

    obj.randomNum = _randomNum;

})(window.Utils = window.Utils || {});