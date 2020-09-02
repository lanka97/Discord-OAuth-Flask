

// EmailPwdResetText is the plaint text version of the password reset email
const EmailPwdResetText = (email, resetLink) => `Hi there,

	We recently received a request to reset the password for ${email}.
	
	Please confirm your request by clicking here.
	
	(If you can't click the link, you can copy and paste it directly into your browser: ${resetLink})
	
	If you did not request this change or think you are receiving this email by mistake, please contact us
	
	Thanks,
	
    The MoneyXpress team`;

module.exports = {
	EmailPwdResetText
}