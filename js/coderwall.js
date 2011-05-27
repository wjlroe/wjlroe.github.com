function coderwall(data) {
    aside = $('#coderwall').first();
    console.log(data);
    console.log(aside);
    aside.append('<h3>My Github acceivements</h3><ul>');
    data.badges.each(function(elem) {
			 aside.append('<li>');
			 aside.append("<img src='"+elem.badge+" />");
			 aside.append('</li>');
		     });
    aside.append('</ul>');
}

$(document).ready(function(){
		      $.ajax({ url: window.coderwall_location, 
			       error: function(xhr, error_type, error) {
				   console.log(xhr);  
				   console.log(error_type);
				   console.log(error);
			       },
			       success: coderwall });
		  });