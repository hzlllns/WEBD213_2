(function(obj) {
    
    // Constants, variables that should never change at runtime
    var CONST = {
        objTypeClassPrefix: "objType",  // the class the changes the look of the tile based on type
        dataTypeAttr: "data-type",      // the data- attribute name
        currentMatchedSel: ".currentMatched",
        totalMatchedSel: ".totalMatches",
        gameOverSel: ".gameOver",
        resultsSel: ".results",
        numTypes: 3                     // There are 2 types of matching objects
    };

    // Object variables (like instance variables)
    var _gridArr;   
    var _score = 0;
    var _numTileRows = 1;
    var _numTileColumns = 1;
    var _minNumMatchingTiles = 3;
    var _numMatchesToWin = 1;
    var _currentNumMatches = 0;
    var _gameOver = false;

    // gridArray - pass $('.tile'), assuming sorted
    // numTilesRow (the y-axis) -- these 2 should be equal, e.g. 4 so that the grid is 4x4=16
    // numTilesColumns (the x-axis)
    // numMatchesToWin - how many sets of matches to win game
    var _init = function _init(gridArray, numTileRows, numTileColumns,  numMatchesToWin) {

        // Assign to object variables
        _gridArr = gridArray;      
        _numTileRows = numTileRows;
        _numTileColumns = numTileColumns;
        _numMatchesToWin = numMatchesToWin;
        
        $(CONST.currentMatchedSel).html(_currentNumMatches);
        $(CONST.totalMatchedSel).html(_numMatchesToWin);
        $(CONST.resultsSel).hide();

        // Setup the tile buttons to receive input
        _gridArr.on("click", function(e) {
            e.preventDefault();
            _selectTile($(e.currentTarget));
            _selectTile.addClass('selected');
        });

        _randomizeTiles();
    };


    var _selectTile = function _selectTile(selectedTileJQObj) {
        // Once the game is over, no longer process the tiles
        if(!_gameOver) {
             _checkForMatches(selectedTileJQObj);
         }

    };

    var _checkForMatches = function _checkForMatches(selectedTileJQObj) {

        // The id of the selected tile.
        var lookingForTypeId = selectedTileJQObj.attr('data-type');

        var inCol = parseInt(selectedTileJQObj.attr('data-x'));
        var inRow = parseInt(selectedTileJQObj.attr('data-y'));
       
        var matches = []; // this will contain all matching tiles

        // Now look in the column and row where that tile exists for matches
        // that overlap this tiles location
       
        // Check the row the tile is in for consecutive matches 
        // We go across a single row checking all columns in that row
        var rowMatches = [];             
        for(var col=0; col < _numTileColumns; col++) {
        
            var currentTile = $(_gridArr[inRow * _numTileRows + col])
            
            if(currentTile.attr('data-type') == lookingForTypeId) {
              
                rowMatches.push(currentTile);                   
               
            } else {                   
                // Reset because we found something different
                // i.e. didn't match the tile before it.

                // But first, Did we reach the min num of matching?
                if(rowMatches.length >= _minNumMatchingTiles) {
                   
                    // We have enough matching type ids BUT is the 
                    // selected tile in that same set
                    if(_isTileInSet(inCol, inRow,rowMatches)) {
                       
                        matches = rowMatches.slice(0);
                        rowMatches = [];
                    } 
                } 
                rowMatches = [];
            }
        }
        // If left over matches, check one last time...
        if(rowMatches.length >= _minNumMatchingTiles) {
            matches = rowMatches.slice(0);
        }
       

        // Check the rows
        var colMatches = [];  
        for(var row=0; row < _numTileRows; row++) {
            var currentTile = $(_gridArr[row * _numTileRows + inCol])
            
            if(currentTile.attr('data-type') == lookingForTypeId) {
              
                colMatches.push(currentTile);
             
            } else {
              
                // Reset because we found something different
                // i.e. didn't match the tile before it.
                //numSameDataTypes = 0;

                // Did we reach the min num of matching?
                if(colMatches.length >= _minNumMatchingTiles) {
                   
                    //console.log(selectedTileJQObj)

                    if(_isTileInSet(inCol, inRow, colMatches)) {
                       
                        matches = matches.concat(colMatches); 
                        colMatches = [];
                    } else {
                      
                    }
                } 
                colMatches = [];
            }
        }

        // If left over matches, check one last time...
        if(colMatches.length >= _minNumMatchingTiles) {
            matches = matches.concat(colMatches); 
        }

        if(matches.length > 0) {
            _matchesFound(lookingForTypeId, matches);
        } else {
            _noMatchesFound(lookingForTypeId);
        }

    }

    // Checks the x and y (column and row positions) against all tiles in 
    // the array to determine if the x and y tile exists in it.
    // Returns true if it does, otherwise false
    var _isTileInSet = function _isInSet(tileX, tileY, arrayOfTiles) {
        var len = arrayOfTiles.length;
        var found = false;
        var x, y;

        for(var i=0; i < len; i++) {
            x = parseInt($(arrayOfTiles[i]).attr("data-x"));
            y = parseInt($(arrayOfTiles[i]).attr("data-y"));            
           
            if(x == tileX && y == tileY)
                found = true;

        }
        return found;
    }


    var _matchesFound = function _matchesFound(id, matches) {

        $.each(matches, function(index, tile) {
            tile.addClass('matched');
        });
        _updateScore(1);
        window.setTimeout(_replaceMatched, 500); 
        
        _reset();
    };

  

    var _noMatchesFound = function _noMatchesFound(id) {                       
        _reset();       
    };

    var _replaceMatched = function _replaceMatched() {
        var matches = $('.tile.matched');
        var num = 1;
        $.each(matches, function(index, tile) {
             var tile = $(tile);
             tile.removeClass('matched');
            num = Utils.randomNum(CONST.numTypes);
            tile.attr(CONST.dataTypeAttr, num);
             // Remove the class pertaining to the tile type
            $.each(tile.attr("class").split(" "), function(i, o) {
                if(o.indexOf(CONST.objTypeClassPrefix) != -1){
                    tile.removeClass(o);
                }
            });
            tile.addClass(CONST.objTypeClassPrefix + num);
        });

    }

    // Resets the tiles so none are selected and ready for input
    var _reset = function _reset() {
        _gridArr.removeClass('selected');
    };

    // Updates the number of matches that have been achieved so far
    // Currently, the game gives 1 point for each successful match,
    // no matter how many objects were matched in that one selection.
    var _updateScore = function _updateScore(addPtsToScore) {
        _currentNumMatches += addPtsToScore;

        $(CONST.currentMatchedSel).html(_currentNumMatches);

        if(_currentNumMatches >= _numMatchesToWin) {
            _gameOver = true;
            $(CONST.gameOverSel).html("Great job!\nYou&#8217;ve snacked your way to the top!");  
            $(CONST.resultsSel).show();          
            _gridArr.addClass('gameWon');
        }

        //$(totalMatchedSel).html(_numMatchesToWin)

    }

    /// Go through all the elements in the grid and just change their
    /// types. To do so, we'll have to change the objType# class assigned
    /// and the data-type attribute.
    var _randomizeTiles = function _randomizeTiles() {
        var num = 0;
        $.each(_gridArr, function(index, tile) {
            var tile = $(tile);
            // Random
            num = Utils.randomNum(CONST.numTypes);
           
            tile.attr(CONST.dataTypeAttr, num);
            // Remove the class pertaining to the tile type
            $.each(tile.attr("class").split(" "), function(i, o) {
                if(o.indexOf(CONST.objTypeClassPrefix) != -1){
                    tile.removeClass(o);
                }
            });
            tile.addClass(CONST.objTypeClassPrefix + num);
            
        });
       //_gridArr = Utils.shuffle(_gridArr);
    };


    // Expose functions (like public methods)
    obj.init = _init;   
    //obj.randomizeTiles = _randomizeTiles;

})(window.PuzzleGame = window.PuzzleGame || {});