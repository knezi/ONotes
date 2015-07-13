ONotes.controller('settings', ['$scope', function($scope) {
	hideDrawer();
	setTitle("Settings");
	
	if(localStorage.getItem('autosave')=='false')
		$("input:checkbox").prop('checked', false)
	else
		$("input:checkbox").prop('checked', true)

	$("input:checkbox").unbind('change')
		.change(function() {
		if($("input:checkbox").prop('checked'))
			localStorage.setItem('autosave', 'true')
		else
			localStorage.setItem('autosave', 'false')
		})

	for(var i=0;i<6;i++)
		$("input.c"+(i+1)).val(notes.labels[i])

	$("input:text").unbind('keyup')
		.keyup(function() {
			for(var i=0;i<6;i++)
				notes.labels[i]=$("input.c"+(i+1)).val()
				localStorage.setItem('labels', JSON.stringify(notes.labels))
		})
}]);
