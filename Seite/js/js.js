

$(document).ready(function(){
	$("#ajaxCall_checkIban").click(function(e){
		var iban = document.getElementById("ibanValue").value;
		var link = "https://openiban.com/validate/"
		var res = link.concat(iban)
		
		$.ajax({
				// replace with
									// dynamic value
			data: { // pass additional options
				"validateBankCode": true, 	// (not guaranteed)
				"getBIC": true 			// (not guaranteed)
			},
			url: 'https://openiban.com/validate/' + iban,
			success: function(data) {
				var result = data;
				/*var ourRequest = new XMLHttpRequest();
				ourRequest.open('GET',res); 
				ourRequest.send('NULL');
				var resp = ourRequest.responseText;*/
				if(result.valid) {
					$("#ibanDiv").addClass("has-success");
					alert("Tsdasadsadest");
				}else{
					$("#ibanDiv").addClass("has-error");
					alert("VALID FALSE");
				}
			},
			error: function(xhr) {
				alert("CONNECTION FAILED")
			}
		});
		
	});
	
	
	
});