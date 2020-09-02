const ADMIN_ROLE = "ADMIN";
const CUSTOMER_ROLE = "CUSTOMER";
const EMAIL_SERVICE = "gmail";
const EMAIL_PORT = 2525;
const EMAIL_AUTH_USER_NAME = "dilan.extra214263@gmail.com";
const EMAIL_AUTH_USER_PASSWORD = "Dsa@214263";
const MAIL_OPTIONS_FROM = '"Phone case application" <dilan.extra214263@gmail.com>';
const RESET_PW_ACTION = "PASSWORD_RESET";
const ADMIN_MIDDLEWARE = "ADMIN_MIDDLEWARE";
const USER_MIDDLEWARE = "USER_MIDDLEWARE";
const MANAGER_MIDDLEWARE = "MANAGER_MIDDLEWARE";
const ADMIN_MANAGER_MIDDLEWARE = "ADMIN_MANAGER_MIDDLEWARE";
const ORDER_STATUSES = {
    DELIVERED:"DELIVERED",
    SHIPPED:"SHIPPED",
    PROCESSING: "PROCESSING",
    CONFIRMED: "CONFIRMED",
    REJECTED: "REJECTED",
    ACCEPTED: "ACCEPTED",
    CANCELLED: "CANCELLED"
}
const TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 31 * 3;
// EmailPwdResetSubject is the subject of the password reset email
const EMAIL_PWD_RESET_SUBJECT = "Money Xpress - Reset your password"
// EmailPwdResetHTML is the html-version of the password reset email
const EMAIL_PASS_RESET_HTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">
	
	<head>
	  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	  <meta name="viewport" content="width=device-width">
	  <meta name="format-detection" content="telephone=no">
	  <!--[if !mso]>
		  <!-->
	  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800,300&subset=latin" rel="stylesheet" type="text/css">
	  <!--<![endif]-->
	  <title>Money Xpress - Forgot Password</title>
	  <style type="text/css">
		*{
					  margin:0;
					  padding:0;
					  font-family:'OpenSans-Light', "Helvetica Neue", "Helvetica",Calibri, Arial, sans-serif;
					  font-size:100%;
					  line-height:1.6;
				  }
				  body{
					  -webkit-font-smoothing:antialiased;
					  -webkit-text-size-adjust:none;
					  width:100%!important;
					  height:100%;
				  }
				  a{
					  color:#348eda;
				  }
				  .btn-primary{
					  text-decoration:none;
					  color:#FFF;
					  background-color:#a55bff;
					  border:solid #a55bff;
					  border-width:10px 20px;
					  line-height:2;
					  font-weight:bold;
					  margin-right:10px;
					  text-align:center;
					  cursor:pointer;
					  display:inline-block;
				  }
				  .last{
					  margin-bottom:0;
				  }
				  .first{
					  margin-top:0;
				  }
				  .padding{
					  padding:10px 0;
				  }
				  table.body-wrap{
					  width:100%;
					  padding:0px;
					  padding-top:20px;
					  margin:0px;
				  }
				  table.body-wrap .container{
					  border:1px solid #f0f0f0;
				  }
				  table.footer-wrap{
					  width:100%;
					  clear:both!important;
				  }
				  .footer-wrap .container p{
					  font-size:12px;
					  color:#666;
				  }
				  table.footer-wrap a{
					  color:#999;
				  }
				  .footer-content{
					  margin:0px;
					  padding:0px;
				  }
				  h1,h2,h3{
					  color:#660099;
					  font-family:'OpenSans-Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
					  line-height:1.2;
					  margin-bottom:15px;
					  margin:40px 0 10px;
					  font-weight:200;
				  }
				  h1{
					  font-family:'Open Sans Light';
					  font-size:45px;
				  }
				  h2{
					  font-size:28px;
				  }
				  h3{
					  font-size:22px;
				  }
				  p,ul,ol{
					  margin-bottom:10px;
					  font-weight:normal;
					  font-size:14px;
				  }
				  ul li,ol li{
					  margin-left:5px;
					  list-style-position:inside;
				  }
				  .container{
					  display:block!important;
					  max-width:600px!important;
					  margin:0 auto!important;
					  clear:both!important;
				  }
				  .body-wrap .container{
					  padding:0px;
				  }
				  .content,.footer-wrapper{
					  max-width:600px;
					  margin:0 auto;
					  padding:20px 33px 20px 37px;
					  display:block;
				  }
				  .content table{
					  width:100%;
				  }
				  .content-message p{
					  margin:20px 0px 20px 0px;
					  padding:0px;
					  font-size:22px;
					  line-height:38px;
					  font-family:'OpenSans-Light',Calibri, Arial, sans-serif;
				  }
				  .preheader{
					  display:none !important;
					  visibility:hidden;
					  opacity:0;
					  color:transparent;
					  height:0;
					  width:0;
				  }
	  </style>
	</head>
	
	<body bgcolor="#f6f6f6">
	
	  <!-- body -->
	  <table class="body-wrap" width="600">
		<tr>
		  <td class="container" bgcolor="#FFFFFF">
			<!-- content -->
			<table border="0" cellpadding="0" cellspacing="0" class="contentwrapper" width="600">
			  <tr>
				<td style="height:25px; bgcolor="#cc33ff">
				</td>
			  </tr>
			  <tr>
				<td>
				  <div class="content">
					<table class="content-message">
					  <tr>
						<td>&nbsp;</td>
					  </tr>
					  <tr>
						<td align="left">
						  <a href="https://flyer.bconic.com">
							<img src="https://s3.amazonaws.com/flyer-cdn/logo/flyer-temp-logo.png" width="126">
						  </a>
						</td>
					  </tr>
					  <tr>
						<td class="content-message" style="font-family: 'Open Sans', 'Helvetica Neue', 'Helvetica', Calibri, Arial, sans-serif; color: #595959;">
						  <h1 style="font-family:'Open Sans', 'Helvetica Neue', 'Helvetica', Calibri, Arial, sans-serif;">
												Changing your <br>
												Money Xpress password
											</h1>
	
						  <p style="font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif; font-size:18px; line-height:26px;">Need to reset your password? No problem. Just click below to get started.</p>
						  <table width="325" border="0" cellspacing="0" cellpadding="0">
							<tr>
							  <td width="325" height="60" bgcolor="#31cccc" style="text-align:center;">
								<a href="{{resetLink}}"
								  align="center" style="display:block; font-family:'Open Sans', 'Helvetica Neue', 'Helvetica', Calibri, Arial, sans-serif; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Reset my password</a>
							  </td>
							  <td>&nbsp;</td>
							  <td>&nbsp;</td>
							</tr>
						  </table>
						  <p style="font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif; font-size:18px; line-height:26px;">If you didn't request to change your Money Xpress password, you don't have to do anything. So that's easy.</p>
						</td>
					  </tr>
					</table>
				  </div>
				  <p style="font-family: 'Open Sans', 'Helvetica Neue', 'Helvetica', Calibri, Arial, sans-serif; font-size:18px; line-height:26px;">
					<img border="0" src="https://gallery.mailchimp.com/d42c37cf5f5c0fac90b525c8e/images/4d4431c8-e778-47ac-a026-a869106b2903.gif" height="50" width="200">
				  </p>
				</td>
			  </tr>
			  <tr>
				<td bgcolor="#F7F7F7" style="max-width:600px; margin:0 auto; padding:20px 33px 20px 37px; display:block;">
				  <table cellspacing="0" cellpadding="10" width="100%">
					<tr>
					  <td colspan="3" height="18" style="font-size:1px; line-height:1px;">&nbsp;</td>
					</tr>
					<tr>
					  <td align="left" colspan="3">
						<table cellpadding="0" cellspacing="0" width="100%">
						  <tr>
							<td>
							  <table>
								<tr>
								  <td>
									<div style="float:left; margin:5px;">
									  <a href="https://www.facebook.com/moneyxpress" title="Like us on Facebook" target="new">
										<img src="https://gallery.mailchimp.com/d42c37cf5f5c0fac90b525c8e/images/3f540d56-178e-4d73-83e5-8ccaaf70f2cd.png" width="29" height="29" border="0" alt="Like us on Facebook">
									  </a>
									</div>
								  </td>
								  <td>
									<div style="float:left; margin:5px;">
									  <a href="https://twitter.com/moneyxpress" title="Flyer on Twitter" target="new">
										<img src="https://gallery.mailchimp.com/d42c37cf5f5c0fac90b525c8e/images/e78ba6bd-5b0f-4d69-8fcf-acc064cbf7ea.png" width="29" height="29" border="0" alt="Jet on Twitter">
									  </a>
									</div>
								  </td>
								  <td>
									<div style="float:left; margin:5px;">
									  <a href="https://www.instagram.com/moneyxpress/" title="Flyer on Instagram" target="new">
										<img src="https://gallery.mailchimp.com/d42c37cf5f5c0fac90b525c8e/images/9f72bdd3-5361-4f76-b683-6633a1c29145.png" width="29" height="29" border="0" alt="Jet on Instagram">
									  </a>
									</div>
								  </td>
								  <td>
								  </td>
								</tr>
							  </table>
							</td>
							<td align="right" style="text-align:right;">
							  <a href="mailto:help@money.xpress.com" style="text-decoration: none; font-size:10px; font-weight:bold; font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif;color: #414141;" title="help@flyer.bconic.com">help@money.xpress.com</a>                          <span style="text-decoration: none; font-size:9px; font-weight:bold; font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif;color: #414141;">|</span>
	
							  <a style="text-decoration: none; font-size:10px; font-weight:bold; font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif;color: #414141;" href="tel:18555384323">+94 776 012 345</a>
							</td>
						  </tr>
						</table>
					  </td>
					</tr>
					<tr>
					  <td colspan="3" height="18" style="font-size:1px; line-height:1px;">&nbsp;</td>
					</tr>
					<tr>
					  <td colspan="2" style="font-size:10px; font-weight:normal; font-family: 'OpenSans', helvetica, sans-serif; color: #414141; text-align:right;" align="right">48, Kahanthota Road, Malabe 010000 Sri Lanka &copy; 2020 Money XPress</td>
					</tr>
				  </table>
				</td>
			  </tr>
			  <tr>
				<td style="height:25px;">
				  <img width="600" src="https://gallery.mailchimp.com/d42c37cf5f5c0fac90b525c8e/images/4c1b3727-e048-4e80-815b-a9197acc62fe.png">
				</td>
			  </tr>
			  <tr>
				<td>
				  <table border="0" cellspacing="0" cellpadding="0">
					<tr>
					  <td colspan="3">&nbsp;</td>
					</tr>
					<tr>
					  <td colspan="3">&nbsp;</td>
					</tr>
					<tr>
					  <td colspan="3">&nbsp;</td>
					</tr>
				  </table>
				</td>
			  </tr>
			</table>
			<!-- /content -->
		  </td>
		  <td></td>
		</tr>
	  </table>
	  <!-- /body -->
	</body>
	
    </html>`

module.exports = {
	RESET_PW_ACTION,
	ADMIN_ROLE,
	CUSTOMER_ROLE,
	EMAIL_AUTH_USER_NAME,
	EMAIL_AUTH_USER_PASSWORD,
	EMAIL_PORT,
	EMAIL_SERVICE,
	MAIL_OPTIONS_FROM,
	EMAIL_PASS_RESET_HTML,
	EMAIL_PWD_RESET_SUBJECT,
	ADMIN_MIDDLEWARE,
	TOKEN_EXPIRATION_TIME,
	USER_MIDDLEWARE,
	ORDER_STATUSES
}
