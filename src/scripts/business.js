function BusinessController($rootScope, $scope, gameService, playerService, cacheService) {
	// BUSINESS
	$scope.possibleOpportunities = [
		"Meet with clients.",
		"Meet with investors.",
		"Conduct business meeting at the golf course.", 
		"Buy expensive steaks on the company card.", 
		"Power nap during meeting.",
		"Analyze information.",
		"Evaluate options.",
		"Meditate.",
		"Prioritize objectives.",
		"Streamline workforce.",
		"Push the envelope.",
		"Break your limits.",
		"Perform market research.",
		"Center your chi.",
		"Attend leadership conference.",
		"Host leadership conference.",
		"Network with business leaders."
	];
	$scope.opportunity = $scope.possibleOpportunities.randomElement();

	$scope.doBusiness = function(curr, event) {
		var cp = cacheService.clickPower(),
			offsetX = 4, offsetY = 16,
			randomSpead = 32;
		playerService.money += cp;
		playerService.totalMoney += cp;
		playerService.totalMoneyFromOpportunties += cp;
		playerService.totalOpportunities++;

		if(!playerService.hideNumberPops) {
			$rootScope.$broadcast('spawnText', {
				text: cp, 
				x: event.x - offsetX - Math.random() * randomSpead + randomSpead / 2,
				y: event.y - offsetY - Math.random() * randomSpead + randomSpead / 2,
				time: new Date()
			});
		}

		while($scope.opportunity == curr)
			$scope.opportunity = $scope.possibleOpportunities.randomElement();
	};

	// STORE
	$scope.items = gameService.items;
	$scope.boughtItems = playerService.items;
	
	$scope.currentPrice = function(item) {
		var priceIncrease = .2; // 20% per item already bought
		return item.price + (playerService.getItem(item.id).count * item.price * priceIncrease);
	}
	
	$scope.getMps = function(item) {
		return item.mps + $scope.getUpgradesMps(item.id);
	}

	// Get the mps that should be added in from the upgrades for the specified item
	$scope.getUpgradesMps = function(id) {
		return playerService.upgrades.reduce(function(prev, cur) {
			var upgrade = gameService.getUpgrade(cur.id);
			return prev += upgrade.itemId == id ? upgrade.mps : 0;
		}, 0);
	};

	$scope.getCount = function(id) {
		return playerService.getItem(id).count;
	}

	$scope.cantBuyStoreItem = function(item) {
		return $scope.currentPrice(item) > playerService.money;
	};

	$scope.buyStoreItem = function($event, item) {
		var count = 1;
		if($event.shiftKey && $event.altKey) count = 1000;
		else if($event.shiftKey) count = 10;
		else if($event.altKey) count = 100;

		for(var i = 0; i < count; i++) {
			if(!$scope.cantBuyStoreItem(item)) {
				playerService.money -= $scope.currentPrice(item);
				playerService.buyItem(item.id);
			}
		}

		$rootScope.$broadcast('updateCache');
	};

	// UPGRADES
	$scope.upgrades = gameService.upgrades.sort(function(a, b) {
		if(a.price > b.price) return 1;
		if(a.price < b.price) return -1;
		return 0;
	});
	$scope.boughtUpgrades = playerService.upgrades;

	$scope.alreadyBought = function(id) {
		return playerService.getUpgrade(id).id != -1;
	}

	$scope.cantBuyUpgrade = function(upgrade) {
		var notEnoughMoney = upgrade.price > playerService.money;
		return notEnoughMoney || $scope.alreadyBought(upgrade.id);
	};
	
	$scope.buyUpgrade = function(upgrade) {
		if(!$scope.cantBuyUpgrade(upgrade)) {
			playerService.money -= upgrade.price;
			playerService.buyUpgrade(upgrade);
			$rootScope.$broadcast('updateCache');
		}
	};

	// Get the name of the item the upgrade applies to.
	// id is the itemId
	$scope.getItemName = function(id) {
		var name = gameService.getItem(id).name
		return name ? name : id;
	}

	// Only show upgrades for items you've actually bought
	$scope.canShowUpgrade = function(upgrade) {
		// Make sure you own all pre requisit upgrades for this specific upgrade
		var haveAllPrereq = true;
		if(upgrade.showAfter) {
			haveAllPrereq = upgrade.showAfter.reduce(function(prev, cur) {
				return prev && $scope.alreadyBought(cur);
			}, true);
		}

		return haveAllPrereq && 
			(playerService.getItem(upgrade.itemId).count > 0 || !!upgrade.isBusiness) &&
			(!$scope.alreadyBought(upgrade.id) || !playerService.hideBoughtUpgrades);
	}
};

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}