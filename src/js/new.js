ONotes.controller('new', ['$scope', function($scope) {
	hideDrawer();
	$("#header .menu").hide()
	$("#header .back").show()
	$("#header .new").hide()
	$("#header .color").show()
	setTitle("<input type='text' placeholder='New note'>")
	$("#new_note").addClass('c'+notes.editing.color)
	function setSize() {
		console.log('Setting size...')
		height=$(window).height()-50-30-1 // 50px header, 30px padding
		$("textarea").css({height:height+"px"})
		width=$("#header").width()-40-30-5 // 40px color, 30px back
		$("#header input").css('width',width+'px')
	}
	$(window).resize(setSize)
	setSize()

	if(notes.editing.head==null)
		$("#header input").val('')
	else
		$("#header input").val(notes.editing.head)

	lastSave=Date.now()
	characters=notes.AUTOSAVE_CHAR

	$("textarea").val(notes.editing.text)
		.unbind('keyup')
		.keyup(function() {
			if(notes.editing.head==null && $(this).val().length<15)
				$("#header input").val($(this).val().substr(0,15))
			notes.editing.text=$(this).val()

			if(localStorage.getItem('autosave')=='true') {
				characters--;

				if(Date.now()-lastSave>notes.AUTOSAVE_TIME*1000 || characters<1) { // every 60 seconds or every 60 characters

					lastSave=Date.now()
					characters=notes.AUTOSAVE_CHAR
					notes.save(false)
				}
			}
	})

	$("#header input").unbind('keyup')
		.keyup(function() {
		notes.editing.head=$(this).val()
	})
	
	
	$("#pick_color span").unbind('click')
		.click(function(e){
		$("#new_note").removeClass().addClass(e.currentTarget.className)
		notes.editing.color=e.currentTarget.className.substr(1)
		$("#pick_color").css({top:"-50px"})
	});

	$("#header .back").unbind('click')
		.click(function(){
			notes.editing.head=$("#header input").val() // because of autocorection
			notes.editing.text=$("textarea").val()
			notes.save(true)
			window.location="#view"
	})

	$("#header .color").unbind('click')
		.click(function(){
		$("#pick_color").css({top:0})
	})

	$("#erase").unbind('click')
		.click(function(){
			notes.erase()
	})
}]);
