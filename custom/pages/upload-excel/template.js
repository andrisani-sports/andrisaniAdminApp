var uploadExcelTemplate =
`<!--  ROW  -->
<div class="row">
	<div class="col-lg-12">
    	<ma-view-actions><ma-back-button></ma-back-button></ma-view-actions>
    	<div class="page-header">
        	<h1>Data in Excel</h1>
    	</div>
	</div>
</div>

<!--  ROW  -->
<div class="row" style="margin-bottom: 20px;">
	<div class="col-md-5">
		<span style="font-weight: 700;">1. Choose Team</span>
		<br/>
		<select 
			ng-model="teamChoice"
			name="teamList"
			ng-change="updatePlayerList()"
			ng-options="option.name for option in $root.teamsList track by option.id"
		>
		</select>
	</div>
    <div class="col-md-6">
    	<span style="font-weight: 700;">2. Upload Worksheet </span>
    	<js-xls onread="uploadRead" onerror="uploadError"></js-xls>
    </div>
</div>

<!--  ROW  -->
<div class="row">
    <div class="col-lg-12">
    	<h4>Data for upload to cloud</h4>
    	<ul class="nav nav-pills">
		  <li ng-repeat="(playerNumber,playerData) in playerArray" ng-class="{active: playerNumber == playerChoice}">
		  	<a ng-click="choosePlayer(playerNumber)" style="background-color:#1A6199;">Player {{playerNumber}}</a>
		  </li>
		</ul>
		<div class="tab-content" style="margin-top: 20px;overflow:auto;">
			<div ng-if="!playerArray">NO DATA FOUND YET</div>
		  	<div ng-repeat="(number,playerData) in playerArray" id="player{{playerNumber}}" ng-show="playerChoice == number">
				<div class="col-lg-6">
					<h4>Raw data from Excel worksheet</h4>
			    	<table class="table table-striped table-bordered">
			    		<thead>
			    			<tr>
			    				<th>Player</th>
			    				<th>Date Pulled</th>
			    				<th>Strength</th>
			    			</tr>
			    		</thead>
			    		<tbody>
			    			<tr ng-repeat="(key,row) in playerData">
			    				<td>{{row[0]}}</td>
			    				<td>{{row[2] | date:'medium'}}</td>
			    				<td>{{row[3]}} lbs.</td>
			    			</tr>
			    			<tr ng-if="matrix.length == 0">
			    				<td colspan="3">No Data Available Yet</td>
			    			</tr>
			    		</tbody>
			    	</table>
			    </div>
		    	<div class="col-lg-6">
			    	<h4>Processed data for upload</h4>
			    	Choose pitcher: <select 
						ng-model="$root.currPlayerSelected[number]"
						name="teamList{{number}}"
						ng-change="updatePlayerForData(number,this)"
						ng-options="option.name for option in currPlayersList track by option.id"
						style="" 
					></select>
					<a class="btn btn-default btn-sm pull-right" ng-click="mergeLines(number)" role="button">Merge</a>
					<a class="btn btn-default btn-sm pull-right" ng-click="undoProcessing(number)" role="button" style="margin-right:5px;">Undo</a>
				  	<table class="table table-striped table-bordered" style="margin-top:10px;">
			    		<thead>
			    			<tr>
			    				<th>Date Pulled</th>
			    				<th>Strength</th>
			    				<th>Pulls</th>
			    				<th>Actions</th>
			    			</tr>
			    		</thead>
			    		<tbody>
			    			<tr ng-if="matrix.length > 0" ng-repeat="(rowKey,row) in dataForCloud[number]">
			    				<td>{{row[2] | date:'medium'}}</td>
			    				<td>{{row[3]}} lbs.</td>
			    				<td>{{row[5]}}</td>
			    				<td><button ng-click="deleteLine(number,row,rowKey)"><i class="fa fa-trash-o"></i></button></td>
			    			</tr>
			    			<tr ng-if="matrix.length == 0">
			    				<td colspan="3">No Data Available Yet</td>
			    			</tr>
			    		</tbody>
		    		</table>
		    		<a class="btn btn-default btn-sm" ng-click="uploadToCloud(number)" role="button">Upload</a>
				</div><!-- end .col-lg-6 -->
			</div><!-- end ng-repeat -->
		</div><!-- end .tab-content -->
    </div><!-- end .col-lg-12 -->
</div><!-- end .row -->`;

export default uploadExcelTemplate;