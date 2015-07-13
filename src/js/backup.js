ONotes.controller('backup', ['$scope', function($scope) {
	hideDrawer();
	$("#header .menu").show()
	$("#header .back").hide()
	$("#header .new").show()
	$("#header .color").hide()
	setTitle("Backup");
	$("#backup select").val(localStorage.getItem('backup'))
		.unbind('change')
		.change(function() {
			localStorage.setItem('backup', $("#backup select").val())
			notes.testBackup()
		})

	$("#export").unbind('click')
		.click(function() {
			notes.backup()
		})

	$("#import").unbind('click')
		.click(function() {
			notes.import()
		})
}]);
