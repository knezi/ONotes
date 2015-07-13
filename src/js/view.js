viewscope=null
ONotes.controller('view', ['$scope', function($scope) { viewscope=$scope
	hideDrawer()
	$("#header .menu").show()
	$("#header .back").hide()
	$("#header .new").show()
		.unbind('click')
		.click(function() {
			notes.editing={
				head:null,
				text:"",
				new:true,
				time:null,
				color:1
			}
			window.location="#new"
		})
	$("#header .color").hide()
	setTitle("O Notes")
	viewscope.notes=notes

	$scope.clickNote=function(note) {
		notes.editing={
			head:note.head,
			text:note.text,
			new:false,
			time:null,
			color:note.color,
			id:note.id
		}
		window.location="#new"
	}
}]);
