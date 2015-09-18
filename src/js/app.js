// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var ONotes = angular.module('ONotes', ['ngRoute']);

ONotes.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/view', {
				templateUrl: 'partials/view.html',
				controller: 'view'
			}).
			when('/settings', {
				templateUrl: 'partials/settings.html',
				controller: 'settings'
			}).
			when('/note', {
				templateUrl: 'partials/note.html',
				controller: 'note'
			}).
			when('/about', {
				templateUrl: 'partials/about.html',
				controller: 'about'
			}).
			when('/backup', {
				templateUrl: 'partials/backup.html',
				controller: 'backup'
			}).
			when('/new', {
				templateUrl: 'partials/new.html',
				controller: 'new'
			}).
			otherwise({
				redirectTo: '/view'
			});
}]);

function setTitle(title) {
	$("#header .label").html(title);
}

function hideDrawer() {
	$("#background_body").css("transform", "translateX(0)");
	$("#moving_body").css({"opacity":"1"})
	$("#body").css({"pointer-events":"auto"})
}

$(document).ready(function(){
	$("#body").css({height:Math.max($(window).height())+"px"})
	$("#background_body").css({height:Math.max($(window).height())+"px"})
	$(window).resize(function() {
		$("#body").css({height:Math.max($(window).height())+"px"})
		$("#background_body").css({height:Math.max($(window).height())+"px"})
	})

	$("#header .menu").click(function() {
		$("#background_body").css("transform", "translateX(80%)")
		$("#moving_body").css({"opacity":"0.5"})
		$("#body").css({"pointer-events":"none"})
		can=false
		$(document).click(function(e) {
			if(can) {
				$(document).unbind('click')
				hideDrawer()
			}
			can=true
		})
	});
});

var notes={
	DB_STORE_NAME:"notes", 	// name of table in DB which is equal to store name
	DB_VERSION:1,				// version of database (because of update 
	DB_NAME:"notes",			// name of database
	AUTOSAVE_TIME:30,
	AUTOSAVE_CHAR:30,
	notes:[],
	labels:[],
	db:null,
	/**
	* get object store with mode ={readonly, readwrite}
	*/
	getOS:function(mode) {
		if(this.db!=null)
			return this.db.transaction(this.DB_STORE_NAME, mode).objectStore(this.DB_STORE_NAME);
	},

	getLabel: function(color) {
		if(color>0 && color<7)
			return this.labels[color-1]
		return ""
	},

	init: function() {
		if(localStorage.getItem("version")==null) {
			localStorage.setItem('version', '1')
			localStorage.setItem('labels', JSON.stringify(['','','','','','']))
			localStorage.setItem('backup', '0')
			localStorage.setItem('autosave', 'false')
			localStorage.setItem('lastbackup', '0')
		}
		this.labels=JSON.parse(localStorage.getItem('labels'))

		// check an instance
		if(!window.indexedDB) {
			alert("Browser does not support databases.");
		}else{
			/*
			* open indexed Database and show saved data
			*/
			var request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
			request.onerror = function(event) {
					alert("An error occured " + event.target.errorCode);
			};
			
			request.onupgradeneeded = function(event) { // vytvoř v případě neexistence
					this.db=event.target.result;
					var os=this.db.createObjectStore("notes", {keyPath:"id", autoIncrement: true});
					os.createIndex("head", "head");
					os.createIndex("text", "text");
					os.createIndex("color", "color");
					os.createIndex("time", "time");
			};

			scope=this
			request.onsuccess = function(event) {
				scope.db = this.result;
				var os=scope.getOS("readonly");
				os.openCursor(null, 'prev').onsuccess = function(e) {
					var cursor = e.target.result;
					if (cursor) {
						scope.notes.push({head:cursor.value.head, text:cursor.value.text, color:cursor.value.color, id:cursor.value.id, time:cursor.value.time})
						console.log(cursor.value)
						cursor.continue();
					}else{/* no more entries */
						scope.testBackup() // make backup after loading everything
						if(viewscope!=null)
							viewscope.$apply()
					}
				};
				/*var os=scope.getOS("readwrite");
				obj={time:Date.now(), head: "pozn_head", text: "text dlouhy", color: 6};
				req = os.add(obj);*/
			}
		}
	},

	editing: {
		head:null,
		text:"",
		new:true,
		time:null,
		color:1,
		id:-1
	},

	/*
	* save Note to the DB and show it
	*/
	save: function(updateView=true) {
		if(this.editing!=null && (this.editing.head!=null || this.editing.text!="")) {
			var os=this.getOS("readwrite");
			console.log('saving...')
			if(this.editing.new) {
				if(this.editing.head==null)
					head=this.editing.text.substr(0,15)
				else
					head=this.editing.head

				obj={time:Date.now(), head: head, text: this.editing.text, color: this.editing.color};
				req = os.add(obj);
				scope=this
				req.onsuccess=function(e) {
					// show it
					scope.notes.unshift({head:obj.head, text:obj.text, color:obj.color, id:req.result, time:obj.time})
					scope.editing={head:obj.head, text:obj.text, color:obj.color, id:req.result, time:obj.time, new:false}
					if(viewscope!=null) {
						viewscope.$apply()
					}
				} 
				req.onerror = function() {
					alert("Sorry, an error occured: " + this.error.message);
				}
			}else{
				var up=os.get(notes.editing.id);
				up.onsuccess=function(e) {
					data=e.target.result;
					data.head=notes.editing.head;
					data.text=notes.editing.text; // update content
					data.color=notes.editing.color;
					os.put(data).onsuccess=function(){
						for(var i=0;i<notes.notes.length;i++) {
							if(notes.notes[i].id==notes.editing.id) {
								console.log('updating entry '+i)
								notes.notes[i].head=notes.editing.head
								notes.notes[i].text=notes.editing.text
								notes.notes[i].color=notes.editing.color
								if(viewscope!=null) {
									viewscope.$apply()
								}
								break
							}
						}
					}
				}
			}
		}
	},

	erase: function() {
		if(this.editing.new==false) {
			if(confirm("Really delete this note?")) {
				os=this.getOS('readwrite')
				os.delete(this.editing.id)
				for(var i=0;i<this.notes.length;i++)
					if(this.editing.id==this.notes[i].id) {
						this.notes.remove(i)
						break
					}
				window.location='#view'
			}
		}
	},

	testBackup: function() {
		back=localStorage.getItem('backup')
		lastback=localStorage.getItem('lastbackup')
		diffDays=Math.floor(Date.now()/86400)-Math.floor(lastback/86400)
		if((back==1 && diffDays>0) ||
			(back==2 && diffDays>6) ||
			(back==3 && diffDays>30))
			this.backup()

	},

	backup: function() {
		console.log('backing up')
		setTimeout(function() {
		$("#backMsg").show()
			.fadeOut(3000)
		}, 10);

		var sdcard = navigator.getDeviceStorage("sdcard");
		var file = new Blob([
			"labels:\n"+JSON.stringify(this.labels)+
			"\n backup:\n"+localStorage.getItem('backup')+
			"\n autosave:\n"+localStorage.getItem('autosave')+
			"\n"+
			JSON.stringify(this.notes)
		], {type: "text/plain"});

		var date=new Date()

		var name=date.getFullYear()+'-'+((date.getMonth()+1<10)? '0':'')+(date.getMonth()+1)+'-'+((date.getDate()<10)?'0':'')+date.getDate()+'-'

		function save(i) {
			req=sdcard.get("ONotes-backup/"+name+i)
			req.onsuccess = function() {
				save(i+1)
			}

			req.onerror = function() {
				var request = sdcard.addNamed(file, "ONotes-backup/"+name+i)

				request.onsuccess = function () {
					console.log('File "' + name + i  + '" successfully wrote on the sdcard storage area')
					localStorage.setItem('lastbackup', Date.now())
				}

				request.onerror = function () {
					alert(this.error.message)
				}
			}
		}
		save(1)
	},

	import: function() {
		var sdcard = navigator.getDeviceStorage('sdcard')
		var cursor = sdcard.enumerate('ONotes-backup')
		list=[]
		scope=this

		cursor.onsuccess = function () {
			if (this.result) {
				var file = this.result;
				list.push(file.name.replace(/^.*\/([^/]*)$/, '$1'))
				this.continue()
			}else{
				console.log(list)
				$("#backup_settings").hide()
				var html='Choose the backup you want to recover:'
				for(var i=0;i<list.length;i++)
					html+='<li><button>'+list[i]+'</button></li>'

				$("#backup_list").show()
					.html(html)
					.children().each(function() {
						$(this).click(function() {
							console.log('recovering')
							req=sdcard.get("ONotes-backup/"+$(this).children().html())
							req.onsuccess = function() {
								var reader = new FileReader();
								reader.onload = function(e) {
									var tmp=e.target.result.split('\n')
									console.log(tmp)
									localStorage.setItem('labels', tmp[1])
									localStorage.setItem('backup', tmp[3])
									localStorage.setItem('autosave', tmp[5])

									data=JSON.parse(tmp[6]).reverse()
									if(data.length==0)
										alert('Succesfully recovered.')

									os=scope.getOS('readwrite')

									function addNext(i) {
										console.log(data)
										delete data[i].id
										req = os.add(data[i]);
										req.onsuccess=function(e) {
											console.log('success')
											if(data.length>i+1)
												addNext(i+1)
											else{
												alert('Succesfully recovered.')
												console.log('restarting...')
												window.location.reload()
											}
										}
									
										req.onerror = function() {

											console.log(this)
											alert("Sorry, an error occured: " + this.error.message);
										}
									}
									if(data.length>0)
										addNext(0)
								}
								
								reader.onerror = function() {
									alert("Error in Filereader occured, data was not recovered. Please, contact us." + this.error.message)
								}

								reader.readAsText(this.result);
							}

							req.onerror = function() {
								alert("Error occured, data was not recovered. Please, contact us." + this.error.message)
							}
						})
					})
			}
		}
	}
};

notes.init();
