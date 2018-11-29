function uploadExcelController($stateParams, notification, $scope, $rootScope, Restangular, $timeout, $q) {
  
    $rootScope.currPlayerSelected = {};
    $rootScope.teamsList = [];

    $scope.matrix = [];
    $scope.playerChoice = '1';
    $scope.teamChoice = '';
    $scope.currPlayersList = [];
    $scope.playerNumberToIdMap = [];
    $scope.dataForCloud = [];

    // notification is the service used to display notifications on the top of 
    // the screen
    this.notification = notification;

    function getTeams(){
    	Restangular.one('teams')
    	.get()
		.then(function(result){
            if(result.data)
                result = result.data;
			var temp = result.plain();
            $rootScope.teamsList = temp;
		})
		.catch(function(error){
			return false;
		});
    };

    getTeams();

    /**
     * UPLOAD FUNCTION (ALSO CLEANS DATA)
     */

    function uploadRead(workbook) {

        function transposeMatrixArr(matrix){
          return matrix[0].map(function(col, i) { 
            return matrix.map(function(row) { 
              return row[i];
            })
          });
        }
        
        var sheet       = workbook.Sheets.Sheet1;
        var letter;
        var matrix      = [];
        var matrixObj   = {};
        var temp;
        var currPlayer;
        var playerArray = {};

        $scope.playerArray = [];
        $scope.dataForCloud = [];
        $scope.matrix = [];
        
        // make matrix 
        for(var i in sheet){
          letter = i.substr(0,1);
          if(letter != '!'){
            if(!matrixObj[letter])
              matrixObj[letter] = [];
            if(sheet[i].w)
              temp = sheet[i].w;
            else
              temp = sheet[i].v;
            matrixObj[letter].push(temp);
          }
        }

        // convert matrix object to 2 dimensional array
        for(var i in matrixObj){
            matrix.push(matrixObj[i]);
        }

        // get header row
        var headerRow = [];
        for(var column in matrix){
            headerRow.push(matrix[column][0]);
            matrix[column].splice(0,1);
        }

        // get rid of unnecessary columns 
        // 1. analyzing the first row of the spreadsheet
        // 2. create a map of labels to array keys, for use below
        var tempMatrix = [];
        var tempArray = new Array(matrix[0].length);
        var matrixMap = [];
        var newIndex;

        if(headerRow[1] == 'Date'){
            headerRow.splice(1,0,'Jersey');
            matrix.splice(1,0,tempArray);
            matrix[1][0] = 'Jersey';
        }else{
            headerRow[1] = 'Jersey';
        }
        for(var key in headerRow){
            var columnName = headerRow[key];
            if(
                columnName == 'Player' 
                || columnName == 'Date' 
                || columnName == 'Time' 
                || columnName == 'Strength'     
                || columnName == 'Jersey'
            )
            {
                newIndex = tempMatrix.push(matrix[key]);
                matrixMap[columnName] = newIndex - 1;
            }
        }

        // add columns for "pulls" and "raw data"
        newIndex = tempMatrix.push(tempArray);
        matrixMap['Pulls'] = newIndex - 1;
        newIndex = tempMatrix.push(tempArray);
        matrixMap['RawData'] = newIndex - 1;
        
        matrix = angular.copy(tempMatrix);

        // transpose the matrix
        var matrix = transposeMatrixArr(matrix);

        // clean up the data
        var key;
        var tempMatrix = [];

        // merge date and time columns and convert to JS Date object
        for(var i in matrix){
            key = i;
            if(!tempMatrix[key]){
                tempMatrix[key] = [];
            }
            temp = matrix[key][matrixMap['Date']] + ' ' + matrix[key][matrixMap['Time']];
            temp = new Date(temp);
            matrix[key][matrixMap['Date']] = temp;
            matrix[key].splice(matrixMap['Time'],1);
            matrix[key][matrixMap['Pulls']] = 1; // pulls
            // make a pull object
            var pullObj = {
                1: {
                    mainValue: matrix[key][3],
                    rawData: 'none'
                }
            }
            matrix[key][matrixMap['RawData']] = pullObj;
            tempMatrix.push(matrix[key]);
        }
        matrix = angular.copy(tempMatrix);

		$scope.$apply(function(){
			$scope.matrix = matrix;
		});

		// get list of players from matrix
        for(var i in matrix){
            if(typeof matrix[i][0] != 'undefined'){
    			currPlayer = matrix[i][0];
                // add this pitcher number to array for use in view
    			if(!(currPlayer in playerArray)){
    				playerArray[matrix[i][0]] = [];
    			}
                // add to array for mapping player id from db to player number
                if(!(currPlayer in $scope.playerNumberToIdMap)){
                    $scope.playerNumberToIdMap[matrix[i][0]] = '';
                }
    			playerArray[matrix[i][0]].push(matrix[i]);
            }
		}
        
        // delete the first array, because it will be filled with all the blank 
        // cells in the original spreadsheet
        delete playerArray[0];

        // add data to $scope
		$scope.$apply(function(){
            var newData = angular.copy(playerArray);
			$scope.playerArray = playerArray;
            $scope.dataForCloud = newData;
		});

	}

	$scope.uploadRead = uploadRead;

    /**
     * FUNCTIONS FOR BUTTONS ON TEMPLATE
     */

    $scope.choosePlayer = function(number){
        $scope.playerChoice = number;
    };

    $scope.updatePlayerForData = function(playerNumber){
        // add the pitcher id to the data being sent to cloud
        var pitcher = $rootScope.currPlayerSelected[playerNumber];
        var id = pitcher.id;
        $scope.playerNumberToIdMap[playerNumber] = id;
    }

    $scope.updatePlayerList = function(){
        var team = $scope.teamChoice;
        var teamId = team.id;
        Restangular.one('pitchers')
        .get({team: teamId})
        .then(function(result){
            if(result.data)
                result = result.data;
            var temp = result.plain();
            $scope.currPlayersList = temp;
        })
        .catch(function(error){
console.log('error',error);
        });
    }

    $scope.deleteLine = function(pitcherNumber,row,rowKey){
        $scope.dataForCloud[pitcherNumber].splice(rowKey,1);
    }

    $scope.mergeLines = function(playerNumber){
        var mergedData = [];
        var data = angular.copy($scope.dataForCloud[playerNumber]);
        var lastArray;

        for(var i in data){
            if(!lastArray){
                lastArray = data[i];
            }else{
                // push the lastArray to new array
                // if current element gets merged
                var temp =  data[i][2] - lastArray[2];
                if(temp < 300000){
                    var averageStrength = (parseFloat(lastArray[3]) + parseFloat(data[i][3])) / 2;
console.log('averageStrength',averageStrength);
                    var pullsObj = {
                        1: {
                            mainValue: lastArray[3],
                            rawData: 'none'
                        },
                        2: {
                            mainValue: data[i][3],
                            rawData: 'none'
                        }
                    }
                    lastArray[5]++;
                    lastArray[3] = averageStrength;
                    lastArray[6] = pullsObj;
                    data.splice(i,1);
                }
console.log('lastArray',lastArray);
                mergedData.push(lastArray);
                lastArray = data[i];
            }
        }
        $scope.dataForCloud[playerNumber] = mergedData;
    }

    $scope.undoProcessing = function(playerNumber){
        $scope.dataForCloud[playerNumber] = angular.copy($scope.playerArray[playerNumber]);
    }

	$scope.uploadError = function (e) {
		/* DO SOMETHING WHEN ERROR IS THROWN */
		console.log(e);
	}

	$scope.uploadToCloud = function(playerNumber){

        // CHECK: has pitcher been selected in dropdown?
        if($scope.playerNumberToIdMap[playerNumber] == ''){
            notification.log('need to choose a pitcher');
            return false;
        }

        var promises = [];
        var dataArray = $scope.dataForCloud[playerNumber];
        
        var pitcherId = [];
        pitcherId.push($scope.playerNumberToIdMap[playerNumber]);

        // CHECK: see if lines already saved
        var getForPitcher = { pitcher: pitcherId};
        Restangular.one('pitching-data').get(getForPitcher)
        .then(function(result){
            result = result.plain();

            var uploaded = 0;
            var notUploaded = 0;
            for(var i in dataArray){
                var doNotUpload = false;
                for(var j in result){
                    if(result[j]['originalPullTimestamp'] && doNotUpload==false){
                        var tempDate = new Date(result[j]['originalPullTimestamp']);
                        if(dataArray[i][1].getTime() == tempDate.getTime())
                            doNotUpload = true;
                    }
                }
                if(doNotUpload){
                    notUploaded++;
                }else{
                    uploaded++;
                    var data = {
                        mainValue: parseFloat(dataArray[i][3]).toString(),
                        originalPullTimestamp: dataArray[i][1],
                        pitcher: pitcherId,
                        pulls: dataArray[i][5]
                    };
                    promises.push(Restangular.all('pitching-data').customPOST(data));
                }
            }
// notification.log(uploaded + ' were uploaded, ' + notUploaded + ' were not uploaded.');
            $q.all(promises).then(function(result){
                // result contains array of all objects saved in api backend (as Restangular objects)
                // to get just the data, on each result do:
                //   var line = result[0].plain();
                notification.log(uploaded + ' were uploaded, ' + notUploaded + ' were not uploaded.');
            });
        });
	}

};

uploadExcelController.inject = ['$stateParams', 'notification', '$scope', '$rootScope', 'Restangular', '$timeout', '$q'];

export default uploadExcelController;